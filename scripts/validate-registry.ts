#!/usr/bin/env node
/**
 * IrsanAI IS -- Registry Validator
 *
 * Validates all registry JSON files against @irsanai/schemas Zod definitions.
 * Exits 0 on success, 1 on any schema violation.
 *
 * Usage:
 *   pnpm validate:registry
 *   pnpm validate:registry --verbose
 *   pnpm validate:registry --fix-hints    (shows how to fix each error)
 */

import fs   from 'fs/promises'
import path from 'path'
import { z } from 'zod'

import {
  ModelSchema,
  EssenceSchema,
  LoadoutSchema,
  AgentSchema,
} from '../packages/schemas/src/index.js'

// ── Config ─────────────────────────────────────────────────────────────────────

const REGISTRY_PATH = path.resolve('./registry')
const VERBOSE       = process.argv.includes('--verbose')
const FIX_HINTS     = process.argv.includes('--fix-hints')

const SLOTS = [
  { dir: 'models',   schema: ModelSchema,   label: 'Model'   },
  { dir: 'essences', schema: EssenceSchema,  label: 'Essence' },
  { dir: 'loadouts', schema: LoadoutSchema,  label: 'Loadout' },
  { dir: 'agents',   schema: AgentSchema,    label: 'Agent'   },
] as const

// ── Helpers ───────────────────────────────────────────────────────────────────

type ValidationError = {
  file:   string
  field:  string
  issue:  string
  hint?:  string
}

function formatZodError(err: z.ZodError, file: string): ValidationError[] {
  return err.issues.map(issue => ({
    file,
    field:  issue.path.join('.') || '(root)',
    issue:  issue.message,
    hint:   FIX_HINTS ? buildHint(issue) : undefined,
  }))
}

function buildHint(issue: z.ZodIssue): string {
  switch (issue.code) {
    case 'invalid_enum_value':
      return `Expected one of: ${(issue as any).options?.join(' | ')}`
    case 'invalid_type':
      return `Got ${(issue as any).received}, expected ${(issue as any).expected}`
    case 'too_small':
      return `Value too small — minimum is ${(issue as any).minimum}`
    default:
      return issue.code
  }
}

function colorize(text: string, color: 'red' | 'green' | 'yellow' | 'cyan' | 'dim'): string {
  const codes = { red: '31', green: '32', yellow: '33', cyan: '36', dim: '2' }
  return `\x1b[${codes[color]}m${text}\x1b[0m`
}

// ── Cross-reference checks ────────────────────────────────────────────────────

