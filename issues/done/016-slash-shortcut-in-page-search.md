## Parent PRD

`issues/prd.md`

## What to build

On Vault list pages with a search input (`/vault/assets`, `/vault/collections`), register a `/` keybinding while the page is mounted. Pressing `/` focuses the page's search input. Use the keyboard-shortcut suppression predicate from `#002` so the keystroke is ignored when focus is already in an editor or another input. The shortcut is page-owned — registered/unregistered with the page lifecycle. The shell does not coordinate it.

See "Keyboard shortcuts" → `/` in the parent PRD.

## Acceptance criteria

- [ ] `/` focuses the search input on `/vault/assets`
- [ ] `/` focuses the search input on `/vault/collections`
- [ ] `/` does nothing on pages without a search input
- [ ] `/` does not fire while typing in CodeMirror, contenteditable, `input`, or `textarea`
- [ ] Shortcut is registered on page mount and unregistered on page unmount (no cross-page leaks)
- [ ] Shortcut behavior implemented as a small reusable hook so future list pages can opt in with one line

## Blocked by

- Blocked by `issues/003-extract-vault-feature.md`
- Blocked by `issues/007-in-page-asset-filter.md`

## User stories addressed

Reference by number from the parent PRD:

- User story 33
- User story 65
