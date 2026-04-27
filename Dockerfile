# syntax=docker/dockerfile:1

# ── base: node + pnpm ─────────────────────────────────────────────────
FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /repo

# ── deps: install workspace dependencies (cached) ─────────────────────
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile

# ── build: typecheck and build the SPA ────────────────────────────────
FROM deps AS build
COPY tsconfig.base.json tsconfig.json ./
COPY packages/shared ./packages/shared
COPY packages/ui ./packages/ui
COPY apps/api ./apps/api
COPY apps/web ./apps/web
RUN pnpm --filter web build

# ── storybook-build: build the static Storybook for packages/ui ───────
FROM deps AS storybook-build
COPY tsconfig.base.json tsconfig.json ./
COPY packages/shared ./packages/shared
COPY packages/ui ./packages/ui
RUN pnpm --filter @cellar/ui build-storybook

# ── storybook-runner: tiny nginx image serving storybook-static ───────
FROM nginx:alpine AS storybook-runner
COPY --from=storybook-build /repo/packages/ui/storybook-static /usr/share/nginx/html
EXPOSE 80

# ── runner: lean runtime image ────────────────────────────────────────
FROM node:24-slim AS runner
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 -g nodejs cellar

# Copy the workspace tree (pnpm uses content-addressable hardlinks across packages)
COPY --from=build --chown=cellar:nodejs /repo /app

# Writable uploads directory (mount a volume here in production)
RUN mkdir -p /app/uploads && chown cellar:nodejs /app/uploads
ENV UPLOAD_DIR=/app/uploads
ENV WEB_DIST_DIR=/app/apps/web/dist

USER cellar
EXPOSE 5200
ENV PORT=5200

# tsx executes TypeScript directly; on boot the server runs migrations,
# seeds (if empty), syncs OIDC clients, prints the startup report, then listens.
WORKDIR /app/apps/api
CMD ["node", "--import", "tsx/esm", "src/index.ts"]
