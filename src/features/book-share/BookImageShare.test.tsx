import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BookEntry, Quote } from "../../domain";
import { BookImageShare } from "./BookImageShare";
import { createBookImage } from "./bookImage";

vi.mock("./bookImage", () => ({ createBookImage: vi.fn() }));
const book: BookEntry = {
  id: "book",
  title: "O Jardim das Horas",
  type: "book",
  author: "Autora fictícia",
  status: "in_progress",
  totalPages: 200,
  currentPage: 50,
  revision: 1,
  favorite: false,
  tagIds: [],
  createdAt: "2026-11-04T12:00:00.000Z",
  updatedAt: "2026-11-04T12:00:00.000Z",
};
const quote: Quote = {
  id: "quote",
  entryId: book.id,
  content: "Uma passagem completa",
  location: { type: "book", page: 50 },
  favorite: false,
  tagIds: [],
  createdAt: book.createdAt,
  updatedAt: book.updatedAt,
  revision: 1,
};
const png = {
  name: "biblioteca-viva-leitura.png",
  dataUrl: "data:image/png;base64,iVBORw0KGgoAAA==",
};
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    },
  });
  vi.mocked(createBookImage).mockResolvedValue(png);
});
afterEach(() => {
  Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
  vi.restoreAllMocks();
  vi.clearAllMocks();
});
describe("prévia e entrega da leitura", () => {
  it("oferece salvamento após erro de compartilhamento, mantém PNG e restaura foco ao fechar", async () => {
    const user = userEvent.setup();
    const files = {
      share: vi.fn().mockRejectedValue(new Error("Native failure")),
      save: vi.fn().mockResolvedValue("finished"),
    };
    render(<BookImageShare book={book} quotes={[quote]} files={files} />);
    await user.click(
      screen.getByRole("button", { name: "Criar imagem da leitura" }),
    );
    expect(await screen.findByRole("img")).toHaveAttribute("src", png.dataUrl);
    expect(createBookImage).toHaveBeenCalledWith(book, undefined);
    await user.click(
      screen.getByRole("button", { name: "Compartilhar imagem" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Tente Salvar imagem PNG",
    );
    await user.click(screen.getByRole("button", { name: "Salvar imagem PNG" }));
    expect(files.save).toHaveBeenCalledWith(png);
    await user.click(screen.getByRole("button", { name: "Fechar prévia" }));
    expect(
      screen.getByRole("button", { name: "Criar imagem da leitura" }),
    ).toHaveFocus();
  });
  it("seleciona uma citação e ajusta o trecho sem modificar a fonte; Back fecha só a prévia", async () => {
    const user = userEvent.setup();
    render(<BookImageShare book={book} quotes={[quote]} />);
    await user.click(
      screen.getByRole("button", { name: "Criar imagem da leitura" }),
    );
    await screen.findByRole("img");
    await user.selectOptions(screen.getByLabelText("Composição"), quote.id);
    await waitFor(() =>
      expect(createBookImage).toHaveBeenLastCalledWith(book, quote),
    );
    await user.click(screen.getByText("Ajustar trecho para a imagem"));
    await user.clear(screen.getByLabelText("Trecho para a imagem"));
    await user.type(
      screen.getByLabelText("Trecho para a imagem"),
      "Uma passagem",
    );
    const calls = vi.mocked(createBookImage).mock.calls.length;
    await user.click(screen.getByRole("button", { name: "Atualizar prévia" }));
    await waitFor(() =>
      expect(createBookImage).toHaveBeenCalledTimes(calls + 1),
    );
    expect(createBookImage).toHaveBeenLastCalledWith(book, {
      ...quote,
      content: "Uma passagem",
    });
    expect(quote.content).toBe("Uma passagem completa");
    const back = new Event("biblioteca-viva:native-back", { cancelable: true });
    fireEvent(window, back);
    expect(back.defaultPrevented).toBe(true);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("explica falha de geração e bloqueia a entrega de uma imagem inexistente", async () => {
    vi.mocked(createBookImage).mockRejectedValue(
      new Error("Selecione um trecho menor para compartilhar."),
    );
    const user = userEvent.setup();
    render(<BookImageShare book={book} quotes={[]} />);
    await user.click(
      screen.getByRole("button", { name: "Criar imagem da leitura" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Selecione um trecho menor",
    );
    expect(
      screen.getByRole("button", { name: "Salvar imagem PNG" }),
    ).toBeDisabled();
  });
});
