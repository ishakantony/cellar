## Problem Statement

The current Cellar codebase is tightly coupled to Next.js and npm. This has created repeated friction around framework behavior, package management, deployment shape, Storybook integration, and frontend/backend separation. The application currently mixes frontend routing, server-rendered page behavior, API routes, server actions, auth session access, generated Prisma types, and Docker runtime behavior inside a single package.

The user wants to remove Next.js completely and replace it with a clearer architecture: pnpm workspaces, a React + Vite frontend, a Hono backend, shared contract packages, and a single production application image where the Hono server hosts the built frontend static assets. Storybook must remain a first-class foundation for the design system.

## Solution

Refactor the repository in one big-bang migration to a strict pnpm workspace monorepo. The final architecture will use deployable app workspaces for the React/Vite frontend and Hono backend, plus a contracts-only shared package for cross-runtime schemas and DTOs. Next.js will be removed completely, including dependencies, config files, generated environment files, imports, Storybook framework bindings, tests mocks, and Docker behavior.

The frontend will be a pure React Router SPA built by Vite. It will use Hono RPC plus TanStack Query for typed server communication, caching, mutations, and query invalidation. The backend will run on Node via Hono, own Prisma and all server-only concerns, preserve Better Auth and OIDC behavior, expose typed RPC resource routes, handle uploads/files, run startup chores, and serve the built Vite frontend in production with SPA fallback behavior.

Storybook will move with the frontend and use React Vite Storybook. Docker will produce a production app image that serves both backend and frontend on port 7000, plus an optional Storybook target. Production compose and documentation will be updated to reflect pnpm, new ports, startup chores, and Docker behavior.

## User Stories

1. As a developer, I want the repository to use pnpm workspaces, so that package installation and workspace dependency management are consistent.
2. As a developer, I want npm lockfiles and npm command assumptions removed, so that the repo does not drift between package managers.
3. As a developer, I want deployable apps separated from shared libraries, so that frontend, backend, and shared contracts have clear ownership.
4. As a developer, I want package names under an internal Cellar scope, so that workspace imports are explicit and collision-resistant.
5. As a developer, I want Next.js removed completely, so that the app no longer depends on Next-specific runtime behavior or tooling.
6. As a developer, I want a React + Vite frontend, so that frontend development uses a lightweight SPA toolchain.
7. As a developer, I want a Hono backend, so that API and static serving behavior are explicit and framework-minimal.
8. As a developer, I want the frontend to be a pure SPA, so that Hono can focus on APIs and static asset hosting.
9. As a developer, I want React Router to preserve current public URLs, so that users and tests do not need to learn new routes.
10. As a user, I want the root URL to continue taking me to the dashboard, so that existing navigation behavior is preserved.
11. As a signed-out user, I want protected routes to redirect me to sign in with a callback URL, so that I can return to my intended destination after authentication.
12. As a signed-in user, I want auth pages to redirect me to the dashboard, so that I do not see sign-in or sign-up forms unnecessarily.
13. As a developer, I want route-level frontend UI to live in React Router route modules, so that page structure is explicit without mimicking Next filesystem routing.
14. As a developer, I want reusable components separate from route modules, so that component ownership remains clear.
15. As a developer, I want React Router route objects, so that protected layouts and auth layouts can be modeled explicitly.
16. As a user, I want dashboard, assets, collections, settings, sign-in, and sign-up flows to continue working, so that the framework migration does not remove product behavior.
17. As a user, I want page loading states while data loads client-side, so that SPA navigation remains understandable.
18. As a developer, I want TanStack Query to manage all server state, so that reads, mutations, cache invalidation, loading states, and errors are handled consistently.
19. As a developer, I want Hono RPC for frontend/backend calls, so that API usage is typed without introducing a heavier API framework.
20. As a developer, I want application RPC routes under a dedicated API namespace, so that typed app APIs do not conflict with auth, upload, file, or health endpoints.
21. As a developer, I want resource-oriented RPC paths and HTTP methods, so that network logs and backend behavior remain easy to understand.
22. As a user, I want asset CRUD operations to keep working, so that I can create, view, update, delete, filter, search, and pin assets.
23. As a user, I want collection CRUD operations to keep working, so that I can create, view, update, delete, and pin collections.
24. As a user, I want asset membership in collections to keep working, so that I can add assets to and remove assets from collections.
25. As a user, I want dashboard data to keep working, so that pinned and recent content remains visible.
26. As a developer, I want mutation success to invalidate relevant queries, so that the UI refreshes without Next revalidation.
27. As a developer, I want structured API error responses, so that client error handling is predictable.
28. As a developer, I want Zod validation on Hono routes, so that API inputs are validated consistently at the boundary.
29. As a developer, I want shared API schemas and DTOs, so that frontend and backend agree on request and response contracts.
30. As a developer, I want Prisma to remain server-only, so that database-generated code is not bundled into the browser.
31. As a developer, I want shared asset type definitions independent of Prisma, so that public contracts do not leak database implementation details.
32. As a developer, I want ID validation to match current CUID database IDs, so that valid records are not rejected by new route validation.
33. As a developer, I want response dates serialized as ISO strings, so that API JSON behavior is explicit and stable.
34. As a developer, I want services separated from Hono route definitions, so that business logic can be tested without HTTP request plumbing.
35. As a developer, I want reusable auth middleware, so that protected backend routes consistently load the current user and return 401 when needed.
36. As a user, I want Better Auth sign-in, sign-up, sign-out, social login, and session behavior preserved, so that authentication continues working.
37. As an OIDC relying party, I want OIDC provider behavior and discovery metadata URLs preserved, so that integrations do not break.
38. As an operator, I want first-party OIDC clients synchronized on startup, so that auth configuration data stays aligned with code configuration.
39. As an operator, I want startup migrations to run before the server listens, so that the app does not serve traffic against an unmigrated database.
40. As an operator, I want database seeding to be opt-in, so that production data is not modified accidentally on container restart.
41. As an operator, I want seed behavior to be idempotent and non-destructive, so that enabling startup seed does not delete existing data.
42. As an operator, I want startup env validation, so that misconfiguration fails clearly before the app starts.
43. As an operator, I want a startup report with masked secrets, so that runtime diagnostics are visible without leaking sensitive values.
44. As an operator, I want a health endpoint, so that deployment tooling can check whether the service is running.
45. As a user, I want uploads to keep using authenticated local filesystem storage, so that current file behavior remains unchanged.
46. As a user, I want uploaded files to remain protected by ownership checks, so that private files are not exposed publicly.
47. As a developer, I want upload security checks preserved, so that file size, type, content, path traversal, and unsafe inline content protections remain in place.
48. As a developer, I want frontend API calls to use same-origin relative URLs, so that cookies work consistently in dev and production.
49. As a developer, I want Vite to proxy API calls to Hono in development, so that I get fast frontend HMR without CORS complexity.
50. As a developer, I want local development ports standardized to 7000 for Vite and 7001 for Hono, so that all tools and auth settings use the same origin assumptions.
51. As an operator, I want production Hono to default to port 7000 while respecting an override, so that Docker works by default and platforms can still inject ports.
52. As an operator, I want Hono to serve built frontend assets, so that one app container contains both backend and frontend.
53. As a user, I want deep links to frontend routes to work in production, so that refreshing a SPA route does not 404.
54. As a developer, I want API unknown routes to return JSON 404s, so that API failures are distinct from SPA fallback behavior.
55. As a developer, I want static assets served with appropriate cache and security headers, so that production serving is safe and efficient.
56. As a developer, I want basic security headers from Hono, so that the migration does not rely on implicit framework defaults.
57. As a designer, I want Storybook preserved, so that the design system remains the foundation for UI work.
58. As a developer, I want Storybook to use the React Vite framework, so that it no longer depends on Next.js.
59. As a developer, I want Storybook to live with the frontend app, so that stories and web components share the same runtime assumptions.
60. As a developer, I want Storybook to provide React Router context globally, so that route-aware components render naturally in stories.
61. As a developer, I want Storybook Vitest integration preserved, so that story-based tests continue to provide coverage.
62. As a developer, I want frontend components to replace Next image, link, navigation, font, dynamic import, and metadata behavior with Vite/React equivalents, so that no Next imports remain.
63. As a user, I want visual styling and fonts preserved, so that the app still looks like Cellar after the framework migration.
64. As a developer, I want Tailwind and PostCSS configuration owned by the web app, so that browser styling does not live at the root unnecessarily.
65. As a developer, I want obsolete Next sample assets removed, so that public assets reflect the real application.
66. As a developer, I want React Compiler kept if compatible, so that existing compiler assumptions are preserved.
67. As a developer, I want frontend Storybook detection to avoid browser `process.env`, so that Vite browser code stays valid.
68. As a developer, I want TypeScript configs split by workspace with a shared base, so that each package can target its own runtime correctly.
69. As a developer, I want the shared package built to ESM declarations, so that both apps can consume it reliably.
70. As a developer, I want the server compiled with TypeScript emit, so that Docker runs JavaScript rather than TypeScript source in production.
71. As a developer, I want local import aliases in each workspace, so that imports stay ergonomic without confusing package boundaries.
72. As a developer, I want package-owned dependencies, so that each workspace declares what it imports and avoids hidden hoisting assumptions.
73. As a developer, I want current major dependency versions preserved where possible, so that the framework migration does not also become a broad dependency upgrade.
74. As an operator, I want Docker to use the pinned pnpm version through Corepack, so that builds match local package-manager behavior.
75. As an operator, I want Docker to keep Node 24 slim, so that the base runtime does not change unnecessarily.
76. As an operator, I want the production compose file updated for port 7000 and startup chores, so that deployment matches the new architecture.
77. As a developer, I want optional Storybook Docker serving on the standard Storybook port, so that UI review remains available without conflating it with the app runtime.
78. As a developer, I want Husky and lint-staged to use pnpm commands, so that strict pnpm is respected across hooks.
79. As a developer, I want linting to replace Next-specific rules with TypeScript, React, Storybook, and server-appropriate rules, so that lint coverage remains useful after Next removal.
80. As a developer, I want tests split by workspace, so that test ownership follows code ownership.
81. As a developer, I want root E2E tests to remain integrated-system tests, so that the complete built web+server app is validated.
82. As a developer, I want E2E to run against a production-like build, so that the Hono static-hosting model is tested.
83. As a developer, I want full verification before completion, so that the big-bang migration is validated across install, format, lint, tests, Storybook, build, E2E, and Docker where feasible.
84. As a developer, I want documentation updated, so that future contributors know the pnpm commands, ports, Docker targets, env flags, and startup behavior.

