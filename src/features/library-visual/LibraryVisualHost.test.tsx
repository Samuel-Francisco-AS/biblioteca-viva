import { render, screen, waitFor } from "@testing-library/react";
import { StrictMode, type ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  LibraryInteraction,
  CreateLibraryVisualGameOptions,
  LibraryVisualFactoryModule,
  LibraryVisualGame,
  LibraryViewModel,
} from "./contracts";
import { createLibraryVisualDiagnostics } from "./diagnostics";
import { LibraryVisualHost } from "./LibraryVisualHost";

let resizeCallback: ResizeObserverCallback | undefined;
const disconnect = vi.fn();
const observeResize = vi.fn();

class ResizeObserverStub {
  constructor(callback: ResizeObserverCallback) {
    resizeCallback = callback;
  }

  disconnect = disconnect;
  observe = observeResize;
  unobserve = vi.fn();
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

function game(): LibraryVisualGame {
  return {
    destroy: vi.fn(),
    pause: vi.fn(),
    resize: vi.fn(),
    resume: vi.fn(),
    setInteractionHandler: vi.fn(),
    updateProjection: vi.fn(),
  };
}

const projection: LibraryViewModel = {
  completedBooks: 0,
  decorationUnlockAnimation: null,
  hasCompletedBook: false,
  hasFirstCompletionMilestone: false,
  highlightedBook: null,
  inProgressBooks: 0,
  roomState: "default",
  shelfOccupancy: "empty",
  shelfVisualGroupCount: 0,
  totalBooks: 0,
  unlockedDecorationIds: [],
};

function renderHost(
  props: Partial<ComponentProps<typeof LibraryVisualHost>> = {},
) {
  return render(<LibraryVisualHost projection={projection} {...props} />);
}

function factoryFor(instance: LibraryVisualGame) {
  const createLibraryVisualGame = vi.fn(
    (options: CreateLibraryVisualGameOptions) => {
      void options;
      return Promise.resolve(instance);
    },
  );
  const loadFactory = vi.fn(() =>
    Promise.resolve({
      createLibraryVisualGame,
    } satisfies LibraryVisualFactoryModule),
  );
  return { createLibraryVisualGame, loadFactory };
}

function setVisibility(value: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value,
  });
}

