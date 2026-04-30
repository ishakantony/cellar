## Parent PRD

`issues/prd.md`

## What to build

Lightly refine the JSON tree row presentation so hover states, badges, spacing, and row actions feel polished within the refreshed tree pane. This slice should keep row density, type information, copy path/value behavior, context menu behavior, long-string truncation, and long-string expansion unchanged.

## Acceptance criteria

- [ ] Tree rows feel visually aligned with the refreshed pane surfaces.
- [ ] Hover states are softer and consistent with the app surface treatment.
- [ ] Type badges remain visible and retain their semantic information.
- [ ] Tree row density remains suitable for scanning large JSON structures.
- [ ] Copy path and copy value actions remain available on hover/focus.
- [ ] Context menu behavior remains unchanged.
- [ ] Long string truncation behavior remains unchanged.
- [ ] Clicking a truncated long string still expands it to the full value.
- [ ] Tests continue to cover long-string expansion and user-visible tree behavior without brittle style assertions.

## Blocked by

- Blocked by `issues/004-replace-tree-tab-with-search-header.md`

## User stories addressed

- User story 34
- User story 35
- User story 36
- User story 37
- User story 38
- User story 39
- User story 40
- User story 47
- User story 49
