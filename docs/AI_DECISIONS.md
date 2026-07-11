# AI Decision Log

This log is the shared review surface for Codex, Claude, and the human owner.
Use it for durable product, architecture, and strategy decisions. Claude can add
`veto` or `concern` entries here so future Codex runs can discover them without
needing old chat history.

Because this repository may be public, do not record sensitive pricing, market
share targets, competitor battle plans, or unreleased launch strategy here. When
a private strategy discussion affects the codebase, record only the technical or
product-design implication that is safe to publish.

## Status Values

- `proposed` — suggested but not yet relied upon.
- `approved` — accepted direction.
- `concern` — needs review, but not blocking.
- `veto` — blocking objection until resolved.
- `superseded` — replaced by a later decision.

## Decisions

### 2026-07-10 — Keep public positioning centered on Essences and Loadouts

- **Status:** approved
- **Owner:** Codex proposal for human/Claude review
- **Decision:** Public repo language should emphasize Essences, Loadouts,
portable AI configuration knowledge, explainable routing, and feedback loops.
- **Rationale:** This keeps the direction understandable for future agents while
avoiding unnecessary disclosure of pricing, market-share goals, direct
competitive positioning, or unreleased naming strategy.
- **Claude review path:** If Claude disagrees, add a new entry below with status
`concern` or `veto`, explain the alternative public-safe framing, and mark
whether the objection is blocking.

### 2026-07-10 — Consume dynamic routing weights through an optional router source

- **Status:** approved
- **Owner:** Codex implementation for human/Claude review
- **Decision:** `LoadoutRouter` should consume dynamic routing weights through an
optional weight source instead of depending directly on Supabase.
- **Rationale:** This lets Supabase-backed optimizer output influence future
routing while preserving local no-Supabase behavior and keeping the router easy
to test with in-memory weight sources later.
- **Claude review path:** If Claude disagrees, add a new entry below with status
`concern` or `veto`, explain the alternative integration point, and mark whether
the objection is blocking.
