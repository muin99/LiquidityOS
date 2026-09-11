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
  all use the same page file, which checks who's logged in (see
  `lib/auth.ts`) and shows the matching dashboard component

## What's where

- `app/` — one folder per route (App Router)
- `components/` — one file per dashboard, plus the shared navbar
- `lib/api.ts` — one shared axios instance, points at `/api` and
  automatically attaches the saved login token to every request
- `lib/auth.ts` — plain functions for saving/reading/clearing the logged
  in user in `localStorage` (no React context, just functions)
- `lib/validation.ts` — zod schemas for the login/register forms

## Stack

Next.js (App Router) · Tailwind CSS · DaisyUI · zod · axios
