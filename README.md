# Cellar

Personal developer vault for snippets, prompts, notes, links, images, and files.

**Stack:** React 19 + Vite + React Router + TanStack Query + Zustand · Hono + Drizzle ORM · Better Auth (with OIDC provider plugin) · PostgreSQL 17 · Tailwind v4 · Storybook · Vitest · Playwright · pnpm workspaces.

## Getting Started

```bash
docker compose up -d postgres
pnpm install
cp .env.example apps/api/.env  # fill in BETTER_AUTH_SECRET (>= 32 chars)
pnpm dev
```

- SPA: http://localhost:5200 (Vite dev server, proxies `/api` to the backend)
- API: http://localhost:5201
- Postgres: localhost:5203 (via `docker-compose.yml`)

The first boot runs Drizzle migrations and seeds a demo user (`demo@cellar.app` / `password123`).

## Workspace layout

```
apps/
  web/                 # Vite + React SPA
  api/                 # Hono server (Node.js)
packages/
  shared/              # Zod schemas, enums, helpers
e2e/                   # Playwright tests
```

## Scripts

| Command                | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `pnpm dev`             | Run web + api in parallel                        |
| `pnpm build`           | Build SPA, typecheck shared, typecheck api       |
| `pnpm test`            | Vitest across all workspaces                     |
| `pnpm test-storybook`  | Run stories as tests via @storybook/addon-vitest |
| `pnpm storybook`       | Start Storybook on :6006                         |
| `pnpm e2e`             | Run Playwright e2e tests                         |
| `pnpm db:generate`     | Generate a new Drizzle migration                 |
| `pnpm db:migrate`      | Apply pending migrations                         |
| `pnpm format` / `lint` | Prettier / ESLint                                |
| `pnpm check:all`       | Format check + lint + tests + e2e + build        |

## Deployment

A single Docker image serves both the API and the SPA from the same origin.
On boot the server runs migrations, seeds (if empty), syncs OIDC clients (if their secrets are set), prints the startup config, then begins listening.

```bash
docker build -t cellar .
docker compose -f docker-compose.prod.yml up -d
```
