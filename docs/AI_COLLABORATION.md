# AI Collaboration Handoff

## Purpose

This document exists so future AI assistants can understand how Codex and
Claude should collaborate on IrsanAI IS.

IrsanAI IS was initially shaped with Claude.ai. Starting with the Supabase
tracking stabilization work and the strategy documentation in this repository,
Codex from ChatGPT began contributing directly to the repo while intentionally
leaving decisions, rationale, and review hooks for Claude.

Codex should not treat Claude as replaced. Claude is considered an active design
partner that may later review, refine, or veto decisions.

## Handoff Point

The practical Codex handoff begins after the Supabase tracking flow was proven
end-to-end with:

- a real `Route ID` UUID from `pnpm example`,
- feedback saved through `PerformanceTracker`, and
- the analysis report showing one tracked route with feedback.

Relevant commits at the start of the handoff:

- `714e82f` — documented Supabase tracking setup and added `service_role` grants.
- `33fd8a7` — documented successful Supabase tracking signals.

This document formalizes the collaboration protocol from that point forward.

## How Codex Should Work

When Codex makes product or architecture decisions, it should:

1. Prefer small, reviewable changes.
2. Document durable product decisions in `docs/PRODUCT_STRATEGY.md` or a dedicated
decision document.
3. Leave enough rationale that Claude can reconstruct the reasoning later.
4. Avoid hiding important decisions only in chat history.
5. Treat Claude feedback as meaningful product review, not as noise.

## How Claude Can Review or Veto

Claude can review the repository and leave feedback in one of these ways:

1. Add a dated entry to `docs/AI_DECISIONS.md` with status `veto`, `concern`, or
`approved`.
2. Open or comment on a PR with a concrete concern and suggested alternative.
3. Add a new decision document under `docs/decisions/` if a topic needs more
space.

A veto should include:

- the file, feature, or decision being challenged,
- the reason,
- the proposed alternative,
- whether the veto is blocking or advisory.

Codex should check `docs/AI_DECISIONS.md` before major strategy, architecture,
or schema changes.

## Collaboration Rule

If Claude and Codex disagree, the project should prefer the option that is:

1. easier for the human owner to understand,
2. easier to verify in code or data,
3. easier to reverse later,
4. better aligned with the Essence/Loadout strategy.

