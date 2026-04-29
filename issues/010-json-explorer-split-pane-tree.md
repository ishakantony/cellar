## Parent PRD

`issues/prd.md`

## What to build

Replace the JSON Explorer placeholder from `#008` with the real layout. Build a resizable two-pane layout (default ratio ~40/60, persisted in localStorage). Implement the split-pane primitive in `packages/ui` so it's reusable.

Left pane: the shared CodeMirror editor from `#009` configured with `@codemirror/lang-json` and a "Paste JSON to begin…" placeholder. Editor preserves user input verbatim — no auto-formatting on input.

Right pane: a tab strip with a single `[Tree]` tab visible in v1; the strip's structure is in place so future tabs (`[Stats]`, etc.) can be added without rework. The tree view parses the editor's contents on change and renders nodes as collapsible rows with: disclosure caret if expandable, key, type badge (`# str`, `# num`, `# bool`, `# null`, `[]`, `{}`), truncated value (long strings collapse with click-to-expand), and a count badge for arrays / objects (`[N]` / `{N}`).

Empty editor shows the placeholder both sides (no error). Refresh clears the editor — no persistence of pasted content.

See "JSON Explorer" → Layout, Tree, Empty state in the parent PRD.

## Acceptance criteria

- [ ] `/toolbox/json-explorer` renders the split-pane layout with editor on left and tree pane on right
- [ ] Drag-resize on the divider works smoothly within reasonable bounds
- [ ] Pane ratio persists across sessions
- [ ] Left pane shows the shared CodeMirror editor with JSON syntax highlighting and the placeholder
- [ ] Tree updates live as the editor changes
- [ ] Tree rows display: caret (when expandable), key, truncated value, type badge, count badge for arrays/objects
- [ ] Long string values are truncated by default with click/hover to expand
- [ ] Right pane has a tab strip with a single visible `[Tree]` tab
- [ ] Empty editor shows placeholders in both panes; nothing renders an error state
- [ ] Page refresh clears the editor; no editor persistence
- [ ] Split-pane primitive lives in `packages/ui` and is exported

## Blocked by

- Blocked by `issues/008-toolbox-feature-scaffold.md`
- Blocked by `issues/009-graduate-codemirror-to-ui.md`

## User stories addressed

Reference by number from the parent PRD:

- User story 42
- User story 48
- User story 49
- User story 50
- User story 58
- User story 59
- User story 60
- User story 61
- User story 62
