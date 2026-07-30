import { describe, expect, it } from "vitest";

const componentSources = import.meta.glob<string>("./*.tsx", {
  eager: true,
  import: "default",
  query: "?raw",
});

describe("arquitetura da edição de livros", () => {
  it("não importa Dexie, banco ou adapters concretos nos componentes", () => {
    for (const source of Object.values(componentSources)) {
      expect(source).not.toMatch(/from ["']dexie["']/u);
      expect(source).not.toMatch(/infrastructure\/database/u);
      expect(source).not.toMatch(
        /BibliotecaDatabase|DexieLibraryEntryRepository/u,
      );
    }
  });
});
