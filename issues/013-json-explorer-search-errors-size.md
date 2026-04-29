## Parent PRD

`issues/prd.md`

## What to build

Three additions to the JSON Explorer:

**Search.** A search input above the tree filters the tree to matching subtrees, retaining each match's full parent path for context (matches keys and values; non-matching siblings are hidden). Empty query restores the full tree. Implement the filter as a pure function that takes the parsed tree + query and returns the filtered tree — testable in isolation.

**Invalid JSON handling.** Implement a JSON parser wrapper module that returns either `{ ok: true, value }` or `{ ok: false, line, col, message }` — extracting line and column robustly across browser-engine error formats. On invalid JSON, the right pane renders an error card with the parser's message plus line and column; CodeMirror's lint gutter shows a marker at the offending line. Empty buffer is treated as empty (placeholder), not invalid.

**Size limits.** Documents above ~5 MB show a soft warning banner ("Large document — tree may be slow") above the tree but still parse and render. Documents above ~50 MB are refused with a message recommending the user split the document; the tree is not rendered in this case.

See "JSON Explorer" → Search, Invalid JSON, Size handling in the parent PRD.

## Acceptance criteria

- [ ] Search input visible above the tree
- [ ] Typing filters the tree to matching subtrees with parent context
- [ ] Search matches both keys and values
- [ ] Empty query restores the full tree
- [ ] Search filter implemented as a pure function with unit tests covering: no match, root match, nested match, array match, key-only match, value-only match, deeply nested match
- [ ] Parser wrapper returns `{ ok, value }` or `{ ok: false, line, col, message }` and is unit-tested across valid, invalid, empty, and edge-case inputs
- [ ] Invalid JSON shows error card in the right pane with parser message + line/col
- [ ] CodeMirror lint gutter marker appears at the offending line for invalid JSON
- [ ] Empty editor shows the placeholder, not an error
- [ ] Documents above ~5 MB show a soft warning banner above the tree
- [ ] Documents above ~50 MB are rejected with a clear message; tree not rendered
- [ ] Path utility, parser wrapper, and search filter unit tests all pass

## Blocked by

- Blocked by `issues/010-json-explorer-split-pane-tree.md`

## User stories addressed

Reference by number from the parent PRD:

- User story 54
- User story 55
- User story 56
- User story 57
- User story 63
- User story 64
