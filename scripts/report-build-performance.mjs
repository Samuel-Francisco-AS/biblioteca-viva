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
// Count the initial static import graph and CSS exactly once. Dynamic imports
// are separate payloads, even when the initial route soon requests the world.
const initialFiles = new Set();
const visited = new Set();
function collect(source) {
  if (visited.has(source)) return;
  visited.add(source);
  const chunk = manifest[source];
  if (!chunk) return;
  initialFiles.add(chunk.file);
  for (const css of chunk.css ?? []) initialFiles.add(css);
  for (const dependency of chunk.imports ?? []) collect(dependency);
}
collect(applicationEntry[0]);
const initialStaticGraph = await Promise.all(
  [...initialFiles].sort().map(async (file) => ({
    file,
    bytes: (await stat(join(outputDirectory, file))).size,
  })),
);
const initialStaticGraphBytes = initialStaticGraph.reduce(
  (sum, file) => sum + file.bytes,
  0,
);
process.stdout.write(
  `${JSON.stringify({ measurementScope: "Static bundle bytes; no CPU, GPU, presentation or Android FPS measurement", chunks, initialBytes, initialStaticGraphBytes, initialStaticGraph }, null, 2)}\n`,
);
