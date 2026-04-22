import { GateFrameOption } from '../GateOptions'
import { generateIsolationScript } from './generateIsolationScript'

export const createIframe = (params: Partial<GateFrameOption>, onReady?: () => void): HTMLIFrameElement => {
    const iframe = document.createElement('iframe')

    iframe.setAttribute('allowpopups', '')

    // Only set credentialless if supported (experimental feature, not on older Android WebView)
    if ('credentialless' in iframe) {
        iframe.setAttribute('credentialless', 'true')
    }

    iframe.setAttribute('src', params.url ?? 'about:blank')
    iframe.setAttribute('sandbox', 'allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation')
    iframe.setAttribute('allow', 'encrypted-media; fullscreen; oversized-images; picture-in-picture; sync-xhr; geolocation')
    iframe.addClass('open-gate-iframe')

    iframe.addEventListener('load', () => {
        onReady?.call(null)

        const doc = iframe.contentDocument
        if (!doc) return

        if (params?.css) {
            const style = doc.createElement('style')
            style.textContent = params.css
            doc.head.appendChild(style)
        }

        const isolationScript = generateIsolationScript(params.cssSelector)
        if (isolationScript) {
            const script = doc.createElement('script')
            script.textContent = isolationScript
            doc.head.appendChild(script)
        }

        if (params?.js) {
            const script = doc.createElement('script')
            script.textContent = params.js
            doc.head.appendChild(script)
        }
    })

    return iframe
}
