## Parent PRD

`issues/prd.md`

## What to build

Move the existing `codemirror-editor.tsx` component (currently at `apps/shell/src/components/common/codemirror-editor.tsx` after `#002` rename) and its co-located test into `packages/ui/src/`. Update the package's `exports` map to expose it. Update existing consumers in `feature-vault` (snippet editor, markdown editor, and any others) to import from `@cellar/ui` instead of the local path. The component's public API is preserved — no consumer-visible behavior changes.

See "Side effects of the migration" → CodeMirror graduation in the parent PRD.

## Acceptance criteria

- [ ] `codemirror-editor.tsx` and its test live in `packages/ui/src/`
- [ ] `@cellar/ui` exports the component
- [ ] All Vault consumers (snippet editor, markdown editor, asset content renderer) import from `@cellar/ui`
- [ ] Existing CodeMirror editor test passes from its new location
- [ ] Existing Vault snippet editor and markdown editor continue to function identically
- [ ] No remaining import paths point to `apps/shell/src/components/common/codemirror-editor`

## Blocked by

None - can start immediately

## User stories addressed

Reference by number from the parent PRD:

(Foundation slice — no specific user stories. Enables JSON Explorer and preserves Vault editors under the new architecture.)
