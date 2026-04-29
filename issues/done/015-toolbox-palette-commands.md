## Parent PRD

`issues/prd.md`

## What to build

Add `staticCommands` to the Toolbox manifest contributing at minimum:

- "Open JSON Explorer" — navigation command that routes to `/toolbox/json-explorer`.
- One or two appropriate quick actions for the JSON Explorer (e.g., "Format JSON" — navigates to the explorer if not already there). Be conservative for v1; only ship commands that have a clear meaning today.

This slice exists primarily to validate the cross-feature palette behavior with two real providers contributing in parallel: that the active-feature-first ordering looks right when the user is in Toolbox vs Vault, and that searching for a term shared across features (e.g., `json`) surfaces the right groupings.

See "Toolbox adjustments" → palette commands in the parent PRD.

## Acceptance criteria

- [ ] Toolbox manifest exports `staticCommands` including "Open JSON Explorer"
- [ ] Static commands appear in the global palette empty state under a Toolbox group
- [ ] Selecting "Open JSON Explorer" from the palette navigates to `/toolbox/json-explorer`
- [ ] Searching while inside Vault places Vault group first, then Toolbox
- [ ] Searching while inside Toolbox places Toolbox group first, then Vault
- [ ] Cross-feature search query surfaces results from both groups when matching content exists in both

## Blocked by

- Blocked by `issues/008-toolbox-feature-scaffold.md`
- Blocked by `issues/014-global-palette-refactor.md`

## User stories addressed

Reference by number from the parent PRD:

- User story 24
- User story 25
- User story 30
