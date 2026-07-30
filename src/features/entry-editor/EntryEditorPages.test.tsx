import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { ApplicationError } from "../../application";
import type { BookEntry } from "../../domain";
import { BookDetailPlaceholder } from "./BookDetailPlaceholder";
import {
  EditBookPage,
  NewBookPage,
  type EditorApplication,
} from "./EntryEditorPages";

const book: BookEntry = {
  id: "book-1",
  type: "book",
  title: "Livro de teste",
  author: "Autora",
  status: "in_progress",
  totalPages: 320,
  currentPage: 42,
  rating: 4,
  startedAt: "2026-07-29T23:59:59.999Z",
  createdAt: "2026-07-29T10:00:00.000Z",
  updatedAt: "2026-07-29T10:00:00.000Z",
  revision: 1,
};

function application(
  overrides: {
    create?: (input: unknown) => Promise<BookEntry>;
    get?: (input: unknown) => Promise<BookEntry>;
    update?: (input: unknown) => Promise<BookEntry>;
  } = {},
) {
  const create = vi.fn(overrides.create ?? (() => Promise.resolve(book)));
  const get = vi.fn(overrides.get ?? (() => Promise.resolve(book)));
  const update = vi.fn(
    overrides.update ?? (() => Promise.resolve({ ...book, title: "Editado" })),
  );
  const facade: EditorApplication = {
    commands: {
      createBookEntry: { execute: create },
      updateBookEntry: { execute: update },
    },
    queries: { getBookEntry: { execute: get } },
  };
  return { create, facade, get, update };
}

