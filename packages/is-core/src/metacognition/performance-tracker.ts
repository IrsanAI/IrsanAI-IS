import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { RouteResult } from '../routing/loadout-router.js'

export interface TaskMetricInsert {
  task_text:   string
  task_type:   string
  loadout_id:  string
  primary_llm: string
  confidence:  number
  latency_ms:  number
  success:     boolean
  error_msg:   string | null
  created_at:  string
}

export interface FeedbackInsert {
  route_id:    string   // uuid of the is_task_metrics row
  correct:     boolean  // was the loadout selection correct?
  rating:      number   // 1-5 quality rating
  notes:       string | null
  created_at:  string
}

export class PerformanceTracker {
  private supabase:        SupabaseClient
  private metricsTable:    string
  private feedbackTable:   string

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    metricsTable  = 'is_task_metrics',
    feedbackTable = 'is_feedback',
  ) {
    this.supabase      = createClient(supabaseUrl, supabaseKey)
    this.metricsTable  = metricsTable
    this.feedbackTable = feedbackTable
  }

  // ── Track a route call ────────────────────────────────────────────────────

  async track(
    result:    RouteResult,
    latencyMs: number,
    success:   boolean,
    errorMsg?: string,
  ): Promise<string | null> {
    const { data, error } = await this.supabase
      .from(this.metricsTable)
      .insert({
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
      .select('id')
      .single()

    if (error) {
      console.error(`[IS:PerformanceTracker] Write failed: ${error.message}`)
      return null
    }

    return data?.id ?? null
  }

  // ── Feedback: manual ground truth signal ──────────────────────────────────

  async feedback(
    routeId: string,
    input: {
      correct: boolean
      rating:  1 | 2 | 3 | 4 | 5
      notes?:  string
    }
  ): Promise<void> {
    const { error } = await this.supabase
      .from(this.feedbackTable)
      .insert({
        route_id:   routeId,
        correct:    input.correct,
        rating:     input.rating,
        notes:      input.notes ?? null,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error(`[IS:PerformanceTracker] Feedback write failed: ${error.message}`)
    } else {
      console.log(`[IS:PerformanceTracker] Feedback saved for route ${routeId}`)
    }
  }

  // ── Raw analytics (input for SelfAnalyzer) ────────────────────────────────

  async getMetricsWithFeedback(): Promise<Array<{
    id:         string
    task_type:  string
    loadout_id: string
    confidence: number
    latency_ms: number
    success:    boolean
    correct:    boolean | null
    rating:     number  | null
  }>> {
    const { data, error } = await this.supabase
      .from(this.metricsTable)
      .select(`
        id, task_type, loadout_id, confidence, latency_ms, success,
        ${this.feedbackTable}(correct, rating)
      `)
      .order('created_at', { ascending: false })
      .limit(500)

    if (error || !data) return []

    return data.map((row: any) => ({
      id:         row.id,
      task_type:  row.task_type,
      loadout_id: row.loadout_id,
      confidence: row.confidence,
      latency_ms: row.latency_ms,
      success:    row.success,
      correct:    row[this.feedbackTable]?.[0]?.correct ?? null,
      rating:     row[this.feedbackTable]?.[0]?.rating  ?? null,
    }))
  }
}
