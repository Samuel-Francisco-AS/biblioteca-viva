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
  availability: undefined as ((available: boolean) => void) | undefined,
  interaction: undefined as ((event: LibraryInteraction) => void) | undefined,
  period: undefined as
    | import("./features/library-visual/contracts").LibraryVisualPeriod
    | undefined,
  projection: undefined as
    import("./features/library-visual/contracts").LibraryViewModel | undefined,
}));

vi.mock("./features/library-visual/LibraryVisualHost", () => ({
  LibraryVisualHost: ({
    onAvailabilityChange,
    onInteraction,
    period,
    projection,
  }: {
    readonly onAvailabilityChange?: (available: boolean) => void;
    readonly onInteraction?: (event: LibraryInteraction) => void;
    readonly period?: import("./features/library-visual/contracts").LibraryVisualPeriod;
    readonly projection: import("./features/library-visual/contracts").LibraryViewModel;
  }) => {
    visualHostMock.availability = onAvailabilityChange;
    visualHostMock.interaction = onInteraction;
    visualHostMock.period = period;
    visualHostMock.projection = projection;
    return <div aria-label="Visualização da Biblioteca" role="img" />;
  },
}));

const book: BookEntry = {
  author: "Autora de teste",
  createdAt: "2026-07-20T10:00:00.000Z",
  currentPage: 40,
  favorite: false,
  id: "book-1",
  revision: 1,
  status: "in_progress",
  title: "Título de teste",
  totalPages: 100,
  tagIds: [],
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

    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    const accessibleSummary = screen
      .getByText("Resumo acessível")
      .closest("details");
    expect(accessibleSummary).not.toHaveAttribute("open");
    await user.click(screen.getByText("Resumo acessível"));
    expect(
      await screen.findByRole("heading", { name: "Estado da Biblioteca" }),
    ).toBeVisible();
    expect(screen.queryByText("A estante está vazia.")).not.toBeInTheDocument();
    expect(
      screen.getByText("Os primeiros livros já estão organizados na estante."),
    ).toBeVisible();
    expect(
      screen.getByText(/Há um livro atualizado recentemente/u),
    ).toBeVisible();
    expect(screen.queryByText(/Título de teste/u)).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Consultar Coleção" }),
    ).toHaveAttribute("href", "/colecao");

    const librarian = screen.getByRole("button", {
      name: "Conversar com a bibliotecária",
    });
    await user.click(librarian);
    expect(await screen.findByText("Uma observação tranquila")).toBeVisible();
    expect(librarian).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Fechar painel" }));
    await waitFor(() => expect(librarian).toHaveFocus());

    const creature = screen.getByRole("button", {
      name: "Interagir com a criatura",
    });
    await user.click(creature);
    expect(await screen.findByText("Uma presença curiosa")).toBeVisible();
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
      name: "Resumo da estante",
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
      expect(within(panel).getByText("Título de teste")).toBeVisible();
    }
    expect(screen.queryByText("book-1")).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Fechar resumo da Biblioteca" }),
    );
    expect(
      screen.queryByRole("heading", { name: "Resumo da estante" }),
    ).not.toBeInTheDocument();

    act(() => visualHostMock.interaction?.({ type: "ShelfSelected" }));
    await screen.findByRole("heading", { name: "Resumo da estante" });
    await user.click(screen.getByRole("button", { name: "Abrir Coleção" }));
    expect(screen.getByLabelText("URL atual")).toHaveTextContent("/colecao");
  });

  it("abre o balão acessível da bibliotecária sem roubar foco", async () => {
    renderLibrary(Promise.resolve([book]));
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    act(() => visualHostMock.interaction?.({ type: "LibrarianSelected" }));

    expect(await screen.findByText("Uma observação tranquila")).toBeVisible();
    expect(screen.getByText(/leitura em curso/iu)).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Fechar painel" }),
    ).not.toHaveFocus();
    expect(screen.queryByText("book-1")).not.toBeInTheDocument();
  });

  it("ancora o balão na posição informada pela cena e expõe exploração compacta", async () => {
    renderLibrary(Promise.resolve([book]));
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    expect(
      screen.getByRole("navigation", { name: "Explorar salas" }),
    ).toBeVisible();
    expect(screen.queryByLabelText("Salas")).not.toBeInTheDocument();

    act(() =>
      visualHostMock.interaction?.({
        anchor: { x: 72, y: 64 },
        type: "LibrarianSelected",
      }),
    );

    const bubble = await screen.findByText("Uma observação tranquila");
    expect(bubble.closest("aside")).toHaveStyle({
      "--bubble-anchor-x": "72%",
      "--bubble-anchor-y": "64%",
    });
  });

  it("abre o painel da criatura, substitui o anterior e fecha sem duplicação", async () => {
    const user = userEvent.setup();
    renderLibrary(Promise.resolve([book]));
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    act(() => visualHostMock.interaction?.({ type: "LibrarianSelected" }));
    act(() => visualHostMock.interaction?.({ type: "CreatureSelected" }));
    act(() => visualHostMock.interaction?.({ type: "CreatureSelected" }));

    expect(
      screen.queryByText("Uma observação tranquila"),
    ).not.toBeInTheDocument();
    expect(await screen.findAllByText("Uma presença curiosa")).toHaveLength(1);
    expect(screen.getByText(/inclina a cabeça/iu)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Fechar painel" }));
    expect(screen.queryByText("Uma presença curiosa")).not.toBeInTheDocument();
  });

  it("cada nova interação substitui o painel atual", async () => {
    renderLibrary(Promise.resolve([book]));
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    act(() => visualHostMock.interaction?.({ type: "CreatureSelected" }));
    await screen.findByText("Uma presença curiosa");
    act(() => visualHostMock.interaction?.({ type: "ShelfSelected" }));
    expect(
      screen.getByRole("heading", { name: "Resumo da estante" }),
    ).toBeVisible();
    expect(screen.queryByText("Uma presença curiosa")).not.toBeInTheDocument();
  });

  it("expande a alternativa React quando o canvas falha", async () => {
    renderLibrary(Promise.resolve([book]));
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    act(() => visualHostMock.availability?.(false));

    expect(
      screen.getByText("Resumo acessível").closest("details"),
    ).toHaveAttribute("open");
    expect(
      screen.getByRole("link", { name: "Consultar Coleção" }),
    ).toHaveAttribute("href", "/colecao");
  });

  it("permite diagnóstico não persistido e retorna ao período automático", async () => {
    const user = userEvent.setup();
    renderLibrary(Promise.resolve([book]));
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    const automaticPeriod = visualHostMock.period;
    const selector = screen.getByLabelText("Pré-visualizar período");

    await user.selectOptions(selector, "lateNight");
    expect(visualHostMock.period).toBe("lateNight");
    await user.selectOptions(selector, "automatic");
    expect(visualHostMock.period).toBe(automaticPeriod);
    expect(selector).toHaveValue("automatic");
  });
});
