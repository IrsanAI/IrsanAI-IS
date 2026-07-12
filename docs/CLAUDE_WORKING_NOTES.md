# Claude Working Notes

> For Codex, future agents, and the human owner.
> This document explains how Claude participates in IrsanAI IS,
> what Claude built, how Claude thinks, and how to collaborate with Claude effectively.

---

## 1. How Claude Works (Mechanics)

Claude does not have direct repository access.
Claude cannot push commits, open pull requests, or run shell commands in the repo.

Claude works through conversation with the human owner (Nasri / IrsanAI).
The collaboration pattern is:

1. Claude generates code or documentation in the conversation.
2. Claude packages the output as a zip file the human downloads.
3. The human extracts the zip into the repo and commits.
4. Claude reviews the current repo state by reading files the human pastes
   into chat, or by fetching GitHub URLs the human shares.

This means Claude always works one step behind the live repo state.
If Codex pushes a commit, Claude does not automatically know about it.
The human must share the relevant URLs or paste the file content
before Claude can review or build on it.

**What triggers Claude to act:**
- The human starts a new conversation and describes the current state.
- The human pastes console output, error messages, or file contents.
- The human shares GitHub URLs and asks Claude to fetch them.
- The human says "setze fort", "continue", "weiter", or "was ist der naechste schritt".

When Claude reads NEXT_STEPS.md it can reconstruct the current project
state and continue from the highest-scored pending item without needing
old conversation history.

---

## 2. What Claude Built (Phase by Phase)

### Phase 1 -- Foundation (commits 4f34d6a, dfbdf14)

Claude designed and generated the entire monorepo skeleton:

- `turbo.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.gitignore`, `.gitattributes`
- `packages/schemas/src/` -- four Zod schemas:
  - `model.schema.ts` -- LLM items, slots, capabilities, access tiers
  - `essence.schema.ts` -- transferable capabilities, transfer artifacts
  - `loadout.schema.ts` -- equipment configurations, routing config, memory config
  - `agent.schema.ts` -- pre-built character classes (Claude Code, Manus, etc.)
- `registry/` seed data:
  - models: Claude Sonnet 4.6, Claude Opus 4.6, Claude Mythos Preview, GPT-4o, Gemini 2.5 Flash
  - essences: instruction-following, code-generation, long-context-reasoning, metacognitive-eval
  - loadouts: software-engineering, research-synthesis
  - agents: claude-code, manus

**Why this structure:**
The schemas define the vocabulary of the entire system.
Everything else -- routing, tracking, optimization -- references these types.
Zod was chosen over plain TypeScript types because it validates at runtime,
not just at compile time. When a new model is added to the registry JSON
and the schema fails, the system catches it before it can cause a silent
routing error in production.

### Phase 2 -- IS Core (packages/is-core v0.2.0)

Claude built the IS engine with three subsystems:

