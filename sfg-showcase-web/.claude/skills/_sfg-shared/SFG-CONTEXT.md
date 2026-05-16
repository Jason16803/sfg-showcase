# SFG Shared Context

SFG is a modular, API-first, multi-tenant platform built around independently callable systems.

## Core Concepts

- SFO Core API is the source of truth for auth, tenancy, users, RBAC, customers, jobs, leads, and shared operational data.
- Pillars are independently callable systems such as Floe, Marketid, Commerce, HR, and future POS systems.
- Vertical dashboards are frontend applications composed from shared dashboard patterns plus vertical-specific modules.
- Overlays extend verticals for specialized domains.
- VRIO is an overlay, not a standalone dashboard.
- Tenant isolation is mandatory.
- Every tenant-scoped query must use tenantId.
- Public endpoints must resolve tenant by approved domain/origin and must never expose private tenant data.

## Apps

Core:
- apps/sfo-core-api

Pillars:
- apps/floe-api
- apps/marketid-api
- apps/commerce-api
- apps/hr-api

Admin/Internal:
- apps/sfg-admin-dash
- apps/dashboard-shell

Tenant dashboards:
- apps/umbrella-service-web
- apps/umbrella-retail-web
- apps/umbrella-food-web
- apps/umbrella-org-web
- apps/umbrella-restricted-web
- apps/umbrella-creative-web
- apps/phs-dash
- apps/creekside-dash
- apps/marketid-dash

## Default Stack

Backend:
- Node
- Express
- Mongoose
- JWT
- MongoDB Atlas
- middleware-based RBAC
- service/controller/route structure

Frontend:
- React
- Vite
- Tailwind
- shared tokens
- tenant theming
- protected routes
- role-gated navigation