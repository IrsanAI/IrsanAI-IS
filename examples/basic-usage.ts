/**
 * IrsanAI IS -- Basic Usage Example (Google Gemini Free Tier)
 *
 * Prerequisites:
 *   1. Get free API key at aistudio.google.com (no credit card needed)
 *   2. Add to .env:  GOOGLE_GENERATIVE_AI_API_KEY=AQ...
 *   3. Run: pnpm build && npx tsx examples/basic-usage.ts
 */

import { IS } from '../packages/is-core/src/index.js'

const is = new IS({
  registryPath:    './registry',
  classifierModel: 'gemini-2.5-flash',  // Free tier -- no credit card
})

console.log('\n[IS] Routing task...\n')

const result = await is.route(
  'Debug this TypeScript error: Type string is not assignable to type number in my Zod schema.'
)

console.log('=== IS Route Result ==================================')
console.log('Task type:  ', result.taskType)
console.log('Confidence: ', (result.confidence * 100).toFixed(0) + '%')
console.log('Reasoning:  ', result.reasoning)
console.log('Loadout:    ', result.loadout.name)
console.log('Primary LLM:', result.primaryLlm.name)
console.log('Off-hand:   ', result.offHandLlm?.name ?? 'none')
console.log('Essences:   ', result.activeEssences.map(e => e.name).join(', '))
console.log('Routed at:  ', result.routedAt)
console.log('====================================================\n')
