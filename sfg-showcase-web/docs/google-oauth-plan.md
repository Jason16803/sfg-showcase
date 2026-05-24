# Google OAuth Integration Plan

**Status:** Frontend implementation complete. Backend endpoint required to activate.  
**Last updated:** Week 3 — OAuth wired  
**Scope:** SFG Showcase Web (frontend) + SFO Core API (backend)

---

## Current State

| Layer | Status | Notes |
|---|---|---|
| Frontend — Google button UI | ✅ Active | Enabled, wired to `GET ${VITE_API_URL}/auth/google` |
| Frontend — `/oauth/callback` route | ✅ Implemented | Reads tokens, stores them, calls `/me`, scope-guards, navigates to `/dashboard` |
| Frontend — Zustand auth store | ✅ Ready | `setToken`, `setRefreshToken`, `setUser`, `logout`, `setScopeError` all wired |
| Frontend — `VITE_GOOGLE_CLIENT_ID` | ✅ Set | Present in `.env`; used by Google Cloud Console, not directly by frontend code |
| Frontend — `src/utils/oauth.utils.ts` | ✅ New | Token extraction, error mapping |
| Backend — `GET /api/v1/auth/google` | ❌ Missing | Must redirect browser to Google consent screen |
| Backend — `GET /api/v1/auth/google/callback` | ❌ Missing | Must exchange code, issue JWT, redirect to frontend |
| Backend — `googleId` on User model | ❌ Missing | User model needs OAuth identity field |
| Backend — `google-auth-library` | ❌ Missing | Not installed in SFO Core |
| Google Cloud Console — redirect URI | ⚠ Verify | `http://localhost:PORT/oauth/callback` must be in Authorized redirect URIs |

---

## OAuth Flow — Server-Side (Backend-Initiated)

This project uses **server-side OAuth** — the backend orchestrates the entire
Google exchange. The frontend never handles the authorization code directly.

```
User clicks "Continue with Google"
        │
        ▼
window.location.href = `${VITE_API_URL}/auth/google`
  ↳ GET https://sfo-core-api.fly.dev/api/v1/auth/google
        │
        ▼
SFO Core builds Google OAuth consent URL and redirects:
  https://accounts.google.com/o/oauth2/v2/auth
    ?client_id=GOOGLE_CLIENT_ID           ← backend env var only
    &redirect_uri=BACKEND_CALLBACK_URL    ← points to SFO Core, not frontend
    &response_type=code
    &scope=openid email profile
        │
        ▼
Browser loads Google consent screen — user approves
        │
        ▼
Google redirects to SFO Core's backend callback:
  GET ${BACKEND_URL}/api/v1/auth/google/callback?code=AUTH_CODE&state=...
        │
        ▼
SFO Core backend callback handler:
  1. Exchanges code with Google → id_token + access_token
  2. Verifies id_token with google-auth-library
  3. Extracts: googleId, email, firstName, lastName
  4. Looks up User by googleId OR email
     ├─ Found, active tenant user → issue JWT pair
     └─ Not found / suspended / platform → redirect with error param
  5. Redirects browser to frontend:
     ${FRONTEND_ORIGIN}/oauth/callback?accessToken=xxx&refreshToken=yyy
        │
        ▼
OAuthCallbackPage mounts at /oauth/callback
  1. parseOAuthCallback() reads tokens from URL query params
  2. Stores accessToken + refreshToken via authStore
  3. window.history.replaceState → cleans tokens from URL bar
  4. GET /api/v1/me → verify session, get user profile (scope, tenantId)
  5. Platform scope guard — clears tokens if platform user
  6. navigate('/dashboard', { replace: true })
        │
        ▼
ProtectedRoute allows access → Dashboard renders
```

---

## Token Delivery from Backend

The backend redirect to the frontend should carry tokens as **URL query params**:

```
${FRONTEND_ORIGIN}/oauth/callback?accessToken=<JWT>&refreshToken=<token>
```

