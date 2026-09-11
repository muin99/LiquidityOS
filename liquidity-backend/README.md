# liquidity-lite

A small NestJS backend for the agent / coordinator / provider liquidity network.
Entities + auth + guards only — build your own endpoints on top of this as you go.

## Setup

```bash
npm install
cp .env.example .env   # then edit DB credentials / JWT secret
npm run start:dev
```

Needs a Postgres database running (create one matching `DB_NAME` in `.env`).
Tables are created automatically on boot (`synchronize: true` in `app.module.ts`).

Also set `CORS_ORIGIN` in `.env` to wherever the frontend runs (defaults to
`http://localhost:3001`) — otherwise the browser blocks the frontend from
calling this API at all.

Swagger docs: http://localhost:3000/docs

## First-time flow

1. `POST /auth/register` as role `agent`, `coordinator`, or `provider`
   (a `provider` registration also needs `providerId` — the provider it
   represents, created beforehand via admin's `POST /providers`) —
   account starts `pending`. `GET /areas` and `GET /providers` are public
   so a not-yet-registered person can still see the options to pick from.
2. Someone with an `admin` account approves you: `PATCH /users/:id/approve`.
   (There's no self-signup for admin — insert the first admin row by hand,
   see the root `README.md`.)
3. `POST /auth/login` — get back a JWT, send it as `Authorization: Bearer <token>`.
   `GET /auth/me` returns whoever that token belongs to.
4. Agent: `POST /wallets/cash-in`, `POST /wallets/cash-out`, `GET /wallets/me`.
5. Coordinator: `POST /coordinator-providers/apply`, then the **provider**
   account decides: `GET /coordinator-providers/pending` (only their own),
   `PATCH /coordinator-providers/:id/decide` (blocked if it's not their
   provider — admin can decide on anyone's).
6. Agent: `POST /ecash-requests` (check status later at `GET /ecash-requests/mine`)
   → Coordinator: `GET /ecash-requests/pending` (only for providers they're an
   **approved** coordinator for — checked again on accept, not just for display)
   → `PATCH /ecash-requests/:id/accept` → `PATCH /ecash-requests/:id/fulfill`.

## What's where

- `src/common` — the reusable guard/role/enum plumbing everything else uses
- one folder per entity group (`users`, `areas`, `providers`, `wallets`,
  `coordinator-providers`, `ecash-requests`), each with its own module,
  service, controller, and DTOs
- `src/wallets/wallets.service.ts` — the cash-in/cash-out database
  transaction, written with a step-by-step "magic box" comment style
