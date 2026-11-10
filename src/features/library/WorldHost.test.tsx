import { InhabitantAgency } from "./inhabitantAgency";
import { InhabitantNavigation } from "./inhabitantNavigation";
import { INHABITANTS } from "./inhabitants";
import type { ThreeWorldRuntimeDependencies } from "./three/ThreeWorldRuntime";
import { LivingSession } from "./livingObjects";
import { NightLightingSession } from "./nightLighting";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, type Mock } from "vitest";

import type {
  WorldDiagnosticsListener,
  WorldRuntime,
  WorldRuntimeDiagnostics,
  WorldRuntimeFailure,
  WorldRuntimeFailureListener,
  WorldSelectableObject,
  WorldSelection,
  WorldSelectionListener,
} from "./worldRuntime";
import { WorldHost } from "./WorldHost";
import { projectLibraryWorldEntries } from "./libraryWorldEntries";

const { createThreeWorldRuntime } = vi.hoisted(() => ({
  createThreeWorldRuntime:
    vi.fn<
      (dependencies?: ThreeWorldRuntimeDependencies) => Promise<WorldRuntime>
    >(),
}));

vi.mock("./three/ThreeWorldRuntime", () => ({ createThreeWorldRuntime }));

interface TestWorldRuntime extends WorldRuntime {
  readonly dispose: Mock<() => void>;
  readonly emitFailure: (failure: WorldRuntimeFailure) => void;
  readonly emitSelection: (selection: WorldSelection) => void;
  readonly getDiagnostics: Mock<() => WorldRuntimeDiagnostics>;
  readonly getSelectableObjects: Mock<() => readonly WorldSelectableObject[]>;
  readonly mount: Mock<(host: HTMLElement) => void>;
  readonly onDiagnosticsChange: Mock<
    (listener: WorldDiagnosticsListener) => () => void
  >;
  readonly onFailure: Mock<
    (listener: WorldRuntimeFailureListener) => () => void
  >;
  readonly onSelectionChange: Mock<
    (listener: WorldSelectionListener) => () => void
  >;
  readonly selectObject: Mock<(id: string | null) => void>;
  readonly start: Mock<() => void>;
  readonly pause: Mock<() => void>;
  readonly resume: Mock<() => void>;
}

async function openWorldControls() {
  const explore = await screen.findByText("Explorar · habitantes e objetos");
  if (!explore.closest("details")?.open) await userEvent.click(explore);
  const selection = await screen.findByText("Selecionar elementos");
  if (!selection.closest("details")?.open) await userEvent.click(selection);
}
function createRuntime(): TestWorldRuntime {
  const selectables = [
    { id: "bookshelf-01", label: "Estante técnica 1" },
    { id: "table-01", label: "Mesa técnica 1" },
    { id: "reading-shelf-01", label: "Estante de leitura 1" },
    { id: "reading-shelf-02", label: "Estante de leitura 2" },
    { id: "reading-shelf-03", label: "Estante de leitura 3" },
    { id: "fixture-pyramid", label: "Pirâmide técnica" },
  ] as const;
  let canvas: HTMLCanvasElement | undefined;
  let selectionListener: WorldSelectionListener | undefined;
  let failureListener: WorldRuntimeFailureListener | undefined;
  const diagnostics: WorldRuntimeDiagnostics = {
    activeFrameLoops: 1,
    drawCalls: 46,
    fixtureLoadMs: 25,
    fixtureStatus: "ready",
    fps: 60,
    frameTimeMs: 16.67,
    geometries: 46,
    materialTextureReferences: 0,
    meshes: 46,
    performanceScenarioAssetsLoaded: 1,
    performanceScenarioAssetsTotal: 1,
    performanceScenarioId: "f1-baseline",
    performanceScenarioLabel: "Baseline F1",
    renderedFrames: 20,
    runtimeState: "running",
    sceneObjects: 59,
    selectableObjects: 14,
    textures: 1,
    timeToFirstUsableFrameMs: 4,
    triangles: 546,
    uniqueMaterialTextures: 0,
  };
  const unsubscribe = vi.fn(() => {
    selectionListener = undefined;
  });
  const runtime: TestWorldRuntime = {
    dispose: vi.fn(() => canvas?.remove()),
    emitFailure: (failure) => failureListener?.(failure),
    emitSelection: (selection) => selectionListener?.(selection),
    getDiagnostics: vi.fn(() => diagnostics),
    getSelectableObjects: vi.fn(() => selectables),
    mount: vi.fn((host: HTMLElement) => {
      canvas = document.createElement("canvas");
      canvas.dataset.threeWorldCanvas = "true";
      host.append(canvas);
    }),
    onDiagnosticsChange: vi.fn((listener) => {
      listener(diagnostics);
      return vi.fn();
    }),
    onFailure: vi.fn((listener) => {
      failureListener = listener;
      return vi.fn(() => {
        failureListener = undefined;
      });
    }),
    onSelectionChange: vi.fn((listener) => {
      selectionListener = listener;
      listener(null);
      return unsubscribe;
    }),
    pause: vi.fn(),
    resize: vi.fn(),
    resume: vi.fn(),
    selectObject: vi.fn((id) => {
      selectionListener?.(
        selectables.find((selectable) => selectable.id === id) ?? null,
      );
    }),
    start: vi.fn(),
  };
  return runtime;
}

