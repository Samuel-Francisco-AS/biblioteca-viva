import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import {
  ApplicationError,
  INITIAL_WORLD_STRUCTURE,
  structuralInventory,
  type AudioPort,
  type DialogueEvent,
  type DialoguePort,
  type LocalizedDialogue,
  type PlacedObject,
  type StructuralInventory,
  type StructurePlacement,
  type WorldStructureState,
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
  placementModeInstanceId: undefined as string | undefined,
  constructionState: undefined as
    | import("./features/library-visual/contracts").ConstructionSceneState
    | undefined,
}));

vi.mock("./features/library-visual/LibraryVisualHost", () => ({
  LibraryVisualHost: ({
    onAvailabilityChange,
    onInteraction,
    period,
    placementModeInstanceId,
    constructionState,
    projection,
  }: {
    readonly onAvailabilityChange?: (available: boolean) => void;
    readonly onInteraction?: (event: LibraryInteraction) => void;
    readonly period?: import("./features/library-visual/contracts").LibraryVisualPeriod;
    readonly placementModeInstanceId?: string;
    readonly constructionState?: import("./features/library-visual/contracts").ConstructionSceneState;
    readonly projection: import("./features/library-visual/contracts").LibraryViewModel;
  }) => {
    visualHostMock.availability = onAvailabilityChange;
    visualHostMock.interaction = onInteraction;
    visualHostMock.period = period;
    visualHostMock.placementModeInstanceId = placementModeInstanceId;
    visualHostMock.constructionState = constructionState;
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

function structureState(
  placements: readonly StructurePlacement[] = INITIAL_WORLD_STRUCTURE.placements,
  revision = 1,
): WorldStructureState {
  return {
    ...INITIAL_WORLD_STRUCTURE,
    placements,
    revision,
    updatedAt: `2026-08-27T00:00:0${revision}.000Z`,
  };
}

const selectedWall: StructurePlacement = {
  anchor: { x: 7, y: 4 },
  definitionId: "architecture.wall.stone-01.horizontal-1",
  instanceId: "structure.wall-a",
};

const secondWall: StructurePlacement = {
  anchor: { x: 3, y: 7 },
  definitionId: "architecture.wall.stone-01.vertical-1",
  instanceId: "structure.wall-b",
};

type StructureCommands = Pick<
  NonNullable<LibraryPageApplication["commands"]>,
  | "addFloorCells"
  | "moveStructure"
  | "placeStructure"
  | "removeFloorCells"
  | "rotateStructure"
  | "storeStructure"
>;

function constructionApplication({
  commands,
  getStructuralInventory,
  getWorldStructure,
  inventory,
  structure = structureState([selectedWall]),
}: {
  readonly commands?: Partial<StructureCommands>;
  readonly getStructuralInventory?: { execute(): Promise<StructuralInventory> };
  readonly getWorldStructure?: {
    execute(): Promise<WorldStructureState | undefined>;
  };
  readonly inventory?: StructuralInventory;
  readonly structure?: WorldStructureState;
} = {}): LibraryPageApplication {
  const currentInventory = inventory ?? structuralInventory(structure);
  const stateCommand = { execute: () => Promise.resolve(structure) };
  return {
    commands: {
      addFloorCells: {
        execute: () =>
          Promise.resolve({ ignored: 0, placed: 1, state: structure }),
      },
      moveStructure: stateCommand,
      placeStructure: stateCommand,
      removeFloorCells: {
        execute: () =>
          Promise.resolve({ ignored: 0, removed: 1, state: structure }),
      },
      rotateStructure: stateCommand,
      storeStructure: stateCommand,
      updatePlacedObjectTransform: {
        execute: () =>
          Promise.resolve({
            definitionId: "furniture.desk.wood-01",
            instanceId: "placed-object.furniture.desk.wood-01",
            rotation: 0,
            spaceId: "space-a",
            x: 192,
            y: 224,
          }),
      },
      ...commands,
    },
    dialogue: dialogue(),
    queries: {
      getStructuralInventory: getStructuralInventory ?? {
        execute: () => Promise.resolve(currentInventory),
      },
      getWorldStructure: getWorldStructure ?? {
        execute: () => Promise.resolve(structure),
      },
      listBookEntries: { execute: () => Promise.resolve([]) },
      listMilestones: { list: () => Promise.resolve([]) },
    },
  };
}

async function renderConstruction(
  application: LibraryPageApplication,
): Promise<void> {
  render(
    <MemoryRouter>
      <LibraryPage application={application} />
    </MemoryRouter>,
  );
  await screen.findByRole("img", { name: "Visualização da Biblioteca" });
}

async function enterConstruction(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await user.click(screen.getByRole("button", { name: "Construir" }));
  await screen.findByLabelText("Modo Construção");
}

describe("Página Biblioteca", () => {
  it("fornece o modo normal de construção ao host inicialmente", async () => {
    renderLibrary(Promise.resolve([]));
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    expect(visualHostMock.constructionState).toEqual({
      active: false,
      tool: "explore",
    });
  });

  it("propaga modo, ferramenta e definição de colocação para o host", async () => {
    const user = userEvent.setup();
    await renderConstruction(constructionApplication());

    await enterConstruction(user);
    expect(visualHostMock.constructionState).toEqual({
      active: true,
      tool: "explore",
    });
    await user.click(screen.getByRole("button", { name: "Estruturas" }));
    expect(visualHostMock.constructionState).toMatchObject({
      active: true,
      tool: "place-structure",
    });
    await user.click(screen.getAllByRole("button", { name: "Colocar" })[0]);
    expect(visualHostMock.constructionState).toEqual({
      active: true,
      placingDefinitionId: "architecture.wall.stone-01.horizontal-1",
      tool: "place-structure",
    });
  });

  it("propaga a instância em movimento para o host", async () => {
    const user = userEvent.setup();
    await renderConstruction(constructionApplication());
    await enterConstruction(user);
    act(() =>
      visualHostMock.interaction?.({
        instanceId: selectedWall.instanceId,
        type: "StructureSelected",
      }),
    );

    await user.click(screen.getByRole("button", { name: "Mover" }));
    expect(visualHostMock.constructionState).toEqual({
      active: true,
      movingInstanceId: selectedWall.instanceId,
      tool: "place-structure",
    });
  });

  it("atualiza, troca e limpa a seleção estrutural recebida do host", async () => {
    const user = userEvent.setup();
    const structure = structureState([selectedWall, secondWall]);
    await renderConstruction(constructionApplication({ structure }));
    await enterConstruction(user);

    act(() =>
      visualHostMock.interaction?.({
        instanceId: selectedWall.instanceId,
        type: "StructureSelected",
      }),
    );
    expect(screen.getByLabelText("Peça selecionada")).toHaveTextContent(
      "Parede horizontal",
    );
    act(() =>
      visualHostMock.interaction?.({
        instanceId: secondWall.instanceId,
        type: "StructureSelected",
      }),
    );
    expect(screen.getByLabelText("Peça selecionada")).toHaveTextContent(
      "Parede vertical",
    );
    act(() =>
      visualHostMock.interaction?.({
        instanceId: "structure.inexistente",
        type: "StructureSelected",
      }),
    );
    expect(screen.queryByLabelText("Peça selecionada")).not.toBeInTheDocument();
  });

  it("ignora seleção estrutural no modo normal e a limpa ao sair", async () => {
    const user = userEvent.setup();
    await renderConstruction(constructionApplication());
    act(() =>
      visualHostMock.interaction?.({
        instanceId: selectedWall.instanceId,
        type: "StructureSelected",
      }),
    );
    expect(screen.queryByLabelText("Peça selecionada")).not.toBeInTheDocument();

    await enterConstruction(user);
    act(() =>
      visualHostMock.interaction?.({
        instanceId: selectedWall.instanceId,
        type: "StructureSelected",
      }),
    );
    expect(screen.getByLabelText("Peça selecionada")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Sair" }));
    await enterConstruction(user);
    expect(screen.queryByLabelText("Peça selecionada")).not.toBeInTheDocument();
  });

  it("envia uma colocação, movimento e lote de piso uma única vez", async () => {
    const placeStructure = vi.fn(() => Promise.resolve(structureState()));
    const moveStructure = vi.fn(() => Promise.resolve(structureState()));
    const addFloorCells = vi.fn(() =>
      Promise.resolve({ ignored: 0, placed: 2, state: structureState() }),
    );
    await renderConstruction(
      constructionApplication({
        commands: {
          addFloorCells: { execute: addFloorCells },
          moveStructure: { execute: moveStructure },
          placeStructure: { execute: placeStructure },
        },
      }),
    );

    act(() =>
      visualHostMock.interaction?.({
        anchor: { x: 8, y: 5 },
        definitionId: "architecture.wall.stone-01.horizontal-1",
        type: "StructurePlacementCommitted",
      }),
    );
    await waitFor(() => expect(placeStructure).toHaveBeenCalledOnce());
    act(() =>
      visualHostMock.interaction?.({
        anchor: { x: 8, y: 6 },
        instanceId: selectedWall.instanceId,
        type: "StructureMoveCommitted",
      }),
    );
    await waitFor(() => expect(moveStructure).toHaveBeenCalledOnce());
    act(() =>
      visualHostMock.interaction?.({
        cells: [
          { x: 8, y: 5 },
          { x: 8, y: 6 },
        ],
        mode: "paint-floor",
        type: "FloorCellsCommitted",
      }),
    );
    await waitFor(() => expect(addFloorCells).toHaveBeenCalledOnce());
    expect(addFloorCells).toHaveBeenCalledWith(
      expect.objectContaining({
        cells: [
          { x: 8, y: 5 },
          { x: 8, y: 6 },
        ],
      }),
    );
  });

  it("bloqueia callback estrutural repetido durante single-flight", async () => {
    let resolvePlace: (value: WorldStructureState) => void = () => undefined;
    const placeStructure = vi.fn(
      () =>
        new Promise<WorldStructureState>((resolve) => {
          resolvePlace = resolve;
        }),
    );
    await renderConstruction(
      constructionApplication({
        commands: { placeStructure: { execute: placeStructure } },
      }),
    );
    const placement = {
      anchor: { x: 8, y: 5 },
      definitionId: "architecture.wall.stone-01.horizontal-1" as const,
      type: "StructurePlacementCommitted" as const,
    };
    act(() => visualHostMock.interaction?.(placement));
    act(() => visualHostMock.interaction?.(placement));
    expect(placeStructure).toHaveBeenCalledOnce();

    resolvePlace(structureState(undefined, 2));
    await waitFor(() =>
      expect(visualHostMock.projection?.worldStructure?.revision).toBe(2),
    );
  });

  it("atualiza projeção e inventário uma vez após sucesso estrutural", async () => {
    const next = structureState(undefined, 2);
    const getStructuralInventory = vi
      .fn<() => Promise<StructuralInventory>>()
      .mockResolvedValue(structuralInventory(next));
    const placeStructure = vi.fn(() => Promise.resolve(next));
    await renderConstruction(
      constructionApplication({
        commands: { placeStructure: { execute: placeStructure } },
        getStructuralInventory: { execute: getStructuralInventory },
      }),
    );
    getStructuralInventory.mockClear();
    act(() =>
      visualHostMock.interaction?.({
        anchor: { x: 8, y: 5 },
        definitionId: "architecture.wall.stone-01.horizontal-1",
        type: "StructurePlacementCommitted",
      }),
    );

    await waitFor(() =>
      expect(visualHostMock.projection?.worldStructure).toBe(next),
    );
    await waitFor(() => expect(getStructuralInventory).toHaveBeenCalledOnce());
  });

  it("invalida o token e descarta resposta estrutural após unmount", async () => {
    let resolvePlace: (value: WorldStructureState) => void = () => undefined;
    const application = constructionApplication({
      commands: {
        placeStructure: {
          execute: () =>
            new Promise<WorldStructureState>((resolve) => {
              resolvePlace = resolve;
            }),
        },
      },
    });
    const result = render(
      <MemoryRouter>
        <LibraryPage application={application} />
      </MemoryRouter>,
    );
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    act(() =>
      visualHostMock.interaction?.({
        anchor: { x: 8, y: 5 },
        definitionId: "architecture.wall.stone-01.horizontal-1",
        type: "StructurePlacementCommitted",
      }),
    );
    result.unmount();
    act(() => resolvePlace(structureState(undefined, 2)));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("não deixa resposta de inventário antiga acompanhar uma projeção mais nova", async () => {
    let resolveOldInventory: (value: StructuralInventory) => void = () =>
      undefined;
    const oldInventory = new Promise<StructuralInventory>((resolve) => {
      resolveOldInventory = resolve;
    });
    const revisionTwo = structureState(undefined, 2);
    const revisionThree = structureState(undefined, 3);
    const getStructuralInventory = vi
      .fn<() => Promise<StructuralInventory>>()
      .mockResolvedValueOnce(structuralInventory(structureState()))
      .mockReturnValueOnce(oldInventory)
      .mockResolvedValueOnce(structuralInventory(revisionThree));
    const placeStructure = vi.fn(() => Promise.resolve(revisionTwo));
    const moveStructure = vi.fn(() => Promise.resolve(revisionThree));
    await renderConstruction(
      constructionApplication({
        commands: {
          moveStructure: { execute: moveStructure },
          placeStructure: { execute: placeStructure },
        },
        getStructuralInventory: { execute: getStructuralInventory },
      }),
    );
    act(() =>
      visualHostMock.interaction?.({
        anchor: { x: 8, y: 5 },
        definitionId: "architecture.wall.stone-01.horizontal-1",
        type: "StructurePlacementCommitted",
      }),
    );
    await waitFor(() =>
      expect(visualHostMock.projection?.worldStructure?.revision).toBe(2),
    );
    act(() =>
      visualHostMock.interaction?.({
        anchor: { x: 8, y: 6 },
        instanceId: selectedWall.instanceId,
        type: "StructureMoveCommitted",
      }),
    );
    await waitFor(() =>
      expect(visualHostMock.projection?.worldStructure?.revision).toBe(3),
    );
    act(() => resolveOldInventory(structuralInventory(revisionTwo)));
    expect(visualHostMock.projection?.worldStructure?.revision).toBe(3);
  });

  it("libera single-flight depois de sucesso e erro estrutural", async () => {
    const placeStructure = vi
      .fn<() => Promise<WorldStructureState>>()
      .mockRejectedValueOnce(
        new ApplicationError("PERSISTENCE_FAILED", "Falha de teste"),
      )
      .mockResolvedValue(structureState(undefined, 2));
    await renderConstruction(
      constructionApplication({
        commands: { placeStructure: { execute: placeStructure } },
      }),
    );
    const placement = {
      anchor: { x: 8, y: 5 },
      definitionId: "architecture.wall.stone-01.horizontal-1" as const,
      type: "StructurePlacementCommitted" as const,
    };
    act(() => visualHostMock.interaction?.(placement));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Não foi possível acessar",
      ),
    );
    act(() => visualHostMock.interaction?.(placement));
    await waitFor(() => expect(placeStructure).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(visualHostMock.projection?.worldStructure?.revision).toBe(2),
    );
    act(() => visualHostMock.interaction?.(placement));
    await waitFor(() => expect(placeStructure).toHaveBeenCalledTimes(3));
  });

  it("recarrega estrutura e inventário no conflito sem repetir a escrita", async () => {
    const persisted = structureState([selectedWall, secondWall], 2);
    const getWorldStructure = vi
      .fn<() => Promise<WorldStructureState | undefined>>()
      .mockResolvedValueOnce(structureState([selectedWall]))
      .mockResolvedValueOnce(persisted);
    const getStructuralInventory = vi
      .fn<() => Promise<StructuralInventory>>()
      .mockResolvedValueOnce(
        structuralInventory(structureState([selectedWall])),
      )
      .mockResolvedValueOnce(structuralInventory(persisted));
    const placeStructure = vi.fn(() =>
      Promise.reject(
        new ApplicationError(
          "CONFLICT",
          "A construção foi atualizada. Tente novamente.",
          { operation: "structure_stale_state" },
        ),
      ),
    );
    const user = userEvent.setup();
    await renderConstruction(
      constructionApplication({
        commands: { placeStructure: { execute: placeStructure } },
        getStructuralInventory: { execute: getStructuralInventory },
        getWorldStructure: { execute: getWorldStructure },
      }),
    );
    await enterConstruction(user);
    act(() =>
      visualHostMock.interaction?.({
        instanceId: selectedWall.instanceId,
        type: "StructureSelected",
      }),
    );
    getWorldStructure.mockClear();
    getStructuralInventory.mockClear();
    act(() =>
      visualHostMock.interaction?.({
        anchor: { x: 8, y: 5 },
        definitionId: "architecture.wall.stone-01.horizontal-1",
        type: "StructurePlacementCommitted",
      }),
    );

    await waitFor(() => expect(getWorldStructure).toHaveBeenCalledOnce());
    expect(getStructuralInventory).toHaveBeenCalledOnce();
    expect(placeStructure).toHaveBeenCalledOnce();
    expect(visualHostMock.projection?.worldStructure).toBe(persisted);
    expect(screen.getByLabelText("Peça selecionada")).toBeVisible();
    expect(
      screen
        .getAllByRole("status")
        .find((element) =>
          element.textContent?.includes("A construção foi atualizada."),
        ),
    ).toHaveTextContent("A construção foi atualizada. Tente novamente.");
  });

  it("limpa seleção ausente quando a projeção persistida substitui a atual", async () => {
    const initial = structureState([selectedWall]);
    const persisted = structureState([secondWall], 2);
    const getWorldStructure = vi
      .fn<() => Promise<WorldStructureState | undefined>>()
      .mockResolvedValueOnce(initial)
      .mockResolvedValueOnce(persisted);
    const getStructuralInventory = vi
      .fn<() => Promise<StructuralInventory>>()
      .mockResolvedValueOnce(structuralInventory(initial))
      .mockResolvedValueOnce(structuralInventory(persisted));
    const user = userEvent.setup();
    await renderConstruction(
      constructionApplication({
        commands: {
          placeStructure: {
            execute: () =>
              Promise.reject(
                new ApplicationError(
                  "CONFLICT",
                  "A construção foi atualizada. Tente novamente.",
                  { operation: "structure_stale_state" },
                ),
              ),
          },
        },
        getStructuralInventory: { execute: getStructuralInventory },
        getWorldStructure: { execute: getWorldStructure },
        structure: initial,
      }),
    );
    await enterConstruction(user);
    act(() =>
      visualHostMock.interaction?.({
        instanceId: selectedWall.instanceId,
        type: "StructureSelected",
      }),
    );
    act(() =>
      visualHostMock.interaction?.({
        anchor: { x: 8, y: 5 },
        definitionId: "architecture.wall.stone-01.horizontal-1",
        type: "StructurePlacementCommitted",
      }),
    );
    await waitFor(() =>
      expect(
        screen.queryByLabelText("Peça selecionada"),
      ).not.toBeInTheDocument(),
    );
  });
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

  it("recebe seleção Phaser e expõe Mover e Girar no painel React", async () => {
    const user = userEvent.setup();
    const updatePlacedObjectTransform = vi.fn(() =>
      Promise.resolve({
        definitionId: "furniture.desk.wood-01",
        instanceId: "placed-object.furniture.desk.wood-01",
        rotation: 90 as const,
        spaceId: "space-a" as const,
        x: 192,
        y: 224,
      }),
    );
    const application: LibraryPageApplication = {
      commands: {
        updatePlacedObjectTransform: { execute: updatePlacedObjectTransform },
      },
      dialogue: dialogue(),
      queries: {
        listBookEntries: { execute: () => Promise.resolve([book]) },
        listMilestones: { list: () => Promise.resolve([]) },
      },
    };
    render(
      <MemoryRouter>
        <LibraryPage application={application} />
      </MemoryRouter>,
    );
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    act(() =>
      visualHostMock.interaction?.({
        instanceId: "placed-object.furniture.desk.wood-01",
        type: "PlacedObjectSelected",
      }),
    );

    await user.click(screen.getByRole("button", { name: "Mover" }));
    expect(visualHostMock.placementModeInstanceId).toBe(
      "placed-object.furniture.desk.wood-01",
    );
    await user.click(screen.getByRole("button", { name: "Girar" }));
    expect(updatePlacedObjectTransform).toHaveBeenCalledWith(
      expect.objectContaining({ rotation: 90 }),
    );
  });

  it("fecha as ações do objeto e encerra Mover sem alterar a seleção oculta", async () => {
    const user = userEvent.setup();
    renderLibrary(Promise.resolve([book]));
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    act(() =>
      visualHostMock.interaction?.({
        instanceId: "placed-object.furniture.desk.wood-01",
        type: "PlacedObjectSelected",
      }),
    );
    expect(screen.getByLabelText("Objeto selecionado")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Mover" }));
    expect(visualHostMock.placementModeInstanceId).toBe(
      "placed-object.furniture.desk.wood-01",
    );
    await user.click(
      screen.getByRole("button", { name: "Fechar ações do objeto" }),
    );
    expect(visualHostMock.placementModeInstanceId).toBeUndefined();
    expect(screen.getByRole("button", { name: "Mover" })).toBeDisabled();
  });

  it("fecha o cartão instantaneamente com redução de movimento", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LibraryPage
          application={{
            dialogue: dialogue(),
            queries: {
              listBookEntries: { execute: () => Promise.resolve([book]) },
              listMilestones: { list: () => Promise.resolve([]) },
            },
          }}
          reducedMotion
        />
      </MemoryRouter>,
    );
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    act(() =>
      visualHostMock.interaction?.({
        instanceId: "placed-object.furniture.desk.wood-01",
        type: "PlacedObjectSelected",
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Fechar ações do objeto" }),
    );
    expect(
      screen.queryByLabelText("Objeto selecionado"),
    ).not.toBeInTheDocument();
  });

  it("reutiliza o toast de confirmação e o remove depois do ciclo", async () => {
    const user = userEvent.setup();
    const application: LibraryPageApplication = {
      commands: {
        updatePlacedObjectTransform: {
          execute: () =>
            Promise.resolve({
              definitionId: "furniture.desk.wood-01",
              instanceId: "placed-object.furniture.desk.wood-01",
              rotation: 90 as const,
              spaceId: "space-a" as const,
              x: 224,
              y: 256,
            }),
        },
      },
      dialogue: dialogue(),
      queries: {
        listBookEntries: { execute: () => Promise.resolve([book]) },
        listMilestones: { list: () => Promise.resolve([]) },
      },
    };
    render(
      <MemoryRouter>
        <LibraryPage application={application} />
      </MemoryRouter>,
    );
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    act(() =>
      visualHostMock.interaction?.({
        instanceId: "placed-object.furniture.desk.wood-01",
        type: "PlacedObjectSelected",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Girar" }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByRole("status")).toHaveTextContent("Orientação salva.");
    act(() =>
      visualHostMock.interaction?.({
        instanceId: "placed-object.furniture.desk.wood-01",
        rotation: 90,
        spaceId: "space-a",
        type: "PlacedObjectTransformCommitted",
        x: 224,
        y: 256,
      }),
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByRole("status")).toHaveTextContent("Posição salva.");
    await new Promise((resolve) => window.setTimeout(resolve, 2_700));
    expect(screen.getByRole("status")).toHaveClass(
      "library-placement-toast--exiting",
    );
    await new Promise((resolve) => window.setTimeout(resolve, 300));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("antecipa Girar e restaura a projeção se a persistência falhar", async () => {
    const user = userEvent.setup();
    let rejectSave: (reason?: unknown) => void = () => undefined;
    const pending = new Promise<PlacedObject>((_resolve, reject) => {
      rejectSave = reject;
    });
    const application: LibraryPageApplication = {
      commands: { updatePlacedObjectTransform: { execute: () => pending } },
      dialogue: dialogue(),
      queries: {
        listBookEntries: { execute: () => Promise.resolve([book]) },
        listMilestones: { list: () => Promise.resolve([]) },
      },
    };
    render(
      <MemoryRouter>
        <LibraryPage application={application} />
      </MemoryRouter>,
    );
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    act(() =>
      visualHostMock.interaction?.({
        instanceId: "placed-object.furniture.desk.wood-01",
        type: "PlacedObjectSelected",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Girar" }));
    await waitFor(() =>
      expect(
        visualHostMock.projection?.placedObjects?.find(
          (object) =>
            object.instanceId === "placed-object.furniture.desk.wood-01",
        )?.rotation,
      ).toBe(90),
    );
    rejectSave(new ApplicationError("PERSISTENCE_FAILED", "Falha de teste"));
    await waitFor(() =>
      expect(
        visualHostMock.projection?.placedObjects?.find(
          (object) =>
            object.instanceId === "placed-object.furniture.desk.wood-01",
        )?.rotation,
      ).toBe(0),
    );
  });

  it("coalesce giros rápidos e não deixa uma falha antiga reverter a orientação final", async () => {
    const user = userEvent.setup();
    let rejectFirst: (reason?: unknown) => void = () => undefined;
    let resolveLast: (value: PlacedObject) => void = () => undefined;
    let saveCount = 0;
    const updatePlacedObjectTransform = vi.fn(() => {
      saveCount += 1;
      return saveCount === 1
        ? new Promise<PlacedObject>((_resolve, reject) => {
            rejectFirst = reject;
          })
        : new Promise<PlacedObject>((resolve) => {
            resolveLast = resolve;
          });
    });
    const application: LibraryPageApplication = {
      commands: {
        updatePlacedObjectTransform: { execute: updatePlacedObjectTransform },
      },
      dialogue: dialogue(),
      queries: {
        listBookEntries: { execute: () => Promise.resolve([book]) },
        listMilestones: { list: () => Promise.resolve([]) },
      },
    };
    render(
      <MemoryRouter>
        <LibraryPage application={application} />
      </MemoryRouter>,
    );
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    act(() =>
      visualHostMock.interaction?.({
        instanceId: "placed-object.furniture.desk.wood-01",
        type: "PlacedObjectSelected",
      }),
    );
    const rotate = screen.getByRole("button", { name: "Girar" });
    await user.click(rotate);
    await waitFor(() =>
      expect(updatePlacedObjectTransform).toHaveBeenCalledTimes(1),
    );
    await user.click(rotate);
    await user.click(rotate);
    expect(updatePlacedObjectTransform).toHaveBeenCalledTimes(1);
    expect(
      visualHostMock.projection?.placedObjects?.find(
        (object) =>
          object.instanceId === "placed-object.furniture.desk.wood-01",
      )?.rotation,
    ).toBe(270);

    rejectFirst(new ApplicationError("PERSISTENCE_FAILED", "Falha de teste"));
    await waitFor(() =>
      expect(updatePlacedObjectTransform).toHaveBeenCalledTimes(2),
    );
    expect(updatePlacedObjectTransform).toHaveBeenLastCalledWith(
      expect.objectContaining({ rotation: 270 }),
    );
    expect(
      visualHostMock.projection?.placedObjects?.find(
        (object) =>
          object.instanceId === "placed-object.furniture.desk.wood-01",
      )?.rotation,
    ).toBe(270);
    resolveLast({
      definitionId: "furniture.desk.wood-01",
      instanceId: "placed-object.furniture.desk.wood-01",
      rotation: 270,
      spaceId: "space-a",
      x: 192,
      y: 224,
    });
  });

  it("mantém a posição confirmada na projeção enquanto o commit está pendente", async () => {
    let resolveSave: (value: PlacedObject) => void = () => undefined;
    const pending = new Promise<PlacedObject>((resolve) => {
      resolveSave = resolve;
    });
    const application: LibraryPageApplication = {
      commands: { updatePlacedObjectTransform: { execute: () => pending } },
      dialogue: dialogue(),
      queries: {
        listBookEntries: { execute: () => Promise.resolve([book]) },
        listMilestones: { list: () => Promise.resolve([]) },
      },
    };
    render(
      <MemoryRouter>
        <LibraryPage application={application} />
      </MemoryRouter>,
    );
    await screen.findByRole("img", { name: "Visualização da Biblioteca" });
    act(() =>
      visualHostMock.interaction?.({
        instanceId: "placed-object.furniture.desk.wood-01",
        rotation: 0,
        spaceId: "space-a",
        type: "PlacedObjectTransformCommitted",
        x: 224,
        y: 256,
      }),
    );
    await waitFor(() =>
      expect(
        visualHostMock.projection?.placedObjects?.find(
          (object) =>
            object.instanceId === "placed-object.furniture.desk.wood-01",
        )?.x,
      ).toBe(224),
    );
    resolveSave({
      definitionId: "furniture.desk.wood-01",
      instanceId: "placed-object.furniture.desk.wood-01",
      rotation: 0,
      spaceId: "space-a",
      x: 224,
      y: 256,
    });
  });
});
