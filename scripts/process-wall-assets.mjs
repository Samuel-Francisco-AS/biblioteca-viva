import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = resolve(root, "art-source/world/architecture/walls");
const runtimeDirectory = resolve(
  root,
  "public/assets/world/architecture/walls",
);

const assets = [
  ["wall-corner-ne.png", "1248x1182", "1200x1134+0+0"],
  ["wall-corner-nw.png", "1218x1248", "1170x1200+0+0"],
  ["wall-corner-se.png", "1248x1170", "1200x1122+0+0"],
  ["wall-corner-sw.png", "1248x1157", "1200x1109+0+0"],
  ["wall-door-horizontal-closed.png", "1248x612", "1200x564+0+0"],
  ["wall-door-horizontal-open.png", "1248x788", "1200x740+0+0"],
  ["wall-horizontal-1cell.png", "348x477", "300x429+0+0"],
  ["wall-horizontal-2cell.png", "648x477", "600x429+0+0"],
  ["wall-horizontal.png", "1248x477", "1200x429+0+0"],
  ["wall-vertical-1cell.png", "284x348", "235x300+0+0"],
  ["wall-vertical-2cell.png", "284x648", "235x600+0+0"],
  ["wall-vertical.png", "284x1248", "236x1200+0+0"],
];

const checkOnly = process.argv.includes("--check");

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0)
    throw new Error(result.stderr.trim() || `${command} falhou.`);
  return result.stdout.trim();
}

function inspect(file) {
  const metadata = run("magick", [
    "identify",
    "-format",
    "%wx%h|%[channels]|%[fx:minima.a]|%[fx:maxima.a]",
    file,
  ]).split("|");
  const alphaBounds = run("magick", [
    file,
    "-alpha",
    "extract",
    "-trim",
    "-format",
    "%@",
    "info:",
  ]);
  return {
    alphaBounds,
    alphaMaximum: Number(metadata[3]),
    alphaMinimum: Number(metadata[2]),
    channels: metadata[1],
    dimensions: metadata[0],
  };
}

function validate(file, expectedDimensions, expectedAlphaBounds) {
  if (!existsSync(file)) throw new Error(`Asset ausente: ${file}`);
  const result = inspect(file);
  if (result.dimensions !== expectedDimensions)
    throw new Error(`Dimensão inesperada em ${file}: ${result.dimensions}`);
  if (!result.channels.includes("a"))
    throw new Error(`Canal alpha ausente em ${file}.`);
  if (result.alphaMinimum !== 0 || result.alphaMaximum !== 1)
    throw new Error(`Alpha inválido em ${file}.`);
  if (result.alphaBounds !== expectedAlphaBounds)
    throw new Error(
      `Padding/bounds inesperado em ${file}: ${result.alphaBounds}`,
    );
}

mkdirSync(runtimeDirectory, { recursive: true });
for (const [name, dimensions, alphaBounds] of assets) {
  const source = resolve(sourceDirectory, name);
  const runtime = resolve(runtimeDirectory, name);
  validate(source, dimensions, alphaBounds);
  if (!checkOnly) {
    // PNG32 preserves real RGBA and strips only transport metadata. No source is
    // modified and no flood-fill is applied: inspection found no border-connected
    // technical background to remove safely.
    run("magick", [
      source,
      "-strip",
      "-define",
      "png:color-type=6",
      `PNG32:${runtime}`,
    ]);
  }
  validate(runtime, dimensions, alphaBounds);
}

process.stdout.write(
  `${checkOnly ? "Validated" : "Processed and validated"} ${assets.length} wall PNGs.\n`,
);
