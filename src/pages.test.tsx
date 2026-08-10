import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import {
  ApplicationError,
  type AudioPort,
  type DialogueEvent,
  type DialoguePort,
  type LocalizedDialogue,
} from "./application";
import type { BookEntry, ReachedMilestone } from "./domain";
import type { LibraryInteraction } from "./features/library-visual/contracts";
import { LibraryPage, type LibraryPageApplication } from "./pages";

const visualHostMock = vi.hoisted(() => ({
  interaction: undefined as ((event: LibraryInteraction) => void) | undefined,
  projection: undefined as
    import("./features/library-visual/contracts").LibraryViewModel | undefined,
}));

vi.mock("./features/library-visual/LibraryVisualHost", () => ({
  LibraryVisualHost: ({
    onInteraction,
    projection,
  }: {
    readonly onInteraction?: (event: LibraryInteraction) => void;
    readonly projection: import("./features/library-visual/contracts").LibraryViewModel;
  }) => {
    visualHostMock.interaction = onInteraction;
    visualHostMock.projection = projection;
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

function dialogue(): Pick<DialoguePort, "enterLibrary" | "select"> {
  return {
    enterLibrary: vi.fn(() => Promise.resolve()),
    select: vi.fn((event: DialogueEvent) => {
      const creature = event === "creature.interaction";
      const result: LocalizedDialogue = {
        characterId: creature ? "character.creature" : "character.librarian",
        closeLabel: "Fechar painel",
        eyebrow: creature ? "Criatura" : "Bibliotecária",
        id: creature
          ? "dialogue.creature.observes"
          : "dialogue.librarian.in-progress",
        locale: "pt-BR",
        text: creature
          ? "A criatura inclina a cabeça e observa você em silêncio."
          : "Há uma leitura em curso. Ela pode seguir no ritmo que couber.",
        title: creature ? "Uma presença curiosa" : "Uma observação tranquila",
      };
      return Promise.resolve(result);
    }),
  };
}

function renderLibrary(
  result: Promise<readonly BookEntry[]>,
  audio?: Pick<AudioPort, "emit">,
  dialoguePort = dialogue(),
) {
  const execute = vi.fn(() => result);
  const application: LibraryPageApplication = {
    audio,
    dialogue: dialoguePort,
    queries: {
      listBookEntries: { execute },
      listMilestones: { list: () => Promise.resolve([]) },
    },
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
  it("oferece resumo e equivalentes React sem depender das interações do canvas", async () => {
    const user = userEvent.setup();
    const dialoguePort = dialogue();
    renderLibrary(Promise.resolve([book]), undefined, dialoguePort);

    expect(
      await screen.findByRole("heading", { name: "Estado da Biblioteca" }),
    ).toBeVisible();
    expect(screen.queryByText("A estante está vazia.")).not.toBeInTheDocument();
    expect(
      screen.getByText("Os primeiros livros já estão organizados na estante."),
    ).toBeVisible();
    expect(screen.getByText(/Título de teste/u)).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Consultar Coleção" }),
    ).toHaveAttribute("href", "/colecao");

    const librarian = screen.getByRole("button", {
      name: "Conversar com a bibliotecária",
    });
    await user.click(librarian);
    expect(
      await screen.findByRole("heading", { name: "Uma observação tranquila" }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Fechar painel" }));
    await waitFor(() => expect(librarian).toHaveFocus());

    const creature = screen.getByRole("button", {
      name: "Interagir com a criatura",
    });
    await user.click(creature);
    expect(
      await screen.findByRole("heading", { name: "Uma presença curiosa" }),
    ).toBeVisible();
    expect(dialoguePort.select).toHaveBeenCalledWith("creature.interaction");
  });

  it("projeta a decoração e encaminha a confirmação visual sem conceder regra", async () => {
    const milestone: ReachedMilestone = {
      id: "milestone.first-completed-book",
      reachedAt: "2026-08-10T12:00:00.000Z",
      rewards: [
        {
          decorationId: "decoration.reading-lamp",
          id: "reward.first-completion-reading-lamp",
          type: "decoration",
        },
      ],
      ruleVersion: 1,
      source: {
        eventId: "source-event",
        eventType: "LibraryEntryCompleted",
      },
    };
    const onPresented = vi.fn();
    const application: LibraryPageApplication = {
      dialogue: dialogue(),
      queries: {
        listBookEntries: { execute: () => Promise.resolve([book]) },
        listMilestones: { list: () => Promise.resolve([milestone]) },
      },
    };
    render(
      <MemoryRouter>
        <LibraryPage
          application={application}
          onDecorationUnlockPresented={onPresented}
          pendingDecorationUnlock={{ eventId: "reaction-event" }}
        />
      </MemoryRouter>,
    );
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    expect(visualHostMock.projection).toMatchObject({
      decorationUnlockAnimation: {
        decorationId: "decoration.reading-lamp",
        eventId: "reaction-event",
      },
      unlockedDecorationIds: ["decoration.reading-lamp"],
    });
    act(() =>
      visualHostMock.interaction?.({
        decorationId: "decoration.reading-lamp",
        eventId: "reaction-event",
        type: "DecorationUnlockPresented",
      }),
    );
    expect(onPresented).toHaveBeenCalledOnce();
    expect(await application.queries.listMilestones.list()).toHaveLength(1);
  });

  it("prepara o contexto agregado sem enviar conteúdo pessoal", async () => {
    const dialoguePort = dialogue();
    renderLibrary(Promise.resolve([book]), undefined, dialoguePort);
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    await waitFor(() =>
      expect(dialoguePort.enterLibrary).toHaveBeenCalledWith({
        completedBooks: 0,
        inProgressBooks: 1,
        totalBooks: 1,
      }),
    );
    expect(
      JSON.stringify(vi.mocked(dialoguePort.enterLibrary).mock.calls),
    ).not.toContain(book.title);
  });

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
      dialogue: dialogue(),
      queries: {
        listBookEntries: { execute },
        listMilestones: { list: () => Promise.resolve([]) },
      },
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

    const panelHeading = await screen.findByRole("heading", {
      name: "Resumo da sua coleção",
    });
    expect(panelHeading).toBeVisible();
    const panel = panelHeading.closest("section");
    expect(panel).not.toBeNull();
    if (panel) expect(within(panel).getAllByText("1")).toHaveLength(2);
    if (panel) {
      expect(
        within(panel).getByText(
          "Os primeiros livros já estão organizados na estante.",
        ),
      ).toBeVisible();
      expect(
        within(panel).getByText(
          /Livro atualizado mais recentemente: Título de teste/u,
        ),
      ).toBeVisible();
    }
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
      await screen.findByRole("heading", { name: "Uma observação tranquila" }),
    ).toBeVisible();
    expect(screen.getByText(/leitura em curso/iu)).toBeVisible();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Fechar painel" }),
      ).toHaveFocus(),
    );
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
      screen.queryByRole("heading", { name: "Uma observação tranquila" }),
    ).not.toBeInTheDocument();
    expect(
      await screen.findAllByRole("heading", { name: "Uma presença curiosa" }),
    ).toHaveLength(1);
    expect(screen.getByText(/inclina a cabeça/iu)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Fechar painel" }));
    expect(
      screen.queryByRole("heading", { name: "Uma presença curiosa" }),
    ).not.toBeInTheDocument();
  });

  it("cada nova interação substitui o painel atual", async () => {
    renderLibrary(Promise.resolve([book]));
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    act(() => visualHostMock.interaction?.({ type: "CreatureSelected" }));
    await screen.findByRole("heading", { name: "Uma presença curiosa" });
    act(() => visualHostMock.interaction?.({ type: "ShelfSelected" }));
    expect(
      screen.getByRole("heading", { name: "Resumo da sua coleção" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Uma presença curiosa" }),
    ).not.toBeInTheDocument();
  });
});
