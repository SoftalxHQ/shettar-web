# Shettar Web

Guest-facing website: search hotels, book stays, manage reservations and wallet, reviews, wishlists, in-stay restaurant ordering, and push notifications.

Uses **shettar-api** (`/api/v1` + Action Cable).

## Stack

- Next.js 16 (App Router)
- React 19, Redux Toolkit
- Bootstrap 5, React Bootstrap
- Firebase (web push / FCM)
- Google OAuth (guest sign-in)

## Prerequisites

- Node.js 20+
- pnpm (or npm)
- Running **shettar-api** on port 3000

## Local development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

App: **http://localhost:3000**

### Environment

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_API_URL` | Yes | No trailing slash; local: `http://127.0.0.1:3000` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | For payments | Guest wallet / checkout |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | For Google login | OAuth client for web |
| `NEXT_PUBLIC_FIREBASE_*` | For push | Firebase web app config |
| `NEXT_PUBLIC_FCM_VAPID_KEY` | For push | Web Push key pair from Firebase |

Staging and production URLs are documented in `.env.example` (e.g. `https://api.stg.shettar.com`, `https://api-v1.shettar.com`).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | ESLint |

## Notable behaviour

- **Sponsored listings** — Homepage featured hotels and search placements; ad impressions/clicks batch to `POST /api/v1/ad_events/batch` with viewer location context (search history, bookings, optional browser geolocation opt-in).
- **Notifications** — Optional banner on the home page after search; registers FCM before or after login (guest device merge on sign-in). Deployed hosts must set all `NEXT_PUBLIC_FIREBASE_*` and `NEXT_PUBLIC_FCM_VAPID_KEY` from `.env.example` or web push registration is skipped. When logged in, registration sends the API Bearer token so the device is linked to the account (required for account-specific and check-in push).
- **Real-time** — Wallet balance and in-app notifications via Action Cable.

## Project layout

- `app/` — pages, layouts, helpers, contexts
- `app/components/` — UI (search, hotel grid, booking flow, prompts)
- `lib/store/` — Redux slices

## Related apps

| App | Role |
|-----|------|
| [shettar-api](../shettar-api) | Backend |
| [shettar-mobile](../shettar-mobile) | Same product on iOS/Android |
| [shettar-business](../shettar-business) | Hotel operator dashboard |
