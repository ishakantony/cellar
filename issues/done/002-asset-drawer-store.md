## Parent PRD

`issues/prd.md`

## What to build

Replace the URL-driven asset drawer state (`nuqs` query params `?id=` / `?new=1`) with a thin zustand store. After this slice, the drawer opens without changing the URL or navigating the user, and any component in the tree can trigger it via a hook.

End-to-end behavior:

- A new `useAssetDrawer()` hook exposes `openView(id)`, `openEdit(id)`, `openCreate({ type?, collectionId? })`, `close()`, plus read-only `isOpen`, `mode`, `assetId`.
- `AssetDrawer` reads state from the store instead of `useQueryState`. No more `nuqs` in this component.
- `AssetDrawer` is mounted once inside `AppShell`, so it is available on every authenticated page.
- The `/assets` list page calls `openView` / `openCreate` from the hook instead of setting query params.
- `openCreate({ type })` passes the initial type to `AssetCreateContent` so the type picker is pre-selected.
- `openCreate({ collectionId })` passes the initial collection so the collection picker is pre-selected.
- Unit tests cover all store state transitions.

The existing `AssetViewContent` and `AssetCreateContent` sub-components remain structurally intact; only their data source (URL → store) changes.

## Acceptance criteria

- [ ] `useAssetDrawer()` hook is importable and returns the full action + state surface
- [ ] Opening the drawer from `/assets` page does not change the URL
- [ ] `openView(id)` opens the drawer in view mode showing the correct asset
- [ ] `openEdit(id)` opens the drawer directly in edit mode
- [ ] `openCreate()` opens the blank create form
- [ ] `openCreate({ type: 'SNIPPET' })` pre-selects the Snippet type in the form
- [ ] `openCreate({ collectionId: 'x' })` pre-selects that collection in the form
- [ ] Closing the drawer clears state and the URL remains unchanged throughout
- [ ] `AssetDrawer` is rendered in `AppShell`, not on `/assets` only
- [ ] No `useQueryState('id')` or `useQueryState('new')` remain in `AssetDrawer`
- [ ] Store unit tests: initial state, each open action, close, replace while open

## Blocked by

None — can start immediately.

## User stories addressed

- User story 1
- User story 5
- User story 6
- User story 7
- User story 9
