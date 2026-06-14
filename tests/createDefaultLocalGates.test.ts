import { describe, expect, it } from 'vitest'
import { createDefaultLocalGates } from '../src/fns/createDefaultLocalGates'

describe('createDefaultLocalGates', () => {
  it('seeds editable local app frames with isolated profiles', () => {
    const gates = createDefaultLocalGates()

    expect(gates).toHaveLength(7)
    expect(gates.map((gate) => gate.title)).toEqual(['OpenDesign', 'SigNoz', 'LiveKit Console', 'Stage Review', 'Autoflow', 'Dify', 'Paperclip'])
    expect(gates.map((gate) => gate.url)).toEqual([
      'http://127.0.0.1:7456/',
      'http://127.0.0.1:18080/home',
      'http://n4s5ti.cyprus-ling.ts.net:3001/',
      'http://127.0.0.1:5391/',
      'http://127.0.0.1:3013/',
      'http://localhost:8088/signin',
      'http://127.0.0.1:3109/'
    ])
    expect(new Set(gates.map((gate) => gate.id)).size).toBe(gates.length)
    expect(new Set(gates.map((gate) => gate.profileKey)).size).toBe(gates.length)
    expect(gates.every((gate) => gate.hasRibbon && gate.userAgent && gate.zoomFactor === 1)).toBe(true)
  })

  it('allows the Paperclip default gate to follow the resolved runtime URL', () => {
    const paperclipGate = createDefaultLocalGates('http://127.0.0.1:3113/').find((gate) => gate.title === 'Paperclip')

    expect(paperclipGate?.url).toBe('http://127.0.0.1:3113/')
  })
})
