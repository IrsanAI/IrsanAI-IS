import { type Loadout, type Model, type Essence } from '@irsanai/schemas'
import { TaskClassifier, type ClassificationResult } from './task-classifier.js'
import { LoadoutManager }  from '../inventory/loadout-manager.js'
import { ModelRegistry }   from '../inventory/model-registry.js'
import { EssenceLibrary }  from '../inventory/essence-library.js'

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
  ) {}

  async route(task: string): Promise<RouteResult> {
    const availableIds   = this.loadoutManager.getIds()
    const classification = await this.classifier.classify(task, availableIds)

    const loadout =
      (classification.suggestedLoadoutId
        ? this.loadoutManager.getById(classification.suggestedLoadoutId)
        : undefined) ??
      this.loadoutManager.findForTaskType(classification.taskType) ??
      this.loadoutManager.getDefault()

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
}
