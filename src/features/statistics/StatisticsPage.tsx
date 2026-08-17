import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { ENTRY_TYPES, type LibraryEntry } from "../../domain";
import { STATISTICS_WINDOWS, type StatisticsSnapshot } from "../../application";
import { entryTypeLabels } from "../collection/collectionControls";
import { presentApplicationError } from "../entry-editor/errorMessages";
import { formatSessionDuration } from "../sessions/sessionPresentation";

export interface StatisticsApplication {
  readonly queries: {
    readonly getStatistics: {
      execute(input?: unknown): Promise<StatisticsSnapshot>;
    };
    readonly listLibraryEntries: {
      execute(): Promise<readonly LibraryEntry[]>;
    };
  };
}

const windowLabels = {
  "7d": "7 dias",
  "30d": "30 dias",
  all: "Todo o período",
} as const;
const categoryLabels = {
  entry: "Registros",
  progress: "Progresso",
  annotation: "Anotações",
  session: "Sessões",
} as const;

export function StatisticsPage({
  application,
}: {
  readonly application?: StatisticsApplication;
}) {
  const [params, setParams] = useSearchParams();
  const [snapshot, setSnapshot] = useState<StatisticsSnapshot>();
  const [entries, setEntries] = useState<readonly LibraryEntry[]>([]);
  const [error, setError] = useState<string>();
  const window =
    STATISTICS_WINDOWS.find((value) => value === params.get("window")) ?? "30d";
  const entryType = ENTRY_TYPES.find((value) => value === params.get("type"));
  const category = Object.keys(categoryLabels).find(
    (value) => value === params.get("category"),
  );
  useEffect(() => {
    if (!application) return;
    let active = true;
    void Promise.all([
      application.queries.getStatistics.execute({
        window,
        ...(entryType && { entryType }),
        ...(category && { category }),
      }),
      application.queries.listLibraryEntries.execute(),
    ]).then(
      ([loaded, loadedEntries]) => {
        if (active) {
          setSnapshot(loaded);
          setEntries(loadedEntries);
        }
      },
      (failure: unknown) =>
        active && setError(presentApplicationError(failure).message),
    );
    return () => {
      active = false;
    };
  }, [application, category, entryType, window]);
  const entryById = useMemo(
    () => new Map(entries.map((entry) => [entry.id, entry])),
    [entries],
  );
  function update(name: string, value: string) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (!value || value === "all") next.delete(name);
        else next.set(name, value);
        return next;
      },
      { replace: true },
    );
  }
  if (!application)
    return (
      <section className="content-card" role="alert">
        <h2>Estatísticas indisponíveis</h2>
        <p>Não foi possível iniciar o armazenamento local.</p>
      </section>
    );
  if (error)
    return (
      <section className="content-card" role="alert">
        <h2>Não foi possível calcular as estatísticas</h2>
        <p>{error}</p>
      </section>
    );
  if (!snapshot) return <p role="status">Calculando estatísticas…</p>;
  return (
    <section aria-labelledby="statistics-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Memória derivada dos seus registros</p>
          <h2 id="statistics-title">Estatísticas</h2>
        </div>
      </div>
      {snapshot.activeSession && (
        <section className="content-card" aria-labelledby="active-stat-session">
          <h3 id="active-stat-session">Sessão em andamento</h3>
          <p>
            {entryById.get(snapshot.activeSession.entryId)?.title ??
              "Registro removido"}
          </p>
          <Link
            className="text-link"
            to={`/registros/${encodeURIComponent(snapshot.activeSession.entryId)}`}
          >
            Abrir controles
          </Link>
        </section>
      )}
      <fieldset className="collection-controls">
        <legend>Filtros</legend>
        <label className="form-field">
          Período
          <select
            value={window}
            onChange={(event) => update("window", event.target.value)}
          >
            {STATISTICS_WINDOWS.map((value) => (
              <option key={value} value={value}>
                {windowLabels[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          Tipo de registro
          <select
            value={entryType ?? "all"}
            onChange={(event) => update("type", event.target.value)}
          >
            <option value="all">Todos</option>
            {ENTRY_TYPES.map((type) => (
              <option key={type} value={type}>
                {entryTypeLabels[type]}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          Categoria da timeline
          <select
            value={category ?? "all"}
            onChange={(event) => update("category", event.target.value)}
          >
            <option value="all">Todas</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </fieldset>
      <section className="statistics-grid" aria-labelledby="global-summary">
        <h3 id="global-summary">Resumo global</h3>
        <Metric label="Registros" value={snapshot.totalEntries} />
        <Metric label="Em andamento" value={snapshot.inProgress} />
        <Metric label="Concluídos" value={snapshot.completed} />
        <Metric label="Favoritos" value={snapshot.favorites} />
        <Metric label="Sessões concluídas" value={snapshot.sessions} />
        <Metric
          label="Tempo registrado"
          value={formatSessionDuration(snapshot.duration)}
        />
      </section>
      <section aria-labelledby="type-summary">
        <h3 id="type-summary">Resumo por tipo</h3>
        <div className="statistics-types">
          {ENTRY_TYPES.map((type) => {
            const item = snapshot.byType[type];
            return (
              <article className="content-card" key={type}>
                <h4>{entryTypeLabels[type]}</h4>
                <p>
                  {item.entries} registros · {item.completed} concluídos
                </p>
                <p>
                  {item.sessions} sessões ·{" "}
                  {formatSessionDuration(item.duration)}
                </p>
                {type === "book" && item.pagesRegistered > 0 && (
                  <p>{item.pagesRegistered} páginas registradas em sessões</p>
                )}
                {type === "series" && item.episodesRegistered > 0 && (
                  <p>
                    {item.episodesRegistered} episódios registrados em sessões
                  </p>
                )}
                {type === "physical_activity" && item.distanceMeters > 0 && (
                  <p>
                    {(item.distanceMeters / 1000).toLocaleString("pt-BR")} km
                    explicitamente registrados
                  </p>
                )}
                {type === "study" &&
                  Object.entries(item.progressByUnit).map(([unit, value]) => (
                    <p key={unit}>
                      {value} {unit} registrados em sessões
                    </p>
                  ))}
              </article>
            );
          })}
        </div>
      </section>
      <section className="content-card" aria-labelledby="recent-sessions">
        <h3 id="recent-sessions">Sessões recentes</h3>
        {snapshot.recentSessions.length === 0 ? (
          <p>Nenhuma sessão concluída no período.</p>
        ) : (
          <ul>
            {snapshot.recentSessions.map((session) => (
              <li key={session.id}>
                <Link
                  className="text-link"
                  to={`/registros/${encodeURIComponent(session.entryId)}`}
                >
                  {entryById.get(session.entryId)?.title ?? "Registro removido"}
                </Link>{" "}
                · {entryTypeLabels[session.entryType]} ·{" "}
                {formatSessionDuration(session.accumulatedDuration)} ·{" "}
                {new Date(
                  session.endedAt ?? session.startedAt,
                ).toLocaleDateString("pt-BR")}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="content-card" aria-labelledby="timeline-title">
        <h3 id="timeline-title">Histórico</h3>
        {snapshot.timeline.length === 0 ? (
          <p>Nenhuma atividade no período.</p>
        ) : (
          <ol className="timeline">
            {snapshot.timeline.map((item) => (
              <li key={item.id}>
                <time dateTime={item.occurredAt}>
                  {new Date(item.occurredAt).toLocaleString("pt-BR")}
                </time>
                <p>
                  <strong>{timelineLabel(item.kind)}</strong> ·{" "}
                  {entryById.get(item.entryId)?.title ?? "Registro removido"}
                  {item.duration !== undefined
                    ? ` · ${formatSessionDuration(item.duration)}`
                    : ""}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  readonly label: string;
  readonly value: number | string;
}) {
  return (
    <p>
      <strong>{value}</strong>
      <span>{label}</span>
    </p>
  );
}

function timelineLabel(
  kind: StatisticsSnapshot["timeline"][number]["kind"],
): string {
  switch (kind) {
    case "session":
    case "session_completed":
      return "Sessão concluída";
    case "session_started":
      return "Sessão iniciada";
    case "progress_updated":
      return "Progresso atualizado";
    case "status_changed":
      return "Status alterado";
    case "note_added":
      return "Nota adicionada";
    case "quote_added":
      return "Citação adicionada";
    case "entry_created":
    case "book_created":
      return "Registro criado";
    case "entry_updated":
    case "book_updated":
      return "Registro atualizado";
  }
}
