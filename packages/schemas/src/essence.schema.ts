import { z } from 'zod'
import {
  EssenceTierSchema,
  ModelCapabilitySchema,
  ModelSlotSchema,
} from './model.schema.js'

// ─── Transfer Methods ─────────────────────────────────────────────────────────

export const EssenceTransferMethodSchema = z.enum([
  'system-prompt',  // System prompt blueprint
  'few-shot',       // Few-shot example pack
  'fine-tune',      // Requires fine-tuning on target model
  'rag',            // RAG / retrieval setup
  'prompt-pattern', // Structural prompt pattern
  'tool-config',    // MCP / tool configuration
  'model-specific', // Non-transferable (source model only)
])
export type EssenceTransferMethod = z.infer<typeof EssenceTransferMethodSchema>

// ─── Transfer Artifact ────────────────────────────────────────────────────────

export const FewShotExampleSchema = z.object({
  role:    z.enum(['user', 'assistant', 'system']),
  content: z.string(),
})

export const TransferArtifactSchema = z.object({
  systemPromptBlueprint: z.string().optional()
    .describe('Extractable system prompt -- use [PLACEHOLDERS] for variable parts'),
  fewShotExamples: z.array(FewShotExampleSchema).optional(),
  promptPattern:   z.string().optional()
    .describe('Template or structural pattern for invoking this capability'),
  zodSchema:       z.string().optional()
    .describe('Zod schema string for structured output when this essence is active'),
  notes:           z.string().optional(),
})
export type TransferArtifact = z.infer<typeof TransferArtifactSchema>

// ─── Essence Schema ───────────────────────────────────────────────────────────

export const EssenceSchema = z.object({
  id:          z.string().min(1).describe('e.g. "instruction-following"'),
  name:        z.string(),
  description: z.string(),
  tier:        EssenceTierSchema,

  sourceModelId:   z.string().describe('Model this essence was extracted from'),
  transferMethods: z.array(EssenceTransferMethodSchema).min(1),
  capabilities:    z.array(ModelCapabilitySchema),

  // The extracted artifact -- what makes this essence transferable
  transferArtifact: TransferArtifactSchema.optional(),

  // Performance delta when active: { benchmarkName: scoreDelta }
  // e.g. { "humaneval": 0.08 } = +8% on HumanEval when equipped
  benchmarkDeltas: z.record(z.string(), z.number()).optional(),

  compatibleSlots:  z.array(ModelSlotSchema).default(['primary-weapon', 'off-hand', 'any']),
  incompatibleWith: z.array(z.string()).default([])
    .describe('Essence IDs that conflict with this essence'),
  requiresEssences: z.array(z.string()).default([])
    .describe('Essence IDs that must be co-equipped'),

  tags:  z.array(z.string()).default([]),
  notes: z.string().optional(),
})

export type Essence = z.infer<typeof EssenceSchema>
