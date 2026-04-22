/**
 * Returns a self-executing JS string to inject into a webview. Once injected
 * the page enters pick mode: hover outlines elements, click freezes selection
 * and emits an XPath expression identifying the chosen element to the host
 * via `console.log` (marker prefix `__OG_PICKED__`). Host listens on the
 * webview's `console-message` event.
 *
 * XPath is preferred over CSS because modern SPAs churn class names and
 * generated ids between deploys; a structural XPath path (with attribute
 * anchors when available) is more stable.
 *
 * Exposes two globals for host control:
 *   window.__openGatePickerReset()    — clear selection, re-enter pick mode
 *   window.__openGatePickerDestroy()  — remove all listeners and styles
 */
export const createPickerScript = (): string => `
(function () {
    if (window.__openGatePickerActive) return;
    window.__openGatePickerActive = true;

    var HOVER_CLASS = '__og-hover';
    var PICKED_CLASS = '__og-picked';
    var STYLE_ID = '__openGatePickerStyle';
    var MARKER = '__OG_PICKED__';
    var STABLE_ATTRS = ['data-testid', 'data-test', 'data-qa', 'data-id', 'name', 'role', 'aria-label'];

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
        '.' + HOVER_CLASS + ' { outline: 2px solid #3b82f6 !important; outline-offset: -2px !important; background: rgba(59,130,246,0.12) !important; cursor: crosshair !important; }' +
        '.' + PICKED_CLASS + ' { outline: 3px solid #10b981 !important; outline-offset: -3px !important; background: rgba(16,185,129,0.18) !important; }' +
        'html.__og-picking, html.__og-picking * { cursor: crosshair !important; }';
    document.head.appendChild(style);
    document.documentElement.classList.add('__og-picking');

    var hovered = null;
    var picked = null;
    var frozen = false;

    function escXPathString(s) {
        if (s.indexOf('"') === -1) return '"' + s + '"';
        if (s.indexOf("'") === -1) return "'" + s + "'";
        return 'concat("' + s.split('"').join('",\\'"\\',"') + '")';
    }

    function xpathUniqueCount(expr) {
        try {
            var r = document.evaluate(expr, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            return r.snapshotLength;
        } catch (e) { return -1; }
    }

    function generateXPath(el) {
        if (!el || el.nodeType !== 1) return '';

        // Prefer a unique id when it looks stable (not purely numeric, not hash-like).
        if (el.id && typeof el.id === 'string' && /^[a-zA-Z][\\w\\-]*$/.test(el.id) && el.id.length < 64) {
            var byId = '//*[@id=' + escXPathString(el.id) + ']';
            if (xpathUniqueCount(byId) === 1) return byId;
        }

        // Prefer a stable attribute when unique.
        for (var i = 0; i < STABLE_ATTRS.length; i++) {
            var attr = STABLE_ATTRS[i];
            var v = el.getAttribute(attr);
            if (!v) continue;
            var q = '//' + el.tagName.toLowerCase() + '[@' + attr + '=' + escXPathString(v) + ']';
            if (xpathUniqueCount(q) === 1) return q;
        }

        // Walk up building absolute structural path.
        var segments = [];
        var cur = el;
        while (cur && cur.nodeType === 1) {
            var name = cur.tagName.toLowerCase();
            var parent = cur.parentElement;
            if (!parent) {
                segments.unshift(name);
                break;
            }
            var sameTag = [];
            for (var k = 0; k < parent.children.length; k++) {
                if (parent.children[k].tagName === cur.tagName) sameTag.push(parent.children[k]);
            }
            if (sameTag.length > 1) {
                segments.unshift(name + '[' + (sameTag.indexOf(cur) + 1) + ']');
            } else {
                segments.unshift(name);
            }
            cur = parent;
        }
        return '/' + segments.join('/');
    }

    function onMove(e) {
        if (frozen) return;
        var el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || el === hovered) return;
        if (hovered) hovered.classList.remove(HOVER_CLASS);
        hovered = el;
        el.classList.add(HOVER_CLASS);
    }

    function onClick(e) {
        e.preventDefault();
        e.stopPropagation();
        if (frozen) return;
        var target = e.target;
        if (hovered) hovered.classList.remove(HOVER_CLASS);
        if (picked) picked.classList.remove(PICKED_CLASS);
        picked = target;
        target.classList.add(PICKED_CLASS);
        frozen = true;
        document.documentElement.classList.remove('__og-picking');
        try { console.log(MARKER + generateXPath(target)); } catch (err) {}
    }

    function swallow(e) {
        if (frozen) return;
        e.preventDefault();
        e.stopPropagation();
    }

    window.__openGatePickerReset = function () {
        if (picked) picked.classList.remove(PICKED_CLASS);
        if (hovered) hovered.classList.remove(HOVER_CLASS);
        picked = null;
        hovered = null;
        frozen = false;
        document.documentElement.classList.add('__og-picking');
    };

    window.__openGatePickerDestroy = function () {
        document.removeEventListener('mousemove', onMove, true);
        document.removeEventListener('click', onClick, true);
        document.removeEventListener('mousedown', swallow, true);
        document.removeEventListener('mouseup', swallow, true);
        if (picked) picked.classList.remove(PICKED_CLASS);
        if (hovered) hovered.classList.remove(HOVER_CLASS);
        var s = document.getElementById(STYLE_ID);
        if (s) s.remove();
        document.documentElement.classList.remove('__og-picking');
        window.__openGatePickerActive = false;
    };

    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('mousedown', swallow, true);
    document.addEventListener('mouseup', swallow, true);
})();
`.trim()
