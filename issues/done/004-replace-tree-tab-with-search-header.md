## Parent PRD

`issues/prd.md`

## What to build

Replace the awkward single-tab tree strip with a compact tree pane header and shared search visual treatment. The right pane should clearly identify the Tree view, keep search scoped to the tree pane, preserve existing search filtering behavior, and update tests that previously expected a single Tree tab.

## Acceptance criteria

- [ ] The right pane no longer presents a one-option tab strip for Tree.
- [ ] The right pane has a compact pane header clearly labeled Tree.
- [ ] Tree search uses the shared app search visual treatment.
- [ ] Tree search remains visually and structurally scoped to the tree pane.
- [ ] Existing tree search filtering behavior remains unchanged.
- [ ] Tests are updated to expect the pane header/search structure instead of the old Tree tab.
- [ ] Tests validate search behavior through rendered results rather than styling class names.

## Blocked by

- Blocked by `issues/001-frame-json-explorer-workspace.md`

## User stories addressed

- User story 9
- User story 21
- User story 22
- User story 23
- User story 24
- User story 25
- User story 46
- User story 47
- User story 48
- User story 49
