import "fake-indexeddb/auto";
import Dexie from "dexie";
import { act, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import { createApplication } from "./app/createApplication";
import { LibraryPage } from "./pages";
import type { WorldHostProps } from "./features/library/WorldHost";

let latest: WorldHostProps | undefined;
vi.mock("./features/library/WorldHost", () => ({
  WorldHost: (props: WorldHostProps) => {
    latest = props;
    return <div />;
  },
}));
it("projects committed session events, preserves the world snapshot, and reconciles completion outside the library", async () => {
  const databaseName = `f2-sessions-fixture-${crypto.randomUUID()}`;
  const application = await createApplication({ databaseName });
  const book = await application.commands.createBookEntry.execute({
    title: "Volume fictício",
    status: "in_progress",
  });
  const page = (active: boolean) => (
    <MemoryRouter>
      <LibraryPage application={application} active={active} />
    </MemoryRouter>
  );
  const view = render(page(true));
  try {
    await waitFor(() => expect(latest?.libraryWorldSnapshot).toBeDefined());
    const world = latest!.libraryWorldSnapshot;
    const started = await act(() =>
      application.commands.startSession.execute({
        entryId: book.id,
        entryType: "book",
      }),
    );
    await waitFor(() =>
      expect(latest?.worldSessionActivity).toMatchObject({
        sessionId: started.id,
        status: "active",
        instanceId: `reading-book:${book.id}`,
      }),
    );
    expect(latest!.libraryWorldSnapshot).toBe(world);
    await act(() =>
      application.commands.pauseSession.execute({ id: started.id }),
    );
    await waitFor(() =>
      expect(latest?.worldSessionActivity?.status).toBe("paused"),
    );
    expect(latest!.libraryWorldSnapshot).toBe(world);
    await act(() =>
      application.commands.resumeSession.execute({ id: started.id }),
    );
    await waitFor(() =>
      expect(latest?.worldSessionActivity?.status).toBe("active"),
    );
    view.rerender(page(false));
    await act(() =>
      application.commands.completeSession.execute({ id: started.id }),
    );
    view.rerender(page(true));
    await waitFor(() => expect(latest?.worldSessionActivity).toBeNull());
    expect(
      (await application.queries.getLibraryEntry.execute({ id: book.id }))?.id,
    ).toBe(book.id);
  } finally {
    view.unmount();
    application.close();
    await Dexie.delete(databaseName);
  }
});
