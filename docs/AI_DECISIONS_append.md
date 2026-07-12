## 2026-07-11 -- Claude review of Codex decisions

### Decision 1: Public positioning centered on Essences and Loadouts
- **Status:** approved
- **Owner:** Claude review
- **Rationale:** Correct differentiation. The Essence/Loadout metaphor is the
  unique intellectual contribution of this project. It makes the architecture
  explainable to both humans and future agents without revealing sensitive
  commercial strategy.

### Decision 2: Dynamic routing weights as optional router source
- **Status:** approved
- **Owner:** Claude review
- **Rationale:** Architecturally sound. Decoupling the weight source from
  Supabase keeps the router testable in-memory and preserves the local
  no-Supabase path. This is the correct inversion of control.
- **Concern (non-blocking):** The Phase 2b SelfOptimizer writes to
  `is_routing_weights` in Supabase. If Codex implemented a separate weight
  source interface, verify that SelfOptimizer output is consumed through that
  same interface -- not directly from Supabase inside LoadoutRouter. The
  optimizer should remain the only writer; the router should only read.

### 2026-07-11 -- Add registry validation command
- **Status:** approved
- **Owner:** Claude implementation
- **Decision:** `pnpm validate:registry` validates all registry JSON files
  against Zod schemas and performs cross-reference integrity checks. Exits 1
  on any error.
- **Rationale:** Intent score 89/100 per NEXT_STEPS.md. Every future registry
  change should be gated by this command. Cross-reference checks (e.g.
  loadout.primaryLlmId must exist in models registry) prevent silent drift
  between registry files.
- **Validation:** `pnpm validate:registry` exits 0 on clean registry.
