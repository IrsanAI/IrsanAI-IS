# IrsanAI IS -- AI 360 Inventory System

> *Equip the right LLM. Extract the essence. Transfer it forward.*

Part of the [IrsanAI Universe](https://github.com/IrsanAI/IrsanAI-Universe).

---

## Concept

The IrsanAI Inventory System (IS) treats AI components as equippable items,
inspired by the equipment and essence mechanics of action RPGs like Diablo Immortal.
Each component occupies a **slot**, each model carries an **essence**, and the IS
**Meta-Router** assembles the optimal **loadout** for any incoming task.

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

The **Essence** concept is key: each model's unique trained capabilities are
documented and made transferable via system prompt blueprints, few-shot packs,
or prompt patterns -- so they can be moved to stronger models as the AI ecosystem evolves.

---

## Monorepo Structure

```
IrsanAI-IS/
|-- packages/
|   |-- schemas/         <-- @irsanai/schemas  (Zod -- start here)
|   |-- is-core/         <-- @irsanai/is-core  (IS engine, Phase 2)
|   +-- sdk/             <-- @irsanai/sdk      (npm SDK, Phase 3)
|-- registry/
|   |-- models/          <-- LLM item definitions (JSON)
|   |-- essences/        <-- Extractable capability profiles (JSON)
|   |-- loadouts/        <-- Build configurations (JSON)
|   +-- agents/          <-- Pre-built character classes (JSON)
+-- apps/
    +-- is-dashboard/    <-- Next.js + Supabase inventory screen (Phase 3)
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

### Using @irsanai/schemas

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

## Stack Decision

| Layer             | Technology                        | Why                               |
|-------------------|-----------------------------------|-----------------------------------|
| Language          | TypeScript (strict, NodeNext ESM) | Type-safety as AI filter (Zod)    |
| Schema Validation | Zod                               | Runtime + compile-time safety     |
| LLM Abstraction   | Vercel AI SDK + generateObject()  | Provider-agnostic model slot      |
| Build System      | Turborepo + pnpm workspaces       | Monorepo, shared @irsanai/schemas |
| Registry Backend  | Supabase (pgvector)               | Known stack from IrsanAI Chess    |
| Dashboard         | Next.js (Phase 3)                 | Full-stack TypeScript             |

---

## Roadmap

| Phase | Description                                           | Status    |
|-------|-------------------------------------------------------|-----------|
| 1     | Zod schemas + registry seed data                      | Done      |
| 2     | IS Core: task classifier, loadout router, metacog.    | Next      |
| 3     | Dashboard: Next.js + Supabase inventory screen        | Planned   |
| 4     | SDK: @irsanai/sdk npm publish                         | Planned   |

---

*Part of the [IrsanAI Universe](https://github.com/IrsanAI) --
a production AI stack built by IrsanAI.*
