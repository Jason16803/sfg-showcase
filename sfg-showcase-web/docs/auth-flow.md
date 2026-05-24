# Auth Flow — SFG Showcase Web

**Week 3 status:** JWT login + refresh token wired. Platform-scope guard active. Demo accounts seeded.  
**Backend:** SFO Core API (`/mnt/d/sfg-api/apps/sfo-core-api`)  
**Frontend:** SFG Showcase Web (`/mnt/d/TWG-Projects/sfg-showcase/sfg-showcase-web`)

---

## SFG vs Spotify: What This Project Replaces

The course uses Spotify as its example third-party API/OAuth integration.
For this project, the equivalent integration is:

| Course Example (Spotify) | This Project (SFG) |
|---|---|
| Spotify Web API | SFO Core API (custom backend) |
| Spotify OAuth 2.0 | Google OAuth 2.0 (planned, via SFO Core) |
| Spotify access token | SFO Core JWT access token |
| Spotify user profile | SFO Core `/api/v1/me` |
| Spotify client ID | `VITE_GOOGLE_CLIENT_ID` (browser-safe) |
| Spotify client secret | Google client secret (backend only, never frontend) |

SFO Core is not a public API — it is a custom Express/MongoDB backend that
owns authentication, user management, tenant isolation, and RBAC for the
SFG platform. It issues its own JWTs and handles all session persistence.

---

## Verified Backend Endpoints

All shapes confirmed by direct file inspection of SFO Core source.

### POST /api/v1/auth/login

```
Request body:
  { email: string, password: string }

Success 200:
  {
    success: true,
    message: 'Login successful',
    data: {
      accessToken:  string,    ← JWT, signed with server secret (short-lived)
      refreshToken: string,    ← stored on User document in MongoDB (longer-lived)
      user: {
        id: string,
        email: string,
        firstName: string,
        lastName: string,
        role: 'owner' | 'general_manager' | 'assistant_manager' | 'employee',
        status: 'active' | 'invited' | 'suspended',
        tenantId: string | null,
        features: Record<string, boolean>
      }
    }
  }

Error responses:
  401 { success: false, message: 'Invalid credentials' }
  403 { success: false, message: 'Account is suspended' }
  403 { success: false, message: 'Account is not active' }
  429 { success: false, message: 'Too many auth attempts, please try again later' }

Rate limit: 30 requests / 15 minutes per IP
No auth middleware (public route)
```

### GET /api/v1/me

```
Requires: Authorization: Bearer <accessToken>

Success 200:
  {
    success: true,
    message: 'User retrieved',
    data: {
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      role: string,
      status: string,
      scope: 'tenant' | 'platform',   ← absent from login response
      tenantId: string | null
    }
  }

Note: features is NOT returned by /me — login response only.
Note: scope IS returned by /me — login response does not include it.

Error responses:
  401 { success: false, message: 'No token provided' }
  401 { success: false, message: 'Token has expired' }
  401 { success: false, message: 'Invalid token' }
  401 { success: false, message: 'User not found' }
  403 { success: false, message: 'Account is suspended' }
  403 { success: false, message: 'Account has not been activated' }
```

### POST /api/v1/auth/logout

```
Requires: Authorization: Bearer <accessToken>

Success 200:
  { success: true, message: 'Logged out successfully', data: null }

Effect: clears refreshToken field on User document in MongoDB.
Frontend always clears local auth state regardless of server response.
```

### POST /api/v1/auth/refresh  ← BACKEND PREREQUISITE: not yet mounted

```
Public route — no auth middleware. Reads refreshToken from request body.
The Authorization header (expired access token) is present due to the
request interceptor but is ignored by the backend.

Request body:
  { refreshToken: string }

Success 200:
  {
    success: true,
    message: 'Token refreshed',
    data: { accessToken: string }   ← new short-lived access token
  }

Error responses:
  400 { success: false, message: 'Refresh token required' }
  401 { success: false, message: 'Invalid or expired refresh token' }

Backend service method: authService.refreshAccessToken() — exists but
the route is not yet mounted in SFO Core. Until it is, POST /auth/refresh
returns 404. The frontend interceptor treats 404 as a refresh failure
and triggers logout cleanly — no crash, no loop.
```

---

## Token Storage

