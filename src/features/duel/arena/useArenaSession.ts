import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DuelSession } from "../../../application/duels";
import type { DuelAction } from "../../../domain/duel/contracts";
import { chooseDuelAction } from "../../../domain/duel/ai";
import { useAppResume } from "../../../app/useAppResume";
import { arcanaError, useArcana } from "../../arcanarium/context";
import { projectArena } from "./arenaModel";

/**
 * BF-5.6F1: reusable lifecycle/command bridge for the 3D stage.
 *
 * Presentation must use projectArena() and submit(), never call the rules
 * transition nor write Dexie. The existing DuelTable remains the public route
 * until F2. This hook does not create a render/RAF loop or second WorldHost.
 */
export function useArenaSession(sessionId: string) {
  const { app } = useArcana();
  const [session, setSession] = useState<DuelSession>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(
    () => document.visibilityState !== "hidden",
  );
  const current = useRef<DuelSession>();
  const mounted = useRef(false);
  const locked = useRef(false);

  const accept = useCallback((next: DuelSession) => {
    const old = current.current;
    if (
      old?.id === next.id &&
      (old.duel?.revision ?? 0) > (next.duel?.revision ?? 0)
    ) return;
    current.current = next;
    if (mounted.current) setSession(next);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const next = await app.duels.get(sessionId);
      if (!mounted.current) return;
      accept(next);
      setError("");
    } catch (cause) {
      if (mounted.current) setError(arcanaError(cause));
    }
  }, [app.duels, sessionId, accept]);

  useEffect(() => {
    mounted.current = true;
    current.current = undefined;
    setSession(undefined);
    void refresh();
    const onVisibility = () => {
      const next = document.visibilityState !== "hidden";
      setVisible(next);
      if (next) void refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      mounted.current = false;
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);
  useAppResume(() => { void refresh(); });

  const submit = useCallback(async (action: DuelAction, player = 0) => {
    const snapshot = current.current;
    if (
      !snapshot?.duel ||
      locked.current ||
      !mounted.current ||
      (player === 1 && snapshot.duel.active !== 1)
    ) return false;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      const updated = await app.duels.command(
        snapshot.id,
        snapshot.duel.revision,
        crypto.randomUUID(),
        player,
        action,
      );
      if (mounted.current) accept(updated);
      return true;
    } catch (cause) {
      if (mounted.current) setError(arcanaError(cause));
      // The caller may explicitly refresh. Never blindly retry the command.
      return false;
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(false);
    }
  }, [app.duels, accept]);

  useEffect(() => {
    const duel = session?.duel;
    if (
      !duel ||
      duel.status !== "active" ||
      duel.active !== 1 ||
      !visible ||
      busy ||
      error
    ) return;
    const timer = window.setTimeout(() => {
      // A visibility/lifecycle refresh may have superseded the scheduled turn.
      if (current.current?.duel?.revision !== duel.revision) return;
      void submit(chooseDuelAction(duel), 1);
    }, 380);
    return () => window.clearTimeout(timer);
  }, [session, visible, busy, error, submit]);

  const view = useMemo(
    () => (session?.duel ? projectArena(session.duel) : undefined),
    [session],
  );

  return { view, busy, error, visible, submit, refresh };
}
