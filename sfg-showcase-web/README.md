# SFG Showcase Web

**SFG Showcase Web** is the public-facing demo and marketing site for the **SmithForgd (SFG) platform** — a modular, API-first, multi-tenant business management system. This repository contains the frontend application for the **service vertical showcase**, built as a Vite + React + TypeScript single-page application.

The site demonstrates what a real service-business dashboard powered by SmithForgd Systems looks like, targeted at prospective clients and academic reviewers. It is clearly marked as a demo environment throughout the UI.


---

## TL;DR

SFG Showcase Web is a React + TypeScript frontend demo for the SmithForgd Systems (SFG) platform.

This project demonstrates:
- a modern SaaS dashboard UI
- JWT authentication scaffolding
- planned Google OAuth integration
- environment variable configuration
- protected route architecture
- frontend/backend separation

Frontend stack:
- Vite
- React
- TypeScript
- SCSS
- Zustand
- Axios

Backend responsibilities are handled by the separate SFO Core API:
- authentication
- Google OAuth
- JWT generation
- MongoDB Atlas persistence
- tenant/user management

This repository focuses on the frontend experience while consuming the backend through REST API endpoints.

---

---

## Table of Contents

- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Local URLs and Links](#local-urls-and-links)
- [Project Structure](#project-structure)
- [School Requirement Crosswalk — Week 1](#school-requirement-crosswalk--week-1)
- [Week 2 Planning — OAuth Integration](#week-2-planning--oauth-integration)
- [GitHub Project Workflow](#github-project-workflow)
- [Academic Integrity Note](#academic-integrity-note)

---

## Project Overview

### What this application is

SFG Showcase Web is a frontend-only React application that consumes the existing **SFO Core API** — the shared backend that owns authentication, user management, tenant isolation, and RBAC for the broader SFG platform.

This repository does **not** contain any backend code. The backend is a separate, independently hosted Node.js/Express/MongoDB service. The frontend communicates with it exclusively through the `VITE_API_URL` environment variable.

### Dashboard Preview

The `/showcase-dashboard` route renders a publicly accessible preview of the SFG service-vertical dashboard. It demonstrates the layout, components, metrics, and data table patterns a real tenant would see after logging in. This route does not require authentication and is intentionally public so reviewers and prospective clients can evaluate the UI without credentials.

### Login and Signup UI

| Route | Purpose |
|---|---|
| `/login` | Email + password sign-in form. Connects to `POST /api/v1/auth/login` on SFO Core. Stores JWT in localStorage via Zustand auth store. |
| `/signup` | "Request Access" form. Collects first name, last name, work email, company, role/title, password, and confirmation. Shows a placeholder success state on submit — no real account is created. SFG onboarding is invite/provisioning-based; open self-registration requires a backend-issued invite code. |

Both pages share the same dark SaaS auth aesthetic (deep navy surfaces, card layout, SCSS design tokens) and link to each other via React Router `<Link>` for SPA navigation.

### Planned Google OAuth / JWT Integration

SFG uses **Google OAuth** as its third-party identity provider, integrated through SFO Core API rather than the frontend directly. The planned flow is:

1. User clicks "Continue with Google" on the login page.
2. Frontend redirects to Google's OAuth consent screen using a client ID from `VITE_GOOGLE_CLIENT_ID`.
3. Google returns an authorization code to the frontend OAuth callback route (`/oauth/callback`).
4. Frontend exchanges the code by sending it to `POST /api/v1/auth/google` on SFO Core.
5. SFO Core validates with Google, resolves or creates the user record in MongoDB Atlas, and returns a signed JWT + user profile.
6. Frontend stores the JWT via the Zustand auth store and navigates to the dashboard.

The "Continue with Google" button is present in the login UI as a placeholder and will be activated once the backend OAuth endpoint is confirmed and the Google Cloud OAuth app is configured.

> **Note for course reviewers:** The course syllabus references Spotify as an example third-party OAuth/API provider. For this project, the equivalent integration is **Google OAuth through SFO Core API**. The architectural pattern is identical: a third-party identity provider → backend token exchange → JWT session. Spotify is not used because this is a real production-track project, not a course sample app.

---

## Prerequisites

Before running this project locally, ensure you have the following installed:

| Requirement | Version | Notes |
|---|---|---|
| **Node.js** | 18.x or later | LTS recommended. Check with `node -v`. |
| **npm** | 9.x or later | Bundled with Node. Check with `npm -v`. |
| **Git** | Any modern version | For cloning and branch management. |
| **Modern browser** | Chrome, Firefox, Edge, or Safari | For local dev and testing. |
| **SFO Core API access** | Running locally or remote | Required for real auth testing. Without it, `/login` will fail gracefully; `/showcase-dashboard` and `/signup` work without it. |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_ORG/sfg-showcase-web.git
cd sfg-showcase-web
```

> Replace `YOUR_ORG/sfg-showcase-web` with the actual repository URL once the GitHub remote is confirmed.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and set the following values (see [Environment Variables](#environment-variables) for details):

```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_JWT_STORAGE_KEY=sfg_auth_token
```

### 4. Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:5173** by default.

### 5. Build for production

```bash
npm run build
```

Output goes to `dist/`. This is what Vercel deploys.

---

## Environment Variables

All environment variables used by this frontend are prefixed with `VITE_` so Vite exposes them to the browser bundle. **No secrets or private keys should ever be stored here.**

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Base URL for SFO Core API, including the `/api/v1` prefix. Example: `http://localhost:3001/api/v1` for local dev, or the production Fly.io URL for deployed environments. |
| `VITE_GOOGLE_CLIENT_ID` | Planned | Google OAuth 2.0 Client ID obtained from Google Cloud Console. This is a public identifier — safe to expose in the browser. Do not put the OAuth client secret here. The secret lives on the SFO Core API backend only. |
| `VITE_JWT_STORAGE_KEY` | Optional | localStorage key used to persist the JWT. Defaults to `sfg_auth_token` if not set. Override in environments where key collision is a concern. |

A complete `.env.example` file is included in the repository root. Copy it to `.env.local` to get started. `.env.local` is git-ignored and must never be committed.

---

## Local URLs and Links

| URL | Description |
|---|---|
| `http://localhost:5173/` | Home / public marketing page |
| `http://localhost:5173/showcase-dashboard` | Public dashboard preview (no auth required) |
| `http://localhost:5173/login` | Login page |
| `http://localhost:5173/signup` | Signup / Request Access page |
| `https://github.com/YOUR_ORG/sfg-showcase-web` | GitHub repository *(placeholder — update when confirmed)* |
| `https://sfg-showcase.vercel.app` | Vercel deployment *(placeholder — update after first deploy)* |
| `https://your-sfo-core-api.fly.dev/health` | SFO Core API health check *(placeholder — update when confirmed)* |

---

## Project Structure

```
sfg-showcase-web/
├── public/                  Static assets served as-is
├── src/
│   ├── api/                 Axios client configured for SFO Core API
│   ├── components/          Shared UI primitives (Button, Card, Badge, etc.)
│   ├── data/                Mock/seed data for showcase pages
│   ├── layouts/             PublicLayout and DashboardLayout wrappers
│   ├── pages/               Page components (HomePage, LoginPage, SignupPage, etc.)
│   ├── router/              AppRouter and ProtectedRoute
│   ├── store/               Zustand auth store
│   └── styles/              SCSS design tokens, global styles, utilities
├── .env.example             Environment variable template
├── docs/                    Architecture and auth flow documentation
├── index.html               Vite entry point
├── vite.config.ts           Vite configuration with @/ path alias
├── tsconfig.app.json        TypeScript configuration for app source
└── package.json
```

All app code is **TypeScript only** (`.tsx` / `.ts`). No `.jsx` or `.css` files are used in `src/`. Styles are SCSS only. No Tailwind.

---

## School Requirement Crosswalk — Week 1

This section maps Week 1 course requirements to the current state of this project.

| Course Requirement | Status | Implementation |
|---|---|---|
| Project repository created | ✅ Complete | GitHub repo initialized with branch strategy (`main`, `claude/` feature branches) |
| README with project description | ✅ Complete | This document |
| Environment setup documented | ✅ Complete | Prerequisites + Getting Started sections above |
| `.env` / secrets handling documented | ✅ Complete | `.env.example` in repo root; `.env.local` git-ignored; no secrets in frontend |
| Third-party API / OAuth provider identified | ✅ Complete | Google OAuth via SFO Core API (see Week 2 Planning below) |
| Local development environment running | ✅ Complete | `npm install && npm run dev` |
| Production build verified | ✅ Complete | `npm run build` passes with zero TypeScript errors |
| GitHub Project board / milestones | 🔄 In Progress | See GitHub Project Workflow below |
| Backend API connected | ✅ Complete | SFO Core API (separate repo) — owns auth, MongoDB Atlas, JWT, tenant data |
| Database configured | ✅ Complete | MongoDB Atlas — managed by SFO Core API, not this frontend |

> **Note on backend and database:** The course Week 1 checklist includes setting up a backend server and database. For this project, both are handled by the pre-existing **SFO Core API** (`/mnt/d/sfg-api` locally), which is independently deployed. The frontend is a pure consumer of that API. This is an intentional architectural decision reflecting real production-track development, not a gap in the implementation.

---

## Week 2 Planning — OAuth Integration

### How the course Spotify example maps to this project

The course uses **Spotify OAuth** as its reference implementation for third-party OAuth + API integration. The architectural pattern it teaches is:

1. Register an OAuth app with a third-party provider.
2. Store the client ID in an environment variable (public, browser-safe).
3. Store the client secret on the backend only (never in the frontend).
4. Implement the OAuth authorization code flow.
5. Exchange the code for tokens on the backend.
6. Persist the session (JWT or session cookie) in a database.

**This project implements the same pattern using Google OAuth:**

| Spotify (course example) | SFG Showcase (this project) |
|---|---|
| Spotify Developer Dashboard | Google Cloud Console |
| Spotify Client ID | `VITE_GOOGLE_CLIENT_ID` (browser-safe) |
| Spotify Client Secret | Google Client Secret (SFO Core API backend only) |
| Spotify OAuth endpoint | Google OAuth 2.0 endpoint |
| Spotify token exchange | `POST /api/v1/auth/google` on SFO Core |
| Session persistence | JWT + MongoDB Atlas user record via SFO Core |

### Week 2 action items

- [ ] Create Google Cloud Console project and configure OAuth 2.0 credentials.
- [ ] Add `VITE_GOOGLE_CLIENT_ID` to `.env.local` and Vercel environment settings.
- [ ] Add Google Client Secret to SFO Core API environment (Fly.io secrets — never this repo).
- [ ] Confirm or implement `POST /api/v1/auth/google` on SFO Core API.
- [ ] Wire the "Continue with Google" button on the login page to the OAuth flow.
- [ ] Implement `/oauth/callback` route in this frontend to handle the redirect.
- [ ] Test full flow: Google consent → callback → JWT → dashboard redirect.
- [ ] Document the OAuth flow in `docs/auth-flow.md`.

### Credential handling rules

- OAuth **client ID** → `VITE_GOOGLE_CLIENT_ID` in `.env.local` / Vercel env. Safe to expose in browser.
- OAuth **client secret** → SFO Core API backend environment only. Never in this repository.
- JWT **secret** → SFO Core API backend environment only. Never in this repository.
- MongoDB Atlas **connection string** → SFO Core API backend environment only. Never in this repository.

---

## GitHub Project Workflow

### Branch strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, deployable code. Direct pushes restricted. |
| `claude/feature-name-id` | Feature branches. Opened as PRs against `main`. |

### Milestones

| Milestone | Target | Scope |
|---|---|---|
| **Week 1 — Foundation** | Current sprint | Repo setup, README, local dev, build verified, public routes, auth scaffolding |
| **Week 2 — OAuth** | Next sprint | Google OAuth flow wired end-to-end, `/oauth/callback`, JWT session, login to dashboard |
| **Week 3 — Protected Dashboard** | Future | `ProtectedRoute` applied, real API data in dashboard, role-aware UI |
| **Week 4 — Polish + Deploy** | Future | Vercel deploy, environment config, performance, accessibility pass, final documentation |

### Issues and tickets

All work items should be tracked as GitHub Issues. Suggested labels:

- `frontend` — UI and component work
- `auth` — authentication and OAuth
- `backend-dependency` — blocked on SFO Core API
- `docs` — documentation only
- `bug` — regressions or broken behavior
- `week-N` — course sprint alignment

---

## Academic Integrity Note

This project is an original implementation built on real production-track architecture. Course materials, templates, and example projects may be referenced for conceptual understanding of patterns (OAuth flows, REST API structure, environment variable handling), but all code in this repository is written from scratch to fit the specific requirements of the SFG platform.

Specific implementation choices — such as using Google OAuth instead of Spotify, separating the backend into an independently deployed service, and using a multi-tenant architecture — reflect genuine engineering decisions rather than deviation from course requirements. Where the course specifies a particular provider or technology by name, the equivalent pattern is implemented using the technology appropriate to this project, and that mapping is documented explicitly (see [Week 2 Planning](#week-2-planning--oauth-integration)).

Any course-provided starter code, boilerplate, or template files are used only as reference and are not copied directly into this repository.
