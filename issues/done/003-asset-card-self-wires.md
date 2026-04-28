## Parent PRD

`issues/prd.md`

## What to build

Make `AssetCard` handle its own click behavior by calling `useAssetDrawer().openView(id)` internally, so that every call site gets the correct open-drawer behavior automatically. Update the collection details page to stop calling `navigate('/assets/${id}')` on card click — after `AssetCard` self-wires, no call site needs to wire this up manually.

This is the slice that fixes the core UX problem: clicking an asset from the collection details page now opens the drawer in place, and closing it returns the user to the collection page.

End-to-end behavior:

- Clicking any `AssetCard` (on `/assets`, `/collections/$id`, or `/dashboard`) opens the asset drawer without navigating.
- The collection details page no longer has `onClick={() => navigate('/assets/${id}')}` on its asset items.
- Call sites that previously passed an `onCardClick` or `onClick` prop to trigger navigation are updated to remove that prop.
- Existing `AssetCard` tests are updated to verify that a click calls `openView` (via a mocked store) rather than an `onClick` callback prop.

## Acceptance criteria

- [ ] Clicking an asset card on the collection details page opens the drawer and the URL path stays at `/collections/$id`
- [ ] Closing the drawer after opening from the collection page leaves the user on the collection page
- [ ] Clicking an asset card on `/assets` still opens the drawer (no regression)
- [ ] `AssetCard` no longer requires an `onClick` / `onCardClick` prop to open the drawer
- [ ] Collection details page contains no `navigate('/assets/...')` call for asset card clicks
- [ ] Updated `AssetCard` tests verify `openView` is called with the correct id on click

## Blocked by

- Blocked by `issues/002-asset-drawer-store.md`

## User stories addressed

- User story 1
- User story 2
- User story 3
- User story 4
- User story 7
- User story 10
