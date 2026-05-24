# Phase 3 Summary — SFG Showcase Web

**Completed:** Phase 3 auth + data layer foundation  
**Status:** Build passing, zero TypeScript errors  
**Branch:** main (all work committed directly)

---

## What Was Completed

### Auth Architecture (fully wired)

| Feature | Status | Notes |
|---|---|---|
| Email/password login | ✅ Complete | POSTs to `POST /api/v1/auth/login`, stores JWT in localStorage |
| Session hydration on load | ✅ Complete | `hydrateAuth()` calls `GET /api/v1/me` on mount; restores user from store |
| JWT Bearer token on requests | ✅ Complete | `api/client.ts` request interceptor attaches token from localStorage |
| 401 auto-logout interceptor | ✅ Complete | Response interceptor in `api/client.ts`; skips hydration call to avoid loop |
| Protected routes | ✅ Complete | `ProtectedRoute` holds at spinner while hydrating; redirects to `/login` if not authenticated |
| Redirect authed users from login | ✅ Complete | `RedirectIfAuthed` in `AppRouter.tsx` prevents auth loop |
| Logout | ✅ Complete | Best-effort `POST /api/v1/auth/logout` + unconditional local state clear |
| Friendly error messages | ✅ Complete | `friendlyAuthError()` maps all SFO Core error strings to user copy |
| Expired token handling | ✅ Complete | 401 from `/me` on hydration → logout; 401 mid-session → interceptor logout |

### Dashboard Data Layer (API-ready)

| Feature | Status | Notes |
|---|---|---|
| Dashboard overview hook | ✅ Complete | `useDashboardOverview()` → `GET /api/v1/dashboard/overview` |
| Recent activity hook | ✅ Complete | `useRecentActivity()` → `GET /api/v1/dashboard/recent-activity` |
| Customers hook | ✅ Complete | `useCustomers()` → `GET /api/v1/customers` (assistant_manager+) |
| Jobs hook | ✅ Complete | `useJobs()` → `GET /api/v1/jobs` (all roles) |
| Mock fallback | ✅ Complete | All hooks fall back to typed mock data when API unavailable or unauthorized |
| Skeleton loading | ✅ Complete | Metric cards show pulse skeleton; ActivityFeed shows shimmer rows |
| Demo data badge | ✅ Complete | `· Demo data` badge shown in header when mock fallback is active |

### UX Polish

| Item | Status |
|---|---|
| `ProtectedRoute` loading spinner | ✅ Complete |
| Dashboard nav uses `<Link>` (SPA navigation) | ✅ Complete |
| Nav active state via `useLocation` | ✅ Complete |
| Unimplemented nav items marked "Soon" | ✅ Complete |
| `ActivityFeed` empty state | ✅ Complete |
| `PreviewBanner` accurate copy | ✅ Complete |
| `PreviewBanner` "Sign in" CTA | ✅ Complete |

---

## Auth Architecture Overview

```
App.tsx (mount)
  └─ useEffect → hydrateAuth()
       ├─ No stored token  → return (isLoading was already false)
       └─ Token found      → GET /api/v1/me
            ├─ 200 OK      → setUser(data), setIsLoading(false) → dashboard renders
            ├─ 401/403     → logout() → clear store + localStorage
            └─ Network/5xx → preserve token, setIsLoading(false)

authStore (Zustand)
  token         ← localStorage[VITE_JWT_STORAGE_KEY || 'auth_token']
  user          ← populated by login or hydrateMe()
  isLoading     ← true while hydrateAuth() is in flight (only when token present)
  isAuthenticated ← derived from token presence

api/client.ts
  Request interceptor  → attaches 'Authorization: Bearer <token>'
  Response interceptor → 401 (non-hydration) → useAuthStore.logout()

ProtectedRoute
  isLoading → spinner
  !isAuthenticated → <Navigate to="/login">
  authenticated → render children (DashboardLayout → <Outlet>)

RedirectIfAuthed (in AppRouter)
  isLoading → null (wait for hydration)
  isAuthenticated → <Navigate to="/dashboard">
  !isAuthenticated → render children (LoginPage / SignupPage)
```

