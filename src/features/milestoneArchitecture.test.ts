import { describe, expect, it } from "vitest";

const engineSource = import.meta.glob<string>("../domain/milestones.ts", {
  eager: true,
  import: "default",
  query: "?raw",
});
const phaserSources = import.meta.glob<string>("./library-visual/phaser/*.ts", {
  eager: true,
  import: "default",
  query: "?raw",
});
const reactSources = import.meta.glob<string>(["../App.tsx", "../pages.tsx"], {
  eager: true,
  import: "default",
  query: "?raw",
});

describe("fronteiras arquiteturais do motor de marcos", () => {
  it("mantém o engine puro sem plataforma, apresentação ou infraestrutura", () => {
    const source = engineSource["../domain/milestones.ts"];
    expect(source).toBeDefined();
    expect(source).not.toMatch(
      /from\s+["'](?:react|phaser|dexie|@capacitor)|window\.|document\.|indexedDB|AudioContext|filesystem/iu,
    );
  });

  it("impede Phaser de importar engine ou persistência", () => {
    for (const [path, source] of Object.entries(phaserSources)) {
      expect(source, path).not.toMatch(
        /MilestoneEngine|milestoneStore|Dexie|BibliotecaDatabase|repository/iu,
      );
    }
  });

  it("mantém React como consumidor de eventos/projeção, sem decidir condições", () => {
    for (const [path, source] of Object.entries(reactSources)) {
      expect(source, path).not.toMatch(
        /MilestoneEngine|completedBooks\s*>?=\s*1|totalNotes\s*>?=\s*1|save_milestone/iu,
      );
    }
  });
});
