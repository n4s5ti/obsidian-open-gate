import { GateFrameOption } from '../GateOptions'

export const createIframe = (params: Partial<GateFrameOption>, onReady?: () => void): HTMLIFrameElement => {
    const iframe = document.createElement('iframe')

    iframe.setAttribute('allowpopups', '')

    if (shouldUseCredentialless(params.url, iframe)) {
        iframe.setAttribute('credentialless', 'true')
    }

    iframe.setAttribute('src', params.url ?? 'about:blank')
    iframe.setAttribute('sandbox', 'allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation')
    iframe.setAttribute('allow', 'encrypted-media; fullscreen; oversized-images; picture-in-picture; sync-xhr; geolocation')
    iframe.addClass('open-gate-iframe')

    iframe.addEventListener('load', () => {
        onReady?.call(null)

        if (params?.css) {
            const style = document.createElement('style')
            style.textContent = params.css
            iframe.contentDocument?.head.appendChild(style)
        }

        if (params?.js) {
            const script = document.createElement('script')
            script.textContent = params.js
            iframe.contentDocument?.head.appendChild(script)
        }
    })

    return iframe
}

const TRUSTED_LOCAL_HOST_SUFFIXES = ['.localhost', '.local', '.home.arpa', '.internal', '.lan', '.localdomain', '.ts.net']

export const shouldUseCredentialless = (url: string | undefined, iframe?: HTMLIFrameElement): boolean => {
    if (!iframe || !('credentialless' in iframe) || !url) {
        return false
    }

    try {
        const { hostname } = new URL(url)
        if (isTrustedLocalHost(hostname)) {
            return false
        }
    } catch (_error) {
        return false
    }

    return true
}

const isTrustedLocalHost = (hostname: string): boolean => {
    const normalizedHostname = hostname.toLowerCase()
    if (
        normalizedHostname === 'localhost' ||
        normalizedHostname === '::1' ||
        normalizedHostname === '[::1]' ||
        TRUSTED_LOCAL_HOST_SUFFIXES.some((suffix) => normalizedHostname.endsWith(suffix))
    ) {
        return true
    }

    return isPrivateIpv4Host(normalizedHostname) || isPrivateIpv6Host(normalizedHostname)
}

const isPrivateIpv4Host = (hostname: string): boolean => {
    const octets = hostname.split('.')
    if (octets.length !== 4) {
        return false
    }

    const values: number[] = []
    for (const octet of octets) {
        if (!/^\d+$/.test(octet)) {
            return false
        }

        const value = Number(octet)
        if (!Number.isInteger(value) || value < 0 || value > 255) {
            return false
        }

        values.push(value)
    }

    const [first, second] = values
    return (
        first === 10 ||
        first === 127 ||
        (first === 100 && second >= 64 && second <= 127) ||
        (first === 169 && second === 254) ||
        (first === 172 && second >= 16 && second <= 31) ||
        (first === 192 && second === 168)
    )
}

const isPrivateIpv6Host = (hostname: string): boolean => {
    const normalizedHostname = hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname
    if (!normalizedHostname.includes(':')) {
        return false
    }

    if (normalizedHostname === '::1') {
        return true
    }

    return (
        normalizedHostname.startsWith('fc') ||
        normalizedHostname.startsWith('fd') ||
        normalizedHostname.startsWith('fe8') ||
        normalizedHostname.startsWith('fe9') ||
        normalizedHostname.startsWith('fea') ||
        normalizedHostname.startsWith('feb')
    )
}
