## Parent PRD

`issues/prd.md`

## What to build

Rename `apps/web` → `apps/shell` (update Vite config, root scripts, all imports, CI references). Create `packages/feature-vault`, `packages/feature-toolbox`, `packages/feature-account` as workspace packages with `package.json`, `tsconfig.json`, and `src/index.ts` + `src/manifest.ts` skeletons that mirror the export pattern used by `@cellar/shared` / `@cellar/ui`. Define the feature contract types (`FeatureManifest`, `FeatureModule`, `PaletteCommand`, `PaletteProvider`, `NavItem`) in the shell. Implement the deep modules of the shell core: feature registry, route composer (with shell-owned per-feature error boundary and lazy module loader), feature loader, last-active-feature store (Zustand + localStorage), rail-pin store, sidebar-collapse store, and the keyboard-shortcut suppression predicate. App still serves Vault from existing in-shell code; the registry can be empty for this slice.

See "Implementation Decisions" → "Workspace layout (L2)", "Feature contract", "Loading and error semantics", "State persistence" in the parent PRD.

## Acceptance criteria

- [ ] `apps/web` renamed to `apps/shell` everywhere (Vite config, scripts in root and app, all imports)
- [ ] Three feature packages exist with manifest + module skeletons and dual exports (`"."` and `"./manifest"`)
- [ ] Feature contract types defined and exported from the shell (or from a shared location consumed by features)
- [ ] Feature registry, route composer, feature loader, error boundary, and persistence stores implemented
- [ ] Keyboard-shortcut suppression predicate implemented and unit-tested for CodeMirror, contenteditable, `input`, `textarea`, and plain layout focus
- [ ] Palette aggregator skeleton in place (provider list traversal + abort propagation + error containment), even if no providers contribute yet
- [ ] Last-active-feature store reads/writes localStorage with default fallback to `/vault`
- [ ] App boots and serves existing Vault routes unchanged
- [ ] All existing tests pass after the rename

## Blocked by

None - can start immediately

## User stories addressed

Reference by number from the parent PRD:

- User story 1
- User story 2
- User story 17
- User story 18
- User story 20
