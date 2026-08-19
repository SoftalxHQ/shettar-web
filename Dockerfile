# syntax=docker/dockerfile:1

ARG NODE_VERSION=22

# ─── Base ───────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# ─── Dependencies ───────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ─── Build ──────────────────────────────────────────────────────────────────
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Non-secret public config (Kamal builder.args)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_ENV
ARG NEXT_PUBLIC_ANDROID_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV \
    NEXT_PUBLIC_ANDROID_APP_URL=$NEXT_PUBLIC_ANDROID_APP_URL \
    NEXT_TELEMETRY_DISABLED=1

# Secret public keys (Kamal builder.secrets → BuildKit secret mounts)
RUN --mount=type=secret,id=NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY \
    --mount=type=secret,id=NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    --mount=type=secret,id=NEXT_PUBLIC_IOS_APP_URL \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_API_KEY \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_PROJECT_ID \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_APP_ID \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID \
    --mount=type=secret,id=NEXT_PUBLIC_FCM_VAPID_KEY \
    --mount=type=secret,id=NEXT_PUBLIC_TIDIO_KEY \
    --mount=type=secret,id=NEXT_PUBLIC_TURNSTILE_SITE_KEY \
    --mount=type=secret,id=NEXT_PUBLIC_BROWSE_GATE_ENABLED \
    export NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="$(cat /run/secrets/NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY 2>/dev/null || true)" \
    && export NEXT_PUBLIC_GOOGLE_CLIENT_ID="$(cat /run/secrets/NEXT_PUBLIC_GOOGLE_CLIENT_ID 2>/dev/null || true)" \
    && export NEXT_PUBLIC_IOS_APP_URL="$(cat /run/secrets/NEXT_PUBLIC_IOS_APP_URL 2>/dev/null || true)" \
    && export NEXT_PUBLIC_FIREBASE_API_KEY="$(cat /run/secrets/NEXT_PUBLIC_FIREBASE_API_KEY 2>/dev/null || true)" \
    && export NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="$(cat /run/secrets/NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN 2>/dev/null || true)" \
    && export NEXT_PUBLIC_FIREBASE_PROJECT_ID="$(cat /run/secrets/NEXT_PUBLIC_FIREBASE_PROJECT_ID 2>/dev/null || true)" \
    && export NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="$(cat /run/secrets/NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET 2>/dev/null || true)" \
    && export NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="$(cat /run/secrets/NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID 2>/dev/null || true)" \
    && export NEXT_PUBLIC_FIREBASE_APP_ID="$(cat /run/secrets/NEXT_PUBLIC_FIREBASE_APP_ID 2>/dev/null || true)" \
    && export NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="$(cat /run/secrets/NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID 2>/dev/null || true)" \
    && export NEXT_PUBLIC_FCM_VAPID_KEY="$(cat /run/secrets/NEXT_PUBLIC_FCM_VAPID_KEY 2>/dev/null || true)" \
    && export NEXT_PUBLIC_TIDIO_KEY="$(cat /run/secrets/NEXT_PUBLIC_TIDIO_KEY 2>/dev/null || true)" \
    && export NEXT_PUBLIC_TURNSTILE_SITE_KEY="$(cat /run/secrets/NEXT_PUBLIC_TURNSTILE_SITE_KEY 2>/dev/null || true)" \
    && export NEXT_PUBLIC_BROWSE_GATE_ENABLED="$(cat /run/secrets/NEXT_PUBLIC_BROWSE_GATE_ENABLED 2>/dev/null || true)" \
    && pnpm build

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
