import { App as CapacitorApp } from "@capacitor/app";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { type Session } from "../../domain";
import type { ApplicationRuntime } from "../../app/createApplication";
import { formatSessionDuration } from "./sessionPresentation";
import { useSessionClock } from "./useSessionClock";

export function ActiveSessionIndicator({
  application,
}: {
  readonly application?: ApplicationRuntime;
}) {
  const [session, setSession] = useState<Session>();
  const duration = useSessionClock(session);
  useEffect(() => {
    if (!application) return;
    let mounted = true;
    let request = 0;
    let native: { remove(): Promise<void> } | undefined;
    const refresh = async () => {
      const version = ++request;
      const current = await application.queries.getOpenSession.execute();
      if (mounted && version === request) {
        setSession(current);
      }
    };
    void refresh();
    const unsubscribe = application.events.subscribe("SessionChanged", () =>
      refresh(),
    );
    const visibility = () => void refresh();
    document.addEventListener("visibilitychange", visibility);
    void CapacitorApp.addListener("appStateChange", ({ isActive }) => {
      if (isActive) void refresh();
    }).then((handle) => {
      if (mounted) native = handle;
      else void handle.remove();
    });
    return () => {
      mounted = false;
      unsubscribe();
      document.removeEventListener("visibilitychange", visibility);
      void native?.remove();
    };
  }, [application]);
  if (!session) return null;
  const focusFinished =
    session.kind === "study" &&
    session.focusDurationSeconds !== undefined &&
    duration >= session.focusDurationSeconds;
  return (
    <aside className="active-session">
      <span>
        {focusFinished
          ? "Foco concluído · aguardando registro"
          : `Sessão ${session.status === "active" ? "em andamento" : "pausada"}`}{" "}
        ·{" "}
        <span role="timer" aria-live="off" aria-label="Tempo da sessão">
          {formatSessionDuration(duration)}
        </span>
      </span>
      <Link
        className="text-link"
        to={`/registros/${encodeURIComponent(session.entryId)}`}
      >
        Abrir sessão
      </Link>
    </aside>
  );
}
