import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { ApplicationError, type AudioPort } from "./application";
import type { BookEntry } from "./domain";
import type { LibraryInteraction } from "./features/library-visual/contracts";
import { LibraryPage, type LibraryPageApplication } from "./pages";

const visualHostMock = vi.hoisted(() => ({
  interaction: undefined as ((event: LibraryInteraction) => void) | undefined,
}));

vi.mock("./features/library-visual/LibraryVisualHost", () => ({
  LibraryVisualHost: ({
    onInteraction,
  }: {
    readonly onInteraction?: (event: LibraryInteraction) => void;
  }) => {
    visualHostMock.interaction = onInteraction;
    return <div aria-label="Visualização da Biblioteca" role="img" />;
  },
}));

const book: BookEntry = {
  author: "Autora de teste",
  createdAt: "2026-07-20T10:00:00.000Z",
  currentPage: 40,
  id: "book-1",
  revision: 1,
  status: "in_progress",
  title: "Título de teste",
  totalPages: 100,
  type: "book",
  updatedAt: "2026-07-30T10:00:00.000Z",
};

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="URL atual">{location.pathname}</output>;
}

function renderLibrary(
  result: Promise<readonly BookEntry[]>,
  audio?: Pick<AudioPort, "emit">,
) {
  const execute = vi.fn(() => result);
  const application: LibraryPageApplication = {
    audio,
    queries: { listBookEntries: { execute } },
  };
  render(
    <MemoryRouter>
      <LibraryPage application={application} />
      <LocationProbe />
    </MemoryRouter>,
  );
  return execute;
}

describe("Página Biblioteca", () => {
  it("emite intenções distintas para os três objetos interativos", async () => {
    const emit = vi.fn();
    const audio: Pick<AudioPort, "emit"> = { emit };
    renderLibrary(Promise.resolve([book]), audio);
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });

    act(() => visualHostMock.interaction?.({ type: "ShelfSelected" }));
    act(() => visualHostMock.interaction?.({ type: "LibrarianSelected" }));
    act(() => visualHostMock.interaction?.({ type: "CreatureSelected" }));

    expect(emit).toHaveBeenCalledTimes(3);
    expect(emit).toHaveBeenNthCalledWith(1, { type: "ShelfSelected" });
    expect(emit).toHaveBeenNthCalledWith(2, { type: "LibrarianSelected" });
    expect(emit).toHaveBeenNthCalledWith(3, { type: "CreatureSelected" });
  });

  it("mostra loading antes da consulta e abre a visualização com biblioteca vazia", async () => {
    let resolve: (books: readonly BookEntry[]) => void = () => undefined;
    const execute = renderLibrary(
      new Promise((done: (books: readonly BookEntry[]) => void) => {
        resolve = done;
      }),
    );
    expect(
      screen.getByText("Carregando visualização da Biblioteca…"),
    ).toBeVisible();
    resolve([]);
    expect(
      await screen.findByRole("img", { name: "Visualização da Biblioteca" }),
    ).toBeVisible();
    expect(execute).toHaveBeenCalledOnce();
  });

  it("apresenta erro sanitizado, mantém a Coleção e permite retry", async () => {
    const user = userEvent.setup();
    const execute = vi
      .fn<() => Promise<readonly BookEntry[]>>()
      .mockRejectedValueOnce(
        new ApplicationError("PERSISTENCE_FAILED", "interno"),
      )
      .mockResolvedValueOnce([]);
    const application: LibraryPageApplication = {
      queries: { listBookEntries: { execute } },
    };
    render(
      <MemoryRouter>
        <LibraryPage application={application} />
      </MemoryRouter>,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível acessar o armazenamento",
    );
    expect(screen.queryByText("interno")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir Coleção" })).toHaveAttribute(
      "href",
      "/colecao",
    );
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    await waitFor(() => expect(execute).toHaveBeenCalledTimes(2));
    expect(
      await screen.findByRole("img", { name: "Visualização da Biblioteca" }),
    ).toBeVisible();
  });

  it("abre e fecha o painel React uma vez ao selecionar a estante e navega para a Coleção", async () => {
    const user = userEvent.setup();
    renderLibrary(Promise.resolve([{ ...book, status: "completed" }]));
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    act(() => visualHostMock.interaction?.({ type: "ShelfSelected" }));

    expect(
      await screen.findByRole("heading", { name: "Resumo da sua coleção" }),
    ).toBeVisible();
    expect(screen.getAllByText("1")).toHaveLength(2);
    expect(
      screen.getByText("Os primeiros livros já estão organizados na estante."),
    ).toBeVisible();
    expect(
      screen.getByText(/Livro atualizado mais recentemente: Título de teste/u),
    ).toBeVisible();
    expect(screen.queryByText("book-1")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Fechar painel" }));
    expect(
      screen.queryByRole("heading", { name: "Resumo da sua coleção" }),
    ).not.toBeInTheDocument();

    act(() => visualHostMock.interaction?.({ type: "ShelfSelected" }));
    await screen.findByRole("heading", { name: "Resumo da sua coleção" });
    await user.click(screen.getByRole("button", { name: "Abrir Coleção" }));
    expect(screen.getByLabelText("URL atual")).toHaveTextContent("/colecao");
  });

  it("abre o painel acessível da bibliotecária e move foco para fechar", async () => {
    renderLibrary(Promise.resolve([book]));
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    act(() => visualHostMock.interaction?.({ type: "LibrarianSelected" }));

    expect(
      screen.getByRole("heading", { name: "Uma acolhida tranquila" }),
    ).toBeVisible();
    expect(
      screen.getByText(/sempre espaço para mais uma história/iu),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Fechar painel" })).toHaveFocus();
    expect(screen.queryByText("book-1")).not.toBeInTheDocument();
  });

  it("abre o painel da criatura, substitui o anterior e fecha sem duplicação", async () => {
    const user = userEvent.setup();
    renderLibrary(Promise.resolve([book]));
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    act(() => visualHostMock.interaction?.({ type: "LibrarianSelected" }));
    act(() => visualHostMock.interaction?.({ type: "CreatureSelected" }));
    act(() => visualHostMock.interaction?.({ type: "CreatureSelected" }));

    expect(
      screen.queryByRole("heading", { name: "Uma acolhida tranquila" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("heading", { name: "Uma presença curiosa" }),
    ).toHaveLength(1);
    expect(screen.getByText(/percorre devagar/iu)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Fechar painel" }));
    expect(
      screen.queryByRole("heading", { name: "Uma presença curiosa" }),
    ).not.toBeInTheDocument();
  });

  it("cada nova interação substitui o painel atual", async () => {
    renderLibrary(Promise.resolve([book]));
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    act(() => visualHostMock.interaction?.({ type: "CreatureSelected" }));
    act(() => visualHostMock.interaction?.({ type: "ShelfSelected" }));
    expect(
      screen.getByRole("heading", { name: "Resumo da sua coleção" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Uma presença curiosa" }),
    ).not.toBeInTheDocument();
  });
});
