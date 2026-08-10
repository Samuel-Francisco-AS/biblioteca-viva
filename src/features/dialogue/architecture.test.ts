import { describe, expect, it } from "vitest";

const phaserSources = import.meta.glob<string>(
  "../library-visual/phaser/*.ts",
  { eager: true, query: "?raw", import: "default" },
);
const dialogueApplication = import.meta.glob<string>(
  "../../application/dialogue.ts",
  { eager: true, query: "?raw", import: "default" },
);
const contentSources = import.meta.glob<string>("../../content/**/*.ts", {
  eager: true,
  query: "?raw",
  import: "default",
});

describe("fronteiras arquiteturais de diálogo", () => {
  it("Phaser não importa conteúdo, selector ou histórico", () => {
    for (const [path, source] of Object.entries(phaserSources)) {
      expect(source, path).not.toMatch(
        /content|DialogueSelector|DialogueHistory|dialogue\.history|Dexie/iu,
      );
    }
  });

  it("selector e serviço de aplicação não importam plataforma ou apresentação", () => {
    for (const [path, source] of Object.entries(dialogueApplication)) {
      expect(source, path).not.toMatch(
        /from\s+["'](?:react|phaser|dexie|@capacitor)|window\.|document\.|indexedDB|AudioContext/iu,
      );
    }
  });

  it("conteúdo local não depende de infraestrutura", () => {
    for (const [path, source] of Object.entries(contentSources)) {
      expect(source, path).not.toMatch(/infrastructure|dexie|@capacitor/iu);
    }
  });
});
