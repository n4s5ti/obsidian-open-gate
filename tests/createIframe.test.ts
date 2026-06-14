import { describe, expect, it } from 'vitest'
import { shouldUseCredentialless } from '../src/fns/createIframe'

describe('shouldUseCredentialless', () => {
  it('disables credentialless mode for local and tailnet apps that need cookies', () => {
    const iframe = { credentialless: false } as HTMLIFrameElement

    expect(shouldUseCredentialless('http://127.0.0.1:3011/', iframe)).toBe(false)
    expect(shouldUseCredentialless('http://localhost:3013/', iframe)).toBe(false)
    expect(shouldUseCredentialless('http://[::1]:8080/', iframe)).toBe(false)
    expect(shouldUseCredentialless('http://100.89.159.65:3105/', iframe)).toBe(false)
    expect(shouldUseCredentialless('http://192.168.1.50:3000/', iframe)).toBe(false)
    expect(shouldUseCredentialless('https://n4s5ti.cyprus-ling.ts.net:8443/', iframe)).toBe(false)
  })

  it('keeps credentialless mode for non-loopback origins when supported', () => {
    const iframe = { credentialless: false } as HTMLIFrameElement

    expect(shouldUseCredentialless('https://example.com/', iframe)).toBe(true)
  })
})
