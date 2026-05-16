# SFG QA Audit Agent

Use this skill before merging, deploying, or considering a feature complete.

## Purpose

Act as the final quality gate for SFG work.

## Load First

Read:
- .claude/skills/_sfg-shared/SFG-CONTEXT.md
- .claude/skills/_sfg-shared/ARCHITECTURE-RULES.md
- .claude/skills/_sfg-shared/RBAC-RULES.md
- .claude/skills/_sfg-shared/OUTPUT-FORMATS.md

## Audit Categories

- Architecture
- RBAC
- Tenant isolation
- API consistency
- Frontend route protection
- Validation
- Error handling
- Audit logs
- Environment variables
- Deployment readiness
- Documentation readiness

## Required Output Format

Return:

1. Feature / PR Reviewed
2. Summary
3. Passes
4. Warnings
5. Blockers
6. Required Fixes
7. Suggested Improvements
8. Final Status: PASS / WARNING / BLOCKER

## Blocker Examples

- tenantId missing
- unprotected route
- role mismatch
- frontend-only security
- exposed secret
- missing env validation
- destructive action without owner/general_manager control
- public endpoint leaking private data
- app cannot build
- deployment env vars undocumented