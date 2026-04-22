/**
 * Returns a self-executing JS string that isolates elements matched by
 * `selector` inside the target document. The selector may be XPath (detected
 * by a leading `/`, `./`, or `(` character) or a CSS selector.
 *
 * Approach:
 *   1. Resolve the selector to a NodeList.
 *   2. Tag matched elements with a marker class.
 *   3. Inject a stylesheet that hides every body descendant that is neither
 *      an ancestor of, the marked element, nor a descendant of it.
 *   4. Set up a debounced MutationObserver so SPA re-renders re-apply the
 *      marker. Without this, isolation breaks on client-side navigation.
 *
 * Returns '' for empty/blank input. Rejects selectors containing CSS rule
 * delimiters (braces or comment terminators) to prevent rule-block escape
 * when the selector ends up concatenated into a stylesheet by a misbehaving
 * caller.
 */
export const generateIsolationScript = (selector: string | undefined | null): string => {
    if (!selector) return ''
    const trimmed = selector.trim()
    if (trimmed === '') return ''
    if (/[{}]|\*\//.test(trimmed)) return ''

    const encoded = JSON.stringify(trimmed)

    return `
(function () {
    var SEL = ${encoded};
    var MARKER = '__og-isolated';
    var STYLE_ID = '__og-isolation-style';

    function isXPath(s) {
        var c = s.charAt(0);
        return c === '/' || c === '(' || (c === '.' && s.charAt(1) === '/');
    }

    function resolveMatches() {
        if (isXPath(SEL)) {
            try {
                var r = document.evaluate(SEL, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                var out = [];
                for (var i = 0; i < r.snapshotLength; i++) {
                    var n = r.snapshotItem(i);
                    if (n && n.nodeType === 1) out.push(n);
                }
                return out;
            } catch (e) {
                console.error('[OpenGate] Invalid XPath selector:', SEL, e);
                return [];
            }
        }
        try {
            return Array.prototype.slice.call(document.querySelectorAll(SEL));
        } catch (e) {
            console.error('[OpenGate] Invalid CSS selector:', SEL, e);
            return [];
        }
    }

    function applyMarker() {
        var prev = document.querySelectorAll('.' + MARKER);
        for (var i = 0; i < prev.length; i++) prev[i].classList.remove(MARKER);
        var matches = resolveMatches();
        if (matches.length === 0) {
            console.warn('[OpenGate] Element selector matched nothing:', SEL);
            return;
        }
        for (var j = 0; j < matches.length; j++) matches[j].classList.add(MARKER);
        console.log('[OpenGate] Element selector matched', matches.length, 'element(s):', SEL);
    }

    function ensureStyle() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent =
            'html:has(.' + MARKER + ') body *:not(:has(.' + MARKER + ')):not(.' + MARKER + '):not(.' + MARKER + ' *){display:none !important;}' +
            '.' + MARKER + '{position:fixed !important;top:0 !important;left:0 !important;width:100vw !important;height:100vh !important;margin:0 !important;padding:0 !important;z-index:2147483647 !important;overflow:auto !important;isolation:isolate !important;}';
        (document.head || document.documentElement).appendChild(style);
    }

    // Tear down any prior run (live re-apply on selector change).
    if (window.__openGateIsolationObserver) {
        try { window.__openGateIsolationObserver.disconnect(); } catch (_) {}
    }

    ensureStyle();
    applyMarker();

    var pending = null;
    var observer = new MutationObserver(function () {
        if (pending !== null) return;
        pending = setTimeout(function () {
            pending = null;
            applyMarker();
        }, 150);
    });
    observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'id', 'data-testid', 'data-test', 'data-qa', 'data-id', 'name', 'role']
    });
    window.__openGateIsolationObserver = observer;
})();
`.trim()
}
