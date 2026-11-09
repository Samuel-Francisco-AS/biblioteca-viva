import { App } from "@capacitor/app";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DuelSession } from "../../../application/duels";
import type { DuelAction } from "../../../domain/duel/contracts";
import { chooseDuelAction } from "../../../domain/duel/ai";
import { arcanaError, useArcana } from "../../arcanarium/context";
import { projectArena } from "./arenaModel";

/** One controller per route; every visual effect follows a committed revision. */
export function useArenaSession(sessionId: string) {
  const { app } = useArcana();
  const [session, setSession] = useState<DuelSession>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(document.visibilityState !== "hidden");
  const current = useRef<DuelSession | undefined>(undefined);
  const generation = useRef(0);
  const locked = useRef(false);
  const foreground = useRef(visible);
  const pauseRequested = useRef(false);

  const accept = useCallback(
    (next: DuelSession) => {
      if (next.id !== sessionId) return;
      const old = current.current;
      if (
        old?.id === next.id &&
        (old.duel?.revision ?? 0) > (next.duel?.revision ?? 0)
      )
        return;
      current.current = next;
      setSession(next);
    },
    [sessionId],
  );

  const refresh = useCallback(async () => {
    const token = generation.current;
    try {
      const next = await app.duels.get(sessionId);
      if (generation.current !== token) return;
      accept(next);
      setError("");
    } catch (cause) {
      if (generation.current === token) setError(arcanaError(cause));
    }
  }, [app.duels, sessionId, accept]);

  const submit = useCallback(
    async (action: DuelAction, player = 0) => {
      const snapshot = current.current;
      if (
        !snapshot?.duel ||
        snapshot.id !== sessionId ||
        locked.current ||
        (player === 1 &&
          (!foreground.current ||
            pauseRequested.current ||
            snapshot.duel.active !== 1))
      )
        return false;
      const token = generation.current;
      locked.current = true;
      setBusy(true);
      setError("");
      try {
        let updated = await app.duels.command(
          snapshot.id,
          snapshot.duel.revision,
          crypto.randomUUID(),
          player,
          action,
        );
        // A background/pause request during a write is serialized after that commit.
        if (pauseRequested.current && updated.duel?.status === "active") {
          updated = await app.duels.command(
            updated.id,
            updated.duel.revision,
            crypto.randomUUID(),
            0,
            { type: "pause" },
          );
        }
        if (generation.current === token) accept(updated);
        return true;
      } catch (cause) {
        if (generation.current === token) {
          setError(arcanaError(cause));
          // Reconcile a concurrent writer, without replaying its command or ours.
          const next = await app.duels.get(sessionId).catch(() => undefined);
          if (next && generation.current === token) accept(next);
        }
        return false;
      } finally {
        locked.current = false;
        if (generation.current === token) setBusy(false);
      }
    },
    [app.duels, accept, sessionId],
  );

  const pause = useCallback(async () => {
    pauseRequested.current = true;
    if (locked.current) return false;
    if (current.current?.duel?.status !== "active") return true;
    return submit({ type: "pause" });
  }, [submit]);

  const resume = useCallback(async () => {
    if (!foreground.current || locked.current) return false;
    pauseRequested.current = false;
    return submit({ type: "resume" });
  }, [submit]);

  useEffect(() => {
    const token = ++generation.current;
    current.current = undefined;
    foreground.current = document.visibilityState !== "hidden";
    let native: { remove(): Promise<void> } | undefined;
    queueMicrotask(() => {
      if (generation.current === token) void refresh();
    });
    const visibility = (active: boolean) => {
      foreground.current = active;
      setVisible(active);
      if (active) void refresh();
      else void pause();
    };
    const browserVisibility = () =>
      visibility(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", browserVisibility);
    void App.addListener("appStateChange", ({ isActive }) =>
      visibility(isActive),
    ).then((handle) => {
      if (generation.current === token) native = handle;
      else void handle.remove();
    });
    return () => {
      generation.current = token + 1;
      foreground.current = false;
      document.removeEventListener("visibilitychange", browserVisibility);
      void native?.remove();
    };
  }, [refresh, pause]);

  useEffect(() => {
    const duel = session?.duel;
    if (
      !duel ||
      session.id !== sessionId ||
      duel.status !== "active" ||
      duel.active !== 1 ||
      !visible ||
      busy ||
      error
    )
      return;
    const timer = window.setTimeout(() => {
      if (
        current.current?.duel?.revision !== duel.revision ||
        !foreground.current
      )
        return;
      void submit(chooseDuelAction(duel), 1);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [session, sessionId, visible, busy, error, submit]);

  const view = useMemo(
    () =>
      session?.id === sessionId && session.duel
        ? projectArena(session.duel)
        : undefined,
    [session, sessionId],
  );
  return { view, busy, error, visible, submit, refresh, pause, resume };
}