describe("WorldHost", () => {
  it("monta uma instância e a descarta ao desmontar o React host", async () => {
    const runtime = createRuntime();
    const runtimeFactory = vi.fn(() => Promise.resolve(runtime));
    const view = render(<WorldHost runtimeFactory={runtimeFactory} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Preparando a área de leitura…",
    );
    expect(screen.getByTestId("three-world-host")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await screen.findByText("Ambiente 3D em execução.");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Ambiente 3D em execução.",
    );
    expect(
      view.container.querySelectorAll("canvas[data-three-world-canvas='true']"),
    ).toHaveLength(1);
    expect(runtimeFactory).toHaveBeenCalledOnce();
    expect(runtime.mount).toHaveBeenCalledOnce();
    expect(runtime.start).toHaveBeenCalledOnce();
    expect(runtime.getSelectableObjects).toHaveBeenCalledOnce();
    expect(runtime.onDiagnosticsChange).not.toHaveBeenCalled();
    await openWorldControls();
    await userEvent.click(screen.getByText("Diagnóstico do mundo"));
    await waitFor(() =>
      expect(runtime.onDiagnosticsChange).toHaveBeenCalledOnce(),
    );
    expect(runtime.onFailure).toHaveBeenCalledOnce();
    expect(runtime.onSelectionChange).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("complementary", {
        name: "Diagnóstico técnico do ambiente 3D",
      }),
    ).toHaveAttribute("data-runtime-state", "running");
    expect(screen.getByText("60.0")).toBeVisible();

    view.unmount();

    expect(runtime.dispose).toHaveBeenCalledOnce();
  });

  it("permite selecionar por teclado sem uma parada de foco no canvas", async () => {
    const user = userEvent.setup();
    const runtime = createRuntime();
    const view = render(
      <WorldHost runtimeFactory={() => Promise.resolve(runtime)} />,
    );

    await openWorldControls();
    const previous = await screen.findByRole("button", {
      name: "← Anterior",
    });
    const next = screen.getByRole("button", { name: "Próximo →" });
    const selectionStatus = screen.getByText(
      "Objeto selecionado: Nenhum objeto selecionado.",
    );
    const canvas = view.container.querySelector("canvas");

    expect(selectionStatus).toHaveAttribute("aria-live", "polite");
    expect(canvas).not.toBeNull();
    expect(canvas).toHaveProperty("tabIndex", -1);

    // Diagnostic opt-ins precede selection in DOM order. Traverse them using
    // real tab actions; the canvas must never become a keyboard stop.
    for (
      let stops = 0;
      stops < 12 && document.activeElement !== previous;
      stops++
    ) {
      await user.tab();
      expect(document.activeElement).not.toBe(canvas);
    }
    expect(previous).toHaveFocus();
    expect(document.activeElement).not.toBe(canvas);
    await user.keyboard(" ");
    expect(runtime.selectObject).toHaveBeenLastCalledWith("fixture-pyramid");

    await user.tab();
    expect(next).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(runtime.selectObject).toHaveBeenLastCalledWith("bookshelf-01");
  });

  it("oferece ações contextuais e feedback semântico, inclusive carga/falha/movimento reduzido", async () => {
    const runtime = createRuntime();
    const play = vi.fn<NonNullable<WorldRuntime["playInhabitantAction"]>>(
      () => "playing",
    );
    runtime.playInhabitantAction = play;
    runtime.selectObject.mockImplementation((id) =>
      runtime.emitSelection(
        INHABITANTS.find((actor) => actor.id === id) ?? null,
      ),
    );
    const user = userEvent.setup();
    render(
      <WorldHost
        libraryWorldSnapshot={projectLibraryWorldEntries([])}
        runtimeFactory={() => Promise.resolve(runtime)}
      />,
    );
    await waitFor(() => expect(runtime.start).toHaveBeenCalled());
    await user.click(screen.getByText("Habitantes da Biblioteca"));
    await user.click(screen.getByRole("button", { name: "Lua" }));
    await user.click(screen.getByRole("button", { name: "Habilidade" }));
    expect(play).toHaveBeenLastCalledWith("character:lua", "magic");
    expect(
      screen.getByText(/Lua: Conjuração instável e recuperação/),
    ).toBeInTheDocument();
    for (const [result, text] of [
      ["loading", "Modelo carregando"],
      ["unavailable", "Animação indisponível"],
      ["reduced", "Movimento reduzido ativo"],
    ] as const) {
      play.mockReturnValue(result);
      await user.click(screen.getByRole("button", { name: "Atividade" }));
      expect(screen.getByText(new RegExp(text))).toBeInTheDocument();
    }
  });

  it("preserva navegação de objetos quando habitantes precedem o catálogo", async () => {
    const user = userEvent.setup();
    const runtime = createRuntime();
    runtime.getSelectableObjects.mockReturnValue([
      ...INHABITANTS,
      ...runtime.getSelectableObjects(),
    ]);
    render(<WorldHost runtimeFactory={() => Promise.resolve(runtime)} />);
    await openWorldControls();
    const next = await screen.findByRole("button", { name: "Próximo →" });
    await user.click(next);
    expect(runtime.selectObject).toHaveBeenLastCalledWith("bookshelf-01");
    act(() => runtime.emitSelection(INHABITANTS[0]));
    await user.click(next);
    expect(runtime.selectObject).toHaveBeenLastCalledWith("bookshelf-01");
    await user.click(screen.getByRole("button", { name: "← Anterior" }));
    expect(runtime.selectObject).toHaveBeenLastCalledWith("fixture-pyramid");
  });

  it("avança a partir da seleção vazia e percorre o catálogo", async () => {
    const user = userEvent.setup();
    const runtime = createRuntime();
    render(<WorldHost runtimeFactory={() => Promise.resolve(runtime)} />);

    await openWorldControls();
    const next = await screen.findByRole("button", {
      name: "Próximo →",
    });
    expect(
      screen.getByText("Objeto selecionado: Nenhum objeto selecionado."),
    ).toBeVisible();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();

    await user.click(next);
    expect(runtime.selectObject).toHaveBeenLastCalledWith("bookshelf-01");
    expect(
      screen.getByText("Objeto selecionado: Estante técnica 1."),
    ).toBeVisible();
    expect(next).toHaveFocus();

    await user.click(next);
    expect(runtime.selectObject).toHaveBeenLastCalledWith("table-01");
    await openWorldControls();
    expect(
      screen.getByText("Objeto selecionado: Mesa técnica 1."),
    ).toBeVisible();
  });

  it("alcança as três estantes procedurais pelos controles React", async () => {
    const user = userEvent.setup();
    const runtime = createRuntime();
    render(<WorldHost runtimeFactory={() => Promise.resolve(runtime)} />);

    await openWorldControls();
    const next = await screen.findByRole("button", { name: "Próximo →" });
    await user.click(next);
    await user.click(next);
    for (const [index, instanceId] of [
      "reading-shelf-01",
      "reading-shelf-02",
      "reading-shelf-03",
    ].entries()) {
      await user.click(next);
      expect(runtime.selectObject).toHaveBeenLastCalledWith(instanceId);
      expect(
        screen.getByText(
          `Objeto selecionado: Estante de leitura ${index + 1}.`,
        ),
      ).toBeVisible();
    }
  });

  it("recua a partir da seleção vazia e percorre o catálogo", async () => {
    const user = userEvent.setup();
    const runtime = createRuntime();
    render(<WorldHost runtimeFactory={() => Promise.resolve(runtime)} />);

    await openWorldControls();
    const previous = await screen.findByRole("button", {
      name: "← Anterior",
    });
    await user.click(previous);
    expect(runtime.selectObject).toHaveBeenLastCalledWith("fixture-pyramid");
    expect(
      screen.getByText("Objeto selecionado: Pirâmide técnica."),
    ).toBeVisible();

    await user.click(previous);
    expect(runtime.selectObject).toHaveBeenLastCalledWith("reading-shelf-03");
    expect(
      screen.getByText("Objeto selecionado: Estante de leitura 3."),
    ).toBeVisible();
  });

  it("faz wrap do último para o primeiro e do primeiro para o último", async () => {
    const user = userEvent.setup();
    const runtime = createRuntime();
    render(<WorldHost runtimeFactory={() => Promise.resolve(runtime)} />);

    await openWorldControls();
    const next = await screen.findByRole("button", { name: "Próximo →" });
    const previous = screen.getByRole("button", { name: "← Anterior" });
    act(() => {
      runtime.emitSelection({
        id: "fixture-pyramid",
        label: "Pirâmide técnica",
      });
    });
    await user.click(next);
    expect(runtime.selectObject).toHaveBeenLastCalledWith("bookshelf-01");

    await user.click(previous);
    expect(runtime.selectObject).toHaveBeenLastCalledWith("fixture-pyramid");
  });

  it("parte da seleção Three ao navegar nos dois sentidos", async () => {
    const user = userEvent.setup();
    const runtime = createRuntime();
    render(<WorldHost runtimeFactory={() => Promise.resolve(runtime)} />);

    await openWorldControls();
    const next = await screen.findByRole("button", { name: "Próximo →" });
    const previous = screen.getByRole("button", { name: "← Anterior" });
    act(() => {
      runtime.emitSelection({ id: "table-01", label: "Mesa técnica 1" });
    });
    await openWorldControls();
    expect(
      screen.getByText("Objeto selecionado: Mesa técnica 1."),
    ).toBeVisible();

    await user.click(next);
    expect(runtime.selectObject).toHaveBeenLastCalledWith("reading-shelf-01");
    expect(
      screen.getByText("Objeto selecionado: Estante de leitura 1."),
    ).toBeVisible();

    act(() => {
      runtime.emitSelection({ id: "table-01", label: "Mesa técnica 1" });
    });
    await user.click(previous);
    expect(runtime.selectObject).toHaveBeenLastCalledWith("bookshelf-01");
    expect(
      screen.getByText("Objeto selecionado: Estante técnica 1."),
    ).toBeVisible();
  });

  it("exibe fallback textual sem repetir a inicialização", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const runtimeFactory = vi.fn(() =>
      Promise.reject(new Error("WebGL unavailable")),
    );
    const view = render(<WorldHost runtimeFactory={runtimeFactory} />);

    const fallback = await screen.findByRole("alert");
    expect(fallback).toHaveTextContent("O ambiente 3D não pôde ser iniciado");
    expect(
      screen.getByText(/demais áreas continuam funcionando normalmente/u),
    ).toBeVisible();

    view.rerender(<WorldHost runtimeFactory={runtimeFactory} />);
    await waitFor(() => expect(runtimeFactory).toHaveBeenCalledOnce());
    expect(consoleError).toHaveBeenCalledWith(
      "[Biblioteca Viva] three-world-initialization-failed",
    );

    consoleError.mockRestore();
  });

  it("descarta a instância e limpa o estado efêmero ao receber falha terminal", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const runtime = createRuntime();
    render(<WorldHost runtimeFactory={() => Promise.resolve(runtime)} />);

    await screen.findByText("Ambiente 3D em execução.");
    act(() => {
      runtime.emitSelection({ id: "table-01", label: "Mesa técnica 1" });
      runtime.emitFailure({
        code: "unavailable",
        message: "O recurso gráfico deixou de estar disponível.",
      });
    });

    expect(
      screen.getByRole("heading", {
        name: "O ambiente 3D não pôde ser iniciado",
      }),
    ).toBeVisible();
    expect(
      screen.getByText("O recurso gráfico deixou de estar disponível."),
    ).toBeVisible();
    expect(screen.queryByTestId("world-diagnostics")).not.toBeInTheDocument();
    expect(runtime.dispose).toHaveBeenCalledOnce();
    expect(consoleError).toHaveBeenCalledWith(
      "[Biblioteca Viva] three-world-runtime-failed:unavailable",
      "O recurso gráfico deixou de estar disponível.",
    );

    consoleError.mockRestore();
  });

  it("não anuncia prontidão se start emite uma falha terminal síncrona", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const runtime = createRuntime();
    runtime.start.mockImplementationOnce(() => {
      runtime.emitFailure({
        code: "unavailable",
        message:
          "O ambiente 3D encontrou uma falha de renderização e foi encerrado.",
      });
    });
    render(<WorldHost runtimeFactory={() => Promise.resolve(runtime)} />);

    expect(
      await screen.findByRole("heading", {
        name: "O ambiente 3D não pôde ser iniciado",
      }),
    ).toBeVisible();
    expect(
      screen.queryByText("Ambiente 3D em execução."),
    ).not.toBeInTheDocument();
    expect(runtime.dispose).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });

  it("descarta uma montagem viva antes de montar uma substituta", async () => {
    const firstRuntime = createRuntime();
    const secondRuntime = createRuntime();
    const firstFactory = vi.fn(() => Promise.resolve(firstRuntime));
    const secondFactory = vi.fn(() => Promise.resolve(secondRuntime));
    const view = render(<WorldHost runtimeFactory={firstFactory} />);

    await screen.findByText("Ambiente 3D em execução.");
    act(() => {
      firstRuntime.emitSelection({
        id: "table-01",
        label: "Mesa técnica 1",
      });
    });
    await openWorldControls();
    expect(
      screen.getByText("Objeto selecionado: Mesa técnica 1."),
    ).toBeVisible();

    view.rerender(<WorldHost runtimeFactory={secondFactory} />);

    await waitFor(() => expect(secondRuntime.mount).toHaveBeenCalledOnce());
    expect(firstRuntime.dispose).toHaveBeenCalledOnce();
    expect(secondRuntime.mount).toHaveBeenCalledAfter(firstRuntime.dispose);
    await openWorldControls();
    expect(
      screen.getByText("Objeto selecionado: Nenhum objeto selecionado."),
    ).toBeVisible();
    expect(
      view.container.querySelectorAll("canvas[data-three-world-canvas='true']"),
    ).toHaveLength(1);
  });

  it("descarta criação tardia sem montar nem atualizar o host desmontado", async () => {
    const runtime = createRuntime();
    let resolveRuntime: ((runtime: WorldRuntime) => void) | undefined;
    const runtimeFactory = vi.fn(
      () =>
        new Promise<WorldRuntime>((resolve) => {
          resolveRuntime = resolve;
        }),
    );
    const view = render(<WorldHost runtimeFactory={runtimeFactory} />);

    view.unmount();
    await act(async () => {
      resolveRuntime?.(runtime);
      await Promise.resolve();
    });

    expect(runtime.mount).not.toHaveBeenCalled();
    expect(runtime.start).not.toHaveBeenCalled();
    expect(runtime.dispose).toHaveBeenCalledOnce();
  });

  it("entrega o snapshot neutro ao runtime normal e preserva precedência do factory explícito", async () => {
    const runtime = createRuntime();
    const books = Object.freeze([
      Object.freeze({
        entryId: "book-1",
        instanceId: "reading-book:book-1",
        modelTypeId: "book-volume" as const,
        readingProgress: Object.freeze({ currentPage: 1 }),
        title: "Livro real",
      }),
    ]);
    createThreeWorldRuntime.mockResolvedValueOnce(runtime);
    const view = render(<WorldHost readingAreaBooks={books} />);

    await screen.findByText("Ambiente 3D em execução.");
    expect(createThreeWorldRuntime).toHaveBeenCalledWith({
      deferPicking: true,
      readingAreaBooks: books,
    });

    const explicitRuntime = createRuntime();
    const runtimeFactory = vi.fn(() => Promise.resolve(explicitRuntime));
    view.rerender(
      <WorldHost readingAreaBooks={books} runtimeFactory={runtimeFactory} />,
    );
    await waitFor(() => expect(explicitRuntime.mount).toHaveBeenCalledOnce());
    expect(runtimeFactory).toHaveBeenCalledOnce();
    expect(createThreeWorldRuntime).toHaveBeenCalledOnce();
  });

  it("entrega o snapshot composto sem remount por seleção e preserva o caminho F5", async () => {
    createThreeWorldRuntime.mockClear();
    const snapshot = projectLibraryWorldEntries([]);
    const runtime = createRuntime();
    createThreeWorldRuntime.mockResolvedValue(runtime);
    const view = render(<WorldHost libraryWorldSnapshot={snapshot} />);
    await screen.findByText("Ambiente 3D em execução.");
    expect(
      vi.mocked(createThreeWorldRuntime).mock.calls[0]?.[0]?.livingSession,
    ).toBeInstanceOf(LivingSession);
    const nightLighting = vi.mocked(createThreeWorldRuntime).mock.calls[0]?.[0]
      ?.nightLighting;
    expect(nightLighting).toBeInstanceOf(NightLightingSession);
    expect(createThreeWorldRuntime).toHaveBeenCalledWith({
      deferPicking: true,
      libraryWorldSnapshot: snapshot,
      livingSession: vi.mocked(createThreeWorldRuntime).mock.calls[0]?.[0]
        ?.livingSession,
      nightLighting,
    });
    view.rerender(
      <WorldHost
        libraryWorldSnapshot={snapshot}
        selectedObjectId="reading-shelf-01"
      />,
    );
    expect(runtime.selectObject).toHaveBeenCalledWith("reading-shelf-01");
    expect(createThreeWorldRuntime).toHaveBeenCalledOnce();

    const diagnosticRuntime = createRuntime();
    createThreeWorldRuntime.mockResolvedValueOnce(diagnosticRuntime);
    const performanceScenario = {
      id: "f1-baseline" as const,
      label: "Diagnóstico",
      description: "Fixture",
      assets: [],
    };
    view.rerender(
      <WorldHost
        libraryWorldSnapshot={snapshot}
        performanceScenario={performanceScenario}
      />,
    );
    await waitFor(() => expect(diagnosticRuntime.mount).toHaveBeenCalledOnce());
    expect(createThreeWorldRuntime).toHaveBeenLastCalledWith({
      performanceScenario,
    });
    expect(runtime.dispose).toHaveBeenCalledOnce();
    view.unmount();
    expect(diagnosticRuntime.dispose).toHaveBeenCalledOnce();
  });

  it("loads checkpoints before mounting and forwards saves", async () => {
    createThreeWorldRuntime.mockReset();
    const runtime = createRuntime();
    createThreeWorldRuntime.mockResolvedValue(runtime);
    const snapshot = projectLibraryWorldEntries([]);
    const checkpoint = {
      version: 1 as const,
      savedAt: "2026-11-05T12:00:00.000Z",
      randomState: 17,
      agents: INHABITANTS.map((actor) => ({
        id: actor.id,
        x: actor.x,
        z: actor.z,
        facing: 0,
        phase: "idle" as const,
        taskId: null,
        destination: null,
        remainingSeconds: 3,
        recentTaskIds: [],
        taskCount: 0,
      })),
    };
    const continuity = {
      load: vi.fn(() => Promise.resolve(checkpoint)),
      save: vi.fn(() => Promise.resolve()),
    };
    render(
      <WorldHost
        libraryWorldSnapshot={snapshot}
        inhabitantContinuity={continuity}
      />,
    );
    await screen.findByText("Ambiente 3D em execução.");
    expect(continuity.load).toHaveBeenCalledOnce();
    const options = vi.mocked(createThreeWorldRuntime).mock.calls.at(-1)?.[0];
    expect(options).toMatchObject({
      libraryWorldSnapshot: snapshot,
      inhabitantContinuity: checkpoint,
    });
    expect(options?.livingSession).toBeInstanceOf(LivingSession);
    expect(options?.onInhabitantCheckpoint).toBeTypeOf("function");
    options?.onInhabitantCheckpoint?.(checkpoint);
    await waitFor(() => {
      expect(continuity.save).toHaveBeenCalledWith(checkpoint);
    });
  });

  it("encaminha seleção externa sem remontar o runtime", async () => {
    const runtime = createRuntime();
    const runtimeFactory = vi.fn(() => Promise.resolve(runtime));
    const view = render(
      <WorldHost runtimeFactory={runtimeFactory} selectedObjectId={null} />,
    );

    await screen.findByText("Ambiente 3D em execução.");
    runtime.selectObject.mockClear();
    view.rerender(
      <WorldHost runtimeFactory={runtimeFactory} selectedObjectId="table-01" />,
    );

    await waitFor(() =>
      expect(runtime.selectObject).toHaveBeenCalledWith("table-01"),
    );
    expect(runtimeFactory).toHaveBeenCalledOnce();
    expect(runtime.mount).toHaveBeenCalledOnce();
  });

  it("publica catálogo e seleção ao React e os limpa depois de falha terminal", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const runtime = createRuntime();
    const onSelectableObjectsChange = vi.fn();
    const onSelectionChange = vi.fn();
    render(
      <WorldHost
        onSelectableObjectsChange={onSelectableObjectsChange}
        onSelectionChange={onSelectionChange}
        runtimeFactory={() => Promise.resolve(runtime)}
      />,
    );

    await screen.findByText("Ambiente 3D em execução.");
    expect(onSelectableObjectsChange).toHaveBeenLastCalledWith(
      runtime.getSelectableObjects(),
    );
    act(() => {
      runtime.emitSelection({ id: "table-01", label: "Mesa técnica 1" });
    });
    expect(onSelectionChange).toHaveBeenLastCalledWith({
      id: "table-01",
      label: "Mesa técnica 1",
    });

    act(() => {
      runtime.emitFailure({
        code: "unavailable",
        message: "O recurso gráfico deixou de estar disponível.",
      });
    });
    expect(onSelectableObjectsChange).toHaveBeenLastCalledWith([]);
    expect(onSelectionChange).toHaveBeenLastCalledWith(null);
    consoleError.mockRestore();
  });
});

