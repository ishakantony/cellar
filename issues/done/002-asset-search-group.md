## Parent PRD

`issues/prd.md`

## What to build

Add the Assets group to the command palette. When the user types, the palette queries the existing asset full-text-search endpoint (debounced) and renders a ranked, capped list above the Go To group. Selecting an asset closes the palette and opens the existing asset drawer for that asset.

End-to-end behavior:

- The palette's data hook issues a debounced (~150 ms) request to `GET /api/assets?q=…&limit=5` while the user types. Empty queries do not fetch.
- The Assets group appears above the Go To group when search results exist. It is omitted entirely (header included) when the query is empty or matches nothing.
- Each asset row shows the same lucide icon already used by the sidebar for that asset type, the title, a pinned indicator if the asset is pinned, and a relative-time meta on the right derived from `updatedAt`.
- Pinned-first ordering is preserved as returned by the API (`pinned DESC, ts_rank DESC`).
- A small "N of M" count badge is shown in the Assets group header when the total matched count exceeds the cap of 5.
- Selecting an asset row closes the palette and calls `useAssetDrawer().openView(assetId)`; the existing drawer flow handles the rest.
- The `commandPaletteResults` pure module is extended with the Assets group: it accepts the (already-ranked) asset rows from the data hook, applies the per-group cap of 5, omits the group when empty, and exposes the total count for the badge.

Refer to PRD sections "Implementation Decisions" → "Frontend modules to add" (`useCommandPaletteData`, `commandPaletteResults`), "Selection behavior", "Visual / interaction decisions", and "Data contracts".

## Acceptance criteria

- [ ] Typing in the palette triggers a debounced asset search; the network does not fire on every keystroke.
- [ ] When matches exist, an "Assets" group is rendered above "Go To", with up to 5 rows.
- [ ] Each asset row shows the correct type icon (matching the sidebar), title, pinned indicator when applicable, and a relative-time meta line.
- [ ] Pinned assets appear before non-pinned in the rendered order.
- [ ] When more than 5 assets match, the group header shows a count of the form "5 of N".
- [ ] When zero assets match the current query, the Assets group is omitted entirely (no header).
- [ ] Selecting an asset row closes the palette and opens the asset in the existing asset drawer in view mode.
- [ ] `commandPaletteResults` unit tests are extended to cover: Assets group capping at 5, group omission when empty, pinned-first preservation, and the total-count value reported alongside the capped group.

## Blocked by

- Blocked by `issues/001-palette-skeleton-and-goto.md`

## User stories addressed

Reference by number from the parent PRD:

- User story 8
- User story 9 (search-side)
- User story 10 (Assets group)
- User story 11
- User story 12
- User story 13
- User story 18
- User story 28
- User story 32 (incremental — pure module gains its first non-trivial branch)
