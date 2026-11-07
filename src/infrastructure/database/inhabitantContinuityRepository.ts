import {
  parseInhabitantContinuity,
  type InhabitantContinuityPort,
  type InhabitantContinuitySnapshot,
} from "../../features/library/inhabitantContinuity";
import type { BibliotecaDatabase } from "./database";

/** Stored in the existing settings table, already covered by backup v6. */
export const INHABITANT_CONTINUITY_KEY = "world.inhabitants.continuity.v1";

export class DexieInhabitantContinuityRepository implements InhabitantContinuityPort {
  private pending: Promise<void> = Promise.resolve();

  constructor(private readonly database: BibliotecaDatabase) {}

  async load(): Promise<InhabitantContinuitySnapshot | undefined> {
    await this.pending;
    const row = await this.database.settings.get(INHABITANT_CONTINUITY_KEY);
    return parseInhabitantContinuity(row?.value);
  }

  save(snapshot: InhabitantContinuitySnapshot): Promise<void> {
    const parsed = parseInhabitantContinuity(snapshot);
    if (!parsed) {
      return Promise.reject(new Error("Checkpoint de habitantes inválido."));
    }
    // Keep rapid pause/remount writes ordered, including after write failures.
    const write = this.pending.then(async () => {
      await this.database.settings.put({
        key: INHABITANT_CONTINUITY_KEY,
        value: parsed,
        updatedAt: parsed.savedAt,
      });
    });
    this.pending = write.catch(() => undefined);
    return write;
  }
}
