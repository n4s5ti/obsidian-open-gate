import { App, Modal } from 'obsidian'
import { createFormEditGate } from './fns/createFormEditGate'
import { GateFrameOption } from './GateOptions'

export class ModalOnBoarding extends Modal {
    gateOptions: GateFrameOption
    onSubmit: (result: GateFrameOption) => void
    constructor(app: App, gateOptions: GateFrameOption, onSubmit: (result: GateFrameOption) => void) {
        super(app)
        this.onSubmit = onSubmit
        this.gateOptions = gateOptions
    }

    onOpen() {
        const { contentEl } = this
        contentEl.createEl('h3', { text: 'Welcome to Local App Frames' })
        contentEl.createEl('p', {
            text: 'Local App Frames embeds local and trusted web apps in Obsidian panes.'
        })

        contentEl.createEl('p', {
            text: 'OpenDesign and SigNoz defaults are created automatically on fresh installs. You can add another frame here if needed.'
        })

        contentEl.createEl('p', {
            text: 'Custom JavaScript executes in the embedded page context. Use it only for trusted pages.'
        })

        createFormEditGate(contentEl, this.gateOptions, (result) => {
            this.onSubmit(result)
            this.close()
        })
    }

    onClose() {
        const { contentEl } = this
        contentEl.empty()
    }
}
