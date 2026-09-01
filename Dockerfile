# syntax=docker/dockerfile:1

ARG NODE_VERSION=22
ARG PNPM_VERSION=10.28.1

# ─── Base ───────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
ARG PNPM_VERSION
RUN corepack enable && corepack prepare "pnpm@${PNPM_VERSION}" --activate

# ─── Dependencies ───────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm config set confirmModulesPurge false \
    && pnpm install --frozen-lockfile

# ─── Build ──────────────────────────────────────────────────────────────────
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# All NEXT_PUBLIC_* come from Kamal builder.args (sourced from local .env.production via .kamal/secrets).
# Do not rely on copying .env.production — Kamal builds from a git clone that excludes gitignored files.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_ENV
ARG NEXT_PUBLIC_ANDROID_APP_URL
ARG NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_IOS_APP_URL
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
ARG NEXT_PUBLIC_FCM_VAPID_KEY
ARG NEXT_PUBLIC_TIDIO_KEY
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG NEXT_PUBLIC_BROWSE_GATE_ENABLED

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV \
    NEXT_PUBLIC_ANDROID_APP_URL=$NEXT_PUBLIC_ANDROID_APP_URL \
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=$NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    NEXT_PUBLIC_IOS_APP_URL=$NEXT_PUBLIC_IOS_APP_URL \
    NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY \
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID \
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET \
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID \
    NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID \
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID \
    NEXT_PUBLIC_FCM_VAPID_KEY=$NEXT_PUBLIC_FCM_VAPID_KEY \
    NEXT_PUBLIC_TIDIO_KEY=$NEXT_PUBLIC_TIDIO_KEY \
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY \
    NEXT_PUBLIC_BROWSE_GATE_ENABLED=$NEXT_PUBLIC_BROWSE_GATE_ENABLED \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=3072" \
    UV_THREADPOOL_SIZE=2 \
    NEXT_CPU_COUNT=1

# Webpack uses less peak RAM than Turbopack on small builders; local Mac build preferred.
# Kamal builder.secrets mounts NEXT_PUBLIC_TURNSTILE_SITE_KEY (ARG/ENV.fetch is empty at ERB time).
RUN --mount=type=secret,id=NEXT_PUBLIC_TURNSTILE_SITE_KEY \
    sh -c 'if [ -f /run/secrets/NEXT_PUBLIC_TURNSTILE_SITE_KEY ]; then export NEXT_PUBLIC_TURNSTILE_SITE_KEY="$(cat /run/secrets/NEXT_PUBLIC_TURNSTILE_SITE_KEY)"; fi; pnpm build'

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
