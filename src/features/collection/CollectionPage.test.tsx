import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { ApplicationError } from "../../application";
import type { BookEntry } from "../../domain";
import { CollectionPage, type CollectionApplication } from "./CollectionPage";

const book: BookEntry = {
  id: "book-1",
  type: "book",
  title: "A cidade e as serras",
  author: "Eça de Queirós",
  status: "in_progress",
  totalPages: 200,
  currentPage: 50,
  createdAt: "2026-07-20T10:00:00.000Z",
  updatedAt: "2026-07-29T10:00:00.000Z",
  revision: 2,
};

function renderCollection(result: Promise<readonly BookEntry[]>) {
  const execute = vi.fn(() => result);
  const application: CollectionApplication = {
    queries: { listBookEntries: { execute } },
  };
  render(
    <MemoryRouter>
      <CollectionPage application={application} />
    </MemoryRouter>,
  );
  return execute;
}

describe("Coleção", () => {
  it("mostra carregamento enquanto a consulta está pendente", () => {
    renderCollection(new Promise(() => undefined));
    expect(screen.getByRole("status")).toHaveTextContent("Carregando Coleção");
  });

  it("mostra estado vazio com ação para cadastrar", async () => {
    renderCollection(Promise.resolve([]));
    expect(
      await screen.findByText("Seu primeiro livro começa aqui"),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Cadastrar primeiro livro" }),
    ).toHaveAttribute("href", "/novo-livro");
  });

  it("lista dados, status, progresso conhecido e link de detalhe", async () => {
    const execute = renderCollection(Promise.resolve([book]));
    expect(
      await screen.findByRole("heading", { name: book.title }),
    ).toBeVisible();
    expect(screen.getByText(book.author ?? "")).toBeVisible();
    expect(screen.getByText("Em andamento")).toBeVisible();
    expect(screen.getByText("50 de 200 páginas (25%)")).toBeVisible();
    expect(
      screen.getByRole("progressbar", { name: `Progresso de ${book.title}` }),
    ).toHaveValue(50);
    expect(screen.getByText(/Última atualização:/)).toBeVisible();
    expect(
      screen.getByRole("link", { name: `Abrir detalhes de ${book.title}` }),
    ).toHaveAttribute("href", "/livros/book-1");
    expect(execute).toHaveBeenCalledOnce();
  });

  it("trata autor e total de páginas ausentes sem fabricar porcentagem", async () => {
    renderCollection(
      Promise.resolve([
        { ...book, author: undefined, totalPages: undefined, currentPage: 12 },
      ]),
    );
    expect(await screen.findByText("Autor não informado")).toBeVisible();
    expect(
      screen.getByText("12 páginas lidas; total não informado"),
    ).toBeVisible();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.getByText(/Porcentagem indisponível/)).toBeVisible();
  });

  it("limita o progresso visual ao total mesmo diante de um registro inconsistente", async () => {
    renderCollection(Promise.resolve([{ ...book, currentPage: 250 }]));
    expect(await screen.findByRole("progressbar")).toHaveValue(200);
    expect(screen.getByText("250 de 200 páginas (100%)")).toBeVisible();
  });

  it("apresenta erro público ao falhar a listagem", async () => {
    renderCollection(
      Promise.reject(
        new ApplicationError("PERSISTENCE_FAILED", "detalhe interno"),
      ),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível acessar o armazenamento",
    );
  });
});
