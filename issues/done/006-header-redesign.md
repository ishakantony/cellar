## Parent PRD

`issues/prd.md`

## What to build

Rebuild the shell-owned header with three zones:

- **Left**: mobile menu toggle (mobile only) + feature-sidebar collapse toggle (desktop only).
- **Center**: command-palette trigger pill (search-pill on desktop, magnifier icon on mobile). The trigger opens the global palette via `⌘K` (palette refactor itself is `#014`).
- **Right**: user-menu avatar that opens a dropdown with the user's name and email at the top, then a Settings link (navigates to `/account/settings`), then a divider, then Sign out.

Remove the existing sidebar footer (which currently holds the user menu) — the per-feature sidebar is fully feature-owned with no shell-controlled bottom area.

Wire the `⌘B` / `Ctrl+B` keyboard shortcut globally to toggle the feature sidebar via the sidebar-collapse store from `#002`. The handler calls the suppression predicate so it does not fire while focus is in CodeMirror, contenteditable, `input`, or `textarea`. The sidebar-collapse toggle button shows the shortcut in its tooltip.

The header has no logo (the Cellar mark lives in the rail's top slot from `#005`) and no notifications icon.

See "Information architecture" → header, user menu, and "Keyboard shortcuts" in the parent PRD.

## Acceptance criteria

- [ ] Header renders with the three-zone layout
- [ ] Mobile hamburger visible on mobile breakpoints only; rail/sidebar collapse toggle visible on desktop only
- [ ] Command-palette trigger renders as a search pill on desktop and magnifier on mobile
- [ ] User-menu dropdown shows the user's name and email at the top
- [ ] User-menu has a Settings entry that navigates to `/account/settings`
- [ ] User-menu has a Sign out entry that signs out and redirects to `/sign-in`
- [ ] Clicking outside the user menu closes it
- [ ] Sidebar footer is removed; user menu no longer appears in the sidebar
- [ ] `⌘B` (and `Ctrl+B`) toggles the feature sidebar from anywhere in the app
- [ ] `⌘B` is suppressed when focus is in CodeMirror, contenteditable, `input`, or `textarea`
- [ ] Sidebar-collapse preference persists across sessions
- [ ] Sidebar-collapse toggle button tooltip displays the `⌘B` shortcut
- [ ] No logo or notifications affordance in the header

## Blocked by

- Blocked by `issues/002-frontend-scaffold-shell-infrastructure.md`
- Blocked by `issues/005-app-switcher-rail.md`

## User stories addressed

Reference by number from the parent PRD:

- User story 9
- User story 10
- User story 13
- User story 14
- User story 15
- User story 16
