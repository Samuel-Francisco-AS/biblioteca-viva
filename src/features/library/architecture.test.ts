import { describe, expect, it } from "vitest";

const coreSources = import.meta.glob<string>(
  [
    "../../domain/*.ts",
    "!../../domain/*.test.ts",
    "../../application/*.ts",
    "!../../application/*.test.ts",
  ],
  { eager: true, import: "default", query: "?raw" },
);

const reactSources = import.meta.glob<string>(
  ["../../pages.tsx", "./WorldHost.tsx", "./worldRuntime.ts"],
  { eager: true, import: "default", query: "?raw" },
);

const runtimeSources = import.meta.glob<string>(
  ["./three/*.ts", "!./three/*.test.ts"],
  { eager: true, import: "default", query: "?raw" },
);

const readingAreaProjectionSources = import.meta.glob<string>(
  [
    "./readingAreaBookContract.ts",
    "./readingAreaBooks.ts",
    "./libraryWorldEntryContract.ts",
    "./libraryWorldEntries.ts",
  ],
  { eager: true, import: "default", query: "?raw" },
);

describe("fronteiras da fundação Three.js", () => {
  it("mantém Three.js fora de domain e application", () => {
    for (const [path, source] of Object.entries(coreSources)) {
      expect(source, path).not.toMatch(/from\s+["']three(?:\/[^"']*)?["']/u);
    }
  });

  it("mantém recursos Three.js fora dos componentes React", () => {
    for (const [path, source] of Object.entries(reactSources)) {
      expect(source, path).not.toMatch(/from\s+["']three(?:\/[^"']*)?["']/u);
      expect(source, path).not.toMatch(
        /WebGLRenderer|OrthographicCamera|Mesh/u,
      );
    }
  });

  it("mantém o runtime independente de Dexie e das camadas convencionais", () => {
    for (const [path, source] of Object.entries(runtimeSources)) {
      expect(source, path).not.toMatch(
        /dexie|infrastructure|application|\.\.\/\.\.\/\.\.\/domain/iu,
      );
    }
  });

  it("mantém as projeções neutras de renderer e infraestrutura", () => {
    for (const [path, source] of Object.entries(readingAreaProjectionSources)) {
      expect(source, path).not.toMatch(/from\s+["']three(?:\/[^"']*)?["']/u);
      expect(source, path).not.toMatch(
        /from\s+["'][^"']*(?:application|dexie|infrastructure|three)[^"']*["']/u,
      );
    }
  });

  it("permite aos projectors conhecer o domínio, mas não aos contratos nem ao renderer", () => {
    const contracts = Object.entries(readingAreaProjectionSources).filter(
      ([path]) => path.endsWith("Contract.ts"),
    );
    expect(contracts).toHaveLength(2);
    for (const [path, source] of contracts) {
      expect(source, path).not.toMatch(
        /from\s+["'][^"']*(?:domain|application|three|dexie|infrastructure)[^"']*["']/iu,
      );
    }
    for (const [path, source] of Object.entries(runtimeSources)) {
      expect(source, path).not.toMatch(
        /from\s+["'][^"']*readingAreaBooks[^"']*["']/u,
      );
      expect(source, path).not.toMatch(/\bBookEntry\b/u);
    }
  });
});
