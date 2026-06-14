import { GateFrameOption } from '../GateOptions'
import { normalizeGateOption } from './normalizeGateOption'

export const PAPERCLIP_GATE_ID = 'local-app-frames-paperclip'
export const DEFAULT_PAPERCLIP_GATE_URL = 'http://127.0.0.1:3109/'
export const PAPERCLIP_CONFIG_PATHS = ['wiki/paperclip/.paperclip/config.json', '.paperclip/config.json']

const LEGACY_PAPERCLIP_GATE_URLS = new Set([
    'http://100.89.159.65:3105/',
    'https://n4s5ti.cyprus-ling.ts.net:8443/'
])

export const reconcilePaperclipGate = (
    gate: GateFrameOption | undefined,
    resolvedUrl?: string
): GateFrameOption | undefined => {
    if (!gate || gate.id !== PAPERCLIP_GATE_ID) {
        return gate
    }

    if (!resolvedUrl && !LEGACY_PAPERCLIP_GATE_URLS.has(gate.url)) {
        return gate
    }

    const nextUrl = resolvedUrl ?? DEFAULT_PAPERCLIP_GATE_URL
    if (gate.url === nextUrl) {
        return gate
    }

    return normalizeGateOption({
        ...gate,
        url: nextUrl
    })
}

export const resolvePaperclipGateUrlFromConfig = (configText: string): string | undefined => {
    try {
        const config = JSON.parse(configText)
        const server = config?.server
        if (server?.serveUi === false) {
            return undefined
        }

        const port = server?.port
        if (typeof port !== 'number' || !Number.isInteger(port) || port < 1 || port > 65535) {
            return undefined
        }

        const host = typeof server?.host === 'string' && server.host.trim() !== '' ? server.host.trim() : '127.0.0.1'
        return `http://${host}:${port}/`
    } catch (_error) {
        return undefined
    }
}
