## Parent PRD

`issues/prd.md`

## What to build

Move all Vault routes, components, hooks, and supporting code from `apps/shell/src/` into `packages/feature-vault/src/`. Switch URLs to `/vault/*` namespace: the current `/dashboard` becomes `/vault` (Vault home); assets and collections move under `/vault/assets`, `/vault/assets/:id`, `/vault/collections`, `/vault/collections/:id`. Delete old root-level Vault routes — no back-compat redirects. Implement Vault's manifest (id `vault`, label, icon, basePath `/vault`) and lazy module export (routes with lazy children where helpful, nav). Register Vault in the shell's feature registry.

See "Vault adjustments" in the parent PRD.

## Acceptance criteria

- [ ] All Vault code lives in `packages/feature-vault/`; no Vault-specific code remains in `apps/shell/src/`
- [ ] Vault is reachable at `/vault`, `/vault/assets`, `/vault/assets/:id`, `/vault/collections`, `/vault/collections/:id`
- [ ] Old root-level Vault routes (`/dashboard`, `/assets`, `/collections`) are removed; navigating to them returns the `*` fallback
- [ ] `/vault` renders the previous dashboard content (quick capture, pinned assets, pinned collections, recents)
- [ ] Vault is registered in the shell's feature registry; manifest and lazy module match the contract from `#002`
- [ ] All existing Vault functionality (asset browsing, asset detail drawer, collection detail, pinning, deletion, asset creation) continues to work end-to-end
- [ ] Existing Vault tests pass after relocation
- [ ] No cross-package imports from feature-vault into other features (boundary held by package resolver)

## Blocked by

- Blocked by `issues/001-backend-namespacing-schema-slicing.md`
- Blocked by `issues/002-frontend-scaffold-shell-infrastructure.md`

## User stories addressed

Reference by number from the parent PRD:

- User story 12
- User story 34
- User story 35