function renderCreate(facade: EditorApplication) {
  return render(
    <MemoryRouter initialEntries={["/novo-livro"]}>
      <Routes>
        <Route
          path="/novo-livro"
          element={<NewBookPage application={facade} />}
        />
        <Route path="/livros/:id" element={<p>Detalhe aberto</p>} />
        <Route path="/colecao" element={<p>Coleção aberta</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderEdit(facade: EditorApplication) {
  return render(
    <MemoryRouter initialEntries={["/livros/book-1/editar"]}>
      <Routes>
        <Route
          path="/livros/:id/editar"
          element={<EditBookPage application={facade} />}
        />
        <Route path="/livros/:id" element={<p>Detalhe aberto</p>} />
        <Route path="/colecao" element={<p>Coleção aberta</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("cadastro de livro", () => {
  it("renderiza os campos e associa labels aos controles", () => {
    const { facade } = application();
    renderCreate(facade);
    for (const label of [
      /título/i,
      /autor/i,
      /total de páginas/i,
      /página atual/i,
      /status/i,
      /avaliação/i,
      /data de início/i,
    ]) {
      expect(screen.getByLabelText(label)).toBeVisible();
    }
    expect(screen.getByRole("button", { name: "Salvar livro" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("converte e envia o payload vigente antes de navegar", async () => {
    const user = userEvent.setup();
    const { create, facade } = application();
    renderCreate(facade);
    await user.type(screen.getByLabelText(/título/i), "  Meu   livro  ");
    await user.type(screen.getByLabelText(/autor/i), "  Uma autora ");
    await user.type(screen.getByLabelText(/total de páginas/i), "200");
    await user.clear(screen.getByLabelText(/página atual/i));
    await user.type(screen.getByLabelText(/página atual/i), "12");
    await user.selectOptions(screen.getByLabelText(/status/i), "in_progress");
    await user.selectOptions(screen.getByLabelText(/avaliação/i), "5");
    await user.click(screen.getByRole("button", { name: "Salvar livro" }));
    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    expect(create).toHaveBeenCalledWith({
      title: "Meu livro",
      author: "Uma autora",
      totalPages: 200,
      currentPage: 12,
      status: "in_progress",
      rating: 5,
    });
    expect(await screen.findByText("Detalhe aberto")).toBeVisible();
  });

  it("converte opcionais vazios para ausência", async () => {
    const user = userEvent.setup();
    const { create, facade } = application();
    renderCreate(facade);
    await user.type(screen.getByLabelText(/título/i), "Mínimo");
    await user.click(screen.getByRole("button", { name: "Salvar livro" }));
    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    expect(create).toHaveBeenCalledWith({
      title: "Mínimo",
      status: "planned",
      currentPage: 0,
    });
  });

  it("aceita uma data histórica de início sem alterar o dia", async () => {
    const user = userEvent.setup();
    const { create, facade } = application();
    renderCreate(facade);
    await user.type(screen.getByLabelText(/título/i), "Leitura antiga");
    const startedAt = screen.getByLabelText(/data de início/i);
    expect(startedAt).not.toHaveAttribute("min");
    await user.type(startedAt, "2020-01-15");
    await user.click(screen.getByRole("button", { name: "Salvar livro" }));
    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    expect(create).toHaveBeenCalledWith({
      title: "Leitura antiga",
      status: "planned",
      currentPage: 0,
      startedAt: "2020-01-15T23:59:59.999Z",
    });
  });

  it("impede envio inválido, mostra erro por campo e mantém o valor", async () => {
    const user = userEvent.setup();
    const { create, facade } = application();
    renderCreate(facade);
    await user.type(screen.getByLabelText(/título/i), "   ");
    await user.click(screen.getByRole("button", { name: "Salvar livro" }));
    expect(create).not.toHaveBeenCalled();
    expect(screen.getByText("Informe o título do livro.")).toBeVisible();
    expect(screen.getByLabelText(/título/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText(/título/i)).toHaveValue("   ");
    await waitFor(() => expect(screen.getByRole("alert")).toHaveFocus());
  });

  it("apresenta erro geral e preserva valores após falha", async () => {
    const user = userEvent.setup();
    const { facade } = application({
      create: () =>
        Promise.reject(new ApplicationError("PERSISTENCE_FAILED", "interno")),
    });
    renderCreate(facade);
    await user.type(screen.getByLabelText(/título/i), "Permanece aqui");
    await user.click(screen.getByRole("button", { name: "Salvar livro" }));
    expect(
      await screen.findByText(/não foi possível acessar o armazenamento/i),
    ).toBeVisible();
    expect(screen.getByLabelText(/título/i)).toHaveValue("Permanece aqui");
    expect(screen.queryByText("interno")).not.toBeInTheDocument();
  });

  it("bloqueia envios duplicados e navega somente após sucesso", async () => {
    const user = userEvent.setup();
    let resolveSave: ((value: BookEntry) => void) | undefined;
    const { create, facade } = application({
      create: () =>
        new Promise<BookEntry>((resolve) => {
          resolveSave = resolve;
        }),
    });
    renderCreate(facade);
    await user.type(screen.getByLabelText(/título/i), "Único");
    const save = screen.getByRole("button", { name: "Salvar livro" });
    await user.dblClick(save);
    expect(create).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Salvando…" })).toBeDisabled();
    expect(screen.queryByText("Detalhe aberto")).not.toBeInTheDocument();
    resolveSave?.(book);
    expect(await screen.findByText("Detalhe aberto")).toBeVisible();
  });
});

describe("edição de livro", () => {
  it("carrega pelo ID e preenche o formulário compartilhado", async () => {
    const { facade, get } = application();
    renderEdit(facade);
    expect(screen.getByRole("status")).toHaveTextContent("Carregando");
    expect(await screen.findByDisplayValue("Livro de teste")).toBeVisible();
    expect(get).toHaveBeenCalledWith({ id: "book-1" });
    expect(screen.getByLabelText(/página atual/i)).toHaveValue(42);
    expect(screen.getByLabelText(/status/i)).toBeDisabled();
  });

  it("atualiza campos bibliográficos, preserva ID e navega", async () => {
    const user = userEvent.setup();
    const { facade, update } = application();
    renderEdit(facade);
    const title = await screen.findByLabelText(/título/i);
    await user.clear(title);
    await user.type(title, "Editado");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() => expect(update).toHaveBeenCalledOnce());
    expect(update).toHaveBeenCalledWith({
      id: "book-1",
      title: "Editado",
      author: "Autora",
      totalPages: 320,
      rating: 4,
    });
    expect(await screen.findByText("Detalhe aberto")).toBeVisible();
  });

  it("trata livro inexistente com retorno seguro", async () => {
    const { facade } = application({
      get: () => Promise.reject(new ApplicationError("NOT_FOUND", "interno")),
    });
    renderEdit(facade);
    expect(
      await screen.findByRole("heading", { name: "Livro não encontrado" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Voltar à Coleção" }),
    ).toHaveAttribute("href", "/colecao");
  });

  it("trata falha de carregamento separadamente", async () => {
    const { facade } = application({
      get: () =>
        Promise.reject(new ApplicationError("PERSISTENCE_FAILED", "interno")),
    });
    renderEdit(facade);
    expect(
      await screen.findByRole("heading", {
        name: "Não foi possível abrir o livro",
      }),
    ).toBeVisible();
  });

  it("mantém alterações quando a atualização falha", async () => {
    const user = userEvent.setup();
    const { facade } = application({
      update: () => Promise.reject(new ApplicationError("CONFLICT", "interno")),
    });
    renderEdit(facade);
    const title = await screen.findByLabelText(/título/i);
    await user.clear(title);
    await user.type(title, "Minha alteração");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(
      await screen.findByText(/mudou desde que foi aberto/i),
    ).toBeVisible();
    expect(title).toHaveValue("Minha alteração");
  });
});

describe("destino mínimo", () => {
  it("carrega o livro pelo caso de uso e oferece editar ou voltar", async () => {
    const { facade, get } = application();
    render(
      <MemoryRouter initialEntries={["/livros/book-1"]}>
        <Routes>
          <Route
            path="/livros/:id"
            element={<BookDetailPlaceholder application={facade} />}
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("heading", { name: "Livro de teste" }),
    ).toBeVisible();
    expect(get).toHaveBeenCalledWith({ id: "book-1" });
    expect(screen.getByRole("link", { name: "Editar livro" })).toHaveAttribute(
      "href",
      "/livros/book-1/editar",
    );
  });
});
