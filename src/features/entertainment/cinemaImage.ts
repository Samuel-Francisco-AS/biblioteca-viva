import type { PngArtifact } from "../../application/imageFiles";
import {
  entertainmentFormat,
  formatLabels,
  releaseDays,
  type EntertainmentEntry,
} from "../../domain/entertainment";
import { renderSharePlate } from "../share-composer/renderSharePlate";
import type { CompositionStyle } from "../share-composer/composition";
export const BANNER_MODES = [
  "release",
  "wishlist",
  "progress",
  "recommendation",
] as const;
export const bannerModeLabels = {
  release: "Lançamento",
  wishlist: "Lista de desejos",
  progress: "Acompanhamento",
  recommendation: "Conclusão / recomendação",
} as const;
export interface CinemaComposition extends CompositionStyle {
  readonly mode: (typeof BANNER_MODES)[number];
  readonly message: string;
  readonly background?: {
    readonly dataUrl: string;
    readonly width: number;
    readonly height: number;
  };
  readonly today: string;
}
export function defaultBannerMessage(
  mode: CinemaComposition["mode"],
  entry: EntertainmentEntry,
  today: string,
): string {
  const days = releaseDays(entry.catalog?.releaseDate, today);
  if (mode === "release")
    return days === undefined
      ? "Uma nova história se aproxima"
      : days > 0
        ? `Faltam ${days} dias para a estreia!`
        : days === 0
          ? "A estreia é hoje!"
          : "Uma estreia para lembrar";
  if (mode === "wishlist") return "Na minha lista de desejos";
  if (mode === "progress") return "Só mais um capítulo…";
  return "Uma história que fica comigo";
}
export async function createCinemaImage(
  entry: EntertainmentEntry,
  options: CinemaComposition,
): Promise<PngArtifact> {
  let caption = "";
  if (options.mode === "release" && entry.catalog?.releaseDate) {
    const days = releaseDays(entry.catalog.releaseDate, options.today);
    const date = entry.catalog.releaseDate.split("-").reverse().join(".");
    caption = `ESTREIA ${date}${days === 0 ? "  ·  HOJE" : days !== undefined && days > 0 ? `  ·  ${days} DIAS` : ""}`;
  } else if (options.mode === "progress" && entry.type === "series") {
    caption = `${entry.episodesWatched}${entry.totalEpisodes ? ` / ${entry.totalEpisodes}` : ""} EPISÓDIOS${entry.currentSeason ? `  ·  T${entry.currentSeason}` : ""}${entry.currentEpisode ? ` E${entry.currentEpisode}` : ""}`;
  } else if (options.mode === "recommendation" && entry.catalog?.rating)
    caption = `${"★".repeat(entry.catalog.rating)}${"☆".repeat(5 - entry.catalog.rating)}  ·  MINHA AVALIAÇÃO`;
  return renderSharePlate(
    {
      title: entry.title,
      eyebrow: `${formatLabels[entertainmentFormat(entry)]} / ${bannerModeLabels[options.mode]}`,
      caption,
      text: options.message,
      name: "biblioteca-viva-cinema.png",
    },
    options,
  );
}
