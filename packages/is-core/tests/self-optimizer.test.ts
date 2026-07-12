import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SelfOptimizer } from '../src/metacognition/self-optimizer.js'
import { SelfAnalyzer }  from '../src/metacognition/self-analyzer.js'
import type { PerformanceTracker } from '../src/metacognition/performance-tracker.js'
import {
  LOW_CORRECTNESS_10, HIGH_QUALITY_5, TREND_DEGRADING, PERFECT_10,
} from './fixtures.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

function captureUpsert() {
  const calls: any[] = []
  const mockSupabase = {
    from: () => ({
      select: () => ({ data: [], error: null }),
      upsert: (data: any) => {
        calls.push(data)
        return { error: null }
      },
    }),
  }
  return { calls, mockSupabase }
}

function makeOptimizer(mockSupabase: any) {
  const opt = new SelfOptimizer('https://example.supabase.co', 'test-key')
  ;(opt as any).supabase = mockSupabase
  return opt
}

function makeAnalyzer(rows: any[]) {
  const mockTracker = {
    getMetricsWithFeedback: vi.fn().mockResolvedValue(rows),
  } as unknown as PerformanceTracker
  return new SelfAnalyzer(mockTracker)
}

async function runOptimize(rows: any[]) {
  const { calls, mockSupabase } = captureUpsert()
  const optimizer = makeOptimizer(mockSupabase)
  const analyzer  = makeAnalyzer(rows)
  const report    = await analyzer.analyze()
  await optimizer.optimize(report)
  return { calls, report }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SelfOptimizer', () => {

  describe('gate: not enough feedback', () => {
    it('skips optimization when fewer than 5 feedback entries', async () => {
      const { calls } = await runOptimize(PERFECT_10.slice(0, 3))
      expect(calls).toHaveLength(0)
    })

    it('skips optimization when loadout has fewer than 3 feedback entries', async () => {
      const rows = PERFECT_10.slice(0, 2)
        .concat(LOW_CORRECTNESS_10.slice(0, 3))
      const { calls } = await runOptimize(rows)
      // software-engineering only has 2 feedback rows -- below threshold of 3
      expect(calls.flat().find((w: any) => w.confidence_threshold > 0.7)).toBeUndefined()
    })
  })

  describe('low correctness rule', () => {
    it('raises confidence threshold when correctness < 70%', async () => {
      const { calls } = await runOptimize(LOW_CORRECTNESS_10)
      const weights   = calls.flat()
      const sw        = weights.find((w: any) => w.loadout_id === 'software-engineering')
      expect(sw).toBeDefined()
      expect(sw.confidence_threshold).toBeGreaterThan(0.7)
    })

    it('caps confidence threshold at 0.95', async () => {
      // 0/10 correct = 0% correctness → multiple rule triggers
      const rows      = LOW_CORRECTNESS_10.map(r => ({ ...r, correct: false, rating: 1 }))
      const { calls } = await runOptimize(rows)
      const weights   = calls.flat()
      const sw        = weights.find((w: any) => w.loadout_id === 'software-engineering')
      expect(sw?.confidence_threshold).toBeLessThanOrEqual(0.95)
    })

    it('sets reason that mentions low correctness', async () => {
      const { calls } = await runOptimize(LOW_CORRECTNESS_10)
      const sw        = calls.flat().find((w: any) => w.loadout_id === 'software-engineering')
      expect(sw?.reason).toContain('low correctness')
    })
  })

  describe('high quality rule', () => {
    it('applies priority boost when correctness >= 85% and rating >= 4', async () => {
      const { calls } = await runOptimize(HIGH_QUALITY_5)
      const weights   = calls.flat()
      const rs        = weights.find((w: any) => w.loadout_id === 'research-synthesis')
      expect(rs?.priority_boost).toBeGreaterThan(0)
    })

    it('mentions priority boost in reason', async () => {
      const { calls } = await runOptimize(HIGH_QUALITY_5)
      const rs        = calls.flat().find((w: any) => w.loadout_id === 'research-synthesis')
      expect(rs?.reason).toContain('priority boosted')
    })
  })

  describe('degrading trend rule', () => {
    it('reduces priority when trend is degrading', async () => {
      const { calls } = await runOptimize(TREND_DEGRADING)
      const weights   = calls.flat()
      const sw        = weights.find((w: any) => w.loadout_id === 'software-engineering')
      expect(sw?.priority_boost).toBeLessThan(0)
    })

    it('mentions degrading trend in reason', async () => {
      const { calls } = await runOptimize(TREND_DEGRADING)
      const sw        = calls.flat().find((w: any) => w.loadout_id === 'software-engineering')
      expect(sw?.reason).toContain('degrading')
    })
  })

  describe('enabled flag', () => {
    it('always sets enabled: true on upserted weights', async () => {
      const { calls } = await runOptimize(LOW_CORRECTNESS_10)
      const weights   = calls.flat()
      expect(weights.every((w: any) => w.enabled === true)).toBe(true)
    })
  })

  describe('updated_at', () => {
    it('sets a valid ISO datetime on each weight', async () => {
      const { calls } = await runOptimize(HIGH_QUALITY_5)
      const weights   = calls.flat()
      weights.forEach((w: any) => {
        expect(() => new Date(w.updated_at)).not.toThrow()
        expect(new Date(w.updated_at).getFullYear()).toBeGreaterThanOrEqual(2025)
      })
    })
  })
})
