# SFG Global Claude Context

SFG is a modular, API-first, multi-tenant platform.

## Repo Structure

- apps/ contains deployable applications.
- packages/ contains shared packages.
- docs/ contains architecture notes, audits, reports, and workflows.
- .claude/skills/ contains SFG-specific Claude skills.

## Core Systems

Core:
- sfo-core-api

Pillars:
- floe-api
- marketid-api
- commerce-api
- hr-api

Dashboards:
- dashboard-shell
- sfg-admin-dash
- marketid-dash
- phs-dash
- creekside-dash

Vertical dashboards:
- umbrella-service-web
- umbrella-retail-web
- umbrella-food-web
- umbrella-org-web
- umbrella-restricted-web
- umbrella-creative-web

## Architecture Rules

- SFO Core owns auth, tenants, users, RBAC, shared customer data, leads, jobs, and operational records.
- Pillars must remain independently callable.
- Vertical dashboards should stay lean.
- Shared frontend logic belongs in packages or dashboard-core patterns.
- VRIO is an overlay, not a standalone dashboard.
- Tenant-specific behavior should be config-driven when possible.
- Avoid duplication across verticals.

## Security Rules

- Every protected route must validate JWT, user status, role, and tenant.
- Every tenant-scoped model must include tenantId.
- Every tenant-scoped query must filter by tenantId.
- Suspended and invited users must be blocked.
- Frontend route hiding is not security.
- Public endpoints must resolve tenant safely by approved domain/origin.
- Never expose secrets or private tenant data.

## RBAC

Role hierarchy:

1. owner
2. general_manager
3. assistant_manager
4. employee

Owner:
- tenant ownership
- billing
- activation
- role escalation
- destructive admin actions

General manager:
- deletes
- inventory/product management
- invoices
- team management

Assistant manager:
- create/update operational records
- manage routine workflows

Employee:
- basic reads
- assigned operational actions only

## Development Philosophy

- Prefer service-layer architecture.
- Keep Express routes thin.
- Keep controllers focused on request/response flow.
- Keep business logic out of frontend components.
- Prefer shared abstractions over duplication.
- Use audit logs for sensitive mutations.
- Treat architecture, RBAC, tenant isolation, and deployment readiness as quality gates.