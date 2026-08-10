import { describe, expect, it } from "vitest";

const phaserSources = import.meta.glob<string>("./library-visual/phaser/*.ts", {
  eager: true,
  import: "default",
  query: "?raw",
});
const domainSources = import.meta.glob<string>(
  ["../domain/*.ts", "!../domain/*.test.ts"],
  { eager: true, import: "default", query: "?raw" },
);
const reactSources = import.meta.glob<string>(
  [
    "../App.tsx",
    "../useExperiencePreferences.ts",
    "./settings/SettingsPage.tsx",
  ],
  { eager: true, import: "default", query: "?raw" },
);

describe("fronteiras das preferências de acessibilidade", () => {
  it("Phaser recebe movimento resolvido sem importar React ou persistência", () => {
    for (const [path, source] of Object.entries(phaserSources)) {
      expect(source, path).not.toMatch(/from ["']react["']/u);
      expect(source, path).not.toMatch(
        /infrastructure|experienceSettings|Dexie/iu,
      );
    }
  });

  it("domínio continua sem browser, apresentação ou preferências de UI", () => {
    for (const [path, source] of Object.entries(domainSources)) {
      expect(source, path).not.toMatch(
        /window|document|matchMedia|React|Phaser|Dexie|ExperiencePreferences/u,
      );
    }
  });

  it("React usa a porta da aplicação e não acessa settings ou Dexie", () => {
    for (const [path, source] of Object.entries(reactSources)) {
      expect(source, path).not.toMatch(
        /Dexie|database\.settings|experience\.preferences\.v1/u,
      );
    }
  });
});
