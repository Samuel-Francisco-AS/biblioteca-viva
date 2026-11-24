import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeText } from "./sanitize-evidence.mjs";

test("substitui caminhos Linux do repositório e do laboratório", () => {
  const input = "Repo: /home/sam/Projetos/biblioteca-viva/src/main.tsx\nLab: /home/sam/Projetos/bv-f4-lab/capture.png";
  assert.equal(
    sanitizeText(input),
    "Repo: <repo-root>/src/main.tsx\nLab: <lab-root>/capture.png",
  );
});

test("substitui caminhos macOS e Windows sem alterar caminhos relativos", () => {
  const input = "/Users/alguem/work/biblioteca-viva/docs/a.txt C:\\Users\\alguem\\work\\biblioteca-viva\\src\\a.tsx ./docs/evidence.txt";
  assert.equal(
    sanitizeText(input),
    "<repo-root>/docs/a.txt <repo-root>\\src\\a.tsx ./docs/evidence.txt",
  );
});

test("é idempotente e preserva conteúdo sem caminhos pessoais", () => {
  const input = "Vitest: 420 tests passed. Path: <repo-root>/src";
  assert.equal(sanitizeText(sanitizeText(input)), input);
});
