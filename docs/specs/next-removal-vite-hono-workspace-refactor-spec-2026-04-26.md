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

## Further Notes

- This migration is intentionally large and should be treated as a full architecture replacement, not a small framework swap.
- The highest-risk areas are auth/OIDC behavior, startup migrations and seeding, file uploads, Prisma generated output, Storybook framework migration, and replacing server actions with typed RPC plus client cache invalidation.
- The production serving model should be verified specifically: Hono must serve APIs, auth, files, static assets, and SPA fallback correctly from one process.
- Because the user chose a big-bang migration, temporary compatibility layers should be avoided unless required to preserve shipped behavior during the replacement.
- Documentation is part of the migration because ports, package manager commands, Docker behavior, and startup chores all change materially.
