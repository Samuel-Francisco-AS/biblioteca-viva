import { createBook, type BookEntry } from "../../domain";
import { describe, expect, it } from "vitest";

import { projectReadingAreaBooks } from "./readingAreaBooks";

const CREATED_AT = "2026-09-21T10:00:00.000Z";

function book(
  values: Partial<{
    readonly author: string;
    readonly createdAt: string;
    readonly currentPage: number;
    readonly id: string;
    readonly title: string;
    readonly totalPages: number;
  }> = {},
): BookEntry {
  return createBook({
    createdAt: values.createdAt ?? CREATED_AT,
    currentPage: values.currentPage,
    ...(values.author !== undefined && { author: values.author }),
    id: values.id ?? "book-01",
    ...(values.totalPages !== undefined && { totalPages: values.totalPages }),
    title: values.title ?? "Livro de teste",
  });
}

describe("projeção neutra BF-2A da área de leitura", () => {
  it("projeta lista vazia", () => {
    const projected = projectReadingAreaBooks([]);

    expect(projected).toEqual([]);
    expect(Object.isFrozen(projected)).toBe(true);
  });

  it("projeta um livro com identidade visual distinta e metadados de apresentação", () => {
    const source = book({
      author: "Octavia E. Butler",
      currentPage: 42,
      id: "book-parable",
      title: "Parábola do Semeador",
      totalPages: 320,
    });

    expect(projectReadingAreaBooks([source])).toEqual([
      {
        author: "Octavia E. Butler",
        entryId: "book-parable",
        instanceId: "reading-book:book-parable",
        modelTypeId: "book-volume",
        readingProgress: { currentPage: 42, totalPages: 320 },
        title: "Parábola do Semeador",
      },
    ]);
  });

  it("preserva autor opcional ausente e o progresso disponível", () => {
    const source = book({ currentPage: 7, id: "book-without-author" });

    expect(projectReadingAreaBooks([source])).toEqual([
      {
        entryId: "book-without-author",
        instanceId: "reading-book:book-without-author",
        modelTypeId: "book-volume",
        readingProgress: { currentPage: 7 },
        title: "Livro de teste",
      },
    ]);
  });

  it("ordena vários livros por createdAt e id, independentemente da ordem recebida", () => {
    const later = book({
      createdAt: "2026-09-21T11:00:00.000Z",
      id: "book-later",
    });
    const sameTimeSecond = book({ id: "book-b", title: "Segundo" });
    const sameTimeFirst = book({ id: "book-a", title: "Primeiro" });

    const projected = projectReadingAreaBooks([
      later,
      sameTimeSecond,
      sameTimeFirst,
    ]);

    expect(projected.map(({ entryId }) => entryId)).toEqual([
      "book-a",
      "book-b",
      "book-later",
    ]);
  });

  it("mantém instanceId estável para execuções equivalentes e distinto entre livros", () => {
    const first = book({ id: "book-first" });
    const second = book({ id: "book-second" });

    const once = projectReadingAreaBooks([first, second]);
    const again = projectReadingAreaBooks([second, first]);

    expect(once).toEqual(again);
    expect(once.map(({ instanceId }) => instanceId)).toEqual([
      "reading-book:book-first",
      "reading-book:book-second",
    ]);
    expect(new Set(once.map(({ instanceId }) => instanceId)).size).toBe(2);
    expect(once.map(({ entryId }) => entryId)).toEqual([first.id, second.id]);
  });

  it("não modifica os livros de origem", () => {
    const source = book({ author: "Autora", currentPage: 12, totalPages: 24 });
    const original = structuredClone(source);

    projectReadingAreaBooks([source]);

    expect(source).toEqual(original);
  });

  it("rejeita entryId duplicado antes de criar ocorrências ambíguas", () => {
    const source = book({ id: "book-duplicated" });

    expect(() => projectReadingAreaBooks([source, source])).toThrow(
      "entryId duplicado: book-duplicated",
    );
  });
});
