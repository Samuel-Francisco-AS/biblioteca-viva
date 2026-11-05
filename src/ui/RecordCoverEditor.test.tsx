import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { RecordCoverEditor } from "./RecordCoverEditor";
import { importLocalImage } from "../infrastructure/files/localImage";
vi.mock("../infrastructure/files/localImage", () => ({
  importLocalImage: vi.fn(),
}));
it("previews without saving, preserves draft after failure, replaces explicitly and removes with the same save/cancel contract", async () => {
  const user = userEvent.setup();
  const old = {
    entryId: "book",
    dataUrl: "data:image/jpeg;base64,old",
    width: 400,
    height: 600,
  };
  const replacement = {
    dataUrl: "data:image/jpeg;base64,new",
    width: 600,
    height: 800,
  };
  vi.mocked(importLocalImage).mockResolvedValue(replacement);
  const images = {
      get: vi.fn(),
      save: vi
        .fn()
        .mockRejectedValueOnce(new Error("full"))
        .mockResolvedValue(undefined),
      remove: vi.fn(),
    },
    saved = vi.fn();
  const { rerender } = render(
    <RecordCoverEditor
      entryId="book"
      cover={old}
      images={images}
      onSaved={saved}
    />,
  );
  await user.click(screen.getByText("Capa da obra"));
  await user.upload(
    screen.getByLabelText("Substituir imagem"),
    new File(["fixture"], "cover.jpg", { type: "image/jpeg" }),
  );
  expect(await screen.findByAltText("Prévia da capa")).toHaveAttribute(
    "src",
    replacement.dataUrl,
  );
  expect(images.save).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Salvar capa" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Tente novamente");
  expect(saved).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Salvar capa" }));
  await waitFor(() =>
    expect(saved).toHaveBeenCalledWith({ ...replacement, entryId: "book" }),
  );
  rerender(
    <RecordCoverEditor
      entryId="book"
      cover={{ ...replacement, entryId: "book" }}
      images={images}
      onSaved={saved}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Remover capa" }));
  expect(images.remove).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Cancelar alteração" }));
  expect(screen.getByAltText("Prévia da capa")).toHaveAttribute(
    "src",
    replacement.dataUrl,
  );
  await user.click(screen.getByRole("button", { name: "Remover capa" }));
  await user.click(screen.getByRole("button", { name: "Salvar capa" }));
  await waitFor(() => expect(images.remove).toHaveBeenCalledWith("book"));
  expect(saved).toHaveBeenLastCalledWith(undefined);
});
