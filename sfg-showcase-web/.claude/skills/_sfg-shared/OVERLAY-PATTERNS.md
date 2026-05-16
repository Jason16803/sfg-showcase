# Overlay Patterns

Overlays extend vertical dashboards with specialized behavior.

## Purpose

Prevent regulated or specialized logic from leaking into base apps.

## Base Apps

Base apps:
- umbrella-retail-web
- umbrella-service-web
- umbrella-food-web
- umbrella-org-web

must remain unaware of overlay internals.

## Overlays

Examples:
- VRIO firearm overlay
- future alcohol overlay
- future nicotine overlay

## Rules

- overlays inject behavior
- overlays do not replace base apps
- overlays live in packages
- overlays compose into verticals
- overlays own regulated workflows
- overlays own compliance UI
- overlays own compliance middleware

## Never

- hardcode firearm logic into retail base app
- expose overlay-specific code to unrelated tenants
- bypass overlay injection architecture