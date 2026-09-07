# AI_COLLABORATION.md - IrsanAI-IS - Single Source of Truth for AI Handoff

Kein lokales IS_INITIAL_*.txt mehr noetig. Diese Datei + docs/METHODIC.md sind das Handoff. Online im Repo.

Session Start Routine - muss jeder Chat so starten (DAD):
git log --oneline -10
head -n 40 packages/is-core/src/index.ts
npx tsx scripts/validate-registry.ts --verbose
npx vitest run
cat docs/METHODIC.md
cat docs/AI_COLLABORATION.md
ls -lh docs/

Produkt = 8 Klassen (aus index.ts head 40):
Nur diese 8 sind Produkt, alles andere ist Scaffold:
ModelRegistry, EssenceLibrary, LoadoutManager, TaskClassifier, LoadoutRouter, PerformanceTracker, SelfAnalyzer, SelfOptimizer
Scaffold = apps/is-dashboard single-file HTML + turbo android-arm64 not supported + examples/ + docs/ + scripts/
Pruefung Verbot: grep -R -i photon|renderHost|Viewer|Landing|FileSystem|Transport -> 0 Treffer ausserhalb Verbot-Liste

OODA + DAD:
Observe: head 40 + validate 22 + tsc GRUEN + vitest 25/25 + git ls-files + ls docs/ + cat METHODIC.md
Orient: 8-Klassen Check, Scaffold getrennt, Build Gate 4x GRUEN, Termux pnpm 9.0.0 OK, Ecosystem Check EG 13/13 + GB b212181
Decide: TaskClassifier -> taskType (planning/research/software) -> LoadoutRouter -> RouteResult -> PerformanceTracker -> SelfAnalyzer -> SelfOptimizer (boost +10 research-synthesis, -5 software-engineering) -> EG gatekeep() vs 13 essences -> if >=0.8 Match else Elicitor
Act: RouteResult + AnalysisReport + registry update + BENCHMARK_LOG + PR to EG if gap
DAD: Docs (docs/METHODIC.md + docs/AI_COLLABORATION.md + docs/IRSANAI_2030_PATTERN.md) -> AI -> Docs - Kein lokales File mehr - alles online.

Ecosystem V1 - Gate Pattern (seit 2026-09-07):
Engine: This repo 449d707 - 22 valid
Hub: IrsanAI-Essence-Gate 4e74a97 13/13 GRUEN - Single Source of Truth, docs/METHODIC.md is Initial - https://github.com/IrsanAI/IrsanAI-Essence-Gate
Consumer 1: IrsanAI-Gold-Buddy b212181 - decision-support buddy proof, not finance bot - https://github.com/IrsanAI/IrsanAI-Gold-Buddy
Regel ab jetzt: IS baut nie direkt Essences. IS ruft immer EG gatekeep(essenceGuess): Request -> TaskClassifier essenceGuess -> fetch EG registry 13 -> EssenceMatcher -> if >=0.8 Match else Elicitor Was ist Essence deines Ziels?

Termux Workarounds (aus altem IS_INITIAL_V1_1.txt, jetzt hier online):
TS2307 5x: pnpm -F @irsanai/schemas build
TS2322 Line 55: safeParse Guard taskType required

Kein lokales Speichern mehr - IRSANAI steht fuer Einfachheit in komplexen Umgebungen.
Ab jetzt: README.md -> verlinkt docs/METHODIC.md + docs/AI_COLLABORATION.md -> enthaelt alles. Niemand muss je wieder lokale Dateien in richtiger Version suchen.
