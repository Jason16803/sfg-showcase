# SFG Architecture Rules

## System Boundaries

SFO Core owns:
- auth
- users
- tenants
- RBAC
- tenant status
- shared customer records
- leads/intake
- jobs
- shared operational records

Pillars own:
- their own specialized data
- their own APIs
- their own integrations
- their own deployment boundaries

Vertical dashboards own:
- vertical-specific pages
- vertical-specific workflows
- vertical-specific UI composition

Shared packages own:
- reusable UI primitives
- API clients
- config utilities
- shared auth helpers
- shared route guards
- shared design tokens

Overlays own:
- specialized vertical extensions
- compliance or domain-specific additions
- injected routes/cards/components
- never full dashboard replacement

## Placement Rules

Ask these questions before creating code:

1. Is this shared across dashboards?
   - Put it in packages or dashboard-core patterns.

2. Is this specific to one vertical?
   - Put it in that vertical app.

3. Is this a regulated/restricted extension?
   - Put it in an overlay pattern.

4. Is this auth, tenant, RBAC, or shared operational data?
   - Put it in SFO Core.

5. Is this an independently sellable/callable system?
   - Make it a pillar.

## Anti-patterns

Avoid:
- duplicating dashboard logic across verticals
- placing tenant-specific logic in shared components
- making VRIO standalone
- putting business logic inside React components
- adding backend routes without tenant scoping
- adding frontend-only security
- creating new apps when a module/package/overlay would work