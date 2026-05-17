# Authentication Flow

## Overview

SFG Showcase Web authentication is handled by the SFO Core API. This document describes how the frontend integrates with the backend auth system.

## Architecture

- **Auth ownership**: SFO Core API (`/api/v1/auth/*`)
- **Frontend responsibility**: Store JWT, inject into requests, manage session state
- **Credentials**: Email + password (future: Google OAuth)

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Set `VITE_API_URL` to your SFO Core API base including the `/api/v1` prefix
   (e.g., `http://localhost:3001/api/v1`)
3. `VITE_GOOGLE_CLIENT_ID` is a placeholder for future OAuth integration

## Current Implementation

### Auth Store (`src/auth/store.ts`)

Zustand store managing:
- `token`: JWT token from backend
- `user`: User profile (role, tenant, status)
- `getToken()`: Retrieve token for API calls
- `logout()`: Clear token and user
- `hydrate()`: Restore token from localStorage on app load

### API Client (`src/api/client.ts`)

Axios instance with:
- Base URL from `VITE_API_URL`
- Request interceptor: Injects `Authorization: Bearer <token>` header
- Response interceptor: Auto-logout on 401 Unauthorized

### Protected Routes (`src/routes/ProtectedRoute.tsx`)

Wrapper component to guard routes:
- Redirects unauthenticated users to `/login`
- Optional role-based access control (future)
- Not yet applied to dashboard (kept public for now)

## Future Integration Points

### Login Endpoint
```
POST /api/v1/auth/login
Request:  { email, password }
Response: { success, message, data: { accessToken, refreshToken, user } }

user shape: { id, email, firstName, lastName, role, status, scope, tenantId, features }
```

Note: the response envelope is always `{ success: boolean, message: string, data: T }`.
All API clients must access `.data` to reach the payload.

The frontend will:
1. Call `apiClient.post('/auth/login', { email, password })`
2. Read `response.data.data.accessToken` and `response.data.data.user`
3. Store token via `useAuthStore().setToken(accessToken)`
4. Store user via `useAuthStore().setUser(user)`
5. Navigate to dashboard

### User Profile Endpoint
```
GET /api/v1/me
Response: { success, message, data: { id, email, firstName, lastName, role, status, scope, tenantId } }
```

Note: `/me` does not return `features` or tokens — only the user profile.

### Refresh Token
The backend generates a `refreshToken` on login (returned in the login response)
and stores a `refreshAccessToken()` service method. However, **no `/api/v1/auth/refresh`
route is currently mounted**. The frontend stores `refreshToken` in the auth response
type for forward-compatibility but does not call a refresh endpoint yet.

### Google OAuth Flow (future)
1. User initiates login via Google Identity SDK
2. Google returns ID token to frontend
3. Frontend sends ID token to `POST /api/v1/auth/google`
4. Backend validates and returns JWT + user profile
5. Same flow as email/password from there

## Security Notes

- Tokens are stored in localStorage (consider HttpOnly cookies in production)
- API client automatically clears token on 401 responses
- Protected routes prevent navigation to guarded pages without auth
- All sensitive mutations require backend RBAC validation (frontend route hiding is not security)

## Testing Locally

1. Start SFO Core API on port 3000
2. Set `VITE_API_URL=http://localhost:3000/api` in `.env.local`
3. Visit login page, enter test credentials
4. On successful login, token is stored and subsequent API calls include it
