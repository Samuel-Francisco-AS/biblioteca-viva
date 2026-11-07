import { expect, it } from "vitest";
import { createBook, createNote, createQuote } from "../domain";
import { projectLivingScrolls } from "./livingScrolls";
const book = createBook({
  id: "fiction-book",
  title: "Fiction",
  createdAt: "2026-11-05T12:00:00.000Z",
});
const notes = Array.from({ length: 12 }, (_, i) =>
  createNote({
    id: `n${String(i).padStart(2, "0")}`,
    entryId: book.id,
    content: "PRIVATE FICTION",
    createdAt: `2026-11-05T12:${String(i).padStart(2, "0")}:00.000Z`,
  }),
);
it.each([0, 1, 10, 12])("selects deterministically with %i notes", (n) => {
  const rows = notes.slice(0, n);
  const before = JSON.stringify(rows);
  const result = projectLivingScrolls([book], rows, []);
  expect(result).toHaveLength(Math.min(n, 10));
  expect(result).toEqual(projectLivingScrolls([book], [...rows].reverse(), []));
  expect(new Set(result.map((s) => s.id)).size).toBe(result.length);
  expect(JSON.stringify(result)).not.toContain("PRIVATE");
  expect(JSON.stringify(rows)).toBe(before);
});
it("keeps canonical identity through edits, removes deleted/orphaned notes and separates quotes", () => {
  const original = projectLivingScrolls([book], [notes[0]], [])[0];
  const edited = projectLivingScrolls(
    [book],
    [{ ...notes[0], content: "changed", updatedAt: notes[11].updatedAt }],
    [],
  )[0];
  expect(edited.id).toBe(original.id);
  expect(edited.annotationId).toBe(notes[0].id);
  expect(edited.entryId).toBe(book.id);
  expect(projectLivingScrolls([], notes, [])).toEqual([]);
  expect(projectLivingScrolls([book], [], [])).toEqual([]);
  const quote = createQuote({
    id: notes[0].id,
    entryId: book.id,
    content: "fiction",
    createdAt: notes[0].createdAt,
  });
  expect(
    new Set(projectLivingScrolls([book], [notes[0]], [quote]).map((s) => s.id))
      .size,
  ).toBe(2);
  expect(
    projectLivingScrolls([book], notes, []).map((s) => s.annotationId),
  ).not.toContain("n00");
});
