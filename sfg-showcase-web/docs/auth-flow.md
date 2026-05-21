# Auth Flow — SFG Showcase Web

**Week 3 status:** Email/password JWT login fully wired to SFO Core API.  
**Backend:** SFO Core API (`/mnt/d/sfg-api/apps/sfo-core-api`)  
**Frontend:** SFG Showcase Web (`sfg-showcase-web`)

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

## Verified Backend Endpoints (Phase 3)

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
      accessToken: string,     ← JWT, signed with server secret
      refreshToken: string,    ← stored on User document in MongoDB
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

---

## JWT Behavior

- **Payload:** `{ userId }` — role and tenantId are NOT embedded in the token
- **Verification:** every request through `requireAuth` middleware fetches the
  full User document from MongoDB, so status changes take effect immediately
  without waiting for token expiry
- **Access token expiry:** controlled by `config.jwt.accessExpiry` on SFO Core
- **Refresh token:** stored on the User document; `authService.refreshAccessToken()`
  exists on the backend but **no `/api/v1/auth/refresh` route is mounted yet**

---

## Refresh Token — Current Status

The SFO Core auth service has `refreshAccessToken()` implemented but it is
not exposed via any HTTP route. The frontend cannot request a new access token
when the current one expires.

**Current behavior on expiry:** the expired JWT causes the next authenticated
request to return `401 'Token has expired'`. The `api/client.ts` response
interceptor catches this 401, calls `useAuthStore.getState().logout()`, and
the user is redirected to `/login`.

**Planned behavior (when backend route is added):**
```
accessToken expires
  → request returns 401 'Token has expired'
  → client intercepts 401
  → POST /api/v1/auth/refresh with refreshToken from localStorage
  → receives new accessToken
  → retries original request transparently
```
This will be implemented when SFO Core exposes the refresh route.

---

## Google OAuth — Current Status (Planned)

**Status:** Frontend placeholder present. Backend endpoint missing.

The "Continue with Google" button on `/login` is rendered but disabled.
`POST /api/v1/auth/google` does not exist in SFO Core yet.

**Planned flow when backend is ready:**
1. User clicks "Continue with Google"
2. Frontend builds Google OAuth URL with `VITE_GOOGLE_CLIENT_ID` and
   `redirect_uri = FRONTEND_URL/oauth/callback`
3. User approves Google consent screen
4. Google redirects to `/oauth/callback?code=AUTH_CODE`
5. `OAuthCallbackPage` POSTs `{ code, redirectUri }` to SFO Core
6. SFO Core exchanges code with Google, resolves or rejects user
7. SFO Core returns `{ accessToken, refreshToken, user }` (same shape as login)
8. Frontend stores token + user, navigates to `/dashboard`

**Google credential handling:**
- Client ID → `VITE_GOOGLE_CLIENT_ID` (browser-safe, in `.env.example`)
- Client Secret → SFO Core API environment only (Fly.io secrets, never frontend)

See `docs/google-oauth-plan.md` for the full activation checklist.

---

## Frontend Auth Architecture

### Files

| File | Role |
|---|---|
| `src/api/client.ts` | Axios instance; attaches Bearer token; 401 response interceptor → auto-logout |
| `src/store/authStore.ts` | Zustand store; `user`, `token`, `isLoading`, `isAuthenticated` |
| `src/auth/service.ts` | `authService.login()`, `authService.hydrateMe()`, `authService.logout()`; `hydrateAuth()` startup function; `friendlyAuthError()` helper |
| `src/router/ProtectedRoute.tsx` | Route guard; holds at spinner while `isLoading`; redirects to `/login` if not authenticated |
| `src/App.tsx` | Calls `hydrateAuth()` on mount via `useEffect` |

### Auth store state machine

```
App mounts
  │
  ├─ No stored token
  │    isLoading: false, isAuthenticated: false
  │    → ProtectedRoute immediately redirects to /login
  │
  └─ Stored token found
       isLoading: true, isAuthenticated: true (optimistic)
       → ProtectedRoute shows spinner
       → hydrateAuth() calls GET /api/v1/me
           │
           ├─ 200 OK   → setUser(), setIsLoading(false) → dashboard renders
           ├─ 401/403  → logout() → isAuthenticated: false → redirect to /login
           └─ Network  → setIsLoading(false) → dashboard renders (token preserved)
```

### localStorage keys

| Key | Value | Set by |
|---|---|---|
| `auth_token` (or `VITE_JWT_STORAGE_KEY`) | JWT access token string | `authStore.setToken()` |

The refresh token is NOT stored in localStorage — it lives only on the
User document in MongoDB Atlas (managed by SFO Core).

---

## Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_URL` | Yes | SFO Core base URL with `/api/v1` prefix |
| `VITE_GOOGLE_CLIENT_ID` | Planned | Public OAuth client ID — safe in browser |
| `VITE_JWT_STORAGE_KEY` | No | localStorage key; defaults to `auth_token` |

Copy `.env.example` to `.env.local` to configure locally.
Never commit `.env.local`. Never put `GOOGLE_CLIENT_SECRET` here.

---

## Manual Test Steps

With SFO Core API running locally at `http://localhost:3001`:

1. **Login with valid credentials**
   - Navigate to `http://localhost:5173/login`
   - Enter a valid email + password for a seeded tenant user
   - Expect: redirect to `/dashboard`, user name visible in sidebar header

2. **Login with wrong password**
   - Enter valid email, wrong password
   - Expect: "Incorrect email or password. Please try again." banner

3. **Login with suspended account**
   - Use a user with `status: 'suspended'`
   - Expect: "Your account has been suspended." banner

4. **Session persistence on reload**
   - Log in, then hard-refresh the page (`Cmd+Shift+R`)
   - Expect: spinner briefly shown, then dashboard renders (not redirected to login)

5. **Session cleared on logout**
   - Click "Sign Out" in sidebar
   - Expect: redirect to `/login`, localStorage `auth_token` key removed

6. **Protected route redirect**
   - While logged out, navigate directly to `http://localhost:5173/dashboard`
   - Expect: immediate redirect to `/login`

7. **Showcase removed (Week 3)**
   - `/showcase-dashboard` was removed after Week 3 beta wiring
   - `DashboardPage` now only mounts behind `ProtectedRoute`
   - Navigate directly to `http://localhost:5173/dashboard` after logging in

8. **Expired token on reload**
   - Manually set a past-expiry JWT in localStorage under `auth_token`
   - Reload the app and navigate to `/dashboard`
   - Expect: spinner → 401 from `/me` → logout → redirect to `/login`
