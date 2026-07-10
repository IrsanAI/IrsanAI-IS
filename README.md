# IrsanAI IS -- AI 360 Inventory System

> *Equip the right LLM. Extract the essence. Transfer it forward.*

**Languages:** English | [Deutsch](./README.de.md)

Part of the [IrsanAI Universe](https://github.com/IrsanAI/IrsanAI-Universe).

---

## Concept

The IrsanAI Inventory System (IS) treats AI components as equippable items,
inspired by the equipment and essence mechanics of action RPGs like Diablo Immortal.
Each component occupies a **slot**, each model carries an **essence**, and the IS
**Meta-Router** assembles a suitable **loadout** for an incoming task.

| IS Component        | Slot Analogy   | Example                          |
|---------------------|----------------|----------------------------------|
| Core LLM            | Primary Weapon | Claude Sonnet 4.6                |
| Specialist LLM      | Off-hand       | o3, Gemini 2.5 Pro               |
| Memory System       | Helmet         | Supabase pgvector, Mem0          |
| Orchestration Layer | Chest Armor    | LangGraph, AutoGen               |
| MCP Tools           | Shoulders      | Web search, code execution       |
| API Integrations    | Rings          | Supabase, GitHub, Slack          |
| IS Core / Router    | Necklace       | @irsanai/is-core                 |
| Trained Capability  | **Essence**    | instruction-following            |
| Optimal Config      | **Loadout**    | software-engineering             |

The **Essence** concept is key: each model's useful capabilities are documented
and made portable through system prompt blueprints, few-shot packs, evaluation
notes, or prompt patterns -- so working AI behavior can be carried forward as
models and tools evolve.

---

## Current State

The repository is currently a TypeScript monorepo with these working building
blocks:

- typed Zod schemas for models, essences, loadouts, and agents,
- registry seed data for AI components and task loadouts,
- an `@irsanai/is-core` package with task classification and loadout routing,
- optional Supabase-backed performance tracking,
- manual feedback capture for routed tasks,
- a self-analysis layer that summarizes route quality and recommendations,
- a self-optimizer skeleton that can write dynamic routing weights after enough
feedback exists,
- a runnable `pnpm example` flow for routing, feedback, and analysis.

This means the project is no longer only a schema registry. It now has an early
metacognitive loop:

```text
Observe  -> track route metrics and feedback
Orient   -> analyze loadout performance
Decide   -> derive routing weight changes
Act      -> write optimizer output for future routing
```

The loop is intentionally simple and inspectable. The goal is to make future AI
configuration decisions explainable, reviewable, and improvable over time.

---

## Monorepo Structure

```text
IrsanAI-IS/
|-- packages/
|   |-- schemas/         <-- @irsanai/schemas  (Zod schemas and types)
|   |-- is-core/         <-- @irsanai/is-core  (routing + metacognition engine)
|   +-- sdk/             <-- @irsanai/sdk      (future npm SDK)
|-- registry/
|   |-- models/          <-- LLM item definitions (JSON)
|   |-- essences/        <-- reusable capability profiles (JSON)
|   |-- loadouts/        <-- task build configurations (JSON)
|   +-- agents/          <-- pre-built character classes (JSON)
|-- supabase/
|   +-- migrations/      <-- tracking, feedback, and routing weight tables
|-- examples/
|   +-- basic-usage.ts   <-- route -> feedback -> analyze example
|-- docs/
|   |-- PRODUCT_STRATEGY.md
|   |-- AI_COLLABORATION.md
|   +-- AI_DECISIONS.md
+-- apps/
    +-- is-dashboard/    <-- Next.js + Supabase inventory screen (planned)
```

---

## Quick Start

```bash
# Prerequisites: Node.js >= 20, pnpm >= 9
git clone https://github.com/IrsanAI/IrsanAI-IS.git
cd IrsanAI-IS
pnpm install
pnpm build
```

Run the example:

```bash
pnpm example
```

The example routes a TypeScript/Zod debugging task, prints the selected loadout,
submits manual feedback when Supabase tracking is configured, and then prints an
analysis report.

---

## Optional: Supabase Tracking

The example can write route metrics and manual feedback to Supabase when these
environment variables are present:

```dotenv
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<legacy-service-role-secret>
```

Use the project base URL only -- do not append `/rest/v1/`. If your Supabase
project has **Automatically expose new tables** disabled, run the SQL migrations
in `supabase/migrations/`; they include the required `service_role` grants for
the RLS-protected tracking tables.

After the migrations and environment variables are in place, `pnpm example`
should print a real UUID for `Route ID`, save feedback through
`PerformanceTracker`, and show at least one tracked route in the analysis report.
If `Route ID` is `(no Supabase -- tracking off)` or the console prints
`permission denied for table is_task_metrics`, re-check the base URL, legacy
`service_role` key, and migration grants.

---

## Using @irsanai/schemas

```typescript
import fs from 'fs'
import { ModelSchema, EssenceSchema, LoadoutSchema } from '@irsanai/schemas'

// Validate + type a registry entry at runtime
// (Zod catches any schema drift between registry JSON and TypeScript types)
const model = ModelSchema.parse(
  JSON.parse(fs.readFileSync('./registry/models/claude-sonnet-4-6.json', 'utf-8'))
)

console.log(model.essenceIds)  // string[]
console.log(model.accessTier)  // 'public' | 'api' | 'restricted' | 'mythic'
console.log(model.slot)        // 'primary-weapon' | 'off-hand' | 'any'
```

---

## System Architecture

| Layer             | Technology                        | Why                               |
|-------------------|-----------------------------------|-----------------------------------|
| Language          | TypeScript (strict, NodeNext ESM) | Type-safety as AI filter (Zod)    |
| Schema Validation | Zod                               | Runtime + compile-time safety     |
| LLM Abstraction   | Vercel AI SDK + generateObject()  | Provider-agnostic model slot      |
| Build System      | Turborepo + pnpm workspaces       | Monorepo, shared @irsanai/schemas |
| Registry Backend  | JSON now, Supabase later          | Simple local source of truth first |
| Tracking Backend  | Supabase                          | Route metrics, feedback, weights  |
| Dashboard         | Next.js (planned)                 | Full-stack TypeScript             |

---

## Benchmark & Validation

Every meaningful commit should keep the project measurable. At minimum, record
which of these checks were run:

| Check | Command | What it validates |
|-------|---------|-------------------|
| Build | `pnpm build` | All packages compile through Turborepo. |
| Example smoke test | `pnpm example` | Route -> optional track -> optional feedback -> analyze. |
| Supabase tracking smoke test | `pnpm example` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` | A real `Route ID` is written and feedback can be saved. |
| Registry validation | `pnpm build` plus schema usage | Registry JSON still matches TypeScript/Zod expectations. |

Current baseline:

| Date | Baseline | Result |
|------|----------|--------|
| 2026-07-10 | `pnpm build` | Passing in the current workspace. |
| 2026-07-10 | `pnpm example` with Supabase configured | Verified manually: route UUID, feedback saved, analysis report populated. |

Future benchmarks should prefer small, repeatable checks over vague claims. If a
new feature changes routing quality, tracking behavior, or optimizer output, add
a benchmark note that explains how the improvement was validated.

---

## Product Direction

The public-safe direction is documented in [`docs/PRODUCT_STRATEGY.md`](./docs/PRODUCT_STRATEGY.md).
In short, IrsanAI IS should stay centered on:

- Essences,
- Loadouts,
- portable AI configuration knowledge,
- explainable task-to-loadout routing,
- feedback loops that improve future routing decisions.

The project should not expose private pricing, market-share targets, competitive
battle plans, or unreleased launch strategy in public documentation. If private
strategy affects the codebase, only the safe technical implication should be
committed.

---

## Roadmap

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Zod schemas + registry seed data | Done |
| 2 | IS Core: task classifier + loadout router | Done |
| 2b | Metacognitive loop: tracking, feedback, analysis | Active |
| 2c | Optimizer integration into routing decisions | Next |
| 3 | Dashboard: Next.js + Supabase inventory screen | Planned |
| 4 | SDK: @irsanai/sdk npm publish | Planned |

---

## AI Collaboration

This repo includes durable collaboration guidance for AI assistants:

- [`AGENTS.md`](./AGENTS.md) gives repo-level instructions to future agents.
- [`docs/AI_COLLABORATION.md`](./docs/AI_COLLABORATION.md) explains the Codex / Claude handoff.
- [`docs/AI_DECISIONS.md`](./docs/AI_DECISIONS.md) is the shared decision and veto log.

Future AI work should avoid hiding important product reasoning only in chat
history. If a decision matters later, it belongs in the repo.

---

*Part of the [IrsanAI Universe](https://github.com/IrsanAI) --
a production AI stack built by IrsanAI.*
