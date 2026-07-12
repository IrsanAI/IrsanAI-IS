/**
 * Deterministic test fixtures for SelfAnalyzer and SelfOptimizer.
 * No live LLM or Supabase calls -- all data is inline.
 */

export type MetricRow = {
  id:         string
  task_type:  string
  loadout_id: string
  confidence: number
  latency_ms: number
  success:    boolean
  correct:    boolean | null
  rating:     number  | null
}

// ── Fixture builders ──────────────────────────────────────────────────────────

export function makeRow(overrides: Partial<MetricRow> = {}): MetricRow {
  return {
    id:         crypto.randomUUID(),
    task_type:  'software-engineering',
    loadout_id: 'software-engineering',
    confidence: 0.95,
    latency_ms: 1500,
    success:    true,
    correct:    true,
    rating:     5,
    ...overrides,
  }
}

export function makeRows(
  loadoutId: string,
  count: number,
  overrides: Partial<MetricRow> = {},
): MetricRow[] {
  return Array.from({ length: count }, () => makeRow({ loadout_id: loadoutId, ...overrides }))
}

// ── Named fixture sets ────────────────────────────────────────────────────────

/** 10 perfect rows: high conf, fast, all correct, all rated 5 */
export const PERFECT_10 = makeRows('software-engineering', 10, {
  confidence: 1.0, latency_ms: 1200, correct: true, rating: 5,
})

/** 10 rows: 60% correctness (6 correct, 4 wrong) */
export const LOW_CORRECTNESS_10: MetricRow[] = [
  ...makeRows('software-engineering', 6, { correct: true,  rating: 5 }),
  ...makeRows('software-engineering', 4, { correct: false, rating: 2 }),
]

/** 10 rows: low confidence (avg 0.45) */
export const LOW_CONFIDENCE_10 = makeRows('research-synthesis', 10, {
  confidence: 0.45, correct: true, rating: 4,
})

/** 5 rows: very slow (avg 6500ms) */
export const SLOW_5 = makeRows('planning-strategy', 5, {
  latency_ms: 6500, correct: true, rating: 4,
})

/** Trend fixture: older half bad, newer half good → improving */
export const TREND_IMPROVING: MetricRow[] = [
  // newer first (DESC order -- these are the "recent" rows the analyzer sees first)
  ...makeRows('software-engineering', 5, { success: true  }),
  // older
  ...makeRows('software-engineering', 5, { success: false }),
]

/** Trend fixture: older half good, newer half bad → degrading */
export const TREND_DEGRADING: MetricRow[] = [
  // newer (first in DESC order)
  ...makeRows('software-engineering', 5, { success: false }),
  // older
  ...makeRows('software-engineering', 5, { success: true  }),
]

/** 5 rows: high correctness + high rating → eligible for priority boost */
export const HIGH_QUALITY_5 = makeRows('research-synthesis', 5, {
  confidence: 0.95, correct: true, rating: 5, latency_ms: 1200,
})
