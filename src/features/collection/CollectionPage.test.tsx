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
  favorite: false,
  tagIds: [],
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
    queries: {
      listLibraryEntries: { execute },
      listTags: { execute: vi.fn(() => Promise.resolve([])) },
    },
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

  it("usa o frontispício como título único e mostra o acesso compacto ao Arcanário", async () => {
    renderCollection(Promise.resolve([book]));
    await screen.findByRole("heading", { name: book.title });
    expect(
      screen.getByRole("heading", { name: "Acervo encantado" }),
    ).toBeVisible();
    expect(screen.queryByText("Seus registros")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /^Coleção$/ }),
    ).not.toBeInTheDocument();
    const arcanarium = screen.getByRole("link", {
      name: /Cartas, Ecos e Relicário.*Arcanário/,
    });
    expect(arcanarium).toHaveAttribute("href", "/arcanario");
    expect(arcanarium).toHaveClass("collection-arcana-link");
    expect(screen.getByRole("button", { name: "Busca" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Novo registro" })).toBeVisible();
  });

  it("mostra estado vazio com ação para cadastrar", async () => {
    renderCollection(Promise.resolve([]));
    expect(
      await screen.findByText("Seu primeiro registro começa aqui"),
    ).toBeVisible();
    expect(screen.getByRole("link", {
      name: /Cartas, Ecos e Relicário.*Arcanário/,
    })).toHaveClass("collection-arcana-link");
    expect(
      screen.getByRole("link", { name: "Criar primeiro registro" }),
    ).toHaveAttribute("href", "/novo-registro");
  });

  it("lista dados, status, progresso conhecido e link de detalhe", async () => {
    const execute = renderCollection(Promise.resolve([book]));
    expect(
      await screen.findByRole("heading", { name: book.title }),
    ).toBeVisible();
    expect(screen.getByText(book.author ?? "")).toBeVisible();
    expect(
      screen.getByText("Em andamento", { selector: ".status-badge" }),
    ).toBeVisible();
    expect(screen.getByText("50 de 200 páginas (25%)")).toBeVisible();
    expect(
      screen.getByRole("progressbar", { name: `Progresso de ${book.title}` }),
    ).toHaveValue(50);
    expect(
      screen.getByRole("link", { name: `Abrir detalhes de ${book.title}` }),
    ).toHaveAttribute("href", "/registros/book-1?from=%2Fcolecao");
    expect(execute).toHaveBeenCalledOnce();
  });

  it("abre o livro ao clicar na superfície do card fora do título", async () => {
    const user = userEvent.setup();
    renderCollection(Promise.resolve([book]));

    await user.click(await screen.findByText(book.author ?? ""));

    expect(screen.getByLabelText("URL atual")).toHaveTextContent(
      "/registros/book-1?from=%2Fcolecao",
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
    expect(await screen.findByLabelText("Buscar registros")).toHaveValue(
      "cidade",
    );
    expect(screen.getByLabelText("Status")).toHaveTextContent("Em andamento");
    expect(screen.getByLabelText("Ordenar por")).toHaveTextContent("Título");
    await user.clear(screen.getByLabelText("Buscar registros"));
    await user.type(screen.getByLabelText("Buscar registros"), "serras");
    await waitFor(() =>
      expect(screen.getByLabelText("URL atual")).toHaveTextContent("q=serras"),
    );
    expect(
      screen.getByRole("link", { name: /Abrir detalhes/ }),
    ).toHaveAttribute(
      "href",
      "/registros/book-1?from=%2Fcolecao%3Fstatus%3Din_progress%26sort%3Dtitle%26q%3Dserras",
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
        name: "Nenhum registro corresponde aos controles",
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
    expect(await screen.findByLabelText("Status")).toHaveTextContent(
      "Todos os status",
    );
    expect(screen.getByLabelText("Ordenar por")).toHaveTextContent(
      "Atualização recente",
    );
  });
});

it("R9 never resurfaces a deleted snapshot while remount revalidates", async () => {
  const execute = vi
    .fn<() => Promise<readonly BookEntry[]>>()
    .mockResolvedValueOnce([book]);
  const application: CollectionApplication = {
    queries: {
      listLibraryEntries: { execute },
      listTags: { execute: () => Promise.resolve([]) },
    },
  };
  const first = render(
    <MemoryRouter>
      <CollectionPage application={application} />
    </MemoryRouter>,
  );
  expect(await screen.findByText(book.title)).toBeVisible();
  first.unmount();
  let resolve!: (entries: readonly BookEntry[]) => void;
  execute.mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  render(
    <MemoryRouter>
      <CollectionPage application={application} />
    </MemoryRouter>,
  );
  expect(screen.queryByText(book.title)).not.toBeInTheDocument();
  expect(screen.getByText("Carregando Coleção…")).toBeVisible();
  resolve([]);
  expect(
    await screen.findByText("Seu primeiro registro começa aqui"),
  ).toBeVisible();
});
