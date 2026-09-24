import { describe, expect, it } from "vitest";

import { safeReturnPath } from "./navigationOrigin";

describe("origem segura do detalhe", () => {
  it("preserva Biblioteca, Coleção e Arquivo com seus parâmetros", () => {
    expect(safeReturnPath("/?q=teste")).toBe("/?q=teste");
    expect(safeReturnPath("/colecao?q=jose&status=completed")).toBe(
      "/colecao?q=jose&status=completed",
    );
    expect(safeReturnPath("/arquivo?q=oceano")).toBe("/arquivo?q=oceano");
  });

  it.each([
    null,
    "https://example.com/arquivo",
    "/desconhecido",
    "//example.com/arquivo",
  ])("usa Coleção como fallback para origem inválida %s", (value) => {
    expect(safeReturnPath(value)).toBe("/colecao");
  });
});
