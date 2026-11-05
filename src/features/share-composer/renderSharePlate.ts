import type { PngArtifact } from "../../application/imageFiles";
import { posterSchema } from "../../infrastructure/database/media";
import { readDataUrl } from "../../infrastructure/files/localImage";
import { imageHeight, type CompositionStyle } from "./composition";
interface PlateContent {
  readonly title: string;
  readonly eyebrow: string;
  readonly caption?: string;
  readonly text: string;
  readonly message?: string;
  readonly name: string;
}
/** A dedicated offline plate. Never captures the UI, identifiers or private notes. */
export async function renderSharePlate(
  content: PlateContent,
  options: CompositionStyle,
): Promise<PngArtifact> {
  await document.fonts?.ready;
  const canvas = document.createElement("canvas");
  const w = 1080,
    h = imageHeight(options.aspect);
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
  if (options.background) {
    ctx.fillStyle = `rgba(14,10,22,${Math.max(0, Math.min(0.8, options.darkness ?? 0.25))})`;
    ctx.fillRect(0, 0, w, h);
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
  if (options.layout === "folio") {
    ctx.fillStyle = "rgba(250,239,218,.96)";
    ctx.fillRect(72, h * 0.33, w - 144, h * 0.57);
  }
  if (options.frame !== "none") {
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
  }
  if (options.frame === "lunar") {
    ctx.strokeStyle = "#dcc5a0";
    for (const y of [h * 0.22, h - 165]) {
      ctx.beginPath();
      ctx.arc(540, y, 42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(552, y - 9, 34, 0.3, Math.PI * 1.6);
      ctx.stroke();
    }
  }
  const alignment =
    options.alignment ?? (options.layout === "premiere" ? "center" : "left");
  const centered = alignment === "center";
  const ink = options.layout === "folio" ? "#392739" : "#fff3df";
  const accent = options.layout === "folio" ? "#725360" : "#e2bc8e";
  const textTop = options.position === "middle" ? h * 0.36 : h * 0.46;
  ctx.textAlign = alignment;
  const x = centered ? 540 : alignment === "right" ? 980 : 100,
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
      for (const paragraph of text.split(/\r?\n/)) {
        let line = "";
        for (const char of paragraph.replace(/\s+/g, " ").trim()) {
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
        lines.push(line);
      }
      if (lines.length * size * 1.22 <= maxHeight) break;
      size -= 2;
    }
    if (size < 28)
      throw new Error(
        "Texto longo demais para um banner legível. Reduza a mensagem ou o título.",
      );
    ctx.fillStyle = ink;
    lines.forEach((line, i) => ctx.fillText(line, x, y + i * size * 1.22));
    return y + lines.length * size * 1.22;
  }
  ctx.textAlign = "center";
  ctx.fillStyle = "#f4dcc0";
  ctx.font = "22px sans-serif";
  ctx.fillText("B I B L I O T E C A   V I V A", 540, 113);
  ctx.textAlign = alignment;
  ctx.fillStyle = accent;
  ctx.font = "24px sans-serif";
  ctx.fillText(content.eyebrow.toLocaleUpperCase("pt-BR"), x, textTop);
  const titleEnd = block(
    options.title ?? content.title,
    textTop + 70,
    68,
    h * 0.16,
  );
  const lineY = Math.max(titleEnd + 12, textTop + h * 0.16);
  ctx.fillStyle = accent;
  ctx.fillRect(
    centered ? 460 : alignment === "right" ? 820 : 100,
    lineY,
    160,
    2,
  );
  if (content.caption) {
    ctx.fillStyle = accent;
    ctx.font = "24px sans-serif";
    ctx.fillText(content.caption, x, lineY + 44, maxWidth);
  }
  const message = [content.text, content.message].filter(Boolean).join("\n\n");
  block(message, lineY + 100, 38, h - lineY - 220, false);
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
    name: content.name,
  };
}