---

## Dashboard Architecture Overview

```
DashboardPage
  ├─ useDashboardOverview()  → /dashboard/overview  → metric values
  ├─ useRecentActivity(5)    → /dashboard/recent-activity → ActivityFeed
  ├─ useJobs({ limit: 5 })   → /jobs               → DataTable (jobs)
  └─ useCustomers({ limit: 5 }) → /customers        → DataTable (customers)

Each hook:
  try  → real API via apiClient
  catch → mock fallback (dashboard.mock.ts)
  return { data/items, isLoading, error, isMock }

isMock: true  → demo badge shown, mock data displayed
isMock: false → real tenant data displayed (no visual difference to user)

DashboardLayout
  rolePermissions[user.role].sections → role-aware sidebar nav
  IMPLEMENTED_ROUTES set → Live Link vs "Soon" badge per section
```

---

## Backend Routes Used

All routes on SFO Core API (`/mnt/d/sfg-api/apps/sfo-core-api`).

| Route | Auth | Min Role | Used By |
|---|---|---|---|
| `POST /api/v1/auth/login` | None (public) | — | `authService.login()` |
| `GET  /api/v1/me` | Bearer | any | `authService.hydrateMe()`, `hydrateAuth()` |
| `POST /api/v1/auth/logout` | Bearer | any | `authService.logout()` |
| `GET  /api/v1/dashboard/overview` | Bearer + tenant | any | `useDashboardOverview` |
| `GET  /api/v1/dashboard/recent-activity` | Bearer + tenant | any | `useRecentActivity` |
| `GET  /api/v1/customers` | Bearer + tenant | `assistant_manager` | `useCustomers` |
| `GET  /api/v1/jobs` | Bearer + tenant | `employee` (all) | `useJobs` |

JWT payload: `{ userId }` — no role or tenantId embedded. The `requireAuth` middleware fetches the full User document on every authenticated request, ensuring status changes (suspensions, role changes) take effect immediately without token expiry.

---

## Mock Fallback Strategy

Mock data lives in `src/features/dashboard/dashboard.mock.ts` in API-normalised type shapes (not the old `MockCustomer`/`MockJob` raw shapes). The old `src/data/mockData.ts` is retained only for `rolePermissions` (used by `DashboardLayout`).

**Fallback triggers (all behind ProtectedRoute):**
- Network error (backend offline during local dev)
- 401/403 (expired token, or insufficient role for customers/team endpoint)

**Note:** `/showcase-dashboard` was removed after Week 3 beta wiring. `DashboardPage` now only mounts behind `ProtectedRoute`. The `PreviewBanner` component was removed with it.

**Fallback behavior:**
- `isMock: true` returned from hooks
- `"Demo data"` badge shown in dashboard header
- All data shapes are identical to real API shapes — zero component changes needed when API goes live

---

## Deferred Features

| Feature | Blocked On | Docs |
|---|---|---|
| Google OAuth login | `POST /api/v1/auth/google` not implemented on SFO Core | `docs/google-oauth-plan.md` |
| Refresh token rotation | No `/api/v1/auth/refresh` route mounted (service method exists) | `docs/auth-flow.md` |
| Revenue metric (real) | Floe financial API — no SFO Core dashboard endpoint | `DashboardPage.tsx` TODO comment |
| Revenue chart (real) | Same — Floe owns all financial data | `Charts.tsx` TODO comment |
| Customer growth chart | Needs `GET /api/v1/dashboard/customer-growth` endpoint | `Charts.tsx` TODO comment |
| Job completion chart from real stats | `JobCompletionChart` needs `data` prop + `useJobStats()` hook | `Charts.tsx` TODO comment |
| Customers page (`/customers`) | Route + page not yet built | `AppRouter.tsx` TODO comment |
| Team page (`/team`) | Route + page not yet built | `AppRouter.tsx` TODO comment |
| Settings page (`/settings`) | Route + page not yet built | `AppRouter.tsx` TODO comment |
| 404 page | Currently redirects to `/` | `AppRouter.tsx` TODO comment |

