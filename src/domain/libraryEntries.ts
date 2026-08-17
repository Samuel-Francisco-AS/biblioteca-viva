import {
  InvalidFieldError,
  InvalidProgressError,
  InvalidStatusTransitionError,
} from "./errors";
import type {
  EntryStatus,
  LibraryEntry,
  LibraryEntryBase,
  MovieEntry,
  PhysicalActivityCategory,
  PhysicalActivityEntry,
  SeriesEntry,
  StudyEntry,
  StudyProgressUnit,
  WorkEntry,
} from "./types";
import {
  nextMetadata,
  optionalText,
  requireId,
  requireIsoUtc,
  requireText,
  validateMetadata,
} from "./validation";

const ALLOWED_TRANSITIONS: Readonly<
  Record<EntryStatus, readonly EntryStatus[]>
> = {
  planned: Object.freeze(["in_progress", "abandoned"]),
  in_progress: Object.freeze(["paused", "completed", "abandoned"]),
  paused: Object.freeze(["in_progress", "completed", "abandoned"]),
  completed: Object.freeze(["in_progress"]),
  abandoned: Object.freeze(["in_progress"]),
};

interface CommonCreateInput {
  readonly id: string;
  readonly title: string;
  readonly status?: EntryStatus;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly favorite?: boolean;
  readonly tagIds?: readonly string[];
  readonly createdAt: string;
}

export interface CreateMovieInput extends CommonCreateInput {
  readonly director?: string;
  readonly year?: number;
  readonly durationMinutes?: number;
  readonly platform?: string;
}

export interface CreateSeriesInput extends CommonCreateInput {
  readonly platform?: string;
  readonly episodesWatched?: number;
  readonly totalEpisodes?: number;
  readonly currentSeason?: number;
  readonly currentEpisode?: number;
}

export interface CreateStudyInput extends CommonCreateInput {
  readonly area?: string;
  readonly discipline?: string;
  readonly objective?: string;
  readonly progressUnit: StudyProgressUnit;
  readonly progressCurrent?: number;
  readonly progressTotal?: number;
  readonly deadline?: string;
}

export interface CreatePhysicalActivityInput extends CommonCreateInput {
  readonly category: PhysicalActivityCategory;
  readonly modality?: string;
  readonly objective?: string;
}

export interface CreateWorkInput extends CommonCreateInput {
  readonly area?: string;
  readonly organization?: string;
  readonly description?: string;
  readonly deadline?: string;
  readonly nextAction?: string;
}

export type UpdateLibraryEntryDetailsInput =
  | {
      readonly type: "movie";
      readonly title: string;
      readonly director?: string;
      readonly year?: number;
      readonly durationMinutes?: number;
      readonly platform?: string;
    }
  | {
      readonly type: "series";
      readonly title: string;
      readonly platform?: string;
      readonly totalEpisodes?: number;
    }
  | {
      readonly type: "study";
      readonly title: string;
      readonly area?: string;
      readonly discipline?: string;
      readonly objective?: string;
      readonly progressUnit: StudyProgressUnit;
      readonly progressTotal?: number;
      readonly deadline?: string;
    }
  | {
      readonly type: "physical_activity";
      readonly title: string;
      readonly category: PhysicalActivityCategory;
      readonly modality?: string;
      readonly objective?: string;
    }
  | {
      readonly type: "work";
      readonly title: string;
      readonly area?: string;
      readonly organization?: string;
      readonly description?: string;
      readonly deadline?: string;
      readonly nextAction?: string;
    };

function tagIds(values: readonly string[] | undefined): readonly string[] {
  return Object.freeze([
    ...new Set((values ?? []).map((value) => requireId(value, "tagIds"))),
  ]);
}

function common<TType extends LibraryEntry["type"]>(
  type: TType,
  input: CommonCreateInput,
): LibraryEntryBase & { readonly type: TType } {
  const createdAt = requireIsoUtc(input.createdAt, "createdAt");
  const status = input.status ?? "planned";
  const startedAt =
    input.startedAt === undefined
      ? status === "in_progress"
        ? createdAt
        : undefined
      : requireIsoUtc(input.startedAt, "startedAt");
  const completedAt =
    status === "completed"
      ? requireIsoUtc(input.completedAt ?? createdAt, "completedAt")
      : undefined;
  return {
    id: requireId(input.id),
    type,
    title: requireText(input.title, "title"),
    status,
    favorite: input.favorite ?? false,
    tagIds: tagIds(input.tagIds),
    ...(startedAt !== undefined && { startedAt }),
    ...(completedAt !== undefined && { completedAt }),
    createdAt,
    updatedAt: createdAt,
    revision: 1,
  };
}

