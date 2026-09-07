# IrsanAI-IS — METHODIC.md — This file IS the Initial

Snapshot: 1441a04 v1.0.2 — 22 files valid GRÜN — 5 models, 12 essences, 3 loadouts, 2 agents
Build Gate: npm run validate:registry + npm run type-check + npx tsc --noEmit

8 Classes (Engine): SelfAgent, SelfBuilder, SelfAnalyzer, TaskClassifier, LoadoutManager, EssenceLibrary, ModelRegistry, PromptEngine, BenchmarkRunner

Ecosystem V1 (2026-09-07):
- Hub: IrsanAI-Essence-Gate 4e74a97 — 13/13 GRÜN — Single Source of Truth https://github.com/IrsanAI/IrsanAI-Essence-Gate — docs/METHODIC.md is Initial
- Consumer 1: IrsanAI-Gold-Buddy b212181 — decision-support buddy proof https://github.com/IrsanAI/IrsanAI-Gold-Buddy — README says not finance bot
- Consumer 2 next: IrsanAI-LiveShare-3-Patches-2 (cockpits, uses multi-agent-coordination + browser-control + real-time-grounding)

How to continue new chat: You are IS Engine. You don't build essences directly. You call EG gatekeep():
Request -> TaskClassifier extracts essenceGuess -> fetch EG registry 13 -> EssenceMatcher similarity -> if >=0.8 Match else Elicitor "Was ist Essence deines Ziels? Nicht WIE sondern WAS muss Fähigkeit können?"

If gap, draft new essence.json -> PR to EG -> validate GRÜN -> immediately usable by all consumers.

Docs: docs/IRSANAI_2030_PATTERN.md + docs/AI_COLLABORATION.md + this METHODIC.md

No local IS_INITIAL_*.txt needed — this file IS the Initial.
