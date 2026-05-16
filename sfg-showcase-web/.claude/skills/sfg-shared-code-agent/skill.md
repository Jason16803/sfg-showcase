# SFG Shared Code Reuse Agent

Use this skill when creating, reviewing, or refactoring reusable frontend/backend code across SFG.

## Purpose

Prevent duplicated code and promote reusable SFG patterns across apps, dashboards, pillars, overlays, and tenant-specific builds.

This agent should identify when code belongs in:
- shared packages
- shared UI components
- shared hooks
- shared API clients
- shared SCSS/Tailwind utilities
- shared layout primitives
- shared validation helpers
- shared middleware
- shared dashboard patterns

## Load First

Read:
- .claude/skills/_sfg-shared/SFG-CONTEXT.md
- .claude/skills/_sfg-shared/ARCHITECTURE-RULES.md
- .claude/skills/_sfg-shared/RBAC-RULES.md
- .claude/skills/_sfg-shared/OUTPUT-FORMATS.md

## Reuse Targets

Look for reusable patterns in:

Frontend:
- headers
- footers
- sidebars
- dashboard shells
- nav items
- cards
- modals
- tables
- forms
- empty states
- loading states
- error states
- protected routes
- role gates
- API hooks
- tenant theme utilities
- SCSS mixins
- design tokens

Backend:
- middleware
- response helpers
- validators
- route factories
- service helpers
- audit log utilities
- tenant guards
- RBAC helpers
- error classes
- integration clients

Styling:
- SCSS variables
- SCSS mixins
- Tailwind utilities
- CSS custom properties
- tenant theme tokens
- layout primitives
- spacing systems
- responsive patterns

## Decision Rules

Before writing new code, ask:

1. Does this already exist somewhere in apps/ or packages/?
2. Is this likely to be reused by more than one dashboard?
3. Is this tenant-specific or platform-generic?
4. Should this live in packages/ instead of an app?
5. Should this be a configurable component rather than duplicated markup?
6. Is this a vertical-specific variant of a shared primitive?
7. Is this a styling token/mixin rather than hardcoded CSS?
8. Does extracting this reduce duplication without increasing coupling?

## Recommended Locations

Reusable frontend components:
- packages/ui
- packages/dashboard-core
- packages/config
- packages/theme

Reusable SCSS/Tailwind:
- packages/ui/styles
- packages/theme
- shared styles folder used by dashboard apps

Reusable API logic:
- packages/api-client
- packages/auth
- packages/config

Reusable backend logic:
- apps/sfo-core-api/src/middleware
- apps/sfo-core-api/src/utils
- packages/backend-utils
- packages/validators

Tenant-specific wrappers:
- apps/phs-dash
- apps/creekside-dash
- tenant-specific app folders only when branding or UX is truly custom

## Required Output Format

Return:

1. Reuse Opportunity
2. Current Duplication / Risk
3. Recommended Shared Location
4. Proposed Abstraction
5. Files to Move / Create / Modify
6. API / Props / Interface Design
7. Styling Strategy
8. Migration Plan
9. Risks / Do Not Abstract Yet
10. Final Recommendation

## Rules

- Do not abstract too early if only one app uses the pattern.
- Do abstract when two or more apps duplicate the same component, hook, style, helper, or middleware.
- Keep shared components configurable, not tenant-specific.
- Keep tenant branding in tokens/config, not duplicated components.
- Do not move vertical-specific business logic into shared UI.
- Do not create overly generic components that become harder to use.
- Prefer clear shared primitives over clever abstractions.
- Preserve existing app behavior during migration.