import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { createBook, createStudy } from "../../domain";
import { EditEntryPage } from "./EditEntryPage";

describe("BF-5R4: recovered editor", () => {
  it("keeps filled fields after a failed save and preserves existing deadline precision", async () => {
    const createdAt = "2026-08-10T12:00:00.000Z";
    const entry = createStudy({
      id: "study-fixture",
      title: "Astronomia fictícia",
      createdAt,
      deadline: "2026-12-10T18:30:00.000Z",
      progressUnit: "hours",
      progressTotal: 180,
      discipline: "Estrelas fictícias",
    });
    const book = createBook({
      id: "book-fixture",
      title: "Fixture",
      createdAt,
    });
    const update = vi
      .fn()
      .mockRejectedValueOnce(new Error("Fixture failure"))
      .mockResolvedValue(entry);
    const application = {
      commands: {
        updateLibraryEntry: { execute: update },
        createBookEntry: { execute: vi.fn().mockResolvedValue(book) },
        updateBookEntry: { execute: vi.fn().mockResolvedValue(book) },
      },
      queries: {
        getLibraryEntry: { execute: vi.fn().mockResolvedValue(entry) },
        getBookEntry: { execute: vi.fn().mockResolvedValue(book) },
      },
    };
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/registros/study-fixture/editar"]}>
        <Routes>
          <Route
            path="/registros/:id/editar"
            element={<EditEntryPage application={application} />}
          />
          <Route path="/registros/:id" element={<p>Ficha aberta</p>} />
        </Routes>
      </MemoryRouter>,
    );
    const title = await screen.findByLabelText("Título");
    expect(screen.getByLabelText("Total (opcional)")).toHaveValue(3);
    await user.clear(title);
    await user.type(title, "Caderno fictício revisado");
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeVisible());
    expect(title).toHaveValue("Caderno fictício revisado");
    expect(screen.getByLabelText("Disciplina (opcional)")).toHaveValue(
      "Estrelas fictícias",
    );
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(update).toHaveBeenCalledTimes(2));
    expect(update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        title: "Caderno fictício revisado",
        deadline: "2026-12-10T18:30:00.000Z",
        progressTotal: 180,
        discipline: "Estrelas fictícias",
      }),
    );
    expect(await screen.findByText("Ficha aberta")).toBeVisible();
  });
});