`parseOAuthCallback()` in `src/utils/oauth.utils.ts` also checks:
- Snake_case variants: `access_token`, `refresh_token`
- URL hash fragment (fallback): `#accessToken=xxx&refreshToken=yyy`

---

## Error Delivery from Backend or Google

The backend should redirect with an `?error=` param on failure:

| Condition | Redirect | Page message |
|---|---|---|
| User cancels Google consent | `?error=access_denied` | "Sign-in cancelled" |
| No SFG account for Google identity | `?error=unauthorized` | "No account found" |
| Account suspended | `?error=suspended` | "Account suspended" |
| Platform account | `?error=platform_scope` | "Platform account" |
| Exchange failure | `?error=server_error&message=...` | Generic message |

Frontend also handles:
- Empty callback (no tokens, no error) → "No credentials received"
- `/me` failure after storing tokens → "Session verification failed"
- `/me` returns platform user → scope guard clears tokens, shows message

---

## Frontend File Map

| File | Role |
|---|---|
| `src/pages/LoginPage.tsx` | Google button with `onClick` → `window.location.href` |
| `src/pages/OAuthCallbackPage.tsx` | Token processing, /me verification, navigate to /dashboard |
| `src/utils/oauth.utils.ts` | `parseOAuthCallback()`, `oauthErrorInfo()` |
| `src/auth/service.ts` | `authService.hydrateMe()` — called by OAuthCallbackPage |
| `src/store/authStore.ts` | `setToken()`, `setRefreshToken()`, `logout()`, `setScopeError()` |

---

## Environment Variables

| Variable | Location | Notes |
|---|---|---|
| `VITE_API_URL` | Frontend `.env` | Used for the Google button redirect + all API calls |
| `VITE_GOOGLE_CLIENT_ID` | Frontend `.env` | Present; not used in frontend code (backend-initiated flow) |
| `GOOGLE_CLIENT_ID` | SFO Core `.env` | **Backend only** — used when building the Google consent URL |
| `GOOGLE_CLIENT_SECRET` | SFO Core `.env` | **Backend only** — used for code exchange. **Never in frontend.** |

> `VITE_GOOGLE_CLIENT_ID` is present in the frontend for potential future use
> (e.g., adding a `state` CSRF parameter or displaying the client ID in UI).
> In the current backend-initiated flow, the backend uses its own `GOOGLE_CLIENT_ID`.

---

## Required Backend Work (SFO Core API)

### 1. Install `google-auth-library`

```bash
cd /mnt/d/sfg-api/apps/sfo-core-api
npm install google-auth-library
```

### 2. Add environment variables to SFO Core

```env
# .env in sfo-core-api — NEVER commit these
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_ORIGIN=http://localhost:5173          # local dev
# FRONTEND_ORIGIN=https://sfg-showcase.vercel.app  # production
```

### 3. Add `googleId` to User model

```javascript
// src/models/User.js
googleId: {
  type:   String,
  sparse: true,   // null values don't conflict with the unique index
  unique: true,
  index:  true,
},
```

### 4. Add routes to `auth.routes.js`

```javascript
/**
 * GET /api/v1/auth/google
 * Initiates Google OAuth — redirects browser to Google consent screen.
 */
router.get('/google', (req, res) => {
  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID,
    redirect_uri:  `${process.env.API_URL}/auth/google/callback`,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'offline',
    prompt:        'consent',
  })
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
})

/**
 * GET /api/v1/auth/google/callback
 * Receives authorization code from Google, exchanges it, issues JWT,
 * then redirects browser to frontend /oauth/callback with tokens.
 */
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query
    const { user, accessToken, refreshToken } = await authService.googleLogin({
      code,
      redirectUri: `${process.env.API_URL}/auth/google/callback`,
    })
    const params = new URLSearchParams({ accessToken, refreshToken })
    res.redirect(`${process.env.FRONTEND_ORIGIN}/oauth/callback?${params}`)
  } catch (error) {
    const params = new URLSearchParams({ error: error.message ?? 'server_error' })
    res.redirect(`${process.env.FRONTEND_ORIGIN}/oauth/callback?${params}`)
  }
})
```

