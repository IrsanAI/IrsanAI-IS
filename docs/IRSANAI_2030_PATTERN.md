IRSANAI 2030 PATTERN — IrsanAI-IS v0.3.0 Root-Ascent v0.4
Equip the right LLM. Extract the essence. Transfer it forward.
Basis: packages/is-core/src/index.ts head 40 grep-verifiziert + Build Gate Termux GRÜN

1. Build Gate Termux — GRÜN (Stand 2026-09-07)
--
~/github/IrsanAI/IrsanAI-IS $ pnpm validate:registry --verbose
[IS:validate:registry] 22 files — all valid
Models: 5 valid
Essences: 12 valid (inkl. is-router-core.json, 10 minutes ago auf GitHub)
Loadouts: 3 valid
Agents: 2 valid
Cross-references: valid

~/.../packages/schemas $ npx tsc -p tsconfig.json --noEmit
-> GRÜN (kein Output)

~/.../packages/is-core $ npx tsc -p tsconfig.json --noEmit
-> GRÜN nach pnpm -F @irsanai/schemas build

~/.../ $ npx vitest run
Test Files 2 passed
self-analyzer.test.ts: 14 tests
self-optimizer.test.ts: 11 tests
Tests 25 passed (25)

git ls-files | grep is-router-core.json
-> tracked

git log -1 --oneline origin/main -> a0dfb88
2. Root-Ascent Prinzip — Produkt vs Scaffold (grep-verifiziert)
Methode:
head -n 40 packages/is-core/src/index.ts grep -R "from './inventory/" packages/is-core/src/ grep -R "from './routing/" packages/is-core/src/ grep -R "from './metacognition/" packages/is-core/src/
Entry head 40 Ergebnis:
import { ModelRegistry } from './inventory/model-registry.js'
import { EssenceLibrary } from './inventory/essence-library.js'
import { LoadoutManager } from './inventory/loadout-manager.js'
import { TaskClassifier } from './routing/task-classifier.js'
import { LoadoutRouter } from './routing/loadout-router.js'
import { PerformanceTracker } from './metacognition/performance-tracker.js'
import { SelfAnalyzer } from './metacognition/self-analyzer.js'
import { SelfOptimizer } from './metacognition/self-optimizer.js'
import type { RouteResult } from './routing/loadout-router.js'
import type { AnalysisReport } from './metacognition/self-analyzer.js'

export class IS { readonly models: ModelRegistry readonly essences: EssenceLibrary readonly loadouts: LoadoutManager readonly tracker: PerformanceTracker | null readonly analyzer: SelfAnalyzer | null readonly optimizer: SelfOptimizer | null }
Produkt = nur diese 8 Klassen, die Entry importiert:

#	Klasse	Pfad	Rolle
1	ModelRegistry	inventory/model-registry.ts	5 Modelle verwalten
2	EssenceLibrary	inventory/essence-library.ts	12 Essences verwalten
3	LoadoutManager	inventory/loadout-manager.ts	3 Loadouts verwalten
4	TaskClassifier	routing/task-classifier.ts	taskType klassifizieren
5	LoadoutRouter	routing/loadout-router.ts	taskType -> loadoutId routen
6	PerformanceTracker	metacognition/performance-tracker.ts	Runs tracken
7	SelfAnalyzer	metacognition/self-analyzer.ts	14 tests, degrading trends erkennen
8	SelfOptimizer	metacognition/self-optimizer.ts	11 tests, weights updaten
Keine weiteren Imports im Entry. Alles was nicht in diesen 8 ist = Scaffold.

Scaffold = getrennt, nicht im Entry:

apps/is-dashboard/ — single-file HTML Dashboard + BENCHMARK_LOG (3 runs) — Scaffold
turbo — Build Tool, android-arm64 not supported — Scaffold, nicht Produkt
examples/ — Beispiel-Nutzung — Scaffold
docs/ — CLAUDE_WORKING_NOTES.md, AI_COLLABORATION_HANDOFF.md — Scaffold
scripts/validate-registry.ts — Validation Script — Scaffold
Historie ehrlich:
c1f55e2 test: vitest 25/25 d1f0e0f feat: IS Dashboard single-file HTML ae664b2 feat: 3 loadouts benchmark v2 67% 8c5b82a docs: CLAUDE_WORKING_NOTES.md d128468 feat: 7 missing essences + validate:registry 20 files a0dfb88 feat: is-router-core.json 12th essence -> 22 files
3. Termux Workarounds — pnpm 9.0.0
Umgebung:

