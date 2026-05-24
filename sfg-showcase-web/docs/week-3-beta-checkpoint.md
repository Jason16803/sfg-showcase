# Week 3 Beta Checkpoint — SFG Showcase Web

**Status:** Week 3 debug + demo tenant session complete  
**Build:** Passing (run `npm run build` to verify — zero TypeScript errors expected)  
**Session date:** Week 3 demo session  

---

## What changed in this session

### Root cause diagnosed and fixed: platform-scope redirect loop

The loop occurred when `jason@thewebsmithagency.com` (a `scope: "platform"`, `tenantId: null` user) logged in. The JWT was stored, `/me` returned 200 (only `requireAuth` — no tenant check), but every subsequent protected route hit `requireTenant` → 401 "Tenant context unavailable" → 401 interceptor triggered logout → redirect to `/login` → re-login → same JWT → same 401 → loop.

**Fix applied (two checkpoints):**

1. **Login checkpoint** — `authService.login()` now checks `user.tenantId === null` before storing the access token. If null → `setScopeError(msg)` + throws `'platform_scope'`. Token is never stored. No redirect loop possible.

2. **Hydration checkpoint** — `hydrateAuth()` now checks `user.scope === 'platform' || user.tenantId === null` after `/me` succeeds. If triggered → `clearStore()` then `setScopeError(msg)`. `isAuthenticated: false` → ProtectedRoute redirects to `/login` → `LoginPage` renders the `scopeError` message without further redirects.

**Message shown:** `Platform accounts cannot access the tenant demo dashboard. Sign in with a demo tenant account.`

---

## New: refresh token wired (Week 3 JWT session)

### Token storage

| Token | localStorage key | env var |
|---|---|---|
| Access token | `sfg_access_token` (or `VITE_JWT_STORAGE_KEY`) | `VITE_JWT_STORAGE_KEY` |
| Refresh token | `sfg_access_token_refresh` (or `VITE_JWT_REFRESH_KEY`) | `VITE_JWT_REFRESH_KEY` |

Both keys cleared on logout. Refresh token sent in request **body** only.

### Refresh flow (mid-session, axios interceptor)

A 401 on any protected route (not `/me`, not `/auth/refresh`) triggers:
1. Check `_retry` flag — prevent duplicate retries
2. `POST /api/v1/auth/refresh { refreshToken }`
3. On success → store new access token, retry original request transparently
4. On failure → `store.logout()` → redirect to `/login`

### Refresh flow (startup, hydrateAuth)

If `/me` returns 401 on app load:
1. `authService.refreshAccessToken()` — attempt refresh
2. On success → retry `/me` with new token → restore session
3. On failure → `clearStore()` → user must re-login

### Backend prerequisite

`POST /api/v1/auth/refresh` must be mounted in SFO Core before the refresh flow activates. Until it is, the call returns 404, which the interceptor treats as a refresh failure → logout. No crash, no loop.

---

## New: `sfg-showcase-demo` tenant + demo accounts

Requires running once on sfo-core-api:
```bash
cd /mnt/d/sfg-api/apps/sfo-core-api
node src/scripts/seedDemoTenant.js          # create
node src/scripts/seedDemoTenant.js --reset  # wipe + re-seed
```

| Role | Email | Password |
|---|---|---|
| `owner` | `demo-owner@sfg-showcase.dev` | `DemoOwner123!` |
| `assistant_manager` | `demo-manager@sfg-showcase.dev` | `DemoManager123!` |
| `employee` | `demo-employee@sfg-showcase.dev` | `DemoEmployee123!` |

Tenant: `TNT_SFG_DEMO` · Name: `SFG Showcase Demo` · `domains: []` (any host allowed) · `dashboardType: service`

---

## APIs Wired (confirmed endpoints only)

| Endpoint | Auth | Min Role | Page / Hook | Mock Fallback |
|---|---|---|---|---|
| `POST /api/v1/auth/login` | None | — | LoginPage / `authService.login()` | No (form error shown) |
| `POST /api/v1/auth/logout` | Bearer | any | DashboardLayout / `authService.logout()` | Best-effort |
| `GET /api/v1/me` | Bearer | any | App.tsx / `hydrateAuth()` | 401/403 → logout; platform scope → scopeError |
| `PUT /api/v1/me` | Bearer | any | SettingsPage / `updateProfile()` | No |
| `PUT /api/v1/me/password` | Bearer | any | SettingsPage / `changePassword()` | No |
| `GET /api/v1/dashboard/overview` | Bearer+tenant | any | DashboardPage / `useDashboardOverview` | Yes |
| `GET /api/v1/dashboard/recent-activity` | Bearer+tenant | any | DashboardPage / `useRecentActivity` | Yes |
| `GET /api/v1/customers` | Bearer+tenant | `assistant_manager+` | CustomersPage / `useCustomers` | Yes (mock for lower roles) |
| `GET /api/v1/jobs` | Bearer+tenant | all | JobsPage, DashboardPage / `useJobs` | Yes |
| `GET /api/v1/jobs/stats` | Bearer+tenant | all | `fetchJobStats()` (wired, unused in UI) | Yes |
| `GET /api/v1/team` | Bearer+tenant | `general_manager+` | TeamPage / `useTeam` | Yes (mock for lower roles) |

**Note on job status values:** The API returns lowercase status values (`created`, `estimate`, `scheduled`, `in-progress`, `completed`, `closed`, `canceled`, `archived`). JobsPage was updated to use these canonical values. The mock data uses legacy PascalCase (`New`, `InProgress`) — both are handled gracefully via `statusVariant()` fallback.

---

## New: soft CRUD overlay (`src/store/demoStore.ts`)

