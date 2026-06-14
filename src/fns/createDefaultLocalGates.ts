import getDefaultUserAgent from './getDefaultUserAgent'
import { normalizeGateOption } from './normalizeGateOption'
import { GateFrameOption } from '../GateOptions'
import { DEFAULT_PAPERCLIP_GATE_URL, PAPERCLIP_GATE_ID } from './reconcilePaperclipGate'

export const createDefaultLocalGates = (paperclipUrl = DEFAULT_PAPERCLIP_GATE_URL): GateFrameOption[] => [
    normalizeGateOption({
        id: 'local-app-frames-opendesign',
        title: 'OpenDesign',
        icon: 'layout-template',
        hasRibbon: true,
        position: 'right',
        profileKey: 'local-app-frames-opendesign',
        url: 'http://127.0.0.1:7456/',
        zoomFactor: 1.0,
        userAgent: getDefaultUserAgent()
    }),
    normalizeGateOption({
        id: 'local-app-frames-signoz',
        title: 'SigNoz',
        icon: 'activity',
        hasRibbon: true,
        position: 'center',
        profileKey: 'local-app-frames-signoz',
        url: 'http://127.0.0.1:18080/home',
        zoomFactor: 1.0,
        userAgent: getDefaultUserAgent()
    }),
    normalizeGateOption({
        id: 'local-app-frames-livekit-console',
        title: 'LiveKit Console',
        icon: 'radio-tower',
        hasRibbon: true,
        position: 'center',
        profileKey: 'local-app-frames-livekit-console',
        url: 'http://n4s5ti.cyprus-ling.ts.net:3001/',
        zoomFactor: 1.0,
        userAgent: getDefaultUserAgent()
    }),
    normalizeGateOption({
        id: 'local-app-frames-stage-review',
        title: 'Stage Review',
        icon: 'git-pull-request-arrow',
        hasRibbon: true,
        position: 'center',
        profileKey: 'local-app-frames-stage-review',
        url: 'http://127.0.0.1:5391/',
        zoomFactor: 1.0,
        userAgent: getDefaultUserAgent()
    }),
    normalizeGateOption({
        id: 'local-app-frames-autoflow',
        title: 'Autoflow',
        icon: 'workflow',
        hasRibbon: true,
        position: 'center',
        profileKey: 'local-app-frames-autoflow',
        url: 'http://127.0.0.1:3013/',
        zoomFactor: 1.0,
        userAgent: getDefaultUserAgent()
    }),
    normalizeGateOption({
        id: 'local-app-frames-dify',
        title: 'Dify',
        icon: 'bot',
        hasRibbon: true,
        position: 'center',
        profileKey: 'local-app-frames-dify',
        url: 'http://localhost:8088/signin',
        zoomFactor: 1.0,
        userAgent: getDefaultUserAgent()
    }),
    normalizeGateOption({
        id: PAPERCLIP_GATE_ID,
        title: 'Paperclip',
        icon: 'paperclip',
        hasRibbon: true,
        position: 'center',
        profileKey: 'local-app-frames-paperclip',
        url: paperclipUrl,
        zoomFactor: 1.0,
        userAgent: getDefaultUserAgent()
    })
]
