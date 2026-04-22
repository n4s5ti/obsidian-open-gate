# Implementation Plan: CSS Selector Element Isolation

**Created:** 2025-12-17
**Last Updated:** 2026-04-22
**Status:** IN_PROGRESS (v2)
**Owner:** Developer
**Branch:** 1-css-selector-isolation

## v2 Revision Log (2026-04-22)

Scope expanded after user feedback — the selector-typing barrier is the real
blocker, not the underlying mechanism. Visual picker is back in scope.

Changes vs v1:

1. **Visual element picker (desktop only)** — new `ModalElementPicker` opens
   from a "Pick element" button in the edit form. Uses the gate's real
   `profileKey`/`userAgent` so authenticated pages work. Picker mode auto-starts
   on `dom-ready`: hover outlines, click freezes selection, Try Again / OK /
   Cancel in toolbar. Communication host ↔ webview via `console-message` events
   with the `__OG_PICKED__` marker (no preload script required).

2. **Isolation CSS rewritten** — replaced v1's dark overlay with
   `body > *:not(:has(sel)):not(sel) { display: none }` + target fills
   viewport. Benefits: no hardcoded color, dynamic sibling subtrees stop
   rendering (lower CPU), no visual artefacts from `background: inherit`.
   Guard: selectors containing `{`, `}`, or `*/` are rejected to prevent
   rule-block escape.

3. **Mobile** — iframe view still applies isolation CSS when same-origin
   permits; pick button is hidden (`Platform.isMobileApp`). Cross-origin iframes
   silently no-op (documented limitation).

## Files Touched (v2)

- Modify: `src/fns/generateIsolationCSS.ts` — new `:has()` approach + guard
- Create: `src/fns/createPickerScript.ts` — pure function returning picker IIFE
- Create: `src/ModalElementPicker.ts` — Modal with toolbar + webview
- Modify: `src/fns/createFormEditGate.ts` — "Pick element" button, desktop only
- Modify: `src/ModalEditGate.ts`, `src/ModalOnboarding.ts` — pass launcher
- Modify: `styles.css` — picker modal layout
- Create: `tests/generateIsolationCSS.test.ts` — 11 cases (empty / guard / output shape)

## Constitution Compliance Check

- [x] **Iteration-First**: Single field addition, CSS generation is isolated - easy to change
- [x] **KISS**: Text field + auto-generated CSS - simplest possible approach
- [x] **YAGNI**: No visual picker, no preview, no auto-complete - only what's needed
- [x] **DRY**: Reuses existing CSS injection mechanism, no duplication
- [x] **First-Principles**: Solving the real problem (users can't write CSS) with minimal intervention
- [x] **Separation of Concerns**: CSS generation is pure function, separate from UI and webview
- [x] **Greenfield**: No backward compatibility concerns - new optional field
- [x] **No Workarounds**: Using Obsidian Setting API properly, webview CSS injection as designed

## Problem Statement

Users want to display only specific elements from embedded web pages (e.g., a dashboard widget, counter, specific section). The capability exists via CSS injection, but users don't know how to write the CSS to hide unwanted elements and position the target element.

**Root cause:** CSS knowledge barrier, not missing functionality.

**Solution principle:** Generate the CSS for them from a simple selector input.

## Proposed Solution

Add an optional `cssSelector` field to gate configuration. When provided, the plugin generates CSS that:
1. Hides all elements except those matching the selector
2. Positions the selected element to fill the available container

This CSS is prepended to any user-provided custom CSS, allowing both to coexist.

### Architecture Impact

Minimal impact - extends existing pattern:
- `GateOptions.d.ts` - Add one optional field
- `createFormEditGate.ts` - Add one input field in Advanced section
- `createWebviewTag.ts` - Generate isolation CSS before inserting
- `createIframe.ts` - Same CSS generation for mobile

New pure function:
- `generateIsolationCSS.ts` - Pure function to generate CSS from selector

### Obsidian API Integration

Uses existing patterns:
- `Setting` component for the input field (already used throughout)
- No new Obsidian APIs required

## Alternative Approaches Considered

1. **Visual Element Picker**
   - **Rejected because**: High complexity, requires injecting UI into webview, handling click events, generating selectors from DOM - violates KISS and YAGNI

2. **CSS Snippets Library in UI**
   - **Rejected because**: Still requires user to understand CSS, just moves the problem

3. **JavaScript-based element isolation**
   - **Rejected because**: More invasive, could break page functionality, harder to debug

## Implementation Steps

### Step 1: Add `cssSelector` field to type definition
Modify `src/GateOptions.d.ts` to add optional `cssSelector?: string` field.

### Step 2: Create CSS generation function
Create `src/fns/generateIsolationCSS.ts` - pure function that takes a selector string and returns CSS.

### Step 3: Add input field to gate edit form
Modify `src/fns/createFormEditGate.ts` to add new Setting in Advanced Options section.

### Step 4: Apply generated CSS in webview
Modify `src/fns/createWebviewTag.ts` to call `generateIsolationCSS()` and prepend to user CSS.

### Step 5: Apply generated CSS in iframe (mobile)
Modify `src/fns/createIframe.ts` with same logic for mobile support.

## Files to Modify/Create

- **Modify**: `src/GateOptions.d.ts` - Add `cssSelector` field
- **Modify**: `src/fns/createFormEditGate.ts` - Add input field
- **Modify**: `src/fns/createWebviewTag.ts` - Apply isolation CSS
- **Modify**: `src/fns/createIframe.ts` - Apply isolation CSS
- **Create**: `src/fns/generateIsolationCSS.ts` - CSS generation logic (justified: pure function, single responsibility, reused by both webview and iframe)

## Dependencies

None - uses existing capabilities.

## CSS Generation Strategy

The `generateIsolationCSS(selector: string)` function will produce:

```css
/* Hide all elements except target and its ancestors/descendants */
body > *:not(:has({selector})):not({selector}) {
  display: none !important;
}

/* Position target element to fill container */
{selector} {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  z-index: 9999 !important;
}
```

**Note**: The `:has()` pseudo-class is well-supported in modern browsers (Chrome 105+, Safari 15.4+, Firefox 121+). Electron (used by Obsidian desktop) supports it.

## Testing Strategy

### Manual Tests
1. Create gate with cssSelector pointing to existing element → element fills view
2. Create gate with cssSelector pointing to non-existent element → blank page
3. Create gate with empty cssSelector → full page (no isolation)
4. Create gate with cssSelector AND custom CSS → both applied (custom CSS can override)
5. Edit existing gate to add cssSelector → isolation works after reload
6. Test with various selector types: `.class`, `#id`, `div.class`, `[data-attr]`

### Edge Cases
- Invalid CSS selector syntax: CSS parser ignores invalid rules, page shows normally
- Selector matches multiple elements: All matching elements shown (expected)
- Selected element has `position: absolute`: Our CSS overrides it with `position: fixed`

## Rollout Plan

- [ ] Update manifest version (minor bump)
- [ ] Update CHANGELOG.md
- [ ] Add documentation for Element Selector feature
- [ ] Test on desktop (Electron webview)
- [ ] Test on mobile (iframe - may have limitations)

## Open Questions

None - implementation path is clear.

---

**Approval Required Before Implementation**

## Generated Artifacts

- `specs/1-css-selector-isolation/plan.md` (this file)

No additional research needed - the solution uses well-understood CSS techniques with existing plugin infrastructure.
