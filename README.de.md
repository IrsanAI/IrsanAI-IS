# IrsanAI IS -- AI 360 Inventory System

> *Rüste das richtige LLM aus. Extrahiere die Essenz. Übertrage sie weiter.*

**Sprachen:** [English](./README.md) | Deutsch

Teil des [IrsanAI Universe](https://github.com/IrsanAI/IrsanAI-Universe).

---

## Konzept

Das IrsanAI Inventory System (IS) behandelt KI-Komponenten wie ausrüstbare Items,
inspiriert von Ausrüstungs- und Essenzmechaniken aus Action-RPGs wie Diablo Immortal.
Jede Komponente belegt einen **Slot**, jedes Modell trägt eine **Essenz**, und der
IS **Meta-Router** stellt für eine eingehende Aufgabe ein passendes **Loadout** zusammen.

| IS-Komponente       | Slot-Analogie | Beispiel                         |
|---------------------|---------------|----------------------------------|
| Core LLM            | Primärwaffe   | Claude Sonnet 4.6                |
| Specialist LLM      | Nebenhand     | o3, Gemini 2.5 Pro               |
| Memory System       | Helm          | Supabase pgvector, Mem0          |
| Orchestration Layer | Brustpanzer   | LangGraph, AutoGen               |
| MCP Tools           | Schultern     | Websuche, Code-Ausführung        |
| API-Integrationen   | Ringe         | Supabase, GitHub, Slack          |
| IS Core / Router    | Amulett       | @irsanai/is-core                 |
| Trainierte Fähigkeit | **Essenz**   | instruction-following            |
| Optimale Konfig     | **Loadout**   | software-engineering             |

Das **Essenz**-Konzept ist zentral: Nützliche Fähigkeiten eines Modells werden
dokumentiert und über System-Prompt-Blueprints, Few-Shot-Packs, Evaluationsnotizen
oder Prompt-Patterns portabel gemacht -- damit funktionierendes KI-Verhalten
weitergetragen werden kann, während sich Modelle und Tools verändern.

---

## Aktueller Stand

Das Repository ist aktuell ein TypeScript-Monorepo mit diesen funktionierenden
Bausteinen:

- typisierte Zod-Schemas für Modelle, Essenzen, Loadouts und Agents,
- Registry-Seed-Daten für KI-Komponenten und Aufgaben-Loadouts,
- ein `@irsanai/is-core` Package mit Task-Klassifizierung und Loadout-Routing,
- optionales Supabase-basiertes Performance-Tracking,
- manuelles Feedback für geroutete Aufgaben,
- eine Self-Analysis-Schicht, die Routing-Qualität und Empfehlungen zusammenfasst,
- ein Self-Optimizer-Grundgerüst, das nach genug Feedback dynamische Routing-Weights schreiben kann,
- dynamische Routing-Weights können vom Router konsumiert werden, wenn Supabase
konfiguriert ist,
- ein lauffähiger `pnpm example` Ablauf für Routing, Feedback und Analyse.

Das Projekt ist damit nicht mehr nur eine Schema-Registry. Es besitzt bereits
einen frühen metakognitiven Loop:

```text
Observe  -> Routing-Metriken und Feedback erfassen
Orient   -> Loadout-Performance analysieren
Decide   -> Änderungen an Routing-Weights ableiten
Act      -> Optimizer-Ausgabe für zukünftiges Routing schreiben
```

Der Loop ist bewusst einfach und inspizierbar gehalten. Ziel ist, zukünftige
KI-Konfigurationsentscheidungen erklärbar, überprüfbar und über Zeit verbesserbar
zu machen.

---

## Monorepo-Struktur

```text
IrsanAI-IS/
|-- packages/
|   |-- schemas/         <-- @irsanai/schemas  (Zod-Schemas und Typen)
|   |-- is-core/         <-- @irsanai/is-core  (Routing- und Metakognitions-Engine)
|   +-- sdk/             <-- @irsanai/sdk      (zukünftiges npm SDK)
|-- registry/
|   |-- models/          <-- LLM-Item-Definitionen (JSON)
|   |-- essences/        <-- wiederverwendbare Fähigkeitsprofile (JSON)
|   |-- loadouts/        <-- Aufgaben-Build-Konfigurationen (JSON)
|   +-- agents/          <-- vorgebaute Charakterklassen (JSON)
|-- supabase/
|   +-- migrations/      <-- Tabellen für Tracking, Feedback und Routing-Weights
|-- examples/
|   +-- basic-usage.ts   <-- route -> feedback -> analyze Beispiel
|-- docs/
|   |-- PRODUCT_STRATEGY.md
|   |-- AI_COLLABORATION.md
|   +-- AI_DECISIONS.md
+-- apps/
    +-- is-dashboard/    <-- Next.js + Supabase Inventory Screen (geplant)
```

---

## Schnellstart

```bash
# Voraussetzungen: Node.js >= 20, pnpm >= 9
git clone https://github.com/IrsanAI/IrsanAI-IS.git
cd IrsanAI-IS
pnpm install
pnpm build
```

Beispiel starten:

```bash
pnpm example
```

Das Beispiel routet eine TypeScript/Zod-Debugging-Aufgabe, gibt das gewählte
Loadout aus, sendet manuelles Feedback, wenn Supabase-Tracking konfiguriert ist,
und gibt danach einen Analysebericht aus.

---

## Optional: Supabase-Tracking

Das Beispiel kann Routing-Metriken und manuelles Feedback nach Supabase schreiben,
wenn diese Umgebungsvariablen vorhanden sind:

```dotenv
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<legacy-service-role-secret>
```

Nutze nur die Projekt-Base-URL -- hänge kein `/rest/v1/` an. Wenn in deinem
Supabase-Projekt **Automatically expose new tables** deaktiviert ist, führe die
SQL-Migrationen in `supabase/migrations/` aus; sie enthalten die nötigen
`service_role`-Grants für die RLS-geschützten Tracking-Tabellen.

Wenn Migrationen und Umgebungsvariablen korrekt gesetzt sind, sollte
`pnpm example` eine echte UUID für `Route ID` ausgeben, Feedback über
`PerformanceTracker` speichern und mindestens eine getrackte Route im
Analysebericht anzeigen. Wenn `Route ID` `(no Supabase -- tracking off)` ist
oder die Konsole `permission denied for table is_task_metrics` ausgibt, prüfe
Base-URL, Legacy-`service_role`-Key und Migration-Grants erneut.

---

## Verwendung von @irsanai/schemas

```typescript
import fs from 'fs'
import { ModelSchema, EssenceSchema, LoadoutSchema } from '@irsanai/schemas'

// Registry-Eintrag zur Laufzeit validieren + typisieren
// (Zod erkennt Schema-Drift zwischen Registry-JSON und TypeScript-Typen)
const model = ModelSchema.parse(
  JSON.parse(fs.readFileSync('./registry/models/claude-sonnet-4-6.json', 'utf-8'))
)

console.log(model.essenceIds)  // string[]
console.log(model.accessTier)  // 'public' | 'api' | 'restricted' | 'mythic'
console.log(model.slot)        // 'primary-weapon' | 'off-hand' | 'any'
```

---

## Systemarchitektur

| Schicht             | Technologie                       | Warum                             |
|---------------------|-----------------------------------|-----------------------------------|
| Sprache             | TypeScript (strict, NodeNext ESM) | Typsicherheit als KI-Filter (Zod) |
| Schema-Validierung  | Zod                               | Runtime- und Compile-Time-Safety  |
| LLM-Abstraktion     | Vercel AI SDK + generateObject()  | Provider-agnostischer Modellslot  |
| Build-System        | Turborepo + pnpm workspaces       | Monorepo, geteilte @irsanai/schemas |
| Registry Backend    | aktuell JSON, später Supabase     | Erst einfache lokale Source of Truth |
| Tracking Backend    | Supabase                          | Routing-Metriken, Feedback, Weights |
| Dashboard           | Next.js (geplant)                 | Full-Stack TypeScript             |

---

## Benchmark & Validierung

Jeder relevante Commit sollte das Projekt messbar halten. Mindestens sollte
dokumentiert werden, welche dieser Checks ausgeführt wurden:

| Check | Command | Was validiert wird |
|-------|---------|--------------------|
| Build | `pnpm build` | Alle Packages kompilieren über Turborepo. |
| Example Smoke Test | `pnpm example` | Route -> optional track -> optional feedback -> analyze. |
| Supabase Tracking Smoke Test | `pnpm example` mit `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` | Eine echte `Route ID` wird geschrieben und Feedback kann gespeichert werden. |
| Registry Validation | `pnpm build` plus Schema-Verwendung | Registry-JSON passt weiter zu TypeScript/Zod-Erwartungen. |

Aktuelle Baseline:

| Datum | Baseline | Ergebnis |
|-------|----------|----------|
| 2026-07-10 | `pnpm build` | Läuft im aktuellen Workspace erfolgreich durch. |
| 2026-07-10 | `pnpm example` mit konfiguriertem Supabase | Manuell verifiziert: Route-UUID, Feedback gespeichert, Analysebericht befüllt. |

Zukünftige Benchmarks sollten kleine, wiederholbare Checks gegenüber vagen Claims
bevorzugen. Wenn ein neues Feature Routing-Qualität, Tracking-Verhalten oder
Optimizer-Ausgabe verändert, sollte eine Benchmark-Notiz erklären, wie die
Verbesserung validiert wurde.

---

## Produktausrichtung

Die public-safe Ausrichtung ist in [`docs/PRODUCT_STRATEGY.md`](./docs/PRODUCT_STRATEGY.md)
dokumentiert. Kurz gesagt soll IrsanAI IS fokussiert bleiben auf:

- Essenzen,
- Loadouts,
- portables KI-Konfigurationswissen,
- erklärbares Task-to-Loadout-Routing,
- Feedback-Loops, die zukünftige Routing-Entscheidungen verbessern.

Das Projekt sollte keine privaten Preise, Marktanteilsziele, Competitive Battle
Plans oder unveröffentlichte Launch-Strategien in öffentlicher Dokumentation
offenlegen. Wenn private Strategie Auswirkungen auf den Code hat, sollte nur die
sichere technische Konsequenz committed werden.

---

## Roadmap

| Phase | Beschreibung | Status |
|-------|--------------|--------|
| 1 | Zod-Schemas + Registry-Seed-Daten | Erledigt |
| 2 | IS Core: Task-Klassifizierung + Loadout-Router | Erledigt |
| 2b | Metakognitiver Loop: Tracking, Feedback, Analyse | Aktiv |
| 2c | Dynamische Routing-Weights werden vom Router konsumiert | Erledigt |
| 2d | Registry-Validierungscommand | Als Nächstes |
| 3 | Dashboard: Next.js + Supabase Inventory Screen | Geplant |
| 4 | SDK: @irsanai/sdk npm publish | Geplant |

---

## AI Collaboration

Dieses Repo enthält dauerhafte Kollaborationshinweise für KI-Assistenten:

- [`AGENTS.md`](./AGENTS.md) enthält Repo-Level-Anweisungen für zukünftige Agenten.
- [`docs/AI_COLLABORATION.md`](./docs/AI_COLLABORATION.md) erklärt den Codex-/Claude-Handoff.
- [`docs/AI_DECISIONS.md`](./docs/AI_DECISIONS.md) ist das gemeinsame Decision- und Veto-Log.
- [`docs/NEXT_STEPS.md`](./docs/NEXT_STEPS.md) dokumentiert gerankte Fortsetzungsarbeit.
- [`docs/LOW_SCORE_BACKLOG.md`](./docs/LOW_SCORE_BACKLOG.md) bewahrt geprüfte, aber zurückgestellte Ideen.
- [`docs/BENCHMARK_LOG.md`](./docs/BENCHMARK_LOG.md) protokolliert konkrete Validierungsläufe.

Zukünftige KI-Arbeit sollte wichtige Produktentscheidungen nicht nur im Chatverlauf
verstecken. Wenn eine Entscheidung später relevant ist, gehört sie ins Repo.

---

*Teil des [IrsanAI Universe](https://github.com/IrsanAI) --
ein produktiver KI-Stack von IrsanAI.*
