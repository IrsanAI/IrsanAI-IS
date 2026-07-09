import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { AnalysisReport } from './self-analyzer.js'

export interface RoutingWeight {
  loadout_id:            string
  confidence_threshold:  number   // override minConfidence from loadout JSON
  priority_boost:        number   // added to loadout routing.priority at runtime
  enabled:               boolean
  updated_at:            string
  reason:                string
}

export class SelfOptimizer {
  private supabase: SupabaseClient
  private table:    string

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    table = 'is_routing_weights',
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.table    = table
  }

  // ── Read current weights (called by LoadoutRouter at runtime) ─────────────

  async getWeights(): Promise<Map<string, RoutingWeight>> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select('*')

    if (error || !data) return new Map()

    return new Map(data.map((row: RoutingWeight) => [row.loadout_id, row]))
  }

  // ── Apply insights from SelfAnalyzer → write updated weights ─────────────

  async optimize(report: AnalysisReport): Promise<void> {
    if (report.routesWithFeedback < 5) {
      console.log('[IS:SelfOptimizer] Not enough feedback yet (min 5). Skipping optimization.')
      return
    }

    const updates: RoutingWeight[] = []

    for (const ins of report.loadoutInsights) {
      // Only act on loadouts with enough feedback
      if (ins.feedbackCount < 3) continue

      let confidenceThreshold = 0.7  // default from schema
      let priorityBoost       = 0
      let reason              = 'baseline'

      // Rule 1: Low correctness → raise the confidence bar
      if (ins.correctnessRate !== null && ins.correctnessRate < 0.7) {
        confidenceThreshold = Math.min(0.95, confidenceThreshold + 0.15)
        reason = `low correctness (${(ins.correctnessRate * 100).toFixed(0)}%) -- raised threshold`
      }

      // Rule 2: High correctness + good rating → reward with priority boost
      if (
        ins.correctnessRate !== null &&
        ins.correctnessRate >= 0.85 &&
        ins.avgRating !== null &&
        ins.avgRating >= 4
      ) {
        priorityBoost = 10
        reason = `high correctness (${(ins.correctnessRate * 100).toFixed(0)}%) + avg rating ${ins.avgRating?.toFixed(1)} -- priority boosted`
      }

      // Rule 3: Degrading trend → lower priority, let other loadouts compete
      if (ins.trend === 'degrading') {
        priorityBoost = Math.min(priorityBoost - 5, -5)
        reason += ' | degrading trend -- priority reduced'
      }

      updates.push({
        loadout_id:           ins.loadoutId,
        confidence_threshold: confidenceThreshold,
        priority_boost:       priorityBoost,
        enabled:              true,
        updated_at:           new Date().toISOString(),
        reason,
      })
    }

    if (updates.length === 0) {
      console.log('[IS:SelfOptimizer] No weight updates needed.')
      return
    }

    const { error } = await this.supabase
      .from(this.table)
      .upsert(updates, { onConflict: 'loadout_id' })

    if (error) {
      console.error(`[IS:SelfOptimizer] Upsert failed: ${error.message}`)
    } else {
      console.log(`[IS:SelfOptimizer] Updated weights for ${updates.length} loadouts:`)
      for (const u of updates) {
        console.log(`  ${u.loadout_id}: threshold=${u.confidence_threshold} boost=${u.priority_boost} | ${u.reason}`)
      }
    }
  }
}