it("F3 subscribes to the runtime semantic snapshot and releases its listener on unmount", async () => {
  const runtime = createRuntime(),
    agency = new InhabitantAgency(new InhabitantNavigation([]));
  const off = vi.fn();
  runtime.onInhabitantsChange = vi.fn<
    NonNullable<WorldRuntime["onInhabitantsChange"]>
  >((listener) => {
    listener(agency.getSnapshot());
    return off;
  });
  const view = render(
    <WorldHost
      libraryWorldSnapshot={projectLibraryWorldEntries([])}
      runtimeFactory={() => Promise.resolve(runtime)}
    />,
  );
  await waitFor(() => expect(runtime.start).toHaveBeenCalled());
  await userEvent.click(screen.getByText("Habitantes da Biblioteca"));
  expect(
    screen.getByRole("region", { name: "Convivência dos habitantes" }),
  ).toHaveTextContent("Convivência pausada");
  view.unmount();
  expect(off).toHaveBeenCalledOnce();
  agency.dispose();
});

it("F4 opens from canvas once, bridges choices, retains progress after terminal failure and unsubscribes on teardown", async () => {
  const runtime = createRuntime();
  const applyNarrative = vi.fn<NonNullable<WorldRuntime["applyNarrative"]>>();
  runtime.applyNarrative = applyNarrative;
  let activate:
    | Parameters<NonNullable<WorldRuntime["onInhabitantActivate"]>>[0]
    | undefined;
  const offActivation = vi.fn();
  runtime.onInhabitantActivate = (listener) => {
    activate = listener;
    return offActivation;
  };
  const changes = vi.fn(),
    user = userEvent.setup();
  const view = render(
    <WorldHost
      libraryWorldSnapshot={projectLibraryWorldEntries([])}
      runtimeFactory={() => Promise.resolve(runtime)}
      onSelectionChange={changes}
    />,
  );
  await waitFor(() => expect(runtime.start).toHaveBeenCalledOnce());
  changes.mockClear();
  act(() => runtime.emitSelection(INHABITANTS[0]));
  expect(changes).toHaveBeenCalledOnce();
  expect(
    screen.getByRole("article", { name: "Conversa RPG" }),
  ).toHaveTextContent("As Cinzas do Caderno");
  await user.click(
    screen.getByRole("button", { name: /Investigar com discrição/ }),
  );
  expect(applyNarrative).toHaveBeenLastCalledWith(
    expect.objectContaining({ facts: ["ashes:discreet"] }),
  );
  await user.click(
    screen.getByRole("button", { name: "Adiar conversa e voltar ao mundo" }),
  );
  runtime.selectObject.mockImplementation(() => {});
  await user.click(screen.getByText("Habitantes da Biblioteca"));
  await user.click(screen.getByRole("button", { name: "Samael" }));
  expect(
    screen.getByRole("article", { name: "Conversa RPG" }),
  ).toHaveTextContent("Comparar a anotação");
  expect(changes).toHaveBeenCalledOnce();
  await user.click(
    screen.getByRole("button", { name: "Adiar conversa e voltar ao mundo" }),
  );
  act(() => activate?.("samael"));
  expect(
    screen.getByRole("article", { name: "Conversa RPG" }),
  ).toHaveTextContent("Comparar a anotação");
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  act(() =>
    runtime.emitFailure({
      code: "unavailable",
      message: "Falha gráfica fictícia.",
    }),
  );
  const calls = applyNarrative.mock.calls.length;
  expect(
    screen.getByRole("article", { name: "Conversa RPG" }),
  ).toHaveTextContent("nenhuma animação é confirmada");
  await user.click(screen.getByRole("button", { name: /Examinar o braseiro/ }));
  expect(applyNarrative).toHaveBeenCalledTimes(calls);
  expect(
    screen.getByRole("article", { name: "Conversa RPG" }),
  ).toHaveTextContent("Não há um sabotador");
  view.unmount();
  expect(offActivation).toHaveBeenCalled();
  act(() => {
    runtime.emitSelection(INHABITANTS[1]);
    activate?.("aryn");
  });
  expect(applyNarrative).toHaveBeenCalledTimes(calls);
  error.mockRestore();
});

