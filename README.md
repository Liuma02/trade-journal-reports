# 20 Point — Backend & Local Setup

This app is built with **React + Vite + Tailwind + shadcn/ui** and uses
**Supabase** as the default backend. The backend is fully abstracted behind
a single client (`src/lib/supabase.ts`) and a services layer
(`src/services/*`), so you can swap to a different Supabase project — or
another backend entirely — without touching UI code.

## 1. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:8080.

## 2. Environment variables

The app reads these at build/runtime — no keys are ever hardcoded:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase **anon/public** key |

Set them in your hosting provider's env settings (Lovable, Vercel, etc.).
For local dev create a `.env.local` at the project root:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

> Never commit real keys. Only the **anon** key belongs in the frontend —
> never the service-role key.

## 3. Swap to a new Supabase project

1. Create a new Supabase project.
2. Run the SQL in `SUPABASE_SETUP.md` to create `trades`, `journal_entries`,
   and `profiles` plus their RLS policies.
3. Replace `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the new
   project's values.
4. Restart the dev server / redeploy. Done — no code changes required.

## 4. Architecture

```
src/
├── lib/
│   ├── supabase.ts        ← single backend client (env-driven)
│   └── authErrors.ts      ← maps raw errors to friendly messages
├── services/              ← all data access (no Supabase calls in UI)
│   ├── tradesService.ts
│   └── journalService.ts
├── contexts/
│   ├── AuthContext.tsx    ← login / signup / reset / session
│   └── TradeContext.tsx   ← consumes services, exposes data to UI
├── pages/
│   ├── Login, Signup, ForgotPassword, ResetPassword
│   └── Dashboard, Trades, Journal, Reports, Calendar, Settings, Import
└── components/auth/ProtectedRoute.tsx
```

**Rules of the codebase:**
- ❌ No direct `supabase.from(...)` calls inside components or pages.
- ✅ Components call hooks/contexts → contexts call services → services call `supabase`.
- ✅ All errors surface through `friendlyAuthError()` / `friendlyDataError()`.

## 5. Auth flows

- **Sign up** — `/signup`, email + password. Confirmation email sent.
- **Sign in** — `/login`.
- **Forgot password** — `/forgot-password` triggers `resetPasswordForEmail`.
- **Reset password** — `/reset-password` (Supabase email links here).
- **Logout** — `useAuth().signOut()` from anywhere.

All authenticated routes are wrapped in `<ProtectedRoute>`.

## 6. Database schema

See `SUPABASE_SETUP.md` for the full SQL. Tables:

- `profiles (id uuid pk → auth.users, email text)`
- `trades (id, user_id, ...)` — RLS scoped to `auth.uid() = user_id`
- `journal_entries (id, user_id, trade_date, ...)` — same scoping

## 7. Replacing the backend entirely

To move off Supabase:

1. Implement the same function signatures exported from
   `src/services/tradesService.ts` and `src/services/journalService.ts`
   against your new backend.
2. Replace `src/lib/supabase.ts` with your new client.
3. Update `AuthContext.tsx` to call your new auth provider.

The UI layer needs **zero changes**.