All writes are **local only** — no API calls are made for creates/deletes. MongoDB baseline is never mutated.

| Action | Behavior |
|---|---|
| Load | Pages prime `demoStore` from real API on first render |
| Add Job / Customer | Appended to local store with `id: 'soft_...'` + "local" badge |
| Delete row | Filtered from local store only |
| Reset | `resetLocalChanges()` → sets arrays to null → pages re-prime from API on next render |

**Reset access points:**
- Dashboard layout demo strip → `↺ Reset changes` button (visible when `hasLocalChanges: true`)
- JobsPage → "Reset local changes" link in the live data notice
- CustomersPage → same

---

## Pages Available

| Route | Page | API-backed | Write Controls | Notes |
|---|---|---|---|---|
| `/` | HomePage | No | — | Public marketing |
| `/login` | LoginPage | Yes | — | Login + demo quick-login buttons |
| `/signup` | SignupPage | No | — | Invite-only placeholder |
| `/oauth/callback` | OAuthCallbackPage | No | — | Placeholder |
| `/dashboard` | DashboardPage | Yes | — | Overview + activity + tables — **protected** |
| `/jobs` | JobsPage | Yes | `assistant_manager+` | Add/delete local only — **protected** |
| `/customers` | CustomersPage | Yes | `assistant_manager+` | Add/delete local only; role notice for employees — **protected** |
| `/team` | TeamPage | Yes | — | Read-only; `general_manager+` for real data — **protected** |
| `/settings` | SettingsPage | Yes | any | Profile + password update — **protected** |
| `/reports` | ReportsPage | No | — | Placeholder — **protected** |

---

## RBAC display behavior

| Role | `/jobs` | `/customers` | `/team` | Write controls visible |
|---|---|---|---|---|
| `owner` | Real data | Real data | Real data | Yes — Add + Delete |
| `general_manager` | Real data | Real data | Real data | No (below `assistant_manager`) |
| `assistant_manager` | Real data | Real data | Mock | Yes — Add + Delete |
| `employee` | Real data | Mock (role notice shown) | Mock | No |

---

## Environment setup

```bash
# .env for local demo
VITE_API_URL=http://localhost:5000/api/v1
VITE_GOOGLE_CLIENT_ID=placeholder_google_client_id
VITE_JWT_STORAGE_KEY=sfg_access_token

# Run backend (sfo-core-api)
cd /mnt/d/sfg-api/apps/sfo-core-api && npm run dev

# Seed demo tenant (once)
node src/scripts/seedDemoTenant.js

# Run frontend
cd /mnt/d/TWG-Projects/sfg-showcase/sfg-showcase-web && npm run dev
```

---

## Week 3 manual test checklist

### Platform scope guard (loop breaker)
- [ ] Log in as `jason@thewebsmithagency.com` (platform owner)
- [ ] Expect: amber warning banner on `/login` — "Platform accounts cannot access the tenant demo dashboard"
- [ ] Expect: no redirect to `/dashboard`, no loop
- [ ] Confirm `sfg_access_token` is NOT set in localStorage after this attempt
- [ ] Log in as `demo-owner@sfg-showcase.dev` → expect: `/dashboard` loads with real data

### Demo quick-login
- [ ] Three demo credential buttons visible below login form
- [ ] Each button fires real `POST /api/v1/auth/login`
- [ ] Owner → `/dashboard`, sidebar shows `Owner` role badge
- [ ] Supervisor → `/dashboard`, sidebar shows `Assistant Manager` role badge
- [ ] Employee → `/dashboard`, sidebar shows `Employee` role badge

### RBAC display
- [ ] Owner: "Add Demo Job" and "Add Demo Customer" visible; delete `×` on each row
- [ ] Supervisor: same write controls visible
- [ ] Employee on Jobs: no write controls visible
- [ ] Employee on Customers: role notice shown; no write controls
- [ ] General manager: no write controls (role < `assistant_manager`)

### Soft CRUD — Jobs
- [ ] Login as owner or supervisor
- [ ] Click "+ Add Demo Job" → form appears with title + status fields
- [ ] Submit → new row appears at top with "local" badge
- [ ] Click `×` on local row → row removed
- [ ] Click `×` on seeded row → row removed (local delete)
- [ ] Reload page → all local changes gone; baseline restored
- [ ] Click "Reset local changes" link → same result without reload

### Soft CRUD — Customers
- [ ] Same pattern as Jobs with name + email + status fields

### Demo strip (DashboardLayout)
- [ ] Thin amber strip visible across top of dashboard on all pages
- [ ] Shows `TNT_SFG_DEMO` tenant ID
- [ ] "↺ Reset changes" appears only when `hasLocalChanges: true`
- [ ] Clicking it shows confirm dialog; confirming resets both jobs + customers

### Legacy items (still passing)
- [ ] Hard-refresh `/dashboard` → spinner → dashboard renders (token hydrated)
- [ ] Delete `sfg_access_token` from localStorage → redirect to `/login`
- [ ] Sign Out → redirect to `/login`, localStorage cleared
- [ ] `/settings` profile update works
- [ ] `/team` loads mock for assistant_manager and employee (correct)

---

## Deferred backend features

| Feature | Status | Blocked on |
|---|---|---|
| Google OAuth login | Frontend placeholder | `POST /api/v1/auth/google` not implemented |
| Refresh token rotation | Deferred | No `/api/v1/auth/refresh` route mounted |
| Revenue / financial data | Deferred | Floe API |
| Reports page real data | Placeholder | No reporting endpoint |
| Billing page | Not built | Floe-owned |
| Soft CRUD → real writes | Explicitly deferred | Future: enable flag in demoStore |
