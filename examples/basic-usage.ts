/**
 * IrsanAI IS -- Basic Usage Example (Phase 2b: Metacognitive Feedback)
 *
 * Prerequisites:
 *   1. Get free API key at aistudio.google.com
 *   2. .env:  GOOGLE_GENERATIVE_AI_API_KEY=AQ...
 *   3. .env:  SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (optional but recommended)
 *   4. Run:   pnpm example
 */

import { IS } from '../packages/is-core/src/index.js'

const is = new IS({
  registryPath:    './registry',
  classifierModel: 'gemini-2.5-flash',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
})

console.log('\n[IS] Routing task...\n')

// ── 1. Route ──────────────────────────────────────────────────────────────────
const { result, routeId } = await is.route(
  'Debug this TypeScript error: Type string is not assignable to type number in my Zod schema.'
)

console.log('=== IS Route Result ==================================')
console.log('Task type:  ', result.taskType)
console.log('Confidence: ', (result.confidence * 100).toFixed(0) + '%')
console.log('Reasoning:  ', result.reasoning)
console.log('Loadout:    ', result.loadout.name)
console.log('Primary LLM:', result.primaryLlm.name)
console.log('Essences:   ', result.activeEssences.map(e => e.name).join(', '))
console.log('Route ID:   ', routeId ?? '(no Supabase -- tracking off)')
console.log('====================================================\n')

// ── 2. Feedback (manual ground truth) ────────────────────────────────────────
// Was the IS correct? Did it pick the right loadout? Rate the response quality.
if (routeId) {
  await is.feedback(routeId, {
    correct: true,   // yes, software-engineering was the right call
    rating:  5,      // excellent routing
    notes:   'TypeScript/Zod task correctly routed to software-engineering loadout'
  })
  console.log('[IS] Feedback submitted.\n')
}

// ── 3. Analyze (Observe + Orient) ────────────────────────────────────────────
const report = await is.analyze()
console.log('=== IS Analysis Report ==============================')
console.log('Total routes:         ', report.totalRoutes)
console.log('Routes with feedback: ', report.routesWithFeedback)
for (const ins of report.loadoutInsights) {
  console.log(`\n  Loadout: ${ins.loadoutId}`)
  console.log(`    Samples:      ${ins.sampleSize}`)
  console.log(`    Avg confidence: ${(ins.avgConfidence * 100).toFixed(0)}%`)
  console.log(`    Avg latency:  ${Math.round(ins.avgLatencyMs)}ms`)
  console.log(`    Correctness:  ${ins.correctnessRate !== null ? (ins.correctnessRate * 100).toFixed(0) + '%' : 'no feedback yet'}`)
  console.log(`    Avg rating:   ${ins.avgRating?.toFixed(1) ?? 'n/a'}`)
  console.log(`    Trend:        ${ins.trend}`)
}
console.log('\nTop issues:')
for (const issue of report.topIssues) console.log(' !', issue)
console.log('\nRecommendations:')
for (const rec of report.recommendations) console.log(' >', rec)
console.log('====================================================\n')

// ── 4. Optimize (Decide + Act) -- only when enough feedback exists ────────────
// await is.optimize()
// Uncomment after collecting 5+ feedback entries.
