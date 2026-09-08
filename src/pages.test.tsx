import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { LibraryPage } from "./pages";

describe("Página Biblioteca", () => {
  it("apresenta um placeholder acessível sem superfície gráfica", () => {
    const { container } = render(
      <MemoryRouter>
        <LibraryPage />
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
    expect(
      screen.getByRole("link", { name: "Criar registro" }),
    ).toHaveAttribute("href", "/novo-registro");
    expect(container.querySelector("canvas")).not.toBeInTheDocument();
  });
});
