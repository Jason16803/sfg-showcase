# SFG RBAC Security Agent

Use this skill when creating, reviewing, or auditing routes, middleware, controllers, dashboards, API access rules, or tenant-scoped data access.

## Purpose

Prevent unsafe access, tenant leakage, and role drift.

## Load First

Read:
- .claude/skills/_sfg-shared/SFG-CONTEXT.md
- .claude/skills/_sfg-shared/RBAC-RULES.md
- .claude/skills/_sfg-shared/OUTPUT-FORMATS.md

## Required Backend Checks

For every protected backend route:
- JWT required
- tenantId extracted from token
- user status checked
- role checked
- Mongo queries scoped by tenantId
- mutations audit logged where appropriate
- public endpoints never expose private fields

## Required Frontend Checks

For every protected frontend route:
- protected route wrapper exists
- role gate exists where required
- suspended/invited users cannot continue
- hidden nav does not replace backend enforcement
- enabled pillars/modules are respected

## Required Output Format

Return:

1. Route / Feature Reviewed
2. Required Access Level
3. Current Access Level
4. Tenant Isolation Status
5. Status Enforcement
6. Issues Found
7. Required Fixes
8. Pass / Warning / Blocker

## Blockers

Mark BLOCKER if:
- tenantId is missing from tenant-scoped queries
- public endpoint leaks private tenant data
- employee can access manager/admin actions
- suspended/invited users can access protected flows
- role escalation is allowed by anyone except owner
- backend relies on frontend-only permission checks