**inventory/** -- loads and queries the registry at runtime:
- `model-registry.ts` -- ModelRegistry class, loads models/*.json
- `essence-library.ts` -- EssenceLibrary class, loads essences/*.json
- `loadout-manager.ts` -- LoadoutManager class, loads loadouts/*.json

**routing/** -- the Necklace Slot (Meta-Router):
- `task-classifier.ts` -- TaskClassifier: calls generateObject() with Zod schema,
  classifies incoming task into a TaskType, returns suggestedLoadoutId + confidence
- `loadout-router.ts` -- LoadoutRouter: takes classifier output, resolves loadout,
  primary LLM, off-hand LLM, active essences, returns RouteResult

**Key architectural decision: Vercel AI SDK + generateObject()**
generateObject() forces the LLM to return a Zod-validated object at runtime.
This is the "AI filter" -- even if the LLM hallucinates, Zod rejects the output
and the classifier retries up to 3 times.

### Phase 2b -- Metacognitive OODA Loop (packages/is-core v0.3.0)

Claude extended the IS engine with the feedback and self-optimization layer:

- `performance-tracker.ts` -- writes route metrics to Supabase is_task_metrics,
  and feedback to is_feedback. Returns routeId (UUID) so feedback can reference it.
- `self-analyzer.ts` -- reads metrics + feedback, computes LoadoutInsight per loadout
  (correctness rate, avg rating, latency, trend), produces AnalysisReport.
- `self-optimizer.ts` -- reads AnalysisReport, applies rule-based decisions
  (raise confidence threshold when correctness < 70%, boost priority when
  correctness >= 85% + rating >= 4, reduce priority on degrading trend),
  writes RoutingWeight rows to is_routing_weights in Supabase.

**The IS class (src/index.ts) exposes three methods:**
- `is.route(task)` -- returns { result, routeId }
- `is.feedback(routeId, { correct, rating, notes })` -- manual ground truth
- `is.analyze()` -- returns AnalysisReport
- `is.optimize()` -- runs SelfOptimizer (requires 5+ feedback entries)

**Supabase migrations:**
- `001_is_task_metrics.sql` -- route tracking table
- `002_is_feedback.sql` -- feedback table with FK to metrics
- `003_is_routing_weights.sql` -- optimizer output table

### Phase validate:registry -- scripts/validate-registry.ts

Claude built a registry validation command (intent score 89/100 per NEXT_STEPS.md):

- Validates every JSON file in registry/ against its Zod schema
- Performs cross-reference integrity checks:
  - loadout.primaryLlmId must exist in models registry
  - loadout.offHandLlmId must exist in models registry (if set)
  - loadout.activeEssenceIds must all exist in essences registry
  - loadout.routing.fallbackLoadoutId must exist in loadouts (if set)
  - agent.defaultLoadoutId must exist in loadouts (if set)
  - agent.internalModelId must exist in models (if set)
  - model.essenceIds must all exist in essences registry
  - agent.essenceIds must all exist in essences registry
- Exits 0 on success, 1 on any error
- Supports --verbose (show all files) and --fix-hints (show fix suggestions)

Commands: `pnpm validate:registry` / `pnpm validate:registry:verbose` / `pnpm validate:registry:fix`

---

## 3. Claude's Architectural Philosophy

**Registry JSON files are the source of truth.**
Routing weights, feedback data, and optimizer output live in Supabase.
But the canonical definition of a model, an essence, or a loadout is
always the JSON file in registry/. Supabase data augments runtime behavior;
it does not replace the registry.

**Zod schemas are the contract boundary.**
Any new registry entry must pass its Zod schema before the IS accepts it.
Any LLM output used for routing decisions must pass a Zod schema before
it is trusted. This is non-negotiable -- schema drift causes silent failures.

**The IS must function without Supabase.**
Supabase is the Helmet (memory) and Rings (integrations) -- valuable but
removable. All core routing must work offline with only the local registry
and a LLM API key. The `tracker`, `analyzer`, and `optimizer` properties on
the IS class are null when Supabase is not configured; the system degrades
gracefully rather than crashing.

**Provider-agnostic by design.**
The classifier currently uses Google Gemini 2.5 Flash (free tier, no credit card).
The Primary Weapon slot (primary LLM in a loadout) can reference any provider.
Changing the classifier model is a single config line. Changing the primary LLM
for a loadout is a single JSON edit. No code changes required in either case.

**Self-optimization is gated on data.**
The SelfOptimizer will not run with fewer than 5 feedback entries. The
SelfAnalyzer surfaces this as a recommendation. This is intentional --
optimizing on insufficient data produces misleading routing weights.

---

## 4. How Claude Reviews Codex Decisions

Claude reads `docs/AI_DECISIONS.md` when the human shares GitHub URLs.
Claude adds entries with status `approved`, `concern`, or `veto`.
A veto is blocking; a concern is advisory.

**Claude's review criteria (in priority order):**
1. Does this change break the no-Supabase fallback behavior?
2. Does this change introduce schema drift (runtime data not validated by Zod)?
3. Does this change make the registry JSON files secondary to runtime state?
4. Does this change reduce reversibility (harder to undo than to do)?
5. Does this change reduce the human owner's ability to understand what the system is doing?

If the answer to any of the above is yes, Claude will raise a concern or veto.

---

## 5. How Codex Should Trigger Claude Review

Claude cannot monitor the repo continuously.
To get Claude's review, the human should:

1. Share the GitHub URL of the changed file with Claude.
2. Or paste the relevant file contents into the conversation.
3. Ask Claude to review, approve, or raise concerns.

Alternatively, Codex can add a dated entry to AI_DECISIONS.md with
status `proposed` and note `awaiting Claude review`. Claude will pick
this up the next time the human shares the file URL.

---

## 6. Division of Labor (as of 2026-07-11)

| Area                        | Owner         | Notes                                      |
|-----------------------------|---------------|--------------------------------------------|
| Zod schema definitions      | Claude        | Claude owns the type contract              |
| Registry seed data          | Claude        | Claude added initial models/essences       |
| Adding new registry entries | Codex / Human | Must pass pnpm validate:registry           |
| IS Core engine design       | Claude        | Claude owns src/index.ts architecture      |
| IS Core implementation      | Claude / Codex| Codex may extend; Claude reviews           |
| Dynamic routing weights     | Codex         | Codex wired LoadoutRouter weight source    |
| SelfOptimizer rules         | Claude        | Claude owns the optimization logic         |
| Supabase migrations         | Claude        | Claude owns the schema                     |
| Registry validator          | Claude        | scripts/validate-registry.ts              |
| Documentation               | Codex / Claude| Codex writes; Claude reviews and appends  |
| Product strategy            | Human (Nasri) | Both AIs advise; human decides             |
| Commit / push decisions     | Human (Nasri) | AIs never push without human approval      |

---

## 7. Current Known State (2026-07-11)

- pnpm build: passing (3/3 packages)
- pnpm example: passing with Gemini 2.5 Flash as classifier
- Supabase: connected (yfjoofcyqyomuucjqlzm.supabase.co)
- Tracked routes: 6 (per NEXT_STEPS.md)
- Feedback entries: 6 (100% correctness, 5.0 avg rating, stable trend)
- pnpm validate:registry: added in this session (not yet committed)
- pnpm optimize: not yet run (requires 10 feedback entries recommended)

**Next highest-scored items per NEXT_STEPS.md:**
1. pnpm validate:registry -- done in this session (intent 89/100)
2. Focused tests for analyzer and optimizer (intent 86/100)
3. Benchmark protocol for routing changes (intent 82/100)

---

*This document is written by Claude and should be updated by Claude
after each significant session. Codex should not overwrite this file
but may append observations under a dated section at the bottom.*
