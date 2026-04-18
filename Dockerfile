# syntax=docker/dockerfile:1

# ── base: shared foundation ───────────────────────────────────────────
FROM node:24-slim AS base
WORKDIR /app

# ── deps: install all dependencies (cached layer) ─────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ── builder: generate prisma client + next build ──────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Placeholder secret for build-time only (real value at runtime)
ENV BETTER_AUTH_SECRET=dummy-secret-for-build-time-only-32-characters-long

RUN npm run build

# ── migrate: run prisma migrate deploy ────────────────────────────────
FROM base AS migrate
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY prisma.config.ts .

CMD ["npx", "prisma", "migrate", "deploy"]

# ── storybook-builder: build static storybook files ────────────────────
FROM base AS storybook-builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build-storybook

# ── storybook: serve static storybook with serve ──────────────────────
FROM node:24-slim AS storybook
WORKDIR /app

# Copy built storybook files
COPY --from=storybook-builder /app/storybook-static ./

RUN npm i -g http-server

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

USER node

CMD ["http-server", "-p", "3000"]

# ── runner: lean production image (standalone output only) ────────────
FROM node:24-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 -g nodejs nextjs

# Static assets
COPY --from=builder /app/public ./public

# Standalone server + its traced node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Writable uploads directory (mount a volume here in production)
RUN mkdir -p uploads && chown nextjs:nodejs uploads

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