Termux on android-arm64
pnpm 9.0.0 OK, +80 packages nach pnpm install
turbo: not supported on android-arm64 (expected, dokumentiert)
Workaround (statt turbo):
statt pnpm build (turbo)
pnpm -F @irsanai/schemas build
npx tsc -p packages/schemas/tsconfig.json --noEmit
npx tsc -p packages/is-core/tsconfig.json --noEmit
npx vitest run
npx tsx scripts/validate-registry.ts --verbose

oder als npm scripts:
package.json
{ "scripts": { "build:android": "pnpm -F @irsanai/schemas build && npx tsc -p packages/schemas --noEmit && npx tsc -p packages/is-core --noEmit", "test:android": "npx vitest run", "validate:android": "npx tsx scripts/validate-registry.ts --verbose" } }
4. Fix Guide — 2 bekannte Fehler behoben
Fix 1: TS2307 Cannot find module '@irsanai/schemas' (5x)
Symptom:
essence-library.ts:3 TS2307 loadout-manager.ts:3 TS2307 model-registry.ts:3 TS2307 loadout-router.ts:1 TS2307 task-classifier.ts:4 TS2307
Ursache: Workspace Package @irsanai/schemas nicht gebaut/linked, obwohl pnpm install OK.

Fix:
cd packages/schemas
npx tsc -p tsconfig.json

erzeugt dist/ mit .js + .d.ts
cd ../is-core
npx tsc -p tsconfig.json --noEmit

-> 5 Fehler weg, nur noch TS2322 übrig
--

Alternative:
pnpm -F @irsanai/schemas build
Fix 2: TS2322 task-classifier.ts:55 taskType required
Symptom:
task-classifier.ts:55 TS2322 Type '{ taskType?: unknown ... }' is not assignable to type 'ClassificationResult' Property 'taskType' is optional but required in ClassificationResult
Ursache: Zod parse gibt unknown / optional zurück, ClassificationResult verlangt taskType required.

Fix — safeParse Guard:
// vorher:
const result = schema.parse(raw)
return result as ClassificationResult // taskType optional vs required -> TS2322

// nachher:
const ClassificationSchema = z.object({
taskType: z.string().min(1), // required!
confidence: z.number().min(0).max(1).default(0.8),
reasoning: z.string().optional()
})

