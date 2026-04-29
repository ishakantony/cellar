## Parent PRD

`issues/prd.md`

## What to build

Build out `packages/feature-toolbox` with a real manifest (id `toolbox`, label `Toolbox`, icon, basePath `/toolbox`) and a lazy module that exports two routes: `/toolbox` redirects to `/toolbox/json-explorer`, and `/toolbox/json-explorer` renders a placeholder page with the title "JSON Explorer" and "Under construction" body content. Register Toolbox in the shell feature registry so it appears in the rail. No backend tables under `/api/toolbox/*` yet.

This slice exists to validate the rail + lazy-load + error-boundary contract with a second real feature before any tool implementation begins.

See "Toolbox adjustments" → Tb1 (single tool, redirect) in the parent PRD.

## Acceptance criteria

- [ ] Toolbox icon visible in the app switcher rail
- [ ] Clicking the Toolbox rail icon navigates to `/toolbox/json-explorer` (via the `/toolbox` redirect)
- [ ] The placeholder JSON Explorer page renders with title and stub content
- [ ] Toolbox registered in the shell feature registry; manifest matches the contract from `#002`
- [ ] Toolbox loads lazily (verifiable via network tab on first visit)
- [ ] Toolbox is not reachable via flat root URLs

## Blocked by

- Blocked by `issues/002-frontend-scaffold-shell-infrastructure.md`
- Blocked by `issues/005-app-switcher-rail.md`

## User stories addressed

Reference by number from the parent PRD:

- User story 39
- User story 40
- User story 41
