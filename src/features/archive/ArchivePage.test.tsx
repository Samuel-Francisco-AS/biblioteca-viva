import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { ApplicationError } from "../../application";
import type { BookEntry, Note, Quote } from "../../domain";
import { ArchivePage, type ArchiveApplication } from "./ArchivePage";

const book: BookEntry = {
  id: "book-1",
  type: "book",
  title: "José e o mar",
  author: "Álvares",
  status: "completed",
  totalPages: 120,
  currentPage: 120,
  completedAt: "2026-07-29T12:00:00.000Z",
  createdAt: "2026-07-20T10:00:00.000Z",
  updatedAt: "2026-07-29T12:00:00.000Z",
  revision: 2,
};
const note: Note = {
  id: "note-1",
  entryId: book.id,
  content: "Reflexão sobre memória",
  createdAt: "2026-07-29T11:00:00.000Z",
  updatedAt: "2026-07-29T11:00:00.000Z",
  revision: 1,
};
const quote: Quote = {
  id: "quote-1",
  entryId: book.id,
  content: "O oceano guardava histórias",
  page: 18,
  createdAt: "2026-07-29T12:00:00.000Z",
  updatedAt: "2026-07-29T12:00:00.000Z",
  revision: 1,
};

function LocationProbe() {
  const location = useLocation();
  return (
    <output aria-label="URL atual">{`${location.pathname}${location.search}`}</output>
  );
}

function application(
  overrides: Partial<{
    books: () => Promise<readonly BookEntry[]>;
    notes: () => Promise<readonly Note[]>;
    quotes: () => Promise<readonly Quote[]>;
  }> = {},
) {
  const calls = {
    books: vi.fn(overrides.books ?? (() => Promise.resolve([book]))),
    notes: vi.fn(overrides.notes ?? (() => Promise.resolve([note]))),
    quotes: vi.fn(overrides.quotes ?? (() => Promise.resolve([quote]))),
  };
  const facade: ArchiveApplication = {
    queries: {
      listBookEntries: { execute: calls.books },
      listAllNotes: { execute: calls.notes },
      listAllQuotes: { execute: calls.quotes },
    },
  };
  return { calls, facade };
}

function renderArchive(facade: ArchiveApplication, entry = "/arquivo") {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <ArchivePage application={facade} />
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe("Arquivo de anotações", () => {
  it("carrega os três conjuntos uma vez e mostra o estado de carregamento", () => {
    const pending = application({ books: () => new Promise(() => undefined) });
    renderArchive(pending.facade);
    expect(screen.getByText("Carregando Arquivo…")).toBeVisible();
    expect(pending.calls.books).toHaveBeenCalledOnce();
    expect(pending.calls.notes).toHaveBeenCalledOnce();
    expect(pending.calls.quotes).toHaveBeenCalledOnce();
  });

  it("diferencia Arquivo vazio", async () => {
    const empty = application({
      notes: () => Promise.resolve([]),
      quotes: () => Promise.resolve([]),
    });
    renderArchive(empty.facade);
    expect(
      await screen.findByRole("heading", { name: "Arquivo vazio" }),
    ).toBeVisible();
    expect(
      screen.getByText("0 resultados: 0 notas e 0 citações."),
    ).toBeVisible();
  });

  it("exibe grupos, conteúdo, livro, autor, página e datas sem N+1", async () => {
    const { calls, facade } = application();
    renderArchive(facade);
    expect(await screen.findByText(note.content)).toBeVisible();
    expect(screen.getByText(quote.content)).toBeVisible();
    expect(screen.getAllByRole("heading", { name: book.title })).toHaveLength(
      2,
    );
    expect(screen.getAllByText(book.author ?? "")).toHaveLength(2);
    expect(screen.getByText("Página 18")).toBeVisible();
    expect(screen.getAllByText(/Adicionada em/)).toHaveLength(2);
    expect(calls.books).toHaveBeenCalledOnce();
  });

  it("aceita citação sem página e autor ausente", async () => {
    const noAuthor = { ...book, author: undefined };
    const withoutPage = { ...quote, page: undefined };
    const { facade } = application({
      books: () => Promise.resolve([noAuthor]),
      quotes: () => Promise.resolve([withoutPage]),
    });
    renderArchive(facade);
    expect(await screen.findByText(withoutPage.content)).toBeVisible();
    expect(screen.queryByText(/Página 18/)).not.toBeInTheDocument();
    expect(screen.queryByText("Álvares")).not.toBeInTheDocument();
  });

  it("busca conteúdo, título e autor ignorando caixa, espaços e acentos", async () => {
    const user = userEvent.setup();
    const { calls, facade } = application();
    renderArchive(facade);
    const search = await screen.findByLabelText("Buscar no Arquivo");
    await user.type(search, "  MEMORIA  ");
    expect(screen.getByText(note.content)).toBeVisible();
    expect(screen.queryByText(quote.content)).not.toBeInTheDocument();
    await user.clear(search);
    await user.type(search, "jose");
    expect(screen.getByText(note.content)).toBeVisible();
    expect(screen.getByText(quote.content)).toBeVisible();
    await user.clear(search);
    await user.type(search, "alvares");
    expect(
      screen.getByText("2 resultados: 1 nota e 1 citação de 2 itens."),
    ).toBeVisible();
    expect(calls.books).toHaveBeenCalledOnce();
    expect(calls.notes).toHaveBeenCalledOnce();
    expect(calls.quotes).toHaveBeenCalledOnce();
  });

  it("mostra nenhum resultado e limpa a busca preservando foco", async () => {
    const user = userEvent.setup();
    const { facade } = application();
    renderArchive(facade, "/arquivo?q=inexistente");
    expect(
      await screen.findByRole("heading", {
        name: "Nenhuma anotação encontrada",
      }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Limpar busca" }));
    await waitFor(() =>
      expect(screen.getByLabelText("Buscar no Arquivo")).toHaveFocus(),
    );
    expect(screen.getByText(note.content)).toBeVisible();
    expect(screen.getByLabelText("URL atual")).toHaveTextContent("/arquivo");
  });

  it("leva ao livro com origem que preserva a busca", async () => {
    const { facade } = application();
    renderArchive(facade, "/arquivo?q=oceano");
    expect(
      await screen.findByRole("link", { name: `Abrir livro ${book.title}` }),
    ).toHaveAttribute("href", "/livros/book-1?from=%2Farquivo%3Fq%3Doceano");
  });

  it("trata livro relacionado ausente sem quebrar a página", async () => {
    const { facade } = application({ books: () => Promise.resolve([]) });
    renderArchive(facade);
    expect(
      await screen.findAllByRole("heading", {
        name: "Livro relacionado indisponível",
      }),
    ).toHaveLength(2);
    expect(
      screen.queryByRole("link", { name: /Abrir livro/ }),
    ).not.toBeInTheDocument();
  });

  it("apresenta falha pública sem desmontar outras rotas", async () => {
    const failed = application({
      notes: () =>
        Promise.reject(new ApplicationError("PERSISTENCE_FAILED", "interno")),
    });
    renderArchive(failed.facade);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível acessar o armazenamento",
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent("interno");
  });
});
