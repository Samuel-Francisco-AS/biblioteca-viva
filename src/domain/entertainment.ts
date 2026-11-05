import { InvalidFieldError } from "./errors";
import { z } from "zod";
import type { EntryStatus, MovieEntry, SeriesEntry } from "./types";

export const ENTERTAINMENT_FORMATS = [
  "film",
  "series",
  "anime",
  "animation",
] as const;
export const formatLabels = {
  film: "Filme",
  series: "Série",
  anime: "Anime",
  animation: "Animação",
} as const;
export const WATCH_STATES = [
  "wishlist",
  "release",
  "watching",
  "paused",
  "completed",
  "abandoned",
  "rewatching",
] as const;
export type WatchState = (typeof WATCH_STATES)[number];
export const watchLabels: Readonly<Record<WatchState, string>> = {
  wishlist: "Quero assistir",
  release: "Aguardando lançamento",
  watching: "Assistindo",
  paused: "Pausado",
  completed: "Concluído",
  abandoned: "Abandonado",
  rewatching: "Reassistindo",
};
/** Calendar dates, never elapsed milliseconds or UTC instants supplied by the device. */
export const civilDateSchema = z.iso.date();
export const catalogSchema = z
  .strictObject({
    format: z.enum(ENTERTAINMENT_FORMATS).optional(),
    wishlist: z.boolean().optional(),
    intent: z.enum(["release", "rewatch"]).optional(),
    releaseDate: civilDateSchema.optional(),
    watchedOn: civilDateSchema.optional(),
    genre: z.string().trim().min(1).max(160).optional(),
    year: z.int().positive().max(9999).optional(),
    rating: z.int().min(1).max(5).optional(),
    seasonCount: z.int().positive().max(10000).optional(),
    completedSeasons: z
      .array(z.int().positive().max(10000))
      .max(10000)
      .refine((v) => new Set(v).size === v.length)
      .optional(),
  })
  .superRefine((v, ctx) => {
    if (
      v.seasonCount !== undefined &&
      v.completedSeasons?.some((n) => n > (v.seasonCount ?? Infinity))
    )
      ctx.addIssue({
        code: "custom",
        path: ["completedSeasons"],
        message: "Temporada excede o total",
      });
  });
export type EntertainmentCatalog = z.infer<typeof catalogSchema>;
export type EntertainmentEntry = MovieEntry | SeriesEntry;
export function isEntertainment(entry: {
  readonly type: string;
}): entry is EntertainmentEntry {
  return entry.type === "movie" || entry.type === "series";
}
export function entertainmentFormat(entry: EntertainmentEntry) {
  return entry.catalog?.format ?? (entry.type === "movie" ? "film" : "series");
}
export function localCivilDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function releaseDays(
  date: string | undefined,
  today = localCivilDate(),
): number | undefined {
  if (
    !date ||
    !civilDateSchema.safeParse(date).success ||
    !civilDateSchema.safeParse(today).success
  )
    return undefined;
  return Math.round(
    (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) /
      86400000,
  );
}
export function watchState(entry: EntertainmentEntry): WatchState {
  if (entry.status === "planned")
    return entry.catalog?.intent === "release" ? "release" : "wishlist";
  if (entry.status === "in_progress")
    return entry.catalog?.intent === "rewatch" ? "rewatching" : "watching";
  return entry.status;
}
export function statusForWatch(state: WatchState): EntryStatus {
  if (state === "wishlist" || state === "release") return "planned";
  if (state === "watching" || state === "rewatching") return "in_progress";
  return state;
}
export function catalogForWatch(
  catalog: EntertainmentCatalog,
  state: WatchState,
): EntertainmentCatalog {
  return {
    ...catalog,
    intent:
      state === "release"
        ? "release"
        : state === "rewatching"
          ? "rewatch"
          : undefined,
  };
}
export function isWishlisted(entry: EntertainmentEntry): boolean {
  return entry.catalog?.wishlist ?? entry.status === "planned";
}

export function catalogForStructure(
  catalog: EntertainmentCatalog,
  type: "movie" | "series",
): EntertainmentCatalog {
  const parsed = catalogSchema.parse(catalog);
  if (
    (type === "movie" && parsed.format === "series") ||
    (type === "series" && parsed.format === "film")
  )
    throw new InvalidFieldError(
      "catalog.format",
      "não corresponde à estrutura da obra",
    );
  return Object.freeze({
    ...parsed,
    ...(parsed.completedSeasons && {
      completedSeasons: [...parsed.completedSeasons],
    }),
  });
}
