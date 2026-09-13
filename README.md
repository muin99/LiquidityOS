# LiquidityOS

A small full stack app that connects field agents, liquidity coordinators,
mobile-money providers, and an admin — so a mobile-money agent never runs
out of either physical cash or e-cash. Two folders, two servers:

- `liquidity-backend/` — NestJS + Postgres API
- `liquidity-frontend/` — Next.js pages that talk to that API

## Running it (both at once)

You need two terminals, one for each server, plus a Postgres database
running locally.

**Terminal 1 — backend (http://localhost:3000)**

```bash
cd liquidity-backend
npm install
cp .env.example .env   # then edit DB credentials / JWT secret
npm run start:dev
```

**Terminal 2 — frontend (http://localhost:3001)**

```bash
cd liquidity-frontend
npm install
npm run dev
```

Open http://localhost:3001 in your browser. The frontend has its own
built in "proxy" (see `next.config.ts`) that quietly forwards anything
sent to `/api/...` over to the backend on port 3000, and the backend
allows that with a CORS rule (see `CORS_ORIGIN` in `.env`) — so the two
servers can talk to each other even though they're on different ports.

## First-time setup (there's no data yet!)

The database starts completely empty, so there's a bit of a chicken-and-egg
problem: nobody can register as a coordinator/provider until an area or
provider exists, and nobody can approve anybody until an admin exists.

1. There is no sign-up form for admins on purpose — insert the first admin
   row into the `users` table by hand (see "Making an admin" below).
2. Log in as that admin at `/login`, go to the admin dashboard, and use the
   "Add an area" / "Add a provider" forms to create at least one of each.
3. Now anyone can register at `/register` as an agent, coordinator, or
   provider — they'll show up on the admin dashboard, pending approval.
4. Once approved, a coordinator can apply to a provider (their dashboard),
   which the provider then approves from their own dashboard.
5. Now agents can request e-cash, and coordinators can fulfill it.

### Making an admin

There's no API route for this — it's meant to be a manual, one-time thing.
From `liquidity-backend`, hash a password and insert a row:

```bash
node -e "require('bcrypt').hash('yourpassword', 10).then(console.log)"
```

```sql
insert into users (id, "fullName", email, "passwordHash", role, status)
values (gen_random_uuid(), 'Admin', 'admin@example.com', '<paste hash here>', 'admin', 'active');
```

## What's where

See `liquidity-backend/README.md` and `liquidity-frontend/README.md` for
the details of each half.