async function crossRefCheck(
  models:   Record<string, any>[],
  essences: Record<string, any>[],
  loadouts: Record<string, any>[],
  agents:   Record<string, any>[],
): Promise<ValidationError[]> {
  const errors:    ValidationError[] = []
  const modelIds   = new Set(models.map(m => m.id))
  const essenceIds = new Set(essences.map(e => e.id))
  const loadoutIds = new Set(loadouts.map(l => l.id))

  // Models: essenceIds must exist
  for (const model of models) {
    for (const eid of (model.essenceIds ?? [])) {
      if (!essenceIds.has(eid)) {
        errors.push({
          file:  `models/${model.id}.json`,
          field: 'essenceIds',
          issue: `References unknown essence: "${eid}"`,
          hint:  FIX_HINTS ? `Add registry/essences/${eid}.json or remove this reference` : undefined,
        })
      }
    }
  }

  // Loadouts: primaryLlmId and offHandLlmId must exist in models
  for (const loadout of loadouts) {
    if (!modelIds.has(loadout.primaryLlmId)) {
      errors.push({
        file:  `loadouts/${loadout.id}.json`,
        field: 'primaryLlmId',
        issue: `References unknown model: "${loadout.primaryLlmId}"`,
        hint:  FIX_HINTS ? `Add registry/models/${loadout.primaryLlmId}.json or fix the ID` : undefined,
      })
    }
    if (loadout.offHandLlmId && !modelIds.has(loadout.offHandLlmId)) {
      errors.push({
        file:  `loadouts/${loadout.id}.json`,
        field: 'offHandLlmId',
        issue: `References unknown model: "${loadout.offHandLlmId}"`,
        hint:  FIX_HINTS ? `Add registry/models/${loadout.offHandLlmId}.json or fix the ID` : undefined,
      })
    }
    // activeEssenceIds must exist
    for (const eid of (loadout.activeEssenceIds ?? [])) {
      if (!essenceIds.has(eid)) {
        errors.push({
          file:  `loadouts/${loadout.id}.json`,
          field: 'activeEssenceIds',
          issue: `References unknown essence: "${eid}"`,
          hint:  FIX_HINTS ? `Add registry/essences/${eid}.json or remove this reference` : undefined,
        })
      }
    }
    // fallbackLoadoutId must exist if set
    const fallback = loadout.routing?.fallbackLoadoutId
    if (fallback && !loadoutIds.has(fallback)) {
      errors.push({
        file:  `loadouts/${loadout.id}.json`,
        field: 'routing.fallbackLoadoutId',
        issue: `References unknown loadout: "${fallback}"`,
        hint:  FIX_HINTS ? `Add registry/loadouts/${fallback}.json or fix the ID` : undefined,
      })
    }
  }

  // Agents: defaultLoadoutId and internalModelId must exist
  for (const agent of agents) {
    if (agent.defaultLoadoutId && !loadoutIds.has(agent.defaultLoadoutId)) {
      errors.push({
        file:  `agents/${agent.id}.json`,
        field: 'defaultLoadoutId',
        issue: `References unknown loadout: "${agent.defaultLoadoutId}"`,
        hint:  FIX_HINTS ? `Add registry/loadouts/${agent.defaultLoadoutId}.json or fix the ID` : undefined,
      })
    }
    if (agent.internalModelId && !modelIds.has(agent.internalModelId)) {
      errors.push({
        file:  `agents/${agent.id}.json`,
        field: 'internalModelId',
        issue: `References unknown model: "${agent.internalModelId}"`,
        hint:  FIX_HINTS ? `Add registry/models/${agent.internalModelId}.json or fix the ID` : undefined,
      })
    }
    for (const eid of (agent.essenceIds ?? [])) {
      if (!essenceIds.has(eid)) {
        errors.push({
          file:  `agents/${agent.id}.json`,
          field: 'essenceIds',
          issue: `References unknown essence: "${eid}"`,
          hint:  FIX_HINTS ? `Add registry/essences/${eid}.json or remove this reference` : undefined,
        })
      }
    }
  }

  return errors
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(colorize('\n[IS:validate:registry] Starting...\n', 'cyan'))

  let totalFiles  = 0
  let totalErrors = 0

  const collected: Record<string, Record<string, any>[]> = {
    models: [], essences: [], loadouts: [], agents: []
  }

  for (const slot of SLOTS) {
    const dir      = path.join(REGISTRY_PATH, slot.dir)
    let files: string[]

    try {
      files = (await fs.readdir(dir)).filter(f => f.endsWith('.json')).sort()
    } catch {
      console.log(colorize(`  [SKIP] registry/${slot.dir}/ not found`, 'dim'))
      continue
    }

    console.log(colorize(`  ${slot.label}s (${files.length} files)`, 'cyan'))
    let slotErrors = 0

    for (const file of files) {
      totalFiles++
      const filePath    = path.join(dir, file)
      const displayPath = `registry/${slot.dir}/${file}`

      let raw: unknown
      try {
        raw = JSON.parse(await fs.readFile(filePath, 'utf-8'))
      } catch (err) {
        console.log(colorize(`    ✗ ${file} — invalid JSON: ${(err as Error).message}`, 'red'))
        totalErrors++
        slotErrors++
        continue
      }

      const result = (slot.schema as z.ZodType).safeParse(raw)

      if (result.success) {
        if (VERBOSE) {
          console.log(colorize(`    ✓ ${file}`, 'green'))
        }
        collected[slot.dir].push(result.data as Record<string, any>)
      } else {
        const errs = formatZodError(result.error, displayPath)
        console.log(colorize(`    ✗ ${file}`, 'red'))
        for (const e of errs) {
          console.log(colorize(`        field: ${e.field}`, 'yellow'))
          console.log(`        issue: ${e.issue}`)
          if (e.hint) console.log(colorize(`        hint:  ${e.hint}`, 'dim'))
        }
        totalErrors += errs.length
        slotErrors  += errs.length
      }
    }

    if (slotErrors === 0) {
      console.log(colorize(`    All ${files.length} ${slot.label.toLowerCase()}s valid`, 'green'))
    }
    console.log()
  }

  // Cross-reference integrity check
  console.log(colorize('  Cross-reference integrity', 'cyan'))
  const xrefErrors = await crossRefCheck(
    collected['models'],
    collected['essences'],
    collected['loadouts'],
    collected['agents'],
  )

  if (xrefErrors.length === 0) {
    console.log(colorize('    All cross-references valid', 'green'))
  } else {
    for (const e of xrefErrors) {
      console.log(colorize(`    ✗ ${e.file}`, 'red'))
      console.log(colorize(`        field: ${e.field}`, 'yellow'))
      console.log(`        issue: ${e.issue}`)
      if (e.hint) console.log(colorize(`        hint:  ${e.hint}`, 'dim'))
    }
    totalErrors += xrefErrors.length
  }

  console.log()

  // Summary
  if (totalErrors === 0) {
    console.log(colorize(`[IS:validate:registry] ${totalFiles} files — all valid`, 'green'))
    console.log()
    process.exit(0)
  } else {
    console.log(colorize(`[IS:validate:registry] ${totalFiles} files — ${totalErrors} error(s) found`, 'red'))
    console.log()
    process.exit(1)
  }
}

main().catch(err => {
  console.error(colorize(`[IS:validate:registry] Fatal: ${err.message}`, 'red'))
  process.exit(1)
})
