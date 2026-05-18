# Google OAuth Integration Plan

**Status:** Architectural planning complete. Implementation pending backend endpoint.  
**Last updated:** Week 2  
**Scope:** SFG Showcase Web (frontend) + SFO Core API (backend)

---

## Current State

| Layer | Status | Notes |
|---|---|---|
| Frontend — Google button UI | ✅ Present | Rendered on `/login`, disabled with pending note |
| Frontend — `/oauth/callback` route | ✅ Present | Loading placeholder, no live API calls |
| Frontend — Zustand auth store | ✅ Ready | `setToken` / `setUser` / `logout` all wired |
| Frontend — `VITE_GOOGLE_CLIENT_ID` | ⏳ Pending | Env var defined in `.env.example`, no value yet |
| Backend — `POST /api/v1/auth/google` | ❌ Missing | Does not exist in SFO Core auth routes |
| Backend — `googleId` on User model | ❌ Missing | User model has no OAuth identity field |
| Backend — `google-auth-library` | ❌ Missing | Not installed in SFO Core |
| Google Cloud Console project | ⏳ Pending | OAuth app not yet created |

**The OAuth flow cannot be activated until the backend endpoint is built.**  
The frontend is fully structured to receive and store tokens once it exists.

---

## Planned OAuth Flow (Authorization Code — PKCE not required, server-side exchange)

```
User clicks "Continue with Google"
        │
        ▼
Frontend builds Google OAuth URL
  • https://accounts.google.com/o/oauth2/v2/auth
  • params: client_id, redirect_uri, response_type=code, scope=openid email profile
  • redirect_uri = FRONTEND_URL/oauth/callback
        │
        ▼
Browser redirects to Google consent screen
        │
        ▼ (user approves)
Google redirects to: /oauth/callback?code=AUTH_CODE&state=...
        │
        ▼
OAuthCallbackPage mounts
  • Reads `code` from URL search params
  • POSTs { code, redirectUri } to SFO Core: POST /api/v1/auth/google
        │
        ▼
SFO Core backend (POST /api/v1/auth/google)
  • Exchanges code with Google → gets id_token + access_token
  • Verifies id_token with google-auth-library
  • Extracts: googleId, email, firstName, lastName, picture
  • Looks up User by googleId OR email
    ├─ Found → update lastLogin, issue JWT
    └─ Not found → reject (SFG is invite-only; no auto-provisioning via OAuth)
  • Returns: { accessToken, refreshToken, user }
        │
        ▼
OAuthCallbackPage receives response
  • Calls useAuthStore: setToken(accessToken), setUser(user)
  • Redirects to /dashboard
        │
        ▼
ProtectedRoute allows access → Dashboard renders
```

---

## Required Frontend Routes

| Route | Component | Purpose |
|---|---|---|
| `/login` | `LoginPage` | Entry point; houses Google button and email/password form |
| `/oauth/callback` | `OAuthCallbackPage` | Handles Google redirect; exchanges code; stores JWT |

Both routes are public (no auth required to reach them). `/oauth/callback` self-redirects to `/dashboard` after successful token exchange, or back to `/login` on error.

---

## Required Frontend State

All state lives in the existing Zustand `authStore`. No new state fields are needed.

| Action | Store method | Trigger |
|---|---|---|
| Store JWT after OAuth | `setToken(accessToken)` | `OAuthCallbackPage` on success |
| Store user profile | `setUser(user)` | `OAuthCallbackPage` on success |
| Handle loading during exchange | `setIsLoading(true/false)` | `OAuthCallbackPage` during fetch |
| Clear session on logout | `logout()` | Sidebar / header logout button |

### State shape expected from backend (matches existing `AuthResponse` type)

```typescript
// No changes to authStore.ts required.
// OAuthCallbackPage will call the same store methods as the login form.
{
  accessToken: string       // stored via setToken()
  refreshToken: string      // not stored in frontend currently — future use
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: 'owner' | 'general_manager' | 'assistant_manager' | 'employee'
    status: 'active' | 'invited' | 'suspended'
    tenantId: string | null
  }
}
```

---

## Required Backend Work (SFO Core API)

These items do not exist yet and must be built before OAuth can be activated.

### 1. Install `google-auth-library`

```bash
# In /mnt/d/sfg-api/apps/sfo-core-api
npm install google-auth-library
```

### 2. Add environment variables to SFO Core