describe("LibraryVisualHost", () => {
  beforeEach(() => {
    resizeCallback = undefined;
    disconnect.mockClear();
    observeResize.mockClear();
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    setVisibility("visible");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("abre a Biblioteca com uma única criação e a Coleção continua acessível", async () => {
    const instance = game();
    const { createLibraryVisualGame, loadFactory } = factoryFor(instance);
    renderHost({ loadFactory });

    await waitFor(() => expect(createLibraryVisualGame).toHaveBeenCalledOnce());
    expect(loadFactory).toHaveBeenCalledOnce();
  });

  it("destrói exatamente uma instância e remove observer ao desmontar", async () => {
    const instance = game();
    const { createLibraryVisualGame, loadFactory } = factoryFor(instance);
    const rendered = renderHost({ loadFactory });
    await waitFor(() => expect(createLibraryVisualGame).toHaveBeenCalledOnce());

    rendered.unmount();

    expect(instance.destroy).toHaveBeenCalledOnce();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("não deixa instância órfã no Strict Mode", async () => {
    const instance = game();
    const { createLibraryVisualGame, loadFactory } = factoryFor(instance);
    const rendered = render(
      <StrictMode>
        <LibraryVisualHost loadFactory={loadFactory} projection={projection} />
      </StrictMode>,
    );
    await waitFor(() => expect(createLibraryVisualGame).toHaveBeenCalledOnce());

    rendered.unmount();

    expect(instance.destroy).toHaveBeenCalledOnce();
  });

  it("não cria jogo quando o import termina depois da desmontagem", async () => {
    const pending = deferred<LibraryVisualFactoryModule>();
    const createLibraryVisualGame = vi.fn(() => Promise.resolve(game()));
    const rendered = renderHost({ loadFactory: () => pending.promise });

    rendered.unmount();
    pending.resolve({ createLibraryVisualGame });
    await Promise.resolve();

    expect(createLibraryVisualGame).not.toHaveBeenCalled();
  });

  it("redimensiona a instância existente sem recriá-la e ignora resize após desmontar", async () => {
    let hostSize = { height: 180, width: 320 };
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      () => boundsFor(hostSize),
    );
    const instance = game();
    const { createLibraryVisualGame, loadFactory } = factoryFor(instance);
    const rendered = renderHost({ loadFactory });
    await waitFor(() => expect(createLibraryVisualGame).toHaveBeenCalledOnce());
    expect(instance.resize).not.toHaveBeenCalled();

    resizeCallback?.([], {} as ResizeObserver);
    expect(instance.resize).not.toHaveBeenCalled();
    hostSize = { height: 203, width: 360 };
    resizeCallback?.([], {} as ResizeObserver);
    expect(instance.resize).toHaveBeenCalledOnce();
    expect(instance.resize).toHaveBeenLastCalledWith(hostSize);
    expect(createLibraryVisualGame).toHaveBeenCalledOnce();

    rendered.unmount();
    resizeCallback?.([], {} as ResizeObserver);
    expect(instance.resize).toHaveBeenCalledOnce();
  });

  it("atualiza da largura regular para a compacta na mesma instância", async () => {
    let hostSize = { height: 320, width: 640 };
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      () => boundsFor(hostSize),
    );
    const instance = game();
    const { createLibraryVisualGame, loadFactory } = factoryFor(instance);
    const rendered = renderHost({ loadFactory });
    await waitFor(() => expect(createLibraryVisualGame).toHaveBeenCalledOnce());

    hostSize = { height: 192, width: 288 };
    resizeCallback?.([], {} as ResizeObserver);

    expect(instance.resize).toHaveBeenLastCalledWith(hostSize);
    expect(createLibraryVisualGame).toHaveBeenCalledOnce();
    expect(observeResize).toHaveBeenCalledOnce();
    rendered.unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("atualiza da largura compacta para a regular sem acumular observers", async () => {
    let hostSize = { height: 192, width: 288 };
    const addEventListener = vi.spyOn(document, "addEventListener");
    const removeEventListener = vi.spyOn(document, "removeEventListener");
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      () => boundsFor(hostSize),
    );
    const instance = game();
    const { createLibraryVisualGame, loadFactory } = factoryFor(instance);
    const rendered = renderHost({ loadFactory });
    await waitFor(() => expect(createLibraryVisualGame).toHaveBeenCalledOnce());

    hostSize = { height: 320, width: 640 };
    resizeCallback?.([], {} as ResizeObserver);
    resizeCallback?.([], {} as ResizeObserver);

    expect(instance.resize).toHaveBeenLastCalledWith(hostSize);
    expect(instance.resize).toHaveBeenCalledOnce();
    expect(createLibraryVisualGame).toHaveBeenCalledOnce();
    expect(observeResize).toHaveBeenCalledOnce();
    expect(
      addEventListener.mock.calls.filter(
        ([eventName]) => eventName === "visibilitychange",
      ),
    ).toHaveLength(1);
    rendered.unmount();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(
      removeEventListener.mock.calls.filter(
        ([eventName]) => eventName === "visibilitychange",
      ),
    ).toHaveLength(1);
  });

  it("pausa e retoma de forma idempotente conforme a visibilidade", async () => {
    const instance = game();
    const { createLibraryVisualGame, loadFactory } = factoryFor(instance);
    renderHost({ loadFactory });
    await waitFor(() => expect(createLibraryVisualGame).toHaveBeenCalledOnce());

    setVisibility("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    document.dispatchEvent(new Event("visibilitychange"));
    expect(instance.pause).toHaveBeenCalledOnce();

    setVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    document.dispatchEvent(new Event("visibilitychange"));
    expect(instance.resume).toHaveBeenCalledOnce();
  });

  it("ignora scroll e callbacks de resize sem mudança de tamanho", async () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      () => boundsFor({ height: 180, width: 320 }),
    );
    const instance = game();
    const { createLibraryVisualGame, loadFactory } = factoryFor(instance);
    renderHost({ loadFactory });
    await waitFor(() => expect(createLibraryVisualGame).toHaveBeenCalledOnce());

    window.dispatchEvent(new Event("scroll"));
    resizeCallback?.([], {} as ResizeObserver);
    resizeCallback?.([], {} as ResizeObserver);
    expect(instance.resize).not.toHaveBeenCalled();
  });

  it("apresenta fallback React e limpa criação parcial quando a factory falha", async () => {
    const partial = game();
    const createLibraryVisualGame = vi.fn(() => {
      partial.destroy();
      return Promise.reject(new Error("renderer interno"));
    });
    renderHost({
      loadFactory: () =>
        Promise.resolve({
          createLibraryVisualGame,
        } satisfies LibraryVisualFactoryModule),
    });

    expect(
      await screen.findByRole("heading", {
        name: "A visualização da biblioteca não pôde ser carregada",
      }),
    ).toBeVisible();
    expect(partial.destroy).toHaveBeenCalledOnce();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(screen.queryByText("renderer interno")).not.toBeInTheDocument();
  });

  it("registra estado e contagens de forma determinística no diagnóstico injetado", async () => {
    const diagnostics = createLibraryVisualDiagnostics();
    const instance = game();
    const { createLibraryVisualGame, loadFactory } = factoryFor(instance);
    const rendered = renderHost({ diagnostics, loadFactory });
    await waitFor(() => expect(createLibraryVisualGame).toHaveBeenCalledOnce());
    expect(diagnostics.snapshot()).toMatchObject({
      activeInstances: 1,
      createdInstances: 1,
      state: "ready",
    });

    rendered.unmount();
    expect(diagnostics.snapshot()).toMatchObject({
      activeInstances: 0,
      destroyedInstances: 1,
      state: "destroyed",
    });
  });

  it("entrega a projeção inicial e atualiza a mesma instância sem outro canvas", async () => {
    const instance = game();
    const { createLibraryVisualGame, loadFactory } = factoryFor(instance);
    const rendered = renderHost({ loadFactory });
    await waitFor(() => expect(createLibraryVisualGame).toHaveBeenCalledOnce());
    expect(createLibraryVisualGame.mock.calls[0]?.[0]?.projection).toEqual(
      projection,
    );

    const nextProjection = {
      ...projection,
      shelfOccupancy: "initial" as const,
      shelfVisualGroupCount: 2,
      totalBooks: 1,
    };
    rendered.rerender(
      <LibraryVisualHost
        loadFactory={loadFactory}
        projection={nextProjection}
      />,
    );

    expect(createLibraryVisualGame).toHaveBeenCalledOnce();
    expect(instance.updateProjection).toHaveBeenCalledWith(nextProjection);
  });

  it("usa a projeção mais recente se a factory resolver depois de um rerender", async () => {
    const pending = deferred<LibraryVisualFactoryModule>();
    const instance = game();
    const loadFactory = () => pending.promise;
    const rendered = renderHost({ loadFactory });
    const nextProjection = {
      ...projection,
      shelfOccupancy: "full" as const,
      shelfVisualGroupCount: 8,
      totalBooks: 20,
    };
    rendered.rerender(
      <LibraryVisualHost
        loadFactory={loadFactory}
        projection={nextProjection}
      />,
    );
    pending.resolve({
      createLibraryVisualGame: vi.fn(() => Promise.resolve(instance)),
    });

    await waitFor(() =>
      expect(instance.updateProjection).toHaveBeenCalledWith(nextProjection),
    );
    expect(instance.destroy).not.toHaveBeenCalled();
  });

  it("encaminha uma interação tipada uma única vez e troca o handler sem criar jogo", async () => {
    const instance = game();
    const { createLibraryVisualGame, loadFactory } = factoryFor(instance);
    const onInteraction = vi.fn();
    renderHost({ loadFactory, onInteraction });
    await waitFor(() => expect(createLibraryVisualGame).toHaveBeenCalledOnce());
    const options = createLibraryVisualGame.mock.calls[0]?.[0];
    const interaction: LibraryInteraction = { type: "ShelfSelected" };
    options?.onInteraction(interaction);
    expect(onInteraction).toHaveBeenCalledOnce();
    expect(onInteraction).toHaveBeenCalledWith(interaction);
  });

  it("ignora interações recebidas depois do destroy", async () => {
    const instance = game();
    const { createLibraryVisualGame, loadFactory } = factoryFor(instance);
    const onInteraction = vi.fn();
    const rendered = renderHost({ loadFactory, onInteraction });
    await waitFor(() => expect(createLibraryVisualGame).toHaveBeenCalledOnce());
    const options = createLibraryVisualGame.mock.calls[0]?.[0];

    rendered.unmount();
    options?.onInteraction({ type: "CreatureSelected" });
    expect(onInteraction).not.toHaveBeenCalled();
  });

  it("entrega preferência local de movimento reduzido à mesma factory lazy", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true })),
    );
    const instance = game();
    const { createLibraryVisualGame, loadFactory } = factoryFor(instance);
    renderHost({ loadFactory });
    await waitFor(() => expect(createLibraryVisualGame).toHaveBeenCalledOnce());
    expect(createLibraryVisualGame.mock.calls[0]?.[0]?.reducedMotion).toBe(
      true,
    );
    expect(loadFactory).toHaveBeenCalledOnce();
  });
});

function boundsFor({
  height,
  width,
}: {
  height: number;
  width: number;
}): DOMRect {
  return {
    bottom: height,
    height,
    left: 0,
    right: width,
    toJSON: () => ({}),
    top: 0,
    width,
    x: 0,
    y: 0,
  };
}
