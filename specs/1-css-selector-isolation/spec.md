# Feature Specification: CSS Selector Element Isolation

**Version:** 2.0.0
**Created:** 2025-12-17
**Last Updated:** 2026-04-22
**Status:** IN_PROGRESS

## Pivot Note (v2.0)

Spec v1 rejected a visual element picker as "too complex". User feedback reversed
that decision: manually authoring CSS selectors is still the real barrier. Scope
now includes a **visual picker Modal** (desktop only) reachable from a "Pick
element" button in the edit form. Isolation CSS approach also switched from
overlay-based hiding to `:has()` + `display: none` (lower resource usage, fewer
visual artefacts).

## Overview

Add a simple `cssSelector` field to gate configuration that allows users to specify which HTML element(s) to display from an embedded page. The plugin will automatically generate CSS to hide all other content, enabling users to extract and display only specific portions of web pages without writing CSS themselves.

## User Problem

Users want to embed only specific parts of a webpage (e.g., a dashboard widget, a specific section, a live counter) rather than the entire page. Currently, this requires writing custom CSS to hide unwanted elements - knowledge that most non-technical users don't have. The plugin already supports CSS injection, but the barrier to entry is too high for typical users.

## Goals

1. Allow users to isolate specific page elements by providing a CSS selector
2. Keep the solution simple - no visual element picker, just a text field
3. Maintain backward compatibility with existing gates

## Non-Goals

1. Visual element picker UI (too complex, out of scope)
2. Automatic selector detection or suggestion
3. Multi-element selection with different styling per element
4. Preserving page layout around the selected element
5. Teaching users how to find CSS selectors (documentation concern)

## User Experience

### User Flow

1. User creates or edits a gate
2. User enters a CSS selector in the new "Element Selector" field (e.g., `.dashboard-widget`, `#main-counter`, `article.post`)
3. User saves the gate
4. When the gate loads, only the selected element(s) are visible; all other page content is hidden

### UI/UX Design

- **Location**: New field in gate creation/edit modal, in the "Advanced" section alongside existing CSS/JS fields
- **Appearance**: Simple text input with placeholder text showing example selectors
- **Label**: "Element Selector (CSS)"
- **Placeholder**: e.g., `.widget-class` or `#element-id`
- **Help text**: "Enter a CSS selector to show only matching elements. Leave empty to show full page."

## Technical Specification

### Architecture

**Principle Alignment:**
- **Iteration-First**: Simple field addition - easy to extend later if needed
- **KISS**: Just a text field and CSS generation - no complex UI
- **Separation of Concerns**: Selector storage separate from CSS generation

### Data Model

```typescript
// Extends existing GateFrameOption
interface GateFrameOption {
  // ... existing fields ...
  cssSelector?: string; // CSS selector to isolate element(s)
}
```

### API Surface

```typescript
// Generate isolation CSS from selector
function generateIsolationCSS(selector: string): string {
  // Returns CSS that hides everything except the selected element
}
```

### Obsidian Integration Points

- `ModalEditGate` - Add new input field
- `createWebviewTag` - Apply generated CSS alongside user's custom CSS
- `createIframe` - Apply generated CSS for mobile support

## Requirements

### Must Have

1. New `cssSelector` field in `GateFrameOption` interface
2. Input field in gate edit modal for entering CSS selector
3. CSS generation that hides all elements except those matching the selector
4. Selected element positioned to fill the available space
5. Works on desktop (webview)
6. Works on mobile (iframe) where possible

### Should Have

1. Validation feedback if selector syntax appears invalid
2. Clear documentation with examples of common selectors

### Won't Have (This Version)

1. Visual element picker
2. Selector auto-complete or suggestions
3. Preview before saving
4. Multiple selectors with different treatments

## Edge Cases

1. **Invalid selector syntax**: Show element isolation may fail silently; page displays normally. Consider adding validation.
2. **Selector matches nothing**: Page appears blank. User must verify selector is correct.
3. **Selector matches multiple elements**: All matching elements are shown (expected behavior).
4. **Page dynamically adds content**: CSS may not hide dynamically added elements if they're outside the selected container.
5. **Selected element has fixed/absolute positioning**: May need additional CSS to normalize positioning.
6. **Site uses Shadow DOM**: CSS selector may not reach into shadow roots (browser limitation).

## Dependencies

None - uses existing CSS injection capability.

## Testing Criteria

### Desktop Testing
- [ ] Can create gate with cssSelector field
- [ ] CSS isolation correctly hides non-matching elements
- [ ] Selected element fills the gate container
- [ ] Empty cssSelector shows full page (no isolation)
- [ ] Custom CSS field still works alongside cssSelector
- [ ] Works with various selector types (class, ID, tag, combinators)

### Mobile Testing
- [ ] cssSelector field appears in gate edit modal
- [ ] CSS isolation works in iframe where site allows
- [ ] Graceful fallback when isolation fails

## Documentation Needs

- [ ] README.md - Add section explaining Element Selector feature
- [ ] docs/ - Add guide with common selector examples
- [ ] docs/ - Add troubleshooting for "how to find CSS selectors"

## Migration/Breaking Changes

- **Breaking**: No
- **Migration Path**: N/A - new optional field, existing gates unaffected
- **Version Bump**: Minor (new feature)

## Assumptions

1. Users can find CSS selectors using browser DevTools (or will learn via documentation)
2. Most use cases involve a single element or container that holds the desired content
3. Positioning the isolated element to fill the container is the expected behavior
4. Sites that heavily use Shadow DOM are edge cases and may not work

## Success Criteria

1. Users can isolate page elements without writing CSS manually
2. Feature adds minimal complexity to the existing gate configuration
3. No breaking changes to existing gates

## Approval

- [ ] Specification reviewed
- [ ] Constitution compliance verified
- [ ] Open questions resolved
- [ ] Ready for implementation planning

---

**Next Step:** Create implementation plan using `/speckit.plan`