function positiveInteger(value: number | undefined, field: string) {
  if (value !== undefined && (!Number.isInteger(value) || value <= 0))
    throw new InvalidFieldError(field, "deve ser inteiro positivo");
  return value;
}

function nonnegativeInteger(value: number | undefined, field: string) {
  const result = value ?? 0;
  if (!Number.isInteger(result) || result < 0)
    throw new InvalidFieldError(field, "deve ser inteiro não negativo");
  return result;
}

function optionalDate(value: string | undefined, field: string) {
  return value === undefined ? undefined : requireIsoUtc(value, field);
}

export function createMovie(input: CreateMovieInput): MovieEntry {
  const year = positiveInteger(input.year, "year");
  const durationMinutes = positiveInteger(
    input.durationMinutes,
    "durationMinutes",
  );
  return Object.freeze({
    ...common("movie", input),
    ...(optionalText(input.director) && {
      director: optionalText(input.director),
    }),
    ...(year !== undefined && { year }),
    ...(durationMinutes !== undefined && { durationMinutes }),
    ...(optionalText(input.platform) && {
      platform: optionalText(input.platform),
    }),
  });
}

export function createSeries(input: CreateSeriesInput): SeriesEntry {
  const episodesWatched = nonnegativeInteger(
    input.episodesWatched,
    "episodesWatched",
  );
  const totalEpisodes = positiveInteger(input.totalEpisodes, "totalEpisodes");
  if (totalEpisodes !== undefined && episodesWatched > totalEpisodes)
    throw new InvalidProgressError(
      "episodesWatched não pode exceder totalEpisodes",
      "episodesWatched",
    );
  const currentSeason = positiveInteger(input.currentSeason, "currentSeason");
  const currentEpisode = positiveInteger(
    input.currentEpisode,
    "currentEpisode",
  );
  let entry: SeriesEntry = {
    ...common("series", input),
    ...(optionalText(input.platform) && {
      platform: optionalText(input.platform),
    }),
    episodesWatched,
    ...(totalEpisodes !== undefined && { totalEpisodes }),
    ...(currentSeason !== undefined && { currentSeason }),
    ...(currentEpisode !== undefined && { currentEpisode }),
  };
  if (entry.status === "planned" && episodesWatched > 0)
    entry = { ...entry, status: "in_progress", startedAt: entry.createdAt };
  if (totalEpisodes !== undefined && episodesWatched === totalEpisodes)
    entry = { ...entry, status: "completed", completedAt: entry.createdAt };
  return Object.freeze(entry);
}

export function createStudy(input: CreateStudyInput): StudyEntry {
  const progressCurrent = nonnegativeInteger(
    input.progressCurrent,
    "progressCurrent",
  );
  const progressTotal = positiveInteger(input.progressTotal, "progressTotal");
  if (
    input.progressUnit === "percent" &&
    (progressCurrent > 100 ||
      (progressTotal !== undefined && progressTotal !== 100))
  )
    throw new InvalidProgressError(
      "percent usa escala de 0 a 100",
      "progressCurrent",
    );
  if (progressTotal !== undefined && progressCurrent > progressTotal)
    throw new InvalidProgressError(
      "progressCurrent não pode exceder progressTotal",
      "progressCurrent",
    );
  let entry: StudyEntry = {
    ...common("study", input),
    ...(optionalText(input.area) && { area: optionalText(input.area) }),
    ...(optionalText(input.discipline) && {
      discipline: optionalText(input.discipline),
    }),
    ...(optionalText(input.objective) && {
      objective: optionalText(input.objective),
    }),
    progressUnit: input.progressUnit,
    progressCurrent,
    ...(progressTotal !== undefined && { progressTotal }),
    ...(optionalDate(input.deadline, "deadline") && {
      deadline: optionalDate(input.deadline, "deadline"),
    }),
  };
  if (entry.status === "planned" && progressCurrent > 0)
    entry = { ...entry, status: "in_progress", startedAt: entry.createdAt };
  if (progressTotal !== undefined && progressCurrent === progressTotal)
    entry = { ...entry, status: "completed", completedAt: entry.createdAt };
  return Object.freeze(entry);
}

