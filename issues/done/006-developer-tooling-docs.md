## Parent PRD

`issues/prd.md`

## What to build

Update `.husky/pre-commit` to `bunx lint-staged`, `playwright.config.ts` to `bun run --filter api dev`, `scripts/setup-worktree.sh` to `bun install`, and update `AGENTS.md` / `README.md` to reference `bun`.

## Acceptance criteria

- [ ] `.husky/pre-commit` runs `bunx lint-staged`
- [ ] `playwright.config.ts` webServer command uses `bun run --filter api dev`
- [ ] `scripts/setup-worktree.sh` runs `bun install`
- [ ] `AGENTS.md` references `bun install`, `bun dev`, `bun run`
- [ ] `README.md` references `bun` instead of `pnpm`
- [ ] Pre-commit hook runs without error
- [ ] Playwright webServer command starts successfully

## Blocked by

- `issues/001-workspace-lockfile-migration.md`

## User stories addressed

- User story 5
- User story 6
- User story 10
- User story 12
