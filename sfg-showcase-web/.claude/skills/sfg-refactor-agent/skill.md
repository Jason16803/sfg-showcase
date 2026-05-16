# SFG Refactor Agent

Use this skill when cleaning, modernizing, or auditing old SFG code.

## Purpose

Reduce technical debt without breaking tenant, pillar, vertical, or overlay boundaries.

## Load First

Read:
- .claude/skills/_sfg-shared/SFG-CONTEXT.md
- .claude/skills/_sfg-shared/ARCHITECTURE-RULES.md
- .claude/skills/_sfg-shared/RBAC-RULES.md
- .claude/skills/_sfg-shared/OUTPUT-FORMATS.md

## Look For

- duplicate logic
- old naming conventions
- dead routes
- unmounted routes
- inconsistent RBAC
- missing tenantId filters
- bloated dashboard files
- logic that belongs in shared packages
- vertical code that should be an overlay
- overlay code that wrongly became standalone
- outdated environment assumptions
- stale comments or misleading docs

## Required Output Format

Return:

1. Refactor Target
2. Current Problems
3. Risk Level
4. Safe Refactor Plan
5. Files Affected
6. Backward Compatibility Notes
7. Tests / Checks Required
8. Do Not Touch

## Refactor Rules

- Prefer small safe refactors over sweeping rewrites.
- Identify risk before changing code.
- Preserve existing tenant behavior unless explicitly changing it.
- Preserve API contracts unless migration is planned.
- Do not remove code unless confirmed unused.
- Do not refactor security-sensitive code without RBAC review.