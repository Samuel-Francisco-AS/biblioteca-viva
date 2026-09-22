import type {
  LibraryEntry,
  MovieEntry,
  PhysicalActivityEntry,
  SeriesEntry,
  StudyEntry,
  WorkEntry,
} from "../../domain";
import { projectReadingAreaBooks } from "./readingAreaBooks";
import type {
  LibraryWorldCategory,
  LibraryWorldSnapshot,
  MovieWorldEntry,
  PhysicalActivityWorldEntry,
  SeriesWorldEntry,
  StudyWorldEntry,
  WorkWorldEntry,
} from "./libraryWorldEntryContract";

export type {
  LibraryWorldBookCategory,
  LibraryWorldCategory,
  LibraryWorldMovieCategory,
  LibraryWorldPhysicalActivityCategory,
  LibraryWorldSeriesCategory,
  LibraryWorldSnapshot,
  LibraryWorldStudyCategory,
  LibraryWorldWorkCategory,
  MovieWorldEntry,
  PhysicalActivityWorldCategory,
  PhysicalActivityWorldEntry,
  SeriesWorldEntry,
  StudyWorldEntry,
  StudyWorldProgressUnit,
  WorkWorldEntry,
} from "./libraryWorldEntryContract";

function compareEntries<TEntry extends LibraryEntry>(
  left: TEntry,
  right: TEntry,
): number {
  return (
    left.createdAt.localeCompare(right.createdAt) ||
    left.id.localeCompare(right.id)
  );
}

function orderedEntries<TEntry extends LibraryEntry>(
  entries: readonly TEntry[],
): readonly TEntry[] {
  return [...entries].sort(compareEntries);
}

function validateDistinctEntryIds(entries: readonly LibraryEntry[]): void {
  const entryIds = new Set<string>();
  for (const entry of entries) {
    if (entryIds.has(entry.id)) {
      throw new Error(
        `A projeção do mundo da Biblioteca contém entryId duplicado: ${entry.id}.`,
      );
    }
    entryIds.add(entry.id);
  }
}

function projectMovie(entry: MovieEntry): MovieWorldEntry {
  return Object.freeze({
    createdAt: entry.createdAt,
    ...(entry.director !== undefined && { director: entry.director }),
    ...(entry.durationMinutes !== undefined && {
      durationMinutes: entry.durationMinutes,
    }),
    entryId: entry.id,
    instanceId: `library-movie:${entry.id}`,
    modelTypeId: "movie-record" as const,
    ...(entry.platform !== undefined && { platform: entry.platform }),
    title: entry.title,
    type: "movie" as const,
    ...(entry.year !== undefined && { year: entry.year }),
  });
}

function projectSeries(entry: SeriesEntry): SeriesWorldEntry {
  return Object.freeze({
    createdAt: entry.createdAt,
    ...(entry.currentEpisode !== undefined && {
      currentEpisode: entry.currentEpisode,
    }),
    ...(entry.currentSeason !== undefined && {
      currentSeason: entry.currentSeason,
    }),
    entryId: entry.id,
    episodesWatched: entry.episodesWatched,
    instanceId: `library-series:${entry.id}`,
    modelTypeId: "series-record" as const,
    ...(entry.platform !== undefined && { platform: entry.platform }),
    title: entry.title,
    ...(entry.totalEpisodes !== undefined && {
      totalEpisodes: entry.totalEpisodes,
    }),
    type: "series" as const,
  });
}

function projectStudy(entry: StudyEntry): StudyWorldEntry {
  return Object.freeze({
    ...(entry.area !== undefined && { area: entry.area }),
    createdAt: entry.createdAt,
    ...(entry.deadline !== undefined && { deadline: entry.deadline }),
    ...(entry.discipline !== undefined && { discipline: entry.discipline }),
    entryId: entry.id,
    instanceId: `library-study:${entry.id}`,
    modelTypeId: "study-record" as const,
    ...(entry.objective !== undefined && { objective: entry.objective }),
    progressCurrent: entry.progressCurrent,
    ...(entry.progressTotal !== undefined && {
      progressTotal: entry.progressTotal,
    }),
    progressUnit: entry.progressUnit,
    title: entry.title,
    type: "study" as const,
  });
}

