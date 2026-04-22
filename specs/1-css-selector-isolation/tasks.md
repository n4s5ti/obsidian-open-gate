# Tasks: CSS Selector Element Isolation

**Generated:** 2025-12-17
**Status:** IN_PROGRESS
**Related Spec:** [spec.md](./spec.md)
**Related Plan:** [plan.md](./plan.md)

## User Story

**US1 (P1)**: As a user, I want to enter a CSS selector to display only specific elements from embedded pages, so I don't need to write CSS myself.

## Task Categories

Tasks organized by dependency order. This is a single-story feature with minimal setup.

---

### Phase 1: Setup & Foundation

- [x] T001 Add `cssSelector` optional field to GateFrameOption interface in `src/GateOptions.d.ts`
  - **Principle**: KISS (minimal type addition)
  - **Files**: `src/GateOptions.d.ts`
  - **Estimated Complexity**: Low
  - **Dependencies**: None
  - **Validation**: TypeScript compiles without errors

---

### Phase 2: Core Implementation (US1)

- [x] T002 [P] [US1] Create `generateIsolationCSS` pure function in `src/fns/generateIsolationCSS.ts`
  - **Principle**: Separation of Concerns (isolated CSS generation logic)
  - **Files**: `src/fns/generateIsolationCSS.ts`
  - **Estimated Complexity**: Low
  - **Dependencies**: T001
  - **Validation**: Function returns valid CSS string for given selector; returns empty string for empty/null input

- [x] T003 [US1] Add Element Selector input field to gate edit form in `src/fns/createFormEditGate.ts`
  - **Principle**: KISS (single text field using existing Setting API)
  - **Files**: `src/fns/createFormEditGate.ts`
  - **Estimated Complexity**: Low
  - **Dependencies**: T001
  - **Validation**: New "Element Selector (CSS)" field appears in Advanced Options section

- [x] T004 [US1] Apply isolation CSS in webview creation in `src/fns/createWebviewTag.ts`
  - **Principle**: Iteration-First (prepend to existing CSS, easy to modify)
  - **Files**: `src/fns/createWebviewTag.ts`
  - **Estimated Complexity**: Low
  - **Dependencies**: T002
  - **Validation**: When cssSelector is provided, generated CSS is inserted; user's custom CSS still applies after

- [x] T005 [US1] Apply isolation CSS in iframe creation in `src/fns/createIframe.ts`
  - **Principle**: DRY (reuses same generateIsolationCSS function)
  - **Files**: `src/fns/createIframe.ts`
  - **Estimated Complexity**: Low
  - **Dependencies**: T002
  - **Validation**: Mobile iframe applies isolation CSS when cssSelector is provided

---

### Phase 3: Testing & Validation

- [ ] T006 [P] Test on Obsidian desktop with various selectors
  - **Principle**: First-Principles (verify root solution works)
  - **Files**: N/A (manual testing)
  - **Estimated Complexity**: Low
  - **Dependencies**: T004
  - **Validation**:
    - Create gate with `.class` selector → element isolated
    - Create gate with `#id` selector → element isolated
    - Create gate with empty selector → full page shown
    - Create gate with cssSelector AND custom CSS → both work

- [ ] T007 [P] Test on Obsidian mobile (iframe)
  - **Principle**: First-Principles
  - **Files**: N/A (manual testing)
  - **Estimated Complexity**: Low
  - **Dependencies**: T005
  - **Validation**:
    - cssSelector field visible in gate edit modal
    - Isolation works where site iframe policy allows

---

### Phase 4: Documentation & Polish

- [ ] T008 [P] Update README.md with Element Selector feature documentation in `README.md`
  - **Principle**: Human Guidance (clear communication)
  - **Files**: `README.md`
  - **Estimated Complexity**: Low
  - **Dependencies**: T004
  - **Validation**: Feature usage is documented with examples

- [ ] T009 [P] Add Element Selector guide to docs site in `docs/`
  - **Principle**: Human Guidance
  - **Files**: `docs/` (create new guide page)
  - **Estimated Complexity**: Low
  - **Dependencies**: T004
  - **Validation**: Guide includes common selector examples and "how to find selectors" section

- [ ] T010 Update CHANGELOG.md with new feature entry in `CHANGELOG.md`
  - **Principle**: Human Guidance
  - **Files**: `CHANGELOG.md`
  - **Estimated Complexity**: Low
  - **Dependencies**: T006, T007
  - **Validation**: Changelog accurately describes new Element Selector feature

- [ ] T011 Bump version in manifest.json (minor bump) in `manifest.json`
  - **Principle**: Greenfield Development (clean versioning)
  - **Files**: `manifest.json`, `package.json`
  - **Estimated Complexity**: Low
  - **Dependencies**: T010
  - **Validation**: Version follows semver (minor bump for new feature)

---

## Task Execution Rules

1. **Dependency Order**: Complete dependencies before dependent tasks
2. **Iteration First**: Each task should be small enough to complete and test independently
3. **KISS**: If a task feels complex, break it down further
4. **YAGNI**: If a task builds something not immediately needed, defer it
5. **No Workarounds**: If you need a workaround, the task is wrong - redesign it

## Dependency Graph

```
T001 (Type Definition)
  ├── T002 (CSS Generator) ─┬── T004 (Webview) ── T006 (Desktop Test)
  │                         └── T005 (Iframe) ─── T007 (Mobile Test)
  └── T003 (UI Field)

T004 ─┬── T008 (README) ──┐
      └── T009 (Docs) ────┼── T010 (CHANGELOG) ── T011 (Version)
T006 ─────────────────────┘
T007 ─────────────────────┘
```

## Parallel Execution Opportunities

**After T001 completes:**
- T002 and T003 can run in parallel (independent files)

**After T002 completes:**
- T004 and T005 can run in parallel (independent files)

**After T004/T005 complete:**
- T006, T007, T008, T009 can all run in parallel

## Progress Tracking

- **Total Tasks**: 11
- **Completed**: 5
- **In Progress**: 0
- **Blocked**: 0

## Implementation Strategy

**MVP Scope**: T001 → T002 → T003 → T004 (desktop only)

This delivers the core feature for desktop users. Mobile (T005) and documentation (T008-T009) can follow.

## Blockers

None identified.

## Notes

- No tests requested in spec, so no automated test tasks generated
- Feature is additive (new optional field), no migration needed
- All tasks are low complexity - this is a straightforward feature

---

**To begin implementation:** `/speckit.implement`
