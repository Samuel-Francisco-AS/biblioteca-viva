import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { ApplicationError } from "./application";
import type { BookEntry, LibraryEntry } from "./domain";
import {
  createMovie,
  createPhysicalActivity,
  createSeries,
  createStudy,
  createWork,
} from "./domain";
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

function renderLibrary(result: Promise<readonly LibraryEntry[]>, entry = "/") {
  latestWorldHostProps = undefined;
  const execute = vi.fn(() => result);
  const application: LibraryApplication = {
    queries: { listLibraryEntries: { execute } },
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

function selectionButton(title: string): HTMLButtonElement {
  return screen.getByRole("button", {
    name: new RegExp(`Selecionar no ambiente: .* ${title}$`),
  });
}

const sixEntries: LibraryEntry[] = [
  firstBook,
  createMovie({
    createdAt: firstBook.createdAt,
    id: "movie-1",
    title: "Filme fictício",
  }),
  createSeries({
    createdAt: firstBook.createdAt,
    id: "series-1",
    title: "Série fictícia",
    episodesWatched: 2,
  }),
  createStudy({
    createdAt: firstBook.createdAt,
    id: "study-1",
    title: "Estudo fictício",
    progressUnit: "modules",
    progressCurrent: 1,
  }),
  createPhysicalActivity({
    createdAt: firstBook.createdAt,
    id: "activity-1",
    title: "Atividade fictícia",
    category: "cardio",
  }),
  createWork({
    createdAt: firstBook.createdAt,
    id: "work-1",
    title: "Trabalho fictício",
  }),
];

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
      "Carregando Biblioteca…",
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
    expect(
      worldHostProps().libraryWorldSnapshot?.categories[0].entries,
    ).toEqual([]);
    expect(
      screen.getByRole("heading", {
        name: "Ainda não há registros na Biblioteca",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Criar registro" }),
    ).toHaveAttribute("href", "/novo-registro");
  });

  it("usa a projeção neutra, preserva autor e abre pelo entryId", async () => {
    const execute = renderLibrary(Promise.resolve([firstBook]), "/");

    await screen.findByTestId("world-host-stub");
    expect(
      worldHostProps().libraryWorldSnapshot?.categories[0].entries,
    ).toEqual([
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

  it("consulta os seis tipos uma vez e entrega o snapshot composto ordenado", async () => {
    const entries: LibraryEntry[] = [
      createWork({
        createdAt: firstBook.createdAt,
        id: "work-1",
        title: "Trabalho fictício",
      }),
      createPhysicalActivity({
        createdAt: firstBook.createdAt,
        id: "activity-1",
        title: "Atividade fictícia",
        category: "cardio",
      }),
      createStudy({
        createdAt: firstBook.createdAt,
        id: "study-1",
        title: "Estudo fictício",
        progressUnit: "modules",
        progressCurrent: 1,
      }),
      createSeries({
        createdAt: firstBook.createdAt,
        id: "series-1",
        title: "Série fictícia",
        episodesWatched: 2,
      }),
      createMovie({
        createdAt: firstBook.createdAt,
        id: "movie-1",
        title: "Filme fictício",
      }),
      firstBook,
    ];
    const execute = renderLibrary(Promise.resolve(entries));
    await screen.findByTestId("world-host-stub");
    const world = worldHostProps().libraryWorldSnapshot;
    expect(execute).toHaveBeenCalledOnce();
    expect(world?.categories.map(({ type }) => type)).toEqual([
      "book",
      "movie",
      "series",
      "study",
      "physical_activity",
      "work",
    ]);
    expect(
      world?.categories.map(
        ({ entries: categoryEntries }) => categoryEntries.length,
      ),
    ).toEqual([1, 1, 1, 1, 1, 1]);
    expect(world?.categories[0].entries[0]?.entryId).toBe(firstBook.id);
    expect(world?.categories[1].entries[0]?.instanceId).toBe(
      "library-movie:movie-1",
    );
    expect(Object.isFrozen(world)).toBe(true);
    expect(worldHostProps().readingAreaBooks).toBeUndefined();
  });

  it("organiza os seis tipos, mantém categorias vazias e abre cada registro pelo entryId", async () => {
    const execute = renderLibrary(Promise.resolve(sixEntries), "/?q=ficticio");
    await screen.findByTestId("world-host-stub");
    expect(execute).toHaveBeenCalledOnce();
    expect(
      screen
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual([
      "Livros da área de leitura",
      "Filmes",
      "Séries",
      "Estudos",
      "Atividades físicas",
      "Trabalhos",
    ]);
    for (const entry of sixEntries) {
      expect(screen.getByRole("link", { name: entry.title })).toHaveAttribute(
        "href",
        `/registros/${entry.id}?from=%2F%3Fq%3Dficticio`,
      );
    }
    expect(
      screen.queryByText("Ainda não há registros na Biblioteca"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Eça de Queirós")).toBeVisible();
  });

  it("não considera a coleção vazia quando só há filme", async () => {
    renderLibrary(Promise.resolve([sixEntries[1]]));
    await screen.findByTestId("world-host-stub");
    expect(screen.getByRole("heading", { name: "Filmes" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Filme fictício" })).toBeVisible();
    expect(
      screen.getAllByText("Nenhum registro nesta categoria."),
    ).toHaveLength(5);
    expect(
      screen.queryByText("Ainda não há registros na Biblioteca"),
    ).not.toBeInTheDocument();
  });

  it("seleciona entre tipos pelo catálogo real e rejeita identidade inválida", async () => {
    const user = userEvent.setup();
    renderLibrary(Promise.resolve(sixEntries));
    const host = await screen.findByTestId("world-host-stub");
    const catalog = [
      { id: "reading-book:book-1", entryId: "book-1", label: "Livro" },
      { id: "library-movie:movie-1", entryId: "movie-1", label: "Filme" },
      { id: "library-series:series-1", entryId: "series-1", label: "Série" },
    ];
    act(() => {
      worldHostProps().onSelectableObjectsChange?.(catalog);
      worldHostProps().onStatusChange?.("ready");
    });
    expect(selectionButton("Filme fictício")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /Estudo fictício/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByText("Fora da capacidade visual atual."),
    ).toHaveLength(3);

    await user.click(selectionButton("Filme fictício"));
    expect(worldHostProps().selectedObjectId).toBe("library-movie:movie-1");
    act(() =>
      worldHostProps().onSelectionChange?.({ ...catalog[1], label: "Filme" }),
    );
    expect(
      screen.getByText("Filme selecionado: Filme fictício."),
    ).toBeVisible();
    expect(selectionButton("Filme fictício")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("link", { name: "Abrir registro" }),
    ).toHaveAttribute("href", "/registros/movie-1?from=%2F");

    act(() =>
      worldHostProps().onSelectionChange?.({ ...catalog[2], label: "Série" }),
    );
    expect(
      screen.getByText("Série selecionada: Série fictícia."),
    ).toBeVisible();
    expect(selectionButton("Filme fictício")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(selectionButton("Série fictícia")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByTestId("world-host-stub")).toBe(host);

    act(() =>
      worldHostProps().onSelectionChange?.({
        id: "library-movie:movie-1",
        entryId: "work-1",
        label: "Obsoleto",
      }),
    );
    expect(
      screen.queryByRole("link", { name: "Abrir registro" }),
    ).not.toBeInTheDocument();
    act(() =>
      worldHostProps().onSelectionChange?.({
        id: "reading-shelf-01",
        label: "Estante",
      }),
    );
    expect(
      screen.queryByRole("link", { name: "Abrir registro" }),
    ).not.toBeInTheDocument();
  });

  it("mantém abertura convencional após falha do ambiente sem rotular tudo como overflow", async () => {
    renderLibrary(Promise.resolve(sixEntries));
    await screen.findByTestId("world-host-stub");
    act(() => {
      worldHostProps().onSelectableObjectsChange?.([
        { id: "library-movie:movie-1", entryId: "movie-1", label: "Filme" },
      ]);
      worldHostProps().onStatusChange?.("failed");
    });
    expect(
      screen.getByRole("link", { name: "Trabalho fictício" }),
    ).toHaveAttribute("href", "/registros/work-1?from=%2F");
    expect(
      screen.queryByRole("button", { name: /Selecionar no ambiente:/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Fora da capacidade visual atual."),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByText("Representação visual indisponível."),
    ).toHaveLength(6);
  });

  it("trata falha da projeção sem publicar host ou vazio", async () => {
    renderLibrary(Promise.resolve([firstBook, firstBook]));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Algo inesperado aconteceu",
    );
    expect(screen.queryByTestId("world-host-stub")).not.toBeInTheDocument();
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
      screen.getAllByRole("button", { name: /Selecionar no ambiente:/ }),
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

    await user.click(selectionButton(firstBook.title));
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
    expect(selectionButton(firstBook.title)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("ressolicita um livro após seleção do canvas e sincroniza seleção técnica ou vazia", async () => {
    const user = userEvent.setup();
    renderLibrary(Promise.resolve([firstBook, secondBook]));
    const host = await screen.findByTestId("world-host-stub");
    act(() => {
      worldHostProps().onStatusChange?.("ready");
      worldHostProps().onSelectableObjectsChange?.([
        {
          entryId: firstBook.id,
          id: "reading-book:book-1",
          label: firstBook.title,
        },
        {
          entryId: secondBook.id,
          id: "reading-book:book-2",
          label: secondBook.title,
        },
      ]);
    });

    const selectionButtons = screen.getAllByRole("button", {
      name: /Selecionar no ambiente:/,
    });
    await user.click(selectionButtons[0]);
    expect(worldHostProps().selectedObjectId).toBe("reading-book:book-1");

    act(() => {
      worldHostProps().onSelectionChange?.({
        entryId: secondBook.id,
        id: "reading-book:book-2",
        label: secondBook.title,
      });
    });
    expect(
      screen.getByText(`Livro selecionado: ${secondBook.title}.`),
    ).toBeVisible();
    expect(worldHostProps().selectedObjectId).toBe("reading-book:book-2");
    expect(selectionButtons[0]).toHaveAttribute("aria-pressed", "false");
    expect(selectionButtons[1]).toHaveAttribute("aria-pressed", "true");

    await user.click(selectionButtons[0]);
    expect(worldHostProps().selectedObjectId).toBe("reading-book:book-1");
    expect(screen.getByTestId("world-host-stub")).toBe(host);

    act(() => {
      worldHostProps().onSelectionChange?.({
        id: "reading-shelf-01",
        label: "Estante de leitura 1",
      });
    });
    expect(worldHostProps().selectedObjectId).toBe("reading-shelf-01");
    expect(
      screen.queryByRole("link", { name: "Abrir registro" }),
    ).not.toBeInTheDocument();

    act(() => {
      worldHostProps().onSelectionChange?.(null);
    });
    expect(worldHostProps().selectedObjectId).toBeNull();

    await user.click(selectionButtons[1]);
    expect(worldHostProps().selectedObjectId).toBe("reading-book:book-2");
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

  it("troca de application sem vazar snapshot, erro, catálogo ou seleção", async () => {
    let resolveBooks!: (books: readonly LibraryEntry[]) => void;
    const pendingBooks = new Promise<readonly LibraryEntry[]>((resolve) => {
      resolveBooks = resolve;
    });
    const applicationA: LibraryApplication = {
      queries: { listLibraryEntries: { execute: vi.fn(() => pendingBooks) } },
    };
    const applicationB: LibraryApplication = {
      queries: {
        listLibraryEntries: {
          execute: vi.fn(() => Promise.resolve([secondBook])),
        },
      },
    };
    const view = render(
      <MemoryRouter>
        <LibraryPage application={applicationA} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Carregando Biblioteca…",
    );
    view.rerender(
      <MemoryRouter>
        <LibraryPage application={applicationB} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Carregando Biblioteca…",
    );
    expect(screen.queryByText(firstBook.title)).not.toBeInTheDocument();
    expect(screen.queryByTestId("world-host-stub")).not.toBeInTheDocument();

    await screen.findByRole("link", { name: secondBook.title });
    expect(screen.queryByText(firstBook.title)).not.toBeInTheDocument();
    expect(
      worldHostProps().libraryWorldSnapshot?.categories[0].entries,
    ).toEqual([expect.objectContaining({ entryId: secondBook.id })]);

    act(() => resolveBooks([firstBook]));
    expect(screen.getByRole("link", { name: secondBook.title })).toBeVisible();
    expect(screen.queryByText(firstBook.title)).not.toBeInTheDocument();
  });

  it("remonta ao voltar à mesma application sem reaproveitar snapshot ou seleção antigos", async () => {
    let resolveReturn!: (entries: readonly LibraryEntry[]) => void;
    const executeA = vi
      .fn()
      .mockResolvedValueOnce([firstBook])
      .mockImplementationOnce(
        () =>
          new Promise<readonly LibraryEntry[]>((resolve) => {
            resolveReturn = resolve;
          }),
      );
    const applicationA: LibraryApplication = {
      queries: { listLibraryEntries: { execute: executeA } },
    };
    const applicationB: LibraryApplication = {
      queries: {
        listLibraryEntries: {
          execute: vi.fn(() => Promise.resolve([secondBook])),
        },
      },
    };
    const view = render(
      <MemoryRouter>
        <LibraryPage application={applicationA} />
      </MemoryRouter>,
    );
    await screen.findByRole("link", { name: firstBook.title });
    const oldHostProps = worldHostProps();
    act(() => {
      oldHostProps.onSelectableObjectsChange?.([
        {
          id: "reading-book:book-1",
          entryId: "book-1",
          label: firstBook.title,
        },
      ]);
      oldHostProps.onStatusChange?.("ready");
      oldHostProps.onSelectionChange?.({
        id: "reading-book:book-1",
        entryId: "book-1",
        label: firstBook.title,
      });
    });
    view.rerender(
      <MemoryRouter>
        <LibraryPage application={applicationB} />
      </MemoryRouter>,
    );
    await screen.findByRole("link", { name: secondBook.title });
    view.rerender(
      <MemoryRouter>
        <LibraryPage application={applicationA} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Carregando Biblioteca…",
    );
    expect(
      screen.queryByRole("link", { name: firstBook.title }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Abrir registro" }),
    ).not.toBeInTheDocument();
    expect(executeA).toHaveBeenCalledTimes(2);
    act(() =>
      oldHostProps.onSelectionChange?.({
        id: "reading-book:book-1",
        entryId: "book-1",
        label: firstBook.title,
      }),
    );
    await act(async () => {
      resolveReturn([sixEntries[1]]);
      await Promise.resolve();
    });
    expect(screen.getByRole("link", { name: "Filme fictício" })).toBeVisible();
    expect(
      screen.queryByRole("link", { name: "Abrir registro" }),
    ).not.toBeInTheDocument();
  });

  it("limpa erro da application anterior enquanto a próxima consulta conclui", async () => {
    const applicationA: LibraryApplication = {
      queries: {
        listLibraryEntries: {
          execute: vi.fn(() =>
            Promise.reject(
              new ApplicationError("PERSISTENCE_FAILED", "detalhe interno"),
            ),
          ),
        },
      },
    };
    let resolveBooks!: (books: readonly LibraryEntry[]) => void;
    const applicationB: LibraryApplication = {
      queries: {
        listLibraryEntries: {
          execute: vi.fn(
            () =>
              new Promise<readonly LibraryEntry[]>((resolve) => {
                resolveBooks = resolve;
              }),
          ),
        },
      },
    };
    const view = render(
      <MemoryRouter>
        <LibraryPage application={applicationA} />
      </MemoryRouter>,
    );
    await screen.findByRole("alert");

    view.rerender(
      <MemoryRouter>
        <LibraryPage application={applicationB} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Carregando Biblioteca…",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    act(() => resolveBooks([secondBook]));
    expect(
      await screen.findByRole("link", { name: secondBook.title }),
    ).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("descarta erro tardio da application anterior", async () => {
    let rejectPrevious!: (reason: Error) => void;
    const applicationA: LibraryApplication = {
      queries: {
        listLibraryEntries: {
          execute: vi.fn(
            () =>
              new Promise<readonly LibraryEntry[]>((_resolve, reject) => {
                rejectPrevious = reject;
              }),
          ),
        },
      },
    };
    const applicationB: LibraryApplication = {
      queries: {
        listLibraryEntries: {
          execute: vi.fn(() => Promise.resolve([secondBook])),
        },
      },
    };
    const view = render(
      <MemoryRouter>
        <LibraryPage application={applicationA} />
      </MemoryRouter>,
    );
    view.rerender(
      <MemoryRouter>
        <LibraryPage application={applicationB} />
      </MemoryRouter>,
    );
    await screen.findByRole("link", { name: secondBook.title });
    await act(async () => {
      rejectPrevious(new Error("erro anterior"));
      await Promise.resolve();
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      worldHostProps().libraryWorldSnapshot?.categories[0].entries[0]?.entryId,
    ).toBe(secondBook.id);
  });
});
