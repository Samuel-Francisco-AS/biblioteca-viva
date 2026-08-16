import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { ApplicationError } from "../../application";
import type { BookEntry, Note, Quote } from "../../domain";
import { BookDetailPage, type BookDetailApplication } from "./BookDetailPage";

const book: BookEntry = {
  id: "book-1",
  type: "book",
  title: "Livro de teste",
  author: "Autora",
  status: "in_progress",
  totalPages: 200,
  currentPage: 20,
  rating: 4,
  startedAt: "2020-01-10T12:00:00.000Z",
  createdAt: "2026-07-20T10:00:00.000Z",
  updatedAt: "2026-07-29T10:00:00.000Z",
  revision: 2,
};
const note: Note = {
  id: "note-1",
  entryId: book.id,
  content: "Uma observação",
  createdAt: "2026-07-29T11:00:00.000Z",
  updatedAt: "2026-07-29T11:00:00.000Z",
  revision: 1,
};
const quote: Quote = {
  id: "quote-1",
  entryId: book.id,
  content: "Uma passagem",
  page: 15,
  createdAt: "2026-07-29T12:00:00.000Z",
  updatedAt: "2026-07-29T12:00:00.000Z",
  revision: 1,
};

function submittedCurrentPage(input: unknown): number {
  if (
    typeof input === "object" &&
    input !== null &&
    "currentPage" in input &&
    typeof input.currentPage === "number"
  ) {
    return input.currentPage;
  }
  throw new Error("Payload de progresso inválido no double");
}

function submittedStatus(input: unknown): BookEntry["status"] {
  if (typeof input === "object" && input !== null && "status" in input) {
    switch (input.status) {
      case "planned":
      case "in_progress":
      case "paused":
      case "completed":
      case "abandoned":
        return input.status;
    }
  }
  throw new Error("Payload de status inválido no double");
}

function application(
  overrides: Partial<{
    get: (input: unknown) => Promise<BookEntry>;
    listNotes: (input: unknown) => Promise<readonly Note[]>;
    listQuotes: (input: unknown) => Promise<readonly Quote[]>;
    progress: (input: unknown) => Promise<BookEntry>;
    status: (input: unknown) => Promise<BookEntry>;
    addNote: (input: unknown) => Promise<Note>;
    addQuote: (input: unknown) => Promise<Quote>;
    deleteBook: (input: unknown) => Promise<{ readonly deleted: true }>;
  }> = {},
) {
  const calls = {
    get: vi.fn(overrides.get ?? (() => Promise.resolve(book))),
    listNotes: vi.fn(overrides.listNotes ?? (() => Promise.resolve([]))),
    listQuotes: vi.fn(overrides.listQuotes ?? (() => Promise.resolve([]))),
    progress: vi.fn(
      overrides.progress ??
        ((input: unknown) =>
          Promise.resolve({
            ...book,
            currentPage: submittedCurrentPage(input),
            revision: 3,
          })),
    ),
    status: vi.fn(
      overrides.status ??
        ((input: unknown) =>
          Promise.resolve({
            ...book,
            status: submittedStatus(input),
            revision: 3,
          })),
    ),
    addNote: vi.fn(overrides.addNote ?? (() => Promise.resolve(note))),
    addQuote: vi.fn(overrides.addQuote ?? (() => Promise.resolve(quote))),
    deleteBook: vi.fn(
      overrides.deleteBook ??
        (() => Promise.resolve({ deleted: true as const })),
    ),
  };
  const facade: BookDetailApplication = {
    commands: {
      addNote: { execute: calls.addNote },
      addQuote: { execute: calls.addQuote },
      changeBookStatus: { execute: calls.status },
      deleteBookEntry: { execute: calls.deleteBook },
      updateBookProgress: { execute: calls.progress },
    },
    queries: {
      getBookEntry: { execute: calls.get },
      listNotesByBook: { execute: calls.listNotes },
      listQuotesByBook: { execute: calls.listQuotes },
    },
  };
  return { calls, facade };
}

