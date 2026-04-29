## Parent PRD

`issues/prd.md`

## What to build

Replace the current single sidebar layout with a two-zone architecture: an icon-only **app switcher rail** (~56px wide) on the far left, plus a **per-feature sidebar host** to its right that renders the active feature's `nav` contributions from the feature contract.

Rail behavior:

- Top slot holds the Cellar mark.
- One icon per feature whose manifest opts into rail visibility (Vault, Toolbox). Account is **not** in the rail.
- Hovering an icon in icon-only mode shows a label tooltip via Radix tooltip; tooltip floats and does not push layout.
- Active feature is visually indicated.
- A pin/expand toggle at the bottom of the rail switches it to a wider variant (~180px) showing labels next to icons; preference persists across sessions in localStorage.
- Width transition is animated (~150–200ms ease-out) consistent with the existing sidebar collapse animation.

Per-feature sidebar host:

- Reads the active feature's `nav` array and renders sections / items.
- During feature load, renders a skeleton placeholder (using the manifest's optional `Skeleton` component if provided, else a generic skeleton).
- On feature load failure, renders an inline error card with retry inside the main content area (the rail stays interactive so the user can switch elsewhere).

This replaces the current `Sidebar` / `SidebarNavigation` / `NavSection` composition. The existing `nav-config.ts` (which hardcodes Vault entries) is removed.

See "Information architecture" and "Loading and error semantics (LE3)" in the parent PRD.

## Acceptance criteria

- [ ] Rail visible on the far left at ~56px wide with feature icons (Vault and Toolbox where applicable)
- [ ] Account does not appear in the rail
- [ ] Cellar mark visible in the rail's top slot
- [ ] Hovering an icon shows a label tooltip; tooltip is floating and does not push layout
- [ ] Active feature is visually indicated in the rail
- [ ] Pin toggle switches between icon-only (~56px) and wide (~180px) variants
- [ ] Pin preference persists across sessions
- [ ] Width transition is animated and consistent with existing animation patterns
- [ ] Per-feature sidebar renders the active feature's nav from the feature contract
- [ ] Skeleton placeholder shown in the per-feature sidebar during feature load
- [ ] Inline error card with retry button appears in main content on feature load failure
- [ ] Rail remains interactive when the active feature has failed to load

## Blocked by

- Blocked by `issues/002-frontend-scaffold-shell-infrastructure.md`
- Blocked by `issues/003-extract-vault-feature.md`
- Blocked by `issues/004-extract-account-feature.md`

## User stories addressed

Reference by number from the parent PRD:

- User story 3
- User story 4
- User story 5
- User story 6
- User story 7
- User story 8
- User story 11
- User story 19
- User story 21
