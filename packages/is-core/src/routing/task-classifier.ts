import { generateObject } from 'ai'
import { google }         from '@ai-sdk/google'
import { z }              from 'zod'
import { TaskTypeSchema, type TaskType } from '@irsanai/schemas'

export interface ClassificationResult {
  taskType:           TaskType
  confidence:         number
  reasoning:          string
  suggestedLoadoutId: string | null
}

const ClassificationSchema = z.object({
  taskType: TaskTypeSchema
    .describe('The primary task category'),
  confidence: z.number().min(0).max(1)
    .describe('Confidence in classification (0.0 - 1.0)'),
  reasoning: z.string()
    .describe('One sentence explaining the classification decision'),
  suggestedLoadoutId: z.string().nullable()
    .describe('Best matching loadout ID from availableLoadoutIds, or null'),
})

const SYSTEM_PROMPT =
  'You are the IS Meta-Router (Necklace Slot) of an AI Inventory System. ' +
  'Classify incoming tasks and select the optimal loadout. ' +
  'Be precise. For technical/code tasks prefer software-engineering.'

export class TaskClassifier {
  constructor(
    private model:      string = 'gemini-2.5-flash',
    private maxRetries: number = 3,
  ) {}

  async classify(
    task:                string,
    availableLoadoutIds: string[],
  ): Promise<ClassificationResult> {
    const prompt = [
      `Task: "${task}"`,
      `Available loadout IDs: [${availableLoadoutIds.join(', ')}]`,
      'Classify the task and select the most appropriate loadout.',
    ].join('\n')

    let lastError: Error | undefined

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const { object } = await generateObject({
          model:  google(this.model),
          system: SYSTEM_PROMPT,
          prompt,
          schema: ClassificationSchema,
        })
        return object
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        console.warn(`[IS:TaskClassifier] Attempt ${attempt}/${this.maxRetries}: ${lastError.message}`)
        if (attempt < this.maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * attempt))
        }
      }
    }
    throw lastError ?? new Error('TaskClassifier: all retries exhausted')
  }
}
