import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PAPERCLIP_GATE_URL,
  PAPERCLIP_GATE_ID,
  reconcilePaperclipGate,
  resolvePaperclipGateUrlFromConfig
} from '../src/fns/reconcilePaperclipGate'

describe('reconcilePaperclipGate', () => {
  it('updates known stale Paperclip gate URLs to the default local UI', () => {
    const gate = reconcilePaperclipGate({
      id: PAPERCLIP_GATE_ID,
      title: 'Paperclip',
      icon: 'paperclip',
      url: 'http://100.89.159.65:3105/'
    })

    expect(gate?.url).toBe(DEFAULT_PAPERCLIP_GATE_URL)
  })

  it('prefers the resolved Paperclip runtime URL when available', () => {
    const gate = reconcilePaperclipGate(
      {
        id: PAPERCLIP_GATE_ID,
        title: 'Paperclip',
        icon: 'paperclip',
        url: 'http://127.0.0.1:3109/'
      },
      'http://127.0.0.1:3113/'
    )

    expect(gate?.url).toBe('http://127.0.0.1:3113/')
  })

  it('leaves non-Paperclip gates unchanged', () => {
    const gate = {
      id: 'local-app-frames-signoz',
      title: 'SigNoz',
      icon: 'activity',
      url: 'http://127.0.0.1:18080/home'
    }

    expect(reconcilePaperclipGate(gate)).toBe(gate)
  })
})

describe('resolvePaperclipGateUrlFromConfig', () => {
  it('extracts the local UI URL from a Paperclip config file', () => {
    expect(
      resolvePaperclipGateUrlFromConfig(
        JSON.stringify({
          server: {
            host: '127.0.0.1',
            port: 3113,
            serveUi: true
          }
        })
      )
    ).toBe('http://127.0.0.1:3113/')
  })

  it('returns undefined when UI serving is disabled or config is invalid', () => {
    expect(
      resolvePaperclipGateUrlFromConfig(
        JSON.stringify({
          server: {
            host: '127.0.0.1',
            port: 3113,
            serveUi: false
          }
        })
      )
    ).toBeUndefined()
    expect(resolvePaperclipGateUrlFromConfig('not json')).toBeUndefined()
  })
})
