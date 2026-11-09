import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";

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
  Capacitor: { isNativePlatform: () => false },
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

it("R7 releases touch feedback on scroll, cancellation and release without early navigation", () => {
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
