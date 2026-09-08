import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";

const outputDirectory = "dist";
const manifestPath = join(outputDirectory, ".vite", "manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const entries = Object.entries(manifest);
const applicationEntry = entries.find(([, chunk]) => chunk.isEntry);

if (!applicationEntry)
  throw new Error("Chunk inicial não encontrado no manifesto.");

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
const initialBytes = chunks
  .filter(({ initial }) => initial)
  .reduce((total, chunk) => total + chunk.bytes, 0);
process.stdout.write(`${JSON.stringify({ chunks, initialBytes }, null, 2)}\n`);
