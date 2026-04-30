## Parent PRD

`issues/prd.md`

## What to build

Refresh the editor pane chrome so it uses layered app surfaces and compact shared-button visual language while preserving the existing editor workflow. Format, Minify, and Copy should remain in the same toolbar area; drag-over, drop prompt, placeholder, diagnostics, and local editor styling should feel integrated with the new workspace without globally restyling shared CodeMirror consumers.

## Acceptance criteria

- [ ] The editor pane uses layered app surfaces instead of disconnected pure-black chrome.
- [ ] Format, Minify, and Copy remain available in the existing toolbar area.
- [ ] Toolbar actions use compact app-like button styling while remaining space-efficient.
- [ ] Editor placeholder styling matches the refreshed editor surface.
- [ ] Drag-over styling and the drop prompt match the refreshed app surface treatment.
- [ ] Existing lint diagnostic behavior remains visible for invalid JSON.
- [ ] Any CodeMirror visual adjustment is local to JSON Explorer and does not globally alter other editor consumers.
- [ ] Tests verify the editor still mounts and key toolbar/drop/diagnostic-visible behavior remains intact where practical.

## Blocked by

- Blocked by `issues/001-frame-json-explorer-workspace.md`

## User stories addressed

- User story 8
- User story 10
- User story 11
- User story 12
- User story 30
- User story 31
- User story 32
- User story 33
- User story 45
- User story 46
- User story 47
- User story 49
- User story 50
