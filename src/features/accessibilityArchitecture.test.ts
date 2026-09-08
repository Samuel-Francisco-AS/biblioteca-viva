import { describe, expect, it } from "vitest";

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
  it("domínio continua sem browser, apresentação ou preferências de UI", () => {
    for (const [path, source] of Object.entries(domainSources)) {
      expect(source, path).not.toMatch(
        /window|document|matchMedia|React|Dexie|ExperiencePreferences/u,
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
