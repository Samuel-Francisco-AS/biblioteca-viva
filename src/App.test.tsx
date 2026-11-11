import "fake-indexeddb/auto";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";
import { cancelPassage, completePassageDeparture } from "./app/interactionContinuity";
import { CRYSTAL_PRESS_ECHO_MS } from "./app/crystalPress";

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});

vi.mock("@capacitor/core", () => ({
  registerPlugin: vi.fn(() => ({})),
  Capacitor: { isNativePlatform: () => false, getPlatform: () => "web" },
}));
vi.mock("@capacitor/app", () => ({
  App: {
    addListener: vi.fn(() => Promise.resolve({ remove: vi.fn() })),
    exitApp: vi.fn(),
  },
}));
vi.mock("./features/library/WorldHost", () => ({
  WorldHost: () => <div data-testid="world-host-stub" />,
}));

describe("App", () => {
  it("abre o shell e a Biblioteca na rota inicial", () => {
    const { container } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole("banner")).toHaveTextContent("Biblioteca");
    expect(screen.getByRole("main")).toBeVisible();
    expect(
      within(
        screen.getByRole("navigation", { name: "Navegação principal" }),
      ).getAllByRole("link"),
    ).toHaveLength(5);
    expect(
      container.querySelector("[data-testid='world-host-stub']"),
    ).toBeNull();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível iniciar o armazenamento local.",
    );
  });

  it("mantém os registros da Biblioteca e o acesso à Coleção", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", {
        name: "Biblioteca Viva",
      }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Abrir Coleção" })).toHaveAttribute(
      "href",
      "/colecao",
    );
  });
});

it("R7 releases touch feedback on scroll/cancellation and hands off a valid release without flicker", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  const link = screen.getByRole("link", { name: "Coleção" });
  const emit = (type: string, x = 20) =>
    link.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        pointerType: "touch",
        isPrimary: true,
        pointerId: 1,
        clientX: x,
        clientY: 20,
      }),
    );
  emit("pointerdown");
  expect(link).toHaveAttribute("data-tap-active", "true");
  expect(screen.getByRole("banner")).toHaveTextContent("Biblioteca");
  emit("pointermove", 40);
  expect(link).not.toHaveAttribute("data-tap-active");
  emit("pointerdown");
  emit("pointercancel");
  expect(link).not.toHaveAttribute("data-tap-active");
  emit("pointerdown");
  emit("pointerup");
  expect(link).not.toHaveAttribute("data-tap-active");
  // A completed touch already has its short echo before a click can run.
  expect(link).toHaveAttribute("data-crystal-pressed", "true");
});

it("R2 keeps one continuous press across pointerup and click, without restarting the echo", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  const button = document.createElement("button");
  button.textContent = "Abrir card de teste";
  document.querySelector(".app-shell")!.append(button);
  const emit = (type: string) =>
    button.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        pointerType: "touch",
        isPrimary: true,
        pointerId: 12,
        clientX: 20,
        clientY: 20,
      }),
    );
  // Install fake timers BEFORE pointerup schedules the press echo.
  vi.useFakeTimers();
  try {
    emit("pointerdown");
    expect(button).toHaveAttribute("data-tap-active", "true");
    emit("pointerup");
    expect(button).not.toHaveAttribute("data-tap-active");
    expect(button).toHaveAttribute("data-crystal-pressed", "true");
    act(() => {
      vi.advanceTimersByTime(30);
    });
    fireEvent.click(button, { detail: 1 });
    expect(button).toHaveAttribute("data-crystal-pressed", "true");
    // The semantic click must not restart the existing echo countdown.
    act(() => {
      vi.advanceTimersByTime(CRYSTAL_PRESS_ECHO_MS - 30);
    });
    expect(button).not.toHaveAttribute("data-crystal-pressed");
  } finally {
    vi.useRealTimers();
    button.remove();
  }
});

