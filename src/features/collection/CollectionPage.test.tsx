import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
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

function LocationProbe() {
  const location = useLocation();
  return (
    <output aria-label="URL atual">{`${location.pathname}${location.search}`}</output>
  );
}

function renderCollection(
  result: Promise<readonly BookEntry[]>,
  entry = "/colecao",
) {
  const execute = vi.fn(() => result);
  const application: CollectionApplication = {
    queries: { listBookEntries: { execute } },
  };
  render(
    <MemoryRouter initialEntries={[entry]}>
      <CollectionPage application={application} />
      <LocationProbe />
    </MemoryRouter>,
  );
  return execute;
}

describe("Coleção", () => {
  it("mostra carregamento enquanto a consulta está pendente", () => {
    renderCollection(new Promise(() => undefined));
    expect(screen.getByText("Carregando Coleção…")).toBeVisible();
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
    expect(screen.getAllByText("Em andamento")).toHaveLength(2);
    expect(screen.getByText("50 de 200 páginas (25%)")).toBeVisible();
    expect(
      screen.getByRole("progressbar", { name: `Progresso de ${book.title}` }),
    ).toHaveValue(50);
    expect(
      screen.getByRole("link", { name: `Abrir detalhes de ${book.title}` }),
    ).toHaveAttribute("href", "/livros/book-1?from=%2Fcolecao");
    expect(execute).toHaveBeenCalledOnce();
  });

  it("abre o livro ao clicar na superfície do card fora do título", async () => {
    const user = userEvent.setup();
    renderCollection(Promise.resolve([book]));

    await user.click(await screen.findByText(book.author ?? ""));

    expect(screen.getByLabelText("URL atual")).toHaveTextContent(
      "/livros/book-1?from=%2Fcolecao",
    );
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

  it("reflete controles válidos na URL e preserva a origem no detalhe", async () => {
    const user = userEvent.setup();
    const execute = renderCollection(
      Promise.resolve([book]),
      "/colecao?q=cidade&status=in_progress&sort=title",
    );
    expect(await screen.findByLabelText("Buscar livros")).toHaveValue("cidade");
    expect(screen.getByLabelText("Status")).toHaveValue("in_progress");
    expect(screen.getByLabelText("Ordenar por")).toHaveValue("title");
    await user.clear(screen.getByLabelText("Buscar livros"));
    await user.type(screen.getByLabelText("Buscar livros"), "serras");
    await waitFor(() =>
      expect(screen.getByLabelText("URL atual")).toHaveTextContent("q=serras"),
    );
    expect(
      screen.getByRole("link", { name: /Abrir detalhes/ }),
    ).toHaveAttribute(
      "href",
      "/livros/book-1?from=%2Fcolecao%3Fstatus%3Din_progress%26sort%3Dtitle%26q%3Dserras",
    );
    expect(execute).toHaveBeenCalledOnce();
  });

  it("diferencia nenhum resultado e limpa os controles", async () => {
    const user = userEvent.setup();
    renderCollection(
      Promise.resolve([book]),
      "/colecao?q=ausente&status=paused",
    );
    expect(
      await screen.findByRole("heading", {
        name: "Nenhum livro corresponde aos controles",
      }),
    ).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Limpar busca e filtros" }),
    );
    expect(screen.getByRole("heading", { name: book.title })).toBeVisible();
    expect(screen.getByLabelText("URL atual")).toHaveTextContent("/colecao");
  });

  it("aplica fallback seguro para parâmetros inválidos", async () => {
    renderCollection(
      Promise.resolve([book]),
      "/colecao?status=unknown&sort=wrong",
    );
    expect(await screen.findByLabelText("Status")).toHaveValue("all");
    expect(screen.getByLabelText("Ordenar por")).toHaveValue("recent");
  });
});
