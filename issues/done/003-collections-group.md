## Parent PRD

`issues/prd.md`

## What to build

Add the Collections group to the command palette. The full collections list for the current user is fetched once via the existing `GET /api/collections` endpoint (cached by TanStack Query) and filtered client-side on every keystroke. Selecting a collection closes the palette and navigates to that collection's page.

End-to-end behavior:

- On first palette open, the data hook ensures the collections list is fetched and cached. Subsequent opens reuse the cache.
- While the user types, the Collections group is filtered client-side (case-insensitive substring on `name`). No debounce — filtering is instantaneous.
- The Collections group is rendered between the Assets group and the Go To group when matches exist. It is omitted entirely (header included) when zero collections match.
- Each collection row shows a folder icon tinted by `collection.color` if set (otherwise default), and the collection name. Pinned collections appear before non-pinned (the API already returns them in this order).
- The group is capped at 5 rows when querying.
- Selecting a collection row closes the palette and navigates to `/collections/:id` via the router.
- The `commandPaletteResults` pure module is extended with the Collections group: client-side filtering, per-group cap of 5, omission when empty, pinned-first preservation.

Refer to PRD sections "Implementation Decisions" → `commandPaletteResults` / `useCommandPaletteData`, "Selection behavior", and "Data contracts".

## Acceptance criteria

- [ ] The collections list is fetched once per session and cached; reopening the palette does not refetch unless the cache is invalidated by the existing app flows.
- [ ] Typing filters collections by name (case-insensitive substring) without firing additional network requests.
- [ ] When matches exist, a "Collections" group is rendered between Assets and Go To, with up to 5 rows.
- [ ] Each collection row shows a folder icon tinted by `collection.color` when set, and the collection's name.
- [ ] Pinned collections appear before non-pinned in the rendered order.
- [ ] When zero collections match the current query, the Collections group is omitted entirely.
- [ ] Selecting a collection row closes the palette and navigates to `/collections/:id`.
- [ ] `commandPaletteResults` unit tests are extended to cover: collections client-side filtering, capping at 5, group omission when empty, and pinned-first ordering.

## Blocked by

- Blocked by `issues/001-palette-skeleton-and-goto.md`

## User stories addressed

Reference by number from the parent PRD:

- User story 10 (Collections group)
- User story 19 (collection navigation case)
- User story 29
- User story 30
