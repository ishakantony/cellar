## Parent PRD

`issues/prd.md`

## What to build

Add interactivity to the JSON Explorer tree from `#010`. Hovering a tree row reveals copy-path and copy-value icon buttons on the right; clicking either copies the corresponding value to the clipboard with visible feedback (e.g., toast). Right-clicking a tree row opens a context menu with the same copy options. Both surfaces are wired to the same handlers built on top of a pure path-builder utility that produces the JSONPath for any tree position.

The path-builder utility must handle objects, arrays, mixed nesting, and special-character keys (using bracket notation where necessary, e.g., `$.user.tags[0]` and `$['key with spaces']`). Implement it as a pure function that takes an array of segments (or a tree path) and returns a JSONPath string — easily unit-testable in isolation.

Copy-value formats primitives directly (numbers, booleans, null, strings) and uses `JSON.stringify` (with indentation) for objects and arrays.

See "Tree interactions" (T1 + T3) and "Path utility" in the parent PRD.

## Acceptance criteria

- [ ] Hovering a tree row reveals copy-path and copy-value icons on the right edge of the row
- [ ] Clicking copy-path copies the JSONPath to the clipboard with visible feedback
- [ ] Clicking copy-value copies the value (primitive or stringified object/array) to the clipboard with visible feedback
- [ ] Right-clicking a tree row opens a context menu offering the same copy options
- [ ] Path-builder utility produces correct JSONPath for: objects, arrays, deep nesting, special-character keys (bracket notation), root, root primitives
- [ ] Path-builder utility is a pure function with comprehensive unit tests
- [ ] Hover icons are accessible (keyboard focusable / aria-labelled)
- [ ] Context menu closes on outside click or Esc

## Blocked by

- Blocked by `issues/010-json-explorer-split-pane-tree.md`

## User stories addressed

Reference by number from the parent PRD:

- User story 51
- User story 52
- User story 53
