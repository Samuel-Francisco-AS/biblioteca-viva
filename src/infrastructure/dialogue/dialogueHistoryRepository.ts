import type {
  Clock,
  DialogueHistory,
  DialogueHistoryPort,
} from "../../application";
import { dialogueHistorySchema } from "../../content";
import type { BibliotecaDatabase } from "../database/database";

export const DIALOGUE_HISTORY_KEY = "dialogue.history.v1";

export class DexieDialogueHistoryRepository implements DialogueHistoryPort {
  constructor(
    private readonly database: BibliotecaDatabase,
    private readonly clock: Clock,
  ) {}

  async load(): Promise<DialogueHistory | undefined> {
    const stored = await this.database.settings.get(DIALOGUE_HISTORY_KEY);
    if (!stored) return undefined;
    const parsed = dialogueHistorySchema.parse(stored.value);
    return Object.freeze({
      lastLibraryVisitAt: parsed.lastLibraryVisitAt,
      lastShownAt: Object.freeze({ ...parsed.lastShownAt }),
      shownOnceIds: Object.freeze([...new Set(parsed.shownOnceIds)].sort()),
    });
  }

  async save(history: DialogueHistory): Promise<void> {
    const value = dialogueHistorySchema.parse({ ...history, version: 1 });
    await this.database.settings.put({
      key: DIALOGUE_HISTORY_KEY,
      value,
      updatedAt: await this.clock.now(),
    });
  }
}
