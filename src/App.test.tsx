import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { App } from "./App";

function renderApp(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>,
  );
}

describe("App", () => {
  it("abre a Biblioteca na rota inicial e apresenta as regiões principais", () => {
    renderApp();

    expect(screen.getByRole("banner").querySelector("h1")).toHaveTextContent(
      "Biblioteca",
    );
    expect(
      screen.getByRole("navigation", { name: "Navegação principal" }),
    ).toBeVisible();
    expect(screen.getByRole("main")).toBeVisible();
    expect(
      screen.getByText(/representação visual viva da biblioteca/i),
    ).toBeVisible();
  });

  it("oferece as cinco opções de navegação e identifica a rota ativa", () => {
    renderApp();

    const navigation = screen.getByRole("navigation", {
      name: "Navegação principal",
    });
    const links = within(navigation).getAllByRole("link");

    expect(links).toHaveLength(5);
    expect(
      within(navigation).getByRole("link", { name: "Biblioteca" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(navigation).getByRole("link", { name: "Coleção" }),
    ).not.toHaveAttribute("aria-current");
  });

  it.each([
    ["Biblioteca", "Biblioteca"],
    ["Coleção", "Coleção"],
    ["Novo livro", "Novo livro"],
    ["Arquivo", "Arquivo"],
    ["Configurações", "Configurações"],
  ])("navega para %s e atualiza o título da seção", async (linkName, title) => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("link", { name: linkName }));

    expect(screen.getByRole("banner").querySelector("h1")).toHaveTextContent(
      title,
    );
    expect(screen.getByRole("link", { name: linkName })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("trata uma rota desconhecida e oferece retorno para a Biblioteca", async () => {
    const user = userEvent.setup();
    renderApp("/caminho-inexistente");

    expect(
      screen.getByRole("heading", { name: "Página não encontrada", level: 1 }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Esta página não existe", level: 2 }),
    ).toBeVisible();

    await user.click(
      screen.getByRole("link", { name: "Voltar para a Biblioteca" }),
    );

    expect(screen.getByRole("banner").querySelector("h1")).toHaveTextContent(
      "Biblioteca",
    );
  });
});