---

## Week 3 Assignment Mapping

| Assignment Requirement | Implementation |
|---|---|
| Third-party API integration | SFO Core API replaces course Spotify example (same OAuth + API pattern) |
| OAuth provider | Google OAuth (planned, frontend placeholder wired, backend endpoint deferred) |
| JWT authentication | Full JWT flow: login → token stored → hydration on reload → protected routes |
| Backend API calls | 7 SFO Core endpoints wired across auth and dashboard data layer |
| Protected routes | `ProtectedRoute` with loading state, redirect, and hydration guard |
| Environment variables | `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, `VITE_JWT_STORAGE_KEY` — all documented |
| Session persistence | JWT in localStorage, hydrated on app mount via `GET /api/v1/me` |
| Error handling | Friendly error messages, 401 auto-logout, network fallback to mock |

---

## Next Phase Roadmap (Phase 4)

### High priority
1. **Implement Google OAuth** — requires `POST /api/v1/auth/google` on SFO Core + Google Cloud Console app setup
2. **Wire real revenue data** — coordinate with Floe API for tenant billing summary endpoint
3. **Add `/customers` page** — `GET /api/v1/customers` is already wired in `useCustomers()` hook; build the page
4. **Add `/jobs` page** — same pattern; `useJobs()` hook exists

### Medium priority
5. **Implement refresh token flow** — backend service method exists; add route + frontend interceptor
6. **Add `/team` page** — `GET /api/v1/team` endpoint exists on SFO Core
7. **Upgrade `JobCompletionChart`** to accept `JobStats` prop from `useJobStats()` hook
8. **Add proper 404 page** — replace `* → /` catch-all redirect

### Polish
9. **Mobile-responsive sidebar** — currently hidden on mobile; needs hamburger menu or bottom nav
10. **Role-based page guards** — per-route role enforcement in `ProtectedRoute` (UI layer; backend enforces regardless)
11. **Vercel deployment** — configure environment variables, test production build

---

## File Index (Phase 3)

```
src/
  api/
    client.ts                 ← axios + Bearer interceptor + 401 auto-logout
  auth/
    service.ts                ← login(), hydrateMe(), logout(), hydrateAuth(), friendlyAuthError()
  store/
    authStore.ts              ← Zustand: user, token, isLoading, isAuthenticated
  router/
    AppRouter.tsx             ← routes + RedirectIfAuthed guard
    ProtectedRoute.tsx        ← isLoading spinner + auth redirect
    ProtectedRoute.scss
  layouts/
    DashboardLayout.tsx       ← role-aware sidebar, <Link> nav, active state via useLocation
    DashboardLayout.scss
  pages/
    LoginPage.tsx             ← authService.login(), friendlyAuthError(), Google button placeholder
    DashboardPage.tsx         ← 4 hooks, skeleton loading, demo badge
    DashboardPage.scss
  features/
    dashboard/
      dashboard.types.ts      ← API response types + hook return shapes
      dashboard.api.ts        ← fetchDashboardOverview, fetchRecentActivity, fetchCustomers, fetchJobs, fetchJobStats
      dashboard.mock.ts       ← typed mock fallback data
      hooks/
        useDashboardOverview.ts
        useRecentActivity.ts
        useCustomers.ts
        useJobs.ts
        index.ts
  components/
    ActivityFeed.tsx          ← added isLoading prop + empty state + skeleton
    ActivityFeed.scss
    PreviewBanner.tsx         ← REMOVED — was showcase-only, deleted after Week 3 wiring
    PreviewBanner.scss        ← REMOVED
  data/
    mockData.ts               ← retained for rolePermissions only
docs/
  auth-flow.md                ← full auth architecture, manual test steps
  google-oauth-plan.md        ← Google OAuth activation checklist
  phase-3-summary.md          ← this file
```
