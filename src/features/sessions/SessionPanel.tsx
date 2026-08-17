import { useEffect, useState, type FormEvent } from "react";

import {
  currentSessionDuration,
  type LibraryEntry,
  type Session,
} from "../../domain";
import { presentApplicationError } from "../entry-editor/errorMessages";
import { formatSessionDuration } from "./sessionPresentation";

export interface SessionApplication {
  readonly commands: {
    readonly completeSession: { execute(input: unknown): Promise<Session> };
    readonly createManualSession: { execute(input: unknown): Promise<Session> };
    readonly deleteSession: {
      execute(input: unknown): Promise<{ readonly deleted: true }>;
    };
    readonly editSession: { execute(input: unknown): Promise<Session> };
    readonly pauseSession: { execute(input: unknown): Promise<Session> };
    readonly resumeSession: { execute(input: unknown): Promise<Session> };
    readonly startSession: { execute(input: unknown): Promise<Session> };
  };
  readonly queries: {
    readonly getOpenSession: { execute(): Promise<Session | undefined> };
    readonly listSessionsByEntry: {
      execute(input: unknown): Promise<readonly Session[]>;
    };
  };
}

function specific(entry: LibraryEntry, form: FormData) {
  const numeric = (name: string) => {
    const value = form.get(name);
    return typeof value === "string" && value !== ""
      ? Number(value)
      : undefined;
  };
  switch (entry.type) {
    case "book":
      return {
        entryType: entry.type,
        startPage: numeric("startPage"),
        endPage: numeric("endPage"),
      };
    case "movie":
      return {
        entryType: entry.type,
        watchedDuration: numeric("watchedDuration"),
      };
    case "series":
      return {
        entryType: entry.type,
        watchedDuration: numeric("watchedDuration"),
        episodesCompleted: numeric("episodesCompleted"),
      };
    case "study":
      return { entryType: entry.type };
    case "physical_activity":
      return {
        entryType: entry.type,
        distanceMeters: numeric("distanceMeters"),
        perceivedExertion: numeric("perceivedExertion"),
      };
    case "work": {
      const result = form.get("result");
      return {
        entryType: entry.type,
        result:
          typeof result === "string" && result.trim() ? result : undefined,
      };
    }
  }
}

