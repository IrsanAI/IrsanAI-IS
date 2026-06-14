import { z } from 'zod'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const EssenceTierSchema = z.enum(['mythic', 'legendary', 'rare', 'common'])
export type EssenceTier = z.infer<typeof EssenceTierSchema>

export const ProviderSchema = z.enum([
  'anthropic', 'openai', 'google', 'mistral', 'meta', 'deepseek', 'custom',
])
export type Provider = z.infer<typeof ProviderSchema>

export const ModelCapabilitySchema = z.enum([
  'text-generation',
  'code-generation',
  'vision-understanding',
  'audio-understanding',
  'function-calling',
  'long-context',
  'reasoning',
  'real-time-grounding',
  'structured-output',
  'multimodal-output',
  'embedding',
])
export type ModelCapability = z.infer<typeof ModelCapabilitySchema>

export const ModelSlotSchema = z.enum([
  'primary-weapon', // Core LLM -- main reasoning engine
  'off-hand',       // Specialist LLM -- activated by task router
  'any',            // Can fill either slot
])
export type ModelSlot = z.infer<typeof ModelSlotSchema>

export const AccessTierSchema = z.enum([
  'public',      // Free / web access
  'api',         // API key access
  'restricted',  // Limited access programme
  'mythic',      // Exclusive (e.g. Project Glasswing)
])
export type AccessTier = z.infer<typeof AccessTierSchema>

// ─── Model Schema ─────────────────────────────────────────────────────────────

export const ModelSchema = z.object({
  id:             z.string().min(1).describe('Unique identifier, e.g. "claude-sonnet-4-6"'),
  name:           z.string().describe('Human-readable display name'),
  provider:       ProviderSchema,
  version:        z.string().describe('Version string, e.g. "4.6"'),
  apiModelString: z.string().describe('Exact string for API calls'),
  slot:           ModelSlotSchema,

  // Capability profile -- the "essence carrier"
  capabilities:    z.array(ModelCapabilitySchema).min(1),
  contextWindow:   z.number().int().positive().optional()
    .describe('Max context in tokens'),
  maxOutputTokens: z.number().int().positive().optional(),

  // Essences this model carries (references to essence registry IDs)
  essenceIds: z.array(z.string()).default([]),

  // Cost in USD per 1M tokens
  cost: z.object({
    inputPerMToken:  z.number().nonnegative(),
    outputPerMToken: z.number().nonnegative(),
    currency:        z.literal('USD').default('USD'),
  }),

  // Latency benchmarks -- populated by @irsanai/metacognition at runtime
  latencyMs: z.object({
    p50:  z.number().optional(),
    p95:  z.number().optional(),
    ttft: z.number().optional().describe('Time to first token (ms)'),
  }).optional(),

  // Access control
  isPublic:      z.boolean(),
  accessTier:    AccessTierSchema,
  projectAccess: z.string().optional().describe('Programme name, e.g. "glasswing"'),

  // Metadata
  knowledgeCutoff: z.string().optional().describe('ISO date, e.g. "2025-08-31"'),
  releaseDate:     z.string().optional().describe('ISO date'),
  deprecatedAt:    z.string().optional().describe('ISO date -- set when model is retired'),
  tags:            z.array(z.string()).default([]),
  notes:           z.string().optional(),
})

export type Model = z.infer<typeof ModelSchema>
