import type { PerformanceTracker } from './performance-tracker.js'

export interface LoadoutInsight {
  loadoutId:        string
  sampleSize:       number
  feedbackCount:    number
  avgConfidence:    number
  avgLatencyMs:     number
  successRate:      number
  correctnessRate:  number | null   // null = no feedback yet
  avgRating:        number | null
  trend:            'improving' | 'degrading' | 'stable' | 'no-data'
}

export interface AnalysisReport {
  generatedAt:       string
  totalRoutes:       number
  routesWithFeedback: number
  loadoutInsights:   LoadoutInsight[]
  topIssues:         string[]
  recommendations:   string[]
}

export class SelfAnalyzer {
  constructor(private tracker: PerformanceTracker) {}

  async analyze(): Promise<AnalysisReport> {
    const rows = await this.tracker.getMetricsWithFeedback()

    if (rows.length === 0) {
      return {
        generatedAt:        new Date().toISOString(),
        totalRoutes:        0,
        routesWithFeedback: 0,
        loadoutInsights:    [],
        topIssues:          ['No data yet. Run is.route() a few times to collect metrics.'],
        recommendations:    ['Add SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to .env to enable tracking.'],
      }
    }

    // Group by loadout
    const byLoadout = new Map<string, typeof rows>()
    for (const row of rows) {
      const group = byLoadout.get(row.loadout_id) ?? []
      group.push(row)
      byLoadout.set(row.loadout_id, group)
    }

    const insights: LoadoutInsight[] = []

    for (const [loadoutId, group] of byLoadout) {
      const withFeedback = group.filter(r => r.correct !== null)
      const correctOnes  = withFeedback.filter(r => r.correct === true)
      const ratings      = withFeedback.map(r => r.rating).filter((r): r is number => r !== null)

      // Trend: compare first half vs second half success rate
      const half    = Math.floor(group.length / 2)
      const first   = group.slice(half)   // older (farther back in DESC order)
      const second  = group.slice(0, half) // newer
      const trend   = this.calcTrend(first, second)

      insights.push({
        loadoutId,
        sampleSize:      group.length,
        feedbackCount:   withFeedback.length,
        avgConfidence:   avg(group.map(r => r.confidence)),
        avgLatencyMs:    avg(group.map(r => r.latency_ms)),
        successRate:     group.filter(r => r.success).length / group.length,
        correctnessRate: withFeedback.length > 0
          ? correctOnes.length / withFeedback.length
          : null,
        avgRating: ratings.length > 0 ? avg(ratings) : null,
        trend,
      })
    }

    const issues:  string[] = []
    const recs:    string[] = []
    const routesWithFeedback = rows.filter(r => r.correct !== null).length

    // Rule-based issue detection
    for (const ins of insights) {
      if (ins.correctnessRate !== null && ins.correctnessRate < 0.7) {
        issues.push(`Loadout "${ins.loadoutId}" has low correctness rate: ${pct(ins.correctnessRate)}`)
        recs.push(`Increase minConfidence threshold for "${ins.loadoutId}" in loadout routing config`)
      }
      if (ins.avgConfidence < 0.6) {
        issues.push(`Loadout "${ins.loadoutId}" shows low average confidence: ${pct(ins.avgConfidence)}`)
        recs.push(`Review trigger keywords for "${ins.loadoutId}" -- they may overlap with another loadout`)
      }
      if (ins.avgLatencyMs > 5000) {
        issues.push(`Loadout "${ins.loadoutId}" is slow: avg ${Math.round(ins.avgLatencyMs)}ms`)
        recs.push(`Consider switching "${ins.loadoutId}" classifier to gemini-2.5-flash for faster routing`)
      }
      if (ins.trend === 'degrading') {
        issues.push(`Loadout "${ins.loadoutId}" is degrading over recent calls`)
        recs.push(`Inspect recent failures for "${ins.loadoutId}" -- may need new essences`)
      }
    }

    if (routesWithFeedback < 10) {
      recs.push(`Collect more feedback (${routesWithFeedback}/10 minimum) before trusting recommendations`)
    }
    if (issues.length === 0) {
      issues.push('No issues detected.')
    }

    return {
      generatedAt:        new Date().toISOString(),
      totalRoutes:        rows.length,
      routesWithFeedback,
      loadoutInsights:    insights.sort((a, b) => b.sampleSize - a.sampleSize),
      topIssues:          issues,
      recommendations:    recs,
    }
  }

  private calcTrend(
    older: Array<{ success: boolean }>,
    newer: Array<{ success: boolean }>,
  ): LoadoutInsight['trend'] {
    if (older.length < 3 || newer.length < 3) return 'no-data'
    const oldRate = older.filter(r => r.success).length / older.length
    const newRate = newer.filter(r => r.success).length / newer.length
    const delta   = newRate - oldRate
    if (delta >  0.1) return 'improving'
    if (delta < -0.1) return 'degrading'
    return 'stable'
  }
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function pct(n: number): string {
  return (n * 100).toFixed(0) + '%'
}
