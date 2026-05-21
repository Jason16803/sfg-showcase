# Week 3 Beta Checkpoint — SFG Showcase Web

**Status:** Week 3 wiring complete — `/showcase-dashboard` removed  
**Build:** Passing, zero TypeScript errors  

---

## APIs Wired (confirmed endpoints only)

| Endpoint | Auth | Min Role | Page / Hook | Mock Fallback |
|---|---|---|---|---|
| `POST /api/v1/auth/login` | None | — | LoginPage / `authService.login()` | No (form error shown) |
| `POST /api/v1/auth/logout` | Bearer | any | DashboardLayout / `authService.logout()` | Best-effort (always clears local) |
| `GET /api/v1/me` | Bearer | any | App.tsx / `hydrateAuth()` | 401/403 → logout |
| `PUT /api/v1/me` | Bearer | any | SettingsPage / `updateProfile()` | No (form error shown) |
| `PUT /api/v1/me/password` | Bearer | any | SettingsPage / `changePassword()` | No (form error shown) |
| `GET /api/v1/dashboard/overview` | Bearer+tenant | any | DashboardPage / `useDashboardOverview` | Yes — mock data |
| `GET /api/v1/dashboard/recent-activity` | Bearer+tenant | any | DashboardPage / `useRecentActivity` | Yes — mock data |
| `GET /api/v1/customers` | Bearer+tenant | `assistant_manager` | CustomersPage / `useCustomers` | Yes — mock data |
| `GET /api/v1/jobs` | Bearer+tenant | all | JobsPage, DashboardPage / `useJobs` | Yes — mock data |
| `GET /api/v1/jobs/stats` | Bearer+tenant | all | `fetchJobStats()` (wired, unused in UI yet) | Yes |
| `GET /api/v1/team` | Bearer+tenant | `general_manager` | TeamPage / `useTeam` | Yes — mock data |

---

## Pages Available

| Route | Page | API-backed | Notes |
|---|---|---|---|
| `/` | HomePage | No | Public marketing |
| `/login` | LoginPage | Yes | `POST /api/v1/auth/login` |
| `/signup` | SignupPage | No | Invite-only placeholder |
| `/oauth/callback` | OAuthCallbackPage | No | Placeholder — backend endpoint missing |
| `/dashboard` | DashboardPage | Yes | Overview + activity + jobs + customers — **protected** |
| `/jobs` | JobsPage | Yes | Full job list with status filter tabs — **protected** |
| `/customers` | CustomersPage | Yes | Customer list with search + status filter — **protected** |
| `/team` | TeamPage | Yes | Team roster (general_manager+ sees real data) — **protected** |
| `/settings` | SettingsPage | Yes | Profile update + password change — **protected** |
| `/reports` | ReportsPage | No | Placeholder — shows planned reports — **protected** |

---

## Pages Using Mock Fallback Data

All dashboard data hooks fall back gracefully — no crashes, no broken requests.

| Page / Hook | Fallback condition | What shows |
|---|---|---|
| DashboardPage — overview | API down, 401/403 | Mock metrics (`isMock: true` badge shown) |
| DashboardPage — activity | Same | Mock activity items |
| DashboardPage — jobs | Same | Mock job rows |
| DashboardPage — customers | Same | Mock customer rows |
| JobsPage | API down, 401/403 | Mock jobs |
| CustomersPage | Role < assistant_manager, API down | Mock customers |
| TeamPage | Role < general_manager, API down | Mock team members |

Settings page does **not** use mock fallback — it shows form errors if the API is unreachable.

---

## Deferred Backend Features

| Feature | Status | Blocked On |
|---|---|---|
| Google OAuth login | Frontend placeholder | `POST /api/v1/auth/google` not implemented |
| Refresh token rotation | Deferred | No `/api/v1/auth/refresh` route mounted |
| Revenue / financial data | Deferred | Floe API — Floe owns all financial data |
| Revenue trend chart (real data) | Deferred | Floe integration |
| Customer growth chart | Deferred | Needs `GET /api/v1/dashboard/customer-growth` endpoint |
| Reports page | Placeholder | No reporting endpoint confirmed |
| Billing page | Not built | Floe-owned, no SFO Core endpoint |

