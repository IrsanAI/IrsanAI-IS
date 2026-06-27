/**
 * @irsanai/is-core -- IrsanAI AI Inventory System Engine
 *
 * Usage:
 *   const is = new IS({ registryPath: './registry' })
 *   const result = await is.route('Fix my TypeScript error...')
 *   console.log(result.taskType, result.primaryLlm.name)
 */
import { ModelRegistry }      from './inventory/model-registry.js'
import { EssenceLibrary }     from './inventory/essence-library.js'
import { LoadoutManager }     from './inventory/loadout-manager.js'
import { TaskClassifier }     from './routing/task-classifier.js'
import { LoadoutRouter }      from './routing/loadout-router.js'
import { PerformanceTracker } from './metacognition/performance-tracker.js'
import type { RouteResult }   from './routing/loadout-router.js'

export interface ISConfig {
  registryPath?:    string   // default: ./registry
  classifierModel?: string   // default: gemini-2.5-flash
  supabaseUrl?:     string
  supabaseKey?:     string
}

export class IS {
  readonly models:   ModelRegistry
  readonly essences: EssenceLibrary
  readonly loadouts: LoadoutManager
  readonly tracker:  PerformanceTracker | null

  private router:      LoadoutRouter
  private initialized: boolean = false

  constructor(config: ISConfig = {}) {
    const registryPath = config.registryPath ?? './registry'
    this.models   = new ModelRegistry(registryPath)
    this.essences = new EssenceLibrary(registryPath)
    this.loadouts = new LoadoutManager(registryPath)

    const classifier = new TaskClassifier(config.classifierModel ?? 'gemini-2.5-flash')
    this.router = new LoadoutRouter(classifier, this.loadouts, this.models, this.essences)

    this.tracker = (config.supabaseUrl && config.supabaseKey)
      ? new PerformanceTracker(config.supabaseUrl, config.supabaseKey)
      : null
  }

  async init(): Promise<this> {
    if (this.initialized) return this
    await Promise.all([this.models.load(), this.essences.load(), this.loadouts.load()])
    this.initialized = true
    console.log('[IS] Ready.')
    return this
  }

  async route(task: string): Promise<RouteResult> {
    if (!this.initialized) await this.init()
    const start = Date.now()
    try {
      const result    = await this.router.route(task)
      const latencyMs = Date.now() - start
      await this.tracker?.track(result, latencyMs, true)
      return result
    } catch (err) {
      console.error(`[IS] Route failed in ${Date.now() - start}ms:`, err)
      throw err
    }
  }
}

export type { RouteResult }          from './routing/loadout-router.js'
export type { ClassificationResult } from './routing/task-classifier.js'
export { ModelRegistry }             from './inventory/model-registry.js'
export { EssenceLibrary }            from './inventory/essence-library.js'
export { LoadoutManager }            from './inventory/loadout-manager.js'
export { TaskClassifier }            from './routing/task-classifier.js'
export { LoadoutRouter }             from './routing/loadout-router.js'
export { PerformanceTracker }        from './metacognition/performance-tracker.js'

export const IS_VERSION = '0.2.0' as const
export const IS_NAME    = 'IrsanAI IS' as const
