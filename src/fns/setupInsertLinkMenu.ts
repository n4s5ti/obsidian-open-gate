import { App, Editor, Menu, Plugin } from 'obsidian'
import { ModalInsertLink } from '../ModalInsertLink'
import { GateFrameOption } from '../GateOptions'

export const setupInsertLinkMenu = (plugin: Plugin) => {
    plugin.registerEvent(plugin.app.workspace.on('editor-menu', (menu, editor) => createMenu(plugin.app, menu, editor)))
}

const createMenu = (app: App, menu: Menu, editor: Editor) => {
    menu.addItem((item) => {
        item.setTitle('Insert Local App Frame Link').onClick(async () => {
            const modal = new ModalInsertLink(app, async (gate: GateFrameOption) => {
                const gateLink = `[${gate.title}](obsidian://localappframes?title=${encodeURIComponent(gate.title)}&url=${encodeURIComponent(gate.url)})`
                editor.replaceSelection(gateLink)
                modal.close()
            })
            modal.open()
        })
    })
}

