## Parent PRD

`issues/prd.md`

## What to build

Mirror the asset drawer pattern for the collection create/edit modal. Currently `CollectionModal` is mounted three times (in `AppShell`, `collections/index.tsx`, and `collections/$id.tsx`), each with its own `useState`. Replace all of that with a single zustand store and mount the modal once in `AppShell`.

End-to-end behavior:

- A new `useCollectionModal()` hook exposes `openCreate()`, `openEdit(id)`, `close()`, plus `isOpen` and `mode`.
- `CollectionModal` reads open/mode state from the store. In edit mode it fetches fresh collection data via `useCollectionQuery(id)` rather than receiving `initialData` from the call site — this prevents stale data in the form.
- `CollectionModal` is mounted once in `AppShell`. The duplicate mounts in `collections/index.tsx` and `collections/$id.tsx` are removed along with their associated `useState` variables.
- The collections list page's per-card Edit action calls `openEdit(id)` directly instead of navigating to the detail page.
- All existing trigger sites (header "New Collection" button, empty-state link, detail page Edit button) are updated to call the hook.
- Unit tests cover all store state transitions.

## Acceptance criteria

- [ ] `useCollectionModal()` hook returns the full action + state surface
- [ ] "New Collection" from the header opens the create modal without navigating
- [ ] "New Collection" from the collections list empty state opens the create modal
- [ ] Edit button on a collection card in the list opens the edit modal directly (no navigate to detail page)
- [ ] Edit button on the collection detail page opens the edit modal with fresh data
- [ ] Edit modal form is pre-filled with the latest server data, not stale list cache
- [ ] Closing the modal leaves the user on their current page
- [ ] Only one `<CollectionModal>` is rendered in the DOM at any time
- [ ] No `useState` for modal open/close state remains on `collections/index.tsx` or `collections/$id.tsx`
- [ ] Store unit tests: initial state, `openCreate`, `openEdit`, `close`

## Blocked by

None — can start immediately.

## User stories addressed

- User story 11
- User story 12
- User story 13
- User story 14
- User story 15
- User story 16
