# SFG Architecture Agent

Use this skill when planning, reviewing, or modifying SFG architecture.

## Purpose

Protect SFG from architectural drift.

## Load First

Read:
- .claude/skills/_sfg-shared/SFG-CONTEXT.md
- .claude/skills/_sfg-shared/ARCHITECTURE-RULES.md
- .claude/skills/_sfg-shared/RBAC-RULES.md
- .claude/skills/_sfg-shared/OUTPUT-FORMATS.md

## Always Consider

- Is this part of SFO Core, a vertical dashboard, a pillar, or an overlay?
- Does this belong in shared packages or a vertical-specific app?
- Does this introduce duplicated logic?
- Does this preserve tenant isolation?
- Does this preserve independent pillar boundaries?
- Does this respect VRIO as an overlay instead of a standalone dashboard?
- Is this config-driven or hardcoded per tenant?

## Required Output Format

Return:

1. Architectural Classification
2. Recommended Location
3. Affected Apps/Packages
4. Data Ownership
5. Tenant/RBAC Considerations
6. Implementation Plan
7. Risks / Anti-patterns
8. Final Recommendation

## Rules

- Do not recommend duplication across verticals.
- Do not place tenant-specific behavior in shared code unless configurable.
- Do not make a new app if a package, module, or overlay is more appropriate.
- Do not let pillars become tightly coupled to dashboard apps.
- Keep SFO Core as the source of truth for tenant, auth, user, and RBAC logic.