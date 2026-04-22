import WebviewTag = Electron.WebviewTag
import { GateFrameOption } from '../GateOptions'
import getDefaultUserAgent from './getDefaultUserAgent'
import { generateIsolationScript } from './generateIsolationScript'

// Constants for repeated strings
const DEFAULT_URL = 'about:blank'
const GOOGLE_URL = 'https://google.com'
const OPEN_GATE_WEBVIEW_CLASS = 'open-gate-webview'

export const createWebviewTag = (params: Partial<GateFrameOption>, onReady?: () => void, parentDoc?: Document): WebviewTag => {
    // Create a new webview tag using the parent document context
    const webviewTag = (parentDoc || document).createElement('webview') as unknown as WebviewTag

    // Set attributes for the webview tag
    webviewTag.setAttribute('partition', 'persist:' + params.profileKey)
    webviewTag.setAttribute('src', params.url ?? DEFAULT_URL)
    webviewTag.setAttribute('httpreferrer', params.url ?? GOOGLE_URL)
    webviewTag.setAttribute('allowpopups', 'true')
    webviewTag.addClass(OPEN_GATE_WEBVIEW_CLASS)

    // Set user agent (use default Chrome UA if not provided to avoid bot detection)
    webviewTag.setAttribute('useragent', params.userAgent || getDefaultUserAgent())

    webviewTag.addEventListener('dom-ready', async () => {
        // Set zoom factor if provided
        if (params.zoomFactor) {
            webviewTag.setZoomFactor(params.zoomFactor)
        }

        // Apply user's custom CSS first so the isolation script can override it.
        if (params?.css) {
            await webviewTag.insertCSS(params.css)
        }

        // Isolation runs last: it marks the target element and the injected
        // stylesheet hides everything else. The script also installs a
        // MutationObserver so SPA re-renders re-apply the marker.
        const isolationScript = generateIsolationScript(params.cssSelector)
        if (isolationScript) {
            await webviewTag.executeJavaScript(isolationScript)
        }

        if (params?.js) {
            await webviewTag.executeJavaScript(params.js)
        }

        onReady?.call(null)
    })

    return webviewTag
}
