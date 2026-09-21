import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { ApplicationError } from "./application";
import type { BookEntry } from "./domain";
import type { WorldHostProps } from "./features/library/WorldHost";
import { LibraryPage, type LibraryApplication } from "./pages";

let latestWorldHostProps: WorldHostProps | undefined;

vi.mock("./features/library/WorldHost", () => ({
  WorldHost: (props: WorldHostProps) => {
    latestWorldHostProps = props;
    return <div data-testid="world-host-stub" />;
  },
}));

const firstBook: BookEntry = {
  author: "Eça de Queirós",
  createdAt: "2026-07-20T10:00:00.000Z",
  currentPage: 50,
  favorite: false,
  id: "book-1",
  revision: 2,
  status: "in_progress",
  tagIds: [],
  title: "A cidade e as serras",
  totalPages: 200,
  type: "book",
  updatedAt: "2026-07-29T10:00:00.000Z",
};

const secondBook: BookEntry = {
  ...firstBook,
  author: undefined,
  createdAt: "2026-07-21T10:00:00.000Z",
  id: "book-2",
  title: "Memórias póstumas",
};

function renderLibrary(result: Promise<readonly BookEntry[]>, entry = "/") {
  latestWorldHostProps = undefined;
  const execute = vi.fn(() => result);
  const application: LibraryApplication = {
    queries: { listBookEntries: { execute } },
  };
  render(
    <MemoryRouter initialEntries={[entry]}>
      <LibraryPage application={application} />
    </MemoryRouter>,
  );
  return execute;
}

function worldHostProps(): WorldHostProps {
  if (!latestWorldHostProps) throw new Error("WorldHost não foi montado.");
  return latestWorldHostProps;
}

describe("Página Biblioteca", () => {
  it("apresenta fallback seguro quando a aplicação não está disponível", () => {
    render(
      <MemoryRouter>
        <LibraryPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível iniciar o armazenamento local.",
    );
    expect(screen.queryByTestId("world-host-stub")).not.toBeInTheDocument();
  });

  it("mantém loading separado de uma área vazia", () => {
    const execute = renderLibrary(new Promise(() => undefined));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Carregando área de leitura…",
    );
    expect(screen.queryByTestId("world-host-stub")).not.toBeInTheDocument();
    expect(execute).toHaveBeenCalledOnce();
  });

  it("apresenta erro público seguro quando a consulta falha", async () => {
    renderLibrary(
      Promise.reject(
        new ApplicationError("PERSISTENCE_FAILED", "detalhe interno"),
      ),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível acessar o armazenamento",
    );
    expect(screen.queryByTestId("world-host-stub")).not.toBeInTheDocument();
  });

  it("projeta o vazio para o host sem inventar livros e oferece criação", async () => {
    renderLibrary(Promise.resolve([]));

    await screen.findByTestId("world-host-stub");
    expect(worldHostProps().readingAreaBooks).toEqual([]);
    expect(
      screen.getByRole("heading", {
        name: "Ainda não há livros na área de leitura",
      }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Criar livro" })).toHaveAttribute(
      "href",
      "/novo-registro",
    );
  });

  it("usa a projeção neutra, preserva autor e abre pelo entryId", async () => {
    const execute = renderLibrary(Promise.resolve([firstBook]), "/");

    await screen.findByTestId("world-host-stub");
    expect(worldHostProps().readingAreaBooks).toEqual([
      expect.objectContaining({
        author: firstBook.author,
        entryId: firstBook.id,
        instanceId: "reading-book:book-1",
        modelTypeId: "book-volume",
        readingProgress: { currentPage: 50, totalPages: 200 },
        title: firstBook.title,
      }),
    ]);
    expect(screen.getByRole("link", { name: firstBook.title })).toHaveAttribute(
      "href",
      "/registros/book-1?from=%2F",
    );
    expect(screen.getByText(firstBook.author ?? "")).toBeVisible();
    expect(execute).toHaveBeenCalledOnce();
  });

  it("mantém overflow acessível sem oferecer seleção visual inexistente", async () => {
    renderLibrary(Promise.resolve([firstBook, secondBook]));
    await screen.findByTestId("world-host-stub");
    act(() => {
      worldHostProps().onStatusChange?.("ready");
      worldHostProps().onSelectableObjectsChange?.([
        {
          entryId: firstBook.id,
          id: "reading-book:book-1",
          label: firstBook.title,
        },
      ]);
    });

    expect(
      screen.getByText(
        "1 livro representado; 1 livro fora da capacidade visual atual.",
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: secondBook.title }),
    ).toHaveAttribute("href", "/registros/book-2?from=%2F");
    expect(screen.getByText("Autor não informado")).toBeVisible();
    expect(
      screen.getAllByText("Fora da capacidade visual atual."),
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("button", { name: "Selecionar no ambiente" }),
    ).toHaveLength(1);
  });

  it("pede a seleção do livro representado ao runtime e reflete a seleção recebida", async () => {
    const user = userEvent.setup();
    renderLibrary(Promise.resolve([firstBook]));
    await screen.findByTestId("world-host-stub");
    act(() => {
      worldHostProps().onStatusChange?.("ready");
      worldHostProps().onSelectableObjectsChange?.([
        {
          entryId: firstBook.id,
          id: "reading-book:book-1",
          label: firstBook.title,
        },
      ]);
    });

    await user.click(
      screen.getByRole("button", { name: "Selecionar no ambiente" }),
    );
    expect(worldHostProps().selectedObjectId).toBe("reading-book:book-1");
    act(() => {
      worldHostProps().onSelectionChange?.({
        entryId: firstBook.id,
        id: "reading-book:book-1",
        label: firstBook.title,
      });
    });

    expect(
      screen.getByText(`Livro selecionado: ${firstBook.title}.`),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Abrir registro" }),
    ).toHaveAttribute("href", "/registros/book-1?from=%2F");
    expect(
      screen.getByRole("button", { name: "Selecionar no ambiente" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("não oferece registro convencional para seleção técnica sem entryId", async () => {
    renderLibrary(Promise.resolve([firstBook]));
    await screen.findByTestId("world-host-stub");
    act(() => {
      worldHostProps().onSelectionChange?.({
        id: "reading-shelf-01",
        label: "Estante de leitura 1",
      });
    });

    expect(
      screen.queryByRole("link", { name: "Abrir registro" }),
    ).not.toBeInTheDocument();
  });
});
