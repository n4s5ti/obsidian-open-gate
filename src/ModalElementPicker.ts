import { App, Modal } from 'obsidian'
import WebviewTag = Electron.WebviewTag
import { GateFrameOption } from './GateOptions'
import { createWebviewTag } from './fns/createWebviewTag'
import { createPickerScript } from './fns/createPickerScript'

const PICKED_MARKER = '__OG_PICKED__'

export class ModalElementPicker extends Modal {
    private readonly gateOptions: GateFrameOption
    private readonly onPick: (selector: string) => void
    private webview: WebviewTag | null = null
    private selectorDisplay: HTMLElement | null = null
    private okButton: HTMLButtonElement | null = null
    private currentSelector = ''

    constructor(app: App, gateOptions: GateFrameOption, onPick: (selector: string) => void) {
        super(app)
        this.gateOptions = gateOptions
        this.onPick = onPick
    }

    onOpen(): void {
        const { contentEl, modalEl } = this
        modalEl.addClass('open-gate-picker-modal')
        contentEl.empty()
        contentEl.addClass('open-gate-picker-content')

        const toolbar = contentEl.createDiv({ cls: 'open-gate-picker-toolbar' })

        this.selectorDisplay = toolbar.createDiv({ cls: 'open-gate-picker-selector' })
        this.selectorDisplay.setText('Hover and click an element on the page to pick it.')

        const buttons = toolbar.createDiv({ cls: 'open-gate-picker-buttons' })

        const tryAgainBtn = buttons.createEl('button', { text: 'Try Again' })
        tryAgainBtn.onclick = () => this.resetPicker()

        const cancelBtn = buttons.createEl('button', { text: 'Cancel' })
        cancelBtn.onclick = () => this.close()

        this.okButton = buttons.createEl('button', { text: 'OK', cls: 'mod-cta' })
        this.okButton.disabled = true
        this.okButton.onclick = () => {
            if (!this.currentSelector) return
            this.onPick(this.currentSelector)
            this.close()
        }

        const webviewContainer = contentEl.createDiv({ cls: 'open-gate-picker-webview-container' })

        // Load the page raw: strip isolation CSS + user's custom css/js so they
        // can't hide or mutate elements the picker is trying to identify.
        const pickingOptions: Partial<GateFrameOption> = {
            ...this.gateOptions,
            cssSelector: undefined,
            css: undefined,
            js: undefined
        }

        this.webview = createWebviewTag(pickingOptions, undefined, contentEl.doc)
        this.webview.addClass('open-gate-picker-webview')
        webviewContainer.appendChild(this.webview as unknown as HTMLElement)

        this.webview.addEventListener('dom-ready', async () => {
            try {
                await this.webview!.executeJavaScript(createPickerScript())
            } catch (_) {
                // Ignore — webview may be destroyed mid-navigation.
            }
        })

        this.webview.addEventListener('console-message', (event: Electron.ConsoleMessageEvent) => {
            const msg = event.message
            if (typeof msg !== 'string' || !msg.startsWith(PICKED_MARKER)) return
            const selector = msg.substring(PICKED_MARKER.length).trim()
            if (!selector) return
            this.currentSelector = selector
            if (this.selectorDisplay) {
                this.selectorDisplay.empty()
                this.selectorDisplay.createSpan({ text: 'Selected: ' })
                this.selectorDisplay.createEl('code', { text: selector })
            }
            if (this.okButton) this.okButton.disabled = false
        })
    }

    private resetPicker(): void {
        this.currentSelector = ''
        if (this.selectorDisplay) {
            this.selectorDisplay.empty()
            this.selectorDisplay.setText('Hover and click an element on the page to pick it.')
        }
        if (this.okButton) this.okButton.disabled = true
        if (!this.webview) return
        this.webview
            .executeJavaScript('window.__openGatePickerReset && window.__openGatePickerReset()')
            .catch(() => {})
    }

    onClose(): void {
        if (this.webview) {
            this.webview
                .executeJavaScript('window.__openGatePickerDestroy && window.__openGatePickerDestroy()')
                .catch(() => {})
            this.webview.remove()
            this.webview = null
        }
        this.contentEl.empty()
    }
}