it("R5 pauses a resident host, resumes the same canvas and disposes once", async () => {
  const runtime = createRuntime();
  const runtimeFactory = vi.fn(() => Promise.resolve(runtime));
  const view = render(<WorldHost runtimeFactory={runtimeFactory} active />);
  await screen.findByText("Ambiente 3D em execução.");
  const canvas = view.container.querySelector("canvas");
  for (let index = 0; index < 10; index++) {
    view.rerender(<WorldHost runtimeFactory={runtimeFactory} active={false} />);
    expect(runtime.pause).toHaveBeenCalledTimes(index + 1);
    expect(runtime.dispose).not.toHaveBeenCalled();
    view.rerender(<WorldHost runtimeFactory={runtimeFactory} active />);
    expect(runtime.resume).toHaveBeenCalledTimes(index + 1);
    expect(view.container.querySelector("canvas")).toBe(canvas);
  }
  expect(runtimeFactory).toHaveBeenCalledOnce();
  expect(runtime.mount).toHaveBeenCalledOnce();
  view.unmount();
  expect(runtime.dispose).toHaveBeenCalledOnce();
});

it("R3 owns one context clock timer through route changes and releases it on unmount", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 10, 7, 17, 59, 59, 500));
  try {
    const runtime = createRuntime();
    const runtimeFactory = () => Promise.resolve(runtime);
    const snapshot = projectLibraryWorldEntries([]);
    const view = render(
      <WorldHost
        runtimeFactory={runtimeFactory}
        libraryWorldSnapshot={snapshot}
      />,
    );
    await act(() => Promise.resolve());
    expect(runtime.mount).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(1);
    for (let i = 0; i < 10; i++) {
      view.rerender(
        <WorldHost
          runtimeFactory={runtimeFactory}
          libraryWorldSnapshot={snapshot}
          active={false}
        />,
      );
      view.rerender(
        <WorldHost
          runtimeFactory={runtimeFactory}
          libraryWorldSnapshot={snapshot}
          active
        />,
      );
      expect(vi.getTimerCount()).toBe(1);
    }
    await act(() => vi.advanceTimersByTime(500));
    expect(vi.getTimerCount()).toBe(1);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(runtime.dispose).toHaveBeenCalledOnce();
  } finally {
    vi.useRealTimers();
  }
});

