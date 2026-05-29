# SFG Showcase Web

**SmithForgd Showcase** is the public-facing demo frontend for the SmithForgd (SFG) platform — a multi-tenant, API-first service operations system. Built with Vite + React + TypeScript.

The showcase demonstrates a production-grade SaaS dashboard for field service businesses: real JWT authentication against a live backend, role-based access control, a full operations dashboard, and mock soft-CRUD for demo sessions.

---

## Live Demo

| URL | Purpose |
|---|---|
| [sfg-showcase.vercel.app](https://sfg-showcase.vercel.app) | Production deployment |
| [sfo-core-api.fly.dev/health](https://sfo-core-api.fly.dev/health) | Backend health check |

**Demo credentials** (require backend seed — see [Local Setup](#local-setup)):

| Role | Email | Password |
|---|---|---|
| Owner | `demo-owner@sfg-showcase.dev` | `DemoOwner123!` |
| Supervisor | `demo-manager@sfg-showcase.dev` | `DemoManager123!` |
| Employee | `demo-employee@sfg-showcase.dev` | `DemoEmployee123!` |

---

## What This App Does

- **Public site** — `/`, `/about`, `/contact` — marketing pages with navigation
- **Login** — `/login` — email + password + demo quick-login buttons; Google OAuth wired (backend pending)
- **Dashboard** — `/dashboard` — KPI cards, job status strip, revenue/job/customer charts, activity feed
- **Jobs** — `/jobs` — filterable job list, soft add/delete (local demo), RBAC-gated write controls
- **Customers** — `/customers` — searchable customer list, soft add/delete, role-restriction notice
- **Team** — `/team` — team roster with roles and last-active times; role-gated via backend
- **Settings** — `/settings` — profile and password update (wired to real API)
- **Reports** — `/reports` — planned analytics placeholder

All dashboard routes are protected by JWT. Role-based nav and write controls mirror backend RBAC.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Language | TypeScript 6 (`strict`, `noUnusedLocals`) |
| Styling | SCSS — no Tailwind, no CSS modules |
| State | Zustand 5 |
| Forms | React Hook Form 7 + Zod 4 |
| HTTP | Axios 1 (with refresh-then-retry interceptor) |
| Charts | Recharts 3 |
| Router | React Router DOM 7 |

Backend responsibilities (SFO Core API — separate repo):
- JWT issuance + refresh
- Google OAuth exchange
- MongoDB Atlas persistence
- Tenant + user RBAC

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 18.0.0 |
| npm | ≥ 9.0.0 |
| Git | Any modern version |

---

## Local Setup

### 1. Clone

```bash
git clone https://github.com/YOUR_ORG/sfg-showcase-web.git
cd sfg-showcase-web
```

### 2. Install

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required — SFO Core API base URL (include /api/v1)
VITE_API_URL=http://localhost:3001/api/v1

# Optional — Google OAuth client ID (browser-safe)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Optional — localStorage key for the access token (must match TOKEN_KEY in authStore.ts)
VITE_JWT_STORAGE_KEY=sfg_access_token
```

> `.env.local` is git-ignored. Never commit it.

### 4. Seed demo tenant (requires SFO Core API running)

```bash
# From the sfo-core-api directory
node src/scripts/seedDemoTenant.js

# Reset to baseline anytime
node src/scripts/seedDemoTenant.js --reset
```

### 5. Run dev server

```bash
npm run dev
# App at http://localhost:5173
```

### 6. Build for production

```bash
npm run build
# Output in dist/
```

---

## Environment Variables

All variables are prefixed `VITE_` — Vite exposes them in the browser bundle. **No secrets here.**

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | Yes | `https://sfo-core-api.fly.dev/api/v1` | SFO Core base URL with `/api/v1` prefix |
| `VITE_GOOGLE_CLIENT_ID` | Planned | — | Public Google OAuth client ID (browser-safe; backend-initiated flow) |
| `VITE_JWT_STORAGE_KEY` | No | `auth_token` | localStorage key for the JWT access token |
| `VITE_JWT_REFRESH_KEY` | No | `${STORAGE_KEY}_refresh` | localStorage key for the refresh token |

**Never** put any of these in `VITE_*`:
- Google OAuth client secret → SFO Core backend env only
- JWT signing secret → SFO Core backend env only
- MongoDB connection string → SFO Core backend env only

---

## Project Structure

```
sfg-showcase-web/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── api/
│   │   ├── client.ts          Axios instance; Bearer token; refresh-then-retry
│   │   └── profile.api.ts     PUT /me, PUT /me/password
│   ├── auth/
│   │   └── service.ts         login, hydrateMe, refreshAccessToken, logout, hydrateAuth
│   ├── components/            Badge, Button, Card, Container, DataTable, ActivityFeed,
│   │                          Charts, DashboardMetricCard, DemoBanner, PublicNav, ErrorBoundary
│   ├── data/
│   │   └── mockData.ts        rolePermissions, DEMO_ACCOUNTS, legacy mock shapes
│   ├── features/
│   │   └── dashboard/
│   │       ├── dashboard.api.ts      fetch functions (all verified endpoints)
│   │       ├── dashboard.mock.ts     typed mock fallback data
│   │       ├── dashboard.types.ts    API response types
│   │       └── hooks/               useDashboardOverview, useJobs, useCustomers, useTeam, useRecentActivity
│   ├── layouts/
│   │   ├── DashboardLayout.tsx       Role-aware sidebar, mobile drawer, demo strip
│   │   └── PublicLayout.tsx          PublicNav + footer
│   ├── pages/
│   │   ├── HomePage, AboutPage, ContactPage
│   │   ├── LoginPage, SignupPage, OAuthCallbackPage
│   │   └── DashboardPage, JobsPage, CustomersPage, TeamPage, SettingsPage, ReportsPage
│   ├── router/
│   │   ├── AppRouter.tsx      All routes + RedirectIfAuthed guard
│   │   └── ProtectedRoute.tsx Auth gate; passes {from} location for post-login redirect
│   ├── store/
│   │   ├── authStore.ts       Zustand: user, token, refreshToken, isLoading, isAuthenticated, scopeError
│   │   └── demoStore.ts       Soft CRUD overlay (local-only jobs/customers)
│   ├── styles/
│   │   ├── variables.scss     Design tokens
│   │   ├── global.scss        Global resets + typography
│   │   └── utilities.scss     Mixins
│   └── utils/
│       └── oauth.utils.ts     parseOAuthCallback, oauthErrorInfo
├── docs/
│   ├── auth-flow.md           Full auth flow + manual test steps
│   ├── google-oauth-plan.md   OAuth activation checklist + backend requirements
│   ├── deployment.md          Vercel deployment guide
│   └── phase-3-summary.md    Historical session notes
├── .env.example
├── index.html
├── vercel.json                SPA routing fallback + asset cache headers
├── vite.config.ts             Build config + manual chunk splitting
└── package.json
```

---

## Deployment — Vercel

### First deploy

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com) → Framework: Vite → Build: `npm run build` → Output: `dist`
3. Set environment variables in Vercel dashboard:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://sfo-core-api.fly.dev/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
| `VITE_JWT_STORAGE_KEY` | `sfg_access_token` |

4. Deploy. Every push to `main` auto-deploys.

### SPA routing

`vercel.json` contains the rewrite rule that sends all requests to `index.html`. This is required — without it, navigating directly to `/dashboard` or refreshing `/oauth/callback` returns 404.

### OAuth callback routing

The `/oauth/callback` route must work server-side. The `vercel.json` rewrite ensures Vercel serves `index.html` for this path. The `OAuthCallbackPage` React component then reads the `?accessToken=` query param and completes the handoff.

---

## Auth Architecture

```
App mounts
  └─ useEffect → hydrateAuth()
       ├─ No token in localStorage → isLoading: false immediately
       └─ Token found → GET /api/v1/me
            ├─ 200, tenant user  → setUser(), isLoading: false → dashboard
            ├─ 200, platform user → clearStore(), scopeError → /login (amber warning)
            ├─ 401              → try POST /api/v1/auth/refresh
            │    ├─ Success     → setToken(new), retry /me → restore session
            │    └─ Failure     → clearStore() → /login (session-ended notice)
            ├─ 403              → clearStore() → /login
            └─ Network/5xx      → preserve token, isLoading: false (optimistic)

ProtectedRoute
  isLoading     → spinner (verifying session)
  !isAuthenticated → Navigate to="/login" with state={{ from: location }}

LoginPage
  state.from set to a dashboard route → shows "session ended" notice
  After login → navigate(state.from ?? '/dashboard')
```

**Token storage:**

| Token | Key | Default |
|---|---|---|
| Access token | `sfg_access_token` | `VITE_JWT_STORAGE_KEY` |
| Refresh token | `sfg_access_token_refresh` | `${STORAGE_KEY}_refresh` |

---

## Role-Based Access

| Role | Dashboard | Jobs | Customers | Team | Settings | Reports |
|---|---|---|---|---|---|---|
| Owner | ✅ Real | ✅ Write | ✅ Write | ✅ Real | ✅ | ✅ |
| General Manager | ✅ Real | ✅ Read | ✅ Read | ✅ Real | ✅ | ✅ |
| Asst. Manager | ✅ Real | ✅ Write | ✅ Write | 📋 Mock | ✅ | — |
| Employee | ✅ Real | ✅ Read | 📋 Mock | 📋 Mock | ✅ | — |

Backend enforces RBAC via `requireRole()` on all routes. Frontend controls are UI-only gates.

---

## API Endpoints Used

All routes on SFO Core API (`VITE_API_URL`):

| Route | Auth | Min Role | Feature |
|---|---|---|---|
| `POST /auth/login` | None | — | LoginPage |
| `GET  /me` | Bearer | any | hydrateAuth, ProtectedRoute |
| `POST /auth/logout` | Bearer | any | Sign Out |
| `POST /auth/refresh` | None | — | Token refresh (backend pending) |
| `PUT  /me` | Bearer | any | Settings — profile update |
| `PUT  /me/password` | Bearer | any | Settings — password change |
| `GET  /dashboard/overview` | Bearer+tenant | any | Dashboard KPIs |
| `GET  /dashboard/recent-activity` | Bearer+tenant | any | Activity feed |
| `GET  /jobs` | Bearer+tenant | employee+ | Jobs page, Dashboard table |
| `GET  /customers` | Bearer+tenant | assistant_manager+ | Customers page |
| `GET  /team` | Bearer+tenant | general_manager+ | Team page |

---

## Backend Blockers

| Feature | Status | What's needed |
|---|---|---|
| Session token refresh | ❌ Backend pending | Mount `POST /api/v1/auth/refresh` in SFO Core (service method exists) |
| Google OAuth login | ❌ Backend pending | `GET /api/v1/auth/google` + callback route + `google-auth-library` |
| Revenue data | ❌ Floe API pending | Tenant billing summary endpoint (Floe-owned) |

Until refresh is live: expired tokens log the user out. The session-ended notice on `/login` tells users to sign back in.

---

## Academic Integrity Note

This project is original work built on production-track architecture. The course uses Spotify as its reference OAuth + API integration. This project implements the same pattern using Google OAuth and a custom backend (SFO Core):

| Course (Spotify) | This project (SmithForgd) |
|---|---|
| Spotify OAuth 2.0 | Google OAuth 2.0 (via SFO Core) |
| Spotify Client ID | `VITE_GOOGLE_CLIENT_ID` |
| Spotify Client Secret | Google secret — backend only, never frontend |
| Spotify token exchange | `POST /api/v1/auth/google` (backend) |
| Session persistence | JWT + MongoDB Atlas user record |
| Spotify Web API | SFO Core REST API (custom) |

All code in this repository is written from scratch to fit the specific requirements of the SFG platform.
