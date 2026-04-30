## Parent PRD

`issues/prd.md`

## What to build

Add a compact JSON Explorer workspace header that gives the framed tool clear context and lightweight document status. The header should identify the tool, use app-like muted supporting text, and show status chips derived from existing empty, valid, invalid, and size state without changing parsing or warning behavior.

## Acceptance criteria

- [ ] The framed workspace includes a compact header identifying the tool as JSON Explorer.
- [ ] The header uses a restrained visual treatment that does not consume excessive vertical space.
- [ ] Empty documents surface an appropriate status in the header.
- [ ] Valid JSON documents surface an appropriate status in the header.
- [ ] Invalid JSON documents surface an appropriate status in the header.
- [ ] Size-related status uses existing document size thresholds and does not introduce new behavior.
- [ ] Tests validate status rendering through visible text or accessible structure, not styling internals.

## Blocked by

- Blocked by `issues/001-frame-json-explorer-workspace.md`

## User stories addressed

- User story 13
- User story 14
- User story 15
- User story 16
- User story 17
- User story 18
- User story 19
- User story 20
- User story 47
- User story 49