| Token | localStorage key | env var | Default |
|---|---|---|---|
| Access token | `sfg_access_token` | `VITE_JWT_STORAGE_KEY` | `auth_token` |
| Refresh token | `sfg_access_token_refresh` | `VITE_JWT_REFRESH_KEY` | `${TOKEN_KEY}_refresh` |

Both keys are cleared on logout. The refresh token is sent only in the body
of POST `/api/v1/auth/refresh` — never in an `Authorization` header.

---

## JWT Behavior

- **Payload:** `{ userId }` — role and tenantId are NOT embedded in the token
- **Verification:** every request through `requireAuth` middleware fetches the
  full User document from MongoDB, so status/role changes take effect immediately
- **Access token expiry:** controlled by `config.jwt.accessExpiry` on SFO Core
- **Refresh token:** stored on the User document in MongoDB and in the frontend's
  localStorage under `REFRESH_TOKEN_KEY`

---

## Refresh Token Flow

### Mid-session (axios interceptor)

```
Protected request (e.g. GET /jobs) returns 401
  │
  ├─ G1: URL is /me?         → skip (hydrateAuth owns /me 401s)
  ├─ G2: URL is /auth/refresh? → logout, reject (refresh token invalid)
  ├─ G3: No auth header?     → skip (unauthenticated call by design)
  ├─ G4: Store not authed?   → skip (stale pre-login request)
  ├─ G5: Already retried?    → logout, reject (token still rejected after refresh)
  │
  └─ Attempt refresh: POST /api/v1/auth/refresh { refreshToken }
      │
      ├─ 200 OK
      │    → store.setToken(newAccessToken)
      │    → patch original request header: Authorization: Bearer <newToken>
      │    → retry original request ONCE
      │    → return retried response to original caller (transparent to page hooks)
      │
      └─ Any failure (401, 400, 404, network)
           → store.logout()   ← clears both tokens
           → ProtectedRoute sees isAuthenticated: false
           → redirect to /login
```

### On app startup (hydrateAuth)

```
App mounts → hydrateAuth() called
  │
  ├─ No stored access token → return immediately (isLoading: false)
  │
  └─ Stored access token found (isLoading: true optimistically)
       │
       └─ GET /api/v1/me
           │
           ├─ 200, tenant user  → setUser(), proceed
           │
           ├─ 200, platform user → clearStore(), setScopeError()
           │                        LoginPage shows amber warning
           │
           ├─ 401 (expired)
           │    └─ POST /api/v1/auth/refresh { refreshToken }
           │        │
           │        ├─ 200 OK
           │        │    → setToken(newAccessToken)
           │        │    → retry GET /api/v1/me
           │        │        ├─ 200, tenant user  → setUser(), proceed ✓
           │        │        ├─ 200, platform user → clearStore(), scopeError
           │        │        └─ failure           → clearStore()
           │        │
           │        └─ failure (404 not mounted, 401 invalid, network)
           │             → clearStore()   ← user must re-login
           │
           ├─ 403 (suspended / not activated) → clearStore()
           │
           └─ Network / 5xx → preserve token (optimistic), isLoading: false
                               page-level API calls surface errors contextually
       │
       └─ finally: setIsLoading(false) → ProtectedRoute renders or redirects
```

---

## Platform Scope Guard

SFO Core has two user scopes:
- `scope: "tenant"` + `tenantId: "TNT_..."` — normal dashboard user
- `scope: "platform"` + `tenantId: null` — SFG platform admin

Platform users pass `requireAuth` but fail `requireTenant` (null `tenantId`).
Without the guard, this caused an infinite redirect loop.

### Fix: two-checkpoint guard

**Checkpoint 1 — login:**
```
POST /api/v1/auth/login → user returned
  → if user.tenantId === null:
      setScopeError('Platform accounts cannot access...')
      throw new Error('platform_scope')   ← neither token is stored
  → else: setToken(), setRefreshToken(), setUser()
```

**Checkpoint 2 — hydration / refresh retry:**
```
GET /api/v1/me → user returned
  → if user.scope === 'platform' || user.tenantId === null:
      clearStore()              ← both tokens cleared
      setScopeError(msg)
      return                    ← isAuthenticated: false → redirect to /login
```

---

## Google OAuth — Current Status (Planned)

Frontend placeholder present. `POST /api/v1/auth/google` not yet implemented.
The "Continue with Google" button on `/login` is disabled.

