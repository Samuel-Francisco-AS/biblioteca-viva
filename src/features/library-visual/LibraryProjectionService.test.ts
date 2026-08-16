import { describe, expect, it } from "vitest";

import {
  LibraryProjectionService,
  SHELF_DIRECT_REPRESENTATION_LIMIT,
  SHELF_MAX_VISUAL_GROUPS,
} from "./LibraryProjectionService";
import type { ReachedMilestone } from "../../domain";
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

function project(
  books: readonly LibraryProjectionBook[],
  milestones: readonly ReachedMilestone[] = [],
) {
  return service.project({ books, milestones });
}

const firstCompletion: ReachedMilestone = Object.freeze({
  id: "milestone.first-completed-book",
  reachedAt: "2026-07-30T12:00:00.000Z",
  rewards: Object.freeze([
    Object.freeze({
      decorationId: "decoration.reading-lamp",
      id: "reward.first-completion-reading-lamp",
      type: "decoration",
    }),
  ]),
  ruleVersion: 1,
  source: Object.freeze({
    eventId: "event-completion",
    eventType: "LibraryEntryCompleted",
  }),
});

describe("LibraryProjectionService", () => {
  it("projeta uma biblioteca vazia serializável e estável", () => {
    const viewModel = project([]);
    expect(viewModel).toEqual({
      completedBooks: 0,
      decorationUnlockAnimation: null,
      hasCompletedBook: false,
      hasFirstCompletionMilestone: false,
      highlightedBook: null,
      inProgressBooks: 0,
      roomState: "default",
      shelfOccupancy: "empty",
      shelfVisualGroupCount: 0,
      totalBooks: 0,
      unlockedDecorationIds: [],
    });
    expect(JSON.parse(JSON.stringify(viewModel))).toEqual(viewModel);
    expect(project([])).toEqual(viewModel);
  });

  it.each([
    [0, "empty", 0],
    [1, "initial", 1],
    [2, "initial", 2],
    [3, "initial", 3],
    [4, "initial", 4],
    [5, "growing", 5],
    [10, "growing", 6],
    [15, "full", 7],
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
      expect(viewModel.shelfVisualGroupCount).toBeLessThanOrEqual(
        SHELF_MAX_VISUAL_GROUPS,
      );
    },
  );

  it("usa correspondência direta até o limite e comprime depois dele", () => {
    expect(SHELF_DIRECT_REPRESENTATION_LIMIT).toBe(5);
    const smallCounts = Array.from({ length: 5 }, (_, index) => index + 1).map(
      (total) =>
        project(
          Array.from({ length: total }, (_, index) =>
            book({ id: `small-${index}` }),
          ),
        ).shelfVisualGroupCount,
    );
    expect(smallCounts).toEqual([1, 2, 3, 4, 5]);
    expect(
      project(
        Array.from({ length: 100 }, (_, index) =>
          book({ id: `large-${index}` }),
        ),
      ).shelfVisualGroupCount,
    ).toBe(SHELF_MAX_VISUAL_GROUPS);
  });

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
      hasCompletedBook: true,
      hasFirstCompletionMilestone: false,
      inProgressBooks: 1,
      totalBooks: 5,
    });
  });

  it("mantém o marco histórico e a decoração sem depender de conclusão atual", () => {
    const viewModel = project(
      [book({ status: "in_progress" })],
      [firstCompletion],
    );
    expect(viewModel).toMatchObject({
      completedBooks: 0,
      hasCompletedBook: false,
      hasFirstCompletionMilestone: true,
      unlockedDecorationIds: ["decoration.reading-lamp"],
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
    expect(JSON.stringify(bounded)).not.toMatch(
      /Livro de teste|title|note|quote|author/i,
    );
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
