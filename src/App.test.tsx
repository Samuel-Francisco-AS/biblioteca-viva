import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { App } from "./App";

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
