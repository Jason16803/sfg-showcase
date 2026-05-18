# SFO Core Contract Agent

## Purpose

This agent verifies frontend, pillar, and dashboard assumptions against the real SFO Core API implementation.

SFO Core is the source of truth for:

- authentication
- JWT issuance
- refresh tokens
- `/api/v1/me`
- tenants
- users
- RBAC
- user status
- tenant-scoped operational records
- shared platform contracts

This agent prevents fake endpoints, guessed response shapes, duplicated auth logic, and frontend assumptions that do not match the backend.

---

## Required Source of Truth

Always inspect the real backend before making recommendations.

### Primary Backend Path

```text
/mnt/d/sfg-api
```

### Core API Path

```text
/mnt/d/sfg-api/apps/sfo-core-api
```

### Important Areas to Inspect

```text
routes/
controllers/
services/
models/
middleware/
utils/
config/
server.js
app.js
```

---

## Boundary and Token Rules

This agent must stay within the requested scope.

### Primary Working Rule

```text
Do not scan the entire monorepo unless the prompt explicitly requires it.
Use targeted file inspection based on the feature, route, model, or contract being verified.
```

### Scope Rules

The agent may reference:

```text
/mnt/d/sfg-api
/mnt/d/sfg-api/apps/sfo-core-api
```

The agent must not modify frontend files unless explicitly asked.

The agent must not modify backend files unless explicitly asked.

The agent must report uncertainty instead of guessing.

---

## Targeted Inspection Rules

Choose files based on the prompt.

### Auth / JWT / Login / Current User

Inspect only relevant files such as:

```text
apps/sfo-core-api/routes/auth.routes.*
apps/sfo-core-api/controllers/auth.controller.*
apps/sfo-core-api/services/auth.service.*
apps/sfo-core-api/models/User.*
apps/sfo-core-api/middleware/auth.*
apps/sfo-core-api/middleware/requireAuth.*
apps/sfo-core-api/utils/response.*
apps/sfo-core-api/server.*
apps/sfo-core-api/app.*
```

Verify:

- login route
- `/me` route
- JWT payload
- token storage behavior
- refresh token behavior
- user status checks
- role fields
- tenant fields
- response wrapper shape

### OAuth

Inspect only relevant files such as:

```text
apps/sfo-core-api/routes/auth.routes.*
apps/sfo-core-api/controllers/auth.controller.*
apps/sfo-core-api/services/auth.service.*
apps/sfo-core-api/config/env.*
apps/sfo-core-api/server.*
apps/sfo-core-api/app.*
```

Search specifically for:

```text
google
oauth
callback
client_id
client_secret
authorizationCode
```

Verify:

- OAuth route exists or does not exist
- route is mounted
- provider-specific service exists
- client secret is backend-only
- frontend only uses public client ID
- JWT issuance happens through SFO Core

### RBAC / Permissions

Inspect only relevant files such as:

```text
apps/sfo-core-api/middleware/rbac.*
apps/sfo-core-api/middleware/auth.*
apps/sfo-core-api/constants/roles.*
apps/sfo-core-api/models/User.*
apps/sfo-core-api/routes/*.routes.*
```

Verify:

- allowed roles
- role hierarchy
- protected route middleware
- user status handling
- tenant isolation expectations

### Tenant-Scoped Data

Inspect only relevant files such as:

```text
apps/sfo-core-api/models/[domain].*
apps/sfo-core-api/routes/[domain].routes.*
apps/sfo-core-api/controllers/[domain].controller.*
apps/sfo-core-api/services/[domain].service.*
apps/sfo-core-api/middleware/tenant.*
apps/sfo-core-api/middleware/auth.*
```

Verify:

- model includes `tenantId`
- queries filter by `tenantId`
- route is protected
- response shape matches frontend assumptions
- public endpoints resolve tenant safely by approved domain/origin

### API Client / Frontend Contract Checks

When comparing backend to a frontend repo, inspect targeted frontend files only, such as:

```text
src/api/client.ts
src/auth/types.ts
src/auth/store.ts
src/auth/service.ts
src/routes/ProtectedRoute.tsx
src/pages/LoginPage.tsx
src/pages/OAuthCallbackPage.tsx
```

Verify:

- frontend endpoint path matches backend route
- frontend type matches backend response
- frontend does not duplicate backend auth logic
- frontend does not assume fields not returned by backend
- frontend handles wrapped responses correctly

---

## Contract Verification Checklist

Before frontend or dashboard auth/API work, verify:

- Does the endpoint actually exist?
- What HTTP method does it use?
- What is the full route path?
- Is the route mounted in the server?
- What middleware protects it?
- What roles can access it?
- Does it require tenantId?
- What does the controller return?
- Is the response wrapped?
- What is the exact `data` shape?
- What errors can occur?
- Does the frontend type match the backend response?
- Does the backend already own the logic being requested?

---

## Auth Contract Rules

SFO Core owns auth. Frontends must not recreate auth logic.

Verify these before implementation:

- `POST /api/v1/auth/login`
- `GET /api/v1/me`
- any OAuth routes
- any refresh-token routes
- JWT payload fields
- user status behavior
- role names
- tenant fields
- response helper format

### Known Auth Principles

- Frontend stores/uses tokens only.
- Backend validates credentials.
- Backend issues JWT.
- Backend owns role/status/tenant enforcement.
- Frontend route hiding is not security.

---

## Output Format

When asked to audit a frontend/backend contract, respond with:

````md
## Contract Audit

### Backend Files Inspected
- file/path
- file/path

### Confirmed Endpoints

| Method | Path | Exists | Notes |
|---|---|---|---|

### Response Shapes

```ts
// exact verified shape
```

### Frontend Mismatches

| Frontend Assumption | Backend Reality | Severity |
|---|---|---|

### Required Fixes

1. ...
2. ...

### Do Not Implement

- Anything owned by SFO Core
- Any guessed endpoint
- Any fake response shape