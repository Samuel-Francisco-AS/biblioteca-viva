import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { LibraryPage } from "./pages";

vi.mock("./features/library/WorldHost", () => ({
  WorldHost: () => <div data-testid="world-host-stub" />,
}));

describe("Página Biblioteca", () => {
  it("apresenta a fundação experimental e preserva ações convencionais", () => {
    render(
      <MemoryRouter>
        <LibraryPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", {
        name: "Fundação 3D experimental",
      }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Abrir Coleção" })).toHaveAttribute(
      "href",
      "/colecao",
    );
    expect(
      screen.getByRole("link", { name: "Criar registro" }),
    ).toHaveAttribute("href", "/novo-registro");
    expect(screen.getByTestId("world-host-stub")).toBeInTheDocument();
  });
});
