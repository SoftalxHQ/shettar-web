# syntax=docker/dockerfile:1

ARG NODE_VERSION=22
# Pin to packageManager in package.json — avoid "latest" surprises on remote builds.
ARG PNPM_VERSION=10.28.1

# ─── Base ───────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
ARG PNPM_VERSION
RUN corepack enable && corepack prepare "pnpm@${PNPM_VERSION}" --activate

# ─── Dependencies ───────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
# Allow native package postinstalls (sharp, etc.) — pnpm 10 blocks them by default.
RUN pnpm config set confirmModulesPurge false \
    && pnpm install --frozen-lockfile

# ─── Build ──────────────────────────────────────────────────────────────────
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Clear production overrides from Kamal builder.args (also present in .env.production).
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_ENV
ARG NEXT_PUBLIC_ANDROID_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV \
    NEXT_PUBLIC_ANDROID_APP_URL=$NEXT_PUBLIC_ANDROID_APP_URL \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Next.js loads gitignored .env.production from the build context (see .dockerignore).
# Avoid BuildKit secret mounts over remote SSH — they caused "grpc: connection is closing".
RUN pnpm build \
    && rm -f .env.production .env.local .env.staging

# ─── Runner ─────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