function projectPhysicalActivity(
  entry: PhysicalActivityEntry,
): PhysicalActivityWorldEntry {
  return Object.freeze({
    category: entry.category,
    createdAt: entry.createdAt,
    entryId: entry.id,
    instanceId: `library-physical-activity:${entry.id}`,
    ...(entry.modality !== undefined && { modality: entry.modality }),
    modelTypeId: "physical-activity-record" as const,
    ...(entry.objective !== undefined && { objective: entry.objective }),
    title: entry.title,
    type: "physical_activity" as const,
  });
}

function projectWork(entry: WorkEntry): WorkWorldEntry {
  return Object.freeze({
    ...(entry.area !== undefined && { area: entry.area }),
    createdAt: entry.createdAt,
    ...(entry.deadline !== undefined && { deadline: entry.deadline }),
    ...(entry.description !== undefined && { description: entry.description }),
    entryId: entry.id,
    instanceId: `library-work:${entry.id}`,
    modelTypeId: "work-record" as const,
    ...(entry.nextAction !== undefined && { nextAction: entry.nextAction }),
    ...(entry.organization !== undefined && {
      organization: entry.organization,
    }),
    title: entry.title,
    type: "work" as const,
  });
}

function validateDistinctInstanceIds(
  categories: readonly LibraryWorldCategory[],
): void {
  const instanceIds = new Set<string>();
  for (const category of categories) {
    for (const entry of category.entries) {
      if (instanceIds.has(entry.instanceId)) {
        throw new Error(
          `A projeção do mundo da Biblioteca contém instanceId duplicado: ${entry.instanceId}.`,
        );
      }
      instanceIds.add(entry.instanceId);
    }
  }
}

/**
 * Projects validated conventional entries into an immutable, renderer-neutral
 * snapshot. Its category order is logical only; it contains no spatial data.
 */
export function projectLibraryWorldEntries(
  entries: readonly LibraryEntry[],
): LibraryWorldSnapshot {
  validateDistinctEntryIds(entries);

  const categories = [
    Object.freeze({
      entries: projectReadingAreaBooks(
        entries.filter(
          (entry): entry is Extract<LibraryEntry, { type: "book" }> =>
            entry.type === "book",
        ),
      ),
      type: "book" as const,
    }),
    Object.freeze({
      entries: Object.freeze(
        orderedEntries(
          entries.filter(
            (entry): entry is MovieEntry => entry.type === "movie",
          ),
        ).map(projectMovie),
      ),
      type: "movie" as const,
    }),
    Object.freeze({
      entries: Object.freeze(
        orderedEntries(
          entries.filter(
            (entry): entry is SeriesEntry => entry.type === "series",
          ),
        ).map(projectSeries),
      ),
      type: "series" as const,
    }),
    Object.freeze({
      entries: Object.freeze(
        orderedEntries(
          entries.filter(
            (entry): entry is StudyEntry => entry.type === "study",
          ),
        ).map(projectStudy),
      ),
      type: "study" as const,
    }),
    Object.freeze({
      entries: Object.freeze(
        orderedEntries(
          entries.filter(
            (entry): entry is PhysicalActivityEntry =>
              entry.type === "physical_activity",
          ),
        ).map(projectPhysicalActivity),
      ),
      type: "physical_activity" as const,
    }),
    Object.freeze({
      entries: Object.freeze(
        orderedEntries(
          entries.filter((entry): entry is WorkEntry => entry.type === "work"),
        ).map(projectWork),
      ),
      type: "work" as const,
    }),
  ] as const;

  validateDistinctInstanceIds(categories);
  return Object.freeze({ categories: Object.freeze(categories) });
}
