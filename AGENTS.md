# Agent Instructions for IrsanAI IS

## Product Direction

Before making strategy, architecture, schema, or roadmap changes, read:

- `docs/PRODUCT_STRATEGY.md`
- `docs/AI_COLLABORATION.md`
- `docs/AI_DECISIONS.md`

The current public-safe strategic direction is to keep IrsanAI IS centered on
**Essences**, **Loadouts**, portable AI configuration knowledge, explainable
routing, and feedback loops. Do not expose private pricing, market-share goals,
competitor battle plans, or unreleased launch strategy in public docs.

## Claude Collaboration

Claude.ai is treated as an active design partner for this repository. Codex may
make changes, but should leave durable rationale in repo docs when a decision
matters.

Before major changes, check `docs/AI_DECISIONS.md` for Claude concerns or vetoes.
Claude can add `concern` or `veto` entries there, and future agents should treat
blocking vetoes as unresolved until the human owner decides otherwise.

## Documentation Rule

Do not leave important product reasoning only in chat history. If a decision will
matter later, document it in `docs/AI_DECISIONS.md`, `docs/PRODUCT_STRATEGY.md`,
or a dedicated file under `docs/decisions/`.

## System-Architectural + Metacognitive Mode

When the human asks to work "systemarchitektonisch und metakognitiv", translate
that into this concrete workflow:

1. Define the system boundary: packages, data flow, runtime dependencies, and
   user-facing behavior.
2. Separate observation from interpretation: first state what the repo or logs
   show, then state what you infer from it.
3. Use an OODA-style loop for implementation work:
   - Observe: inspect files, current behavior, errors, and benchmarks.
   - Orient: identify constraints, risks, and likely root causes.
   - Decide: choose the smallest reversible change that improves the system.
   - Act: implement, test, document, and commit.
4. Preserve future learning: if the change affects strategy, architecture,
   routing quality, or validation, update the relevant docs or benchmark notes.
5. Prefer measurable outcomes over vague improvements.

## Public Repository Boundary

Assume committed documentation may be public. Keep strategic notes useful for
Claude/Codex handoff, but avoid revealing sensitive commercial plans. If a
private strategy discussion affects implementation, document only the safe
technical implication in the repo.
