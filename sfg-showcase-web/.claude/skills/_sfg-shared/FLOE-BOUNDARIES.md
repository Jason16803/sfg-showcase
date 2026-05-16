# Floe Boundaries

Floe is the authoritative financial system for SFG.

## Floe Owns

- invoices
- payments
- deposits
- transaction state
- receipts
- payment processors
- financial calculations
- balances
- terminal/payment integrations

## SFO Core May

- store reference IDs
- proxy requests to Floe
- display summarized financial metadata
- link customers/jobs/orders to Floe entities

## SFO Core Must NEVER

- calculate invoice totals
- process payments
- store payment transaction logic
- duplicate invoice systems
- become a second financial source of truth

## Architectural Principle

Money-related business logic must exist in exactly one system:
Floe.