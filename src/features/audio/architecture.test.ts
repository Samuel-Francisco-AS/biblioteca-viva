import { describe, expect, it } from "vitest";

const presentationSources = import.meta.glob<string>(
  [
    "../../App.tsx",
    "../../pages.tsx",
    "../../useAudioExperience.ts",
    "../settings/SettingsPage.tsx",
  ],
  { eager: true, query: "?raw", import: "default" },
);

describe("fronteira arquitetural de áudio", () => {
  it("React não importa backend, manifesto ou APIs Web Audio", () => {
    for (const [path, source] of Object.entries(presentationSources)) {
      expect(source, path).not.toMatch(
        /infrastructure\/audio|AudioContext|Howl(?:er)?|\/audio\/|\.wav/u,
      );
    }
  });
});
