import { App } from "@capacitor/app";
import { useSyncExternalStore } from "react";
import { currentSessionDuration, type Session } from "../../domain";

// One redraw timestamp for every visible consumer, including the global indicator.
// This store contains no session data and performs no application queries/writes.
let now = new Date().toISOString();
const listeners = new Set<() => void>();
let stop: (() => void) | undefined;
const snapshot = () => now;
const idle = () => () => {};

function startClock() {
  let mounted = true;
  let foreground = true;
  let interval: number | undefined;
  let native: { remove(): Promise<void> } | undefined;
  const tick = () => {
    now = new Date().toISOString();
    listeners.forEach((listener) => listener());
  };
  const reconcile = () => {
    window.clearInterval(interval);
    interval = undefined;
    if (foreground && document.visibilityState === "visible") {
      tick();
      interval = window.setInterval(tick, 1_000);
    }
  };
  reconcile();
  document.addEventListener("visibilitychange", reconcile);
  void App.addListener("appStateChange", ({ isActive }) => {
    foreground = isActive;
    if (mounted) reconcile();
  }).then((handle) => {
    if (mounted) native = handle;
    else void handle.remove();
  });
  return () => {
    mounted = false;
    window.clearInterval(interval);
    document.removeEventListener("visibilitychange", reconcile);
    void native?.remove();
  };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) stop = startClock();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      stop?.();
      stop = undefined;
    }
  };
}

/** A redraw clock only. Persisted timestamps remain the source of duration. */
export function useSessionClock(session?: Session): number {
  const timestamp = useSyncExternalStore(
    session?.status === "active" ? subscribe : idle,
    snapshot,
  );
  if (!session) return 0;
  // A just-committed start/resume can be newer than the previous render tick.
  const since = session.activeSince ?? session.startedAt;
  return currentSessionDuration(session, timestamp < since ? since : timestamp);
}
