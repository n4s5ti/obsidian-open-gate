import { App, PluginSettingTab, Setting, Platform } from 'obsidian'
import OpenGatePlugin from './main'
import { ModalEditGate } from './ModalEditGate'
import { createEmptyGateOption } from './fns/createEmptyGateOption'
import { GateFrameOption } from './GateOptions'

export class SettingTab extends PluginSettingTab {
    plugin: OpenGatePlugin
    shouldNotify: boolean

    constructor(app: App, plugin: OpenGatePlugin) {
        super(app, plugin)
        this.plugin = plugin
    }

    async updateGate(gate: GateFrameOption) {
        await this.plugin.addGate(gate)
        this.display()
    }

    display(): void {
        this.shouldNotify = false
        const { containerEl } = this
        containerEl.empty()

        if (Platform.isMobileApp) {
            containerEl.createEl('div', {
                text: 'On mobile, some websites may not work because Obsidian Mobile uses iframes instead of desktop webviews. Use Obsidian Desktop for the most compatible local app frames.',
                cls: 'open-gate-mobile-warning'
            })
        }

        containerEl.createEl('button', { text: 'New frame', cls: 'mod-cta' }).addEventListener('click', () => {
            new ModalEditGate(this.app, createEmptyGateOption(), this.updateGate.bind(this)).open()
        })

        containerEl.createEl('hr')

        const settingContainerEl = containerEl.createDiv('setting-container')

        for (const gateId in this.plugin.settings.gates) {
            const gate = this.plugin.settings.gates[gateId]
            const gateEl = settingContainerEl.createEl('div', {
                attr: {
                    'data-gate-id': gate.id,
                    class: 'open-gate--setting--gate'
                }
            })

            new Setting(gateEl)
                .setName(gate.title)
                .setDesc(gate.url)
                .addButton((button) => {
                    button.setButtonText('Delete').onClick(async () => {
                        await this.plugin.removeGate(gateId)
                        gateEl.remove()
                    })
                })
                .addButton((button) => {
                    button.setButtonText('Edit').onClick(() => {
                        new ModalEditGate(this.app, gate, this.updateGate.bind(this)).open()
                    })
                })
        }

        containerEl.createEl('h3', { text: 'Help' })

        containerEl.createEl('small', {
            attr: {
                style: 'display: block; margin-bottom: 5px'
            },
            text: 'When you delete or edit a frame, you need to reload Obsidian to see the changes.'
        })

        containerEl.createEl('small', {
            attr: {
                style: 'display: block; margin-bottom: 1em;'
            },
            text: `To reload Obsidian, you can use the menu "view -> Force reload" or "Reload App" in the command palette.`
        })

        new Setting(containerEl).setName('Attribution').setDesc('Local App Frames is a local fork of Obsidian Open Gate by duocnv and contributors.')
    }
}
