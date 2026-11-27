import { lstat, realpath } from "node:fs/promises";
import path from "node:path";

const DEFAULT_EVIDENCE_ROOT = "docs/audits/evidence";

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith(".." + path.sep) && relative !== ".." && !path.isAbsolute(relative));
}

export async function resolveEvidenceFile(file, evidenceRoot = DEFAULT_EVIDENCE_ROOT) {
  const lexicalRoot = path.resolve(evidenceRoot);
  const lexicalTarget = path.resolve(file);

  if (!isInside(lexicalRoot, lexicalTarget) || lexicalTarget === lexicalRoot) {
    throw new Error("Arquivo fora do diretório permitido de evidências.");
  }

  const [realRoot, realTarget, targetInfo] = await Promise.all([
    realpath(lexicalRoot),
    realpath(lexicalTarget),
    lstat(lexicalTarget),
  ]);

  if (!isInside(realRoot, realTarget) || realTarget === realRoot) {
    throw new Error("O caminho resolvido escapa do diretório permitido de evidências.");
  }

  if (targetInfo.isSymbolicLink()) {
    throw new Error("Links simbólicos não são aceitos como arquivos de evidência.");
  }

  if (!targetInfo.isFile()) {
    throw new Error("O caminho informado não é um arquivo regular.");
  }

  return realTarget;
}