export function createPhysicalActivity(
  input: CreatePhysicalActivityInput,
): PhysicalActivityEntry {
  return Object.freeze({
    ...common("physical_activity", input),
    category: input.category,
    ...(optionalText(input.modality) && {
      modality: optionalText(input.modality),
    }),
    ...(optionalText(input.objective) && {
      objective: optionalText(input.objective),
    }),
  });
}

export function createWork(input: CreateWorkInput): WorkEntry {
  return Object.freeze({
    ...common("work", input),
    ...(optionalText(input.area) && { area: optionalText(input.area) }),
    ...(optionalText(input.organization) && {
      organization: optionalText(input.organization),
    }),
    ...(optionalText(input.description) && {
      description: optionalText(input.description),
    }),
    ...(optionalDate(input.deadline, "deadline") && {
      deadline: optionalDate(input.deadline, "deadline"),
    }),
    ...(optionalText(input.nextAction) && {
      nextAction: optionalText(input.nextAction),
    }),
  });
}

function progressStatus(
  entry: LibraryEntryBase,
  hasProgress: boolean,
  isComplete: boolean,
  updatedAt: string,
): Pick<LibraryEntryBase, "status" | "startedAt" | "completedAt"> {
  const status = isComplete
    ? "completed"
    : entry.status === "planned" && hasProgress
      ? "in_progress"
      : entry.status;
  return {
    status,
    ...(entry.startedAt !== undefined
      ? { startedAt: entry.startedAt }
      : hasProgress
        ? { startedAt: updatedAt }
        : {}),
    ...(status === "completed" ? { completedAt: updatedAt } : {}),
  };
}

export function updateSeriesProgress(
  entry: SeriesEntry,
  input: {
    readonly episodesWatched: number;
    readonly currentSeason?: number;
    readonly currentEpisode?: number;
  },
  updatedAt: string,
): SeriesEntry {
  const timestamp = requireIsoUtc(updatedAt, "updatedAt");
  const episodesWatched = nonnegativeInteger(
    input.episodesWatched,
    "episodesWatched",
  );
  if (
    entry.totalEpisodes !== undefined &&
    episodesWatched > entry.totalEpisodes
  )
    throw new InvalidProgressError(
      "episodesWatched não pode exceder totalEpisodes",
      "episodesWatched",
    );
  const currentSeason = positiveInteger(input.currentSeason, "currentSeason");
  const currentEpisode = positiveInteger(
    input.currentEpisode,
    "currentEpisode",
  );
  return Object.freeze({
    ...entry,
    ...nextMetadata(entry, timestamp),
    ...progressStatus(
      entry,
      episodesWatched > 0,
      entry.totalEpisodes !== undefined &&
        episodesWatched === entry.totalEpisodes,
      timestamp,
    ),
    episodesWatched,
    ...(currentSeason !== undefined && { currentSeason }),
    ...(currentEpisode !== undefined && { currentEpisode }),
  });
}

export function updateStudyProgress(
  entry: StudyEntry,
  progressCurrentInput: number,
  updatedAt: string,
): StudyEntry {
  const timestamp = requireIsoUtc(updatedAt, "updatedAt");
  const progressCurrent = nonnegativeInteger(
    progressCurrentInput,
    "progressCurrent",
  );
  if (entry.progressUnit === "percent" && progressCurrent > 100)
    throw new InvalidProgressError(
      "percent usa escala de 0 a 100",
      "progressCurrent",
    );
  if (
    entry.progressTotal !== undefined &&
    progressCurrent > entry.progressTotal
  )
    throw new InvalidProgressError(
      "progressCurrent não pode exceder progressTotal",
      "progressCurrent",
    );
  return Object.freeze({
    ...entry,
    ...nextMetadata(entry, timestamp),
    ...progressStatus(
      entry,
      progressCurrent > 0,
      entry.progressTotal !== undefined &&
        progressCurrent === entry.progressTotal,
      timestamp,
    ),
    progressCurrent,
  });
}