it("R2 does not add an echo on a cancelled scroll gesture", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  const button = document.createElement("button");
  document.querySelector(".app-shell")!.append(button);
  const emit = (type: string, x: number) =>
    button.dispatchEvent(new PointerEvent(type, {
      bubbles: true, pointerType: "touch", isPrimary: true,
      pointerId: 13, clientX: x, clientY: 20,
    }));
  emit("pointerdown", 10);
  emit("pointermove", 35);
  emit("pointerup", 35);
  expect(button).not.toHaveAttribute("data-tap-active");
  expect(button).not.toHaveAttribute("data-crystal-pressed");
});

it("shows a non-blocking passage for same-tab navigation, not modified clicks", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  const link = screen.getByRole("link", { name: "Coleção" });
  const shell = document.querySelector(".app-shell");
  fireEvent.click(link, { ctrlKey: true });
  expect(shell).not.toHaveAttribute("data-passage");
  fireEvent.click(link);
  expect(shell).toHaveAttribute("data-passage", "departing");
  expect(document.querySelector(".passage-veil")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
});

it("R9 only pulses for confirmed clicks, including consecutive keyboard activations", () => {
  const vibrate = vi.fn();
  Object.defineProperty(navigator, "vibrate", {
    configurable: true,
    value: vibrate,
  });
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  const control = document.createElement("button");
  control.textContent = "Comando fictício";
  document.querySelector(".app-shell")!.append(control);
  fireEvent.pointerDown(control, {
    pointerType: "touch",
    isPrimary: true,
    pointerId: 1,
  });
  fireEvent.pointerUp(control, {
    pointerType: "touch",
    isPrimary: true,
    pointerId: 1,
  });
  expect(vibrate).not.toHaveBeenCalled();
  fireEvent.click(control, { detail: 0 });
  fireEvent.click(control, { detail: 0 });
  expect(vibrate).toHaveBeenCalledTimes(2);
  Reflect.deleteProperty(navigator, "vibrate");
});

it("cards never show pending pressure, acknowledge confirmed clicks and keep keyboard activation", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  const card = document.createElement("a");
  card.className = "book-card__link";
  card.textContent = "Registro fictício";
  card.href = "#fixture";
  card.onclick = (event) => event.preventDefault();
  document.querySelector(".app-shell")!.append(card);
  for (const type of [
    "pointerdown",
    "pointermove",
    "pointercancel",
    "pointerup",
  ]) {
    card.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        pointerType: "touch",
        isPrimary: true,
        pointerId: 1,
        clientY: type === "pointermove" ? 90 : 10,
      }),
    );
    expect(card).not.toHaveAttribute("data-tap-active");
    expect(card).not.toHaveAttribute("data-tap-confirmed");
  }
  fireEvent.click(card, { detail: 0 });
  expect(card).toHaveAttribute("data-tap-confirmed", "true");
  card.dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true,
      pointerType: "touch",
      isPrimary: true,
      pointerId: 2,
    }),
  );
  expect(card).not.toHaveAttribute("data-tap-confirmed");
});

it("reserves the measured banner and dock layout without counting the folio's temporary dock translation", () => {
  let resize: (() => void) | undefined;
  const disconnect = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      readonly callback: () => void;
      isShell = false;
      constructor(callback: () => void) {
        this.callback = callback;
      }
      observe(element: Element) {
        if (element.classList.contains("session-strip")) {
          resize = this.callback;
          this.isShell = true;
        }
      }
      disconnect() {
        if (this.isShell) disconnect();
      }
    },
  );
  const view = render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  const strip = view.container.querySelector<HTMLElement>(".session-strip")!;
  const dock = view.container.querySelector<HTMLElement>(".primary-dock")!;
  const shell = view.container.querySelector<HTMLElement>(".app-shell")!;
  vi.spyOn(strip, "getBoundingClientRect").mockReturnValue(
    new DOMRect(0, 0, 390, 72),
  );
  // A focused folio translates the dock below the viewport, but its layout
  // still occupies 90 px plus the normal 8 px bottom clearance on return.
  vi.spyOn(dock, "getBoundingClientRect").mockReturnValue(
    new DOMRect(0, 900, 390, 90),
  );
  dock.style.bottom = "8px";
  resize?.();
  expect(shell.style.getPropertyValue("--canvas-session-height")).toBe("72px");
  expect(shell.style.getPropertyValue("--canvas-dock-height")).toBe("98px");
  view.unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});

