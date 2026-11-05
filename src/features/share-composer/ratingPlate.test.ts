import { expect, it, vi } from "vitest";
import { createBook, createMovie } from "../../domain";
import { createBookImage } from "../book-share/bookImage";
import { createCinemaImage } from "../entertainment/cinemaImage";
import { drawRating, renderSharePlate } from "./renderSharePlate";
vi.mock("./renderSharePlate", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./renderSharePlate")>()),
  renderSharePlate: vi
    .fn()
    .mockResolvedValue({ dataUrl: "fixture", name: "fixture.png" }),
}));
it("adapters forward only the actual persisted rating, keep all formats/modes and leave private notes out", async () => {
  const now = "2026-11-05T12:00:00.000Z";
  const book = createBook({
    id: "b",
    title: "Livro fictício",
    rating: 3,
    createdAt: now,
  });
  const movie = createMovie({
    id: "m",
    title: "Filme fictício",
    catalog: { rating: 5 },
    createdAt: now,
  });
  for (const aspect of ["post", "story", "square"] as const) {
    await createBookImage(book, undefined, { aspect, layout: "folio" });
    expect(renderSharePlate).toHaveBeenLastCalledWith(
      expect.objectContaining({ rating: 3 }),
      expect.objectContaining({ aspect }),
    );
    for (const mode of [
      "release",
      "wishlist",
      "progress",
      "recommendation",
    ] as const) {
      await createCinemaImage(movie, {
        mode,
        aspect,
        layout: "nocturne",
        message: "Mensagem",
        today: "2026-11-05",
        showRating: false,
      });
      expect(renderSharePlate).toHaveBeenLastCalledWith(
        expect.objectContaining({ rating: 5 }),
        expect.objectContaining({ aspect, showRating: false }),
      );
    }
  }
  await createBookImage({ ...book, rating: undefined });
  expect(renderSharePlate).toHaveBeenLastCalledWith(
    expect.objectContaining({ rating: undefined }),
    expect.anything(),
  );
  expect(book.rating).toBe(3);
  expect(movie.catalog?.rating).toBe(5);
});
it("draws exactly five geometric stars with the right filled/dim colors and rejects invalid ratings", () => {
  const colors: string[] = [];
  const ctx = {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: () => colors.push(ctx.fillStyle),
    stroke: vi.fn(),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
  };
  drawRating(
    ctx as unknown as CanvasRenderingContext2D,
    3,
    540,
    300,
    "center",
    false,
  );
  expect(ctx.beginPath).toHaveBeenCalledTimes(5);
  expect(colors).toEqual([
    "#e9bd66",
    "#e9bd66",
    "#e9bd66",
    "#716674",
    "#716674",
  ]);
  expect(() =>
    drawRating(
      ctx as unknown as CanvasRenderingContext2D,
      6,
      0,
      0,
      "left",
      true,
    ),
  ).toThrow();
});
