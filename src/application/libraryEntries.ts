import { z } from "zod";

import {
  ENTRY_STATUSES,
  PHYSICAL_ACTIVITY_CATEGORIES,
  STUDY_PROGRESS_UNITS,
  changeEntryStatus,
  createLibraryEntryCreatedEvent,
  createLibraryEntryUpdatedEvent,
  createMovie,
  createPhysicalActivity,
  createSeries,
  createStudy,
  createWork,
  updateLibraryEntryDetails,
  updateSeriesProgress,
  updateStudyProgress,
  type LibraryEntry,
} from "../domain";
import { createActivity } from "./activities";
import { ApplicationError, notFound, persistenceFailed } from "./errors";
import {
  applyDomain,
  currentTime,
  generatedId,
  parseInput,
  publishEvents,
  processMilestones,
  runTransaction,
  saveActivity,
  saveEntity,
} from "./internal";
import type { ApplicationDependencies } from "./ports";

const text = z.string().trim().min(1);
const optionalText = z.string().trim().min(1).optional();
const common = {
  title: text,
  status: z.enum(ENTRY_STATUSES).optional(),
};

const movieInputSchema = z.strictObject({
  ...common,
  type: z.literal("movie"),
  director: optionalText,
  year: z.int().positive().optional(),
  durationMinutes: z.int().positive().optional(),
  platform: optionalText,
});
const seriesInputSchema = z.strictObject({
  ...common,
  type: z.literal("series"),
  platform: optionalText,
  episodesWatched: z.int().nonnegative().optional(),
  totalEpisodes: z.int().positive().optional(),
  currentSeason: z.int().positive().optional(),
  currentEpisode: z.int().positive().optional(),
});
const studyInputSchema = z.strictObject({
  ...common,
  type: z.literal("study"),
  area: optionalText,
  discipline: optionalText,
  objective: optionalText,
  progressUnit: z.enum(STUDY_PROGRESS_UNITS),
  progressCurrent: z.int().nonnegative().optional(),
  progressTotal: z.int().positive().optional(),
  deadline: z.iso.datetime({ offset: false }).optional(),
});
const physicalActivityInputSchema = z.strictObject({
  ...common,
  type: z.literal("physical_activity"),
  category: z.enum(PHYSICAL_ACTIVITY_CATEGORIES),
  modality: optionalText,
  objective: optionalText,
});
const workInputSchema = z.strictObject({
  ...common,
  type: z.literal("work"),
  area: optionalText,
  organization: optionalText,
  description: optionalText,
  deadline: z.iso.datetime({ offset: false }).optional(),
  nextAction: optionalText,
});

export const createLibraryEntrySchema = z.discriminatedUnion("type", [
  movieInputSchema,
  seriesInputSchema,
  studyInputSchema,
  physicalActivityInputSchema,
  workInputSchema,
]);

export const updateLibraryEntrySchema = z.discriminatedUnion("type", [
  movieInputSchema.extend({ id: text }),
  seriesInputSchema.extend({ id: text }),
  studyInputSchema.extend({ id: text }),
  physicalActivityInputSchema.extend({ id: text }),
  workInputSchema.extend({ id: text }),
]);

const progressSchema = z.discriminatedUnion("type", [
  z.strictObject({
    id: text,
    type: z.literal("series"),
    episodesWatched: z.int().nonnegative(),
    currentSeason: z.int().positive().optional(),
    currentEpisode: z.int().positive().optional(),
  }),
  z.strictObject({
    id: text,
    type: z.literal("study"),
    progressCurrent: z.int().nonnegative(),
  }),
]);

const statusSchema = z.strictObject({
  id: text,
  status: z.enum(ENTRY_STATUSES),
});

async function loadEntry(
  dependencies: Pick<ApplicationDependencies, "libraryEntries">,
  id: string,
): Promise<LibraryEntry> {
  try {
    const entry = await dependencies.libraryEntries.getById(id);
    if (!entry) throw notFound();
    return entry;
  } catch (error: unknown) {
    if (error instanceof ApplicationError) throw error;
    throw persistenceFailed("get_entry");
  }
}

type WriteDependencies = Pick<
  ApplicationDependencies,
  | "activities"
  | "clock"
  | "events"
  | "ids"
  | "libraryEntries"
  | "milestones"
  | "transaction"
>;

async function persistMutation(
  dependencies: WriteDependencies,
  updated: LibraryEntry,
  changedFields: readonly string[],
  occurredAt: string,
): Promise<LibraryEntry> {
  const activityId = await generatedId(dependencies, "generate_activity_id");
  const eventId = await generatedId(dependencies, "generate_event_id");
  const activity = createActivity({
    id: activityId,
    type: "entry_updated",
    aggregateId: updated.id,
    occurredAt,
    revision: updated.revision,
    metadata: { entryType: updated.type, changedFields },
  });
  const event = createLibraryEntryUpdatedEvent({
    eventId,
    aggregateId: updated.id,
    occurredAt,
    revision: updated.revision,
    payload: { entryType: updated.type, changedFields },
  });
  let milestoneEvents = Object.freeze(
    [],
  ) as readonly import("../domain").DomainEvent[];
  await runTransaction(dependencies, async () => {
    await saveEntity(
      () => dependencies.libraryEntries.save(updated),
      "save_entry",
    );
    await saveActivity(dependencies, activity);
    milestoneEvents = await processMilestones(dependencies, event);
  });
  await publishEvents(dependencies, [event, ...milestoneEvents]);
  return updated;
}

