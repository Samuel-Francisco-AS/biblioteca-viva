import { z } from "zod";
import {
  catalogSchema,
  WATCH_STATES,
  type EntertainmentEntry,
} from "../domain/entertainment";
import { createLibraryEntryUpdatedEvent } from "../domain";
import { updateEntertainmentTracking } from "../domain/entertainmentTracking";
import { ApplicationError } from "./errors";
import type { ApplicationDependencies } from "./ports";
import {
  applyDomain,
  currentTime,
  generatedId,
  parseInput,
  publishEvent,
  runTransaction,
  saveEntity,
} from "./internal";

const schema = z.strictObject({
  id: z.string().trim().min(1),
  expectedRevision: z.int().positive(),
  catalog: catalogSchema.optional(),
  state: z.enum(WATCH_STATES).optional(),
  episodesWatched: z.int().nonnegative().optional(),
  currentSeason: z.int().positive().optional(),
  currentEpisode: z.int().positive().optional(),
});
type Dependencies = Pick<
  ApplicationDependencies,
  "clock" | "ids" | "events" | "libraryEntries" | "transaction"
>;
export class SaveEntertainment {
  constructor(private readonly deps: Dependencies) {}
  async execute(input: unknown): Promise<EntertainmentEntry> {
    const parsed = parseInput(schema, input);
    const now = await currentTime(this.deps);
    const eventId = await generatedId(this.deps, "entertainment_event");
    const updated = await runTransaction(this.deps, async () => {
      const entry = await this.deps.libraryEntries.getById(parsed.id);
      if (!entry || (entry.type !== "movie" && entry.type !== "series"))
        throw new ApplicationError("NOT_FOUND", "Obra não encontrada.");
      if (entry.revision !== parsed.expectedRevision)
        throw new ApplicationError(
          "CONFLICT",
          "A obra mudou em outra tela. Reabra antes de salvar.",
        );
      const result = applyDomain(() =>
        updateEntertainmentTracking(entry, parsed, now),
      );
      await saveEntity(
        () => this.deps.libraryEntries.save(result),
        "save_entertainment",
      );
      return result;
    });
    await publishEvent(
      this.deps,
      createLibraryEntryUpdatedEvent({
        eventId,
        aggregateId: updated.id,
        occurredAt: now,
        revision: updated.revision,
        payload: {
          entryType: updated.type,
          changedFields: ["catalog", "status", "episodesWatched"],
        },
      }),
    );
    return updated;
  }
}
