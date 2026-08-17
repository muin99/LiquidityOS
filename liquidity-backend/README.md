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

Swagger docs: http://localhost:3000/docs

## First-time flow

1. `POST /auth/register` as role `agent` or `coordinator` — account starts `pending`.
2. Someone with an `admin` account approves you: `PATCH /users/:id/approve`.
   (There's no self-signup for admin — insert the first admin row by hand,
   or temporarily allow the `admin` role in `RegisterDto` to bootstrap one.)
3. `POST /auth/login` — get back a JWT, send it as `Authorization: Bearer <token>`.
4. Agent: `POST /wallets/cash-in`, `POST /wallets/cash-out`, `GET /wallets/me`.
5. Coordinator: `POST /coordinator-providers/apply`, then (as admin)
   `PATCH /coordinator-providers/:id/decide`.
6. Agent: `POST /ecash-requests` → Coordinator: `PATCH /ecash-requests/:id/accept`
   → `PATCH /ecash-requests/:id/fulfill`.

## What's where

- `src/common` — the reusable guard/role/enum plumbing everything else uses
- one folder per entity group (`users`, `areas`, `providers`, `wallets`,
  `coordinator-providers`, `ecash-requests`), each with its own module,
  service, controller, and DTOs
- `src/wallets/wallets.service.ts` — the cash-in/cash-out database
  transaction, written with a step-by-step "magic box" comment style
