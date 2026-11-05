import {
  parseNightLightingCheckpoint,
  type NightLightingCheckpoint,
  type NightLightingPort,
} from "../../features/library/nightLighting";
import type { BibliotecaDatabase } from "./database";

/** Existing settings table (Dexie v14 / backup v6), no schema migration. */
export const NIGHT_LIGHTING_KEY = "world.night-lighting.ritual.v1";

export class DexieNightLightingRepository implements NightLightingPort {
  private pending: Promise<void> = Promise.resolve();

  constructor(private readonly database: BibliotecaDatabase) {}

  async load(): Promise<NightLightingCheckpoint | undefined> {
    await this.pending;
    const row = await this.database.settings.get(NIGHT_LIGHTING_KEY);
    return parseNightLightingCheckpoint(row?.value);
  }

  save(value: NightLightingCheckpoint): Promise<void> {
    const parsed = parseNightLightingCheckpoint(value);
    if (!parsed)
      return Promise.reject(new Error("Ritual noturno inválido."));
    const write = this.pending.then(async () => {
      await this.database.settings.put({
        key: NIGHT_LIGHTING_KEY,
        value: parsed,
        updatedAt: new Date().toISOString(),
      });
    });
    this.pending = write.catch(() => undefined);
    return write;
  }
}
