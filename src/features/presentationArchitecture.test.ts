import { describe, expect, it } from "vitest";

const presentationSources = import.meta.glob<string>(
  ["./collection/*.tsx", "./entry-detail/*.tsx"],
  { eager: true, query: "?raw", import: "default" },
);

describe("limites arquiteturais do Prompt 8", () => {
  it("não importa Dexie, infraestrutura ou adapters na apresentação", () => {
    for (const [path, source] of Object.entries(presentationSources)) {
      expect(source, path).not.toMatch(/from\s+["'][^"']*infrastructure/u);
      expect(source, path).not.toMatch(/from\s+["']dexie["']/u);
      expect(source, path).not.toMatch(/adapter/iu);
    }
  });
});
