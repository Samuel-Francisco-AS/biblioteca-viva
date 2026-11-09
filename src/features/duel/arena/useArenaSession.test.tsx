import "fake-indexeddb/auto";
import Dexie from "dexie";
import { StrictMode, type ReactNode } from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import {
  createApplication,
  type ApplicationRuntime,
} from "../../../app/createApplication";
import { emptyArcanarium } from "../../../domain/arcanarium";
import { Arcana } from "../../arcanarium/context";
import { useArenaSession } from "./useArenaSession";
const apps: ApplicationRuntime[] = [],
  names: string[] = [];
afterEach(async () => {
  cleanup();
  apps.splice(0).forEach((a) => a.close());
  await Promise.all(names.splice(0).map((n) => Dexie.delete(n)));
  vi.restoreAllMocks();
});
async function setup() {
  const name = `arena-session-test-${crypto.randomUUID()}`;
  names.push(name);
  const app = await createApplication({ databaseName: name });
  apps.push(app);
  await app.duels.ensureCatalogue();
  const session = await app.duels.start({
    deckId: "arcane-deck:ruin",
    opponentId: "arcane-deck:knowledge",
    mode: "official",
    seed: 17,
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <StrictMode>
      <Arcana.Provider
        value={{
          app,
          data: emptyArcanarium(),
          entries: [],
          reload: async () => {},
        }}
      >
        {children}
      </Arcana.Provider>
    </StrictMode>
  );
  return { app, session, wrapper };
}
it("serializes double taps, pause in flight, reopen and explicit resume under StrictMode", async () => {
  const { app, session, wrapper } = await setup();
  const { result, unmount } = renderHook(() => useArenaSession(session.id), {
    wrapper,
  });
  await waitFor(() => expect(result.current.view?.revision).toBe(0));
  const actual = app.duels.command.bind(app.duels);
  let release: (() => void) | undefined;
  const command = vi
    .spyOn(app.duels, "command")
    .mockImplementationOnce(async (...args) => {
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      return actual(...args);
    });
  let pending: Promise<boolean>;
  await act(async () => {
    pending = result.current.submit({ type: "end" });
    expect(await result.current.submit({ type: "end" })).toBe(false);
    expect(await result.current.pause()).toBe(false);
    release?.();
    await pending;
  });
  expect(command).toHaveBeenCalledTimes(2);
  expect(result.current.view?.status).toBe("paused");
  expect(result.current.view?.revision).toBe(2);
  unmount();
  const reopened = renderHook(() => useArenaSession(session.id), { wrapper });
  await waitFor(() =>
    expect(reopened.result.current.view?.status).toBe("paused"),
  );
  await act(async () => {
    expect(await reopened.result.current.resume()).toBe(true);
  });
  expect(reopened.result.current.view?.status).toBe("active");
  // Exactly one IA controller survives StrictMode, using the persisted revision.
  await waitFor(() =>
    expect(command.mock.calls.some((c) => c[3] === 1)).toBe(true),
  );
  const aiRevisions = command.mock.calls
    .filter((c) => c[3] === 1)
    .map((c) => c[1]);
  expect(new Set(aiRevisions).size).toBe(aiRevisions.length);
});
it("reconciles an external revision without replaying a rejected command", async () => {
  const { app, session, wrapper } = await setup();
  const { result } = renderHook(() => useArenaSession(session.id), { wrapper });
  await waitFor(() => expect(result.current.view?.revision).toBe(0));
  await app.duels.command(session.id, 0, "external-pause", 0, {
    type: "pause",
  });
  const spy = vi.spyOn(app.duels, "command");
  await act(async () => {
    expect(await result.current.submit({ type: "end" })).toBe(false);
  });
  expect(spy).toHaveBeenCalledTimes(1);
  expect(result.current.view?.status).toBe("paused");
  expect(result.current.view?.revision).toBe(1);
  expect(result.current.error).not.toBe("");
});
