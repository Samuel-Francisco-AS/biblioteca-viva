import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { sanitizeText } from "./evidence-privacy.mjs";
import { resolveEvidenceFile } from "./evidence-paths.mjs";

test("substitui caminhos Linux do repositório e do laboratório", () => {
  const input =
    "Repo: /home/sam/Projetos/biblioteca-viva/src/main.tsx\n" +
    "Lab: /home/sam/Projetos/bv-f4-lab/capture.png";

  assert.equal(
    sanitizeText(input),
    "Repo: <repo-root>/src/main.tsx\nLab: <lab-root>/capture.png",
  );
});

test("remove prefixos relativos antes de caminhos absolutos locais", () => {\n  const input =\n    "../../home/sam/Projetos/biblioteca-viva/node_modules/pkg/index.js " +\n    "../..//home/sam/Projetos/bv-f4-lab/assets/item.glb";\n\n  assert.equal(\n    sanitizeText(input),\n    "<repo-root>/node_modules/pkg/index.js <lab-root>/assets/item.glb",\n  );\n});\n\ntest("substitui caminhos temporários Linux sem perder o contexto restante", () => {
  const input =
    "RUN  v4.1.10 /tmp/bv-audit-worktree\n" +
    "writeFileSync('/tmp/bv-audit-worktree-metrics.json')\n" +
    "outDir /tmp/bv-audit-dist";

  assert.equal(
    sanitizeText(input),
    "RUN  v4.1.10 <tmp-root>/bv-audit-worktree\n" +
      "writeFileSync('<tmp-root>/bv-audit-worktree-metrics.json')\n" +
      "outDir <tmp-root>/bv-audit-dist",
  );
});

test("substitui caminhos macOS e Windows sem alterar caminhos relativos", () => {
  const input =
    "/Users/alguem/work/biblioteca-viva/docs/a.txt " +
    "C:\\Users\\alguem\\work\\biblioteca-viva\\src\\a.tsx " +
    "./docs/evidence.txt";

  assert.equal(
    sanitizeText(input),
    "<repo-root>/docs/a.txt <repo-root>\\src\\a.tsx ./docs/evidence.txt",
  );
});

test("é idempotente e preserva conteúdo sem caminhos locais", () => {
  const input = "Vitest: 420 tests passed. Path: <repo-root>/src <tmp-root>/build";
  assert.equal(sanitizeText(sanitizeText(input)), input);
});

test("rejeita traversal que tenta sair da raiz de evidências", async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), "bv-evidence-"));
  try {
    const root = path.join(temp, "docs", "audits", "evidence");
    await mkdir(root, { recursive: true });
    const outside = path.join(temp, "outside.txt");
    await writeFile(outside, "não tocar");

    await assert.rejects(
      resolveEvidenceFile(
        path.join(root, "..", "..", "..", "outside.txt"),
        root,
      ),
      /fora do diretório permitido/,
    );
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test("rejeita links simbólicos diretos e diretórios que escapam da raiz", async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), "bv-evidence-"));
  try {
    const root = path.join(temp, "evidence");
    const outside = path.join(temp, "outside");
    await mkdir(root, { recursive: true });
    await mkdir(outside, { recursive: true });
    const outsideFile = path.join(outside, "secret.txt");
    await writeFile(outsideFile, "não ler");
    await symlink(outsideFile, path.join(root, "direct-link.txt"));
    await symlink(outside, path.join(root, "linked-dir"));

    await assert.rejects(
      resolveEvidenceFile(path.join(root, "direct-link.txt"), root),
      /escapa|Links simbólicos/,
    );
    await assert.rejects(
      resolveEvidenceFile(
        path.join(root, "linked-dir", "secret.txt"),
        root,
      ),
      /escapa/,
    );
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});
