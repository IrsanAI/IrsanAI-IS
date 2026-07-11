import { type Loadout, type Model, type Essence } from '@irsanai/schemas'
import { TaskClassifier, type ClassificationResult } from './task-classifier.js'
import { LoadoutManager }  from '../inventory/loadout-manager.js'
import { ModelRegistry }   from '../inventory/model-registry.js'
import { EssenceLibrary }  from '../inventory/essence-library.js'

export interface RoutingWeight {
  loadout_id:            string
  confidence_threshold:  number
  priority_boost:        number
  enabled:               boolean
  reason:                string | null
  updated_at:            string
}

export interface RoutingWeightSource {
  getWeights(): Promise<Map<string, RoutingWeight>>
}

export interface RouteResult {
  task:           string
  taskType:       string
  confidence:     number
  reasoning:      string
  loadout:        Loadout
  primaryLlm:     Model
  offHandLlm:     Model | undefined
  activeEssences: Essence[]
  classification: ClassificationResult
  routedAt:       string
}

export class LoadoutRouter {
  constructor(
    private classifier:     TaskClassifier,
    private loadoutManager: LoadoutManager,
    private modelRegistry:  ModelRegistry,
    private essenceLibrary: EssenceLibrary,
    private weightSource?:   RoutingWeightSource,
  ) {}

  async route(task: string): Promise<RouteResult> {
    const weights        = await this.getWeights()
    const enabledLoadouts = this.getEnabledLoadouts(weights)
    const availableIds   = enabledLoadouts.map(loadout => loadout.id)
    const classification = await this.classifier.classify(task, availableIds)

    const loadout = this.selectLoadout(classification, enabledLoadouts, weights)

    if (!loadout) throw new Error(
      `[IS:LoadoutRouter] No loadout found for taskType "${classification.taskType}"`
    )

    const primaryLlm = this.modelRegistry.getById(loadout.primaryLlmId)
    if (!primaryLlm) throw new Error(
      `[IS:LoadoutRouter] Primary LLM "${loadout.primaryLlmId}" not found in registry`
    )

    return {
      task,
      taskType:       classification.taskType,
      confidence:     classification.confidence,
      reasoning:      classification.reasoning,
      loadout,
      primaryLlm,
      offHandLlm:     loadout.offHandLlmId
                        ? this.modelRegistry.getById(loadout.offHandLlmId)
                        : undefined,
      activeEssences: this.essenceLibrary.getByIds(loadout.activeEssenceIds),
      classification,
      routedAt:       new Date().toISOString(),
    }
  }

  private async getWeights(): Promise<Map<string, RoutingWeight>> {
    if (!this.weightSource) return new Map()

    try {
      return await this.weightSource.getWeights()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.warn(`[IS:LoadoutRouter] Routing weights unavailable: ${message}`)
      return new Map()
    }
  }

  private getEnabledLoadouts(weights: Map<string, RoutingWeight>): Loadout[] {
    const enabled = this.loadoutManager
      .getAll()
      .filter(loadout => weights.get(loadout.id)?.enabled ?? true)

    if (enabled.length > 0) return enabled

    console.warn('[IS:LoadoutRouter] All loadouts disabled by routing weights; falling back to registry loadouts.')
    return this.loadoutManager.getAll()
  }

  private selectLoadout(
    classification: ClassificationResult,
    loadouts:       Loadout[],
    weights:        Map<string, RoutingWeight>,
  ): Loadout | undefined {
    const suggested = classification.suggestedLoadoutId
      ? loadouts.find(loadout => loadout.id === classification.suggestedLoadoutId)
      : undefined

    const candidates = loadouts.filter(loadout =>
      loadout.taskTypes.includes(classification.taskType) &&
      this.meetsConfidenceThreshold(loadout, classification.confidence, weights)
    )

    if (
      suggested &&
      this.meetsConfidenceThreshold(suggested, classification.confidence, weights) &&
      !candidates.some(loadout => loadout.id === suggested.id)
    ) {
      candidates.push(suggested)
    }

    return candidates.sort((a, b) =>
      this.effectivePriority(b, weights) - this.effectivePriority(a, weights)
    )[0] ??
      (suggested && (weights.get(suggested.id)?.enabled ?? true) ? suggested : undefined) ??
      loadouts.find(loadout => loadout.isDefault) ??
      loadouts[0]
  }

  private meetsConfidenceThreshold(
    loadout:    Loadout,
    confidence: number,
    weights:    Map<string, RoutingWeight>,
  ): boolean {
    const threshold = weights.get(loadout.id)?.confidence_threshold ?? loadout.routing.minConfidence
    return confidence >= threshold
  }

  private effectivePriority(loadout: Loadout, weights: Map<string, RoutingWeight>): number {
    return loadout.routing.priority + (weights.get(loadout.id)?.priority_boost ?? 0)
  }
}