## Implementation Decisions

- Perform a big-bang migration rather than a staged migration.
- Use pnpm workspaces with deployable app workspaces and reusable package workspaces.
- Use `@cellar/*` package names for internal workspaces.
- Enforce pnpm strictly through package-manager metadata, workspace configuration, pnpm scripts, and removal of npm lockfile assumptions.
- Pin pnpm to a current 10.x version.
- Use root scripts that delegate with pnpm filters and recursive commands.
- Use pnpm parallel execution for the root development command instead of adding a separate process orchestration dependency.
- Build a pure React + Vite SPA for the frontend.
- Use React Router for frontend routing, with explicit route objects and route-level UI modules.
- Preserve current public page URLs and root redirect behavior.
- Use client-side protected route guards based on a session query.
- Use client-side loading states for page data instead of server-prefetched initial data.
- Use Hono on Node as the backend runtime.
- Use Hono RPC plus TanStack Query for typed API calls, server state, mutations, loading states, and cache invalidation.
- Put application RPC routes under a dedicated API namespace while keeping auth, upload, file, and health routes explicit.
- Use resource-oriented RPC paths and HTTP methods.
- Cover all existing asset, collection, dashboard, pin, and collection-membership server-action behavior in the Hono RPC surface.
- Standardize API errors as structured error objects with code, message, and optional validation details.
- Use Hono Zod validation middleware with schemas from the shared contracts package.
- Keep Prisma entirely server-only.
- Generate Prisma client code under the server workspace.
- Define public enums, DTOs, request schemas, response schemas, query schemas, and pure contract utilities in the shared package.
- Keep the shared package contracts-only and exclude React, Prisma, filesystem, auth client, and server-only code.
- Keep auth and settings form schemas in the web app unless directly validated by Hono APIs.
- Represent asset types as a shared Zod string enum and derived TypeScript union.
- Validate asset and collection IDs as CUID-compatible identifiers rather than UUIDs.
- Serialize response dates as ISO strings in API DTOs.
- Split backend logic into route definitions and services.
- Use reusable Hono auth middleware to attach session/user context for protected routes.
- Preserve Better Auth, email/password auth, GitHub login, JWT plugin, OAuth/OIDC provider behavior, cookie prefix behavior, and the existing auth base path.
- Preserve current OIDC discovery metadata routes.
- Preserve existing OIDC client redirect URIs unless they represent this app’s own origin.
- Run OIDC first-party client sync by default on startup after migrations.
- Run database migrations by default on startup before the server listens.
- Make database seeding opt-in with an environment flag.
- Rewrite seed behavior to be idempotent and non-destructive before allowing startup seed usage.
- Include Prisma CLI in the server runtime image because the app runs migrations on startup.
- Validate server environment variables with Zod at startup.
- Preserve and update the startup report with port 7000 defaults and startup chore settings while masking secrets.
- Add a lightweight unauthenticated health endpoint.
- Keep local filesystem uploads under the configured upload directory.
- Keep upload rules and enforcement server-only.
- Preserve authenticated file serving and path/content security protections.
- Use relative same-origin frontend API calls and rely on the Vite dev proxy.
- Standardize local development on Vite port 7000 and Hono port 7001.
- Default production Hono to port 7000 while respecting an environment override.
- Build frontend static assets with Vite and copy them into the server runtime public directory.
- Serve static assets from Hono and use SPA fallback for non-API GET routes.
- Return JSON 404s for unknown API routes.
- Add basic Hono security headers but defer strict CSP.
- Move Storybook into the web workspace.
- Switch Storybook from the Next Vite framework to the React Vite framework.
- Add a global React Router decorator for Storybook.
- Preserve Storybook Vitest integration.
- Keep Storybook as local/CI tooling and optional Docker target, not part of the production app runtime.
- Serve the optional Storybook Docker target internally on port 6006.
- Replace Next image behavior with standard image elements.
- Replace Next font behavior with Google Fonts links or CSS imports.
- Replace Next dynamic import behavior with React lazy loading and Suspense.
- Replace Next metadata and generated icon behavior with static assets and standard Vite HTML metadata.
- Replace Next query-state integration with React Router search params.
- Keep React Compiler enabled in Vite if compatible.
- Move Tailwind, PostCSS, and global browser CSS ownership into the web app.
- Remove obsolete Next/Vercel sample public assets.
- Remove all Next-specific files, dependencies, imports, mocks, and configuration.
- Use a root base TypeScript config plus package-local TypeScript configs.
- Build the shared package to ESM JavaScript and declaration output.
- Build the server with TypeScript emit to ESM JavaScript and run it with Node.
- Use local aliases inside each workspace and package-name imports across workspace boundaries.
- Allow the web app to import the server Hono app type as a type-only dependency for RPC inference.
- Assign dependencies to the package that imports them and keep root dependencies limited to true workspace-level tooling.
- Preserve current major dependency versions where possible and only add required new dependencies for Hono, React Router, TanStack Query, pnpm, and related tooling.
- Keep Docker based on Node 24 slim.
- Use Corepack in Docker to activate the pinned pnpm package manager.
- Produce one production app Docker image containing the Hono backend and built Vite frontend.
- Keep an optional Storybook Docker target.
- Update production compose to rely on app startup chores and port 7000 instead of separate migration/auth-sync services.
- Update Husky hooks to use pnpm commands.
- Replace Next-specific ESLint config with TypeScript, React, Storybook, Prettier, and server-appropriate linting.
- Split tests by workspace ownership.
- Keep Playwright E2E at the repository root targeting port 7000.
- Run E2E against a production-like built app.
- Update documentation for pnpm, workspaces, ports, Docker, environment variables, startup chores, and verification commands.

## Testing Decisions

