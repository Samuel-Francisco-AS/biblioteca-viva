import { render, screen, within } from "@testing-library/react";
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
    expect(container.querySelector("canvas")).not.toBeInTheDocument();
  });

  it("mantém o placeholder e o acesso à Coleção", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", {
        name: "Uma nova experiência está sendo preparada",
      }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Abrir Coleção" })).toHaveAttribute(
      "href",
      "/colecao",
    );
  });
});
