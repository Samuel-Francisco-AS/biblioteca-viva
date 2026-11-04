import { entryExperience } from "../entry-detail/entryExperience";
import { ExerciseList } from "../entry-detail/ExerciseList";
import { useEffect, useState, type FormEvent } from "react";

import {
  currentSessionDuration,
  type LibraryEntry,
  type Session,
} from "../../domain";
import type { SessionCompletionResult } from "../../application";
import { presentApplicationError } from "../entry-editor/errorMessages";
import { formatSessionDuration } from "./sessionPresentation";

export interface SessionApplication {
  readonly commands: {
    readonly completeSession: {
      execute(input: unknown): Promise<SessionCompletionResult>;
    };
    readonly createManualSession: {
      execute(input: unknown): Promise<SessionCompletionResult>;
    };
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
  onChanged,
  historyOnly = false,
}: {
  readonly application: SessionApplication;
  readonly entry: LibraryEntry;
  readonly onChanged?: () => void;
  readonly historyOnly?: boolean;
}) {
  const copy = entryExperience[entry.type];
  const [editing, setEditing] = useState<string>();
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
      onChanged?.();
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
    const date = form.get("date");
    const note = form.get("note");
    void act(() =>
      application.commands.createManualSession.execute({
        entryId: entry.id,
        ...(typeof date === "string" &&
          date && { occurredAt: new Date(`${date}T12:00:00`).toISOString() }),
        ...specific(entry, form),
        duration:
          typeof duration === "string" ? Math.round(Number(duration) * 60) : 0,
        note: typeof note === "string" && note.trim() ? note : undefined,
      }),
    );
  }

  const completed = sessions.filter(
    (session) => session.status === "completed",
  );
  const practiceDays = new Set(
    completed.map((session) =>
      new Date(session.startedAt).toLocaleDateString("pt-BR"),
    ),
  ).size;
  const ownOpen = open?.entryId === entry.id ? open : undefined;
  function edit(event: FormEvent<HTMLFormElement>, session: Session) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void act(async () => {
      await application.commands.editSession.execute({
        id: session.id,
        duration: Math.round(Number(form.get("duration")) * 60),
        note:
          typeof form.get("note") === "string"
            ? form.get("note") || undefined
            : undefined,
      });
      setEditing(undefined);
    });
  }
  return (
    <section className="content-card" aria-labelledby="sessions-title">
      <p className="eyebrow">Seu percurso</p>
      <h3 id="sessions-title">{copy.sessions}</h3>
      {!historyOnly && (
        <p>
          {entry.type === "series"
            ? "Registre os episódios que assistiu. Não precisa contar minutos."
            : entry.type === "physical_activity"
              ? "Uma mesma ficha, novos dias. Registre a execução e como se sentiu."
              : entry.type === "movie"
                ? "Guarde o dia em que assistiu; um reencontro também merece uma lembrança."
                : entry.type === "book"
                  ? "Da primeira à última página de cada encontro com o livro."
                  : entry.type === "study"
                    ? "Registre o tempo de estudo e suas descobertas. Sessões e horas alimentam a trilha automaticamente."
                    : "Guarde o resultado de cada etapa e siga para o próximo passo."}
        </p>
      )}
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
                Pausar sessão
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
                Retomar sessão
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
      ) : !historyOnly ? (
        <details className="session-clock">
          <summary>Usar cronômetro (opcional)</summary>
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
        </details>
      ) : null}
      {!historyOnly && (
        <form onSubmit={manual} className="session-record">
          <h4>{copy.record}</h4>
          <label className="form-field">
            Dia da experiência
            <input name="date" type="date" />
          </label>
          <p className="field-help">
            Deixe o dia em branco para registrar agora.
          </p>
          <SessionFields entry={entry} />
          <details className="session-time">
            <summary>Guardar tempo (opcional)</summary>
            <label className="form-field">
              Duração em minutos (opcional)
              <input min="0" step="any" name="duration" type="number" />
            </label>
          </details>
          <label className="form-field">
            Nota opcional
            <textarea name="note" />
          </label>
          <button
            className="button button--secondary"
            disabled={busy}
            type="submit"
          >
            {copy.record}
          </button>
        </form>
      )}
      <h4>Histórico</h4>
      {entry.type === "physical_activity" && (
        <p className="practice-frequency">
          {practiceDays} {practiceDays === 1 ? "dia" : "dias"} de prática ·{" "}
          {completed.length} {completed.length === 1 ? "execução" : "execuções"}
        </p>
      )}
      {sessions.filter(({ status }) => status === "completed").length === 0 ? (
        <p>
          {historyOnly
            ? "Sem sessões anteriores."
            : "O primeiro encontro ainda está por vir."}
        </p>
      ) : (
        <ul className="session-history">
          {sessions
            .filter(({ status }) => status === "completed")
            .map((session) => (
              <li key={session.id}>
                {new Date(session.startedAt).toLocaleDateString("pt-BR")} ·{" "}
                {session.accumulatedDuration > 0
                  ? formatSessionDuration(session.accumulatedDuration)
                  : "Tempo não informado"}
                {session.kind === "reading" && (
                  <p>
                    Páginas {session.startPage ?? "—"} →{" "}
                    {session.endPage ?? "—"}
                  </p>
                )}
                {session.kind === "viewing" &&
                  session.episodesCompleted !== undefined && (
                    <p>{session.episodesCompleted} episódios concluídos</p>
                  )}
                {session.kind === "physical_activity" && (
                  <>
                    <p>
                      {session.distanceMeters !== undefined
                        ? `${session.distanceMeters} m · `
                        : ""}
                      {session.perceivedExertion !== undefined
                        ? `Esforço ${session.perceivedExertion}/10`
                        : ""}
                    </p>
                    {session.exercises && session.exercises.length > 0 && (
                      <details>
                        <summary>Ficha desta execução</summary>
                        <ExerciseList exercises={session.exercises} />
                      </details>
                    )}
                  </>
                )}
                {session.kind === "work" && session.result && (
                  <p>{session.result}</p>
                )}
                {session.note && (
                  <p className="session-history__note">{session.note}</p>
                )}
                {editing === session.id && (
                  <form
                    className="session-edit"
                    onSubmit={(event) => edit(event, session)}
                  >
                    <label className="form-field">
                      Duração em minutos
                      <input
                        name="duration"
                        type="number"
                        min="0"
                        step="any"
                        defaultValue={session.accumulatedDuration / 60}
                      />
                    </label>
                    <label className="form-field">
                      Nota da experiência
                      <textarea name="note" defaultValue={session.note} />
                    </label>
                    <div className="form-actions">
                      <button
                        className="button button--primary"
                        type="submit"
                        disabled={busy}
                      >
                        Salvar experiência
                      </button>
                      <button
                        className="button button--secondary"
                        type="button"
                        onClick={() => setEditing(undefined)}
                      >
                        Cancelar edição
                      </button>
                    </div>
                  </form>
                )}
                <button
                  className="text-button"
                  onClick={() => setEditing(session.id)}
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
        {entry.type === "movie" && (
          <label className="form-field">
            Minutos assistidos (opcional)
            <input min="0" name="watchedDuration" type="number" />
          </label>
        )}
        {entry.type === "series" && (
          <label className="form-field">
            Episódios concluídos
            <input
              min="1"
              name="episodesCompleted"
              type="number"
              defaultValue="1"
              required
            />
          </label>
        )}
      </>
    );
  if (entry.type === "physical_activity")
    return (
      <>
        {entry.category === "cardio" && (
          <label className="form-field">
            Distância em metros (opcional)
            <input min="0" name="distanceMeters" type="number" />
          </label>
        )}
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
