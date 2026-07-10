# Low-Score Backlog

## Purpose

This file stores considered ideas that did not score high enough for immediate
planned work. Keeping them here prevents the project from losing context without
forcing low-leverage work into the active plan.

Use this file when a candidate scores below 80 in `docs/NEXT_STEPS.md`'s intent
scoring model.

## Backlog Items

### Public dashboard polish before core routing weights

- **Intent score:** 62/100
- **Why it did not pass:** A dashboard will matter later, but the core feedback
loop should first prove that route metrics and optimizer output can affect future
routing decisions.
- **Reconsider when:** The router consumes dynamic weights and benchmark checks
exist.

### SDK packaging before validation commands

- **Intent score:** 58/100
- **Why it did not pass:** Publishing or polishing an SDK before registry
validation and routing feedback are stable may spread unstable APIs.
- **Reconsider when:** Core APIs have tests and the registry validation command is
part of the normal workflow.

### More public product positioning language

- **Intent score:** 41/100
- **Why it did not pass:** The repo should stay public-safe and avoid revealing
sensitive commercial strategy or premature naming/launch positioning.
- **Reconsider when:** The human explicitly decides a public launch narrative is
needed.

### Additional registry seed expansion without validation

- **Intent score:** 67/100
- **Why it did not pass:** More registry entries are useful, but adding many items
before a validation command increases drift risk.
- **Reconsider when:** `pnpm validate:registry` or equivalent exists.
