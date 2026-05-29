# Deployment — SFG Showcase Web

**Target platform:** Vercel (static SPA)  
**Build command:** `npm run build`  
**Output directory:** `dist`  
**Framework preset:** Vite

---

## Vercel Setup

### 1. Import project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `sfg-showcase-web` GitHub repository
3. Vercel detects Vite automatically — accept the defaults:
   - Framework: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

### 2. Set environment variables

In **Settings → Environment Variables**, add:

| Variable | Value | Environment |
|---|---|---|
| `VITE_API_URL` | `https://sfo-core-api.fly.dev/api/v1` | Production |
| `VITE_GOOGLE_CLIENT_ID` | Your Google client ID | Production |
| `VITE_JWT_STORAGE_KEY` | `sfg_access_token` | Production |

> Only `VITE_API_URL` is strictly required. The others have safe defaults.

### 3. Deploy

Click **Deploy**. Every push to `main` triggers a re-deploy.

---

## SPA Routing

This app uses React Router for client-side routing. Without server configuration, direct URL access to routes like `/dashboard` or `/jobs` returns 404 — the server looks for a file at that path but none exists.

`vercel.json` contains the required rewrite rule:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This tells Vercel to serve `index.html` for every request. React Router then handles routing client-side.

**Affected routes (would 404 without this):**
- `/about`, `/contact` — public pages
- `/login`, `/signup` — auth pages
- `/oauth/callback` — Google OAuth handoff (critical — OAuth login breaks without this)
- `/dashboard`, `/jobs`, `/customers`, `/team`, `/settings`, `/reports` — protected pages

---

## Asset Caching

`vercel.json` also sets long-lived cache headers for built assets:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

Vite appends content hashes to asset filenames (e.g., `vendor-react-Bm3qX9Kj.js`), so `immutable` caching is safe — a new deploy produces new filenames automatically.

---

## Build Optimisation

`vite.config.ts` splits vendor libraries into separate cache-busted chunks:

| Chunk | Contents | Approx. size (gzipped) |
|---|---|---|
| `vendor-react` | react, react-dom, react-router-dom | ~45 KB |
| `vendor-state` | zustand, axios | ~15 KB |
| `vendor-form` | react-hook-form, @hookform/resolvers, zod | ~25 KB |
| `vendor-charts` | recharts | ~120 KB |
| `vendor-motion` | framer-motion | ~60 KB |
| `[entry]` | app code + styles | varies |

Returns users only re-download chunks that changed. Vendor chunks are cached for 1 year.

---

## Environment Variable Reference

### Production (Vercel)

Set in Vercel dashboard → Settings → Environment Variables. Automatically injected at build time by Vite.

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_URL` | Yes | Must include `/api/v1` prefix. No trailing slash. |
| `VITE_GOOGLE_CLIENT_ID` | When OAuth is live | Browser-safe — this is the public client ID only. |
| `VITE_JWT_STORAGE_KEY` | No | Set to `sfg_access_token` to match the deployed backend seed. Default is `auth_token`. |
| `VITE_JWT_REFRESH_KEY` | No | Defaults to `${STORAGE_KEY}_refresh`. |

### Local development

Copy `.env.example` → `.env.local`. Never commit `.env.local`.

```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_JWT_STORAGE_KEY=sfg_access_token
```

---

## OAuth Callback Routing

The Google OAuth flow ends with SFO Core redirecting the browser to:

```
https://sfg-showcase.vercel.app/oauth/callback?accessToken=xxx&refreshToken=yyy
```

For this to work:

1. `vercel.json` rewrites `/oauth/callback` → `index.html` ✓  
2. React Router renders `OAuthCallbackPage` ✓  
3. `parseOAuthCallback()` reads `accessToken` and `refreshToken` from URL params ✓  
4. Tokens are stored, URL is cleaned with `window.history.replaceState` ✓  
5. `GET /api/v1/me` verifies the session, `navigate('/dashboard')` ✓

**Google Cloud Console** must include the Vercel URL in Authorized redirect URIs:
```
https://sfo-core-api.fly.dev/api/v1/auth/google/callback
```

Note: the redirect URI points to the **backend callback**, not the frontend. The backend then redirects to the frontend after token exchange.

---

## Pre-Deployment Checklist

```
[ ] vercel.json exists with rewrite + cache headers
[ ] VITE_API_URL set in Vercel environment variables
[ ] VITE_JWT_STORAGE_KEY set to sfg_access_token
[ ] npm run build passes locally with zero TypeScript errors
[ ] Demo tenant seeded on SFO Core (node src/scripts/seedDemoTenant.js)
[ ] Demo credentials tested against production API
[ ] /dashboard → 200 (not 404) on direct browser access
[ ] /oauth/callback → 200 (not 404) on direct browser access
[ ] Hard refresh on /jobs → stays on /jobs, no redirect to /
```

---

## Known Deployment Limitations

| Limitation | Impact | Status |
|---|---|---|
| `POST /api/v1/auth/refresh` not mounted | Session refresh non-functional; expired tokens log user out immediately | Backend pending |
| `POST /api/v1/auth/google` not implemented | OAuth button redirects to backend 404 | Backend pending |
| Revenue / financial charts use mock data | Floe financial API not integrated | Intentional for demo |
| Reports page is a placeholder | No reporting backend endpoint | Planned |

---

## Rollback

Vercel keeps a full deployment history. To roll back:

1. Go to **Deployments** in the Vercel dashboard
2. Click the target deployment → **Promote to Production**

Or via CLI:
```bash
vercel rollback
```

---

## Monitoring

No external monitoring is configured in the current demo deployment. For production use, consider:

- **Vercel Analytics** (built-in, free tier available)
- **Sentry** for error tracking — integrate with `ErrorBoundary.tsx`
- **Vercel Speed Insights** for Core Web Vitals

The `ErrorBoundary` component in `src/components/ErrorBoundary.tsx` logs render errors to `console.error`. Wire it to Sentry by replacing the `console.error` call in `componentDidCatch` with `Sentry.captureException(error)`.
