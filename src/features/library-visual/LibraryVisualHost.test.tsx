import { render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  LibraryVisualFactoryModule,
  LibraryVisualGame,
} from "./contracts";
import { createLibraryVisualDiagnostics } from "./diagnostics";
import { LibraryVisualHost } from "./LibraryVisualHost";

let resizeCallback: ResizeObserverCallback | undefined;
const disconnect = vi.fn();

class ResizeObserverStub {
  constructor(callback: ResizeObserverCallback) {
    resizeCallback = callback;
  }

  disconnect = disconnect;
  observe = vi.fn();
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
  };
}

function factoryFor(instance: LibraryVisualGame) {
  const createLibraryVisualGame = vi.fn(() => Promise.resolve(instance));
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
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    setVisibility("visible");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("abre a Biblioteca com uma única criação e a Coleção continua acessível", async () => {
    const instance = game();
    const { createLibraryVisualGame, loadFactory } = factoryFor(instance);
    render(<LibraryVisualHost loadFactory={loadFactory} />);

    await waitFor(() => expect(createLibraryVisualGame).toHaveBeenCalledOnce());
    expect(loadFactory).toHaveBeenCalledOnce();
  });

  it("destrói exatamente uma instância e remove observer ao desmontar", async () => {
    const instance = game();
    const { createLibraryVisualGame, loadFactory } = factoryFor(instance);
    const rendered = render(<LibraryVisualHost loadFactory={loadFactory} />);
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
        <LibraryVisualHost loadFactory={loadFactory} />
      </StrictMode>,
    );
    await waitFor(() => expect(createLibraryVisualGame).toHaveBeenCalledOnce());

    rendered.unmount();

    expect(instance.destroy).toHaveBeenCalledOnce();
  });

  it("não cria jogo quando o import termina depois da desmontagem", async () => {
    const pending = deferred<LibraryVisualFactoryModule>();
    const createLibraryVisualGame = vi.fn(() => Promise.resolve(game()));
    const rendered = render(
      <LibraryVisualHost loadFactory={() => pending.promise} />,
    );

    rendered.unmount();
    pending.resolve({ createLibraryVisualGame });
    await Promise.resolve();

    expect(createLibraryVisualGame).not.toHaveBeenCalled();
  });

  it("redimensiona a instância existente sem recriá-la e ignora resize após desmontar", async () => {
    const instance = game();
    const { createLibraryVisualGame, loadFactory } = factoryFor(instance);
    const rendered = render(<LibraryVisualHost loadFactory={loadFactory} />);
    await waitFor(() => expect(createLibraryVisualGame).toHaveBeenCalledOnce());
    const resizesBeforeObserver = vi.mocked(instance.resize).mock.calls.length;

    resizeCallback?.([], {} as ResizeObserver);
    expect(instance.resize).toHaveBeenCalledTimes(resizesBeforeObserver + 1);
    expect(createLibraryVisualGame).toHaveBeenCalledOnce();

    rendered.unmount();
    resizeCallback?.([], {} as ResizeObserver);
    expect(instance.resize).toHaveBeenCalledTimes(resizesBeforeObserver + 1);
  });

  it("pausa e retoma de forma idempotente conforme a visibilidade", async () => {
    const instance = game();
    const { createLibraryVisualGame, loadFactory } = factoryFor(instance);
    render(<LibraryVisualHost loadFactory={loadFactory} />);
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

  it("apresenta fallback React e limpa criação parcial quando a factory falha", async () => {
    const partial = game();
    const createLibraryVisualGame = vi.fn(() => {
      partial.destroy();
      return Promise.reject(new Error("renderer interno"));
    });
    render(
      <LibraryVisualHost
        loadFactory={() =>
          Promise.resolve({
            createLibraryVisualGame,
          } satisfies LibraryVisualFactoryModule)
        }
      />,
    );

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
    const rendered = render(
      <LibraryVisualHost diagnostics={diagnostics} loadFactory={loadFactory} />,
    );
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
});
