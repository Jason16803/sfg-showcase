# Authentication Flow

## Overview

SFG Showcase Web authentication is handled by the SFO Core API. This document describes how the frontend integrates with the backend auth system.

## Architecture

- **Auth ownership**: SFO Core API (`/api/v1/auth/*`)
- **Frontend responsibility**: Store JWT, inject into requests, manage session state
- **Credentials**: Email + password (future: Google OAuth)

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Set `VITE_API_URL` to your SFO Core API base (e.g., `http://localhost:3000/api`)
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
Response: { token, user }
```

The frontend will:
1. Call `apiClient.post('/auth/login', { email, password })`
2. Receive JWT token and user profile
3. Store token via `useAuthStore().setToken(token)`
4. Navigate to dashboard

### User Profile Endpoint
```
GET /api/v1/me
Response: { user }
```

Used to refresh user data and verify token validity on app load.

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
