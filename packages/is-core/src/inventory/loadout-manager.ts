import fs from 'fs/promises'
import path from 'path'
import { LoadoutSchema, type Loadout, type TaskType } from '@irsanai/schemas'

export class LoadoutManager {
  private loadouts = new Map<string, Loadout>()

  constructor(private registryPath: string) {}

  async load(): Promise<void> {
    const dir   = path.join(this.registryPath, 'loadouts')
    const files = (await fs.readdir(dir)).filter(f => f.endsWith('.json'))
    await Promise.all(files.map(async file => {
      const raw     = await fs.readFile(path.join(dir, file), 'utf-8')
      const loadout = LoadoutSchema.parse(JSON.parse(raw))
      this.loadouts.set(loadout.id, loadout)
    }))
    console.log(`[IS:LoadoutManager] Loaded ${this.loadouts.size} loadouts`)
  }

  getById(id: string): Loadout | undefined { return this.loadouts.get(id) }
  getAll(): Loadout[] { return Array.from(this.loadouts.values()) }
  getIds(): string[] { return Array.from(this.loadouts.keys()) }
  getDefault(): Loadout | undefined { return this.getAll().find(l => l.isDefault) }
  findForTaskType(taskType: TaskType): Loadout | undefined {
    return this.getAll()
      .filter(l => l.taskTypes.includes(taskType))
      .sort((a, b) => b.routing.priority - a.routing.priority)[0]
  }
}
