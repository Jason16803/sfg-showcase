# OAuth Callback — Frontend Behavior & Backend Requirements

This document covers the Google OAuth frontend flow in `sfg-showcase-web`, the expected backend contract, and the error codes the frontend handles.

---

## Frontend Flow

### Happy path

```
User clicks "Continue with Google" on /login or /signup
  → window.location.href = ${VITE_API_URL}/auth/google
  → Backend redirects to Google consent screen
  → User approves
  → Google redirects to SFO Core callback route
  → SFO Core issues JWT, redirects browser to:
      ${FRONTEND_ORIGIN}/oauth/callback?accessToken=xxx&refreshToken=yyy
  → OAuthCallbackPage.tsx:
      1. parseOAuthCallback() reads tokens from URL
      2. setToken(accessToken) + setRefreshToken(refreshToken) → localStorage
      3. window.history.replaceState('', '', '/oauth/callback')  ← tokens removed from URL
      4. GET /api/v1/me to verify session and restore user object
      5. Platform-scope guard (tenantId === null → logout + error)
      6. navigate('/dashboard', { replace: true })
```

### Error path

```
Backend redirects to:
  ${FRONTEND_ORIGIN}/oauth/callback?error=<code>&message=<optional>
  → OAuthCallbackPage parses error from URL
  → oauthErrorInfo(error) maps code → { title, body, recovery[] }
  → Renders polished error card with contextual recovery actions
```

---

## Token URL Format

The frontend accepts both camelCase and snake_case token keys, and both query string and URL hash delivery:

| Format | Example |
|---|---|
| Query params (camelCase) | `?accessToken=xxx&refreshToken=yyy` |
| Query params (snake_case) | `?access_token=xxx&refresh_token=yyy` |
| Hash (camelCase) | `#accessToken=xxx&refreshToken=yyy` |
| Hash (snake_case) | `#access_token=xxx&refresh_token=yyy` |

**Query params are preferred.** Hash delivery is accepted as a fallback for OAuth libraries that use it.

---

## Error Codes

The frontend handles these error codes arriving in `?error=<code>`:

| Code | Source | Recovery actions shown |
|---|---|---|
| `access_denied` | Google | Try again, Back to Sign In |
| `unauthorized` | SFO Core | Request access, Back to Sign In, Contact support |
| `account_not_found` | SFO Core | Same as `unauthorized` |
| `suspended` | SFO Core | Contact support, Back to Sign In |
| `platform_scope` | SFO Core | Back to Sign In |
| `not_active` | SFO Core | Contact support, Back to Sign In |
| `account_not_active` | SFO Core | Same as `not_active` |
| `oauth_unavailable` | SFO Core | Back to Sign In, Contact support |
| `missing_tokens` | Frontend | Try again, Back to Sign In, Contact support |
| `expired_session` | Frontend | Back to Sign In, Try again |

**Frontend-generated codes** (`missing_tokens`, `expired_session`) are never sent in a URL — they are generated internally when:
- `missing_tokens`: callback URL has no tokens and no error param
- `expired_session`: tokens were stored but `GET /api/v1/me` returned 401

---

## StrictMode Double-Invoke Protection

OAuthCallbackPage uses a `useRef(false)` guard (`hasRun`) to ensure the token
processing effect fires exactly once, even in React 18 StrictMode which mounts
effects twice in development.

```tsx
const hasRun = useRef(false)
useEffect(() => {
  if (hasRun.current) return
  hasRun.current = true
  // ... token processing
}, [...deps])
```

---

## Backend Requirements

These backend endpoints must exist for Google OAuth to function:

### 1. OAuth initiation — `GET /api/v1/auth/google`

Redirects the browser to Google's OAuth consent screen. No request body.

The backend configures the Google redirect URI to its own callback route (not the frontend).

### 2. OAuth server callback — handled internally by SFO Core

After Google redirects back to SFO Core:
- Exchange authorization code for Google tokens
- Look up or create the SFG user record
- Issue `accessToken` (JWT, short-lived) and `refreshToken` (longer-lived)
- Redirect browser to:
  ```
  ${FRONTEND_ORIGIN}/oauth/callback?accessToken=...&refreshToken=...
  ```
  On error:
  ```
  ${FRONTEND_ORIGIN}/oauth/callback?error=<code>&message=<optional_description>
  ```

### 3. `FRONTEND_ORIGIN` environment variable

SFO Core must have `FRONTEND_ORIGIN` (or equivalent) configured to the deployed Vercel URL.

For local dev: `http://localhost:5173`
For production: `https://<your-vercel-deployment>.vercel.app`

### 4. CORS

SFO Core must allow the frontend origin in its `CORS_ORIGIN` configuration.

---

## Request-Access OAuth Flow (Signup)

When a Google user does NOT have an existing SFG account, the backend should:

1. **Do NOT issue a JWT or create a workspace.**
2. Create a `PendingAccessRequest` MongoDB document:
   ```json
   {
     "googleId": "...",
     "email": "user@example.com",
     "firstName": "...",
     "lastName": "...",
     "requestedAt": "<ISO timestamp>",
     "status": "pending"
   }
   ```
3. Send admin notification email via Resend to `ADMIN_NOTIFICATION_EMAIL`.
4. Redirect to frontend with `?error=unauthorized` — the frontend will show "Request access" recovery action pointing to `/signup`.

Until this is implemented: clicking "Continue with Google" on `/signup` redirects to the same OAuth URL. The backend will see an unknown user and return `error=unauthorized`, which the frontend handles correctly with a "Request access" link.

---

## Relevant Files

| File | Purpose |
|---|---|
| `src/pages/OAuthCallbackPage.tsx` | Page component — processes tokens, renders states |
| `src/pages/OAuthCallbackPage.scss` | Card styles, action buttons, spinner |
| `src/utils/oauth.utils.ts` | `parseOAuthCallback()`, `oauthErrorInfo()`, types |
| `src/auth/service.ts` | `hydrateMe()`, `authService.logout()` |
| `src/store/authStore.ts` | `setToken()`, `setRefreshToken()`, `setScopeError()` |
