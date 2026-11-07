import "fake-indexeddb/auto";
import Dexie from "dexie";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import {
  createApplication,
  type ApplicationRuntime,
} from "../../app/createApplication";
import { EntryDetailPage } from "../entry-detail/EntryDetailPage";
import { ActiveSessionIndicator } from "./ActiveSessionIndicator";
import { SessionPanel } from "./SessionPanel";
import type { LibraryEntry } from "../../domain";

let application: ApplicationRuntime;
let databaseName: string;
afterEach(async () => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  application?.close();
  if (databaseName) await Dexie.delete(databaseName);
});
async function setup() {
  databaseName = `reading-ux-fiction-${crypto.randomUUID()}`;
  application = await createApplication({ databaseName });
  return application.commands.createBookEntry.execute({
    title: "O Códice das Marés",
    totalPages: 200,
    status: "in_progress",
  });
}
// Keep IndexedDB/event-loop scheduling real; control only civil time and redraw timers.
function controlTime() {
  vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
  vi.setSystemTime("2026-11-07T12:00:00.000Z");
}

it("opens the only reading clock directly in the folio; persists the displayed duration and history", async () => {
  const book = await setup();
  controlTime();
  const query = vi.spyOn(application.queries.getOpenSession, "execute");
  const start = vi.spyOn(application.commands.startSession, "execute");
  const pause = vi.spyOn(application.commands.pauseSession, "execute");
  const view = render(
    <MemoryRouter initialEntries={[`/registros/${book.id}`]}>
      <ActiveSessionIndicator application={application} />
      <Routes>
        <Route
          path="/registros/:id"
          element={<EntryDetailPage application={application} />}
        />
      </Routes>
    </MemoryRouter>,
  );
  const region = await screen.findByRole("region", {
    name: "Seu momento de leitura",
  });
  const reading = within(region);
  const timer = reading.getByRole("timer");
  const startButton = reading.getByRole("button", { name: "Iniciar sessão" });
  await waitFor(() => expect(startButton).toBeEnabled());
  expect(
    screen.queryByText("Usar cronômetro (opcional)"),
  ).not.toBeInTheDocument();
  expect(
    screen.getAllByRole("button", { name: "Iniciar sessão" }),
  ).toHaveLength(1);
  expect(
    region.compareDocumentPosition(
      screen.getByRole("heading", { name: "Notas e citações" }),
    ) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(timer).toHaveTextContent("00:00:00");
  expect(timer).toHaveAttribute("aria-live", "off");
  fireEvent.click(startButton);
  await reading.findByRole("button", { name: "Pausar sessão" });
  await waitFor(() =>
    expect(
      screen.getByRole("timer", { name: "Tempo da sessão" }),
    ).toBeInTheDocument(),
  );
  await waitFor(() =>
    expect(
      reading.getByRole("button", { name: "Pausar sessão" }),
    ).toHaveFocus(),
  );
  const reads = query.mock.calls.length;
  await act(() => vi.advanceTimersByTime(3_000));
  expect(timer).toHaveTextContent("00:00:03");
  expect(
    screen.getByRole("timer", { name: "Tempo da sessão" }),
  ).toHaveTextContent("3 s");
  expect(query).toHaveBeenCalledTimes(reads);
  expect(await application.queries.getOpenSession.execute()).toMatchObject({
    accumulatedDuration: 0,
    revision: 1,
  });
  expect(start).toHaveBeenCalledOnce();
  expect(pause).not.toHaveBeenCalled();
  fireEvent.click(reading.getByRole("button", { name: "Pausar sessão" }));
  await waitFor(() =>
    expect(
      reading.getByRole("button", { name: "Retomar sessão" }),
    ).toBeEnabled(),
  );
  await act(() => vi.advanceTimersByTime(20_000));
  expect(timer).toHaveTextContent("00:00:03");
  expect(
    screen.getByRole("timer", { name: "Tempo da sessão" }),
  ).toHaveTextContent("3 s");
  fireEvent.click(reading.getByRole("button", { name: "Retomar sessão" }));
  await waitFor(() =>
    expect(
      reading.getByRole("button", { name: "Pausar sessão" }),
    ).toBeEnabled(),
  );
  await act(() => vi.advanceTimersByTime(2_000));
  expect(timer).toHaveTextContent("00:00:05");
  fireEvent.click(reading.getByRole("button", { name: "Concluir sessão" }));
  await waitFor(() =>
    expect(
      reading.getByRole("button", { name: "Iniciar sessão" }),
    ).toBeEnabled(),
  );
  expect(reading.getByRole("button", { name: "Iniciar sessão" })).toHaveFocus();
  expect(
    (await application.queries.listSessionsByEntry.execute({ id: book.id }))[0],
  ).toMatchObject({ status: "completed", accumulatedDuration: 5 });
  fireEvent.click(reading.getByText("Histórico de leituras e registro manual"));
  expect(reading.getByRole("list")).toHaveTextContent("5 s");
  expect(
    screen.queryByRole("timer", { name: "Tempo da sessão" }),
  ).not.toBeInTheDocument();
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it("blocks a second session, reconciles committed external changes and requires cancellation confirmation", async () => {
  const book = await setup();
  const other = await application.commands.createBookEntry.execute({
    title: "Outro códice fictício",
  });
  const open = await application.commands.startSession.execute({
    entryId: other.id,
    entryType: "book",
  });
  const view = render(
    <MemoryRouter>
      <SessionPanel application={application} entry={book} />
    </MemoryRouter>,
  );
  const start = await screen.findByRole("button", { name: "Iniciar sessão" });
  await screen.findByText(/Já existe uma sessão/);
  expect(start).toBeDisabled();
  expect(
    screen.getByRole("link", { name: "Abrir sessão em andamento" }),
  ).toHaveAttribute("href", `/registros/${other.id}`);
  await act(() => application.commands.deleteSession.execute({ id: open.id }));
  await waitFor(() => expect(start).toBeEnabled());
  fireEvent.click(start);
  const cancel = await screen.findByRole("button", { name: "Cancelar sessão" });
  await waitFor(() => expect(cancel).toBeEnabled());
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  fireEvent.click(cancel);
  expect(confirm).toHaveBeenCalledWith("Cancelar e remover esta sessão?");
  expect(await application.queries.getOpenSession.execute()).toBeDefined();
  confirm.mockReturnValue(true);
  fireEvent.click(cancel);
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Iniciar sessão" }),
    ).toBeEnabled(),
  );
  expect(await application.queries.getOpenSession.execute()).toBeUndefined();
  view.unmount();
});

it.each(["movie", "series", "study", "work", "physical_activity"] as const)(
  "preserves %s session layout, fields, clock and history",
  async (type) => {
    await setup();
    const entry: LibraryEntry =
      await application.commands.createLibraryEntry.execute({
        type,
        title: `Registro fictício ${type}`,
        ...(type === "study" ? { progressUnit: "sessions" } : {}),
        ...(type === "physical_activity" ? { category: "cardio" } : {}),
      });
    const active = await application.commands.startSession.execute({
      entryId: entry.id,
      entryType: type,
    });
    render(
      <MemoryRouter>
        <SessionPanel application={application} entry={entry} />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Sessão em andamento")).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Seu momento de leitura" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Histórico" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Concluir sessão" }),
    ).toBeVisible();
    await act(() =>
      application.commands.completeSession.execute({ id: active.id }),
    );
    await screen.findByText("Usar cronômetro (opcional)");
    expect(screen.getByRole("list")).toBeVisible();
  },
);