it("R5 pauses a runtime that finishes loading after leaving the library", async () => {
  let finish: ((runtime: WorldRuntime) => void) | undefined;
  const runtimeFactory = () =>
    new Promise<WorldRuntime>((resolve) => {
      finish = resolve;
    });
  const runtime = createRuntime();
  const view = render(<WorldHost runtimeFactory={runtimeFactory} active />);
  view.rerender(<WorldHost runtimeFactory={runtimeFactory} active={false} />);
  await act(() => {
    finish?.(runtime);
    return Promise.resolve();
  });
  expect(runtime.start).toHaveBeenCalledOnce();
  expect(runtime.pause).toHaveBeenCalledOnce();
  expect(runtime.dispose).not.toHaveBeenCalled();
  view.unmount();
  expect(runtime.dispose).toHaveBeenCalledOnce();
});

it("R5 can retry a failed resident runtime without reloading personal data", async () => {
  const failed = createRuntime(),
    recovered = createRuntime();
  const runtimeFactory = vi
    .fn()
    .mockResolvedValueOnce(failed)
    .mockResolvedValueOnce(recovered);
  render(<WorldHost runtimeFactory={runtimeFactory} />);
  await screen.findByText("Ambiente 3D em execução.");
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  act(() =>
    failed.emitFailure({ code: "unavailable", message: "Falha fictícia" }),
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Tentar abrir o mundo novamente" }),
  );
  await screen.findByText("Ambiente 3D em execução.");
  expect(recovered.mount).toHaveBeenCalledOnce();
  expect(recovered.start).toHaveBeenCalledOnce();
  expect(document.querySelectorAll("canvas")).toHaveLength(1);
  log.mockRestore();
});

