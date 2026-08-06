// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { ApplicationError } from "./errors";
import { DeleteBookEntry } from "./deleteBookEntry";

describe("DeleteBookEntry", () => {
  it("valida o ID e solicita uma única exclusão agregada", async () => {
    const deleteBookEntry = vi.fn(() => Promise.resolve("deleted" as const));
    await expect(
      new DeleteBookEntry({ deleteBookEntry }).execute({ id: "book-1" }),
    ).resolves.toEqual({ deleted: true });
    expect(deleteBookEntry).toHaveBeenCalledOnce();
    expect(deleteBookEntry).toHaveBeenCalledWith("book-1");
  });

  it("mapeia livro inexistente sem expor o ID", async () => {
    const useCase = new DeleteBookEntry({
      deleteBookEntry: () => Promise.resolve("not-found"),
    });
    const failure = await useCase
      .execute({ id: "missing" })
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(ApplicationError);
    expect(failure).toMatchObject({ code: "BOOK_NOT_FOUND" });
    expect(String(failure)).not.toContain("missing");
  });

  it("mapeia falha do store para erro público sanitizado", async () => {
    const useCase = new DeleteBookEntry({
      deleteBookEntry: () => Promise.reject(new Error("Dexie table notes")),
    });
    await expect(useCase.execute({ id: "book-1" })).rejects.toMatchObject({
      code: "DELETE_BOOK_FAILED",
      message: "Não foi possível excluir o livro. Nenhum dado foi removido.",
    });
  });

  it("rejeita entrada inválida antes de acessar o store", async () => {
    const deleteBookEntry = vi.fn(() => Promise.resolve("deleted" as const));
    await expect(
      new DeleteBookEntry({ deleteBookEntry }).execute({ id: "" }),
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
    expect(deleteBookEntry).not.toHaveBeenCalled();
  });
});
