import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, type Mock } from "vitest";

import type {
  WorldDiagnosticsListener,
  WorldRuntime,
  WorldRuntimeDiagnostics,
  WorldSelectableObject,
  WorldSelection,
  WorldSelectionListener,
} from "./worldRuntime";
import { WorldHost } from "./WorldHost";

interface TestWorldRuntime extends WorldRuntime {
  readonly dispose: Mock<() => void>;
  readonly emitSelection: (selection: WorldSelection) => void;
  readonly getDiagnostics: Mock<() => WorldRuntimeDiagnostics>;
  readonly getSelectableObjects: Mock<() => readonly WorldSelectableObject[]>;
  readonly mount: Mock<(host: HTMLElement) => void>;
  readonly onDiagnosticsChange: Mock<
    (listener: WorldDiagnosticsListener) => () => void
  >;
  readonly onSelectionChange: Mock<
    (listener: WorldSelectionListener) => () => void
  >;
  readonly selectObject: Mock<(id: string | null) => void>;
  readonly start: Mock<() => void>;
}

function createRuntime(): TestWorldRuntime {
  const selectables = [
    { id: "bookshelf-01", label: "Estante técnica 1" },
    { id: "table-01", label: "Mesa técnica 1" },
    { id: "fixture-pyramid", label: "Pirâmide técnica" },
  ] as const;
  let selectionListener: WorldSelectionListener | undefined;
  const diagnostics: WorldRuntimeDiagnostics = {
    activeFrameLoops: 1,
    drawCalls: 46,
    fixtureLoadMs: 25,
    fixtureStatus: "ready",
    fps: 60,
    frameTimeMs: 16.67,
    geometries: 46,
    meshes: 46,
    renderedFrames: 20,
    runtimeState: "running",
    sceneObjects: 59,
    selectableObjects: 11,
    textures: 1,
    timeToFirstUsableFrameMs: 4,
    triangles: 546,
  };
  const unsubscribe = vi.fn(() => {
    selectionListener = undefined;
  });
  const runtime: TestWorldRuntime = {
    dispose: vi.fn(),
    emitSelection: (selection) => selectionListener?.(selection),
    getDiagnostics: vi.fn(() => diagnostics),
    getSelectableObjects: vi.fn(() => selectables),
    mount: vi.fn((host: HTMLElement) => {
      const canvas = document.createElement("canvas");
      canvas.dataset.threeWorldCanvas = "true";
      host.append(canvas);
    }),
    onDiagnosticsChange: vi.fn((listener) => {
      listener(diagnostics);
      return vi.fn();
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

    expect(
      screen.getByText("Preparando o ambiente 3D experimental…"),
    ).toBeVisible();
    expect(
      await screen.findByText("Ambiente 3D experimental em execução."),
    ).toBeVisible();
    expect(runtimeFactory).toHaveBeenCalledOnce();
    expect(runtime.mount).toHaveBeenCalledOnce();
    expect(runtime.start).toHaveBeenCalledOnce();
    expect(runtime.getSelectableObjects).toHaveBeenCalledOnce();
    expect(runtime.onDiagnosticsChange).toHaveBeenCalledOnce();
    expect(runtime.onSelectionChange).toHaveBeenCalledOnce();
    expect(
      view.container.querySelectorAll("canvas[data-three-world-canvas='true']"),
    ).toHaveLength(1);
    expect(
      screen.getByRole("complementary", {
        name: "Diagnóstico técnico do ambiente 3D",
      }),
    ).toHaveAttribute("data-runtime-state", "running");
    expect(screen.getByText("60.0")).toBeVisible();

    view.unmount();

    expect(runtime.dispose).toHaveBeenCalledOnce();
  });

  it("avança a partir da seleção vazia e percorre o catálogo", async () => {
    const user = userEvent.setup();
    const runtime = createRuntime();
    render(<WorldHost runtimeFactory={() => Promise.resolve(runtime)} />);

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
    expect(
      screen.getByText("Objeto selecionado: Mesa técnica 1."),
    ).toBeVisible();
  });

  it("recua a partir da seleção vazia e percorre o catálogo", async () => {
    const user = userEvent.setup();
    const runtime = createRuntime();
    render(<WorldHost runtimeFactory={() => Promise.resolve(runtime)} />);

    const previous = await screen.findByRole("button", {
      name: "← Anterior",
    });
    await user.click(previous);
    expect(runtime.selectObject).toHaveBeenLastCalledWith("fixture-pyramid");
    expect(
      screen.getByText("Objeto selecionado: Pirâmide técnica."),
    ).toBeVisible();

    await user.click(previous);
    expect(runtime.selectObject).toHaveBeenLastCalledWith("table-01");
    expect(
      screen.getByText("Objeto selecionado: Mesa técnica 1."),
    ).toBeVisible();
  });

  it("faz wrap do último para o primeiro e do primeiro para o último", async () => {
    const user = userEvent.setup();
    const runtime = createRuntime();
    render(<WorldHost runtimeFactory={() => Promise.resolve(runtime)} />);

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

    const next = await screen.findByRole("button", { name: "Próximo →" });
    const previous = screen.getByRole("button", { name: "← Anterior" });
    act(() => {
      runtime.emitSelection({ id: "table-01", label: "Mesa técnica 1" });
    });
    expect(
      screen.getByText("Objeto selecionado: Mesa técnica 1."),
    ).toBeVisible();

    await user.click(next);
    expect(runtime.selectObject).toHaveBeenLastCalledWith("fixture-pyramid");
    expect(
      screen.getByText("Objeto selecionado: Pirâmide técnica."),
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

    expect(
      await screen.findByRole("heading", {
        name: "O ambiente 3D não pôde ser iniciado",
      }),
    ).toBeVisible();
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
});
