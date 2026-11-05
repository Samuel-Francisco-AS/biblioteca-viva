import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createMovie } from "../../domain";
import { CinemaComposer } from "./CinemaComposer";
import { createCinemaImage } from "./cinemaImage";
vi.mock("./cinemaImage", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./cinemaImage")>()),
  createCinemaImage: vi.fn(),
}));
const entry = createMovie({
  id: "m",
  title: "Aurora",
  createdAt: "2026-11-04T12:00:00.000Z",
  catalog: { releaseDate: "2026-11-16" },
});
const png = {
  name: "biblioteca-viva-cinema.png",
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
  vi.mocked(createCinemaImage).mockResolvedValue(png);
});
afterEach(() => {
  Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
  vi.clearAllMocks();
});
it("keeps the exact PNG for cancelled/unavailable/failed delivery and restores focus on native Back", async () => {
  const user = userEvent.setup();
  const files = {
    share: vi
      .fn()
      .mockResolvedValueOnce("cancelled")
      .mockResolvedValueOnce("unavailable")
      .mockRejectedValueOnce(new Error("fixture")),
    save: vi
      .fn()
      .mockRejectedValueOnce(new Error("disk full"))
      .mockResolvedValueOnce("finished"),
  };
  render(<CinemaComposer entry={entry} today="2026-11-04" files={files} />);
  const opener = screen.getByRole("button", {
    name: "Criar banner cinematográfico",
  });
  await user.click(opener);
  await screen.findByRole("img");
  await user.click(screen.getByRole("button", { name: "Compartilhar banner" }));
  expect(await screen.findByRole("status")).toHaveTextContent("cancelada");
  await user.click(screen.getByRole("button", { name: "Compartilhar banner" }));
  expect(await screen.findByRole("status")).toHaveTextContent("indisponível");
  await user.click(screen.getByRole("button", { name: "Compartilhar banner" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Tente Salvar PNG",
  );
  await user.click(screen.getByRole("button", { name: "Salvar PNG" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "espaço disponível",
  );
  await user.click(screen.getByRole("button", { name: "Salvar PNG" }));
  expect(files.save).toHaveBeenLastCalledWith(png);
  fireEvent(
    window,
    new Event("biblioteca-viva:native-back", { cancelable: true }),
  );
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(opener).toHaveFocus();
});
it("invalidates stale preview after editing and emits only the explicitly chosen message and mode", async () => {
  const user = userEvent.setup();
  const files = { share: vi.fn(), save: vi.fn() };
  render(<CinemaComposer entry={entry} today="2026-11-04" files={files} />);
  await user.click(
    screen.getByRole("button", { name: "Criar banner cinematográfico" }),
  );
  await screen.findByRole("img");
  let finish: ((value: typeof png) => void) | undefined;
  vi.mocked(createCinemaImage).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  fireEvent.change(screen.getByLabelText("Mensagem do banner"), {
    target: { value: "Minha expectativa" },
  });
  expect(screen.getByRole("button", { name: "Salvar PNG" })).toBeDisabled();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  await waitFor(() => expect(finish).toBeTypeOf("function"));
  finish?.(png);
  await screen.findByRole("img");
  expect(createCinemaImage).toHaveBeenLastCalledWith(
    entry,
    expect.objectContaining({
      mode: "release",
      message: "Minha expectativa",
      today: "2026-11-04",
      background: undefined,
    }),
  );
  await user.click(screen.getByRole("radio", { name: /^Lista de desejos$/ }));
  await screen.findByRole("img");
  expect(screen.getByLabelText("Mensagem do banner")).toHaveValue(
    "Na minha lista de desejos",
  );
});