it("F2 reconciles confirmed sessions on the same resident Canvas, including while paused", async () => {
  const runtime = { ...createRuntime(), applyWorldSession: vi.fn() };
  const runtimeFactory = vi.fn(() => Promise.resolve(runtime));
  const session = {
    sessionId: "session-fiction",
    entryId: "book-fiction",
    instanceId: "reading-book:book-fiction",
    kind: "reading" as const,
    entryType: "book" as const,
    status: "active" as const,
    revision: 1,
  };
  const view = render(
    <WorldHost
      runtimeFactory={runtimeFactory}
      worldSessionActivity={session}
      active
    />,
  );
  await screen.findByText("Ambiente 3D em execução.");
  const canvas = view.container.querySelector("canvas");
  expect(runtime.applyWorldSession).toHaveBeenLastCalledWith(session);
  const paused = { ...session, status: "paused" as const, revision: 2 };
  view.rerender(
    <WorldHost
      runtimeFactory={runtimeFactory}
      worldSessionActivity={paused}
      active
    />,
  );
  expect(runtime.applyWorldSession).toHaveBeenLastCalledWith(paused);
  view.rerender(
    <WorldHost
      runtimeFactory={runtimeFactory}
      worldSessionActivity={null}
      active={false}
    />,
  );
  expect(runtime.applyWorldSession).toHaveBeenLastCalledWith(null);
  view.rerender(
    <WorldHost
      runtimeFactory={runtimeFactory}
      worldSessionActivity={null}
      active
    />,
  );
  expect(view.container.querySelector("canvas")).toBe(canvas);
  expect(runtimeFactory).toHaveBeenCalledOnce();
  expect(runtime.dispose).not.toHaveBeenCalled();
  view.unmount();
  expect(runtime.dispose).toHaveBeenCalledOnce();
});

