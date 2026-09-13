# liquidity-frontend

The login, registration, and dashboard screens for Liquidity Lite. This
talks to the real `liquidity-backend` API now — see the root `README.md`
for how to run both servers together and get some data into the database.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3001 (not 3000 — the backend already uses that port).

Requests to `/api/...` are quietly forwarded to the backend by the
`rewrites()` rule in `next.config.ts`. If your backend isn't running on
`http://localhost:3000`, set `BACKEND_URL` in a `.env.local` file here.

## Pages

- `/` — landing page
- `/login` — log in with a real email/phone + password
- `/register` — sign up as an agent, coordinator, or provider (starts
  "pending" until an admin approves it)
- `/dashboard/[role]` — a dynamic route; `/dashboard/agent`,
  `/dashboard/coordinator`, `/dashboard/provider`, and `/dashboard/admin`
  all use the same page file, which checks who's logged in and shows the
  matching dashboard component

## How login works

On purpose, there's no shared auth helper file or axios wrapper — each
component just does this itself, right where it's needed:

```ts
const token = localStorage.getItem("access_token");
axios.get("/api/wallets/me", { headers: { Authorization: `Bearer ${token}` } });
```

`/login` saves `access_token` and `user` (as JSON) into `localStorage`
after a successful `POST /api/auth/login`. Every other page/component that
needs to know who's logged in just reads those two keys straight out of
`localStorage` again — no context, no interceptor, no helper functions.

## What's where

- `app/` — one folder per route (App Router)
- `components/` — one file per dashboard, plus the shared navbar
- `lib/validation.ts` — zod schemas for the login/register forms

## Stack

Next.js (App Router) · Tailwind CSS · DaisyUI · zod · axios
