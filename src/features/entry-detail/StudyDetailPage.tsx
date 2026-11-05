import { BVSelectSheet } from "../../ui/BVPicker";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAllowedStatusTransitions,
  type LibraryEntry,
  type Note,
  type Quote,
  type Session,
  type StudyEntry,
} from "../../domain";
import { ArtifactGlyph } from "../../app/ArtifactGlyph";
import { useAppResume } from "../../app/useAppResume";
import { statusLabels } from "../books/bookPresentation";
import { presentApplicationError } from "../entry-editor/errorMessages";
import { OrganizationPanel } from "../tags/OrganizationPanel";
import type { EntryDetailApplication } from "./EntryDetailPage";
import { RecordMemories } from "./RecordMemories";
import { StudyPomodoro } from "./StudyPomodoro";
import { StudyFlashCards } from "./StudyFlashCards";
import { studyUnitLabels } from "./entryExperience";
import { useStudyDraftGuard } from "./useStudyDraftGuard";
import "./study-folio.css";

function hours(seconds: number) {
  return `${Math.floor(seconds / 3600)} h ${Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0")} min ${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")} s`;
}
export function StudyDetailPage({
  application,
  entry,
  notes,
  quotes,
  returnPath,
  onChange,
}: {
  readonly application: EntryDetailApplication;
  readonly entry: StudyEntry;
  readonly notes: readonly Note[];
  readonly quotes: readonly Quote[];
  readonly returnPath: string;
  readonly onChange: (entry: LibraryEntry) => void;
}) {
  const root = useRef<HTMLElement>(null);
  const mounted = useRef(false);
  const acting = useRef(false);
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<readonly Session[]>([]);
  const [open, setOpen] = useState<Session>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState("");
  const [editingSession, setEditingSession] = useState<string>();
  useStudyDraftGuard(root);
  const reload = useCallback(async () => {
    const [updated, history, active] = await Promise.all([
      application.queries.getLibraryEntry.execute({ id: entry.id }),
      application.queries.listSessionsByEntry.execute({ id: entry.id }),
      application.queries.getOpenSession.execute(),
    ]);
    if (!mounted.current) return;
    onChange(updated);
    setSessions(history);
    setOpen(active);
    setLoading(false);
  }, [application, entry.id, onChange]);
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
    return () => {
      mounted.current = false;
    };
  }, [refresh]);
  async function act(operation: () => Promise<unknown>, success: string) {
    if (acting.current) return;
    acting.current = true;
    setBusy(true);
    setError(undefined);
    setMessage("");
    try {
      await operation();
      await reload();
      if (mounted.current) setMessage(success);
    } catch (failure: unknown) {
      if (mounted.current) setError(presentApplicationError(failure).message);
    } finally {
      acting.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  const completed = sessions.filter(
    (session) => session.status === "completed",
  );
  const total = completed.reduce(
    (value, session) => value + session.accumulatedDuration,
    0,
  );
  const baseline =
    entry.studyTimeBaselineSeconds ??
    (entry.progressUnit === "hours"
      ? Math.max(0, entry.progressCurrent * 60 - total)
      : 0);
  async function saveProgress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await act(
      () =>
        application.commands.updateLibraryEntryProgress.execute({
          id: entry.id,
          type: "study",
          progressCurrent: Number(form.get("progress")),
        }),
      "Marcador atualizado.",
    );
  }
  return (
    <article className="study-folio" ref={root} aria-labelledby="study-title">
      <nav className="study-navigation" aria-label="Navegação do estudo">
        <Link to={returnPath}>
          {returnPath.startsWith("/arquivo")
            ? "Voltar ao Arquivo"
            : returnPath.startsWith("/colecao")
              ? "Voltar à Coleção"
              : "Voltar à Biblioteca"}
        </Link>
        <span aria-hidden="true">Códice de estudos · ✧</span>
      </nav>
      <header className="study-identity">
        <span className="study-emblem" aria-hidden="true">
          <ArtifactGlyph type="study" />
        </span>
        <div>
          <p className="study-kicker">Seu percurso de conhecimento</p>
          <h2 id="study-title">{entry.title}</h2>
          {(entry.discipline || entry.area) && (
            <p className="study-subtitle">
              {[entry.area, entry.discipline].filter(Boolean).join(" · ")}
            </p>
          )}
          <span className="study-status">{statusLabels[entry.status]}</span>
        </div>
        <Link
          className="study-edit"
          to={`/registros/${encodeURIComponent(entry.id)}/editar?from=${encodeURIComponent(returnPath)}`}
        >
          Editar estudo
        </Link>
      </header>
      {entry.objective && <p className="study-intention">{entry.objective}</p>}
      {error && (
        <div role="alert" className="study-error">
          <p>{error}</p>
          <button type="button" className="text-button" onClick={refresh}>
            Consultar novamente
          </button>
        </div>
      )}
      <p className="study-feedback" role="status">
        {message}
      </p>
      <StudyPomodoro
        application={application}
        entry={entry}
        open={open}
        loading={loading}
        busy={busy}
        act={act}
      />
      <section className="study-total" aria-labelledby="study-total-title">
        <div>
          <p className="study-kicker">II · O tempo deixa suas marcas</p>
          <h3 id="study-total-title">Tempo de estudo acumulado</h3>
          <strong>{loading ? "Consultando…" : hours(total + baseline)}</strong>
          <p>
            {completed.length}{" "}
            {completed.length === 1
              ? "sessão registrada"
              : "sessões registradas"}{" "}
            neste percurso
          </p>
        </div>
        <span aria-hidden="true" className="study-total__sigil">
          ✧
        </span>
      </section>
      {baseline > 0 && (
        <p className="study-hint">
          Inclui {hours(baseline)} do marcador anterior, sem sessão vinculada.
        </p>
      )}
      <div className="study-goal">
        <span>
          Seu marcador ·{" "}
          {entry.progressUnit === "hours"
            ? hours(entry.progressCurrent * 60)
            : `${entry.progressCurrent} ${studyUnitLabels[entry.progressUnit]}`}
          {entry.progressTotal !== undefined
            ? ` / ${entry.progressUnit === "hours" ? hours(entry.progressTotal * 60) : entry.progressTotal}`
            : ""}
        </span>
        {entry.progressTotal !== undefined && (
          <progress
            aria-label="Progresso do estudo"
            max={entry.progressTotal}
            value={entry.progressCurrent}
          />
        )}
        <p className="study-hint">
          {entry.progressUnit === "hours"
            ? "O marcador usa minutos inteiros. O acumulado conserva o tempo anterior e soma os segundos de cada foco, sem arredondá-los novamente."
            : entry.progressUnit === "sessions"
              ? "Cada foco registrado alimenta sua meta de sessões."
              : "O foco guarda seu tempo; atualize as unidades do percurso em Ações do estudo."}
        </p>
      </div>
      <RecordMemories
        folio
        application={application}
        entry={entry}
        initialNotes={notes}
        initialQuotes={quotes}
      />
      <StudyFlashCards
        application={application}
        entry={entry}
        onChange={onChange}
      />
      <section
        className="study-chapter study-secondary"
        aria-label="Ações secundárias"
      >
        <details className="study-disclosure">
          <summary>Histórico de estudo · {completed.length}</summary>
          <p className="study-hint">
            O histórico guarda cada encontro. Excluir uma sessão retira seu
            tempo do acumulado acima, mas preserva o marcador do percurso.
          </p>
          {completed.length === 0 && (
            <p>Seu primeiro foco ainda está por vir.</p>
          )}
          <ol className="study-history">
            {completed.map((session) => (
              <li key={session.id}>
                <div>
                  <time dateTime={session.startedAt}>
                    {new Date(session.startedAt).toLocaleDateString("pt-BR")}
                  </time>
                  <strong>{hours(session.accumulatedDuration)}</strong>
                </div>
                {session.note && <p>{session.note}</p>}
                {editingSession === session.id && (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      const form = new FormData(event.currentTarget);
                      const rawNote = form.get("note");
                      void act(async () => {
                        await application.commands.editSession.execute({
                          id: session.id,
                          duration: session.accumulatedDuration,
                          note:
                            typeof rawNote === "string"
                              ? rawNote.trim() || undefined
                              : undefined,
                        });
                        setEditingSession(undefined);
                      }, "Lembrança da sessão salva.");
                    }}
                  >
                    <label className="form-field">
                      Nota da sessão
                      <textarea
                        data-study-draft
                        name="note"
                        defaultValue={session.note}
                      />
                    </label>
                    <button
                      className="button button--primary"
                      type="submit"
                      disabled={busy}
                    >
                      Salvar lembrança
                    </button>
                    <button
                      className="text-button"
                      type="button"
                      disabled={busy}
                      onClick={() => setEditingSession(undefined)}
                    >
                      Cancelar edição
                    </button>
                  </form>
                )}
                <div className="form-actions">
                  <button
                    className="text-button"
                    type="button"
                    disabled={busy}
                    onClick={() => setEditingSession(session.id)}
                  >
                    Anotar sessão
                  </button>
                  <button
                    className="text-button"
                    disabled={busy}
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Excluir esta sessão do histórico? O marcador do percurso será preservado.",
                        )
                      )
                        void act(
                          () =>
                            application.commands.deleteSession.execute({
                              id: session.id,
                            }),
                          "Sessão excluída do histórico.",
                        );
                    }}
                  >
                    Excluir sessão
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </details>
        <details className="study-disclosure">
          <summary>Ações do estudo</summary>
          <label className="form-field">
            Estado do percurso
            <BVSelectSheet
              disabled={busy}
              value={entry.status}
              onChange={(event) =>
                void act(
                  () =>
                    application.commands.changeLibraryEntryStatus.execute({
                      id: entry.id,
                      status: event.target.value,
                    }),
                  "Estado do estudo atualizado.",
                )
              }
            >
              <option value={entry.status}>{statusLabels[entry.status]}</option>
              {getAllowedStatusTransitions(entry.status).map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </BVSelectSheet>
          </label>
          {entry.deadline && (
            <p>
              Prazo ·{" "}
              {new Date(entry.deadline).toLocaleDateString("pt-BR", {
                timeZone: "UTC",
              })}
            </p>
          )}
          {entry.progressUnit !== "hours" &&
            entry.progressUnit !== "sessions" && (
              <form onSubmit={(event) => void saveProgress(event)}>
                <label className="form-field">
                  Progresso em {studyUnitLabels[entry.progressUnit]}
                  <input
                    name="progress"
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min="0"
                    max={
                      entry.progressTotal ??
                      (entry.progressUnit === "percent" ? 100 : undefined)
                    }
                    defaultValue={entry.progressCurrent}
                    required
                  />
                </label>
                <button
                  className="button button--secondary"
                  type="submit"
                  disabled={busy}
                >
                  Salvar progresso
                </button>
              </form>
            )}
          <OrganizationPanel
            application={application}
            entry={entry}
            onChange={onChange}
          />
        </details>
        <details className="study-disclosure study-danger">
          <summary>Cuidar deste registro</summary>
          <p>
            Excluir este estudo remove também suas notas, citações, sessões e
            flash cards. Esta ação não pode ser desfeita.
          </p>
          <button
            className="button button--danger"
            type="button"
            disabled={busy}
            onClick={() => {
              if (
                !window.confirm(
                  "Excluir este estudo, anotações, sessões e flash cards?",
                )
              )
                return;
              void act(async () => {
                await application.commands.deleteLibraryEntry.execute({
                  id: entry.id,
                });
                void navigate("/colecao");
              }, "Estudo excluído.");
            }}
          >
            Excluir estudo
          </button>
        </details>
      </section>
      <footer className="study-colophon">
        Biblioteca Viva <span aria-hidden="true">✦</span> O saber também cria
        raízes
      </footer>
    </article>
  );
}