- Tests should focus on external behavior and stable contracts rather than implementation details.
- API/service tests should verify observable backend behavior: authorization, validation failures, successful CRUD operations, ownership checks, upload/file behavior, mutation side effects, and structured errors.
- Shared package tests should verify schemas, DTO parsing, enum values, ID validation, and date contract expectations.
- Web tests should verify route guards, navigation behavior, form behavior, loading/error states, TanStack Query mutation outcomes, and component rendering without mocking Next modules.
- Storybook tests should continue validating design-system components through the Storybook Vitest addon after the move to React Vite Storybook.
- E2E tests should validate the integrated production-like app served on port 7000, including auth setup, protected routes, navigation, assets, collections, uploads where practical, and SPA deep-link refresh behavior.
- Startup chore tests should verify migration/seed/OIDC sync orchestration decisions without requiring destructive production-like side effects.
- Env validation tests should verify clear failures for missing or invalid required configuration.
- File-serving tests should preserve prior coverage around authenticated access, path traversal protection, content headers, and not-found behavior.
- Existing server-action tests provide prior art for assets and collections business behavior, but should be adapted to service/API tests without Next cache or server-action mocks.
- Existing upload route tests provide prior art for file validation and should be adapted to Hono route/service tests.
- Existing startup report tests provide prior art for masked diagnostics and should be updated for Hono startup defaults.
- Existing auth and OIDC tests provide prior art for Better Auth config, first-party client sync, and OIDC metadata behavior.
- Existing component and Storybook tests provide prior art for UI behavior and should be moved with frontend code into the web workspace.
- Verification for completion should include install, format check, lint, unit tests, Storybook tests/build, app build, production-like E2E when the local database and environment are available, and Docker build when feasible.

## Out of Scope

- Replacing Better Auth with a different auth provider.
- Redesigning the auth data model.
- Removing OAuth/OIDC provider behavior.
- Moving uploads to object storage.
- Introducing SSR or Hono-rendered React pages.
- Adding a strict Content Security Policy during the migration.
- Redesigning product routes or user-facing URL structure.
- Redesigning the asset or collection domain model.
- Broad dependency upgrades beyond what is required for the migration.
- Adding a full task runner such as Turbo or Nx.
- Creating a separate UI package for the design system.
- Supporting npm and pnpm simultaneously.
- Running destructive seed behavior automatically.
- Changing existing OIDC relying-party redirect URIs unless separately requested.
- Implementing image optimization to replace Next Image.
- Implementing server-side data prefetch/hydration for the SPA.

## Workspace Layout

Repository root after migration:

```
cellar/
├── apps/
│   ├── web/                  # @cellar/web — React + Vite SPA + Storybook
│   │   ├── src/
│   │   │   ├── routes/       # React Router route modules (page-level UI)
│   │   │   ├── components/   # moved from src/components
│   │   │   ├── hooks/        # moved from src/hooks
│   │   │   ├── lib/          # browser-only utilities (auth-client, query client, rpc client)
│   │   │   ├── schemas/      # web-only form schemas (auth, settings)
│   │   │   ├── stories/      # Storybook decorators, preview config
│   │   │   ├── styles/       # globals.css, tailwind entry
│   │   │   └── main.tsx
│   │   ├── public/           # favicon, static images (no Next/Vercel sample assets)
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── postcss.config.js
│   │   ├── tailwind.config.ts
│   │   ├── .storybook/
│   │   └── package.json
│   └── server/               # @cellar/server — Hono backend
│       ├── src/
│       │   ├── routes/       # Hono route definitions (api, auth, files, upload, health)
│       │   ├── services/     # business logic (assets, collections, dashboard, uploads)
│       │   ├── middleware/   # auth, error, validation
│       │   ├── lib/          # prisma client, auth, oidc, startup-report, env
│       │   ├── startup/      # migrations, oidc-sync, seed, env-validation orchestration
│       │   ├── app.ts        # builds the Hono app (exported type for RPC inference)
│       │   └── index.ts      # entry: env validate → migrate → oidc sync → listen
│       ├── prisma/           # schema.prisma, migrations/, seed.ts (moved from root)
│       ├── generated/prisma/ # Prisma client output (server-local, not shared)
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   └── shared/               # @cellar/shared — contracts only, no runtime deps on Prisma/React
│       ├── src/
│       │   ├── enums.ts          # AssetType union + Zod enum
│       │   ├── schemas/          # Zod request/response/query schemas
│       │   ├── dto/              # response DTO types (dates as ISO strings)
│       │   ├── ids.ts            # CUID-compatible ID schema
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
├── e2e/                      # Playwright tests, unchanged location, target port 7000
├── tsconfig.base.json        # shared compiler options
├── pnpm-workspace.yaml
├── package.json              # root: scripts only, devDeps for husky/lint-staged/prettier
├── pnpm-lock.yaml
├── Dockerfile                # multi-stage: deps → web-build → server-build → runner [+ storybook target]
└── docker-compose.prod.yml
```

Workspace package names (final, used for cross-workspace imports):

- `@cellar/web` — frontend SPA, not published, private
- `@cellar/server` — backend, not published, private
- `@cellar/shared` — contracts package, not published, private, built to `dist/` ESM + `.d.ts`

Cross-workspace import rules:

- Web imports `@cellar/shared` for schemas/DTOs/enums and imports the server's exported app type as `import type { AppType } from '@cellar/server/app'` for Hono RPC inference only — no runtime import of server code.
- Server imports `@cellar/shared` for schemas/DTOs.
- Shared imports nothing from `@cellar/web` or `@cellar/server` and has no `prisma`, `react`, or `fs` runtime deps.
- Inside a workspace, use a local alias (e.g. `~/`) for self-imports; cross-workspace always uses the package name.

## Frontend Route Inventory

All routes below are React Router v7 routes inside `apps/web/src/routes/`. Public URLs are preserved exactly. The route tree uses two layout routes — a protected layout that requires a session and an auth layout that redirects authenticated users to the dashboard. Unauthenticated visits to a protected route redirect to `/sign-in?callbackUrl=<original-pathname-and-search>`; authenticated visits to `/sign-in` or `/sign-up` redirect to `/dashboard` (preserving any `callbackUrl` search param).

| URL                | Source (Next)                             | New route module               | Layout    | Notes                                                                                             |
| ------------------ | ----------------------------------------- | ------------------------------ | --------- | ------------------------------------------------------------------------------------------------- |
| `/`                | `src/app/page.tsx`                        | `routes/index.tsx`             | none      | Redirects to `/dashboard`                                                                         |
| `/dashboard`       | `src/app/(app)/dashboard/page.tsx`        | `routes/dashboard.tsx`         | protected | Uses `getDashboardData` RPC                                                                       |
| `/assets`          | `src/app/(app)/assets/page.tsx`           | `routes/assets/index.tsx`      | protected | Filter/sort/search via `useSearchParams`                                                          |
| `/assets/new`      | `src/app/(app)/assets/new/page.tsx`       | `routes/assets/new.tsx`        | protected |                                                                                                   |
| `/assets/:id`      | `src/app/(app)/assets/[id]/page.tsx`      | `routes/assets/$id.tsx`        | protected |                                                                                                   |
| `/assets/:id/edit` | `src/app/(app)/assets/[id]/edit/page.tsx` | `routes/assets/$id.edit.tsx`   | protected |                                                                                                   |
| `/collections`     | `src/app/(app)/collections/page.tsx`      | `routes/collections/index.tsx` | protected |                                                                                                   |
| `/collections/:id` | `src/app/(app)/collections/[id]/page.tsx` | `routes/collections/$id.tsx`   | protected |                                                                                                   |
| `/settings`        | `src/app/(app)/settings/page.tsx`         | `routes/settings.tsx`          | protected |                                                                                                   |
| `/sign-in`         | `src/app/(auth)/sign-in/page.tsx`         | `routes/auth/sign-in.tsx`      | auth      | Preserves OIDC query params (existing behavior)                                                   |
| `/sign-up`         | `src/app/(auth)/sign-up/page.tsx`         | `routes/auth/sign-up.tsx`      | auth      |                                                                                                   |
| `/consent`         | not yet implemented                       | `routes/auth/consent.tsx`      | auth      | Referenced by Better Auth oauthProvider `consentPage`; create as a stub if no current page exists |

The Next layouts `src/app/(app)/layout.tsx` and `src/app/(auth)/layout.tsx` become the two React Router layout route components.

## Backend Endpoint Inventory