```env
# .env in sfo-core-api — NEVER commit these values
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

> The `GOOGLE_CLIENT_SECRET` must live on the backend **only**. It must never appear in this frontend repository or in any `VITE_*` variable.

### 3. Add `googleId` to User model

```javascript
// In src/models/User.js — add to schema
googleId: {
  type: String,
  sparse: true,   // allows null + unique index without conflicts
  unique: true,
  index: true,
},
```

### 4. Add `googleLogin` to `auth.service.js`

```javascript
async googleLogin({ code, redirectUri }) {
  // Exchange authorization code for tokens with Google
  // Verify id_token with google-auth-library OAuth2Client
  // Extract googleId, email, firstName, lastName from payload
  // Look up user by googleId OR email
  // If not found: throw 'Account not provisioned' (no auto-create)
  // If suspended: throw 'Account is suspended'
  // Issue accessToken + refreshToken, update lastLogin
  // Return { user, accessToken, refreshToken }
}
```

### 5. Add route to `auth.routes.js`

```javascript
/**
 * POST /api/v1/auth/google
 * Exchange Google authorization code for SFG JWT
 */
router.post('/google', async (req, res) => {
  try {
    validateRequired(['code', 'redirectUri'], req.body);
    const { code, redirectUri } = req.body;
    const { user, accessToken, refreshToken } = await authService.googleLogin({ code, redirectUri });
    // ... build response DTO same shape as /login
    return successResponse(res, { accessToken, refreshToken, user }, 'Login successful');
  } catch (error) {
    return errorResponse(res, error.message, mapAuthErrorToStatus(error.message));
  }
});
```

---

## Required Google Cloud Console Settings

1. **Create a new project** (or use an existing one) at https://console.cloud.google.com
2. Enable the **Google Identity** API (People API or just OAuth 2.0 — no extra APIs needed for basic sign-in)
3. Create **OAuth 2.0 credentials** (Web application type):
   - **Authorized JavaScript origins:**
     - `http://localhost:5173` (local dev)
     - `https://sfg-showcase.vercel.app` (production — update when Vercel URL confirmed)
   - **Authorized redirect URIs:**
     - `http://localhost:5173/oauth/callback` (local dev)
     - `https://sfg-showcase.vercel.app/oauth/callback` (production)
4. Copy the **Client ID** → `VITE_GOOGLE_CLIENT_ID` in frontend `.env.local` and Vercel env settings
5. Copy the **Client Secret** → `GOOGLE_CLIENT_SECRET` in SFO Core API environment **only** (Fly.io secrets)

> **Never put the Client Secret in this repository.** It goes on the backend server as an environment secret, not in any frontend env file.

---

## Frontend Implementation Checklist (when backend is ready)

- [ ] Set `VITE_GOOGLE_CLIENT_ID` in `.env.local` with real value from Google Cloud Console
- [ ] Set `VITE_GOOGLE_CLIENT_ID` in Vercel environment settings
- [ ] Enable the Google button on `LoginPage` (remove `disabled`, wire click handler)
- [ ] Implement `buildGoogleAuthUrl()` utility:
  ```typescript
  // src/utils/oauth.utils.ts
  export function buildGoogleAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}/oauth/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
    })
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }
  ```
- [ ] Wire Google button `onClick` to `window.location.href = buildGoogleAuthUrl()`
- [ ] Implement token exchange in `OAuthCallbackPage`:
  ```typescript
  // Read `code` from URL: new URLSearchParams(window.location.search).get('code')
  // POST to: ${VITE_API_URL}/auth/google with { code, redirectUri }
  // On success: setToken(), setUser(), navigate('/dashboard')
  // On error: navigate('/login?error=oauth_failed')
  ```
- [ ] Test full round-trip: Google consent → callback → JWT stored → dashboard
- [ ] Update `docs/auth-flow.md` with completed OAuth flow

---

## Security Notes

| Concern | Handling |
|---|---|
| Client Secret exposure | Secret lives on SFO Core backend only. Frontend only has `VITE_GOOGLE_CLIENT_ID` (public identifier). |
| `state` parameter (CSRF) | Optional enhancement — generate a random nonce, store in sessionStorage, verify on callback. Add in Week 2 implementation if time allows. |
| JWT storage | `localStorage` — acceptable for this demo showcase. Production recommendation: `httpOnly` cookie via SFO Core. |
| Token on redirect | Authorization `code` is in the URL only briefly; the frontend exchanges it immediately for a JWT. The code itself is single-use. |
| Auto-provisioning | Disabled by design. Google OAuth resolves to an **existing** provisioned SFG user only. Unknown Google accounts receive a 403. |

---

## Error States (`/oauth/callback` must handle)

| Scenario | Google returns | Frontend behavior |
|---|---|---|
| User denies consent | `?error=access_denied` | Show "Sign-in cancelled" message, link to `/login` |
| Invalid/expired code | Backend 400 | Show "Sign-in failed" message, link to `/login` |
| Account not provisioned | Backend 403 | Show "No account found. Request access below." link to `/signup` |
| Account suspended | Backend 403 | Show "Account suspended. Contact your administrator." |
| Network error | fetch throws | Show generic error, link to `/login` |
