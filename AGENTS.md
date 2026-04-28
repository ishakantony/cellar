# Cellar — Vite + Hono monorepo

This repo is a pnpm workspace monorepo:

- `apps/web` — React 19 + Vite SPA. React Router v7, TanStack Query, Hono RPC client, Zustand, Tailwind v4, Storybook.
- `apps/api` — Hono server on Node.js. Drizzle ORM (Postgres), Better Auth (with `@better-auth/oauth-provider`), Zod validators via `@hono/zod-validator`.
- `packages/shared` — framework-agnostic Zod schemas, enums, and helpers consumed by both apps.

End-to-end types flow via Hono RPC: the SPA imports `AppType` from `apps/api/src/app.ts` (type-only) and uses `hc<AppType>()` for typed calls. Runtime contracts live in `@cellar/shared`.

## Conventions

- Use `pnpm`, not npm/yarn. The package manager is pinned in the root `package.json`.
- New tables go into `apps/api/src/db/schema.ts`, then run `pnpm db:generate` to produce a Drizzle migration. Boot runs migrations automatically.
- New API routes go in `apps/api/src/routes/*.ts` and are mounted in `apps/api/src/app.ts`. Keep them chained on a single Hono builder so RPC types infer.
- Frontend data access goes through TanStack Query hooks in `apps/web/src/hooks/{queries,mutations}/`. Don't fetch from page components directly.
- Forms use `react-hook-form` + `@hookform/resolvers` + Zod schemas from `@cellar/shared`.
- Stories live next to their component as `*.stories.tsx`. Storybook config is at `apps/web/.storybook`.

## Local development

```bash
docker compose up -d postgres   # local Postgres on :5203
pnpm install
cp .env.example .env            # fill in BETTER_AUTH_SECRET (>= 32 chars) — single root .env is read by both web and api
pnpm dev                        # runs web on :5200 and api on :5201 in parallel
```

Vite proxies `/api` and `/.well-known` to the Hono backend. In production, Hono serves the built SPA from `apps/web/dist` on the same origin.

## Source Code Reference

Source code for dependencies is cached at `~/.opensrc/`.

Use `opensrc path` inside other commands to read source:

```bash
rg "pattern" $(opensrc path <package>)
cat $(opensrc path <package>)/path/to/file
```
