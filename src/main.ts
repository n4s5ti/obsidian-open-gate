import { Notice, ObsidianProtocolData, Plugin } from 'obsidian'
import { SettingTab } from './SetingTab'
import { registerGate } from './fns/registerGate'
import { ModalEditGate } from './ModalEditGate'
import { unloadView } from './fns/unloadView'
import { createEmptyGateOption } from './fns/createEmptyGateOption'
import { createDefaultLocalGates } from './fns/createDefaultLocalGates'
import { normalizeGateOption } from './fns/normalizeGateOption'
import { ModalListGates } from './ModalListGates'
import { registerCodeBlockProcessor } from './fns/registerCodeBlockProcessor'
import { isViewExist, openView } from './fns/openView'
import { GateView } from './GateView'
import {
    PAPERCLIP_CONFIG_PATHS,
    PAPERCLIP_GATE_ID,
    reconcilePaperclipGate,
    resolvePaperclipGateUrlFromConfig
} from './fns/reconcilePaperclipGate'
import { setupLinkConvertMenu } from './fns/setupLinkConvertMenu'
import { setupInsertLinkMenu } from './fns/setupInsertLinkMenu'
import { PluginSetting } from './types'
import { GateFrameOption, GateFrameOptionType } from './GateOptions'

const DEFAULT_SETTINGS: PluginSetting = {
    uuid: '',
    gates: {}
}

export default class OpenGatePlugin extends Plugin {
    settings: PluginSetting

    async onload() {
        await this.loadSettings()
        await this.mayShowOnboardingDialog()
        await this.initGates()
        this.addSettingTab(new SettingTab(this.app, this))
        this.registerCommands()
        this.registerProtocol()
        setupLinkConvertMenu(this)
        setupInsertLinkMenu(this)
        registerCodeBlockProcessor(this)
    }

    async mayShowOnboardingDialog() {
        // Check if the UUID in the settings is empty
        if (this.settings.uuid === '') {
            // Generate a new UUID and assign it to the settings
            this.settings.uuid = this.generateUuid()
            if (Object.keys(this.settings.gates).length === 0) {
                const paperclipUrl = await this.resolvePaperclipRuntimeUrl()
                for (const gate of createDefaultLocalGates(paperclipUrl)) {
                    this.settings.gates[gate.id] = gate
                }
            }

            await this.saveSettings()
        }
    }

    private async initGates() {
        // Iterate over all the gates in the settings
        for (const gateId in this.settings.gates) {
            // Get the gate with the current ID
            const gate = this.settings.gates[gateId]
            // Register the gate
            registerGate(this, gate)
        }

        // this view is used to open gates from the protocol handler
        registerGate(
            this,
            normalizeGateOption({
                id: 'temp-gate',
                title: 'Temp Gate',
                icon: 'globe',
                url: 'about:blank'
            })
        )
    }

