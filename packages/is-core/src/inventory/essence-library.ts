import fs from 'fs/promises'
import path from 'path'
import { EssenceSchema, type Essence } from '@irsanai/schemas'

export class EssenceLibrary {
  private essences = new Map<string, Essence>()

  constructor(private registryPath: string) {}

  async load(): Promise<void> {
    const dir   = path.join(this.registryPath, 'essences')
    const files = (await fs.readdir(dir)).filter(f => f.endsWith('.json'))
    await Promise.all(files.map(async file => {
      const raw     = await fs.readFile(path.join(dir, file), 'utf-8')
      const essence = EssenceSchema.parse(JSON.parse(raw))
      this.essences.set(essence.id, essence)
    }))
    console.log(`[IS:EssenceLibrary] Loaded ${this.essences.size} essences`)
  }

  getById(id: string): Essence | undefined { return this.essences.get(id) }
  getAll(): Essence[] { return Array.from(this.essences.values()) }
  getByIds(ids: string[]): Essence[] {
    return ids.flatMap(id => { const e = this.essences.get(id); return e ? [e] : [] })
  }
  getByTier(tier: 'mythic' | 'legendary' | 'rare' | 'common'): Essence[] {
    return this.getAll().filter(e => e.tier === tier)
  }
}
