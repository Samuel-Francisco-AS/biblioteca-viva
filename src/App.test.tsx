import "fake-indexeddb/auto";

import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dexie from "dexie";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";
import { createApplication } from "./app/createApplication";
import type { AudioBackend, AudioPlayback } from "./infrastructure";

const capacitorMocks = vi.hoisted(() => ({
  backButtonListener: undefined as
    ((event: { canGoBack: boolean }) => void) | undefined,
  exitApp: vi.fn(() => Promise.resolve()),
  isNativePlatform: vi.fn(() => false),
  remove: vi.fn(() => Promise.resolve()),
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: capacitorMocks.isNativePlatform,
  },
}));

vi.mock("@capacitor/app", () => ({
  App: {
    addListener: vi.fn(
      (
        _eventName: string,
        listener: (event: { canGoBack: boolean }) => void,
      ) => {
        capacitorMocks.backButtonListener = listener;
        return Promise.resolve({ remove: capacitorMocks.remove });
      },
    ),
    exitApp: capacitorMocks.exitApp,
  },
}));

vi.mock("./features/library-visual/LibraryVisualHost", () => ({
  LibraryVisualHost: () => (
    <div aria-label="Estrutura visual inicial da biblioteca" role="img" />
  ),
}));

function renderApp(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>,
  );
}

describe("App", () => {
  beforeEach(() => {
    capacitorMocks.backButtonListener = undefined;
    capacitorMocks.exitApp.mockClear();
    capacitorMocks.isNativePlatform.mockReturnValue(false);
    capacitorMocks.remove.mockClear();
  });

  it("abre a Biblioteca na rota inicial e apresenta as regiões principais", () => {
    const { container } = renderApp();

    expect(screen.getByRole("banner").querySelector("h1")).toHaveTextContent(
      "Biblioteca",
    );
    expect(
      screen.getByRole("navigation", { name: "Navegação principal" }),
    ).toBeVisible();
    expect(screen.getByRole("main")).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Sua Biblioteca Viva" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Abrir Coleção" })).toHaveAttribute(
      "href",
      "/colecao",
    );
    expect(container.querySelector(".app-shell")).toHaveAttribute(
      "data-high-contrast",
      "false",
    );
    expect(container.querySelector(".app-shell")).toHaveAttribute(
      "data-text-size",
      "default",
    );
  });

  it("anuncia marco, decoração e diálogo sem roubar foco", async () => {
    const databaseName = `app-milestone-${crypto.randomUUID()}`;
    const backend: AudioBackend = {
      dispose: vi.fn(),
      initialize: vi.fn(() => Promise.resolve(true)),
      prepare: vi.fn(() => Promise.resolve()),
      play: () => {
        const playback: AudioPlayback = {
          completed: Promise.resolve(),
          setVolume: vi.fn(),
          stop: vi.fn(),
        };
        return Promise.resolve(playback);
      },
    };
    const application = await createApplication({
      audioBackend: backend,
      databaseName,
    });
    await application.experience.setHighContrast(true);
    await application.experience.setTextSize("larger");
    await application.experience.setMotion("reduce");
    const rendered = render(
      <MemoryRouter initialEntries={["/novo-livro"]}>
        <App application={application} />
      </MemoryRouter>,
    );
    const focusBefore = document.activeElement;
    expect(rendered.container.querySelector(".app-shell")).toHaveAttribute(
      "data-high-contrast",
      "true",
    );
    expect(rendered.container.querySelector(".app-shell")).toHaveAttribute(
      "data-text-size",
      "larger",
    );
    expect(rendered.container.querySelector(".app-shell")).toHaveAttribute(
      "data-reduced-motion",
      "true",
    );
    const book = await application.commands.createBookEntry.execute({
      status: "in_progress",
      title: "Livro fictício acessível",
    });
    await act(() =>
      application.commands.changeBookStatus.execute({
        id: book.id,
        status: "completed",
      }),
    );

    const announcement = await screen.findByRole("status");
    expect(announcement).toHaveAttribute("aria-live", "polite");
    expect(announcement).toHaveAttribute("aria-atomic", "true");
    expect(announcement).toHaveTextContent(
      "Primeiro livro concluído. A luminária de leitura foi desbloqueada.",
    );
    await waitFor(() =>
      expect(announcement).toHaveTextContent(
        "Uma leitura chegou ao fim. A estante guarda esse instante com cuidado.",
      ),
    );
    expect(document.activeElement).toBe(focusBefore);

    rendered.unmount();
    application.close();
    await Dexie.delete(databaseName);
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

  it("registra uma única vez o botão Voltar nativo, navega e remove o listener", async () => {
    capacitorMocks.isNativePlatform.mockReturnValue(true);
    const renderedApp = render(
      <MemoryRouter initialEntries={["/", "/colecao"]} initialIndex={1}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(capacitorMocks.backButtonListener).toBeDefined();
    });

    capacitorMocks.backButtonListener?.({ canGoBack: true });

    await waitFor(() => {
      expect(screen.getByRole("banner").querySelector("h1")).toHaveTextContent(
        "Biblioteca",
      );
    });
    expect(capacitorMocks.remove).not.toHaveBeenCalled();

    renderedApp.unmount();

    await waitFor(() => {
      expect(capacitorMocks.remove).toHaveBeenCalledTimes(1);
    });
  });

  it("encerra sem confirmação ao usar Voltar na raiz nativa", async () => {
    capacitorMocks.isNativePlatform.mockReturnValue(true);
    renderApp();

    await waitFor(() => {
      expect(capacitorMocks.backButtonListener).toBeDefined();
    });

    capacitorMocks.backButtonListener?.({ canGoBack: false });

    expect(capacitorMocks.exitApp).toHaveBeenCalledTimes(1);
  });
});
