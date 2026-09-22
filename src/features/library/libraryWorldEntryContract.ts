import type { ReadingAreaBook } from "./readingAreaBookContract";

export type StudyWorldProgressUnit =
  "hours" | "sessions" | "modules" | "topics" | "exercises" | "percent";

export type PhysicalActivityWorldCategory =
  "strength" | "cardio" | "mobility" | "sport" | "mixed" | "other";

export interface MovieWorldEntry {
  readonly createdAt: string;
  readonly director?: string;
  readonly durationMinutes?: number;
  readonly entryId: string;
  readonly instanceId: string;
  readonly modelTypeId: "movie-record";
  readonly platform?: string;
  readonly title: string;
  readonly type: "movie";
  readonly year?: number;
}

export interface SeriesWorldEntry {
  readonly createdAt: string;
  readonly currentEpisode?: number;
  readonly currentSeason?: number;
  readonly entryId: string;
  readonly episodesWatched: number;
  readonly instanceId: string;
  readonly modelTypeId: "series-record";
  readonly platform?: string;
  readonly title: string;
  readonly totalEpisodes?: number;
  readonly type: "series";
}

export interface StudyWorldEntry {
  readonly area?: string;
  readonly createdAt: string;
  readonly deadline?: string;
  readonly discipline?: string;
  readonly entryId: string;
  readonly instanceId: string;
  readonly modelTypeId: "study-record";
  readonly objective?: string;
  readonly progressCurrent: number;
  readonly progressTotal?: number;
  readonly progressUnit: StudyWorldProgressUnit;
  readonly title: string;
  readonly type: "study";
}

export interface PhysicalActivityWorldEntry {
  readonly category: PhysicalActivityWorldCategory;
  readonly createdAt: string;
  readonly entryId: string;
  readonly instanceId: string;
  readonly modality?: string;
  readonly modelTypeId: "physical-activity-record";
  readonly objective?: string;
  readonly title: string;
  readonly type: "physical_activity";
}

export interface WorkWorldEntry {
  readonly area?: string;
  readonly createdAt: string;
  readonly deadline?: string;
  readonly description?: string;
  readonly entryId: string;
  readonly instanceId: string;
  readonly modelTypeId: "work-record";
  readonly nextAction?: string;
  readonly organization?: string;
  readonly title: string;
  readonly type: "work";
}

export interface LibraryWorldBookCategory {
  readonly entries: readonly ReadingAreaBook[];
  readonly type: "book";
}

export interface LibraryWorldMovieCategory {
  readonly entries: readonly MovieWorldEntry[];
  readonly type: "movie";
}

export interface LibraryWorldSeriesCategory {
  readonly entries: readonly SeriesWorldEntry[];
  readonly type: "series";
}

export interface LibraryWorldStudyCategory {
  readonly entries: readonly StudyWorldEntry[];
  readonly type: "study";
}

export interface LibraryWorldPhysicalActivityCategory {
  readonly entries: readonly PhysicalActivityWorldEntry[];
  readonly type: "physical_activity";
}

export interface LibraryWorldWorkCategory {
  readonly entries: readonly WorkWorldEntry[];
  readonly type: "work";
}

export type LibraryWorldCategory =
  | LibraryWorldBookCategory
  | LibraryWorldMovieCategory
  | LibraryWorldSeriesCategory
  | LibraryWorldStudyCategory
  | LibraryWorldPhysicalActivityCategory
  | LibraryWorldWorkCategory;

/**
 * Renderer-neutral, logically ordered occurrences for the future library
 * world. `categories` always follows `ENTRY_TYPES`.
 */
export interface LibraryWorldSnapshot {
  readonly categories: readonly [
    LibraryWorldBookCategory,
    LibraryWorldMovieCategory,
    LibraryWorldSeriesCategory,
    LibraryWorldStudyCategory,
    LibraryWorldPhysicalActivityCategory,
    LibraryWorldWorkCategory,
  ];
}
