import { describe, expect, it } from "vitest";

const sourceFiles = import.meta.glob<string>("./**/*.{ts,tsx}", {
  eager: true,
  query: "?raw",
  import: "default",
});
const sceneFiles = import.meta.glob<string>(
  ["./phaser/*.ts", "!./phaser/*.test.ts"],
  {
    eager: true,
    query: "?raw",
    import: "default",
  },
);
const manifestFiles = import.meta.glob<string>(
  "./phaser/{roomManifest,roomConfig}.ts",
  {
    eager: true,
    query: "?raw",
    import: "default",
  },
);
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

describe("limites arquiteturais dos Prompts 11 a 13", () => {
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
    expect(contracts).not.toMatch(
      /phaser|dexie|BookEntry|LibraryEntry|author|title|note|quote/iu,
    );
  });

  it("mantém atmosfera visual sem rede, persistência, áudio ou polling", () => {
    const atmosphere = sourceFiles["./libraryAtmosphere.ts"];
    expect(atmosphere).toBeDefined();
    expect(atmosphere).not.toMatch(
      /dexie|indexedDB|localStorage|repository|fetch\(|geolocation|Audio|setInterval/iu,
    );
    expect(atmosphere).toMatch(/millisecondsUntilNextLibraryPeriod/u);
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

  it("mantém manifestos livres de React, Dexie e serviços de aplicação", () => {
    Object.entries(manifestFiles).forEach(([path, source]) => {
      expect(source, path).not.toMatch(
        /from\s+["'](?:react|dexie|react-router-dom)["']|application|repository|useCase/iu,
      );
      expect(source, path).not.toMatch(/Math\.random|window\.|document\./u);
    });
  });

  it("não antecipa navegação, áudio, física, pathfinding, polling ou ponte global", () => {
    const scene = sourceFiles["./phaser/InitialLibraryScene.ts"];
    const factory = sourceFiles["./phaser/createPhaserGame.ts"];
    expect(scene).toBeDefined();
    expect(factory).toBeDefined();
    expect(scene).not.toMatch(
      /react-router|navigate\(|this\.physics|pathfind|setInterval|Audio|localStorage|globalThis|window\.|document\./iu,
    );
    expect(factory).not.toMatch(/react-router|navigate\(|dexie|repository/iu);
  });

  it("mantém Phaser lazy e sem caminho externo ou objeto por livro", () => {
    const host = sourceFiles["./LibraryVisualHost.tsx"];
    const scene = sourceFiles["./phaser/InitialLibraryScene.ts"];
    const manifest = sourceFiles["./phaser/roomManifest.ts"];
    expect(host).toMatch(/import\("\.\/phaser\/createPhaserGame"\)/u);
    expect(manifest).not.toMatch(/assetPath:\s*["'](?:https?:\/\/|data:)/u);
    expect(scene).not.toMatch(
      /projection\.(?:books|entries)|forEachBook|mapBook/iu,
    );
  });

  it("mantém tweens locais infinitos, em fase e sem killAll", () => {
    const scene = sourceFiles["./phaser/InitialLibraryScene.ts"];
    expect(scene).toMatch(/targets: this\.librarianPhase/u);
    expect(scene).toMatch(/targets: this\.creaturePhase/u);
    expect(scene).toMatch(/LIBRARY_ROOM_ANIMATIONS\.librarian\.repeat/u);
    expect(scene).toMatch(/LIBRARY_ROOM_ANIMATIONS\.creature\.repeat/u);
    expect(scene).toMatch(/onComplete: onUnexpectedEnd/u);
    expect(scene).toMatch(/onStop: onUnexpectedEnd/u);
    expect(scene).not.toMatch(/killAll/u);
  });
});
