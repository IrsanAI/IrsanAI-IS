import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { RouteResult } from '../routing/loadout-router.js'

export interface TaskMetricInsert {
  task_text: string; task_type: string; loadout_id: string
  primary_llm: string; confidence: number; latency_ms: number
  success: boolean; error_msg: string | null; created_at: string
}

export class PerformanceTracker {
  private supabase: SupabaseClient

  constructor(supabaseUrl: string, supabaseKey: string, private tableName = 'is_task_metrics') {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  async track(result: RouteResult, latencyMs: number, success: boolean, errorMsg?: string): Promise<void> {
    const { error } = await this.supabase.from(this.tableName).insert({
      task_text:   result.task,
      task_type:   result.taskType,
      loadout_id:  result.loadout.id,
      primary_llm: result.primaryLlm.id,
      confidence:  result.confidence,
      latency_ms:  latencyMs,
      success,
      error_msg:   errorMsg ?? null,
      created_at:  result.routedAt,
    })
    if (error) console.error(`[IS:PerformanceTracker] Write failed: ${error.message}`)
  }

  async getSuccessRateByLoadout(): Promise<Record<string, number>> {
    const { data, error } = await this.supabase.from(this.tableName).select('loadout_id, success')
    if (error || !data) return {}
    const totals: Record<string, { total: number; success: number }> = {}
    for (const row of data) {
      const r = totals[row.loadout_id] ?? { total: 0, success: 0 }
      r.total++; if (row.success) r.success++
      totals[row.loadout_id] = r
    }
    return Object.fromEntries(Object.entries(totals).map(([id, r]) => [id, r.success / r.total]))
  }
}
