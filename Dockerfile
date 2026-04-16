# syntax=docker/dockerfile:1

# ── base: shared foundation ───────────────────────────────────────────
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ── deps: install all dependencies (cached layer) ─────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

# ── builder: generate prisma client + next build ──────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_BETTER_AUTH_URL is baked into the JS bundle at build time.
# Override this arg when building for a custom domain:
#   docker build --build-arg NEXT_PUBLIC_BETTER_AUTH_URL=https://yourdomain.com .
ARG NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
ENV NEXT_PUBLIC_BETTER_AUTH_URL=$NEXT_PUBLIC_BETTER_AUTH_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ── migrate: run prisma migrate deploy ────────────────────────────────
FROM base AS migrate
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY prisma.config.ts .

CMD ["npx", "prisma", "migrate", "deploy"]

# ── runner: lean production image (standalone output only) ────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

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
