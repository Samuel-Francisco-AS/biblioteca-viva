import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";

const outputDirectory = "dist";
const manifestPath = join(outputDirectory, ".vite", "manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const entries = Object.entries(manifest);
const applicationEntry = entries.find(([, chunk]) => chunk.isEntry);
const phaserEntry = entries.find(([source]) =>
  source.endsWith("/phaser/createPhaserGame.ts"),
);

if (!applicationEntry)
  throw new Error("Chunk inicial não encontrado no manifesto.");
if (!phaserEntry)
  throw new Error("Chunk lazy do Phaser não encontrado no manifesto.");
if (phaserEntry[1].isEntry)
  throw new Error("O Phaser foi incluído como entrypoint inicial.");
if (!phaserEntry[1].isDynamicEntry)
  throw new Error("A fronteira lazy do Phaser não foi preservada.");

const chunks = await Promise.all(
  entries
    .filter(
      ([, chunk]) => chunk.file.endsWith(".js") || chunk.file.endsWith(".css"),
    )
    .map(async ([source, chunk]) => ({
      bytes: (await stat(join(outputDirectory, chunk.file))).size,
      dynamic: Boolean(chunk.isDynamicEntry),
      file: chunk.file,
      initial: Boolean(chunk.isEntry),
      source,
    })),
);

chunks.sort((left, right) => right.bytes - left.bytes);
process.stdout.write(
  `${JSON.stringify({ chunks, phaserLazy: true }, null, 2)}\n`,
);
