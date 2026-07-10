# IrsanAI IS Next Steps

## Purpose

This file captures the current project intent, the latest completed steps, and
the ranked next steps that scored high enough to guide future work. It is meant
for humans, Codex, Claude, and future agents when the instruction is simply
"continue", "setze fort", or "fahre im Projekt fort".

This file should stay public-safe. Do not include private pricing, market-share
targets, competitor battle plans, or unreleased launch strategy.

## What We Have

Current system state:

- Typed registry schemas for models, essences, loadouts, and agents.
- Registry seed data for models, essences, loadouts, and agents.
- `@irsanai/is-core` with task classification and loadout routing.
- Optional Supabase-backed route tracking.
- Manual feedback capture for routed tasks.
- Self-analysis that summarizes loadout quality, latency, feedback, and issues.
- Self-optimizer logic that can write dynamic routing weights after enough
feedback exists.
- A runnable `pnpm example` path for route -> optional track -> optional feedback
-> analyze.
- Public-safe product direction and AI collaboration docs.
- English and German README files with current state, roadmap, and validation
expectations.

## Latest Completed Steps

Recent completed work:

1. Supabase tracking migrations were made usable with `service_role` grants.
2. The example was aligned with the verified local PyCharm flow by reading
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the environment.
3. Public-safe product direction, AI collaboration, and decision-log docs were
added.
4. Root documentation was expanded with a German counterpart and benchmark /
validation guidance.
5. Agent instructions were extended with a system-architectural and
metacognitive OODA workflow.
6. A Windows/PyCharm Supabase tracking smoke test reached 6 tracked routes with
6 feedback entries, 100% correctness, 5.0 average rating, and a stable trend.

## Intent Scoring Model

Future continuation work should score candidate actions from 0 to 100.

Suggested scoring dimensions:

| Dimension | Max | Meaning |
|-----------|-----|---------|
| Intent fit | 25 | How strongly the item advances Essence/Loadout routing, feedback, or portability. |
| System leverage | 20 | How much it improves the architecture or future velocity. |
| Validation value | 20 | How easy it is to verify with repeatable tests, examples, or metrics. |
| Reversibility | 15 | How safe and small the change is if it needs to be undone. |
| Documentation value | 10 | Whether it preserves learning for humans and agents. |
| Public-safety | 10 | Whether it avoids leaking sensitive commercial strategy. |

Items scoring **80+** can become planned work. Items scoring below 80 should be
recorded in `docs/LOW_SCORE_BACKLOG.md` unless the human explicitly overrides the
score.

## Ranked Planned Work

### 1. Wire dynamic routing weights into `LoadoutRouter`

- **Intent score:** 94/100
- **Why it passed:** The optimizer can write `is_routing_weights`, but routing
currently does not consume those weights. Connecting this closes the
metacognitive loop from feedback to future routing behavior.
- **Expected outcome:** Loadout selection can consider dynamic `enabled`,
`confidence_threshold`, and `priority_boost` values.
- **Validation:** Unit-level router checks or example-level smoke tests showing
that a disabled or boosted loadout changes selection as expected.
- **Risk:** Needs careful fallback behavior so missing Supabase or missing weight
rows do not break local routing.

### 2. Add a registry validation command

- **Intent score:** 89/100
- **Why it passed:** The project depends on registry JSON staying aligned with
Zod schemas. A first-class validation script would make every future registry
change safer.
- **Expected outcome:** A command such as `pnpm validate:registry` checks models,
essences, loadouts, and agents.
- **Validation:** The command exits non-zero on malformed registry data and is
listed in the benchmark section.
- **Risk:** Low; mostly additive.

### 3. Add focused tests for analyzer and optimizer rules

- **Intent score:** 86/100
- **Why it passed:** The self-analysis and optimizer rules are central to the
metacognitive loop and can be tested without live LLM calls.
- **Expected outcome:** Deterministic fixtures validate low correctness,
confidence, latency, trend, and priority-boost behavior.
- **Validation:** `pnpm test` or package-level test command passes locally.
- **Risk:** Medium; requires choosing and adding a test runner if one does not
exist yet.

### 4. Document the first benchmark protocol for routing changes

- **Intent score:** 82/100
- **Why it passed:** The README now names benchmark categories, but routing
quality changes still need a repeatable protocol.
- **Expected outcome:** A small benchmark fixture set for representative task
prompts and expected loadouts.
- **Validation:** Future router changes can be compared against the fixture set.
- **Risk:** Low; may become stale if not automated later.

## Recommended Next Action

The highest-value next implementation step is:

> Wire dynamic routing weights into `LoadoutRouter` while preserving local,
> no-Supabase behavior.

Before implementing it, inspect:

- `packages/is-core/src/routing/loadout-router.ts`
- `packages/is-core/src/metacognition/self-optimizer.ts`
- `supabase/migrations/003_is_routing_weights.sql`
- `registry/loadouts/*.json`

Then update validation notes and benchmark expectations after implementation.

Before relying on optimizer recommendations, collect at least 10 feedback
entries as noted by the current analyzer output and benchmark log.
