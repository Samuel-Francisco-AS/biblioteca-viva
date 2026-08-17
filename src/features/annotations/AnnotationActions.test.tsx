import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ApplicationError } from "../../application";
import type { Note, Quote } from "../../domain";
import { AnnotationActions } from "./AnnotationActions";

const note: Note = {
  id: "note-1",
  entryId: "book-1",
  content: "Nota inicial",
  favorite: false,
  tagIds: [],
  createdAt: "2026-08-16T10:00:00.000Z",
  updatedAt: "2026-08-16T10:00:00.000Z",
  revision: 1,
};
const quote: Quote = {
  ...note,
  id: "quote-1",
  content: "Citação inicial",
  location: { type: "book", page: 12 },
};

describe("ações compartilhadas de anotação", () => {
  it("edita nota, preserva conteúdo após erro e devolve foco", async () => {
    const user = userEvent.setup();
    const onUpdate = vi
      .fn()
      .mockRejectedValueOnce(
        new ApplicationError("PERSISTENCE_FAILED", "private"),
      )
      .mockResolvedValueOnce(undefined);
    render(
      <AnnotationActions
        annotation={note}
        kind="note"
        onDelete={vi.fn()}
        onShare={vi.fn(() => Promise.resolve("flow-finished" as const))}
        onUpdate={onUpdate}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Editar nota" }));
    const field = screen.getByRole("textbox", {
      name: "Editar conteúdo da nota",
    });
    await user.clear(field);
    await user.type(field, "Nota revisada");
    await user.click(screen.getByRole("button", { name: "Salvar nota" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /armazenamento/u,
    );
    expect(field).toHaveValue("Nota revisada");
    expect(field).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Salvar nota" }));
    expect(onUpdate).toHaveBeenLastCalledWith({
      id: note.id,
      content: "Nota revisada",
    });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Editar nota" })).toHaveFocus(),
    );
  });

  it("cancela edição sem persistir e valida página de citação", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn(() => Promise.resolve());
    render(
      <AnnotationActions
        annotation={quote}
        kind="quote"
        totalPages={100}
        onDelete={vi.fn()}
        onShare={vi.fn(() => Promise.resolve("flow-finished" as const))}
        onUpdate={onUpdate}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Editar citação" }));
    await user.clear(
      screen.getByRole("spinbutton", { name: "Página (opcional)" }),
    );
    await user.type(
      screen.getByRole("spinbutton", { name: "Página (opcional)" }),
      "101",
    );
    await user.click(screen.getByRole("button", { name: "Salvar citação" }));
    expect(screen.getByRole("alert")).toHaveTextContent("entre 1 e 100");
    expect(onUpdate).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Cancelar edição" }));
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("confirma exclusão, permite cancelar e preserva confirmação após falha", async () => {
    const user = userEvent.setup();
    const onDelete = vi
      .fn()
      .mockRejectedValueOnce(
        new ApplicationError("PERSISTENCE_FAILED", "private"),
      )
      .mockResolvedValueOnce(undefined);
    render(
      <AnnotationActions
        annotation={note}
        kind="note"
        onDelete={onDelete}
        onShare={vi.fn(() => Promise.resolve("flow-finished" as const))}
        onUpdate={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Excluir nota" }));
    await user.click(screen.getByRole("button", { name: "Cancelar exclusão" }));
    expect(onDelete).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Excluir nota" }));
    await user.click(screen.getByRole("button", { name: "Excluir nota" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /armazenamento/u,
    );
    expect(screen.getByText(/removido permanentemente/u)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Excluir nota" }));
    expect(onDelete).toHaveBeenCalledTimes(2);
  });

  it("compartilha explicitamente e apresenta sucesso, cancelamento e indisponibilidade", async () => {
    const user = userEvent.setup();
    const onShare = vi
      .fn()
      .mockResolvedValueOnce("flow-finished")
      .mockResolvedValueOnce("cancelled")
      .mockRejectedValueOnce(
        new ApplicationError("SHARE_UNAVAILABLE", "private"),
      );
    render(
      <AnnotationActions
        annotation={note}
        kind="note"
        onDelete={vi.fn()}
        onShare={onShare}
        onUpdate={vi.fn()}
      />,
    );
    const button = screen.getByRole("button", { name: "Compartilhar nota" });
    await user.click(button);
    expect(screen.getByRole("status")).toHaveTextContent(
      "menu de compartilhamento",
    );
    await user.click(button);
    expect(screen.getByRole("status")).toHaveTextContent("cancelado");
    await user.click(button);
    expect(screen.getByRole("alert")).toHaveTextContent("não está disponível");
  });
});
