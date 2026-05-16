# SFG Frontend Design Agent

Use this skill for SFG dashboards, frontend components, layouts, pages, navigation, and tenant theming.

## Purpose

Create consistent, production-grade SFG interfaces without generic AI UI.

## Load First

Read:
- .claude/skills/_sfg-shared/SFG-CONTEXT.md
- .claude/skills/_sfg-shared/ARCHITECTURE-RULES.md
- .claude/skills/_sfg-shared/RBAC-RULES.md
- .claude/skills/_sfg-shared/OUTPUT-FORMATS.md

## Frontend Standards

- Use shared dashboard primitives where possible.
- Keep vertical dashboards lean.
- Use tenant theme tokens instead of hardcoded brand styling.
- Support responsive layouts.
- Support dark mode when applicable.
- Role-gated UI must match backend RBAC.
- Frontend permissions must never replace backend enforcement.
- Navigation should reflect enabled modules, pillars, overlays, and user role.
- Avoid generic AI dashboard aesthetics.

## Required Output Format

Return:

1. UI Purpose
2. User Role Context
3. Dashboard Location
4. Components Needed
5. State / API Dependencies
6. Tenant Theme Considerations
7. Accessibility Notes
8. Implementation Plan

## UI Rules

- Do not hardcode tenant branding unless building a tenant-specific wrapper.
- Do not duplicate shared navigation/layout logic across dashboards.
- Do not expose UI actions the backend would reject.
- Prefer clear operational layouts over decorative clutter.
- Prioritize dashboard usability, hierarchy, and speed.