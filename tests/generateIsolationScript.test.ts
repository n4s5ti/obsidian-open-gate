import { describe, it, expect } from 'vitest'
import { generateIsolationScript } from '../src/fns/generateIsolationScript'

describe('generateIsolationScript', () => {
    it('returns empty string for undefined input', () => {
        expect(generateIsolationScript(undefined)).toBe('')
    })

    it('returns empty string for null input', () => {
        expect(generateIsolationScript(null)).toBe('')
    })

    it('returns empty string for empty input', () => {
        expect(generateIsolationScript('')).toBe('')
    })

    it('returns empty string for whitespace-only input', () => {
        expect(generateIsolationScript('   \n\t  ')).toBe('')
    })

    it('rejects selectors containing opening brace', () => {
        expect(generateIsolationScript('x { color: red;')).toBe('')
    })

    it('rejects selectors containing closing brace', () => {
        expect(generateIsolationScript('x} body {')).toBe('')
    })

    it('rejects selectors containing comment terminator', () => {
        expect(generateIsolationScript('x */ body {')).toBe('')
    })

    it('embeds the selector as a JSON-encoded constant', () => {
        const script = generateIsolationScript('.widget[data-x="a"]')
        expect(script).toContain('"\\.widget[data-x=\\"a\\"]"'.replace('\\.', '.'))
        expect(script).toContain('var SEL =')
    })

    it('includes runtime branches for both XPath and CSS selectors', () => {
        const script = generateIsolationScript('.widget')
        expect(script).toContain('document.evaluate')
        expect(script).toContain('document.querySelectorAll')
        expect(script).toContain('isXPath')
    })

    it('injects a stylesheet that gates hiding behind the marker class', () => {
        const script = generateIsolationScript('.widget')
        expect(script).toContain('__og-isolated')
        expect(script).toContain('html:has(.')
        expect(script).toContain(':not(.')
        expect(script).toContain('display:none !important')
    })

    it('installs a MutationObserver so SPA re-renders re-apply the marker', () => {
        const script = generateIsolationScript('.widget')
        expect(script).toContain('new MutationObserver')
        expect(script).toContain('__openGateIsolationObserver')
    })

    it('uses position: fixed at max z-index on the marker class, not the user selector', () => {
        const script = generateIsolationScript('.widget')
        expect(script).toContain('position:fixed !important')
        expect(script).toContain('z-index:2147483647 !important')
        // The rule is keyed on the marker class, not the raw user selector.
        expect(script).not.toMatch(/\.widget\s*\{\s*position:fixed/)
    })

    it('trims whitespace from the selector before encoding', () => {
        const script = generateIsolationScript('   .widget   ')
        expect(script).toContain('"\\.widget"'.replace('\\.', '.'))
        expect(script).not.toContain('"   ')
    })

    it('accepts XPath selectors without extra escaping', () => {
        const script = generateIsolationScript('//div[@id="main"]')
        expect(script).toContain('"//div[@id=\\"main\\"]"')
    })
})
