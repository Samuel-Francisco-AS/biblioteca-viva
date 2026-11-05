import { BVDatePicker } from "../../ui/BVPicker";
import { ApplicationError } from "../../application";
import { useAppResume } from "../../app/useAppResume";
import { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type {
  LibraryEntry,
  Note,
  Quote,
  PhysicalActivityEntry,
} from "../../domain";
import { getAllowedStatusTransitions } from "../../domain";
import {
  createDay,
  groupText,
  isPlanned,
  localDay,
  type WorkoutDay,
  type WorkoutMovement,
} from "../../domain/workouts";
import type { PhysicalProfilePort } from "../../application/workouts";
import { statusLabels } from "../books/bookPresentation";
import { workoutTypes } from "../entry-editor/workoutFormModel";
import { OrganizationPanel } from "../tags/OrganizationPanel";
import { SessionPanel } from "../sessions/SessionPanel";
import { RecordMemories } from "./RecordMemories";
import type { EntryDetailApplication } from "./EntryDetailPage";
import { WorkoutChart } from "./WorkoutChart";
import { BodyStudy } from "./BodyStudy";
import { useStudyDraftGuard } from "./useStudyDraftGuard";
import { presentApplicationError } from "../entry-editor/errorMessages";
import "./workout-folio.css";
export interface WorkoutApplication {
  readonly physicalProfile?: PhysicalProfilePort;
  readonly commands: {
    readonly saveWorkoutDay?: {
      execute(input: unknown): Promise<PhysicalActivityEntry>;
    };
  };
}
function ExerciseExecution({
  movement,
  index,
  onChange,
}: {
  readonly movement: WorkoutMovement;
  readonly index: number;
  readonly onChange: (next: WorkoutMovement) => void;
}) {
  return (
    <li className="workout-movement" data-done={movement.done}>
      <div className="workout-movement-heading">
        <span className="workout-index" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          <h4>{movement.name}</h4>
          <p>Base · {groupText(movement.base, movement.unit)}</p>
        </div>
        <label className="workout-check">
          <input
            type="checkbox"
            checked={movement.done}
            onChange={(e) => onChange({ ...movement, done: e.target.checked })}
          />
          <span>{movement.done ? "Feito" : "Marcar"}</span>
        </label>
      </div>
      <div className="workout-actual">
        {movement.actual.map((group, i) => (
          <div className="workout-set" key={i}>
            <label>
              Séries
              <input
                type="number"
                min="1"
                max="100"
                required
                value={group.count}
                onChange={(e) =>
                  onChange({
                    ...movement,
                    actual: movement.actual.map((g, n) =>
                      n === i ? { ...g, count: Number(e.target.value) } : g,
                    ),
                  })
                }
              />
            </label>
            <span aria-hidden="true">×</span>
            <label>
              {movement.unit === "seconds" ? "Segundos" : "Repetições"}
              <input
                type="number"
                min="1"
                max="86400"
                required
                value={group.target}
                onChange={(e) =>
                  onChange({
                    ...movement,
                    actual: movement.actual.map((g, n) =>
                      n === i ? { ...g, target: Number(e.target.value) } : g,
                    ),
                  })
                }
              />
            </label>
            <button
              type="button"
              aria-label={`Remover grupo ${i + 1} de ${movement.name}`}
              onClick={() =>
                onChange({
                  ...movement,
                  actual: movement.actual.filter((_, n) => n !== i),
                  done: false,
                })
              }
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-button"
          disabled={movement.actual.length >= 100}
          onClick={() =>
            onChange({
              ...movement,
              actual: [
                ...movement.actual,
                { count: 1, target: movement.base[0].target },
              ],
            })
          }
        >
          + Série diferente
        </button>
      </div>
    </li>
  );
}
export function WorkoutDetailPage({
  application,
  entry,
  notes,
  quotes,
  returnPath,
  onChange,
}: {
  readonly application: EntryDetailApplication;
  readonly entry: PhysicalActivityEntry;
  readonly notes: readonly Note[];
  readonly quotes: readonly Quote[];
  readonly returnPath: string;
  readonly onChange: (entry: LibraryEntry) => void;
}) {
  const [today, setToday] = useState(localDay);
  const navigate = useNavigate();
  const root = useRef<HTMLElement>(null);
  const acting = useRef(false);
  const [date, setDate] = useState(today);
  const [draft, setDraft] = useState<WorkoutDay>();
  const draftRevision = useRef(entry.revision);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const refresh = useCallback(() => {
    const nextToday = localDay();
    if (!draft && date === today) setDate(nextToday);
    setToday(nextToday);
    void application.queries.getLibraryEntry
      .execute({ id: entry.id })
      .then(onChange, () => setError("Não foi possível reconsultar o treino."));
  }, [application, entry.id, onChange, date, today, draft]);
  useAppResume(refresh);
  const stored = entry.workoutDays?.find((d) => d.date === date);
  const day = draft ?? stored ?? createDay(entry, date);
  const future = date > today;
  useStudyDraftGuard(
    root,
    "Há uma execução não salva. Sair e descartar o rascunho?",
  );
  function select(value: string) {
    if (acting.current) return;
    if (draft && !window.confirm("Descartar alterações não salvas deste dia?"))
      return;
    setDate(value);
    setDraft(undefined);
    setMessage("");
    setError("");
  }
  function edit(next: WorkoutDay) {
    if (!draft) draftRevision.current = entry.revision;
    setDraft(next);
    setMessage("");
  }
  async function act(operation: () => Promise<unknown>, success: string) {
    if (acting.current) return;
    acting.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await operation();
      setMessage(success);
    } catch (failure) {
      setError(
        failure instanceof ApplicationError &&
          failure.context.operation === "workout_conflict"
          ? "O treino mudou em outra tela. Reconsulte antes de salvar; seu rascunho continua aqui."
          : presentApplicationError(failure).message,
      );
    } finally {
      acting.current = false;
      setBusy(false);
    }
  }
  async function save(value: WorkoutDay | null) {
    await act(
      async () => {
        const command = application.commands.saveWorkoutDay;
        if (!command) throw new Error("unavailable");
        const updated = await command.execute({
          entryId: entry.id,
          revision: draft ? draftRevision.current : entry.revision,
          date,
          day: value,
        });
        onChange(updated);
        setDraft(undefined);
      },
      value ? "Execução salva." : "Execução do dia limpa.",
    );
  }
  return (
    <article
      className="workout-folio"
      ref={root}
      data-has-record-draft={draft ? "true" : undefined}
      aria-labelledby="workout-title"
    >
      <nav className="workout-navigation">
        <Link to={returnPath}>
          {returnPath.startsWith("/arquivo")
            ? "Voltar ao Arquivo"
            : returnPath.startsWith("/colecao")
              ? "Voltar à Coleção"
              : "Voltar à Biblioteca"}
        </Link>
        <span>Corpo · Códice Iluminado</span>
      </nav>
      <header className="workout-identity">
        <div>
          <p className="workout-eyebrow">
            {workoutTypes[entry.category]} · {statusLabels[entry.status]}
          </p>
          <h2 id="workout-title">{entry.title}</h2>
          <p>
            {entry.schedule
              ? `${entry.schedule.start.split("-").reverse().join("/")} — ${entry.schedule.end.split("-").reverse().join("/")}`
              : "Período ainda não definido"}
          </p>
        </div>
        <Link
          className="text-link"
          to={`/registros/${encodeURIComponent(entry.id)}/editar?from=${encodeURIComponent(returnPath)}`}
        >
          Editar treino ↗
        </Link>
      </header>
      {error && (
        <div className="workout-error" role="alert">
          <p>{error}</p>
          <button
            className="text-button"
            type="button"
            disabled={busy}
            onClick={() => {
              if (
                draft &&
                !window.confirm(
                  "Reconsultar descarta as alterações não salvas. Continuar?",
                )
              )
                return;
              void act(async () => {
                onChange(
                  await application.queries.getLibraryEntry.execute({
                    id: entry.id,
                  }),
                );
                setDraft(undefined);
              }, "Treino consultado.");
            }}
          >
            Reconsultar treino
          </button>
        </div>
      )}
      <p className="workout-feedback" role="status">
        {message}
      </p>
      <section className="workout-daily" aria-labelledby="workout-daily-title">
        <div className="workout-section-heading">
          <div>
            <p className="workout-eyebrow">I · A ficha viva</p>
            <h3 id="workout-daily-title">Treino do dia</h3>
          </div>
          <label className="form-field">
            Dia
            <BVDatePicker
              required
              value={date}
              disabled={busy}
              onChange={(e) => e.target.value && select(e.target.value)}
            />
          </label>
        </div>
        <div className="workout-day-status">
          <span>
            {isPlanned(entry.schedule, date)
              ? "○ Previsto no plano"
              : "· Fora do plano"}
          </span>
          <button
            className="text-button"
            type="button"
            onClick={() => select(today)}
          >
            Hoje
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save(day);
          }}
        >
          <fieldset
            disabled={busy || future || !application.commands.saveWorkoutDay}
            className="workout-execution-fields"
          >
            <ol className="workout-movements">
              {day.movements.map((m, i) => (
                <ExerciseExecution
                  key={`${date}-${i}`}
                  movement={m}
                  index={i}
                  onChange={(next) =>
                    edit({
                      ...day,
                      movements: day.movements.map((v, n) =>
                        n === i ? next : v,
                      ),
                    })
                  }
                />
              ))}
            </ol>
            {!day.movements.length && (
              <p>
                Adicione exercícios em “Editar treino” para montar sua
                ficha-base.
              </p>
            )}
            <div className="workout-session-measures">
              <label className="form-field">
                Duração (min)
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={day.durationMinutes ?? ""}
                  onChange={(e) =>
                    edit({
                      ...day,
                      durationMinutes: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
              </label>
              <label className="form-field">
                Intensidade percebida (1–10)
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={day.intensity ?? ""}
                  onChange={(e) =>
                    edit({
                      ...day,
                      intensity: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
              </label>
            </div>
            <div className="workout-daily-actions">
              <button
                className="button"
                type="submit"
                disabled={!day.movements.length}
              >
                Salvar execução
              </button>
              <button
                className="button button--secondary"
                type="button"
                disabled={!day.movements.length}
                onClick={() => {
                  const next = {
                    ...day,
                    movements: day.movements.map((m) => ({ ...m, done: true })),
                  };
                  edit(next);
                }}
              >
                Marcar treino inteiro
              </button>
              <button
                className="text-button"
                type="button"
                disabled={!stored && !draft}
                onClick={() => {
                  if (
                    window.confirm(
                      "Limpar a execução deste dia? A ficha-base será preservada.",
                    )
                  )
                    void save(null);
                }}
              >
                Limpar dia
              </button>
            </div>
          </fieldset>
        </form>
        {future && (
          <p>
            Dia futuro · a ficha estará disponível para registrar a execução até
            essa data.
          </p>
        )}
        {draft && (
          <p className="workout-unsaved" role="status">
            Alterações não salvas
          </p>
        )}
      </section>
      <WorkoutChart
        key={date.slice(0, 7)}
        entry={entry}
        today={today}
        selected={date}
        onSelect={select}
      />
      <section
        className="workout-metabolic"
        aria-labelledby="workout-metabolic-title"
      >
        <div className="workout-metabolic-heading">
          <p className="workout-eyebrow">III · Atlas do movimento</p>
          <h3 id="workout-metabolic-title">O corpo em percurso</h3>
        </div>
        <BodyStudy />
        <div>
          <p className="workout-calories">
            {stored?.estimate ? (
              <>
                ≈ {stored.estimate.kcal === 0 ? "< 10" : stored.estimate.kcal}
                <span>kcal estimadas</span>
              </>
            ) : (
              <>
                —<span>Sem estimativa neste dia</span>
              </>
            )}
          </p>
          <dl>
            <div>
              <dt>Duração</dt>
              <dd>
                {stored?.durationMinutes
                  ? `${stored.durationMinutes} min`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Intensidade percebida</dt>
              <dd>{stored?.intensity ? `${stored.intensity}/10` : "—"}</dd>
            </div>
          </dl>
          <p className="workout-metabolic-note">
            Estimativa aproximada por MET. Requer peso, duração e intensidade;
            pode diferir bastante do gasto real.
          </p>
          <Link to="/configuracoes">Editar perfil físico ↗</Link>
        </div>
      </section>
      <details className="workout-secondary">
        <summary>Observações do corpo</summary>
        <label className="form-field">
          Nota deste dia
          <textarea
            maxLength={2000}
            rows={3}
            value={day.note ?? ""}
            disabled={busy || future}
            onChange={(e) => edit({ ...day, note: e.target.value })}
          />
        </label>
        <button
          type="button"
          className="button button--secondary"
          disabled={busy || future || !day.movements.length}
          onClick={() => void save(day)}
        >
          Salvar nota e execução
        </button>
        {(notes.length > 0 || quotes.length > 0) && (
          <RecordMemories
            application={application}
            entry={entry}
            initialNotes={notes}
            initialQuotes={quotes}
          />
        )}
      </details>
      <details className="workout-secondary">
        <summary>Organização</summary>
        <OrganizationPanel
          application={application}
          entry={entry}
          onChange={onChange}
        />
        <div className="form-actions">
          {getAllowedStatusTransitions(entry.status).map((status) => (
            <button
              className="text-button"
              type="button"
              key={status}
              disabled={busy}
              onClick={() =>
                void act(
                  async () =>
                    onChange(
                      await application.commands.changeLibraryEntryStatus.execute(
                        { id: entry.id, status },
                      ),
                    ),
                  "Estado atualizado.",
                )
              }
            >
              {statusLabels[status]}
            </button>
          ))}
        </div>
      </details>
      <details className="workout-secondary">
        <summary>Sessões anteriores</summary>
        <SessionPanel application={application} entry={entry} historyOnly />
      </details>
      <details className="workout-secondary workout-care">
        <summary>Cuidar deste registro</summary>
        <p>
          Excluir remove este treino, execuções, notas e sessões vinculadas.
        </p>
        <button
          type="button"
          className="button button--danger"
          disabled={busy}
          onClick={() => {
            if (
              window.confirm(
                "Excluir este treino e todo o histórico vinculado? Esta ação não pode ser desfeita.",
              )
            )
              void act(async () => {
                await application.commands.deleteLibraryEntry.execute({
                  id: entry.id,
                });
                setDraft(undefined);
                void navigate(returnPath);
              }, "");
          }}
        >
          Excluir registro
        </button>
      </details>
    </article>
  );
}