    private registerCommands() {
        this.addCommand({
            id: `local-app-frames-create-new`,
            name: `Create new frame`,
            callback: async () => {
                new ModalEditGate(this.app, createEmptyGateOption(), async (gate: GateFrameOption) => {
                    await this.addGate(gate)
                }).open()
            }
        })

        this.addCommand({
            id: `local-app-frames-list-modal`,
            name: `List Local App Frames`,
            hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'g' }],
            callback: async () => {
                new ModalListGates(this.app, this.settings.gates, async (gate: GateFrameOption) => {
                    await this.addGate(gate)
                }).open()
            }
        })
    }

    /**
     * Register the "localappframes" action to Obsidian.
     *
     * We will attempt to open a frame based on the provided title and navigate to the provided URL
     */
    private registerProtocol() {
        this.registerObsidianProtocolHandler('localappframes', this.handleCustomProtocol.bind(this))
    }

    getGateOptionFromProtocolData(data: ObsidianProtocolData): GateFrameOption | undefined {
        const { title, url, id, position } = data

        // Initialize targetGate as undefined
        let targetGate: GateFrameOption | undefined

        // Search for the gate by id first
        if (id && this.settings.gates[id]) {
            targetGate = this.settings.gates[id]
        } else {
            // Search for the gate by title or url if id is not found
            targetGate = Object.values(this.settings.gates).find(
                (gate) => (title && gate.title.toLowerCase() === title.toLowerCase()) || (url && gate.url.toLowerCase() === url.toLowerCase())
            )
        }

        if (!targetGate) {
            targetGate = createEmptyGateOption()
        } else {
            targetGate = { ...targetGate }
        }

        if (url) {
            if (!this.isAllowedFrameUrl(url)) {
                new Notice('Only http, https, and about URLs can be opened in Local App Frames.')
                return undefined
            }

            targetGate.url = url
        }

        if (position) {
            targetGate.position = position as GateFrameOptionType
        }

        return targetGate
    }

    findGateBy(field: 'title' | 'url', value: string): GateFrameOption | undefined {
        return Object.values(this.settings.gates).find((gate) => gate[field].toLowerCase() === value.toLowerCase())
    }

    async handleCustomProtocol(data: ObsidianProtocolData) {
        const targetGate = this.getGateOptionFromProtocolData(data)
        if (targetGate === undefined) {
            if (!data.url) {
                new Notice('Missing url parameter')
            }
            return
        }

        const gate = await openView(this.app.workspace, targetGate.id || 'temp-gate', targetGate.position)
        const gateView = gate.view as GateView
        gateView?.onFrameReady(() => {
            gateView.setUrl(targetGate.url)
        })
    }

    private isAllowedFrameUrl(url: string): boolean {
        try {
            const parsedUrl = new URL(url)
            return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'about:'
        } catch (_error) {
            return false
        }
    }

    async addGate(gate: GateFrameOption) {
        const normalizedGate = normalizeGateOption(gate)

        if (!this.settings.gates.hasOwnProperty(normalizedGate.id)) {
            registerGate(this, normalizedGate)
        } else {
            new Notice('This change will take effect after you reload Obsidian.')
        }

        this.settings.gates[normalizedGate.id] = normalizedGate

        await this.saveSettings()
    }

    async removeGate(gateId: string) {
        if (!this.settings.gates[gateId]) {
            new Notice('Gate not found')
            return // Early exit if gate doesn't exist
        }

        const gate = this.settings.gates[gateId]

        await unloadView(this.app.workspace, gate)
        delete this.settings.gates[gateId]
        await this.saveSettings()
        new Notice('This change will take effect after you reload Obsidian.')
    }

    async loadSettings() {
        this.settings = await this.loadData()
        // merge default settings
        this.settings = {
            ...DEFAULT_SETTINGS,
            ...this.settings
        }

        if (!this.settings.gates) {
            this.settings.gates = {}
        }

        for (const gateId in this.settings.gates) {
            this.settings.gates[gateId] = normalizeGateOption(this.settings.gates[gateId])
        }

        const paperclipUrl = await this.resolvePaperclipRuntimeUrl()
        const paperclipGate = reconcilePaperclipGate(this.settings.gates[PAPERCLIP_GATE_ID], paperclipUrl)
        if (paperclipGate && paperclipGate.url !== this.settings.gates[PAPERCLIP_GATE_ID]?.url) {
            this.settings.gates[PAPERCLIP_GATE_ID] = paperclipGate
            await this.saveSettings()
        }
    }

    async saveSettings() {
        await this.saveData(this.settings)
    }

    private generateUuid() {
        // generate uuid
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    }

    private async resolvePaperclipRuntimeUrl(): Promise<string | undefined> {
        for (const configPath of PAPERCLIP_CONFIG_PATHS) {
            try {
                if (!(await this.app.vault.adapter.exists(configPath))) {
                    continue
                }

                const configText = await this.app.vault.adapter.read(configPath)
                const url = resolvePaperclipGateUrlFromConfig(configText)
                if (url) {
                    return url
                }
            } catch (error) {
                console.warn('[Local App Frames] failed reading Paperclip config', configPath, error)
            }
        }

        return undefined
    }
}