it("R4 keeps the runtime and selection for progress-only updates and disposes on physical identity change", async () => {
  const { createBook } = await import("../../domain");
  const book = createBook({
    id: "r4-fiction",
    title: "Livro fictício",
    createdAt: "2026-11-07T12:00:00.000Z",
  });
  const runtime = createRuntime();
  const factory = vi.fn(() => Promise.resolve(runtime));
  const view = render(
    <WorldHost
      runtimeFactory={factory}
      libraryWorldSnapshot={projectLibraryWorldEntries([book])}
      selectedObjectId="fixture-pyramid"
    />,
  );
  await waitFor(() => expect(runtime.start).toHaveBeenCalledOnce());
  await waitFor(() =>
    expect(runtime.selectObject).toHaveBeenLastCalledWith("fixture-pyramid"),
  );
  const calls = runtime.selectObject.mock.calls.length;
  view.rerender(
    <WorldHost
      runtimeFactory={factory}
      libraryWorldSnapshot={projectLibraryWorldEntries([
        { ...book, currentPage: 12 },
      ])}
      selectedObjectId="fixture-pyramid"
    />,
  );
  expect(factory).toHaveBeenCalledOnce();
  expect(runtime.dispose).not.toHaveBeenCalled();
  expect(runtime.selectObject.mock.calls.length).toBe(calls);
  view.rerender(
    <WorldHost
      runtimeFactory={factory}
      libraryWorldSnapshot={projectLibraryWorldEntries([])}
      selectedObjectId={null}
    />,
  );
  await waitFor(() => expect(runtime.dispose).toHaveBeenCalledOnce());
  expect(factory).toHaveBeenCalledTimes(2);
  view.unmount();
});

