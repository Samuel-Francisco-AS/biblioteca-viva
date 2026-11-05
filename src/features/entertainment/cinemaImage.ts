import type { PngArtifact } from "../../application/imageFiles";
import {
  entertainmentFormat,
  formatLabels,
  releaseDays,
  type EntertainmentEntry,
} from "../../domain/entertainment";
import { posterSchema } from "../../infrastructure/database/media";
import { readDataUrl } from "../../infrastructure/files/localImage";
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
export interface CinemaComposition {
  readonly mode: (typeof BANNER_MODES)[number];
  readonly aspect: "post" | "story";
  readonly layout: "nocturne" | "premiere";
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
/** Dedicated graphic composition. No DOM screenshot, remote source, annotations or app identifiers. */
export async function createCinemaImage(
  entry: EntertainmentEntry,
  options: CinemaComposition,
): Promise<PngArtifact> {
  await document.fonts?.ready;
  const canvas = document.createElement("canvas");
  const w = 1080,
    h = options.aspect === "story" ? 1920 : 1350;
  canvas.width = w;
  canvas.height = h;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas indisponível neste dispositivo.");
  const ctx = context;
  ctx.fillStyle = "#211525";
  ctx.fillRect(0, 0, w, h);
  if (options.background) {
    // Validate a bounded local JPEG again, including actual dimensions from its header.
    const background = posterSchema.parse({
      entryId: "preview",
      ...options.background,
    });
    const image = new Image();
    image.src = background.dataUrl;
    await image.decode();
    const scale = Math.max(w / image.width, h / image.height);
    const dw = image.width * scale,
      dh = image.height * scale;
    ctx.drawImage(image, (w - dw) / 2, (h - dh) / 2, dw, dh);
  } else {
    const glow = ctx.createRadialGradient(
      760,
      h * 0.22,
      20,
      560,
      h * 0.4,
      h * 0.8,
    );
    glow.addColorStop(0, "#905d72");
    glow.addColorStop(0.38, "#493248");
    glow.addColorStop(1, "#151320");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    // Original engraved orrery, part of the local composition rather than an external illustration.
    ctx.save();
    ctx.translate(540, h * 0.3);
    ctx.rotate(-0.35);
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse(0, 0, 190 + i * 56, 260 + i * 30, i * 0.36, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(226,181,131,${0.24 - i * 0.03})`;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    ctx.restore();
  }
  const veil = ctx.createLinearGradient(0, 0, 0, h);
  veil.addColorStop(0, "rgba(14,10,22,.48)");
  veil.addColorStop(0.27, "rgba(22,10,29,.12)");
  veil.addColorStop(0.5, "rgba(22,10,29,.76)");
  veil.addColorStop(0.72, "rgba(22,10,29,.96)");
  veil.addColorStop(1, "#140e1c");
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, w, h);
  // Fine dust and restrained copper engravings, reproducible in every PNG.
  for (let i = 0; i < 190; i++) {
    const x = (i * 7919 + 73) % w,
      y = (i * 3571 + 29) % h;
    ctx.fillStyle =
      i % 7 === 0 ? "rgba(245,218,174,.6)" : "rgba(245,218,174,.17)";
    ctx.fillRect(x, y, i % 7 === 0 ? 2 : 1, i % 7 === 0 ? 2 : 1);
  }
  ctx.strokeStyle = "#bb986f";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(38, 38, w - 76, h - 76);
  ctx.strokeStyle = "rgba(187,152,111,.45)";
  ctx.strokeRect(49, 49, w - 98, h - 98);
  for (const [x, y, sx, sy] of [
    [70, 70, 1, 1],
    [1010, 70, -1, 1],
    [70, h - 70, 1, -1],
    [1010, h - 70, -1, -1],
  ]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sx, sy);
    ctx.strokeStyle = "#d9b88d";
    ctx.beginPath();
    ctx.moveTo(0, 62);
    ctx.lineTo(0, 0);
    ctx.lineTo(62, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, 27);
    ctx.quadraticCurveTo(34, 32, 27, 8);
    ctx.stroke();
    ctx.restore();
  }
  const centered = options.layout === "premiere";
  ctx.textAlign = centered ? "center" : "left";
  const x = centered ? 540 : 100,
    maxWidth = 880;
  function block(
    text: string,
    y: number,
    size: number,
    maxHeight: number,
    serif = true,
  ) {
    let lines: string[] = [];
    while (size >= 28) {
      ctx.font = `${serif ? "" : "500 "}${size}px ${serif ? "Georgia, serif" : "sans-serif"}`;
      lines = [];
      let line = "";
      for (const char of text.replace(/\s+/g, " ").trim()) {
        if (ctx.measureText(line + char).width > maxWidth) {
          const split = line.lastIndexOf(" ");
          if (split > line.length / 2) {
            lines.push(line.slice(0, split));
            line = line.slice(split + 1) + char;
          } else {
            lines.push(line);
            line = char;
          }
        } else line += char;
      }
      if (line) lines.push(line);
      if (lines.length * size * 1.22 <= maxHeight) break;
      size -= 2;
    }
    if (size < 28)
      throw new Error(
        "Texto longo demais para um banner legível. Reduza a mensagem ou o título.",
      );
    ctx.fillStyle = "#fff3df";
    lines.forEach((line, i) => ctx.fillText(line, x, y + i * size * 1.22));
    return y + lines.length * size * 1.22;
  }
  ctx.textAlign = "center";
  ctx.fillStyle = "#f4dcc0";
  ctx.font = "22px sans-serif";
  ctx.fillText("B I B L I O T E C A   V I V A", 540, 113);
  ctx.textAlign = centered ? "center" : "left";
  ctx.fillStyle = "#e2bc8e";
  ctx.font = "24px sans-serif";
  ctx.fillText(
    `${formatLabels[entertainmentFormat(entry)].toLocaleUpperCase("pt-BR")}  /  ${bannerModeLabels[options.mode].toLocaleUpperCase("pt-BR")}`,
    x,
    h * 0.46,
  );
  const titleEnd = block(entry.title, h * 0.46 + 100, 82, h * 0.22);
  const lineY = Math.max(titleEnd + 26, h * 0.69);
  ctx.fillStyle = "#caa170";
  ctx.fillRect(centered ? 460 : 100, lineY, 160, 2);
  let caption = "";
  if (options.mode === "release" && entry.catalog?.releaseDate) {
    const days = releaseDays(entry.catalog.releaseDate, options.today);
    const date = entry.catalog.releaseDate.split("-").reverse().join(".");
    caption = `ESTREIA ${date}${days === 0 ? "  ·  HOJE" : days !== undefined && days > 0 ? `  ·  ${days} DIAS` : ""}`;
  } else if (options.mode === "progress" && entry.type === "series") {
    caption = `${entry.episodesWatched}${entry.totalEpisodes ? ` / ${entry.totalEpisodes}` : ""} EPISÓDIOS${entry.currentSeason ? `  ·  T${entry.currentSeason}` : ""}${entry.currentEpisode ? ` E${entry.currentEpisode}` : ""}`;
  } else if (options.mode === "recommendation" && entry.catalog?.rating)
    caption = `${"★".repeat(entry.catalog.rating)}${"☆".repeat(5 - entry.catalog.rating)}  ·  MINHA AVALIAÇÃO`;
  if (caption) {
    ctx.fillStyle = "#e2bc8e";
    ctx.font = "24px sans-serif";
    ctx.fillText(caption, x, lineY + 60, maxWidth);
  }
  block(options.message, lineY + 120, 38, h - lineY - 240, false);
  ctx.textAlign = "center";
  ctx.fillStyle = "#c5a989";
  ctx.font = "19px sans-serif";
  ctx.fillText("✧   O CÓDICE ILUMINADO   ✧", 540, h - 94);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) =>
        b ? resolve(b) : reject(new Error("Não foi possível gerar o PNG.")),
      "image/png",
    ),
  );
  return {
    dataUrl: await readDataUrl(blob),
    name: "biblioteca-viva-cinema.png",
  };
}
