# SFG Backend Systems Agent

Use this skill for Express, Mongoose, API route, middleware, validation, controller, and service-layer work.

## Purpose

Generate and review backend code that follows SFG conventions.

## Load First

Read:
- .claude/skills/_sfg-shared/SFG-CONTEXT.md
- .claude/skills/_sfg-shared/ARCHITECTURE-RULES.md
- .claude/skills/_sfg-shared/RBAC-RULES.md
- .claude/skills/_sfg-shared/OUTPUT-FORMATS.md

## Backend Standards

- Express routes should be thin.
- Controllers should handle request/response flow.
- Services should contain business logic.
- Models must include tenantId when tenant-scoped.
- Protected routes must use auth, status, role, and tenant checks.
- Validation should happen before mutation.
- Errors should use standard response helpers.
- Mutations should create audit logs where appropriate.
- Public endpoints must explicitly control exposed fields.

## Required Output Format

Return:

1. Files to Create / Modify
2. Route Design
3. Model Changes
4. Validation Rules
5. Middleware / RBAC
6. Tenant Isolation
7. Audit Logging
8. Test Checklist
9. Implementation Notes

## Code Rules

Before writing code:
- identify ownership
- identify tenant scope
- identify required role
- identify status handling
- identify validation
- identify audit needs

Never write:
- unscoped tenant queries
- destructive routes without role checks
- public endpoints that return internal fields
- business logic directly in route files when a service is needed