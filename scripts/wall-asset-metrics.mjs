import { spawnSync } from "node:child_process";

export function runImageMagick(args) {
  const result = spawnSync("magick", args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || "ImageMagick falhou.");
  }
  return result.stdout.trim();
}

export function parseImageGeometry(value) {
  const match = /^(\d+)x(\d+)([+-]\d+)([+-]\d+)$/.exec(value);
  if (!match) throw new Error(`Geometria ImageMagick inválida: ${value}`);
  return {
    height: Number(match[2]),
    width: Number(match[1]),
    x: Number(match[3]),
    y: Number(match[4]),
  };
}

export function formatImageGeometry({ height, width, x, y }) {
  const signed = (value) => `${value >= 0 ? "+" : ""}${value}`;
  return `${width}x${height}${signed(x)}${signed(y)}`;
}

export function derivePadding(canvas, bounds) {
  const padding = {
    bottom: canvas.height - bounds.y - bounds.height,
    left: bounds.x,
    right: canvas.width - bounds.x - bounds.width,
    top: bounds.y,
  };
  if (Object.values(padding).some((value) => value < 0)) {
    throw new Error(
      `Bounding box ${formatImageGeometry(bounds)} excede o canvas ${canvas.width}x${canvas.height}.`,
    );
  }
  return padding;
}

export function inspectPng(file) {
  const metadata = runImageMagick([
    "identify",
    "-format",
    "%m|%wx%h|%[channels]|%[fx:minima.a]|%[fx:maxima.a]|%[colorspace]|%z|%[type]",
    file,
  ]).split("|");
  const alphaBounds = parseImageGeometry(
    runImageMagick([file, "-alpha", "extract", "-format", "%@", "info:"]),
  );
  const dimensions = metadata[1]?.split("x").map(Number);
  if (!dimensions || dimensions.length !== 2) {
    throw new Error(`Dimensão PNG inválida em ${file}.`);
  }
  const canvas = { height: dimensions[1], width: dimensions[0] };
  return {
    alphaBounds,
    alphaMaximum: Number(metadata[4]),
    alphaMinimum: Number(metadata[3]),
    bitDepth: Number(metadata[6]),
    canvas,
    channels: metadata[2] ?? "",
    colorSpace: metadata[5] ?? "",
    format: metadata[0] ?? "",
    imageType: metadata[7] ?? "",
    padding: derivePadding(canvas, alphaBounds),
  };
}

export function maximumAlphaOutsideRectangles(file, rectangles) {
  const eraseAllowedArea = rectangles
    .map(({ height, width, x, y }) => {
      const right = x + width - 1;
      const bottom = y + height - 1;
      return `rectangle ${x},${y} ${right},${bottom}`;
    })
    .join(" ");
  return Number(
    runImageMagick([
      file,
      "-alpha",
      "extract",
      "-fill",
      "black",
      "-draw",
      eraseAllowedArea,
      "-format",
      "%[fx:maxima.r]",
      "info:",
    ]),
  );
}

/** Read-only scanline support check; this deliberately does no segmentation. */
export function countAlphaUnsupportedRows(file, rectangle) {
  const { height, width, x, y } = rectangle;
  if (
    ![height, width, x, y].every(Number.isSafeInteger) ||
    height <= 0 ||
    width <= 0
  ) {
    throw new Error(`Faixa de suporte alpha inválida em ${file}.`);
  }
  const output = runImageMagick([
    file,
    "-crop",
    `${width}x${height}+${x}+${y}`,
    "+repage",
    "-alpha",
    "extract",
    "-threshold",
    "0",
    "-filter",
    "box",
    "-resize",
    `1x${height}!`,
    "-depth",
    "8",
    "txt:-",
  ]);
  const rows = output.split("\n").flatMap((line) => {
    const match = /^0,(\d+): \((\d+)/u.exec(line);
    return match ? [{ alpha: Number(match[2]), y: Number(match[1]) }] : [];
  });
  if (rows.length !== height || rows.some((row, index) => row.y !== index)) {
    throw new Error(`Leitura de suporte alpha incompleta em ${file}.`);
  }
  return rows.filter(({ alpha }) => alpha === 0).length;
}
