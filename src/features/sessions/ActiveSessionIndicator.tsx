import { App as CapacitorApp } from "@capacitor/app";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { currentSessionDuration, type Session } from "../../domain";
import type { ApplicationRuntime } from "../../app/createApplication";
import { formatSessionDuration } from "./sessionPresentation";

export function ActiveSessionIndicator({
  application,
}: {
  readonly application?: ApplicationRuntime;
}) {
  const [session, setSession] = useState<Session>();
  const [now, setNow] = useState(() => new Date().toISOString());
  useEffect(() => {
    if (!application) return;
    let mounted = true;
    let native: { remove(): Promise<void> } | undefined;
    const refresh = async () => {
      const current = await application.queries.getOpenSession.execute();
      if (mounted) {
        setSession(current);
        setNow(new Date().toISOString());
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
  useEffect(() => {
    if (session?.status !== "active") return;
    const interval = window.setInterval(
      () => setNow(new Date().toISOString()),
      1_000,
    );
    return () => window.clearInterval(interval);
  }, [session?.id, session?.status]);
  if (!session) return null;
  return (
    <aside className="active-session" aria-live="polite">
      <span>
        Sessão {session.status === "active" ? "em andamento" : "pausada"} ·{" "}
        {formatSessionDuration(currentSessionDuration(session, now))}
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
