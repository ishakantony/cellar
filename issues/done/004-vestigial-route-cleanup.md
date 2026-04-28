## Parent PRD

`issues/prd.md`

## What to build

Remove the redirect routes and dead page files that were created to support URL-based deep linking into the asset drawer. Now that the drawer is driven by a zustand store (see `issues/002-asset-drawer-store.md`), these routes serve no purpose and should be deleted.

Routes to remove from the router:

- `/assets/new` → redirect to `/assets?new=1`
- `/assets/:id` → `AssetIdRedirect` (redirects to `/assets?id=...`)
- `/assets/:id/edit` → same redirect

Files to delete:

- `apps/web/src/routes/assets/$id.tsx`
- `apps/web/src/routes/assets/$id.edit.tsx`

After deletion, audit whether `nuqs` is still imported anywhere in the web app. If no remaining `useQueryState` / `useQueryParam` calls exist, remove `nuqs` from `apps/web/package.json`.

## Acceptance criteria

- [ ] Router no longer contains `/assets/new`, `/assets/:id`, or `/assets/:id/edit` routes
- [ ] `apps/web/src/routes/assets/$id.tsx` is deleted
- [ ] `apps/web/src/routes/assets/$id.edit.tsx` is deleted
- [ ] Navigating to `/assets/123` in the browser does not 404 — it either redirects gracefully to `/assets` or shows a 404 page (document which behavior is chosen)
- [ ] `nuqs` is removed from `apps/web/package.json` if no other usages remain
- [ ] No TypeScript errors after deletion

## Blocked by

- Blocked by `issues/002-asset-drawer-store.md`

## User stories addressed

- User story 8