export class CreateLibraryEntry {
  constructor(private readonly dependencies: WriteDependencies) {}

  async execute(input: unknown): Promise<LibraryEntry> {
    const parsed = parseInput(createLibraryEntrySchema, input);
    const [id, occurredAt] = await Promise.all([
      generatedId(this.dependencies, "generate_entry_id"),
      currentTime(this.dependencies),
    ]);
    const entry = applyDomain(() => {
      const factoryInput = { ...parsed, id, createdAt: occurredAt };
      switch (factoryInput.type) {
        case "movie":
          return createMovie(factoryInput);
        case "series":
          return createSeries(factoryInput);
        case "study":
          return createStudy(factoryInput);
        case "physical_activity":
          return createPhysicalActivity(factoryInput);
        case "work":
          return createWork(factoryInput);
      }
    });
    const activityId = await generatedId(
      this.dependencies,
      "generate_activity_id",
    );
    const eventId = await generatedId(this.dependencies, "generate_event_id");
    const activity = createActivity({
      id: activityId,
      type: "entry_created",
      aggregateId: entry.id,
      occurredAt,
      revision: entry.revision,
      metadata: { entryType: entry.type, status: entry.status },
    });
    const event = createLibraryEntryCreatedEvent({
      eventId,
      aggregateId: entry.id,
      occurredAt,
      revision: entry.revision,
      payload: { entryType: entry.type, status: entry.status },
    });
    let milestoneEvents = Object.freeze(
      [],
    ) as readonly import("../domain").DomainEvent[];
    await runTransaction(this.dependencies, async () => {
      await saveEntity(
        () => this.dependencies.libraryEntries.save(entry),
        "save_entry",
      );
      await saveActivity(this.dependencies, activity);
      milestoneEvents = await processMilestones(this.dependencies, event);
    });
    await publishEvents(this.dependencies, [event, ...milestoneEvents]);
    return entry;
  }
}

export class UpdateLibraryEntry {
  constructor(private readonly dependencies: WriteDependencies) {}

  async execute(input: unknown): Promise<LibraryEntry> {
    const parsed = parseInput(updateLibraryEntrySchema, input);
    const existing = await loadEntry(this.dependencies, parsed.id);
    if (existing.type === "book")
      throw new ApplicationError(
        "VALIDATION_FAILED",
        "Use a edição de livro para este registro.",
      );
    const occurredAt = await currentTime(this.dependencies);
    const updated = applyDomain(() =>
      updateLibraryEntryDetails(existing, parsed, occurredAt),
    );
    return persistMutation(
      this.dependencies,
      updated,
      Object.keys(parsed).filter((key) => key !== "id" && key !== "type"),
      occurredAt,
    );
  }
}

export class UpdateLibraryEntryProgress {
  constructor(private readonly dependencies: WriteDependencies) {}

  async execute(input: unknown): Promise<LibraryEntry> {
    const parsed = parseInput(progressSchema, input);
    const existing = await loadEntry(this.dependencies, parsed.id);
    const occurredAt = await currentTime(this.dependencies);
    const updated = applyDomain(() => {
      if (parsed.type === "series" && existing.type === "series")
        return updateSeriesProgress(existing, parsed, occurredAt);
      if (parsed.type === "study" && existing.type === "study")
        return updateStudyProgress(
          existing,
          parsed.progressCurrent,
          occurredAt,
        );
      throw new ApplicationError(
        "VALIDATION_FAILED",
        "O progresso não corresponde ao tipo de registro.",
      );
    });
    return persistMutation(
      this.dependencies,
      updated,
      parsed.type === "series" ? ["episodesWatched"] : ["progressCurrent"],
      occurredAt,
    );
  }
}

export class ChangeLibraryEntryStatus {
  constructor(private readonly dependencies: WriteDependencies) {}

  async execute(input: unknown): Promise<LibraryEntry> {
    const parsed = parseInput(statusSchema, input);
    const existing = await loadEntry(this.dependencies, parsed.id);
    if (existing.type === "book")
      throw new ApplicationError(
        "VALIDATION_FAILED",
        "Use as ações de leitura para este registro.",
      );
    const occurredAt = await currentTime(this.dependencies);
    const updated = applyDomain(() =>
      changeEntryStatus(existing, parsed.status, occurredAt),
    );
    return persistMutation(this.dependencies, updated, ["status"], occurredAt);
  }
}
