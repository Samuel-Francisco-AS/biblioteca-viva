import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import type { BookEntry } from "../../domain";
import { ProgressForm } from "./ProgressForm";

const book: BookEntry = {
  id: "book-test-repeat",
  type: "book",
  title: "Livro de teste",
  status: "in_progress",
  currentPage: 20,
  totalPages: 352,
  revision: 1,
  favorite: false,
  tagIds: [],
  createdAt: "2026-11-11T00:00:00.000Z",
  updatedAt: "2026-11-11T00:00:00.000Z",
};

it("allows quick consecutive +/- touches without losing increments or saving early", () => {
  const updateProgress = vi.fn(() => Promise.resolve(book));
  render(
    <ProgressForm
      book={book}
      updateProgress={updateProgress}
      onUpdated={vi.fn()}
    />,
  );
  const plus = screen.getByRole("button", { name: "Avançar uma página" });
  const minus = screen.getByRole("button", { name: "Diminuir uma página" });
  const pages = screen.getByRole("spinbutton", { name: /Página atual/i });
  fireEvent.click(plus);
  fireEvent.click(plus);
  fireEvent.click(plus);
  fireEvent.click(minus);
  expect(pages).toHaveValue(22);
  expect(updateProgress).not.toHaveBeenCalled();
  fireEvent.change(pages, { target: { value: "352" } });
  expect(plus).toBeDisabled();
  fireEvent.click(minus);
  expect(pages).toHaveValue(351);
  expect(plus).not.toBeDisabled();
});

it("keeps current page limits accessible without a redundant static hint", () => {
  render(
    <ProgressForm
      book={book}
      updateProgress={vi.fn(() => Promise.resolve(book))}
      onUpdated={vi.fn()}
    />,
  );
  const page = screen.getByRole("spinbutton", { name: /Página atual/i });
  expect(page).toHaveAttribute("min", "0");
  expect(page).toHaveAttribute("max", "352");
  expect(page).not.toHaveAttribute("aria-describedby");
  expect(
    screen.queryByText(/Use um número inteiro a partir de zero/),
  ).not.toBeInTheDocument();
});
