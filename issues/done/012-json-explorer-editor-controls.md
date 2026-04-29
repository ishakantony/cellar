## Parent PRD

`issues/prd.md`

## What to build

Add three buttons at the top of the JSON Explorer editor pane: **Format**, **Minify**, **Copy**.

- **Format** pretty-prints the editor's JSON in place (only when the buffer is parseable; on invalid JSON, the action is a no-op without error noise).
- **Minify** strips whitespace from the editor's JSON in place (also a no-op on invalid JSON).
- **Copy** copies the editor's current contents to the clipboard with visible feedback.

Add native HTML5 drag-and-drop on the editor pane: dropping a `.json` file replaces the editor contents with the file's text. Non-JSON file types are rejected with a clear, transient message. No external library is added — use the native drag-and-drop API.

See "JSON Explorer" → Editor controls, drag-and-drop in the parent PRD.

## Acceptance criteria

- [ ] Format button pretty-prints valid JSON in place
- [ ] Format button is a silent no-op on invalid JSON (does not crash, does not show error)
- [ ] Minify button strips whitespace from valid JSON in place
- [ ] Minify button is a silent no-op on invalid JSON
- [ ] Copy button copies the editor's current contents to the clipboard with visible feedback (toast)
- [ ] Dropping a `.json` file on the editor pane replaces the editor's contents with the file's text
- [ ] Dropping a non-JSON file (e.g., `.txt`, `.png`) shows a clear rejection message
- [ ] Drag-and-drop visual affordance is shown while dragging over the editor pane
- [ ] No new third-party library is added for drag-and-drop

## Blocked by

- Blocked by `issues/010-json-explorer-split-pane-tree.md`

## User stories addressed

Reference by number from the parent PRD:

- User story 43
- User story 44
- User story 45
- User story 46
- User story 47