export function SessionPanel({
  application,
  entry,
}: {
  readonly application: SessionApplication;
  readonly entry: LibraryEntry;
}) {
  const [sessions, setSessions] = useState<readonly Session[]>([]);
  const [open, setOpen] = useState<Session>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function reload() {
    const [items, active] = await Promise.all([
      application.queries.listSessionsByEntry.execute({ id: entry.id }),
      application.queries.getOpenSession.execute(),
    ]);
    setSessions(items);
    setOpen(active);
  }

  useEffect(() => {
    let active = true;
    void Promise.all([
      application.queries.listSessionsByEntry.execute({ id: entry.id }),
      application.queries.getOpenSession.execute(),
    ]).then(
      ([items, current]) => {
        if (active) {
          setSessions(items);
          setOpen(current);
        }
      },
      (failure: unknown) =>
        active && setError(presentApplicationError(failure).message),
    );
    return () => {
      active = false;
    };
  }, [application, entry.id]);

  async function act(operation: () => Promise<unknown>) {
    setBusy(true);
    setError(undefined);
    try {
      await operation();
      await reload();
    } catch (failure: unknown) {
      setError(presentApplicationError(failure).message);
    } finally {
      setBusy(false);
    }
  }

  function start(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const note = form.get("note");
    void act(() =>
      application.commands.startSession.execute({
        entryId: entry.id,
        ...specific(entry, form),
        note: typeof note === "string" && note.trim() ? note : undefined,
      }),
    );
  }

  function manual(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const duration = form.get("duration");
    const note = form.get("note");
    void act(() =>
      application.commands.createManualSession.execute({
        entryId: entry.id,
        ...specific(entry, form),
        duration:
          typeof duration === "string" ? Math.round(Number(duration) * 60) : 0,
        note: typeof note === "string" && note.trim() ? note : undefined,
      }),
    );
  }

  const ownOpen = open?.entryId === entry.id ? open : undefined;
  function edit(session: Session) {
    const minutes = window.prompt(
      "Duração em minutos",
      String(Math.max(1, Math.round(session.accumulatedDuration / 60))),
    );
    if (!minutes) return;
    void act(() =>
      application.commands.editSession.execute({
        id: session.id,
        duration: Math.round(Number(minutes) * 60),
        note: session.note,
      }),
    );
  }
  return (
    <section className="content-card" aria-labelledby="sessions-title">
      <h3 id="sessions-title">Sessões</h3>
      <p>
        Tempo dedicado fica registrado como memória, sem metas ou pontuação.
      </p>
      {error && <p role="alert">{error}</p>}
      {ownOpen ? (
        <div aria-live="polite">
          <p>
            <strong>
              {ownOpen.status === "active"
                ? "Sessão em andamento"
                : "Sessão pausada"}
            </strong>{" "}
            ·{" "}
            {formatSessionDuration(
              currentSessionDuration(ownOpen, new Date().toISOString()),
            )}
          </p>
          <div className="form-actions">
            {ownOpen.status === "active" ? (
              <button
                className="button button--secondary"
                disabled={busy}
                onClick={() =>
                  void act(() =>
                    application.commands.pauseSession.execute({
                      id: ownOpen.id,
                    }),
                  )
                }
                type="button"
              >
                Pausar
              </button>
            ) : (
              <button
                className="button button--secondary"
                disabled={busy}
                onClick={() =>
                  void act(() =>
                    application.commands.resumeSession.execute({
                      id: ownOpen.id,
                    }),
                  )
                }
                type="button"
              >
                Retomar
              </button>
            )}
            <button
              className="button button--primary"
              disabled={busy}
              onClick={() =>
                void act(() =>
                  application.commands.completeSession.execute({
                    id: ownOpen.id,
                  }),
                )
              }
              type="button"
            >
              Concluir sessão
            </button>
            <button
              className="button button--danger"
              disabled={busy}
              onClick={() =>
                window.confirm("Cancelar e remover esta sessão?") &&
                void act(() =>
                  application.commands.deleteSession.execute({
                    id: ownOpen.id,
                  }),
                )
              }
              type="button"
            >
              Cancelar sessão
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={start}>
          <h4>Iniciar cronômetro</h4>
          <SessionFields entry={entry} />
          <label className="form-field">
            Nota opcional
            <textarea name="note" />
          </label>
          <button
            className="button button--primary"
            disabled={busy || open !== undefined}
            type="submit"
          >
            Iniciar sessão
          </button>
          {open && (
            <p role="status">
              Já existe uma sessão em andamento em outro registro.
            </p>
          )}
        </form>
      )}
      <form onSubmit={manual}>
        <h4>Registrar sessão concluída</h4>
        <label className="form-field">
          Duração em minutos
          <input min="1" name="duration" required type="number" />
        </label>
        <SessionFields entry={entry} />
        <label className="form-field">
          Nota opcional
          <textarea name="note" />
        </label>
        <button
          className="button button--secondary"
          disabled={busy}
          type="submit"
        >
          Registrar sessão
        </button>
      </form>
      <h4>Histórico</h4>
      {sessions.filter(({ status }) => status === "completed").length === 0 ? (
        <p>Nenhuma sessão concluída.</p>
      ) : (
        <ul>
          {sessions
            .filter(({ status }) => status === "completed")
            .map((session) => (
              <li key={session.id}>
                {new Date(session.startedAt).toLocaleDateString("pt-BR")} ·{" "}
                {formatSessionDuration(session.accumulatedDuration)}{" "}
                <button
                  className="text-button"
                  onClick={() => void edit(session)}
                  type="button"
                >
                  Editar
                </button>{" "}
                <button
                  className="text-button"
                  onClick={() =>
                    window.confirm("Excluir esta sessão?") &&
                    void act(() =>
                      application.commands.deleteSession.execute({
                        id: session.id,
                      }),
                    )
                  }
                  type="button"
                >
                  Excluir
                </button>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}

function SessionFields({ entry }: { readonly entry: LibraryEntry }) {
  if (entry.type === "book")
    return (
      <>
        <label className="form-field">
          Página inicial
          <input min="1" name="startPage" type="number" />
        </label>
        <label className="form-field">
          Página final
          <input min="1" name="endPage" type="number" />
        </label>
      </>
    );
  if (entry.type === "movie" || entry.type === "series")
    return (
      <>
        <label className="form-field">
          Minutos assistidos
          <input min="0" name="watchedDuration" type="number" />
        </label>
        {entry.type === "series" && (
          <label className="form-field">
            Episódios concluídos
            <input min="0" name="episodesCompleted" type="number" />
          </label>
        )}
      </>
    );
  if (entry.type === "physical_activity")
    return (
      <>
        <label className="form-field">
          Distância em metros
          <input min="0" name="distanceMeters" type="number" />
        </label>
        <label className="form-field">
          Esforço percebido (1–10)
          <input max="10" min="1" name="perceivedExertion" type="number" />
        </label>
      </>
    );
  if (entry.type === "work")
    return (
      <label className="form-field">
        Resultado opcional
        <textarea name="result" />
      </label>
    );
  return null;
}
