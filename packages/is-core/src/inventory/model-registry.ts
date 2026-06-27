import fs from 'fs/promises'
import path from 'path'
import { ModelSchema, type Model, type ModelSlot } from '@irsanai/schemas'

export class ModelRegistry {
  private models = new Map<string, Model>()
  private loaded  = false

  constructor(private registryPath: string) {}

  async load(): Promise<void> {
    const dir   = path.join(this.registryPath, 'models')
    const files = (await fs.readdir(dir)).filter(f => f.endsWith('.json'))
    await Promise.all(files.map(async file => {
      const raw   = await fs.readFile(path.join(dir, file), 'utf-8')
      const model = ModelSchema.parse(JSON.parse(raw))
      this.models.set(model.id, model)
    }))
    this.loaded = true
    console.log(`[IS:ModelRegistry] Loaded ${this.models.size} models`)
  }

  getById(id: string): Model | undefined { return this.models.get(id) }
  getAll(): Model[] { return Array.from(this.models.values()) }
  getBySlot(slot: ModelSlot): Model[] {
    return this.getAll().filter(m => m.slot === slot || m.slot === 'any')
  }
  getPublic(): Model[] {
    return this.getAll().filter(m => m.isPublic && m.accessTier !== 'mythic')
  }
}
