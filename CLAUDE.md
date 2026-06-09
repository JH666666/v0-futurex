# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FutureX is a Web3 prediction market DApp (sports, crypto, AI, politics, finance, entertainment). Users connect wallets, sign in via SIWE (Sign-In With Ethereum), and place binary (YES/NO) bets on markets settled in USDC (Base chain) or USDT (BNB Smart Chain).

## Commands

### Frontend (root)
```bash
npm run dev      # Next.js dev server → http://localhost:3000
npm run build    # Production build (TypeScript errors are intentionally suppressed)
npm run lint     # ESLint
```

### Backend (`/backend`)
```bash
npm run dev           # Hono server with hot-reload → http://localhost:3001
npm run build         # npm install + prisma generate
npm run db:generate   # Regenerate Prisma Client after schema changes
npm run db:push       # Push schema to Supabase (no migration file)
npm run db:migrate    # Create + run a migration file
```

There is no test suite configured yet.

## Architecture

### Monorepo Layout
```
/app           → Next.js App Router pages
/components    → React UI components (page-scoped subfolders + shared)
/lib           → Client state stores, API client, React contexts
/backend/src   → Hono API server
  /routes      → HTTP route handlers (thin, delegate to services)
  /services    → Business logic
  /repositories→ Prisma data access layer
  /lib         → config, db client, mock data
/docs          → Architecture, ERD, Supabase setup docs
/contracts     → Smart contract placeholder (not implemented)
```

### Frontend Data Flow

All API calls go through `/lib/api-client.ts` — the single source of truth for backend communication. It manages JWT tokens in `localStorage` (key: `futurex-api-token`) and throws `ApiError` on non-success responses. Components should never call `fetch` directly.

Client-side state lives in store files under `/lib/*-store.ts` (market, betting, wallet, withdrawal, referral, treasury). These expose Zustand-like interfaces and persist to `localStorage` where appropriate.

**Auth flow:** Wallet connect → `POST /api/auth/wallet` (get nonce) → wallet signs message → `POST /api/auth/login` (verify SIWE signature, receive JWT) → `setToken()` stores JWT.

### Backend Mock/Real Switch

`MOCK_MODE` (default: `true` unless `MOCK_MODE=false` in env) controls whether the backend reads from in-memory mock data (`/backend/src/lib/mock-data.ts`) or queries Supabase via Prisma. All services check `config.mockMode`. **When developing without a database, mock mode works out of the box.**

### Backend Request Lifecycle

```
Route handler → Service → Repository → Prisma (real) | Mock data (mock)
```

Routes validate input with Zod, call a service function, and return `{ success: true, data: ... }`. Errors bubble up as thrown `Error` instances; `app.onError` in `index.ts` catches them and returns `{ success: false, message: "..." }`.

### Authentication Middleware

`/backend/src/middleware/auth.ts` verifies the Bearer JWT and attaches the user to Hono context (`c.var.user`). Admin routes additionally check `user.role`.

### Web3 Stack

- **wagmi v3 + viem** for contract interactions and wallet state
- **RainbowKit** for wallet connection UI
- **Chains:** Base (USDC `0x833589fC...`) and BNB Smart Chain (USDT `0x55d39832...`)
- **Providers** are composed in `/components/app-shell.tsx`: `WagmiProvider → QueryClientProvider → RainbowKitProvider → AuthProvider → ChainProvider`

### UI Stack

- Tailwind CSS v4 + shadcn/ui (Base UI theme, CSS variables for theming)
- Dark theme by default (`themeColor: '#1a1d2e'`), glassmorphism aesthetic
- Path alias `@/*` maps to the repo root in both frontend and backend TypeScript configs

### Admin Section

15 admin pages under `/app/admin/*`. Access is role-gated (6 roles: `super_admin`, `admin`, `finance`, `auditor`, `operator`, `user`). The admin layout (`/app/admin/layout.tsx`) handles role checking on the client side.

## Environment Setup

Copy `.env.example` to `.env` (used by both Next.js and the backend). Key variables:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Frontend → backend URL (default: `http://localhost:4000/api`) |
| `DATABASE_URL` | Supabase pooled connection (pgbouncer) |
| `DIRECT_URL` | Supabase direct connection (required for Prisma migrations) |
| `MOCK_MODE` | `true` = in-memory data, no DB needed |
| `JWT_SECRET` | Generate with `openssl rand -base64 32` |
| `PORT` | Backend port (default: `3001`) |

Note: `next.config.mjs` sets `ignoreBuildErrors: true` — TypeScript errors do not fail the build.

## Key Conventions

- **File naming:** kebab-case for all files; PascalCase for React component functions
- **API response shape:** always `{ success: boolean, message: string, data: T, meta?: {...} }`
- **Financial precision:** `Decimal(36,18)` in Prisma schema; use `Number()` when reading back for UI display
- **UI strings:** hardcoded in Chinese (no i18n layer)
- **Code comments:** mix of Chinese and English; ASCII art section dividers (`─────`) used throughout
