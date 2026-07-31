import { describe, expect, it } from "vitest";

const sourceFiles = import.meta.glob<string>("./**/*.{ts,tsx}", {
  eager: true,
  query: "?raw",
  import: "default",
});
const sceneFiles = import.meta.glob<string>("./phaser/*.ts", {
  eager: true,
  query: "?raw",
  import: "default",
});
const applicationFiles = import.meta.glob<string>("../../application/**/*.ts", {
  eager: true,
  query: "?raw",
  import: "default",
});
const domainFiles = import.meta.glob<string>("../../domain/**/*.ts", {
  eager: true,
  query: "?raw",
  import: "default",
});
const entrypointFiles = import.meta.glob<string>(
  "../../{main,App,routes}.tsx",
  {
    eager: true,
    query: "?raw",
    import: "default",
  },
);

describe("limites arquiteturais do Prompt 11", () => {
  it("mantém Phaser fora de domínio, aplicação e entrypoint eager", () => {
    [
      ...Object.entries(domainFiles),
      ...Object.entries(applicationFiles),
    ].forEach(([path, source]) =>
      expect(source, path).not.toMatch(/from\s+["']phaser["']/u),
    );
    Object.entries(entrypointFiles).forEach(([path, source]) => {
      expect(source, path).not.toMatch(/from\s+["']phaser["']/u);
      expect(source, path).not.toMatch(/import\(\s*["']phaser["']\s*\)/u);
    });
  });

  it("mantém a cena sem Dexie, repositórios, casos de uso ou navegação React", () => {
    Object.entries(sceneFiles).forEach(([path, source]) => {
      expect(source, path).not.toMatch(/dexie|repository|useCase/iu);
      expect(source, path).not.toMatch(/react-router|navigate\(/iu);
    });
  });

  it("mantém contratos livres de Phaser, Dexie e entidades persistidas", () => {
    const contracts = sourceFiles["./contracts.ts"];
    expect(contracts).toBeDefined();
    expect(contracts).not.toMatch(/phaser|dexie|BookEntry|LibraryEntry/iu);
  });

  it("mantém a factory Phaser em importação dinâmica no host", () => {
    const host = sourceFiles["./LibraryVisualHost.tsx"];
    expect(host).toMatch(/import\("\.\/phaser\/createPhaserGame"\)/u);
    expect(host).not.toMatch(/from\s+["']phaser["']/u);
  });
});
