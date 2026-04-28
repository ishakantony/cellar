## Parent PRD

`issues/prd.md`

## What to build

Implement the dashboard page, replacing the current `ComingSoon` stub. The page consumes `useDashboardQuery()` and renders four sections:

**Quick-capture row** — one button per asset type (`SNIPPET`, `PROMPT`, `NOTE`, `LINK`, `IMAGE`, `FILE`) that calls `openCreate({ type })`, plus a "New Collection" button that calls `openCreate()` from `useCollectionModal()`. Clicking a button opens the relevant drawer/modal without leaving the dashboard.

**Stats strip** — derived from `counts` in the API response: total asset count, total collection count, pinned count, and a per-type breakdown. Rendered as small stat chips or a compact row.

**Pinned panels** — two side-by-side sections using existing `AssetCard` and `CollectionCard` components. "Pinned assets" shows up to 6 cards from `pinnedAssets`; "Pinned collections" shows up to 6 from `pinnedCollections`.

**Recent activity** — a list of the 10 most recently updated assets from `recentAssets`, rendered with `AssetCard` in list layout.

Clicking any asset card opens the drawer in place (inherited from `issues/003-asset-card-self-wires.md`). When the vault is empty, an informative empty state guides the user toward creating their first asset or collection.

No chart library is added. No changes to routing are needed — the dashboard is already a registered route.

## Acceptance criteria

- [ ] Dashboard page renders all four sections instead of the `ComingSoon` stub
- [ ] Each quick-capture button opens the correct drawer/modal with type pre-selected
- [ ] Stats strip shows total assets, collections, pinned count, and per-type breakdown
- [ ] Per-type stat counts match what the API returns in `counts.byType`
- [ ] Pinned assets section shows up to 6 cards; shows nothing (or a hint) if none are pinned
- [ ] Pinned collections section shows up to 6 cards; shows nothing (or a hint) if none are pinned
- [ ] Recent activity shows up to 10 assets
- [ ] Clicking an asset card on the dashboard opens the drawer without navigating away
- [ ] Empty state renders when `total === 0`
- [ ] Dashboard component test: mock `useDashboardQuery` with fixture data, assert stat counts and section card counts render correctly

## Blocked by

- Blocked by `issues/002-asset-drawer-store.md`
- Blocked by `issues/005-collection-modal-store.md`
- Blocked by `issues/006-dashboard-api-counts.md`

## User stories addressed

- User story 17
- User story 18
- User story 19
- User story 20
- User story 21
- User story 22
- User story 23
- User story 24
- User story 25
