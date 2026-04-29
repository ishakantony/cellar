## Parent PRD

`issues/prd.md`

## What to build

Remove the per-asset-type entries from the global sidebar nav (the current `?type=…` convention that leaks Vault-specific filter logic into shared layout code). Replace them with in-page filter tabs on the `/vault/assets` list page so the type filter belongs to the page itself. Clean up the special-case logic in shared layout components that currently checks `pathname === '/assets' && searchParams?.get('type') === item.type`. Filter state continues to use URL query params for shareability and back-button support.

See "Vault adjustments" → "In-page asset filter" in the parent PRD.

## Acceptance criteria

- [ ] Per-type entries (Snippet, Prompt, Link, Note, Image, File, etc.) no longer appear in the global sidebar nav
- [ ] `/vault/assets` page renders a filter tab strip above the list with one tab per asset type, plus an "All" tab
- [ ] Selecting a tab filters the list and updates the URL query param (e.g., `?type=SNIPPET`)
- [ ] Filter state survives page reload (URL-driven)
- [ ] No Vault-specific special cases remain in shared layout / nav components
- [ ] Existing assets page tests pass after the refactor

## Blocked by

- Blocked by `issues/003-extract-vault-feature.md`

## User stories addressed

Reference by number from the parent PRD:

- User story 36
