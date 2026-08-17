import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { createBook, createMovie } from "../../domain";
import { NewEntryPage } from "./NewEntryPage";

const T0 = "2026-08-16T10:00:00.000Z";

function application() {
  const book = createBook({ id: "book-1", title: "Livro", createdAt: T0 });
  const movie = createMovie({
    id: "movie-1",
    title: "Filme fictício",
    createdAt: T0,
  });
  const createLibraryEntry = vi.fn(() => Promise.resolve(movie));
  return {
    createLibraryEntry,
    facade: {
      commands: {
        createBookEntry: { execute: vi.fn(() => Promise.resolve(book)) },
        createLibraryEntry: { execute: createLibraryEntry },
        updateBookEntry: { execute: vi.fn(() => Promise.resolve(book)) },
      },
      queries: {
        getBookEntry: { execute: vi.fn(() => Promise.resolve(book)) },
      },
    },
  };
}

describe("Novo registro", () => {
  it("oferece as seis superfícies de tipo", () => {
    const { facade } = application();
    render(
      <MemoryRouter>
        <NewEntryPage application={facade} />
      </MemoryRouter>,
    );
    for (const name of [
      "Livro",
      "Filme",
      "Série",
      "Estudo",
      "Atividade física",
      "Trabalho",
    ])
      expect(
        screen.getByRole("button", { name: new RegExp(name, "u") }),
      ).toBeVisible();
  });

  it("renderiza formulário específico, bloqueia duplo envio e navega pela rota genérica", async () => {
    const user = userEvent.setup();
    const { createLibraryEntry, facade } = application();
    render(
      <MemoryRouter initialEntries={["/novo-registro"]}>
        <Routes>
          <Route
            path="/novo-registro"
            element={<NewEntryPage application={facade} />}
          />
          <Route
            path="/registros/:id"
            element={<p>Detalhe genérico aberto</p>}
          />
        </Routes>
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("button", { name: /Filme/u }));
    await user.type(screen.getByLabelText("Título"), "Filme fictício");
    await user.type(
      screen.getByLabelText("Direção (opcional)"),
      "Pessoa Fictícia",
    );
    await user.type(screen.getByLabelText("Ano (opcional)"), "2024");
    await user.click(screen.getByRole("button", { name: "Salvar registro" }));
    await waitFor(() => expect(createLibraryEntry).toHaveBeenCalledOnce());
    expect(createLibraryEntry).toHaveBeenCalledWith({
      type: "movie",
      title: "Filme fictício",
      director: "Pessoa Fictícia",
      year: 2024,
      durationMinutes: undefined,
      platform: undefined,
    });
    expect(await screen.findByText("Detalhe genérico aberto")).toBeVisible();
  });
});
