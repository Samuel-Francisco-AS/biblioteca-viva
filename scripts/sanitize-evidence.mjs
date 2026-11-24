#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const TEXT_EXTENSIONS = new Set([".txt", ".md", ".json", ".log", ".csv", ".xml", ".yaml", ".yml"]);
const ROOT = "docs/audits/evidence/";

import { sanitizeText } from "./evidence-privacy.mjs";

function trackedEvidenceFiles() {
  const output = execFileSync("git", ["ls-files", "-z", "--", ROOT], { encoding: "utf8" });
  return output.split("\0").filter(Boolean).filter((file) => TEXT_EXTENSIONS.has(path.extname(file).toLowerCase()));
}

const requested = process.argv.slice(2);
const files = requested.length ? requested : trackedEvidenceFiles();
if (files.some((file) => !file.startsWith(ROOT) || !TEXT_EXTENSIONS.has(path.extname(file).toLowerCase()))) {
  throw new Error("O sanitizador aceita apenas arquivos de texto dentro de docs/audits/evidence/.");
}

let changed = 0;
for (const file of files) {
  const before = await readFile(file, "utf8");
  const after = sanitizeText(before);
  if (after !== before) {
    await writeFile(file, after, "utf8");
    changed += 1;
    process.stdout.write(`Sanitizado: ${file}\n`);
  }
}
process.stdout.write(`Concluído: ${files.length} arquivo(s) verificado(s), ${changed} alterado(s).\n`);
