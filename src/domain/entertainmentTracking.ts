import { InvalidFieldError } from "./errors";
import { updateSeriesProgress } from "./libraryEntries";
import { nextMetadata } from "./validation";
import {
  catalogForStructure,
  catalogForWatch,
  statusForWatch,
  type EntertainmentCatalog,
  type EntertainmentEntry,
  type WatchState,
} from "./entertainment";
export interface EntertainmentTrackingInput {
  readonly catalog?: EntertainmentCatalog;
  readonly state?: WatchState;
  readonly episodesWatched?: number;
  readonly currentSeason?: number;
  readonly currentEpisode?: number;
}
/** Entertainment-specific state vocabulary; global lifecycle transitions remain unchanged. */
export function updateEntertainmentTracking(
  entry: EntertainmentEntry,
  input: EntertainmentTrackingInput,
  now: string,
): EntertainmentEntry {
  let result: EntertainmentEntry = {
    ...entry,
    ...nextMetadata(entry, now),
    ...(input.catalog && {
      catalog: catalogForStructure(input.catalog, entry.type),
    }),
  };
  if (input.episodesWatched !== undefined) {
    if (result.type !== "series")
      throw new InvalidFieldError("episodesWatched", "exige obra episódica");
    result = {
      ...updateSeriesProgress(
        result,
        {
          episodesWatched: input.episodesWatched,
          currentSeason: input.currentSeason,
          currentEpisode: input.currentEpisode,
        },
        now,
      ),
      revision: entry.revision + 1,
    };
    if (
      result.catalog?.seasonCount !== undefined &&
      (result.currentSeason ?? 0) > result.catalog.seasonCount
    )
      throw new InvalidFieldError(
        "currentSeason",
        "excede o total de temporadas",
      );
  }
  if (input.state !== undefined) {
    const status = statusForWatch(input.state);
    result = {
      ...result,
      status,
      catalog: catalogForWatch(result.catalog ?? {}, input.state),
      ...(status === "in_progress" && !entry.startedAt && { startedAt: now }),
      completedAt:
        status === "completed" ? (entry.completedAt ?? now) : undefined,
    };
  }
  return Object.freeze(result);
}