---

## Nav Behavior

| Section | Route | State |
|---|---|---|
| Dashboard | `/dashboard` | ✅ Link — implemented |
| Jobs | `/jobs` | ✅ Link — implemented |
| Customers | `/customers` | ✅ Link — implemented |
| Team | `/team` | ✅ Link — implemented |
| Reports | `/reports` | ✅ Link — placeholder page |
| Settings | `/settings` | ✅ Link — implemented |
| Billing | `/billing` | `Soon` badge — no page |

---

## Manual Beta Test Checklist

### Auth flow
- [ ] Navigate to `/login` → form renders
- [ ] Enter wrong password → error banner shows "Incorrect email or password"
- [ ] Enter valid credentials → redirects to `/dashboard`
- [ ] Hard-refresh `/dashboard` → spinner appears briefly → dashboard loads (token hydrated)
- [ ] Manually delete `auth_token` from localStorage → refresh `/dashboard` → redirects to `/login`
- [ ] While logged in, navigate to `/login` directly → auto-redirects to `/dashboard`
- [ ] Click Sign Out → redirects to `/login`, `auth_token` removed from localStorage

### Dashboard
- [ ] `/dashboard` loads with real data (if SFO Core running) or mock data with "Demo data" badge
- [ ] Metric cards show real values from `/api/v1/dashboard/overview`
- [ ] Activity feed shows real items from `/api/v1/dashboard/recent-activity`
- [ ] Jobs table shows 5 most recent jobs

### Jobs page
- [ ] `/jobs` renders full job list
- [ ] Status filter buttons work — clicking a status filters the table
- [ ] "All" button resets filter
- [ ] Row count shown below table
- [ ] "Demo data" badge appears if API is down

### Customers page
- [ ] `/customers` renders customer list
- [ ] Search input filters customers by name/email (real API) or is a no-op on mock
- [ ] Status dropdown filters results
- [ ] "Demo data" badge appears if API is down or role < assistant_manager

### Team page
- [ ] `/team` renders member list
- [ ] "You" badge appears on current user's row
- [ ] Role and status badges render correctly
- [ ] "Demo data" badge appears if role < general_manager
- [ ] Loading skeleton shows briefly while fetching

### Settings page
- [ ] `/settings` pre-populates profile form with current user name + email
- [ ] Editing name → save → header shows updated name (auth store updated)
- [ ] Wrong current password → error "The current password you entered is incorrect"
- [ ] Valid password change → success message, form resets
- [ ] Account info section shows role, tenantId, scope (read-only)

### Reports page
- [ ] `/reports` loads with "coming soon" message
- [ ] Planned reports list visible with data source labels

### Showcase (removed)
- [x] `/showcase-dashboard` was removed after Week 3 beta wiring
- [x] `DashboardPage` only mounts under `ProtectedRoute`

### Navigation
- [ ] Active nav item highlighted for all 6 implemented routes
- [ ] "Billing" shows "Soon" badge (not a link)
- [ ] Clicking "Reports" navigates to reports placeholder (not `/`)
- [ ] SPA navigation — no full-page reloads between routes
- [ ] Employee role: sidebar shows only Dashboard + Jobs
- [ ] Assistant Manager role: Dashboard + Jobs + Customers + Team

---

## Environment Setup for Beta Testing

```bash
# Copy env template
cp .env.example .env.local

# Configure
VITE_API_URL=http://localhost:3001/api/v1
VITE_JWT_STORAGE_KEY=auth_token

# Start SFO Core separately (in /mnt/d/sfg-api/apps/sfo-core-api)
npm run dev   # or node server.js

# Start frontend
npm run dev
```

The frontend runs without SFO Core — all pages work with mock fallback data.
SFO Core is required only for real auth (login, settings) and real dashboard data.
