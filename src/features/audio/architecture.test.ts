import { describe, expect, it } from "vitest";

const presentationSources = import.meta.glob<string>(
  [
    "../../App.tsx",
    "../../pages.tsx",
    "../../useAudioExperience.ts",
    "../settings/SettingsPage.tsx",
    "../library-visual/LibraryVisualHost.tsx",
    "../library-visual/phaser/{InitialLibraryScene,createPhaserGame}.ts",
  ],
  { eager: true, query: "?raw", import: "default" },
);

const sceneSources = import.meta.glob<string>(
  "../library-visual/phaser/{InitialLibraryScene,createPhaserGame}.ts",
  { eager: true, query: "?raw", import: "default" },
);

describe("fronteira arquitetural de áudio", () => {
  it("React e Phaser não importam backend, manifesto ou APIs Web Audio", () => {
    for (const [path, source] of Object.entries(presentationSources)) {
      expect(source, path).not.toMatch(
        /infrastructure\/audio|AudioContext|Howl(?:er)?|\/audio\/|\.wav/u,
      );
    }
  });

  it("a cena Phaser continua emitindo somente LibraryInteraction", () => {
    for (const [path, source] of Object.entries(sceneSources)) {
      expect(source, path).not.toMatch(
        /AudioPort|BookCompleted|music\.library|shelf-touch/u,
      );
    }
  });
});
