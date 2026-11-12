import { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAllowedStatusTransitions,
  type WorkEntry,
  type LibraryEntry,
  type Note,
  type Quote,
} from "../../domain";
import {
  emptyWorkPlan,
  journalKindLabels,
  nextWorkDeadline,
  taskStateLabels,
  workKindLabels,
  workProgress,
  type WorkTask,
} from "../../domain/endeavors";
import type { WorkOperation } from "../../application/endeavors";
import { ApplicationError } from "../../application";
import { ArtifactGlyph } from "../../app/ArtifactGlyph";
import { useAppResume } from "../../app/useAppResume";
import { statusLabels, formatDateTime } from "../books/bookPresentation";
import { presentApplicationError } from "../entry-editor/errorMessages";
import { SessionPanel } from "../sessions/SessionPanel";
import { OrganizationPanel } from "../tags/OrganizationPanel";
import { RecordMemories } from "./RecordMemories";
import type { EntryDetailApplication } from "./EntryDetailPage";
import { WorkEditor, type WorkEditorTarget } from "./WorkEditor";
import { useStudyDraftGuard } from "./useStudyDraftGuard";
import "./work-folio.css";
const dateLabel = (date: string) =>
  date.slice(0, 10).split("-").reverse().join("/");
export function WorkDetailPage({
  application,
  entry,
  notes,
  quotes,
  returnPath,
  onChange,
}: {
  readonly application: EntryDetailApplication;
  readonly entry: WorkEntry;
  readonly notes: readonly Note[];
  readonly quotes: readonly Quote[];
  readonly returnPath: string;
  readonly onChange: (entry: LibraryEntry) => void;
}) {
  const root = useRef<HTMLElement>(null);
  const acting = useRef(false);
  const [legacyNotes, setLegacyNotes] = useState(notes);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editor, setEditor] = useState<WorkEditorTarget>();
  const [conflict, setConflict] = useState(false);
  const navigate = useNavigate();
  const plan = entry.plan ?? emptyWorkPlan();
  const progress = workProgress(plan.tasks);
  const deadline = nextWorkDeadline(entry);
  const nextTask = plan.tasks.find((task) => task.id === plan.nextTaskId);
  useStudyDraftGuard(
    root,
    "Há alterações não salvas na empreitada. Sair e descartar o rascunho?",
  );
  const refresh = useCallback(() => {
    if (acting.current || editor) return;
    void application.queries.getLibraryEntry
      .execute({ id: entry.id })
      .then(onChange, (failure) =>
        setError(presentApplicationError(failure).message),
      );
  }, [application, editor, entry.id, onChange]);
  useAppResume(refresh);
  async function save(operation: WorkOperation): Promise<boolean> {
    if (acting.current || !application.commands.saveEndeavor) return false;
    acting.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      onChange(
        await application.commands.saveEndeavor.execute({
          id: entry.id,
          expectedRevision: entry.revision,
          operation,
        }),
      );
      setConflict(false);
      setMessage("Empreitada salva.");
      return true;
    } catch (failure) {
      const changed =
        failure instanceof ApplicationError && failure.code === "CONFLICT";
      setConflict(changed);
      setError(
        changed
          ? "A empreitada mudou em outra tela. Feche o editor e reabra os dados antes de continuar."
          : presentApplicationError(failure).message,
      );
      return false;
    } finally {
      acting.current = false;
      setBusy(false);
    }
  }
  function confirmDelete(operation: WorkOperation, prompt: string) {
    if (window.confirm(prompt)) void save(operation);
  }
  function taskRow(
    task: WorkTask,
    siblings: readonly WorkTask[],
    index: number,
  ) {
    return (
      <li className="work-task" key={task.id} data-state={task.state}>
        <label className="work-task__check">
          <input
            type="checkbox"
            checked={task.state === "completed"}
            disabled={busy || conflict}
            aria-label={`${task.state === "completed" ? "Reabrir" : "Concluir"} tarefa: ${task.title}`}
            onChange={() =>
              void save({
                kind: "state",
                itemId: task.id,
                state: task.state === "completed" ? "pending" : "completed",
              })
            }
          />
          <span aria-hidden="true">
            {task.state === "completed" ? "✓" : ""}
          </span>
        </label>
        <details>
          <summary>
            <span className="work-task__title">{task.title}</span>
            <span className="work-task__meta">
              {task.state === "blocked" ? "◇ " : ""}
              {taskStateLabels[task.state]}
              {task.deadline ? ` · ${dateLabel(task.deadline)}` : ""}
              {plan.nextTaskId === task.id ? " · Próxima ação" : ""}
            </span>
          </summary>
          <div className="work-task__body">
            {task.description && (
              <p className="work-prose">{task.description}</p>
            )}
            {task.reference && (
              <a
                className="text-link work-reference"
                href={task.reference}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir referência ↗
              </a>
            )}
            <div className="work-task__tools">
              <button
                type="button"
                className="text-button"
                disabled={busy || conflict}
                onClick={() => setEditor({ kind: "task", value: task })}
              >
                Editar tarefa
              </button>
              {task.state !== "completed" && (
                <button
                  type="button"
                  className="text-button"
                  disabled={busy || conflict}
                  onClick={() =>
                    void save({
                      kind: "next",
                      itemId: task.id,
                      text: entry.nextAction,
                    })
                  }
                >
                  Definir próxima ação
                </button>
              )}
              <button
                type="button"
                className="text-button"
                aria-label={`Subir tarefa: ${task.title}`}
                disabled={busy || conflict || index === 0}
                onClick={() =>
                  void save({
                    kind: "move",
                    collection: "tasks",
                    itemId: task.id,
                    direction: "up",
                  })
                }
              >
                ↑ Subir
              </button>
              <button
                type="button"
                className="text-button"
                aria-label={`Descer tarefa: ${task.title}`}
                disabled={busy || conflict || index === siblings.length - 1}
                onClick={() =>
                  void save({
                    kind: "move",
                    collection: "tasks",
                    itemId: task.id,
                    direction: "down",
                  })
                }
              >
                ↓ Descer
              </button>
              <button
                type="button"
                className="text-button work-danger"
                disabled={busy || conflict}
                onClick={() =>
                  confirmDelete(
                    { kind: "deleteTask", itemId: task.id },
                    `Excluir a tarefa “${task.title}”?`,
                  )
                }
              >
                Excluir tarefa
              </button>
            </div>
          </div>
        </details>
      </li>
    );
  }
  function taskList(stageId?: string) {
    const tasks = plan.tasks.filter((task) => task.stageId === stageId);
    return (
      <ul className="work-tasks">
        {tasks.map((task, index) => taskRow(task, tasks, index))}
      </ul>
    );
  }
  return (
    <article
      ref={root}
      className="work-folio"
      aria-labelledby="work-title"
      data-has-record-draft={editor ? "true" : undefined}
    >
      <nav className="work-navigation">
        <Link className="text-link" to={returnPath}>
          {returnPath.startsWith("/colecao")
            ? "Voltar à Coleção"
            : returnPath.startsWith("/arquivo")
              ? "Voltar ao Arquivo"
              : "Voltar à Biblioteca"}
        </Link>
        <Link
          className="text-link"
          to={`/registros/${encodeURIComponent(entry.id)}/editar?from=${encodeURIComponent(returnPath)}`}
        >
          Editar empreitada
        </Link>
      </nav>
      <header className="work-identity">
        <span className="work-emblem" aria-hidden="true">
          <ArtifactGlyph type="work" />
        </span>
        <div>
          <h2 id="work-title">{entry.title}</h2>
          {(entry.kind || entry.area) && (
            <p className="work-identity__subtitle">
              {[entry.kind ? workKindLabels[entry.kind] : undefined, entry.area]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          <div className="work-identity__meta">
            <details>
              <summary>{statusLabels[entry.status]}</summary>
              <div className="work-task__tools">
                {getAllowedStatusTransitions(entry.status).map((status) => (
                  <button
                    type="button"
                    className="text-button"
                    key={status}
                    disabled={busy || conflict}
                    onClick={() => void save({ kind: "status", status })}
                  >
                    {statusLabels[status]}
                  </button>
                ))}
              </div>
            </details>
            {entry.deadline && <span>Prazo · {dateLabel(entry.deadline)}</span>}
          </div>
        </div>
      </header>
      {entry.description && (
        <p className="work-objective work-prose">{entry.description}</p>
      )}
      {(entry.area ||
        entry.organization ||
        entry.startDate ||
        entry.reference ||
        entry.initialNotes) && (
        <details className="work-context">
          <summary>Contexto e referências</summary>
          <dl>
            {entry.area && (
              <>
                <dt>Área</dt>
                <dd>{entry.area}</dd>
              </>
            )}
            {entry.organization && (
              <>
                <dt>Cliente ou organização</dt>
                <dd>{entry.organization}</dd>
              </>
            )}
            {entry.startDate && (
              <>
                <dt>Início</dt>
                <dd>{dateLabel(entry.startDate)}</dd>
              </>
            )}
          </dl>
          {entry.reference && (
            <a
              href={entry.reference}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link work-reference"
            >
              Referência da empreitada ↗
            </a>
          )}
          {entry.initialNotes && (
            <p className="work-prose">{entry.initialNotes}</p>
          )}
        </details>
      )}
      <div className="work-feedback" role="status">
        {message}
      </div>
      {error && <p role="alert">{error}</p>}
      {conflict && !editor && (
        <button
          className="button button--secondary"
          onClick={() => {
            void (async () => {
              try {
                onChange(
                  await application.queries.getLibraryEntry.execute({
                    id: entry.id,
                  }),
                );
                setConflict(false);
                setError("");
              } catch {
                setError("Não foi possível reabrir a empreitada.");
              }
            })();
          }}
        >
          Reabrir dados salvos
        </button>
      )}
      <section className="work-progress" aria-labelledby="work-progress-title">
        <div>
          <p className="work-kicker" id="work-progress-title">
            O que já tomou forma
          </p>
          <strong className="work-progress__number">
            {progress.percentage === undefined
              ? "—"
              : `${progress.percentage}%`}
          </strong>
        </div>
        <div className="work-progress__measure">
          {progress.total ? (
            <>
              <progress
                max="100"
                value={progress.percentage}
                aria-label="Progresso da empreitada"
              />
              <p>
                {progress.completed} de {progress.total} tarefas concluídas ·{" "}
                {progress.pending} por fazer
              </p>
            </>
          ) : (
            <p className="work-muted work-progress__empty">
              Seu progresso começa com a primeira tarefa.
            </p>
          )}
          {deadline && (
            <p>
              Próximo prazo ·{" "}
              <time dateTime={deadline}>{dateLabel(deadline)}</time>
            </p>
          )}
        </div>
      </section>
      <section className="work-planning" aria-labelledby="work-planning-title">
        <div className="work-section-heading">
          <h3 id="work-planning-title">Etapas e tarefas</h3>
          <div className="work-section-actions">
            <button
              className="text-button work-section-action"
              disabled={busy || conflict}
              onClick={() => setEditor({ kind: "task" })}
            >
              ＋ Nova tarefa
            </button>
            <button
              className="text-button work-section-action"
              disabled={busy || conflict}
              onClick={() => setEditor({ kind: "stage" })}
            >
              ＋ Etapa
            </button>
          </div>
        </div>
        {plan.stages.map((stage, index) => {
          const tasks = plan.tasks.filter((task) => task.stageId === stage.id),
            count = workProgress(tasks);
          return (
            <section
              className="work-stage"
              key={stage.id}
              aria-label={`Etapa: ${stage.title}`}
            >
              <div className="work-stage__heading">
                <span className="work-stage__index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h4>{stage.title}</h4>
                  <p>
                    {count.total
                      ? `${count.completed}/${count.total} · ${count.percentage}%`
                      : "Sem tarefas"}
                    {stage.deadline ? ` · ${dateLabel(stage.deadline)}` : ""}
                  </p>
                </div>
                <details className="work-stage__options">
                  <summary aria-label={`Opções da etapa: ${stage.title}`}>
                    •••
                  </summary>
                  <div className="work-task__tools">
                    <button
                      className="text-button"
                      disabled={busy || conflict}
                      onClick={() => setEditor({ kind: "stage", value: stage })}
                    >
                      Editar etapa
                    </button>
                    <button
                      className="text-button"
                      disabled={busy || conflict || index === 0}
                      onClick={() =>
                        void save({
                          kind: "move",
                          collection: "stages",
                          itemId: stage.id,
                          direction: "up",
                        })
                      }
                    >
                      ↑ Subir etapa
                    </button>
                    <button
                      className="text-button"
                      disabled={
                        busy || conflict || index === plan.stages.length - 1
                      }
                      onClick={() =>
                        void save({
                          kind: "move",
                          collection: "stages",
                          itemId: stage.id,
                          direction: "down",
                        })
                      }
                    >
                      ↓ Descer etapa
                    </button>
                    <button
                      className="text-button work-danger"
                      disabled={busy || conflict}
                      onClick={() =>
                        confirmDelete(
                          { kind: "deleteStage", itemId: stage.id },
                          "Excluir esta etapa? Suas tarefas serão preservadas na seção Sem etapa.",
                        )
                      }
                    >
                      Excluir etapa
                    </button>
                  </div>
                </details>
              </div>
              {stage.description && (
                <p className="work-prose work-stage__description">
                  {stage.description}
                </p>
              )}
              {stage.reference && (
                <a
                  href={stage.reference}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link work-reference"
                >
                  Referência da etapa ↗
                </a>
              )}
              {taskList(stage.id)}
              <button
                className="text-button work-add-task"
                disabled={busy || conflict}
                onClick={() => setEditor({ kind: "task", stageId: stage.id })}
              >
                ＋ Tarefa nesta etapa
              </button>
            </section>
          );
        })}
        <section className="work-stage" aria-label="Tarefas sem etapa">
          {plan.stages.length > 0 && <h4>Sem etapa</h4>}
          {taskList()}
        </section>
      </section>
      <section className="work-next" aria-labelledby="work-next-title">
        <div className="work-section-heading">
          <h3 id="work-next-title">Próxima ação</h3>
          <button
            className="text-button work-section-action"
            disabled={busy || conflict}
            onClick={() =>
              setEditor({
                kind: "next",
                taskId: plan.nextTaskId,
                text: entry.nextAction,
              })
            }
          >
            Escolher
          </button>
        </div>
        {nextTask && <p className="work-next__task">↗ {nextTask.title}</p>}
        {entry.nextAction && <p className="work-prose">{entry.nextAction}</p>}
        {!nextTask && !entry.nextAction && (
          <p className="work-muted">Nenhuma ação escolhida.</p>
        )}
      </section>
      <section className="work-journal" aria-labelledby="work-journal-title">
        <div className="work-section-heading">
          <h3 id="work-journal-title">Diário da empreitada</h3>
          <button
            className="text-button work-section-action"
            disabled={busy || conflict}
            onClick={() => setEditor({ kind: "journal" })}
          >
            ＋ Escrever
          </button>
        </div>
        {!plan.journal.length && !legacyNotes.length && (
          <p className="work-muted">
            Avanços, decisões e o que você aprendeu pelo caminho.
          </p>
        )}
        <ol className="work-journal__entries">
          {[
            ...plan.journal.map((item) => ({ ...item, legacy: false })),
            ...legacyNotes.map((note) => ({
              id: note.id,
              kind: "observation" as const,
              content: note.content,
              createdAt: note.createdAt,
              legacy: true,
            })),
          ]
            .sort(
              (a, b) =>
                a.createdAt.localeCompare(b.createdAt) ||
                a.id.localeCompare(b.id),
            )
            .map((item) => (
              <li key={`${item.legacy ? "note" : "journal"}:${item.id}`}>
                <header>
                  <span>
                    {item.legacy
                      ? "Anotação anterior"
                      : journalKindLabels[item.kind]}
                  </span>
                  <time dateTime={item.createdAt}>
                    {formatDateTime(item.createdAt)}
                  </time>
                </header>
                <p className="work-prose">{item.content}</p>
                {!item.legacy && (
                  <details>
                    <summary>Opções do registro</summary>
                    <div className="work-task__tools">
                      <button
                        className="text-button"
                        disabled={busy || conflict}
                        onClick={() =>
                          setEditor({ kind: "journal", value: item })
                        }
                      >
                        Editar registro do diário
                      </button>
                      <button
                        className="text-button work-danger"
                        disabled={busy || conflict}
                        onClick={() =>
                          confirmDelete(
                            { kind: "deleteJournal", itemId: item.id },
                            "Excluir este registro do diário?",
                          )
                        }
                      >
                        Excluir registro do diário
                      </button>
                    </div>
                  </details>
                )}
              </li>
            ))}
        </ol>
        {(notes.length > 0 || quotes.length > 0) && (
          <details className="work-secondary">
            <summary>Editar anotações anteriores</summary>
            <RecordMemories
              application={application}
              entry={entry}
              initialNotes={notes}
              initialQuotes={quotes}
              onNotesChange={setLegacyNotes}
              folio
            />
          </details>
        )}
      </section>
      <details className="work-secondary">
        <summary>Sessões de trabalho e resultados</summary>
        <SessionPanel
          application={application}
          entry={entry}
          onChanged={refresh}
        />
      </details>
      <details className="work-secondary">
        <summary>Organização e favoritos</summary>
        <OrganizationPanel
          application={application}
          entry={entry}
          onChange={onChange}
        />
      </details>
      <details className="work-secondary work-care">
        <summary>Ações da empreitada</summary>
        <Link
          className="text-link"
          to={`/registros/${encodeURIComponent(entry.id)}/editar?from=${encodeURIComponent(returnPath)}`}
        >
          Editar empreitada
        </Link>
        <button
          className="button button--danger"
          disabled={busy}
          onClick={() => {
            void (async () => {
              if (
                acting.current ||
                !window.confirm(
                  "Excluir esta empreitada, etapas, tarefas, diário, anotações e sessões? Esta ação não pode ser desfeita.",
                )
              )
                return;
              acting.current = true;
              setBusy(true);
              try {
                await application.commands.deleteLibraryEntry.execute({
                  id: entry.id,
                });
                void navigate("/colecao");
              } catch (failure) {
                setError(presentApplicationError(failure).message);
              } finally {
                acting.current = false;
                setBusy(false);
              }
            })();
          }}
        >
          Excluir empreitada
        </button>
      </details>
      {editor && (
        <WorkEditor
          target={editor}
          stages={plan.stages}
          tasks={plan.tasks}
          busy={busy}
          onSave={save}
          onClose={() => setEditor(undefined)}
        />
      )}
    </article>
  );
}
