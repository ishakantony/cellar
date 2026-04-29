## Parent PRD

`issues/prd.md`

## What to build

Move the cmdk-based global palette UI shell into `apps/shell` as a generic component that consumes content via the feature contract. Build a **palette aggregator** deep module that runs `paletteProvider.search` calls in parallel across loaded feature modules with abort propagation and per-feature error containment.

Move the existing rich palette logic (asset/collection search hooks, action registry, result builders) out of the shell and into `packages/feature-vault` as Vault's `paletteProvider` and `staticCommands` (in the manifest). The shell must end up with no Vault-specific imports.

Behavior:

- `⌘K` (and `Ctrl+K`) opens the palette from anywhere; `Esc` closes and restores focus to the previously focused element.
- On first open in a session, the shell prefetches all feature modules in parallel; subsequent opens are instant.
- Static commands from each manifest appear immediately even before modules load.
- Live results stream in per group as each provider resolves; each group renders its own loading skeleton and error state. A failing provider does not block other groups.
- Result grouping order: active feature first, then other features alphabetically, then global groups (Account, Switch to).
- Empty state (no query): recents (per feature, where the provider supports it), quick actions (from manifests), feature switchers, account links.

Delete the old `apps/shell/src/components/command-palette/`, `hooks/use-command-palette*`, and `lib/command-palette-*` files once their content has been ported into either `apps/shell` (UI shell + aggregator) or `packages/feature-vault` (provider + static commands).

See "Global command palette (P2)" and "Side effects of the migration" → palette code reorganization in the parent PRD.

## Acceptance criteria

- [ ] `⌘K` and `Ctrl+K` open the global palette from anywhere
- [ ] `Esc` closes the palette and restores focus to the previously focused element
- [ ] Palette UI lives in `apps/shell`; no Vault-specific imports remain in shell
- [ ] Vault's `paletteProvider` and `staticCommands` live in `packages/feature-vault`
- [ ] Palette aggregator is a deep module with unit tests covering: parallel fetch, abort on input change, per-feature error containment, static commands available immediately
- [ ] Empty palette shows recents, quick actions, feature switchers, and account links
- [ ] Typed query searches across loaded features in parallel; results grouped by feature
- [ ] Result groups ordered with active feature first, then other features alphabetically, then global
- [ ] Each group renders independent loading skeleton and error state
- [ ] One failing provider does not block other groups
- [ ] First-open behavior pre-warms all feature modules in parallel
- [ ] Subsequent palette opens within the session are instant (modules cached)
- [ ] Old palette files removed after the port

## Blocked by

- Blocked by `issues/003-extract-vault-feature.md`
- Blocked by `issues/005-app-switcher-rail.md`

## User stories addressed

Reference by number from the parent PRD:

- User story 22
- User story 23
- User story 24
- User story 25
- User story 26
- User story 27
- User story 28
- User story 29
- User story 30
- User story 31
- User story 32
- User story 37
- User story 38
