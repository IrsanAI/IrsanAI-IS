import { z } from 'zod'

// Agents are pre-built character classes with embedded loadouts.
// Unlike raw LLMs: agent = LLM + orchestration + tools, already configured.

export const AgentTypeSchema = z.enum([
  'coding',       // e.g. Claude Code, GitHub Copilot, Cursor
  'browsing',     // e.g. Claude in Chrome
  'desktop',      // e.g. Cowork, Manus
  'data',         // data analysis / BI agents
  'orchestrator', // meta-agent that coordinates other agents
  'specialist',   // narrow-domain expert agent
  'general',      // general-purpose agent
])
export type AgentType = z.infer<typeof AgentTypeSchema>

export const AgentSlotFillSchema = z.enum([
  'primary-weapon', 'off-hand', 'shoulders', 'chest', 'helmet', 'rings', 'neck',
])
export type AgentSlotFill = z.infer<typeof AgentSlotFillSchema>

export const AgentSchema = z.object({
  id:          z.string().min(1),
  name:        z.string(),
  description: z.string(),
  type:        AgentTypeSchema,
  provider:    z.string().describe('e.g. "anthropic", "openai", "manus.im"'),

  // Pre-built character class: which loadout does this agent ship with?
  defaultLoadoutId: z.string().optional(),
  internalModelId:  z.string().optional().describe('Which LLM powers this agent'),

  // Access endpoints
  installUrl:   z.string().url().optional(),
  apiEndpoint:  z.string().url().optional(),
  mcpServerUrl: z.string().url().optional(),
  isPublic:     z.boolean(),

  // Which IS slots this agent can fill in a custom loadout
  fillsSlots: z.array(AgentSlotFillSchema),

  // Essences contributed by this agent to the active loadout
  essenceIds: z.array(z.string()).default([]),

  tags:  z.array(z.string()).default([]),
  notes: z.string().optional(),
})

export type Agent = z.infer<typeof AgentSchema>
