import { z } from 'zod'

// ─── Task Types ───────────────────────────────────────────────────────────────

export const TaskTypeSchema = z.enum([
  'software-engineering',
  'research-synthesis',
  'creative-writing',
  'data-analysis',
  'devops-automation',
  'document-processing',
  'multimodal-analysis',
  'conversation',
  'planning-strategy',
  'security-audit',
])
export type TaskType = z.infer<typeof TaskTypeSchema>

// ─── Supporting Types ─────────────────────────────────────────────────────────

export const ToolConfigSchema = z.object({
  name:       z.string().describe('Tool or MCP server name'),
  type:       z.enum(['mcp-server', 'function', 'api', 'browser']),
  serverUrl:  z.string().url().optional(),
  config:     z.record(z.string(), z.unknown()).optional(),
  isRequired: z.boolean().default(false),
})
export type ToolConfig = z.infer<typeof ToolConfigSchema>

export const MemoryConfigSchema = z.object({
  provider: z.enum([
    'supabase-pgvector', 'qdrant', 'mem0', 'in-memory', 'none',
  ]),
  windowSizeTokens: z.number().int().positive().optional()
    .describe('Token budget allocated to memory context injection'),
  strategy: z.enum([
    'sliding-window', 'semantic', 'episodic', 'hybrid'
  ]).optional(),
  embeddingModelId: z.string().optional()
    .describe('Model used for embeddings'),
})
export type MemoryConfig = z.infer<typeof MemoryConfigSchema>

export const RoutingConfigSchema = z.object({
  triggerKeywords:   z.array(z.string()).optional(),
  triggerRegex:      z.string().optional(),
  minConfidence:     z.number().min(0).max(1).default(0.7)
    .describe('Min router confidence score to activate this loadout'),
  fallbackLoadoutId: z.string().optional()
    .describe('Loadout to use if this one underperforms'),
  priority:          z.number().int().default(0)
    .describe('Higher = preferred when multiple loadouts match'),
})
export type RoutingConfig = z.infer<typeof RoutingConfigSchema>

// ─── Loadout Schema ───────────────────────────────────────────────────────────

export const LoadoutSchema = z.object({
  id:          z.string().min(1),
  name:        z.string(),
  description: z.string(),
  taskTypes:   z.array(TaskTypeSchema).min(1),

  // ── Equipment Slots ───────────────────────────────────────────────────────
  primaryLlmId: z.string().describe('Primary Weapon: core LLM model ID'),
  offHandLlmId: z.string().optional().describe('Off-hand: specialist LLM model ID'),
  memory:       MemoryConfigSchema.describe('Helmet: memory system configuration'),
  tools:        z.array(ToolConfigSchema).default([])
    .describe('Shoulders: MCP servers and tool integrations'),
  // ─────────────────────────────────────────────────────────────────────────

  // Active essences in this loadout (IDs reference the essence registry)
  activeEssenceIds: z.array(z.string()).default([]),

  // Routing config -- consumed by IS Meta-Router (Necklace slot)
  routing: RoutingConfigSchema,

  // Performance metrics -- updated by @irsanai/metacognition at runtime
  metrics: z.object({
    avgLatencyMs:  z.number().optional(),
    successRate:   z.number().min(0).max(1).optional(),
    avgConfidence: z.number().min(0).max(1).optional(),
    usageCount:    z.number().int().default(0),
    lastUsedAt:    z.string().optional().describe('ISO datetime'),
  }).default({}),

  isDefault: z.boolean().default(false).describe('Activated when no loadout matches'),
  tags:      z.array(z.string()).default([]),
  notes:     z.string().optional(),
})

export type Loadout = z.infer<typeof LoadoutSchema>
