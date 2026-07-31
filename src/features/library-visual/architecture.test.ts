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
const entrypointFiles = import.meta.glob<string>("../../{main,App}.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
});
const routeFiles = import.meta.glob<string>("../../routes.ts", {
  eager: true,
  query: "?raw",
  import: "default",
});

describe("limites arquiteturais dos Prompts 11 e 12", () => {
  it("mantém Phaser fora de domínio, aplicação e entrypoint eager", () => {
    [
      ...Object.entries(domainFiles),
      ...Object.entries(applicationFiles),
    ].forEach(([path, source]) =>
      expect(source, path).not.toMatch(/from\s+["']phaser["']/u),
    );
    [...Object.entries(entrypointFiles), ...Object.entries(routeFiles)].forEach(
      ([path, source]) => {
        expect(source, path).not.toMatch(/from\s+["']phaser["']/u);
        expect(source, path).not.toMatch(/import\(\s*["']phaser["']\s*\)/u);
      },
    );
  });

  it("mantém a cena sem persistência, consultas, navegador ou navegação React", () => {
    Object.entries(sceneFiles).forEach(([path, source]) => {
      expect(source, path).not.toMatch(
        /dexie|indexedDB|repository|useCase|queries|BookEntry/iu,
      );
      expect(source, path).not.toMatch(
        /react-router|navigate\(|window\.|document\./iu,
      );
      expect(source, path).not.toMatch(/note|quote/iu);
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

  it("mantém a projeção pura fora de React, Phaser, Dexie e APIs do navegador", () => {
    const projection = sourceFiles["./LibraryProjectionService.ts"];
    expect(projection).toBeDefined();
    expect(projection).not.toMatch(
      /from\s+["'](?:react|phaser|dexie)["']|window\.|document\.|indexedDB|Date\.now|Math\.random/iu,
    );
  });

  it("mantém as regras de lotação fora da cena e os contratos sem conteúdo persistido", () => {
    const projection = sourceFiles["./LibraryProjectionService.ts"];
    const contracts = sourceFiles["./contracts.ts"];
    Object.entries(sceneFiles).forEach(([path, source]) => {
      expect(source, path).not.toMatch(
        /SHELF_OCCUPANCY_RANGES|fullFrom|growingFrom/,
      );
    });
    expect(projection).toMatch(/SHELF_OCCUPANCY_RANGES/u);
    expect(contracts).not.toMatch(/Note|Quote|author|content|revision/iu);
  });
});
