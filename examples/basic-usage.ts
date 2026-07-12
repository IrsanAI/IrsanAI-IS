/**
 * IrsanAI IS -- Basic Usage (Supabase active)
 * Run: pnpm example
 */
import { IS } from '../packages/is-core/src/index.js'

const is = new IS({
  registryPath:    './registry',
  classifierModel: 'gemini-2.5-flash',
  supabaseUrl:     process.env.SUPABASE_URL,
  supabaseKey:     process.env.SUPABASE_SERVICE_ROLE_KEY,
})

console.log('\n[IS] Routing task...\n')

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
console.log('Route ID:   ', routeId ?? '(tracking off)')
console.log('====================================================\n')

if (routeId) {
  await is.feedback(routeId, { correct: true, rating: 5,
    notes: 'TypeScript/Zod task correctly routed to software-engineering' })
  console.log('[IS] Feedback saved.\n')
}

const report = await is.analyze()
console.log('=== IS Analysis =====================================')
console.log('Total routes:        ', report.totalRoutes)
console.log('With feedback:       ', report.routesWithFeedback)
for (const ins of report.loadoutInsights) {
  console.log(`\n  [${ins.loadoutId}]`)
  console.log(`    Samples:     ${ins.sampleSize}`)
  console.log(`    Confidence:  ${(ins.avgConfidence * 100).toFixed(0)}%`)
  console.log(`    Latency:     ${Math.round(ins.avgLatencyMs)}ms`)
  console.log(`    Correctness: ${ins.correctnessRate !== null ? (ins.correctnessRate*100).toFixed(0)+'%' : 'no feedback yet'}`)
  console.log(`    Avg rating:  ${ins.avgRating?.toFixed(1) ?? 'n/a'}`)
  console.log(`    Trend:       ${ins.trend}`)
}
console.log('\nIssues:')
report.topIssues.forEach(i => console.log(' !', i))
console.log('Recommendations:')
report.recommendations.forEach(r => console.log(' >', r))
console.log('====================================================\n')
