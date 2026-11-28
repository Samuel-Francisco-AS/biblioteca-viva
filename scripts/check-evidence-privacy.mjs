#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { resolveEvidenceFile } from "./evidence-paths.mjs";

const ROOT = "docs/audits/evidence";
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
const RULES = [
  [
    "caminho local Linux/macOS",
    /(?:^|[\s"'=(])\/(?:home|Users|mnt|tmp)\/[^\s"'<>]+/im,
  ],
  [
    "caminho local Windows",
    /\b[A-Za-z]:\\(?:Users|Documents and Settings)\\[^\s"'<>]+/i,
  ],
  [
    "URI file:// local",
    /file:\/\/(?:\/|localhost\/)(?:home|Users|mnt|tmp)\/[^\s"'<>]+/i,
  ],
  [
    "endereço de e-mail",
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  ],
  ["CPF formatado", /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/],
  [
    "telefone brasileiro formatado",
    /(?:\+55\s*)?\(?\d{2}\)?\s*9?\d{4}[-. ]\d{4}\b/,
  ],
  ["token GitHub", /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/],
  ["chave AWS", /\bAKIA[0-9A-Z]{16}\b/],
  ["chave privada PEM", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
];

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
const findings = [];

for (const file of files) {
  if (!TEXT_EXTENSIONS.has(path.extname(file).toLowerCase())) {
    throw new Error("Fora do escopo permitido: " + file);
  }

  const safePath = await resolveEvidenceFile(file, ROOT);
  const content = await readFile(safePath, "utf8");
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const [label, pattern] of RULES) {
      if (pattern.test(line)) {
        findings.push({ file, line: index + 1, label });
      }
    }
  });
}

if (findings.length) {
  process.stderr.write("Possíveis dados pessoais/segredos em evidências:\n");
  for (const item of findings) {
    process.stderr.write(
      "- " + item.file + ":" + item.line + ": " + item.label + "\n",
    );
  }
  process.stderr.write(
    "Revise o conteúdo; não copie dados sensíveis para logs ou mensagens.\n",
  );
  process.exitCode = 1;
} else {
  process.stdout.write(
    "Privacidade das evidências: PASS (" +
      files.length +
      " arquivo(s) de texto).\n",
  );
}