function classify(raw: unknown): ClassificationResult { const parsed = ClassificationSchema.safeParse(raw) if (!parsed.success) { throw new Error(Invalid classification: ${parsed.error.message}) } if (!parsed.data.taskType) { throw new Error('Classification missing required taskType') } return { taskType: parsed.data.taskType, // jetzt required, assignable confidence: parsed.data.confidence, reasoning: parsed.data.reasoning ?? '' } as ClassificationResult }
Verifikation:
cd packages/is-core
npx tsc -p tsconfig.json --noEmit

-> kein Output = GRÜN
--

5. Thinking Loop — Observe -> Orient -> Decide -> Act
Aus IrsanAI-IS metacognition/ + docs/AI_COLLABORATION_HANDOFF.md

--
Observe:

head -n 40 packages/is-core/src/index.ts (8 Imports)
npx tsx scripts/validate-registry.ts --verbose (22 files)
npx tsc -p packages/schemas --noEmit (GRÜN)
npx tsc -p packages/is-core --noEmit (GRÜN nach Fix)
npx vitest run (25/25: 14 SelfAnalyzer + 11 SelfOptimizer)
git ls-files + git log -10 (Historie ehrlich, origin/main a0dfb88)
Orient:

Root-Ascent v0.4: Produkt = nur was Entry importiert? Ja -> 8 Klassen
Scaffold getrennt? Ja -> apps/is-dashboard single-file HTML, turbo not supported, examples/
Build Gate? Ja -> 4 Gates GRÜN
Termux: pnpm 9.0.0 OK, turbo workaround npx dokumentiert
Decide:

TaskClassifier -> taskType: planning-strategy | research-synthesis | software-engineering
LoadoutRouter -> loadoutId mapping
PerformanceTracker -> SelfAnalyzer (degrading trends) -> SelfOptimizer (weight update)
Beispiel Log: research-synthesis boost +10, software-engineering -5 degrading -> weight anpassen
Act:

RouteResult { loadoutId, modelId, essenceIds, confidence, reasoning }
AnalysisReport { trends, degradations }
Optimizer update -> registry + BENCHMARK_LOG
--
AI_COLLABORATION_HANDOFF:

Session Start: git log -10 + head 40 Entry + validate:registry --verbose + vitest head
DAD: Docs -> AI -> Docs (CLAUDE_WORKING_NOTES.md, AI_DECISIONS.md)
Essence Creation: Für jedes neue Repo eigene Essence in registry/essences/*.json, Zod validiert
6. 2030 Pattern — nur mit 8 Produkt-Klassen
Ziel 2030: IS läuft vollständig aus den 8 Entry-Imports, ohne Scaffold-Abhängigkeit.

Produkt-Klasse	2026 (jetzt)	2030 Vision	Transfer
ModelRegistry	5 Modelle	50+ Modelle, pgvector Suche	Zod Schema + Supabase
EssenceLibrary	12 Essences inkl. is-router-core	200+ Essences, vector similarity	is-router-core als Meta-Essence
LoadoutManager	3 Loadouts (planning, research, software)	20+ Loadouts, auto-generated	SelfOptimizer generiert Loadouts
TaskClassifier	Zod + safeParse Guard	Distilled tiny model <10ms	25 tests als training data, gemini-2-5-flash fine-tuned
LoadoutRouter	taskType -> loadoutId	Confidence-aware routing + fallback	RouteResult mit reasoning
PerformanceTracker	BENCHMARK_LOG 3 runs	Persistent tracker Supabase	Benchmark v2 67% -> v3 >80% Ziel
SelfAnalyzer	14 tests, erkennt degrading	Trend prediction	-5 software-engineering fix via TS2322
SelfOptimizer	11 tests, weight updates	Auto weight tuning	+10 research-synthesis als Pattern
Loadout Evolution 2030:

planning-strategy -> autonomous-planning (SelfAnalyzer erkennt planning gaps)
research-synthesis -> synthesis-ensemble (multi-model, boost +10 Pattern)
software-engineering -> self-correcting-engineering (SelfOptimizer -5 degrading behoben)
Scaffold bleibt Scaffold:

apps/is-dashboard single-file HTML bleibt Scaffold, wird zu Next.js + Supabase in Phase 3, aber nie Produkt
turbo bleibt Scaffold (android-arm64 not supported dokumentiert), Workaround bleibt npx
examples/ bleibt Scaffold
7. Validation — 22 files
--
Vorher: 21 files = 5 models + 11 essences + 3 loadouts + 2 agents
Jetzt: 22 files = 5 models + 12 essences (neu is-router-core) + 3 loadouts + 2 agents
Cross-refs: is-router-core referenziert alle 3 Loadouts + 5 Modelle -> valid

git ls-files registry/essences/is-router-core.json -> tracked origin/main a0dfb88 -> 22 files all valid
8. Next Steps
 is-router-core.json tracked (a0dfb88)
 schemas build -> TS2307 fix (5 Fehler)
 task-classifier safeParse Guard -> TS2322 fix (1 Fehler)
 tsc schemas + tsc is-core GRÜN
 vitest 25/25 GRÜN
 validate:registry 22 files GRÜN
 docs/IRSANAI_2030_PATTERN.md neu schreiben (dieses Doc) -> nach docs/ kopieren
 git commit: docs: rewrite 2030 pattern with 8-class product rule, Termux workarounds, fix guides
 Benchmark v3 mit is-router-core messen (Ziel >67%)
IrsanAI-IS v0.3.0 Root-Ascent v0.4 + 8-Class Product Rule (ModelRegistry, EssenceLibrary, LoadoutManager, TaskClassifier, LoadoutRouter, PerformanceTracker, SelfAnalyzer, SelfOptimizer) + Termux pnpm 9.0.0 Workarounds + Build Gate GRÜN 22 files

