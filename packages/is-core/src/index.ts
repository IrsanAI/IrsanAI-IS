/**
 * @irsanai/is-core -- IrsanAI AI Inventory System Engine v0.3.0
 *
 * Usage:
 *   const is = new IS({ registryPath: './registry', supabaseUrl, supabaseKey })
 *   const { result, routeId } = await is.route('Fix my TypeScript error...')
 *   await is.feedback(routeId, { correct: true, rating: 5 })
 *   const report = await is.analyze()
 */
import { ModelRegistry }      from './inventory/model-registry.js'
import { EssenceLibrary }     from './inventory/essence-library.js'
import { LoadoutManager }     from './inventory/loadout-manager.js'
import { TaskClassifier }     from './routing/task-classifier.js'
import { LoadoutRouter }      from './routing/loadout-router.js'
import { PerformanceTracker } from './metacognition/performance-tracker.js'
import { SelfAnalyzer }       from './metacognition/self-analyzer.js'
import { SelfOptimizer }      from './metacognition/self-optimizer.js'
import type { RouteResult }   from './routing/loadout-router.js'
import type { AnalysisReport } from './metacognition/self-analyzer.js'

export interface ISConfig {
  registryPath?:    string
  classifierModel?: string
  supabaseUrl?:     string
  supabaseKey?:     string
}

export interface RouteResponse {
  result:   RouteResult
  routeId:  string | null   // Supabase row ID -- pass to feedback()
}

export class IS {
  readonly models:    ModelRegistry
  readonly essences:  EssenceLibrary
  readonly loadouts:  LoadoutManager
  readonly tracker:   PerformanceTracker | null
  readonly analyzer:  SelfAnalyzer | null
  readonly optimizer: SelfOptimizer | null

  private router:      LoadoutRouter
  private initialized: boolean = false

  constructor(config: ISConfig = {}) {
    const registryPath = config.registryPath ?? './registry'

    this.models   = new ModelRegistry(registryPath)
    this.essences = new EssenceLibrary(registryPath)
    this.loadouts = new LoadoutManager(registryPath)

    const classifier = new TaskClassifier(config.classifierModel ?? 'gemini-2.5-flash')

    if (config.supabaseUrl && config.supabaseKey) {
      this.tracker   = new PerformanceTracker(config.supabaseUrl, config.supabaseKey)
      this.analyzer  = new SelfAnalyzer(this.tracker)
      this.optimizer = new SelfOptimizer(config.supabaseUrl, config.supabaseKey)
    } else {
      this.tracker   = null
      this.analyzer  = null
      this.optimizer = null
    }

    this.router = new LoadoutRouter(
      classifier,
      this.loadouts,
      this.models,
      this.essences,
      this.optimizer ?? undefined,
    )
  }

  async init(): Promise<this> {
    if (this.initialized) return this
    await Promise.all([this.models.load(), this.essences.load(), this.loadouts.load()])
    this.initialized = true
    console.log('[IS] Ready.')
    return this
  }

  // ── Core: Route ───────────────────────────────────────────────────────────

  async route(task: string): Promise<RouteResponse> {
    if (!this.initialized) await this.init()

    const start = Date.now()

    try {
      const result    = await this.router.route(task)
      const latencyMs = Date.now() - start
      const routeId   = await this.tracker?.track(result, latencyMs, true) ?? null

      return { result, routeId }
    } catch (err) {
      console.error(`[IS] Route failed in ${Date.now() - start}ms:`, err)
      throw err
    }
  }

  // ── Metacognition: Feedback ───────────────────────────────────────────────

  async feedback(
    routeId: string | null,
    input: { correct: boolean; rating: 1 | 2 | 3 | 4 | 5; notes?: string }
  ): Promise<void> {
    if (!this.tracker) {
      console.warn('[IS] Feedback skipped -- Supabase not configured.')
      return
    }
    if (!routeId) {
      console.warn('[IS] Feedback skipped -- routeId is null (tracking was off).')
      return
    }
    await this.tracker.feedback(routeId, input)
  }

  // ── Metacognition: Analyze (Observe + Orient) ─────────────────────────────

  async analyze(): Promise<AnalysisReport> {
    if (!this.analyzer) {
      return {
        generatedAt: new Date().toISOString(),
        totalRoutes: 0, routesWithFeedback: 0,
        loadoutInsights: [], topIssues: ['Supabase not configured.'],
        recommendations: ['Add SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to .env.'],
      }
    }
    return this.analyzer.analyze()
  }

  // ── Metacognition: Optimize (Decide + Act) ────────────────────────────────

  async optimize(): Promise<void> {
    if (!this.optimizer || !this.analyzer) {
      console.warn('[IS] Optimize skipped -- Supabase not configured.')
      return
    }
    const report = await this.analyzer.analyze()
    await this.optimizer.optimize(report)
  }
}

// ── Re-exports ────────────────────────────────────────────────────────────────
export type { RouteResult }          from './routing/loadout-router.js'
export type { ClassificationResult } from './routing/task-classifier.js'
export type { AnalysisReport }       from './metacognition/self-analyzer.js'
export type { RoutingWeight }        from './metacognition/self-optimizer.js'
export { ModelRegistry }             from './inventory/model-registry.js'
export { EssenceLibrary }            from './inventory/essence-library.js'
export { LoadoutManager }            from './inventory/loadout-manager.js'
export { TaskClassifier }            from './routing/task-classifier.js'
export { LoadoutRouter }             from './routing/loadout-router.js'
export { PerformanceTracker }        from './metacognition/performance-tracker.js'
export { SelfAnalyzer }              from './metacognition/self-analyzer.js'
export { SelfOptimizer }             from './metacognition/self-optimizer.js'

export const IS_VERSION = '0.3.0' as const
export const IS_NAME    = 'IrsanAI IS' as const
