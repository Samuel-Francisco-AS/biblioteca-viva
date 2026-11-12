import { BVDatePicker } from "../../ui/BVPicker";
import { entryExperience } from "../entry-detail/entryExperience";
import { ExerciseList } from "../entry-detail/ExerciseList";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";
import { useAppResume } from "../../app/useAppResume";
import { useSessionClock } from "./useSessionClock";

import { type LibraryEntry, type Session } from "../../domain";
import type { SessionCompletionResult } from "../../application";
import { presentApplicationError } from "../entry-editor/errorMessages";
import {
  formatSessionClock,
  formatSessionDuration,
} from "./sessionPresentation";

export interface SessionApplication {
  readonly events?: {
    subscribe(type: "SessionChanged", listener: () => void): () => void;
  };
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

  const [loading, setLoading] = useState(true);
  const mounted = useRef(false);
  const acting = useRef(false);
  const clockControl = useRef<HTMLButtonElement>(null);
  const focusAfterAction = useRef(false);
  const request = useRef(0);
  const reload = useCallback(async () => {
    const version = ++request.current;
    const [items, active] = await Promise.all([
      application.queries.listSessionsByEntry.execute({ id: entry.id }),
      application.queries.getOpenSession.execute(),
    ]);
    if (!mounted.current || version !== request.current) return;
    setSessions(items);
    setOpen(active);
    setLoading(false);
  }, [application, entry.id]);
  const refresh = useCallback(() => {
    void reload().catch((failure: unknown) => {
      if (mounted.current) {
        setError(presentApplicationError(failure).message);
        setLoading(true);
      }
    });
  }, [reload]);
  useAppResume(refresh);
  useEffect(() => {
    mounted.current = true;
    refresh();
    const unsubscribe = application.events?.subscribe(
      "SessionChanged",
      refresh,
    );
    const invalidate = () => request.current++;
    return () => {
      mounted.current = false;
      invalidate();
      unsubscribe?.();
    };
  }, [application, refresh]);

  useEffect(() => {
    if (!busy && focusAfterAction.current) {
      focusAfterAction.current = false;
      clockControl.current?.focus();
    }
  }, [busy]);

  async function act(operation: () => Promise<unknown>, focusClock = false) {
    if (acting.current) return;
    acting.current = true;
    focusAfterAction.current = focusClock;
    setBusy(true);
    setError(undefined);
    try {
      await operation();
      await reload();
      if (mounted.current) onChanged?.();
    } catch (failure: unknown) {
      if (mounted.current) setError(presentApplicationError(failure).message);
    } finally {
      acting.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  function start(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const note = form.get("note");
    void act(
      () =>
        application.commands.startSession.execute({
          entryId: entry.id,
          ...specific(entry, form),
          note: typeof note === "string" && note.trim() ? note : undefined,
        }),
      true,
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
  const reading = entry.type === "book" && !historyOnly;
  const elapsed = useSessionClock(ownOpen);
  const disabled = busy || loading;
  const HistoryContainer = reading ? "details" : "div";
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
    <section
      className={reading ? "folio-chapter reading-session" : "content-card"}
      aria-labelledby="sessions-title"
    >
      {reading ? (
        <div className="folio-chapter-heading">
          <span aria-hidden="true">II</span>
          <h3 id="sessions-title">Seu momento de leitura</h3>
        </div>
      ) : (
        <>
          <p className="eyebrow">Seu percurso</p>
          <h3 id="sessions-title">{copy.sessions}</h3>
        </>
      )}
      {reading && (
        <div
          className="reading-session__dial"
          data-state={ownOpen?.status ?? "ready"}
        >
          <span className="reading-session__sigil" aria-hidden="true">
            ✦
          </span>
          <span className="reading-session__caption">Tempo entre páginas</span>
          <strong role="timer" aria-label="Tempo de leitura" aria-live="off">
            {formatSessionClock(elapsed)}
          </strong>
          <span role="status">
            {loading
              ? "Carregando sessão…"
              : ownOpen?.status === "active"
                ? "Em andamento"
                : ownOpen
                  ? "Pausado"
                  : "Pronto para ler"}
          </span>
        </div>
      )}
      {!historyOnly && !reading && (
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
        <div className={reading ? "reading-session__actions" : undefined}>
          {!reading && (
            <p>
              <strong>
                {ownOpen.status === "active"
                  ? "Sessão em andamento"
                  : "Sessão pausada"}
              </strong>{" "}
              ·{" "}
              <span role="timer" aria-live="off">
                {formatSessionDuration(elapsed)}
              </span>
            </p>
          )}
          <div className="form-actions">
            {ownOpen.status === "active" ? (
              <button
                className="button button--secondary"
                ref={reading ? clockControl : undefined}
                disabled={disabled}
                onClick={() =>
                  void act(
                    () =>
                      application.commands.pauseSession.execute({
                        id: ownOpen.id,
                      }),
                    true,
                  )
                }
                type="button"
              >
                Pausar sessão
              </button>
            ) : (
              <button
                className="button button--secondary"
                ref={reading ? clockControl : undefined}
                disabled={disabled}
                onClick={() =>
                  void act(
                    () =>
                      application.commands.resumeSession.execute({
                        id: ownOpen.id,
                      }),
                    true,
                  )
                }
                type="button"
              >
                Retomar sessão
              </button>
            )}
            <button
              className="button button--primary"
              disabled={disabled}
              onClick={() =>
                void act(
                  () =>
                    application.commands.completeSession.execute({
                      id: ownOpen.id,
                    }),
                  true,
                )
              }
              type="button"
            >
              Concluir sessão
            </button>
            <button
              className={
                reading
                  ? "text-button reading-session__cancel"
                  : "button button--danger"
              }
              disabled={disabled}
              onClick={() =>
                window.confirm("Cancelar e remover esta sessão?") &&
                void act(
                  () =>
                    application.commands.deleteSession.execute({
                      id: ownOpen.id,
                    }),
                  true,
                )
              }
              type="button"
            >
              Cancelar sessão
            </button>
          </div>
        </div>
      ) : reading ? (
        <form onSubmit={start} className="reading-session__start">
          <p className="reading-session__hint">
            Sem pressa, sem limite. O tempo acompanha seu encontro com o livro.
          </p>
          <button
            className="button button--primary"
            ref={clockControl}
            disabled={disabled || open !== undefined}
            type="submit"
          >
            Iniciar sessão
          </button>
          <details className="reading-session__fields">
            <summary>Páginas e nota (opcionais)</summary>
            <SessionFields entry={entry} />
            <label className="form-field">
              Nota opcional
              <textarea name="note" />
            </label>
          </details>
          {open && (
            <p role="status">
              Já existe uma sessão em andamento em outro registro.{" "}
              <Link to={`/registros/${encodeURIComponent(open.entryId)}`}>
                Abrir sessão em andamento
              </Link>
            </p>
          )}
        </form>
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
              disabled={disabled || open !== undefined}
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
      <HistoryContainer
        className={reading ? "reading-session__history" : undefined}
      >
        {reading && <summary>Histórico de leituras e registro manual</summary>}
        {!historyOnly && (
          <form onSubmit={manual} className="session-record">
            <h4>{copy.record}</h4>
            <label className="form-field">
              Dia da experiência
              <BVDatePicker name="date" />
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
              disabled={disabled}
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
            {completed.length}{" "}
            {completed.length === 1 ? "execução" : "execuções"}
          </p>
        )}
        {sessions.filter(({ status }) => status === "completed").length ===
        0 ? (
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
                          disabled={disabled}
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
      </HistoryContainer>
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
