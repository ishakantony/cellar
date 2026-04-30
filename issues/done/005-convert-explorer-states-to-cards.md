## Parent PRD

`issues/prd.md`

## What to build

Convert JSON Explorer empty, invalid, and large-document states into app-like cards that match the refreshed workspace. This slice should preserve existing parse semantics, size thresholds, line/column error details, editor diagnostics, and disabled tree rendering for rejected large documents while making the state presentation feel intentional and consistent.

## Acceptance criteria

- [ ] Empty tree/editor guidance appears as app-like state presentation instead of raw inline text.
- [ ] Invalid JSON appears as an app-like error card.
- [ ] Invalid JSON errors retain the existing message, line, and column details.
- [ ] Large-document warnings appear as app-like warning/status cards.
- [ ] The existing large-document warning and rejection thresholds remain unchanged.
- [ ] Tree rendering remains disabled for documents over the hard size limit.
- [ ] Editor diagnostics continue to appear for invalid JSON.
- [ ] Tests verify empty, invalid, and large-document states through user-visible text and roles where practical.

## Blocked by

- Blocked by `issues/001-frame-json-explorer-workspace.md`
- Blocked by `issues/002-add-compact-header-status.md`
- Blocked by `issues/004-replace-tree-tab-with-search-header.md`

## User stories addressed

- User story 18
- User story 19
- User story 20
- User story 26
- User story 27
- User story 28
- User story 29
- User story 30
- User story 47
- User story 49
