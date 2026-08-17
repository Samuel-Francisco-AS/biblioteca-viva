export const ENTRY_STATUSES = [
  "planned",
  "in_progress",
  "paused",
  "completed",
  "abandoned",
] as const;

export type EntryStatus = (typeof ENTRY_STATUSES)[number];

export const ENTRY_TYPES = [
  "book",
  "movie",
  "series",
  "study",
  "physical_activity",
  "work",
] as const;

export type EntryType = (typeof ENTRY_TYPES)[number];

export const STUDY_PROGRESS_UNITS = [
  "hours",
  "sessions",
  "modules",
  "topics",
  "exercises",
  "percent",
] as const;

export type StudyProgressUnit = (typeof STUDY_PROGRESS_UNITS)[number];

export const PHYSICAL_ACTIVITY_CATEGORIES = [
  "strength",
  "cardio",
  "mobility",
  "sport",
  "mixed",
  "other",
] as const;

export type PhysicalActivityCategory =
  (typeof PHYSICAL_ACTIVITY_CATEGORIES)[number];

export interface EntityMetadata {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly revision: number;
}

export interface LibraryEntryBase extends EntityMetadata {
  readonly type: EntryType;
  readonly title: string;
  readonly status: EntryStatus;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly favorite: boolean;
  readonly tagIds: readonly string[];
}

export interface BookEntry extends LibraryEntryBase {
  readonly type: "book";
  readonly author?: string;
  readonly totalPages?: number;
  readonly currentPage: number;
  readonly rating?: number;
}

export interface MovieEntry extends LibraryEntryBase {
  readonly type: "movie";
  readonly director?: string;
  readonly year?: number;
  readonly durationMinutes?: number;
  readonly platform?: string;
}

export interface SeriesEntry extends LibraryEntryBase {
  readonly type: "series";
  readonly platform?: string;
  readonly episodesWatched: number;
  readonly totalEpisodes?: number;
  readonly currentSeason?: number;
  readonly currentEpisode?: number;
}

export interface StudyEntry extends LibraryEntryBase {
  readonly type: "study";
  readonly area?: string;
  readonly discipline?: string;
  readonly objective?: string;
  readonly progressUnit: StudyProgressUnit;
  /** Minutos inteiros quando progressUnit === "hours". */
  readonly progressCurrent: number;
  /** Minutos inteiros quando progressUnit === "hours". */
  readonly progressTotal?: number;
  readonly deadline?: string;
}

export interface PhysicalActivityEntry extends LibraryEntryBase {
  readonly type: "physical_activity";
  readonly category: PhysicalActivityCategory;
  readonly modality?: string;
  readonly objective?: string;
}

export interface WorkEntry extends LibraryEntryBase {
  readonly type: "work";
  readonly area?: string;
  readonly organization?: string;
  readonly description?: string;
  readonly deadline?: string;
  readonly nextAction?: string;
}

export type LibraryEntry =
  | BookEntry
  | MovieEntry
  | SeriesEntry
  | StudyEntry
  | PhysicalActivityEntry
  | WorkEntry;

export type AnnotationLocation =
  | { readonly type: "book"; readonly page: number }
  | { readonly type: "movie"; readonly minute: number }
  | {
      readonly type: "series";
      readonly season: number;
      readonly episode: number;
      readonly minute?: number;
    }
  | {
      readonly type: "study";
      readonly module?: string;
      readonly topic?: string;
    };

export interface Note extends EntityMetadata {
  readonly entryId: string;
  readonly content: string;
  readonly favorite: boolean;
  readonly tagIds: readonly string[];
  readonly location?: AnnotationLocation;
}

export interface Quote extends EntityMetadata {
  readonly entryId: string;
  readonly content: string;
  readonly favorite: boolean;
  readonly tagIds: readonly string[];
  readonly location?: AnnotationLocation;
}

export interface CreateBookInput {
  readonly id: string;
  readonly title: string;
  readonly author?: string;
  readonly status?: EntryStatus;
  readonly totalPages?: number;
  readonly currentPage?: number;
  readonly rating?: number;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly createdAt: string;
  readonly favorite?: boolean;
  readonly tagIds?: readonly string[];
}

export interface UpdateBibliographicDataInput {
  readonly title?: string;
  readonly author?: string;
  readonly totalPages?: number | null;
  readonly rating?: number | null;
  readonly updatedAt: string;
}

export interface CreateAnnotationInput {
  readonly id: string;
  readonly entryId: string;
  readonly content: string;
  readonly createdAt: string;
  readonly favorite?: boolean;
  readonly tagIds?: readonly string[];
  readonly location?: AnnotationLocation;
}

export type CreateQuoteInput = CreateAnnotationInput;

export interface UpdateAnnotationInput {
  readonly content: string;
  readonly updatedAt: string;
}

export interface UpdateQuoteInput extends UpdateAnnotationInput {
  readonly location?: AnnotationLocation;
}
