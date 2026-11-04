import { z } from "zod";
import {
  createLibraryEntryUpdatedEvent,
  type PhysicalActivityEntry,
} from "../domain";
import {
  createDay,
  estimateCalories,
  localDay,
  physicalProfileSchema,
  workoutDaySchema,
  workoutDaysSchema,
  type PhysicalProfile,
} from "../domain/workouts";
import { nextMetadata } from "../domain/validation";
import type { ApplicationDependencies } from "./ports";
import { ApplicationError } from "./errors";
import {
  currentTime,
  generatedId,
  parseInput,
  publishEvent,
  runTransaction,
  saveEntity,
} from "./internal";
export interface PhysicalProfilePort {
  load(): Promise<PhysicalProfile | undefined>;
  save(profile: PhysicalProfile | undefined): Promise<void>;
}
export class PhysicalProfileService implements PhysicalProfilePort {
  constructor(private readonly store: PhysicalProfilePort) {}
  load() {
    return this.store.load();
  }
  async save(input: PhysicalProfile | undefined) {
    return await this.store.save(
      input === undefined ? undefined : physicalProfileSchema.parse(input),
    );
  }
}
type Dependencies = Pick<
  ApplicationDependencies,
  "clock" | "ids" | "events" | "libraryEntries" | "transaction"
>;
const schema = z.strictObject({
  entryId: z.string().min(1),
  revision: z.int().positive(),
  day: workoutDaySchema.nullable(),
  date: z.iso.date(),
});
export class SaveWorkoutDay {
  constructor(
    private readonly deps: Dependencies,
    private readonly profile: PhysicalProfilePort,
  ) {}
  async execute(input: unknown): Promise<PhysicalActivityEntry> {
    const parsed = parseInput(schema, input);
    const now = await currentTime(this.deps);
    if (
      parsed.date > localDay(new Date(now)) ||
      (parsed.day && parsed.day.date !== parsed.date)
    )
      throw new ApplicationError(
        "VALIDATION_FAILED",
        "Escolha um dia até hoje.",
      );
    const profile = await this.profile.load();
    const eventId = await generatedId(this.deps, "workout_event");
    const updated = await runTransaction(this.deps, async () => {
      const entry = await this.deps.libraryEntries.getById(parsed.entryId);
      if (!entry || entry.type !== "physical_activity")
        throw new ApplicationError("NOT_FOUND", "Treino não encontrado.");
      if (entry.revision !== parsed.revision)
        throw new ApplicationError(
          "CONFLICT",
          "O treino mudou em outra tela. Reabra antes de salvar.",
          { operation: "workout_conflict" },
        );
      const days = [
        ...(entry.workoutDays ?? []).filter((d) => d.date !== parsed.date),
      ];
      if (parsed.day) {
        const old = entry.workoutDays?.find((d) => d.date === parsed.date);
        // Snapshot comparisons cannot be rewritten after the first save of a day.
        if (
          old &&
          JSON.stringify(
            old.movements.map((m) => ({
              name: m.name,
              unit: m.unit,
              base: m.base,
            })),
          ) !==
            JSON.stringify(
              parsed.day.movements.map((m) => ({
                name: m.name,
                unit: m.unit,
                base: m.base,
              })),
            )
        )
          throw new ApplicationError(
            "VALIDATION_FAILED",
            "A referência desta execução foi alterada. Reabra o treino.",
          );
        if (
          !old &&
          JSON.stringify(
            createDay(entry, parsed.date).movements.map((m) => ({
              name: m.name,
              unit: m.unit,
              base: m.base,
            })),
          ) !==
            JSON.stringify(
              parsed.day.movements.map((m) => ({
                name: m.name,
                unit: m.unit,
                base: m.base,
              })),
            )
        )
          throw new ApplicationError(
            "VALIDATION_FAILED",
            "A ficha-base mudou. Reabra o treino.",
          );
        const sameParameters =
          old &&
          old.durationMinutes === parsed.day.durationMinutes &&
          old.intensity === parsed.day.intensity;
        const estimate =
          sameParameters && old.estimate
            ? old.estimate
            : estimateCalories(
                entry.category,
                parsed.day.durationMinutes,
                parsed.day.intensity,
                profile,
              );
        days.push({ ...parsed.day, estimate, updatedAt: now });
      }
      const result: PhysicalActivityEntry = {
        ...entry,
        ...nextMetadata(entry, now),
        workoutDays: workoutDaysSchema.parse(days),
      };
      await saveEntity(
        () => this.deps.libraryEntries.save(result),
        "save_workout_day",
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
          entryType: "physical_activity",
          changedFields: ["workoutDays"],
        },
      }),
    );
    return updated;
  }
}
