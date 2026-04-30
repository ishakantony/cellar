# Cellar

Personal developer vault for snippets, prompts, notes, links, images, and files.

**Stack:** React 19 + Vite + React Router + TanStack Query + Zustand · Hono + Drizzle ORM · Better Auth (with OIDC provider plugin) · PostgreSQL 17 · Tailwind v4 · Storybook · Vitest · Playwright · Bun workspaces.

## Getting Started

```bash
docker compose up -d postgres
bun install
cp .env.example .env  # fill in BETTER_AUTH_SECRET (>= 32 chars)
bun dev
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

| Command                   | Description                                      |
| ------------------------- | ------------------------------------------------ |
| `bun dev`                 | Run shell + api in parallel                      |
| `bun run build`           | Build all packages in dependency order           |
| `bun test`                | Vitest across all workspaces                     |
| `bun run test-storybook`  | Run stories as tests via @storybook/addon-vitest |
| `bun run storybook`       | Start Storybook on :6006                         |
| `bun run e2e`             | Run Playwright e2e tests                         |
| `bun run db:generate`     | Generate a new Drizzle migration                 |
| `bun run db:migrate`      | Apply pending migrations                         |
| `bun run format` / `lint` | Prettier / ESLint                                |
| `bun run check:all`       | Format check + lint + tests + e2e + build        |

## Deployment

A single Docker image serves both the API and the SPA from the same origin.
On boot the server runs migrations, seeds (if empty), syncs OIDC clients (if their secrets are set), prints the startup config, then begins listening.

```bash
docker build -t cellar .
docker compose -f docker-compose.prod.yml up -d
```