All endpoints are mounted on the single Hono app at `apps/server/src/app.ts`. Application RPC lives under `/api/v1/*` (this is the dedicated namespace referenced in decision #20 / story #20). Auth, files, upload, OIDC discovery, and health are kept at their existing or canonical paths so no external integrations break.

### Application RPC — `/api/v1/*` (Hono RPC, JSON, auth-required)

Each row maps a current server action to its new endpoint. All protected endpoints go through the auth middleware and return a structured 401 if no session. All inputs are validated by `@hono/zod-validator` against schemas in `@cellar/shared`. All response dates are ISO strings.

| Method | Path                                                | Replaces                    | Request shape                                  | Response shape                                                                                                                             |
| ------ | --------------------------------------------------- | --------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| GET    | `/api/v1/dashboard`                                 | `getDashboardData`          | none                                           | `{ pinnedAssets: AssetDTO[], pinnedCollections: CollectionWithCountDTO[], recentAssets: AssetDTO[] }`                                      |
| GET    | `/api/v1/assets`                                    | `getAssets`                 | query: `{ type?, sort?, q?, limit?, offset? }` | `AssetDTO[]`                                                                                                                               |
| POST   | `/api/v1/assets`                                    | `createAsset`               | body: `CreateAssetInput`                       | `AssetDTO`                                                                                                                                 |
| GET    | `/api/v1/assets/:id`                                | `getAsset`                  | param `id` (CUID)                              | `AssetWithCollectionsDTO \| null`                                                                                                          |
| PATCH  | `/api/v1/assets/:id`                                | `updateAsset`               | body: `UpdateAssetInput`                       | `AssetDTO`                                                                                                                                 |
| DELETE | `/api/v1/assets/:id`                                | `deleteAsset`               | none                                           | `{ ok: true }`                                                                                                                             |
| POST   | `/api/v1/assets/:id/pin`                            | `togglePin`                 | none                                           | `{ pinned: boolean }`                                                                                                                      |
| GET    | `/api/v1/collections`                               | `getCollections`            | none                                           | `CollectionWithCountDTO[]`                                                                                                                 |
| POST   | `/api/v1/collections`                               | `createCollection`          | body: `CreateCollectionInput`                  | `CollectionDTO`                                                                                                                            |
| GET    | `/api/v1/collections/:id`                           | `getCollection`             | param `id`                                     | `CollectionWithAssetsDTO \| null`                                                                                                          |
| PATCH  | `/api/v1/collections/:id`                           | `updateCollection`          | body: `UpdateCollectionInput`                  | `CollectionDTO`                                                                                                                            |
| DELETE | `/api/v1/collections/:id`                           | `deleteCollection`          | none                                           | `{ ok: true }`                                                                                                                             |
| POST   | `/api/v1/collections/:id/pin`                       | `toggleCollectionPin`       | none                                           | `{ pinned: boolean }`                                                                                                                      |
| PUT    | `/api/v1/collections/:collectionId/assets/:assetId` | `addAssetToCollection`      | none                                           | `{ ok: true }`                                                                                                                             |
| DELETE | `/api/v1/collections/:collectionId/assets/:assetId` | `removeAssetFromCollection` | none                                           | `{ ok: true }`                                                                                                                             |
| GET    | `/api/v1/session`                                   | `getUser` (web-side helper) | none                                           | `{ user: UserDTO } \| null` (200 in both cases; null for unauthenticated — the SPA uses this to drive route guards without redirect loops) |

Cache-invalidation behavior previously handled by `revalidatePath` is replaced by TanStack Query invalidation. The migration must replicate the existing invalidations — for each mutation, the equivalent `queryClient.invalidateQueries` calls:

| Mutation                                         | Invalidates query keys                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------- |
| createAsset                                      | `['assets']`, `['dashboard']`                                             |
| updateAsset                                      | `['assets']`, `['assets', id]`, `['dashboard']`, `['collections']`        |
| deleteAsset                                      | `['assets']`, `['dashboard']`                                             |
| togglePin                                        | `['assets']`, `['assets', id]`, `['dashboard']`                           |
| createCollection                                 | `['collections']`, `['dashboard']`                                        |
| updateCollection                                 | `['collections']`, `['collections', id]`, `['dashboard']`                 |
| deleteCollection                                 | `['collections']`, `['dashboard']`                                        |
| toggleCollectionPin                              | `['collections']`, `['collections', id]`, `['dashboard']`                 |
| addAssetToCollection / removeAssetFromCollection | `['collections']`, `['collections', collectionId]`, `['assets', assetId]` |

### Auth, files, upload, OIDC, health (non-RPC)

These keep their current external paths so Better Auth, OIDC relying parties, and existing browser/upload code continue to work.

| Method | Path                                               | Replaces                                                           | Notes                                                                                                                                                                                                                   |
| ------ | -------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ALL    | `/api/auth/*`                                      | `src/app/api/auth/[...all]/route.ts`                               | Mount Better Auth handler (`auth.handler`). `AUTH_BASE_PATH` constant stays `/api/auth`.                                                                                                                                |
| GET    | `/api/auth/.well-known/openid-configuration`       | `src/app/api/auth/.well-known/openid-configuration/route.ts`       | Same `oauthProviderOpenIdConfigMetadata` adapter.                                                                                                                                                                       |
| GET    | `/.well-known/oauth-authorization-server/api/auth` | `src/app/.well-known/oauth-authorization-server/api/auth/route.ts` | Same `oauthProviderAuthServerMetadata` adapter; preserve exact path — relying parties use it.                                                                                                                           |
| POST   | `/api/upload`                                      | `src/app/api/upload/route.ts`                                      | Multipart upload, auth-required, preserve all existing security checks (size, extension allowlist, magic-number content validation, SVG dangerous-content scan, path traversal protection, per-user directory scoping). |
| GET    | `/api/files/*`                                     | `src/app/api/files/[...path]/route.ts`                             | Auth-required, ownership check (`path` must start with `<userId>/`), path traversal protection, content-type from extension.                                                                                            |
| GET    | `/api/health`                                      | (new)                                                              | Unauthenticated. `200 { status: "ok" }`. Story #44.                                                                                                                                                                     |
| GET    | `/api/*` (unmatched)                               | (new)                                                              | JSON 404 — must run before SPA fallback. Story #54.                                                                                                                                                                     |
| GET    | any other path                                     | n/a                                                                | SPA fallback: serve `index.html`. Static assets served from the build output directory with appropriate cache and security headers. Stories #52, #53, #55, #56.                                                         |

### Structured error response shape

All Hono routes (RPC and non-RPC except Better Auth's own handler, which keeps its own error shape) return errors as:

```json
{
  "error": {
    "code": "VALIDATION_FAILED" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "PAYLOAD_TOO_LARGE" | "UNSUPPORTED_MEDIA_TYPE" | "INTERNAL",
    "message": "human-readable message",
    "details": [{ "path": "field.path", "message": "..." }]   // optional, only on VALIDATION_FAILED
  }
}
```

HTTP status codes: 400 for `VALIDATION_FAILED`, 401 for `UNAUTHORIZED`, 403 for `FORBIDDEN`, 404 for `NOT_FOUND`, 409 for `CONFLICT`, 413 for `PAYLOAD_TOO_LARGE`, 415 for `UNSUPPORTED_MEDIA_TYPE`, 500 for `INTERNAL`. The current "Resource not found or access denied" string from server actions maps to `NOT_FOUND` (return 404, not 403, to avoid leaking ownership information — same posture as today).

## Auth Migration Detail

Better Auth currently runs through a Next.js handler (`toNextJsHandler(auth)`) and reads cookies via `next/headers`. Replacing Next requires re-mounting Better Auth onto Hono and replacing the request-context helpers, while preserving every observable auth behavior.

### Server-side mount

Replace the contents of `apps/server/src/routes/auth.ts`:

```ts
import { Hono } from 'hono';
import { auth } from '../lib/auth';

export const authRouter = new Hono();
authRouter.on(['GET', 'POST'], '/*', c => auth.handler(c.req.raw));
```

Mount on the main app at `/api/auth` so `AUTH_BASE_PATH` (currently `'/api/auth'` in [auth-config.ts](src/lib/auth-config.ts)) and `BETTER_AUTH_URL` semantics are unchanged. Better Auth's WHATWG-Fetch `auth.handler(request: Request)` already accepts the standard `Request` object that Hono exposes as `c.req.raw`, so no additional adapter is needed and `better-auth/next-js` must be removed.

### OIDC discovery routes

Two routes use Better Auth oauth-provider adapters that take an `auth` instance and return a request handler. They keep their current paths (story #37: external relying parties depend on them) and move to Hono as:

```ts
// apps/server/src/routes/oidc-discovery.ts
import { Hono } from 'hono';
import {
  oauthProviderAuthServerMetadata,
  oauthProviderOpenIdConfigMetadata,
} from '@better-auth/oauth-provider';
import { auth } from '../lib/auth';

export const oidcDiscoveryRouter = new Hono();

const authServerHandler = oauthProviderAuthServerMetadata(auth as never);
const openIdHandler = oauthProviderOpenIdConfigMetadata(auth as never);

oidcDiscoveryRouter.get('/.well-known/oauth-authorization-server/api/auth', c =>
  authServerHandler(c.req.raw)
);
oidcDiscoveryRouter.get('/api/auth/.well-known/openid-configuration', c =>
  openIdHandler(c.req.raw)
);
```

These adapters return `Response`, so the Hono handler can return them directly. The exact paths above must be preserved character-for-character.

### Session helper (replaces `next/headers`)

Replace [src/lib/session.ts](src/lib/session.ts) with a Hono-context-based helper:

```ts
// apps/server/src/lib/session.ts
import type { Context } from 'hono';
import { auth } from './auth';

export async function getSession(c: Context) {
  return auth.api.getSession({ headers: c.req.raw.headers });
}

export async function requireUser(c: Context) {
  const session = await getSession(c);
  if (!session?.user) {
    throw new HttpError('UNAUTHORIZED', 'Authentication required', 401);
  }
  return session.user;
}
```

Where `HttpError` is the structured error class introduced for the error taxonomy in the Backend Endpoint Inventory section. `requireUser` is the only user-fetch helper called from services — services receive the `User` object as an argument rather than reading from request-local storage, which preserves the testability of today's server actions.

### Auth middleware

```ts
// apps/server/src/middleware/require-auth.ts
import { createMiddleware } from 'hono/factory';
import { requireUser } from '../lib/session';

export const requireAuth = createMiddleware<{ Variables: { user: User } }>(async (c, next) => {
  const user = await requireUser(c);
  c.set('user', user);
  await next();
});
```

Applied to the `/api/v1/*` router, the upload route, and the file-serving route. Not applied to `/api/auth/*` (Better Auth manages its own auth state), the OIDC discovery routes, or `/api/health`.

### Cookies and trusted origins

Behavior preserved exactly — these are already abstracted in [auth-config.ts](src/lib/auth-config.ts) and that file moves to `apps/server/src/lib/auth-config.ts` unchanged:

- `cookiePrefix` stays driven by `getAuthCookiePrefix(env)` (`'cellar'` in normal mode, `'cellar-test'` when `E2E_TEST_MODE === 'true'`).
- Session cookie names from `getAuthSessionCookieNames` (`<prefix>.session_token` and `__Secure-<prefix>.session_token`) remain unchanged.
- `disableCSRFCheck` is still gated on `E2E_TEST_MODE === 'true'` with the same console warning emitted from [auth.ts](src/lib/auth.ts).
- `trustedOrigins` is still computed from `BETTER_AUTH_URL` plus first-party client origins via `getTrustedOrigins`.
- The 32-character minimum check on `BETTER_AUTH_SECRET` moves into the new env-validation Zod schema (described in the Startup section below) but produces the same fatal error.

Because Vite dev runs the SPA on `:7000` and Hono on `:7001`, with the Vite proxy forwarding `/api/*` and `/.well-known/*` to Hono, the browser sees same-origin requests at `:7000` and cookies are set on that origin. `BETTER_AUTH_URL` should be set to `http://localhost:7000` in dev (not `:7001`) so the auth issuer, redirects, and trusted-origin checks all use the user-facing origin. In production both backend and frontend share `:7000` so this is naturally aligned.

### JWT plugin and JWKS

The `jwt` plugin from `better-auth/plugins/jwt` is preserved with the same `EdDSA`/`Ed25519` key-pair config. JWKS endpoint paths are owned by Better Auth and are served automatically via the `/api/auth/*` mount — no additional Hono route is needed. Issuer remains `getCanonicalAuthIssuer(env)`.

### Frontend auth client

[src/lib/auth-client.ts](src/lib/auth-client.ts) moves to `apps/web/src/lib/auth-client.ts` unchanged — `better-auth/react` is browser-only and has no Next dependency. `useSession`, `signIn`, `signUp`, `signOut`, and `oauthProviderClient` continue to work identically. The auth client makes same-origin requests to `/api/auth/*` which the Vite proxy (dev) or Hono (prod) handles.

The SPA's session-driven route guards use `/api/v1/session` (defined in the Backend Endpoint Inventory) wrapped in a TanStack Query hook with key `['session']`. After `signIn`/`signOut` complete, the mutation handler invalidates `['session']` and any data queries.

### Startup OIDC sync

`syncFirstPartyClients` from [src/lib/oidc/sync-clients.ts](src/lib/oidc/sync-clients.ts) moves to `apps/server/src/lib/oidc/sync-clients.ts` unchanged in behavior. The standalone `scripts/sync-oidc-clients.ts` and the `auth-sync-clients` compose service are removed; the call is invoked from the in-process startup sequence (described in the Startup section) after migrations and before `serve()`.

### What does NOT move

- `better-auth/next-js` — removed.
- `next/headers` — removed; replaced by `c.req.raw.headers`.
- `src/app/api/auth/[...all]/route.ts` — replaced by the Hono catch-all above.
- The two OIDC discovery `route.ts` files — replaced by handlers in `oidc-discovery.ts`.
- `scripts/sync-oidc-clients.ts` and the `auth-sync-clients` compose service — replaced by in-process startup sync.

## Behavior-Preservation Source of Truth

For every "preserve existing behavior" item, the table below names the current file(s) the agent must read before writing the replacement, and the file path the replacement should occupy after migration. Absent test coverage of equivalent behavior in the new tree is itself a migration bug — see the Test Migration section.

| Behavior                              | Current source                                                                                                                       | New location                                                                                                   | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Better Auth options builder           | [src/lib/auth-config.ts](src/lib/auth-config.ts)                                                                                     | `apps/server/src/lib/auth-config.ts`                                                                           | Move unchanged. Exports `AUTH_BASE_PATH`, `getCanonicalAuthIssuer`, `getAuthCookiePrefix`, `getAuthSessionCookieNames`, `buildAuthOptions`.                                                                                                                                                                                                                                                                                                                                      |
| Better Auth instance + secret check   | [src/lib/auth.ts](src/lib/auth.ts)                                                                                                   | `apps/server/src/lib/auth.ts`                                                                                  | Replace the throw on missing `BETTER_AUTH_SECRET` with the central env-validation Zod schema; preserve the `>=32` length check and the E2E CSRF warning log.                                                                                                                                                                                                                                                                                                                     |
| Auth client (browser)                 | [src/lib/auth-client.ts](src/lib/auth-client.ts)                                                                                     | `apps/web/src/lib/auth-client.ts`                                                                              | Move unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Session helper                        | [src/lib/session.ts](src/lib/session.ts)                                                                                             | `apps/server/src/lib/session.ts`                                                                               | Rewrite per Auth Migration Detail (Hono context instead of `next/headers`).                                                                                                                                                                                                                                                                                                                                                                                                      |
| First-party client manifest           | [src/lib/oidc/first-party-clients.ts](src/lib/oidc/first-party-clients.ts)                                                           | `apps/server/src/lib/oidc/first-party-clients.ts`                                                              | Move unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| First-party client sync               | [src/lib/oidc/sync-clients.ts](src/lib/oidc/sync-clients.ts)                                                                         | `apps/server/src/lib/oidc/sync-clients.ts`                                                                     | Move unchanged. Standalone `scripts/sync-oidc-clients.ts` is deleted; sync runs in-process at startup (see Startup Orchestration).                                                                                                                                                                                                                                                                                                                                               |
| OIDC discovery — auth-server metadata | [src/app/.well-known/oauth-authorization-server/api/auth/route.ts](src/app/.well-known/oauth-authorization-server/api/auth/route.ts) | `apps/server/src/routes/oidc-discovery.ts`                                                                     | Mounted at `/.well-known/oauth-authorization-server/api/auth`. Path preserved exactly.                                                                                                                                                                                                                                                                                                                                                                                           |
| OIDC discovery — openid-configuration | [src/app/api/auth/.well-known/openid-configuration/route.ts](src/app/api/auth/.well-known/openid-configuration/route.ts)             | same `oidc-discovery.ts` file                                                                                  | Mounted at `/api/auth/.well-known/openid-configuration`.                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Cellar OIDC verifier (test prior art) | [src/lib/oidc/cellar-oidc.test.ts](src/lib/oidc/cellar-oidc.test.ts)                                                                 | `apps/server/src/lib/oidc/cellar-oidc.test.ts`                                                                 | Tests must keep passing; OIDC discovery URLs unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Asset server actions                  | [src/app/actions/assets.ts](src/app/actions/assets.ts)                                                                               | `apps/server/src/services/assets.ts` (logic) + `apps/server/src/routes/api/assets.ts` (Hono routes)            | Drop `'use server'` and `revalidatePath`; keep ownership checks, path-traversal-safe unlink, full-text search SQL, `searchVector` exclusion, sort/order/pagination. Date fields serialized to ISO at the route boundary.                                                                                                                                                                                                                                                         |
| Asset action tests                    | [src/app/actions/assets.test.ts](src/app/actions/assets.test.ts)                                                                     | `apps/server/src/services/assets.test.ts`                                                                      | Adapt: drop Next cache mocks; assert service-level behavior.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Collection server actions             | [src/app/actions/collections.ts](src/app/actions/collections.ts)                                                                     | `apps/server/src/services/collections.ts` + `apps/server/src/routes/api/collections.ts`                        | Same pattern as assets.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Collection action tests               | [src/app/actions/collections.test.ts](src/app/actions/collections.test.ts)                                                           | `apps/server/src/services/collections.test.ts`                                                                 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Validation schemas (server-shared)    | [src/lib/validation.ts](src/lib/validation.ts)                                                                                       | `packages/shared/src/schemas/`                                                                                 | `CreateAssetSchema`, `UpdateAssetSchema`, `CreateCollectionSchema`, `UpdateCollectionSchema` move to shared. **Replace `z.string().uuid()` with a CUID-compatible regex** (decision #32) — the current uuid check is a latent bug since Prisma generates CUIDs.                                                                                                                                                                                                                  |
| Asset type config (icons/labels)      | [src/lib/asset-types.ts](src/lib/asset-types.ts)                                                                                     | `apps/web/src/lib/asset-types.tsx`                                                                             | React-only; lives in web. The bare `AssetType` enum + `ASSET_TYPE_OPTIONS` value list move to `@cellar/shared` so both runtimes can import the enum without React.                                                                                                                                                                                                                                                                                                               |
| Auth form schemas                     | [src/schemas/auth.ts](src/schemas/auth.ts)                                                                                           | `apps/web/src/schemas/auth.ts`                                                                                 | Stays in web (form-only, not validated by API).                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Settings form schemas                 | [src/schemas/settings.ts](src/schemas/settings.ts)                                                                                   | `apps/web/src/schemas/settings.ts`                                                                             | Same.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Auth schema tests                     | [src/schemas/auth.test.ts](src/schemas/auth.test.ts)                                                                                 | `apps/web/src/schemas/auth.test.ts`                                                                            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Upload route                          | [src/app/api/upload/route.ts](src/app/api/upload/route.ts)                                                                           | `apps/server/src/routes/upload.ts` (Hono route) + `apps/server/src/services/uploads.ts` (validation + storage) | Preserve **exactly**: `MAX_FILE_SIZE` env (default 10485760), `UPLOAD_DIR` env (default `./uploads`), `ALLOWED_EXTENSIONS` set, magic-number content validation (`MAGIC_NUMBERS` table for png/jpg/jpeg/gif/webp/svg), SVG dangerous-tag scan (`<script`, `onload=`, `onerror=`, `onclick=`), per-user directory `<UPLOAD_DIR>/<userId>/`, stored filename `<randomUUID()><ext>`, returned shape `{ filePath, fileName, mimeType, fileSize }`, status codes 400/401/413/415/500. |
| Upload route tests                    | [src/app/api/upload/route.test.ts](src/app/api/upload/route.test.ts)                                                                 | `apps/server/src/routes/upload.test.ts`                                                                        | Adapt to Hono testing client; preserve all coverage.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| File serving route                    | [src/app/api/files/[...path]/route.ts](src/app/api/files/%5B...path%5D/route.ts)                                                     | `apps/server/src/routes/files.ts`                                                                              | Preserve auth check, ownership prefix check (`path.startsWith(userId + '/')`), path-traversal protection (`fullPath.startsWith(uploadsRoot + '/')`), content-type derivation.                                                                                                                                                                                                                                                                                                    |
| Startup report                        | [src/lib/startup-report.ts](src/lib/startup-report.ts)                                                                               | `apps/server/src/lib/startup-report.ts`                                                                        | Preserve `maskSecret`, `parseDatabaseUrl`, `parseTrustedOrigins`, single-emit guard. Update `DEFAULT_PORT` from `'3000'` to `'7000'`. Add fields for new startup chore flags (migrate-on-start, seed-on-start, oidc-sync-on-start results).                                                                                                                                                                                                                                      |
| Startup report tests                  | [src/lib/startup-report.test.ts](src/lib/startup-report.test.ts)                                                                     | `apps/server/src/lib/startup-report.test.ts`                                                                   | Update port-default expectations to 7000.                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Prisma schema                         | [prisma/schema.prisma](prisma/schema.prisma)                                                                                         | `apps/server/prisma/schema.prisma`                                                                             | Move with all migrations. Update `output` path so the client lands in `apps/server/src/generated/prisma/`.                                                                                                                                                                                                                                                                                                                                                                       |
| Prisma seed                           | [prisma/seed.ts](prisma/seed.ts)                                                                                                     | `apps/server/prisma/seed.ts`                                                                                   | **Rewrite to be idempotent and non-destructive before allowing startup seed** (decision #41). Remove the leading `deleteMany()` block; convert each create to `upsert` keyed on natural identity (`User.email`, `Asset.id`, `Collection.id`). Until rewritten, `SEED_ON_START` must default to `false` and the rewrite is a precondition for closing the migration.                                                                                                              |
| Prisma client (root)                  | [src/lib/prisma.ts](src/lib/prisma.ts)                                                                                               | `apps/server/src/lib/prisma.ts`                                                                                | Move; update import path to the new generated client location.                                                                                                                                                                                                                                                                                                                                                                                                                   |

### Existing tests not yet listed

These tests follow their source file's destination (web or server) per the same rules; the agent should move them with the code under test rather than treat them as separate work items: all `src/components/**/*.test.tsx` → `apps/web/src/components/...`, all `src/app/(auth)/**/*.test.tsx` → `apps/web/src/routes/auth/...`, the OIDC tests in `src/lib/oidc/*.test.ts` → `apps/server/src/lib/oidc/...`. Storybook stories (`*.stories.tsx`) move with their components.

## Startup Orchestration

The Hono server entry point (`apps/server/src/index.ts`) runs a fixed sequence before calling `serve()`. Each step has explicit failure semantics so an agent can implement it without inventing policy.

```
1. Load env (process.env, dotenv in dev)
2. Validate env       → fail-fast on parse error, log Zod issues
3. Run migrations     → if MIGRATE_ON_START !== 'false'
4. Seed database      → if SEED_ON_START === 'true'  (default: false)
5. Sync OIDC clients  → if OIDC_SYNC_ON_START !== 'false'
6. Emit startup report (masked)
7. serve({ port, fetch: app.fetch })
```

### Env validation schema

A single Zod schema in `apps/server/src/lib/env.ts` parses `process.env` once at boot. On failure, log the formatted issues and `process.exit(1)` — no half-started server. Required and optional variables:

| Variable                       | Required                     | Validation                                    | Default                       |
| ------------------------------ | ---------------------------- | --------------------------------------------- | ----------------------------- |
| `DATABASE_URL`                 | yes                          | non-empty URL                                 | —                             |
| `BETTER_AUTH_SECRET`           | yes                          | string, length ≥ 32                           | —                             |
| `BETTER_AUTH_URL`              | yes in prod, optional in dev | URL                                           | `http://localhost:7000` (dev) |
| `BETTER_AUTH_TRUSTED_ORIGINS`  | no                           | comma-separated URLs                          | derived                       |
| `GITHUB_CLIENT_ID`             | no                           | string                                        | `''`                          |
| `GITHUB_CLIENT_SECRET`         | no                           | string                                        | `''`                          |
| `OIDC_DUMMY_APP_OIDC_SECRET`   | no                           | string                                        | —                             |
| `OIDC_DISABLE_MISSING_CLIENTS` | no                           | `'true'` \| `'false'`                         | `'false'`                     |
| `UPLOAD_DIR`                   | no                           | string                                        | `./uploads`                   |
| `MAX_FILE_SIZE`                | no                           | positive integer string                       | `10485760`                    |
| `PORT`                         | no                           | port number string                            | `7000`                        |
| `HOST`                         | no                           | string                                        | `0.0.0.0`                     |
| `MIGRATE_ON_START`             | no                           | `'true'` \| `'false'`                         | `'true'`                      |
| `SEED_ON_START`                | no                           | `'true'` \| `'false'`                         | `'false'`                     |
| `OIDC_SYNC_ON_START`           | no                           | `'true'` \| `'false'`                         | `'true'`                      |
| `E2E_TEST_MODE`                | no                           | `'true'` \| `'false'`                         | `'false'`                     |
| `NODE_ENV`                     | no                           | `'development'` \| `'production'` \| `'test'` | `'development'`               |

`NEXT_PUBLIC_BETTER_AUTH_URL` is removed. The frontend calls same-origin `/api/*` and never reads a base URL from env.

### Step implementations

- **Migrations** (step 3): shell out to the Prisma CLI via `node:child_process` — `npx prisma migrate deploy --schema apps/server/prisma/schema.prisma` (the path is relative to repo root in dev; in the Docker image the schema sits at `/app/prisma/schema.prisma`). Non-zero exit aborts startup. Prisma CLI must be available in the runtime image (decision: include `prisma` in the production server `dependencies`, not just `devDependencies`).
- **Seed** (step 4): `await import('../../prisma/seed.js')` and call its exported `main()`. Seed must be idempotent (rewrite precondition above). If the rewrite is not yet done, the env-validation schema additionally rejects `SEED_ON_START === 'true'` with an explicit error.
- **OIDC sync** (step 5): call `syncFirstPartyClients({ disableMissing: env.OIDC_DISABLE_MISSING_CLIENTS === 'true' })` directly — no shell-out.
- **Startup report** (step 6): existing `emitStartupReport` is updated to also report each chore's outcome (`migrate: skipped|ok|failed`, `seed: …`, `oidcSync: …`) and the resolved port.
- **Listen** (step 7): `serve({ port: env.PORT, hostname: env.HOST, fetch: app.fetch })` from `@hono/node-server`.

### Health endpoint

`GET /api/health` returns `200 { status: 'ok' }` synchronously without touching the database. This is intentional: it answers "is the process up?" not "is the database reachable?" — the latter would race startup migrations on cold containers and produce flaky deploy gates. If a deeper health check is needed later, add a separate `/api/health/ready` rather than changing this one.

### Failure semantics summary

| Step           | On failure                                                         |
| -------------- | ------------------------------------------------------------------ |
| Env validation | Log Zod issues, `exit(1)`                                          |
| Migrations     | Log Prisma stderr, `exit(1)`                                       |
| Seed           | Log error, `exit(1)` (rare since opt-in)                           |
| OIDC sync      | Log error, `exit(1)` — auth misconfig is not safe to serve through |
| Startup report | Log error, **continue** (diagnostic, not load-bearing)             |
| Listen         | Log error, `exit(1)`                                               |

## Pinned Versions

The migration adds or replaces these dependencies. Versions below are the ones the agent should use unless a later compatibility issue forces an upgrade — in which case the agent must record the deviation in the migration PR description.

Package manager:

- `pnpm@10.18.0` (declared in root `package.json` `packageManager` field; activated via Corepack in Docker)
- Node `>=24.0.0` (matches Docker base `node:24-slim`)

New runtime dependencies:

- `hono@^4.10.0` (server)
- `@hono/node-server@^1.18.0` (server)
- `@hono/zod-validator@^0.7.4` (server)
- `react-router@^7.10.0` (web; v7 data-router API with route objects)
- `@tanstack/react-query@^5.95.0` (web)
- `@tanstack/react-query-devtools@^5.95.0` (web, devDep)

Frontend tooling:

- `vite@^8.0.8` (already present at root, moves to `apps/web`)
- `@vitejs/plugin-react@^6.0.1` (already present, moves to `apps/web`)
- `babel-plugin-react-compiler@1.0.0` (already present, moves to `apps/web`)
- `tailwindcss@^4`, `@tailwindcss/postcss@^4`, `@tailwindcss/typography@^0.5.19` (move to `apps/web`)

Storybook (move to `apps/web`, swap framework):

- Replace `@storybook/nextjs-vite` with `@storybook/react-vite@^10.3.5`
- Keep `storybook@^10.3.5`, `@storybook/addon-a11y`, `@storybook/addon-docs`, `@storybook/addon-vitest`, `eslint-plugin-storybook` at current versions

Removed dependencies (must not appear in any `package.json` after migration):

- `next`
- `eslint-config-next`
- `@storybook/nextjs-vite`
- Any `next/*` import in source

Preserved versions (do not upgrade as part of this migration):

- `react@19.2.4`, `react-dom@19.2.4`
- `@prisma/client@^7.7.0`, `prisma@^7.7.0`, `@prisma/adapter-pg@^7.7.0`
- `better-auth@^1.6.8`, `@better-auth/oauth-provider@^1.6.8`
- `zod@^4.3.6`
- `vitest@^4.1.4`, `@vitest/coverage-v8@^4.1.4`, `@vitest/browser-playwright@^4.1.4`
- `@playwright/test@^1.59.1`
- `typescript@^5`, `eslint@^9`, `prettier@^3.8.3`
- `react-hook-form@^7.55.0`, `@hookform/resolvers@^5.2.2`
- `lucide-react@^1.8.0`, `clsx@^2.1.1`, `tailwind-merge@^3.5.0`, `sonner@^2.0.7`
- `@monaco-editor/react@^4.7.0`, `react-markdown@^10.1.0`, `remark-gfm@^4.0.1`, `rehype-sanitize@^6.0.0`, `lottie-react@^2.4.1`

Replaced dependencies:

- `nuqs@^2.8.9` → removed; replaced by `react-router` `useSearchParams` directly. No drop-in replacement library is added.

Root devDependencies (only true workspace-level tooling):

- `husky`, `lint-staged`, `prettier`, `typescript`, `@types/node`

## Verification Gates

The migration is big-bang in delivery (one PR, one merge), but the agent must work through ordered gates internally — each gate's commands must pass before moving on. A failing gate means stop and fix before proceeding; do not stack new work on a red gate.

### Gate 0 — Workspace skeleton

Goal: pnpm + workspaces resolve, every workspace builds an empty TypeScript surface, no Next imports remain in any source file.

```bash
pnpm install
pnpm -r exec tsc --noEmit
rg -n "from ['\"]next" -g 'apps/**' -g 'packages/**' || echo OK
rg -n "from ['\"]next/" -g 'apps/**' -g 'packages/**' || echo OK
test ! -f package-lock.json
```

### Gate 1 — Shared package

Goal: `@cellar/shared` builds, its schemas parse expected inputs, both apps can import it.

```bash
pnpm --filter @cellar/shared build
pnpm --filter @cellar/shared test
node -e "require('@cellar/shared')" # in each consumer workspace
```

### Gate 2 — Server runs in isolation

Goal: server boots with a real database, runs migrations, passes service tests, exposes health, and rejects unauthenticated `/api/v1/*` calls with the structured error shape.

```bash
pnpm --filter @cellar/server build
pnpm --filter @cellar/server test
pnpm --filter @cellar/server dev &     # listens on :7001
curl -fsS http://localhost:7001/api/health | grep '"status":"ok"'
curl -s -o /dev/null -w "%{http_code}" http://localhost:7001/api/v1/assets | grep 401
```

The agent must additionally smoke-test each `/api/v1/*` endpoint with an authenticated session (using the existing E2E auth setup harness adapted to hit the new server) before declaring this gate green.

### Gate 3 — Web runs against server

Goal: Vite dev server proxies to Hono, login/dashboard/assets/collections all work in a browser.

```bash
pnpm --filter @cellar/web build
pnpm --filter @cellar/web test
pnpm dev &                              # parallel: server :7001 + web :7000
curl -fsS http://localhost:7000/        # serves Vite index.html
curl -fsS http://localhost:7000/api/health | grep '"status":"ok"'   # via proxy
```

Manual browser check (story #16 + #22 + #23): sign in, view dashboard, create/edit/delete an asset, pin an asset, create/delete a collection, add an asset to a collection, sign out.

### Gate 4 — Storybook

```bash
pnpm --filter @cellar/web storybook &   # :6006
pnpm --filter @cellar/web test-storybook
pnpm --filter @cellar/web build-storybook
```

The React Router decorator must be active globally (any story rendering a `<Link>` or using `useNavigate` must not throw).

### Gate 5 — Production build, locally

Goal: server image's static-hosting model works end-to-end without Vite.

```bash
pnpm --filter @cellar/web build         # → apps/web/dist
pnpm --filter @cellar/server build      # → apps/server/dist
# copy/symlink web/dist into server/public per server build script
node apps/server/dist/index.js &        # :7000
curl -fsS http://localhost:7000/        # SPA index
curl -fsS http://localhost:7000/dashboard # SPA fallback (NOT 404)
curl -s  -o /dev/null -w "%{http_code}" http://localhost:7000/api/v1/asdf | grep 404
curl -fsS http://localhost:7000/.well-known/oauth-authorization-server/api/auth | grep -q issuer
```

### Gate 6 — E2E

```bash
pnpm e2e:setup
pnpm e2e
```

Playwright runs against the Gate-5 production-like build on `:7000`. All four existing spec files (`auth.spec.ts`, `protected-routes.spec.ts`, `assets-crud.spec.ts`, `collections-crud.spec.ts`) must pass without modification beyond port and any unavoidable selector adjustments.

### Gate 7 — Docker

```bash
docker build --target runner -t cellar:dev .
docker build --target storybook -t cellar-ui:dev .
docker compose -f docker-compose.prod.yml config           # parse-check
docker compose -f docker-compose.prod.yml up -d postgres app
curl -fsS http://localhost:7000/api/health
```

### Gate 8 — Final check:all

`pnpm check:all` at the repo root must pass. Composition:

```jsonc
"check:all": "pnpm format:check && pnpm -r lint && pnpm -r test && pnpm --filter @cellar/web test-storybook && pnpm -r build && pnpm e2e"
```

## Frontend Specifics

### Vite dev proxy

`apps/web/vite.config.ts` proxies the same paths that Hono owns in production so dev and prod behavior match for cookies and OIDC discovery URLs:

```ts
server: {
  port: 7000,
  proxy: {
    '/api':         { target: 'http://localhost:7001', changeOrigin: false },
    '/.well-known': { target: 'http://localhost:7001', changeOrigin: false },
  },
}
```

`changeOrigin: false` is required — Better Auth issuer/origin checks would fail under origin rewriting.

### React Compiler

Keep enabled. In `apps/web/vite.config.ts`:

```ts
react({ babel: { plugins: ['babel-plugin-react-compiler'] } });
```

Drop if a build-blocking incompatibility surfaces; record the deviation in the PR description rather than silently disabling.

### Storybook framework + decorator

`apps/web/.storybook/main.ts`:

```ts
framework: { name: '@storybook/react-vite', options: {} }
```

`apps/web/.storybook/preview.tsx` adds a global decorator wrapping every story in a `MemoryRouter` (React Router v7) so route-aware components render. The decorator must accept a `route` parameter so individual stories can override the initial path.

Storybook detection in source code must not use `process.env` (browser-invalid in Vite) — use `import.meta.env.MODE === 'storybook'` or a Storybook-specific Vite mode.

### Asset replacements for Next primitives

| Next primitive                                                    | Replacement                                                                            |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `next/image`                                                      | plain `<img>` (no optimization — out of scope)                                         |
| `next/link`                                                       | `Link` from `react-router`                                                             |
| `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`) | `useNavigate`, `useLocation`, `useSearchParams` from `react-router`                    |
| `next/font`                                                       | Google Fonts `<link rel="stylesheet">` in `index.html` (preserve current font choices) |
| `next/dynamic`                                                    | `React.lazy` + `<Suspense>`                                                            |
| `app/layout.tsx` `metadata`, `icon.tsx`                           | static `<title>`, `<meta>`, favicon files in `apps/web/public/` and `index.html`       |
| `nuqs`                                                            | `useSearchParams` from `react-router` directly                                         |

## Backend Specifics

### Security headers

Apply via Hono `secureHeaders` middleware on every response. Defer strict CSP (decision out-of-scope).

```ts
import { secureHeaders } from 'hono/secure-headers';
app.use(
  '*',
  secureHeaders({
    contentSecurityPolicy: false, // explicit — out of scope this migration
    strictTransportSecurity: 'max-age=31536000; includeSubDomains',
    xContentTypeOptions: 'nosniff',
    xFrameOptions: 'DENY',
    referrerPolicy: 'strict-origin-when-cross-origin',
  })
);
```

### Static asset serving

Built frontend lands in `apps/server/public/` (copied from `apps/web/dist/` by the server build script). Hono serves it via `serveStatic` from `@hono/node-server/serve-static`:

- Hashed assets under `/assets/*` → `Cache-Control: public, max-age=31536000, immutable`.
- `index.html` → `Cache-Control: no-cache`.
- SPA fallback: any unmatched non-API GET returns `index.html`.
- Unmatched `/api/*` → JSON 404 (must register before the SPA fallback).

### Mount order in `app.ts`

Order matters — first match wins:

```ts
app.use('*', secureHeaders(...));
app.route('/.well-known/oauth-authorization-server/api/auth', oidcDiscoveryRouter);
app.route('/api/auth', authRouter);                    // Better Auth catch-all
app.route('/api/v1', apiV1Router);                      // requires auth middleware
app.route('/api/upload', uploadRouter);                 // requires auth middleware
app.route('/api/files', filesRouter);                   // requires auth middleware
app.get('/api/health', c => c.json({ status: 'ok' }));
app.all('/api/*', c => c.json({ error: { code: 'NOT_FOUND', message: 'Not found' } }, 404));
app.use('*', serveStatic({ root: './public' }));
app.get('*', c => serveStatic({ root: './public', path: 'index.html' })(c));
```

## Docker

### Production app image stages

```
base       (node:24-slim, corepack pnpm@10.18.0)
deps       (pnpm install --frozen-lockfile, full workspace)
shared-build (pnpm --filter @cellar/shared build)
web-build  (pnpm --filter @cellar/web build → apps/web/dist)
server-build (pnpm --filter @cellar/server build → apps/server/dist; copy web/dist into server/public)
runner     (node:24-slim, non-root, COPY server build + node_modules + prisma CLI + schema/migrations + public)
```

The `migrate` and `auth-sync-clients` services from [docker-compose.prod.yml](docker-compose.prod.yml) are removed — both run inside the `runner` container at startup. The compose file collapses to `postgres`, `app` (port 7000), and `storybook` (still optional, served on 6006 internally → host port via env).

### Storybook stage (optional)

```
storybook-builder (pnpm --filter @cellar/web build-storybook → storybook-static)
storybook         (node:24-slim + http-server serving storybook-static on :6006)
```

## Test Migration Policy

- **Move with the code.** A test file follows the file it tests — see destinations in the Behavior-Preservation table.
- **Drop, don't rewrite, Next mocks.** `next/cache`, `next/headers`, `next/navigation` mocks are deleted. The replacements (`revalidatePath` → query invalidation, `next/headers` → Hono context) are tested at the boundary they actually cross: services don't know about HTTP; route tests use Hono's testing client; web tests use `MemoryRouter`.
- **Equivalent coverage is the bar.** For each existing `*.test.ts(x)`, the new test file must cover the same cases (same `describe`/`it` names where possible). Net coverage may not decrease.
- **No new mocks for things the agent could test for real.** Hono routes can be tested with `app.request(...)` against a test database — prefer that over mocking Prisma. Existing Prisma mocks in `src/test/mocks/prisma.ts` should be retained only where they currently are; new tests use a real test DB seeded by the existing E2E setup.
- **Storybook tests** (`vitest --project=storybook`) must continue to pass after the framework swap from `@storybook/nextjs-vite` to `@storybook/react-vite`. Stories that imported `next/link` or `next/navigation` are rewritten against React Router — the global decorator handles the context.

## Further Notes

- This migration is intentionally large and should be treated as a full architecture replacement, not a small framework swap.
- The highest-risk areas are auth/OIDC behavior, startup migrations and seeding, file uploads, Prisma generated output, Storybook framework migration, and replacing server actions with typed RPC plus client cache invalidation.
- The production serving model should be verified specifically: Hono must serve APIs, auth, files, static assets, and SPA fallback correctly from one process.
- Because the user chose a big-bang migration, temporary compatibility layers should be avoided unless required to preserve shipped behavior during the replacement.
- Documentation is part of the migration because ports, package manager commands, Docker behavior, and startup chores all change materially.
