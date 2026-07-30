import { describe, expect, it } from "vitest";

import type { BookEntry, EntryStatus } from "../../domain";
import {
  deriveCollection,
  normalizeSearch,
  parseCollectionSort,
  parseStatusFilter,
} from "./collectionControls";

const statuses: readonly EntryStatus[] = [
  "planned",
  "in_progress",
  "paused",
  "completed",
  "abandoned",
];

function makeBook(index: number): BookEntry {
  const number = String(index).padStart(3, "0");
  const totalPages = index % 10 === 0 ? undefined : 100;
  return Object.freeze({
    id: `book-${number}`,
    type: "book",
    title: index === 42 ? "O encontro de José" : `Livro ${number}`,
    ...(index === 42
      ? { author: "Álvares" }
      : index % 7 === 0
        ? {}
        : { author: `Autora ${number}` }),
    status: statuses[index % statuses.length] ?? "planned",
    ...(totalPages !== undefined && { totalPages }),
    currentPage: index % 101,
    createdAt: `2026-01-${String((index % 28) + 1).padStart(2, "0")}T10:00:00.000Z`,
    updatedAt: `2026-07-${String((index % 28) + 1).padStart(2, "0")}T10:00:00.000Z`,
    revision: 1,
  });
}

const hundredBooks = Object.freeze(
  Array.from({ length: 100 }, (_, index) => makeBook(index + 1)),
);

describe("controles derivados da Coleção", () => {
  it("normaliza espaços, caixa e acentos", () => {
    expect(normalizeSearch("  JOSÉ  ")).toBe("jose");
  });

  it("busca parcialmente por título ou autor e tolera autor ausente", () => {
    expect(
      deriveCollection(hundredBooks, " encontro ", "all", "recent").map(
        ({ id }) => id,
      ),
    ).toEqual(["book-042"]);
    expect(
      deriveCollection(hundredBooks, "alvares", "all", "recent").map(
        ({ id }) => id,
      ),
    ).toEqual(["book-042"]);
    expect(() =>
      deriveCollection(hundredBooks, "inexistente", "all", "recent"),
    ).not.toThrow();
  });

  it("busca vazia mantém todos os registros", () => {
    expect(deriveCollection(hundredBooks, "   ", "all", "recent")).toHaveLength(
      100,
    );
  });

  it.each(statuses)("filtra o status real %s", (status) => {
    const result = deriveCollection(hundredBooks, "", status, "recent");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((book) => book.status === status)).toBe(true);
  });

  it("combina busca e status", () => {
    const target = hundredBooks.find(({ id }) => id === "book-042");
    if (!target) throw new Error("Fixture ausente");
    expect(
      deriveCollection(hundredBooks, "jose", target.status, "title"),
    ).toEqual([target]);
    expect(deriveCollection(hundredBooks, "jose", "planned", "title")).toEqual(
      [],
    );
  });

  it("ordena atualização recente com desempate determinístico", () => {
    const result = deriveCollection(hundredBooks, "", "all", "recent");
    expect(result[0]?.updatedAt >= (result[1]?.updatedAt ?? "")).toBe(true);
  });

  it("ordena título em pt-BR sem diferença de acento", () => {
    const books = [
      { ...makeBook(1), id: "z", title: "Zebra" },
      { ...makeBook(2), id: "a", title: "Árvore" },
      { ...makeBook(3), id: "b", title: "abacate" },
    ];
    expect(
      deriveCollection(books, "", "all", "title").map(({ title }) => title),
    ).toEqual(["abacate", "Árvore", "Zebra"]);
  });

  it("ordena progresso conhecido antes do desconhecido", () => {
    const books = [
      {
        ...makeBook(10),
        id: "unknown-low",
        totalPages: undefined,
        currentPage: 20,
      },
      {
        ...makeBook(20),
        id: "unknown-high",
        totalPages: undefined,
        currentPage: 80,
      },
      { ...makeBook(3), id: "known-low", totalPages: 100, currentPage: 10 },
      { ...makeBook(4), id: "known-high", totalPages: 100, currentPage: 90 },
    ];
    expect(
      deriveCollection(books, "", "all", "progress").map(({ id }) => id),
    ).toEqual(["known-high", "known-low", "unknown-high", "unknown-low"]);
  });

  it("usa fallbacks seguros para parâmetros inválidos", () => {
    expect(parseStatusFilter("invalid")).toBe("all");
    expect(parseCollectionSort("invalid")).toBe("recent");
  });

  it("processa 100 livros sem paginação nem mutação dos dados de origem", () => {
    const before = JSON.stringify(hundredBooks);
    const result = deriveCollection(
      hundredBooks,
      "livro",
      "in_progress",
      "progress",
    );
    expect(result.length).toBeGreaterThan(0);
    expect(JSON.stringify(hundredBooks)).toBe(before);
    expect(Object.isFrozen(hundredBooks)).toBe(true);
    expect(result.every((book) => book.currentPage >= 0)).toBe(true);
  });
});
