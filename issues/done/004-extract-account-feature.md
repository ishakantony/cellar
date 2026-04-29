## Parent PRD

`issues/prd.md`

## What to build

Move the settings page, `ProfileForm`, `PasswordForm`, and the supporting settings hook from `apps/shell/src/` into `packages/feature-account/src/`. Move the route from `/settings` to `/account/settings`. Implement Account's manifest (id `account`, basePath `/account`, no rail entry — the feature has no rail icon) and lazy module (routes only; nav is empty). Register Account in the shell feature registry. The current sidebar entry pointing to `/settings` is removed (the user-menu link to settings comes in `#006`).

See "Account adjustments" in the parent PRD.

## Acceptance criteria

- [ ] Settings code lives in `packages/feature-account/`
- [ ] Settings page reachable at `/account/settings`
- [ ] Old `/settings` route removed; navigating to it returns the `*` fallback
- [ ] Account registered in the shell feature registry; manifest indicates no rail entry
- [ ] Profile update (name) continues to work end-to-end
- [ ] Password change (with revoke-other-sessions option) continues to work end-to-end
- [ ] Existing settings tests pass after relocation
- [ ] No cross-package imports from feature-account into other features

## Blocked by

- Blocked by `issues/001-backend-namespacing-schema-slicing.md`
- Blocked by `issues/002-frontend-scaffold-shell-infrastructure.md`

## User stories addressed

Reference by number from the parent PRD:

- User story 12
