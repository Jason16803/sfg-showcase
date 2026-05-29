# Local Debugging Guide — SFG Showcase Web

How to run `sfg-showcase-web` locally against different API backends without breaking the Vercel production deployment.

---

## Environment file strategy

| File | Committed? | Purpose |
|---|---|---|
| `.env.example` | ✅ Yes | Placeholder template — no real values |
| `.env` | ❌ No (gitignored) | Local dev with real values |
| `.env.local` | ❌ No (gitignored) | Local override (Vite convention) |

**Never commit `.env` or `.env.local`.** Vercel reads its environment variables from the dashboard, not from any committed file.

---

## Scenario 1 — Local frontend + production backend (recommended for most debugging)

This is the fastest setup. No local backend required.

```bash
# In sfg-showcase-web root — create .env.local with prod API:
VITE_API_URL=https://sfo-core-api.fly.dev/api/v1
VITE_JWT_STORAGE_KEY=sfg_access_token
VITE_GOOGLE_CLIENT_ID=375719796752-0lbq2cbsp9mhgd3lj6fklj3tq7ar5ggk.apps.googleusercontent.com
```

Then:
```bash
npm run dev
# App at http://localhost:5173
# API calls go to https://sfo-core-api.fly.dev/api/v1
```

**Notes:**
- Demo tenant must be seeded on the production Fly.io backend.
- Auth tokens are valid — real JWT issued by the production API.
- Any writes (job add/delete via demoStore) are local-only and reset on refresh.
- CORS: the production API must allow `http://localhost:5173` as an origin. Check `sfg-api/apps/sfo-core-api` CORS config if you hit CORS errors.

---

## Scenario 2 — Local frontend + local backend

Use this when you are actively developing the `sfo-core-api` and need hot-reload on both sides.

**Step 1: Start the local backend**
```bash
# In sfg-api/apps/sfo-core-api
npm run dev
# API typically starts at http://localhost:5000
# Check the console for the actual port
```

**Step 2: Seed the local demo tenant**
```bash
# From sfo-core-api directory
node src/scripts/seedDemoTenant.js

# To reset demo data:
node src/scripts/seedDemoTenant.js --reset
```

**Step 3: Start the frontend**
```bash
# In sfg-showcase-web root — create .env.local:
VITE_API_URL=http://localhost:5000/api/v1
VITE_JWT_STORAGE_KEY=sfg_access_token

# Then:
npm run dev
# App at http://localhost:5173
# API calls go to http://localhost:5000/api/v1
```

**Notes:**
- Adjust `5000` to match the actual port your backend starts on.
- MongoDB must be running locally (or connected to Atlas) for the backend to work.
- The local MongoDB connection string is in `sfg-api/apps/sfo-core-api/.env` (not committed).

---

## Scenario 3 — Debugging Vercel builds locally

Use `npm run preview` to test the production build before deploying:

```bash
npm run build      # Creates dist/
npm run preview    # Serves dist/ at http://localhost:4173
```

The preview server serves exactly what Vercel will serve. This catches:
- Missing env vars at build time
- Routes that break on hard refresh
- Asset path issues

The `vercel.json` rewrite rules are **not** applied during `npm run preview` — Vite's preview server does not process `vercel.json`. To test SPA routing locally, use the full `dev` server (`npm run dev`) which handles all routes correctly.

To test the exact Vercel routing locally:
```bash
npm install -g vercel
vercel dev
```
This runs the Vercel CLI locally and applies `vercel.json` rules.

---

## Switching between debug branches

If you are on a feature branch that changes auth or routing:

```bash
# 1. Create a debug branch
git checkout -b debug/auth-fix

# 2. Your .env.local is gitignored — it stays across branch switches.
#    No changes needed to the env file.

# 3. Make changes, test locally, then:
npm run build   # Verify the build passes
git push        # Vercel auto-deploys to a preview URL for this branch

# 4. The main branch remains on Vercel production — unaffected.
```

**Vercel preview deployments:**
Each pushed branch gets a unique preview URL (e.g. `sfg-showcase-git-debug-auth-fix.vercel.app`). These use the same environment variables as production. You can override variables per-preview in the Vercel dashboard.

---

## Environment variable precedence (Vite)

Vite loads env files in this order, later files win:

```
.env                 ← loaded first (base, shared, our main local file)
.env.local           ← loaded second (local override, wins over .env)
.env.[mode]          ← loaded for specific mode (e.g. .env.production)
.env.[mode].local    ← loaded last (highest priority)
```

For Vercel, none of these files matter — Vercel injects its own variables at build time via the dashboard. The `.env` file is gitignored and never reaches Vercel.

---

## Common issues

### "Network Error" on API calls locally

**Cause:** CORS — the production API may not allow `http://localhost:5173`.

**Fix:** Add `http://localhost:5173` and `http://localhost:4173` to the `CORS_ORIGIN` env var on the SFO Core API (Fly.io secrets or local `.env`). Do not change the frontend — CORS is a server-side concern.

### Auth token mismatch between local and production

**Cause:** `VITE_JWT_STORAGE_KEY` differs between environments.

**Fix:** Always use `sfg_access_token` everywhere. Check `.env.local` and Vercel env vars both use the same value.

### Demo credentials return 401

**Cause:** Demo tenant not seeded.

**Fix (local):** `node src/scripts/seedDemoTenant.js` from `sfo-core-api`.

**Fix (production):** Run the seed script against the production MongoDB (via Fly.io console or a one-off Fly machine).

### `/oauth/callback` returns 404 on production

**Cause:** `vercel.json` rewrite missing or incorrect.

**Fix:** The current `vercel.json` has `{ "source": "/(.*)", "destination": "/index.html" }` which covers all routes including `/oauth/callback`. This should not happen. If it does, verify the `vercel.json` was committed and Vercel picked it up (check Vercel deployment logs).

### Build fails with TypeScript errors

```bash
npm run build
```

Fix all errors before deploying. Common causes:
- Unused imports (`noUnusedLocals: true` in `tsconfig.app.json`)
- Missing types on new component props
- Stale imports after component moves

---

## Quick reference

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR at `localhost:5173` |
| `npm run build` | TypeScript check + Vite production build → `dist/` |
| `npm run preview` | Serve `dist/` at `localhost:4173` (no vercel.json rules) |
| `npm run lint` | ESLint check |
| `vercel dev` | Local server with Vercel routing rules applied |
| `vercel --prod` | Deploy to production (run only when approved) |