function renderDetail(facade: BookDetailApplication) {
  render(
    <MemoryRouter initialEntries={["/livros/book-1"]}>
      <Routes>
        <Route
          path="/livros/:id"
          element={<BookDetailPage application={facade} />}
        />
        <Route path="/colecao" element={<h2>Coleção após exclusão</h2>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function loaded(facade: BookDetailApplication) {
  renderDetail(facade);
  await screen.findByRole("heading", { name: book.title });
}

describe("detalhe do livro", () => {
  it("carrega pelo ID e apresenta dados, edição e retorno", async () => {
    const { calls, facade } = application();
    renderDetail(facade);
    expect(screen.getByRole("status")).toHaveTextContent("Carregando livro");
    expect(
      await screen.findByRole("heading", { name: book.title }),
    ).toBeVisible();
    expect(calls.get).toHaveBeenCalledWith({ id: "book-1" });
    expect(calls.listNotes).toHaveBeenCalledWith({ id: "book-1" });
    expect(screen.getByText("Autora")).toBeVisible();
    expect(screen.getByText("4 de 5")).toBeVisible();
    expect(screen.getByRole("link", { name: "Editar dados" })).toHaveAttribute(
      "href",
      "/livros/book-1/editar?from=%2Fcolecao",
    );
    expect(
      screen.getByRole("link", { name: "Voltar à Coleção" }),
    ).toHaveAttribute("href", "/colecao");
  });

  it("preserva a origem do Arquivo e usa Coleção como fallback seguro", async () => {
    const { facade } = application();
    render(
      <MemoryRouter
        initialEntries={["/livros/book-1?from=%2Farquivo%3Fq%3Doceano"]}
      >
        <Routes>
          <Route
            path="/livros/:id"
            element={<BookDetailPage application={facade} />}
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("link", { name: "Voltar ao Arquivo" }),
    ).toHaveAttribute("href", "/arquivo?q=oceano");
  });

  it("diferencia livro inexistente de falha de consulta", async () => {
    const missing = application({
      get: () => Promise.reject(new ApplicationError("NOT_FOUND", "interno")),
    });
    renderDetail(missing.facade);
    expect(
      await screen.findByRole("heading", { name: "Livro não encontrado" }),
    ).toBeVisible();
  });

  it("apresenta falha pública de consulta", async () => {
    const failed = application({
      get: () =>
        Promise.reject(new ApplicationError("PERSISTENCE_FAILED", "interno")),
    });
    renderDetail(failed.facade);
    expect(
      await screen.findByRole("heading", {
        name: "Não foi possível abrir o livro",
      }),
    ).toBeVisible();
    expect(screen.getByRole("alert")).not.toHaveTextContent("interno");
  });

  it("mostra históricos vazios e registros existentes", async () => {
    const existing = application({
      listNotes: () => Promise.resolve([note]),
      listQuotes: () =>
        Promise.resolve([quote, { ...quote, id: "quote-2", page: undefined }]),
    });
    await loaded(existing.facade);
    expect(screen.getByText(note.content)).toBeVisible();
    expect(screen.getAllByText(quote.content)).toHaveLength(2);
    expect(screen.getByText("Página 15")).toBeVisible();
    expect(screen.getAllByText(/Adicionada em/)).toHaveLength(3);
  });

  it("mostra estados vazios próprios para notas e citações", async () => {
    const { facade } = application();
    await loaded(facade);
    expect(screen.getByText("Nenhuma nota adicionada.")).toBeVisible();
    expect(screen.getByText("Nenhuma citação adicionada.")).toBeVisible();
  });
});

describe("exclusão permanente", () => {
  it("abre confirmação inline com título e aviso explícito, e cancelar preserva o detalhe", async () => {
    const user = userEvent.setup();
    const { calls, facade } = application();
    await loaded(facade);
    expect(screen.getByText(/notas, suas citações/u)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Excluir livro" }));
    expect(
      screen.getByRole("heading", {
        name: `Excluir permanentemente “${book.title}”?`,
      }),
    ).toBeVisible();
    expect(screen.getByText(/notas e citações vinculadas/u)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(calls.deleteBook).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: book.title })).toBeVisible();
  });

  it("executa uma vez, aguarda o banco e navega para Coleção após sucesso", async () => {
    let complete: ((result: { readonly deleted: true }) => void) | undefined;
    const pending = application({
      deleteBook: () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    });
    const user = userEvent.setup();
    await loaded(pending.facade);
    await user.click(screen.getByRole("button", { name: "Excluir livro" }));
    const confirm = screen.getByRole("button", {
      name: "Excluir permanentemente",
    });
    await user.dblClick(confirm);
    expect(pending.calls.deleteBook).toHaveBeenCalledOnce();
    expect(pending.calls.deleteBook).toHaveBeenCalledWith({ id: book.id });
    expect(screen.getByRole("button", { name: "Excluindo…" })).toBeDisabled();
    expect(screen.queryByText("Coleção após exclusão")).not.toBeInTheDocument();
    complete?.({ deleted: true });
    expect(
      await screen.findByRole("heading", { name: "Coleção após exclusão" }),
    ).toBeVisible();
  });

  it("mantém a página utilizável quando a exclusão falha", async () => {
    const failed = application({
      deleteBook: () =>
        Promise.reject(new ApplicationError("DELETE_BOOK_FAILED", "Dexie")),
    });
    const user = userEvent.setup();
    await loaded(failed.facade);
    await user.click(screen.getByRole("button", { name: "Excluir livro" }));
    await user.click(
      screen.getByRole("button", { name: "Excluir permanentemente" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Nada foi removido/u,
    );
    expect(screen.getByRole("heading", { name: book.title })).toBeVisible();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeEnabled();
    expect(screen.getByRole("alert")).not.toHaveTextContent("Dexie");
  });
});

describe("progresso", () => {
  it("apresenta porcentagem, barra, páginas lidas e restantes", async () => {
    const { facade } = application();
    await loaded(facade);
    expect(screen.getByText("10% concluído")).toBeVisible();
    expect(
      screen.getByRole("progressbar", { name: "10% concluído" }),
    ).toHaveValue(20);
    expect(
      screen.getByText("20 de 200 páginas", { exact: true }),
    ).toBeVisible();
    expect(screen.getByText("180 páginas restantes")).toBeVisible();
  });

  it.each([
    [0, "0% concluído", "200 páginas restantes"],
    [200, "100% concluído", "0 páginas restantes"],
    [250, "100% concluído", "0 páginas restantes"],
  ] as const)(
    "limita a apresentação para a página %i",
    async (currentPage, percentage, remaining) => {
      const { facade } = application({
        get: () => Promise.resolve({ ...book, currentPage }),
      });
      await loaded(facade);
      expect(screen.getByText(percentage)).toBeVisible();
      expect(screen.getByText(remaining)).toBeVisible();
      expect(screen.getByRole("progressbar")).toHaveValue(
        Math.min(currentPage, book.totalPages ?? currentPage),
      );
    },
  );

  it("mostra página atual sem porcentagem quando o total é desconhecido", async () => {
    const { facade } = application({
      get: () =>
        Promise.resolve({ ...book, currentPage: 12, totalPages: undefined }),
    });
    await loaded(facade);
    expect(screen.getByText(/Página atual:/)).toHaveTextContent("12");
    expect(
      screen.getByText("O total de páginas não foi definido."),
    ).toBeVisible();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByText(/% concluído/)).not.toBeInTheDocument();
  });

  it("envia payload correto e atualiza a apresentação sem reload", async () => {
    const user = userEvent.setup();
    const { calls, facade } = application();
    await loaded(facade);
    const field = screen.getByLabelText(/Página atual/);
    await user.clear(field);
    await user.type(field, "45");
    await user.click(screen.getByRole("button", { name: "Salvar progresso" }));
    await waitFor(() =>
      expect(calls.progress).toHaveBeenCalledWith({
        id: book.id,
        currentPage: 45,
      }),
    );
    expect(screen.getByText("45 de 200 páginas (23%)")).toBeVisible();
  });

  it("rejeita página inválida ou acima do total sem chamar o caso de uso", async () => {
    const user = userEvent.setup();
    const { calls, facade } = application();
    await loaded(facade);
    const field = screen.getByLabelText(/Página atual/);
    await user.clear(field);
    await user.type(field, "201");
    await user.click(screen.getByRole("button", { name: "Salvar progresso" }));
    expect(
      screen.getByText("A página atual não pode ultrapassar 200."),
    ).toBeVisible();
    expect(calls.progress).not.toHaveBeenCalled();
    await user.clear(field);
    await user.type(field, "1.5");
    await user.click(screen.getByRole("button", { name: "Salvar progresso" }));
    expect(calls.progress).not.toHaveBeenCalled();
  });

  it("preserva valor após falha", async () => {
    const user = userEvent.setup();
    const failed = application({
      progress: () =>
        Promise.reject(new ApplicationError("CONFLICT", "interno")),
    });
    await loaded(failed.facade);
    const field = screen.getByLabelText(/Página atual/);
    await user.clear(field);
    await user.type(field, "33");
    await user.click(screen.getByRole("button", { name: "Salvar progresso" }));
    expect(await screen.findByText(/O livro mudou/)).toBeVisible();
    expect(field).toHaveValue(33);
  });

  it("bloqueia envios duplicados enquanto pendente", async () => {
    let resolve: ((value: BookEntry) => void) | undefined;
    const pending = application({
      progress: () =>
        new Promise<BookEntry>((done) => {
          resolve = done;
        }),
    });
    await loaded(pending.facade);
    const form = screen
      .getByRole("button", { name: "Salvar progresso" })
      .closest("form");
    if (!form) throw new Error("Formulário não encontrado");
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    expect(pending.calls.progress).toHaveBeenCalledOnce();
    resolve?.(book);
  });
});

describe("status", () => {
  it("oferece apenas transições permitidas e conclui", async () => {
    const user = userEvent.setup();
    const { calls, facade } = application();
    await loaded(facade);
    expect(
      screen.getByRole("button", { name: "Pausar leitura" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Concluir leitura" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Retomar leitura" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Concluir leitura" }));
    await waitFor(() =>
      expect(calls.status).toHaveBeenCalledWith({
        id: book.id,
        status: "completed",
      }),
    );
    expect(screen.getByText("Status atual: Concluído.")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Retomar leitura" }),
    ).toBeVisible();
  });

  it("preserva o detalhe e apresenta erro de transição", async () => {
    const user = userEvent.setup();
    const failed = application({
      status: () =>
        Promise.reject(new ApplicationError("VALIDATION_FAILED", "interno")),
    });
    await loaded(failed.facade);
    await user.click(screen.getByRole("button", { name: "Pausar leitura" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Revise os dados",
    );
    expect(screen.getByRole("heading", { name: book.title })).toBeVisible();
  });

  it("bloqueia cliques repetidos enquanto a mudança está pendente", async () => {
    const user = userEvent.setup();
    const pending = application({ status: () => new Promise(() => undefined) });
    await loaded(pending.facade);
    const button = screen.getByRole("button", { name: "Pausar leitura" });
    await user.dblClick(button);
    expect(pending.calls.status).toHaveBeenCalledOnce();
    expect(button).toBeDisabled();
  });
});

describe("notas e citações", () => {
  it("adiciona nota, limpa o campo e atualiza o histórico", async () => {
    const user = userEvent.setup();
    const { calls, facade } = application();
    await loaded(facade);
    const field = screen.getByLabelText("Nota (obrigatório)");
    await user.type(field, "Minha nota");
    await user.click(screen.getByRole("button", { name: "Adicionar nota" }));
    await waitFor(() =>
      expect(calls.addNote).toHaveBeenCalledWith({
        entryId: book.id,
        content: "Minha nota",
      }),
    );
    expect(field).toHaveValue("");
    expect(screen.getByText(note.content)).toBeVisible();
  });

  it("rejeita nota vazia e preserva conteúdo após falha", async () => {
    const user = userEvent.setup();
    const failed = application({
      addNote: () =>
        Promise.reject(new ApplicationError("PERSISTENCE_FAILED", "interno")),
    });
    await loaded(failed.facade);
    await user.click(screen.getByRole("button", { name: "Adicionar nota" }));
    expect(screen.getByText("Escreva a nota antes de salvar.")).toBeVisible();
    expect(failed.calls.addNote).not.toHaveBeenCalled();
    const field = screen.getByLabelText("Nota (obrigatório)");
    await user.type(field, "Não perder");
    await user.click(screen.getByRole("button", { name: "Adicionar nota" }));
    expect(await screen.findByText(/Não foi possível acessar/)).toBeVisible();
    expect(field).toHaveValue("Não perder");
  });

  it("adiciona citação com página e converte página vazia em ausência", async () => {
    const user = userEvent.setup();
    const { calls, facade } = application();
    await loaded(facade);
    const content = screen.getByLabelText("Citação (obrigatório)");
    const page = screen.getByLabelText("Página (opcional)");
    await user.type(content, "Com página");
    await user.type(page, "18");
    await user.click(screen.getByRole("button", { name: "Adicionar citação" }));
    expect(calls.addQuote).toHaveBeenLastCalledWith({
      entryId: book.id,
      content: "Com página",
      page: 18,
    });
    await user.type(content, "Sem página");
    await user.click(screen.getByRole("button", { name: "Adicionar citação" }));
    expect(calls.addQuote).toHaveBeenLastCalledWith({
      entryId: book.id,
      content: "Sem página",
    });
  });

  it("rejeita página inválida e preserva a citação após falha", async () => {
    const user = userEvent.setup();
    const failed = application({
      addQuote: () =>
        Promise.reject(new ApplicationError("PERSISTENCE_FAILED", "interno")),
    });
    await loaded(failed.facade);
    const content = screen.getByLabelText("Citação (obrigatório)");
    const page = screen.getByLabelText("Página (opcional)");
    await user.type(content, "Guardar");
    await user.type(page, "201");
    await user.click(screen.getByRole("button", { name: "Adicionar citação" }));
    expect(
      screen.getByText("A página não pode ultrapassar 200."),
    ).toBeVisible();
    expect(failed.calls.addQuote).not.toHaveBeenCalled();
    await user.clear(page);
    await user.click(screen.getByRole("button", { name: "Adicionar citação" }));
    expect(await screen.findByText(/Não foi possível acessar/)).toBeVisible();
    expect(content).toHaveValue("Guardar");
  });

  it("bloqueia envios duplicados de nota e citação", async () => {
    const pending = application({
      addNote: () => new Promise(() => undefined),
      addQuote: () => new Promise(() => undefined),
    });
    const user = userEvent.setup();
    await loaded(pending.facade);
    await user.type(screen.getByLabelText("Nota (obrigatório)"), "Uma nota");
    const noteForm = screen
      .getByRole("button", { name: "Adicionar nota" })
      .closest("form");
    if (!noteForm) throw new Error("Formulário de nota não encontrado");
    noteForm.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    noteForm.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    expect(pending.calls.addNote).toHaveBeenCalledOnce();

    await user.type(
      screen.getByLabelText("Citação (obrigatório)"),
      "Uma citação",
    );
    const quoteForm = screen
      .getByRole("button", { name: "Adicionar citação" })
      .closest("form");
    if (!quoteForm) throw new Error("Formulário de citação não encontrado");
    quoteForm.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    quoteForm.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    expect(pending.calls.addQuote).toHaveBeenCalledOnce();
  });
});
