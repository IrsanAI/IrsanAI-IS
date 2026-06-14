/**
 * @irsanai/schemas -- IrsanAI IS Zod Schema Library
 *
 * Entities:
 *   Model   -- LLM "items" that fill equipment slots
 *   Essence -- Transferable trained capabilities extracted from models
 *   Loadout -- Optimal equipment configurations per task type
 *   Agent   -- Pre-built character classes with embedded loadouts
 */
export * from './model.schema.js'
export * from './essence.schema.js'
export * from './loadout.schema.js'
export * from './agent.schema.js'