### 5. Add `googleLogin` to `auth.service.js`

```javascript
async googleLogin({ code, redirectUri }) {
  const { OAuth2Client } = require('google-auth-library')
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  )

  const { tokens } = await client.getToken(code)
  const ticket = await client.verifyIdToken({
    idToken:  tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  })
  const payload = ticket.getPayload()

  const googleId  = payload.sub
  const email     = payload.email
  const firstName = payload.given_name  ?? ''
  const lastName  = payload.family_name ?? ''

  // Look up user — no auto-provisioning; SFG is invite-only
  let user = await User.findOne({
    $or: [{ googleId }, { email }],
    status: 'active',
  })

  if (!user)       throw new Error('unauthorized')
  if (user.scope === 'platform') throw new Error('platform_scope')

  // Link googleId if not already linked
  if (!user.googleId) {
    user.googleId = googleId
    await user.save()
  }

  user.lastLogin = new Date()
  await user.save()

  return authService.issueTokens(user)  // returns { accessToken, refreshToken, user }
}
```

---

## Google Cloud Console Setup

1. Go to https://console.cloud.google.com → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. **Authorized redirect URIs** — add ALL of:
   - `http://localhost:5000/api/v1/auth/google/callback` (local backend)
   - `https://sfo-core-api.fly.dev/api/v1/auth/google/callback` (production backend)
4. Copy Client ID → backend `GOOGLE_CLIENT_ID` + frontend `VITE_GOOGLE_CLIENT_ID`
5. Copy Client Secret → backend `GOOGLE_CLIENT_SECRET` only (**never in frontend**)

> Note: The redirect URI points to the **backend callback**, not the frontend.
> The backend then redirects to the frontend after token exchange.

---

## Security Notes

| Concern | Handling |
|---|---|
| Client Secret | Backend only (`GOOGLE_CLIENT_SECRET`). Never in any `VITE_*` variable. |
| Tokens in URL | Cleared from URL bar by `window.history.replaceState` after storage. |
| Platform scope | `/me` response `scope` field triggers guard; tokens cleared if platform user. |
| State / CSRF | Not implemented — low risk for demo. Add random nonce → sessionStorage verification in production. |
| JWT storage | `localStorage` — acceptable for demo. Production: `httpOnly` cookie via SFO Core. |
| Auto-provisioning | Disabled. Google OAuth resolves to an existing provisioned SFG user only. |

---

## Frontend Implementation Checklist

- [x] `VITE_GOOGLE_CLIENT_ID` set in `.env`
- [x] Google button enabled — `onClick` wires to `window.location.href = \`${VITE_API_URL}/auth/google\``
- [x] `OAuthCallbackPage.tsx` — reads tokens, stores them, calls `/me`, scope-guards, navigates
- [x] `src/utils/oauth.utils.ts` — `parseOAuthCallback()`, `oauthErrorInfo()`
- [x] Error states: access_denied, unauthorized, suspended, platform_scope, missing tokens, /me failure
- [x] Tokens cleaned from URL bar after storage
- [x] React 18 StrictMode double-invoke guard (`useRef(false)`)
- [ ] Backend `GET /api/v1/auth/google` — redirects to Google
- [ ] Backend `GET /api/v1/auth/google/callback` — exchanges code, redirects to frontend
- [ ] Backend: `google-auth-library` installed
- [ ] Backend: `googleId` field on User model
- [ ] Backend: `googleLogin()` in auth.service.js
- [ ] Google Cloud Console: Authorized redirect URIs include backend callback URL
- [ ] End-to-end test: Google button → consent → /oauth/callback → /dashboard
