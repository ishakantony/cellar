## Parent PRD

`issues/prd.md`

## What to build

Make the palette useful before the user has typed anything. On open with an empty query, show the user's 6 most-recently-edited assets in a "Recent" group, followed by the full Actions group. When the user starts typing, the empty-state branch flips off and the normal querying groups (Assets, Collections, Actions, Go To) take over.

End-to-end behavior:

- The data hook fetches `GET /api/assets?sort=newest&limit=8` (cached by TanStack Query). The endpoint already orders `pinned DESC, updatedAt DESC`, so pinned items naturally bubble up.
- When the palette's query is empty, `commandPaletteResults` returns the Recent group (cap 6, sourced from the recents query) followed by the Actions group (uncapped on empty state, all v1 actions visible). The Assets, Collections, and Go To groups are not rendered in this branch.
- Recent rows reuse the asset row from issue 002 (icon by type, title, pinned indicator, relative-time meta).
- When the recents query returns zero rows (brand-new user), the Recent group is omitted entirely; the empty-state palette shows only the Actions group.
- When the user types and the query is non-empty, the empty-state branch is bypassed: the normal groups are computed as defined in slices 002–004. Recents that also appear in the current Assets results are deduplicated — they are removed from any reappearance to avoid the same row showing twice across groups (only relevant if a future change re-introduces recents into the typing branch; in v1 the typing branch does not include Recent, so this rule mostly guards the pure module's invariant for future changes).
- The `commandPaletteResults` pure module is extended with the empty-query branch and the dedup rule.

Refer to PRD sections "Implementation Decisions" → `commandPaletteResults` / "Visual / interaction decisions", "Data contracts", and "User Stories" 14 and 15.

## Acceptance criteria

- [ ] Opening the palette with an empty query shows a "Recent" group (up to 6 most-recently-edited assets) followed by an "Actions" group containing all v1 actions.
- [ ] Recent rows render with the same visuals as Assets-group rows (type icon, title, pinned indicator, relative-time meta).
- [ ] Pinned recent items appear before non-pinned in the Recent group.
- [ ] When the recents query returns zero rows, the Recent group is omitted; the palette shows only the Actions group on empty state.
- [ ] Typing into the input switches off the empty-state branch: the Assets, Collections, Actions, and Go To groups are computed and rendered as defined in slices 002–004; the Recent group is not rendered while a query is active.
- [ ] Clearing the input returns to the empty state without an additional network round-trip (cached recents).
- [ ] `commandPaletteResults` unit tests are extended to cover: empty-query branch returns Recent + Actions; empty-query with zero recents returns only Actions; pinned-first ordering inside Recent; recents-vs-assets dedup invariant for the (currently theoretical) case where both groups render together.

## Blocked by

- Blocked by `issues/002-asset-search-group.md`
- Blocked by `issues/004-actions-group.md`

## User stories addressed

Reference by number from the parent PRD:

- User story 9 (recents-side, pinned-first)
- User story 14
- User story 15
- User story 32