**Planned flow when backend is ready:**
1. User clicks "Continue with Google"
2. Frontend builds OAuth URL with `VITE_GOOGLE_CLIENT_ID` and `redirect_uri = FRONTEND_URL/oauth/callback`
3. User approves Google consent screen → Google redirects to `/oauth/callback?code=AUTH_CODE`
4. `OAuthCallbackPage` POSTs `{ code, redirectUri }` to SFO Core
5. SFO Core exchanges code, resolves user, returns `{ accessToken, refreshToken, user }` (same shape as login)
6. Frontend stores both tokens, navigates to `/dashboard`

---

## Frontend Auth Architecture

### Files

| File | Role |
|---|---|
| `src/api/client.ts` | Axios instance; attaches Bearer token; 401 → refresh-then-retry interceptor |
| `src/store/authStore.ts` | Zustand store; `user`, `token`, `refreshToken`, `isLoading`, `isAuthenticated`, `scopeError` |
| `src/auth/service.ts` | `authService.login()`, `hydrateMe()`, `refreshAccessToken()`, `logout()`; `hydrateAuth()` startup function |
| `src/router/ProtectedRoute.tsx` | Route guard; holds at spinner while `isLoading`; redirects to `/login` if not authenticated |
| `src/App.tsx` | Calls `hydrateAuth()` on mount |

### Auth store state machine

```
App mounts
  │
  ├─ No stored access token
  │    isLoading: false, isAuthenticated: false
  │    → ProtectedRoute immediately redirects to /login
  │
  └─ Stored access token found
       isLoading: true, isAuthenticated: true (optimistic)
       → ProtectedRoute shows spinner
       → hydrateAuth() calls GET /api/v1/me
           │
           ├─ 200 OK, tenant   → setUser(), setIsLoading(false) → dashboard renders
           ├─ 200 OK, platform → clearStore(), scopeError → /login
           ├─ 401 (expired)    → try refresh → retry /me (see above)
           ├─ 401/403 (other)  → clearStore() → /login
           └─ Network/5xx      → setIsLoading(false) → dashboard renders (token preserved)
```

### localStorage keys

| Key (example) | Value | Set by |
|---|---|---|
| `sfg_access_token` | JWT access token | `authStore.setToken()` |
| `sfg_access_token_refresh` | Refresh token | `authStore.setRefreshToken()` |

Both keys are cleared by `authStore.logout()`.
The refresh token is sent only in `POST /api/v1/auth/refresh` request body.

---

## Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_URL` | Yes | SFO Core base URL with `/api/v1` prefix |
| `VITE_JWT_STORAGE_KEY` | No | Access token localStorage key; default `auth_token` |
| `VITE_JWT_REFRESH_KEY` | No | Refresh token localStorage key; default `${TOKEN_KEY}_refresh` |
| `VITE_GOOGLE_CLIENT_ID` | Planned | Public OAuth client ID — safe in browser |

Copy `.env.example` to `.env.local` to configure locally.

---

## Manual Test Steps

With SFO Core API running locally at `VITE_API_URL`:

1. **Login with demo credentials**
   - Navigate to `/login`, click a demo quick-login button
   - Open DevTools → Application → Local Storage
   - Expect: `sfg_access_token` AND `sfg_access_token_refresh` both present

2. **Expired access token (mid-session)**
   - While logged in, open DevTools → Application → Local Storage
   - Replace `sfg_access_token` value with an expired JWT
   - Navigate to `/jobs` (triggers GET /jobs)
   - Expect (when `/auth/refresh` route is live): seamless reload with new token
   - Expect (before route is live): logout → redirect to `/login`

3. **Invalid refresh token**
   - Replace `sfg_access_token_refresh` with `invalid_token`
   - Replace `sfg_access_token` with an expired JWT
   - Reload the page (triggers hydrateAuth → /me → refresh attempt)
   - Expect: redirect to `/login`, both localStorage keys cleared

4. **Platform account login**
   - Enter `jason@thewebsmithagency.com` credentials
   - Expect: amber warning on `/login` — "Platform accounts cannot access..."
   - Expect: neither token stored in localStorage

5. **Logout clears both tokens**
   - Click "Sign Out"
   - Check DevTools localStorage
   - Expect: both `sfg_access_token` and `sfg_access_token_refresh` removed

6. **No redirect loop**
   - Log in as platform user, confirm warning
   - Log in as employee demo user — expect clean `/dashboard` load
   - Verify no repeated network calls in DevTools Network tab
