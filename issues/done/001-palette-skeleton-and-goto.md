## Parent PRD

`issues/prd.md`

## What to build

Tracer bullet for the command palette feature. Stand up the full plumbing — modal, trigger, keyboard shortcut, state store, header refactor — but render only the "Go To" navigation group on first ship. Selecting a Go To result navigates to the target page. This slice intentionally excludes Assets, Collections, Actions, and Recents groups so the integration risk lands first and the later slices can plug in without re-touching the shell.

End-to-end behavior:

- Pressing ⌘K (Mac) or Ctrl+K (Win/Linux) anywhere in the authenticated app opens the palette. Pressing it while typing in an `<input>`, `<textarea>`, or `contenteditable` element does **not** open the palette.
- The header on desktop renders a wide search pill in the center column with placeholder text and a `⌘K` badge; clicking it opens the palette.
- The header on mobile renders a magnifier icon in the right cluster; tapping opens the palette as a full-screen overlay with the input pinned to the top.
- The desktop modal is centered horizontally, sits ~15% from the top, ~640 px max width, with a dimmed and lightly blurred backdrop. Click-outside or Esc closes; focus traps inside while open and returns to the trigger on close.
- The palette renders only one group: "Go To", whose entries come from a shared module that the sidebar also consumes (no duplicated nav data). On open with no query, all Go To entries are visible. When the user types, entries are filtered. When zero entries match, the group header is hidden entirely.
- Selecting a Go To row closes the palette and navigates to the target route via the router.
- The leftover "Add Collection" button is removed: `HeaderActions` is deleted, `Header` no longer accepts `onAddCollection`, and `AppShell` no longer wires it up. `<CommandPalette />` is mounted at the app shell as a sibling of `CollectionModal` and `AssetDrawer`.

Refer to PRD sections "Implementation Decisions" → "Frontend modules to add" / "Frontend modules to modify or remove" / "Visual / interaction decisions" / "Keyboard" for the locked design choices.

## Acceptance criteria

- [ ] Pressing ⌘K / Ctrl+K from any authenticated route opens the palette; pressing it while focus is inside a text field does not open it.
- [ ] Clicking the header search pill (desktop) or magnifier icon (mobile) opens the palette.
- [ ] On desktop the palette renders as a centered modal with dimmed + blurred backdrop; on mobile it renders full-screen with the input pinned to the top.
- [ ] Esc closes the palette; clicking the backdrop closes the palette; on close, focus returns to the trigger.
- [ ] The palette displays a "Go To" group containing the same nav entries the sidebar shows (Dashboard, All Items, All Collections, plus the six asset-type filters), sourced from a shared module.
- [ ] Typing filters the Go To group; arrow keys move highlight; Enter on a highlighted row navigates to that route and closes the palette; mouse hover and keyboard focus both highlight rows.
- [ ] When no Go To entries match the query, the group header is not rendered.
- [ ] `HeaderActions` is removed, `Header` no longer accepts an `onAddCollection` prop, and `AppShell` no longer passes one.
- [ ] `<CommandPalette />` is mounted once at the app shell level alongside `CollectionModal` and `AssetDrawer`.
- [ ] Unit tests for the pure `commandPaletteResults` module cover: nav filtering by query, group-header hiding when zero matches, and the empty-query branch returning the full nav list.
- [ ] Existing test suites still pass.

## Blocked by

None - can start immediately.

## User stories addressed

Reference by number from the parent PRD:

- User story 1
- User story 2
- User story 3
- User story 4
- User story 5
- User story 6
- User story 7
- User story 16
- User story 17
- User story 19 (nav-only case)
- User story 20
- User story 26
- User story 27
- User story 31
