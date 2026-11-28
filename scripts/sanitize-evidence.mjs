#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { sanitizeText } from "./evidence-privacy.mjs";
import { resolveEvidenceFile } from "./evidence-paths.mjs";

const TEXT_EXTENSIONS = new Set([
  ".txt",
  ".md",
  ".json",
  ".log",
  ".csv",
  ".xml",
  ".yaml",
  ".yml",
]);
const ROOT = "docs/audits/evidence";

function trackedEvidenceFiles() {
  const output = execFileSync("git", ["ls-files", "-z", "--", ROOT + "/"], {
    encoding: "utf8",
  });
  return output
    .split("\0")
    .filter(Boolean)
    .filter((file) => TEXT_EXTENSIONS.has(path.extname(file).toLowerCase()));
}

const requested = process.argv.slice(2);
const files = requested.length ? requested : trackedEvidenceFiles();

let changed = 0;
for (const file of files) {
  if (!TEXT_EXTENSIONS.has(path.extname(file).toLowerCase())) {
    throw new Error(
      "O sanitizador aceita apenas arquivos de texto dentro de docs/audits/evidence/.",
    );
  }

  const safePath = await resolveEvidenceFile(file, ROOT);
  const before = await readFile(safePath, "utf8");
  const after = sanitizeText(before);
  if (after !== before) {
    await writeFile(safePath, after, "utf8");
    changed += 1;
    process.stdout.write("Sanitizado: " + file + "\n");
  }
}

process.stdout.write(
  "Concluído: " +
    files.length +
    " arquivo(s) verificado(s), " +
    changed +
    " alterado(s).\n",
);
