/**
 * IrsanAI IS -- Benchmark Suite v2
 * Run: pnpm benchmark
 */
import { IS } from '../packages/is-core/src/index.js'

const is = new IS({
  registryPath:    './registry',
  classifierModel: 'gemini-2.5-flash',
  supabaseUrl:     process.env.SUPABASE_URL,
  supabaseKey:     process.env.SUPABASE_SERVICE_ROLE_KEY,
})

await is.init()

const TASKS = [
  {
    label:        'TypeScript debugging',
    task:         'Fix this TypeScript error: Property does not exist on type Record<string, unknown>',
    expectedType: 'software-engineering',
  },
  {
    label:        'Python refactoring',
    task:         'Refactor this Python class to use dataclasses and add type hints throughout',
    expectedType: 'software-engineering',
  },
  {
    label:        'Research synthesis',
    task:         'Summarize and compare the latest research papers on LLM reasoning benchmarks from 2025',
    expectedType: 'research-synthesis',
  },
  {
    label:        'Data analysis',
    task:         'Analyze this CSV dataset and identify statistical outliers and trends',
    expectedType: 'data-analysis',
  },
  {
  label:        'DevOps automation',
  task:         'Create a strategic CI/CD deployment pipeline plan: environments, rollback strategy, approval gates, monitoring thresholds',
  expectedType: 'planning-strategy',  // <- auch expectedType anpassen
  },
  {
  label:        'Architecture planning',
  task:         'Evaluate microservices vs monolith tradeoffs for our SaaS product and recommend an architecture with justification',
  expectedType: 'planning-strategy',
  },
]

const GREEN = '\x1b[32m'
const RED   = '\x1b[31m'
const RESET = '\x1b[0m'

console.log('\n[IS:benchmark] v2 -- 3 loadouts, 6 tasks\n')

const results: Array<{
  label:      string
  taskType:   string
  loadoutId:  string
  confidence: number
  latencyMs:  number
  correct:    boolean
  routeId:    string | null
}> = []

for (const t of TASKS) {
  process.stdout.write('  Testing: ' + t.label + '... ')
  const start = Date.now()

  try {
    const { result, routeId } = await is.route(t.task)
    const latencyMs = Date.now() - start
    const correct   = result.taskType === t.expectedType

    if (correct) {
      process.stdout.write(GREEN + result.taskType + ' (' + (result.confidence * 100).toFixed(0) + '%) ' + latencyMs + 'ms' + RESET + '\n')
    } else {
      process.stdout.write(RED + 'GOT ' + result.taskType + ', EXPECTED ' + t.expectedType + RESET + '\n')
    }

    results.push({ label: t.label, taskType: result.taskType, loadoutId: result.loadout.id,
      confidence: result.confidence, latencyMs, correct, routeId })

    if (routeId) {
      await is.feedback(routeId, {
        correct,
        rating: correct ? (result.confidence >= 0.9 ? 5 : 4) : 2,
        notes: 'Benchmark v2: expected ' + t.expectedType + ', got ' + result.taskType,
      })
    }
  } catch (err) {
    process.stdout.write(RED + 'ERROR: ' + (err as Error).message + RESET + '\n')
    results.push({ label: t.label, taskType: 'error', loadoutId: 'none',
      confidence: 0, latencyMs: Date.now() - start, correct: false, routeId: null })
  }

  await new Promise(r => setTimeout(r, 800))
}

const correct    = results.filter(r => r.correct).length
const total      = results.length
const accuracy   = (correct / total * 100).toFixed(0)
const avgLatency = Math.round(results.reduce((s, r) => s + r.latencyMs, 0) / total)
const avgConf    = (results.reduce((s, r) => s + r.confidence, 0) / total * 100).toFixed(0)

console.log('\n=== Benchmark Results ================================')
console.log('  Accuracy:       ' + correct + '/' + total + ' (' + accuracy + '%)')
console.log('  Avg confidence: ' + avgConf + '%')
console.log('  Avg latency:    ' + avgLatency + 'ms')
console.log('')
for (const r of results) {
  const icon = r.correct ? GREEN + '\u2713' + RESET : RED + '\u2717' + RESET
  console.log('  ' + icon + ' ' + r.label.padEnd(28) + ' ' + r.taskType.padEnd(26) + ' ' + (r.confidence * 100).toFixed(0).padStart(3) + '%  ' + r.latencyMs + 'ms')
}
console.log('====================================================\n')

console.log('[IS:benchmark] Running SelfAnalyzer...\n')
const report = await is.analyze()

console.log('=== IS Analysis Report ==============================')
console.log('  Total routes:         ' + report.totalRoutes)
console.log('  Routes with feedback: ' + report.routesWithFeedback)
for (const ins of report.loadoutInsights) {
  const cr = ins.correctnessRate !== null ? (ins.correctnessRate * 100).toFixed(0) + '%' : 'no feedback'
  console.log('\n  [' + ins.loadoutId + ']')
  console.log('    Samples: ' + ins.sampleSize + ' | Feedback: ' + ins.feedbackCount + ' | Conf: ' + (ins.avgConfidence * 100).toFixed(0) + '% | Latency: ' + Math.round(ins.avgLatencyMs) + 'ms')
  console.log('    Correctness: ' + cr + ' | Rating: ' + (ins.avgRating?.toFixed(1) ?? 'n/a') + ' | Trend: ' + ins.trend)
}
if (report.topIssues[0] !== 'No issues detected.') {
  console.log('\n  Issues:')
  report.topIssues.forEach(i => console.log('    ! ' + i))
}
if (report.recommendations.length > 0) {
  console.log('\n  Recommendations:')
  report.recommendations.forEach(r => console.log('    > ' + r))
}
console.log('====================================================\n')

if (report.routesWithFeedback >= 5) {
  console.log('[IS:benchmark] Running SelfOptimizer...\n')
  await is.optimize()
  console.log('')
}

const date = new Date().toISOString().split('T')[0]
console.log('=== BENCHMARK_LOG entry =============================')
console.log('## ' + date + ' -- Benchmark v2 (' + total + ' tasks, 3 loadouts)')
console.log('- Classifier: gemini-2.5-flash')
console.log('- Accuracy: ' + accuracy + '% | Avg latency: ' + avgLatency + 'ms | Avg conf: ' + avgConf + '%')
for (const r of results) {
  console.log('- ' + (r.correct ? '[OK]' : '[FAIL]') + ' ' + r.label + ': ' + r.taskType + ' (' + (r.confidence * 100).toFixed(0) + '% conf, ' + r.latencyMs + 'ms)')
}
console.log('====================================================\n')
