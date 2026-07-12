import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SelfAnalyzer } from '../src/metacognition/self-analyzer.js'
import type { PerformanceTracker } from '../src/metacognition/performance-tracker.js'
import {
  PERFECT_10, LOW_CORRECTNESS_10, LOW_CONFIDENCE_10,
  SLOW_5, TREND_IMPROVING, TREND_DEGRADING,
} from './fixtures.js'

// ── Mock PerformanceTracker ───────────────────────────────────────────────────

function makeAnalyzer(rows: ReturnType<typeof import('./fixtures.js').makeRow>[]) {
  const mockTracker = {
    getMetricsWithFeedback: vi.fn().mockResolvedValue(rows),
  } as unknown as PerformanceTracker

  return new SelfAnalyzer(mockTracker)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SelfAnalyzer', () => {

  describe('empty data', () => {
    it('returns no-data report when metrics are empty', async () => {
      const report = await makeAnalyzer([]).analyze()
      expect(report.totalRoutes).toBe(0)
      expect(report.loadoutInsights).toHaveLength(0)
      expect(report.topIssues[0]).toContain('No data yet')
    })
  })

  describe('perfect data', () => {
    it('reports 100% correctness and no issues', async () => {
      const report = await makeAnalyzer(PERFECT_10).analyze()
      const ins    = report.loadoutInsights[0]!

      expect(ins.sampleSize).toBe(10)
      expect(ins.correctnessRate).toBe(1.0)
      expect(ins.avgRating).toBe(5)
      expect(report.topIssues).toContain('No issues detected.')
    })

    it('detects stable trend with 10+ samples', async () => {
      const report = await makeAnalyzer(PERFECT_10).analyze()
      expect(report.loadoutInsights[0]!.trend).toBe('stable')
    })
  })

  describe('low correctness', () => {
    it('raises an issue when correctness < 70%', async () => {
      const report = await makeAnalyzer(LOW_CORRECTNESS_10).analyze()
      const hasIssue = report.topIssues.some(i => i.includes('low correctness rate'))
      expect(hasIssue).toBe(true)
    })

    it('recommends raising minConfidence threshold', async () => {
      const report = await makeAnalyzer(LOW_CORRECTNESS_10).analyze()
      const hasRec = report.recommendations.some(r => r.includes('minConfidence'))
      expect(hasRec).toBe(true)
    })

    it('calculates correctness rate correctly (6/10 = 60%)', async () => {
      const report = await makeAnalyzer(LOW_CORRECTNESS_10).analyze()
      const ins    = report.loadoutInsights[0]!
      expect(ins.correctnessRate).toBeCloseTo(0.6)
    })
  })

  describe('low confidence', () => {
    it('raises an issue when avg confidence < 60%', async () => {
      const report = await makeAnalyzer(LOW_CONFIDENCE_10).analyze()
      const hasIssue = report.topIssues.some(i => i.includes('low average confidence'))
      expect(hasIssue).toBe(true)
    })
  })

  describe('high latency', () => {
    it('raises an issue when avg latency > 5000ms', async () => {
      const report = await makeAnalyzer(SLOW_5).analyze()
      const hasIssue = report.topIssues.some(i => i.includes('slow'))
      expect(hasIssue).toBe(true)
    })
  })

  describe('trend detection', () => {
    it('detects improving trend', async () => {
      const report = await makeAnalyzer(TREND_IMPROVING).analyze()
      expect(report.loadoutInsights[0]!.trend).toBe('improving')
    })

    it('detects degrading trend', async () => {
      const report = await makeAnalyzer(TREND_DEGRADING).analyze()
      expect(report.loadoutInsights[0]!.trend).toBe('degrading')
    })

    it('raises degrading issue', async () => {
      const report = await makeAnalyzer(TREND_DEGRADING).analyze()
      const hasIssue = report.topIssues.some(i => i.includes('degrading'))
      expect(hasIssue).toBe(true)
    })

    it('returns no-data when fewer than 3 samples per half', async () => {
      const report = await makeAnalyzer(PERFECT_10.slice(0, 4)).analyze()
      expect(report.loadoutInsights[0]!.trend).toBe('no-data')
    })
  })

  describe('feedback summary', () => {
    it('reports routesWithFeedback correctly', async () => {
      const report = await makeAnalyzer(PERFECT_10).analyze()
      expect(report.routesWithFeedback).toBe(10)
      expect(report.totalRoutes).toBe(10)
    })

    it('handles null correct/rating (no feedback yet)', async () => {
      const rows   = PERFECT_10.map(r => ({ ...r, correct: null, rating: null }))
      const report = await makeAnalyzer(rows).analyze()
      expect(report.loadoutInsights[0]!.correctnessRate).toBeNull()
      expect(report.loadoutInsights[0]!.avgRating).toBeNull()
      expect(report.routesWithFeedback).toBe(0)
    })
  })
})
