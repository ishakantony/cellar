## Parent PRD

`issues/prd.md`

## What to build

Replace root `package.json` scripts. `dev` becomes `bun run --parallel --filter shell --filter api dev`; `build` becomes `bun run --workspaces build`; update all other root scripts (`db:*`, `check:all`, etc.) to use `bun run --filter`.

## Acceptance criteria

- [ ] Root `dev` script runs `bun run --parallel --filter shell --filter api dev`
- [ ] Root `build` script runs `bun run --workspaces build`
- [ ] All `db:*` scripts use `bun run --filter api <script>`
- [ ] `check:all` and other root scripts use `bun run` instead of `pnpm`
- [ ] `bun dev` starts both dev servers with prefixed output
- [ ] `bun run build` builds all packages in dependency order

## Blocked by

- `issues/002-api-runtime-bootstrap.md`
- `issues/003-shell-dev-build.md`

## User stories addressed

- User story 2
- User story 4
