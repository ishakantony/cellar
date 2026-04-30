## Parent PRD

`issues/prd.md`

## What to build

Rewrite `Dockerfile` to use `oven/bun` base image. Replace all `pnpm` commands with `bun`, update production CMD to `bun src/index.ts`, remove `corepack`.

## Acceptance criteria

- [ ] Dockerfile uses `oven/bun` as the base image
- [ ] `corepack enable` is removed
- [ ] `pnpm install --frozen-lockfile` is replaced with `bun install --frozen-lockfile`
- [ ] All `pnpm --filter <pkg> build` are replaced with `bun run --filter <pkg> build`
- [ ] Production CMD uses `bun src/index.ts`
- [ ] `docker build` completes successfully
- [ ] Container starts and serves the API
- [ ] Built SPA static files are present in the container

## Blocked by

- `issues/002-api-runtime-bootstrap.md`
- `issues/003-shell-dev-build.md`
- `issues/004-parallel-dev-build-orchestration.md`

## User stories addressed

- User story 8
- User story 9
- User story 20