it("keeps the Arcanarium snapshot mounted between rooms and debounces the real workshop", async () => {
  const { createApplication } = await import("./app/createApplication");
  const { default: Dexie } = await import("dexie");
  const name = `perf-shell-fiction-${crypto.randomUUID()}`;
  const application = await createApplication({ databaseName: name });
  const list = vi.spyOn(application.arcanarium, "list");
  const { waitFor } = await import("@testing-library/react");
  const view = render(
    <MemoryRouter initialEntries={["/arcanario/acervo"]}>
      <App application={application} />
    </MemoryRouter>,
  );
  try {
    await screen.findByRole("heading", { name: "Acervo global" }, { timeout: 8000 });
    for (const [link, title] of [
      ["Baralhos", "Baralhos & coleções"],
      ["Ecos", "Ecos do conhecimento"],
      ["Acervo", "Acervo global"],
    ]) {
      fireEvent.click(
        within(
          screen.getByRole("navigation", { name: "Salas do Arcanário" }),
        ).getByRole("link", { name: link }),
      );
      await screen.findByRole("heading", { name: title }, { timeout: 8000 });
    }
    expect(list).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("link", { name: "Oficina" }));
    const field = await screen.findByLabelText(
      "Frente da carta — pergunta ou pista",
      {},
      { timeout: 8000 },
    );
    const write = vi.spyOn(application.workshopDrafts, "write");
    for (const value of ["P", "Pi", "Pista fictícia"])
      fireEvent.change(field, { target: { value } });
    expect(write).not.toHaveBeenCalled();
    await waitFor(() => expect(write).toHaveBeenCalledOnce());
    fireEvent.change(field, { target: { value: "Última pista fictícia" } });
    view.unmount();
    expect(application.workshopDrafts.read("nova:flashcard")).toContain(
      "Última pista fictícia",
    );
  } finally {
    view.unmount();
    application.close();
    await Dexie.delete(name);
  }, 30000);

it("R6 animates before navigating and does not replay a link twice", async () => {
  const callbacks: FrameRequestCallback[] = [];
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callbacks.push(callback);
    return callbacks.length;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  const visible = vi.spyOn(document, "visibilityState", "get");
  visible.mockReturnValue("visible");
  const view = render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  try {
    const link = screen.getByRole("link", { name: "Coleção" });
    fireEvent.click(link);
    const shell = view.container.querySelector(".app-shell");
    expect(shell).toHaveAttribute("data-passage", "departing");
    expect(shell).toHaveAttribute("data-route", "library");

    // No route work is even queued while the cover is translucent.
    expect(callbacks).toHaveLength(0);
    expect(shell).toHaveAttribute("data-route", "library");
    const veil = view.container.querySelector(".passage-veil");
    expect(veil).toBeInTheDocument();
    // jsdom does not execute CSS keyframes, and synthetic animationend does
    // not reliably reach React's animation event handler. The same opaque
    // cover boundary is already verified in interactionContinuity.test.ts.
    // Exercise that boundary directly here; keep the integration test focused
    // on waiting for the sealed veil before React Router changes the route.
    act(() => completePassageDeparture());
    expect(shell).toHaveAttribute("data-passage", "waiting");
    expect(shell).toHaveAttribute("data-route", "library");

    // The full-opacity cover is now committed. Frame callbacks may run the
    // route action, but React Router can defer the location commit until the
    // lazy CollectionPage module resolves. Two RAFs are NOT proof that the
    // asynchronous destination has committed. Drain a bounded number of
    // scheduling frames, then assert that the route really arrives.
    let frameCount = 0;
    while (callbacks.length > 0 && frameCount < 12) {
      const next = callbacks.shift();
      await act(async () => {
        next?.(560 + 16 * frameCount);
        await Promise.resolve();
      });
      frameCount++;
    }
    expect(frameCount).toBeGreaterThanOrEqual(2);
    expect(frameCount).toBeLessThan(12);
    await waitFor(
      () => expect(shell).toHaveAttribute("data-route", "colecao"),
      { timeout: 4000 },
    );
  } finally {
    cancelPassage();
    view.unmount();
    visible.mockRestore();
    vi.unstubAllGlobals();
  }
});
