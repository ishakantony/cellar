## Parent PRD

`issues/prd.md`

## What to build

Add the Actions group to the command palette: a static registry of commands the user can fire from anywhere in the app. The registry is the source of truth — adding a new action is a single registry entry. Filtering uses cmdk's built-in fuzzy match against label and keywords.

End-to-end behavior:

- A `commandPaletteActions` registry exports the v1 list: New Snippet, New Prompt, New Link, New Note, New Image, New File, New Collection, Sign out, Toggle sidebar. Each entry has `{ id, label, icon, group, keywords, run(ctx) }`.
- A `ctx` factory exposes the side-effect surface used by `run`: open the asset drawer in create mode for a given type, open the collection modal in create mode, perform the existing sign-out flow (and post-sign-out redirect to `/sign-in`), and toggle the existing sidebar collapsed state.
- The Actions group renders below Collections (and below Go To when no other groups are matching). It is filtered by query (e.g. typing "new s" matches "New Snippet"; typing "out" matches "Sign out") and is omitted entirely (header included) when zero actions match.
- The group is capped at 5 rows when querying.
- Each action row shows a lucide icon and the action label.
- Selecting an action closes the palette and invokes `run(ctx)`. Creation actions cause the corresponding modal/drawer to open in create mode immediately after the palette dismisses.
- The `commandPaletteResults` pure module is extended with the Actions group: query-based filtering using the registry's keywords, per-group cap of 5, omission when empty.

Refer to PRD sections "Implementation Decisions" → `commandPaletteActions` / "Action registry (v1 contents)", "Selection behavior", and "Testing Decisions" (`commandPaletteActions` is the second module the PRD specifies tests for).

## Acceptance criteria

- [ ] A `commandPaletteActions` registry exists containing all v1 entries listed in the PRD: 6× "New <Type>", "New Collection", "Sign out", "Toggle sidebar".
- [ ] When matches exist, an "Actions" group is rendered in the palette, with up to 5 rows.
- [ ] Each row shows the action's lucide icon and label.
- [ ] Typing filters actions by label and keywords (e.g. "new s" matches "New Snippet"; "out" matches "Sign out").
- [ ] When zero actions match the current query, the Actions group is omitted entirely.
- [ ] Selecting "New <Type>" closes the palette and opens the asset drawer in create mode for that type.
- [ ] Selecting "New Collection" closes the palette and opens the collection modal in create mode.
- [ ] Selecting "Sign out" closes the palette, performs the existing sign-out flow, and redirects to `/sign-in`.
- [ ] Selecting "Toggle sidebar" closes the palette and flips the existing `sidebarCollapsed` state.
- [ ] Unit tests for `commandPaletteActions` verify that each entry's `run(ctx)` invokes the expected method on a mocked `ctx` with the expected arguments (e.g. "New Snippet" calls the asset-drawer create handler with `type: 'SNIPPET'`).
- [ ] `commandPaletteResults` unit tests are extended to cover Actions group filtering and capping.

## Blocked by

- Blocked by `issues/001-palette-skeleton-and-goto.md`

## User stories addressed

Reference by number from the parent PRD:

- User story 21
- User story 22
- User story 23
- User story 24
- User story 25
- User story 33
