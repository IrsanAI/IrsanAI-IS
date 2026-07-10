# IrsanAI IS Product Direction

## Public-Safe Positioning

This repository should communicate the direction of IrsanAI IS without exposing
private go-to-market strategy, pricing, competitive analysis, or naming ideas.
Assume this file may be read by users, contributors, competitors, and future AI
assistants.

The public-safe direction is:

> **IrsanAI IS helps teams preserve, compose, and transfer AI configuration
> knowledge through Essences and Loadouts.**

In practical terms:

- **Essences** describe reusable model capabilities, prompt patterns, few-shot
packs, and operating principles.
- **Loadouts** describe task-specific combinations of models, tools, memory,
orchestration, and APIs.
- The **Meta-Router** should select and explain a suitable Loadout for a task.

The RPG inventory metaphor can make the system easier to understand, but it
should remain a product language layer, not the entire strategic explanation.

## What To Say Publicly

Use language like:

- AI inventory system
- Essence and Loadout registry
- configuration knowledge for AI systems
- portable AI stack configuration
- explainable task-to-loadout routing

Avoid overly revealing public language like:

- exact pricing plans
- exact target market-share goals
- direct competitor battle plans
- unreleased product names or launch positioning
- claims that expose a future commercial wedge before the product is ready

## Product Shape

The project should make it easy to:

1. define AI components as typed registry entries,
2. document model/task capabilities as Essences,
3. compose repeatable task Loadouts,
4. route tasks to suitable Loadouts with explainable reasoning,
5. collect route metrics and feedback,
6. improve future routing decisions from observed results.

## Near-Term Priorities

1. Keep schemas, migrations, examples, and registry data reliable.
2. Make Essence authoring clear enough that humans and AI assistants can extend
it consistently.
3. Make routing explanations inspectable and easy to challenge.
4. Keep feedback and metrics useful for later optimization.
5. Defer public commercial positioning until the core developer workflow is
stable.

## Private Strategy Boundary

Do not commit detailed pricing, market-share targets, competitive battle cards,
or unreleased naming/launch strategy to the public repo.

If such discussion is needed, keep it outside the public repository or summarize
only the durable technical implication here.