it("R5Q primes the current narrative before mounting, including a retained rift on scene replacement", async () => {
  const first = createRuntime(),
    second = createRuntime();
  const prime = vi.fn<NonNullable<WorldRuntime["applyNarrative"]>>();
  second.applyNarrative = prime;
  const initialFactory = () => Promise.resolve(first),
    nextFactory = () => Promise.resolve(second);
  const snapshot = projectLibraryWorldEntries([]);
  const view = render(
    <WorldHost
      libraryWorldSnapshot={snapshot}
      runtimeFactory={initialFactory}
    />,
  );
  await waitFor(() => expect(first.start).toHaveBeenCalledOnce());
  await userEvent.click(
    screen.getByRole("button", { name: "A Noite da Fenda Lilás" }),
  );
  view.rerender(
    <WorldHost libraryWorldSnapshot={snapshot} runtimeFactory={nextFactory} />,
  );
  await waitFor(() => expect(second.start).toHaveBeenCalledOnce());
  expect(prime.mock.invocationCallOrder[0]).toBeLessThan(
    second.mount.mock.invocationCallOrder[0],
  );
  expect(prime.mock.calls[0][0]).toMatchObject({
    active: "rift",
    scenes: { rift: "troubled" },
  });
  expect(screen.getByRole("article", { name: "Conversa RPG" })).toBeVisible();
  view.unmount();
  expect(first.dispose).toHaveBeenCalledOnce();
  expect(second.dispose).toHaveBeenCalledOnce();
});

it("R5Q quest observation requires explicit opt-in and clears on diagnostic close", async () => {
  createThreeWorldRuntime.mockReset();
  const runtime = createRuntime();
  const setQuestProbeEnabled = vi.fn<(enabled: boolean) => void>();
  runtime.setQuestProbeEnabled = setQuestProbeEnabled;
  createThreeWorldRuntime.mockResolvedValue(runtime);
  const user = userEvent.setup();
  const view = render(<WorldHost />);
  await waitFor(() => expect(runtime.start).toHaveBeenCalledOnce());
  await openWorldControls();
  const summary = screen.getByText("Diagnóstico do mundo");
  await user.click(summary);
  await user.click(
    screen.getByRole("checkbox", {
      name: "Registrar próximas seleções localmente",
    }),
  );
  expect(setQuestProbeEnabled).toHaveBeenLastCalledWith(true);
  await user.click(summary);
  await waitFor(() =>
    expect(setQuestProbeEnabled).toHaveBeenLastCalledWith(false),
  );
  view.unmount();
  expect(runtime.dispose).toHaveBeenCalledOnce();
});
