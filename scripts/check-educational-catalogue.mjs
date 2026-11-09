import { URL } from "node:url";
import { Buffer } from "node:buffer";
import process from "node:process";
import { log } from "node:console";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const root = new URL("../src/infrastructure/packs/", import.meta.url);
const hash = (s) => createHash("sha256").update(s).digest("hex");
const pins = {};
for (const version of [1, 2]) {
  const raw = await readFile(
    new URL(`content/matematica-original-v${version}.json`, root),
  );
  pins[String(version)] = hash(raw);
  const envelope = JSON.parse(raw.toString("utf8"));
  for (const lot of envelope.manifest.lots) {
    const bytes = Buffer.from(envelope.files[lot.path], "utf8");
    if (hash(bytes) !== lot.sha256 || bytes.length !== lot.bytes)
      throw new Error(`Lote ${lot.id}: hash/tamanho divergente.`);
  }
}
const target = new URL("contentHashes.json", root);
if (process.argv.includes("--write"))
  await writeFile(target, JSON.stringify(pins, null, 2) + "\n");
else {
  const expected = JSON.parse(await readFile(target, "utf8"));
  if (JSON.stringify(expected) !== JSON.stringify(pins))
    throw new Error(
      "Hashes fixados divergem. Formate o conteúdo, revise a edição e atualize os pins com --write.",
    );
}
log("Pacotes locais: bytes, lotes e hashes fixados conferidos.");
