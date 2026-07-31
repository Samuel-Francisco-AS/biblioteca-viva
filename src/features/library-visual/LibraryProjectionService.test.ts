import { describe, expect, it } from "vitest";

import {
  LibraryProjectionService,
  SHELF_VISUAL_GROUP_COUNTS,
} from "./LibraryProjectionService";
import type { LibraryProjectionBook } from "./LibraryProjectionService";

const service = new LibraryProjectionService();

function book(
  overrides: Partial<LibraryProjectionBook> = {},
): LibraryProjectionBook {
  return {
    currentPage: 0,
    id: "book-a",
    status: "planned",
    title: "Livro de teste",
    updatedAt: "2026-07-30T10:00:00.000Z",
    ...overrides,
  };
}

function project(books: readonly LibraryProjectionBook[]) {
  return service.project({ books });
}

describe("LibraryProjectionService", () => {
  it("projeta uma biblioteca vazia serializável e estável", () => {
    const viewModel = project([]);
    expect(viewModel).toEqual({
      completedBooks: 0,
      hasFirstCompletionMilestone: false,
      highlightedBook: null,
      inProgressBooks: 0,
      roomState: "default",
      shelfOccupancy: "empty",
      shelfVisualGroupCount: 0,
      totalBooks: 0,
    });
    expect(JSON.parse(JSON.stringify(viewModel))).toEqual(viewModel);
    expect(project([])).toEqual(viewModel);
  });

  it.each([
    [1, "initial", 2],
    [4, "initial", 2],
    [5, "growing", 5],
    [14, "growing", 5],
    [15, "full", 8],
    [100, "full", 8],
  ] as const)(
    "centraliza a fronteira de lotação para %i livros",
    (total, occupancy, groups) => {
      const books = Array.from({ length: total }, (_, index) =>
        book({ id: `book-${index}` }),
      );
      const viewModel = project(books);
      expect(viewModel.shelfOccupancy).toBe(occupancy);
      expect(viewModel.shelfVisualGroupCount).toBe(groups);
      expect(viewModel.shelfVisualGroupCount).toBe(
        SHELF_VISUAL_GROUP_COUNTS[occupancy],
      );
    },
  );

  it("conta somente os status em andamento e concluído nas categorias certas", () => {
    const viewModel = project([
      book({ id: "planned", status: "planned" }),
      book({ id: "reading", status: "in_progress" }),
      book({ id: "paused", status: "paused" }),
      book({ id: "done", status: "completed" }),
      book({ id: "abandoned", status: "abandoned" }),
    ]);
    expect(viewModel).toMatchObject({
      completedBooks: 1,
      hasFirstCompletionMilestone: true,
      inProgressBooks: 1,
      totalBooks: 5,
    });
  });

  it("escolhe o livro recente por data e usa id como desempate estável", () => {
    const viewModel = project([
      book({
        id: "z",
        title: "Mais antigo",
        updatedAt: "2026-07-29T10:00:00.000Z",
      }),
      book({
        id: "b",
        title: "Empate B",
        updatedAt: "2026-07-31T10:00:00.000Z",
      }),
      book({
        id: "a",
        title: "Empate A",
        updatedAt: "2026-07-31T10:00:00.000Z",
      }),
    ]);
    expect(viewModel.highlightedBook).toMatchObject({
      entryId: "a",
      title: "Empate A",
    });
  });

  it("resume progresso com e sem total sem vazar campos pessoais", () => {
    const bounded = project([
      book({ currentPage: 20, id: "bounded", totalPages: 100 }),
    ]);
    const open = project([book({ currentPage: 12, totalPages: undefined })]);
    expect(bounded.highlightedBook?.progress).toEqual({
      currentPage: 20,
      kind: "bounded",
      totalPages: 100,
    });
    expect(open.highlightedBook?.progress).toEqual({
      currentPage: 12,
      kind: "open",
    });
    expect(JSON.stringify(bounded)).not.toMatch(/note|quote|author/i);
  });

  it("não modifica os objetos nem a ordem recebida", () => {
    const books = [
      book({ id: "b", updatedAt: "2026-07-30T10:00:00.000Z" }),
      book({ id: "a", updatedAt: "2026-07-31T10:00:00.000Z" }),
    ];
    const before = structuredClone(books);
    project(books);
    expect(books).toEqual(before);
    expect(books.map((entry) => entry.id)).toEqual(["b", "a"]);
  });
});