export function updateLibraryEntryDetails(
  entry: Exclude<LibraryEntry, { readonly type: "book" }>,
  input: UpdateLibraryEntryDetailsInput,
  updatedAt: string,
): Exclude<LibraryEntry, { readonly type: "book" }> {
  const metadata = nextMetadata(entry, updatedAt);
  switch (input.type) {
    case "movie": {
      if (entry.type !== "movie")
        throw new InvalidFieldError("type", "não pode ser alterado");
      return Object.freeze({
        ...entry,
        ...metadata,
        title: requireText(input.title, "title"),
        director: optionalText(input.director),
        year: positiveInteger(input.year, "year"),
        durationMinutes: positiveInteger(
          input.durationMinutes,
          "durationMinutes",
        ),
        platform: optionalText(input.platform),
      });
    }
    case "series": {
      if (entry.type !== "series")
        throw new InvalidFieldError("type", "não pode ser alterado");
      const totalEpisodes = positiveInteger(
        input.totalEpisodes,
        "totalEpisodes",
      );
      if (totalEpisodes !== undefined && entry.episodesWatched > totalEpisodes)
        throw new InvalidProgressError(
          "episodesWatched não pode exceder totalEpisodes",
          "totalEpisodes",
        );
      return Object.freeze({
        ...entry,
        ...metadata,
        title: requireText(input.title, "title"),
        platform: optionalText(input.platform),
        totalEpisodes,
      });
    }
    case "study": {
      if (entry.type !== "study")
        throw new InvalidFieldError("type", "não pode ser alterado");
      const progressTotal = positiveInteger(
        input.progressTotal,
        "progressTotal",
      );
      if (progressTotal !== undefined && entry.progressCurrent > progressTotal)
        throw new InvalidProgressError(
          "progressCurrent não pode exceder progressTotal",
          "progressTotal",
        );
      return Object.freeze({
        ...entry,
        ...metadata,
        title: requireText(input.title, "title"),
        area: optionalText(input.area),
        discipline: optionalText(input.discipline),
        objective: optionalText(input.objective),
        progressUnit: input.progressUnit,
        progressTotal,
        deadline: optionalDate(input.deadline, "deadline"),
      });
    }
    case "physical_activity": {
      if (entry.type !== "physical_activity")
        throw new InvalidFieldError("type", "não pode ser alterado");
      return Object.freeze({
        ...entry,
        ...metadata,
        title: requireText(input.title, "title"),
        category: input.category,
        modality: optionalText(input.modality),
        objective: optionalText(input.objective),
      });
    }
    case "work": {
      if (entry.type !== "work")
        throw new InvalidFieldError("type", "não pode ser alterado");
      return Object.freeze({
        ...entry,
        ...metadata,
        title: requireText(input.title, "title"),
        area: optionalText(input.area),
        organization: optionalText(input.organization),
        description: optionalText(input.description),
        deadline: optionalDate(input.deadline, "deadline"),
        nextAction: optionalText(input.nextAction),
      });
    }
  }
}

export function changeEntryStatus(
  entry: LibraryEntry,
  status: EntryStatus,
  updatedAt: string,
): LibraryEntry {
  if (entry.status === status)
    throw new InvalidStatusTransitionError(
      entry.status,
      status,
      "status já aplicado",
    );
  if (!ALLOWED_TRANSITIONS[entry.status].includes(status))
    throw new InvalidStatusTransitionError(entry.status, status);
  const timestamp = requireIsoUtc(updatedAt, "updatedAt");
  return Object.freeze({
    ...entry,
    ...nextMetadata(entry, timestamp),
    status,
    ...(status === "in_progress" && entry.startedAt === undefined
      ? { startedAt: timestamp }
      : {}),
    ...(status === "completed"
      ? { completedAt: timestamp }
      : { completedAt: undefined }),
  });
}

export function validateCommonEntry(entry: LibraryEntryBase): void {
  validateMetadata(entry);
  requireText(entry.title, "title");
  entry.tagIds.forEach((id) => requireId(id, "tagIds"));
  if (new Set(entry.tagIds).size !== entry.tagIds.length)
    throw new InvalidFieldError("tagIds", "não pode conter duplicatas");
  if (entry.startedAt !== undefined)
    requireIsoUtc(entry.startedAt, "startedAt");
  if (entry.status === "completed") {
    if (entry.completedAt === undefined)
      throw new InvalidFieldError("completedAt", "é obrigatório");
    requireIsoUtc(entry.completedAt, "completedAt");
  } else if (entry.completedAt !== undefined)
    throw new InvalidFieldError("completedAt", "é inesperado");
}

export function getCommonAllowedStatusTransitions(status: EntryStatus) {
  return ALLOWED_TRANSITIONS[status];
}
