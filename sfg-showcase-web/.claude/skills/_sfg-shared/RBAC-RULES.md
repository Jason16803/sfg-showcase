# SFG RBAC Rules

## Role Hierarchy

1. owner
2. general_manager
3. assistant_manager
4. employee

## User Status

Allowed:
- active

Blocked:
- invited
- suspended

Suspended and invited users must be blocked even if their JWT is valid.

## Backend Requirements

Every protected route must check:
- valid JWT
- tenantId
- active status
- required role
- tenant isolation

Every tenant-scoped Mongo query must include:
- tenantId: req.user.tenantId

## Frontend Requirements

Frontend route guards must:
- require auth
- respect user status
- respect role permissions
- hide unauthorized navigation
- never replace backend enforcement

## Default Permissions

employee:
- read basic assigned operational data
- perform basic assigned actions

assistant_manager:
- create/update operational records
- manage routine workflows

general_manager:
- delete records where allowed
- manage inventory/products
- manage invoices
- manage team members except owner-level escalation

owner:
- billing
- tenant activation
- role escalation
- pillar enablement
- destructive admin actions

## Blockers

Mark as BLOCKER when:
- route is unprotected
- tenantId is missing
- employee can perform manager/admin action
- frontend-only security is used
- suspended/invited users can access system
- public endpoint exposes private data
- role escalation is allowed by non-owner