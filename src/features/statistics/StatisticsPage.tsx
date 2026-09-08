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
type StatisticsCategory = keyof typeof categoryLabels;

interface ActivityPoint {
  readonly key: string;
  readonly label: string;
  readonly shortLabel: string;
  readonly value: number;
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function activityPoints(
  snapshot: StatisticsSnapshot,
  window: (typeof STATISTICS_WINDOWS)[number],
  category: StatisticsCategory | undefined,
): {
  readonly measure: "duration" | "events";
  readonly points: readonly ActivityPoint[];
} {
  const measure = category && category !== "session" ? "events" : "duration";
  const values = new Map<string, number>();
  const relevantItems = snapshot.timeline.filter(
    (item) =>
      measure === "events" ||
      (item.category === "session" && item.duration !== undefined),
  );
  const validDates = relevantItems
    .map((item) => new Date(item.occurredAt))
    .filter((date) => !Number.isNaN(date.getTime()));
  const today = startOfDay(new Date());
  const earliest =
    validDates.length > 0
      ? new Date(Math.min(...validDates.map((date) => date.getTime())))
      : today;
  const daySpan = Math.max(
    1,
    Math.round(
      (today.getTime() - startOfDay(earliest).getTime()) / 86_400_000,
    ) + 1,
  );
  const monthly = window === "all" && daySpan > 92;

  for (const item of relevantItems) {
    const date = new Date(item.occurredAt);
    if (Number.isNaN(date.getTime())) continue;
    const key = monthly ? monthKey(date) : dateKey(date);
    const amount = measure === "duration" ? (item.duration ?? 0) : 1;
    values.set(key, (values.get(key) ?? 0) + amount);
  }

  const points: ActivityPoint[] = [];
  if (monthly) {
    const cursor = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 1);
    while (cursor <= end) {
      const key = monthKey(cursor);
      points.push({
        key,
        label: cursor.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        }),
        shortLabel: cursor.toLocaleDateString("pt-BR", {
          month: "short",
          year: "2-digit",
        }),
        value: values.get(key) ?? 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  } else {
    const totalDays = window === "7d" ? 7 : window === "30d" ? 30 : daySpan;
    const cursor = new Date(today);
    cursor.setDate(cursor.getDate() - totalDays + 1);
    for (let index = 0; index < totalDays; index += 1) {
      const key = dateKey(cursor);
      points.push({
        key,
        label: cursor.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        shortLabel: cursor.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        value: values.get(key) ?? 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return { measure, points };
}

function ActivityChart({
  category,
  snapshot,
  window,
}: {
  readonly category: StatisticsCategory | undefined;
  readonly snapshot: StatisticsSnapshot;
  readonly window: (typeof STATISTICS_WINDOWS)[number];
}) {
  const [activePoint, setActivePoint] = useState<number>();
  const series = useMemo(
    () => activityPoints(snapshot, window, category),
    [category, snapshot, window],
  );
  const total = series.points.reduce((sum, point) => sum + point.value, 0);
  const maximum = Math.max(0, ...series.points.map((point) => point.value));
  const width = 640;
  const left = 28;
  const right = 612;
  const top = 18;
  // Mantém eixos e informação acima da área ocupada pelo dock flutuante.
  const bottom = 132;
  const coordinates = series.points.map((point, index) => ({
    x:
      series.points.length === 1
        ? (left + right) / 2
        : left + (index / (series.points.length - 1)) * (right - left),
    y:
      maximum === 0
        ? bottom
        : bottom - (point.value / maximum) * (bottom - top),
  }));
  const line = coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");
  const area =
    coordinates.length > 0
      ? `${line} L${coordinates.at(-1)?.x ?? right},${bottom} L${coordinates[0]?.x ?? left},${bottom} Z`
      : "";
  const active =
    activePoint === undefined ? undefined : series.points[activePoint];
  const activeCoordinate =
    activePoint === undefined ? undefined : coordinates[activePoint];
  const formatValue = (value: number) =>
    series.measure === "duration"
      ? formatSessionDuration(value)
      : `${value} evento${value === 1 ? "" : "s"}`;
  const summary =
    total === 0
      ? `Sem ${series.measure === "duration" ? "sessões concluídas" : "eventos"} no período.`
      : `${formatValue(total)} no total. ${series.points
          .filter((point) => point.value > 0)
          .map((point) => `${point.label}: ${formatValue(point.value)}`)
          .join("; ")}.`;

  return (
    <section
      className="statistics-chart"
      aria-labelledby="activity-chart-title"
    >
      <div className="statistics-chart__heading">
        <div>
          <p className="eyebrow">
            {series.measure === "duration"
              ? "Duração de sessões concluídas"
              : "Eventos da categoria"}
          </p>
          <h3 id="activity-chart-title">Atividade no período</h3>
        </div>
        <p className="statistics-chart__total">
          <strong>{formatValue(total)}</strong>
          <span>total</span>
        </p>
      </div>
      <p className="visually-hidden" id="activity-chart-summary">
        {summary}
      </p>
      <svg
        aria-describedby="activity-chart-summary"
        aria-label="Gráfico de atividade no período"
        className="statistics-chart__plot"
        role="img"
        viewBox={`0 0 ${width} 210`}
      >
        {[0, 0.5, 1].map((ratio) => (
          <line
            className="statistics-chart__grid"
            key={ratio}
            x1={left}
            x2={right}
            y1={top + ratio * (bottom - top)}
            y2={top + ratio * (bottom - top)}
          />
        ))}
        {maximum === 0 ? (
          <text
            className="statistics-chart__empty"
            x={width / 2}
            y={82}
            textAnchor="middle"
          >
            Nenhuma atividade neste período
          </text>
        ) : (
          <>
            <path className="statistics-chart__area" d={area} />
            <path className="statistics-chart__line" d={line} />
            {coordinates.map((coordinate, index) => {
              const point = series.points[index];
              if (!point || point.value === 0) return null;
              return (
                <circle
                  aria-label={`${point.label}: ${formatValue(point.value)}`}
                  className="statistics-chart__point"
                  cx={coordinate.x}
                  cy={coordinate.y}
                  key={point.key}
                  onBlur={() => setActivePoint(undefined)}
                  onClick={() =>
                    setActivePoint(activePoint === index ? undefined : index)
                  }
                  onFocus={() => setActivePoint(index)}
                  r={activePoint === index ? 7 : 5}
                  role="button"
                  tabIndex={0}
                />
              );
            })}
          </>
        )}
        {[
          0,
          Math.floor((series.points.length - 1) / 2),
          series.points.length - 1,
        ]
          .filter(
            (index, position, values) =>
              index >= 0 && values.indexOf(index) === position,
          )
          .map((index) => {
            const point = series.points[index];
            const coordinate = coordinates[index];
            return point && coordinate ? (
              <text
                className="statistics-chart__axis-label"
                key={point.key}
                x={coordinate.x}
                y={151}
                textAnchor="middle"
              >
                {point.shortLabel}
              </text>
            ) : null;
          })}
        {active && activeCoordinate && (
          <g className="statistics-chart__tooltip" aria-hidden="true">
            <rect
              height="34"
              rx="8"
              width="150"
              x={Math.max(4, Math.min(width - 154, activeCoordinate.x - 75))}
              y={Math.max(2, activeCoordinate.y - 44)}
            />
            <text
              x={Math.max(79, Math.min(width - 79, activeCoordinate.x))}
              y={Math.max(23, activeCoordinate.y - 22)}
              textAnchor="middle"
            >
              {formatValue(active.value)} · {active.shortLabel}
            </text>
          </g>
        )}
      </svg>
    </section>
  );
}

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
  const category = (Object.keys(categoryLabels) as StatisticsCategory[]).find(
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
          <h2 id="statistics-title">Resumo</h2>
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
      <fieldset className="collection-controls statistics-filters">
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
      <section className="statistics-overview" aria-labelledby="global-summary">
        <h3 id="global-summary">Resumo global</h3>
        <div className="statistics-metrics">
          <Metric label="Registros" value={snapshot.totalEntries} />
          <Metric label="Em andamento" value={snapshot.inProgress} />
          <Metric label="Concluídos" value={snapshot.completed} />
          <Metric label="Favoritos" value={snapshot.favorites} />
          <Metric label="Sessões" value={snapshot.sessions} />
          <Metric
            label="Tempo registrado"
            value={formatSessionDuration(snapshot.duration)}
          />
        </div>
      </section>
      <ActivityChart category={category} snapshot={snapshot} window={window} />
      <section
        className="statistics-type-summary"
        aria-labelledby="type-summary"
      >
        <h3 id="type-summary">Resumo por tipo</h3>
        <div className="statistics-types">
          {ENTRY_TYPES.map((type) => {
            const item = snapshot.byType[type];
            const hasData = item.entries > 0 || item.sessions > 0;
            return (
              <article
                className={`statistics-type${hasData ? " statistics-type--active" : " statistics-type--empty"}`}
                key={type}
              >
                <h4>{entryTypeLabels[type]}</h4>
                {hasData ? (
                  <p>
                    {item.entries} registro{item.entries === 1 ? "" : "s"}
                    {item.completed > 0
                      ? ` · ${item.completed} concluído${item.completed === 1 ? "" : "s"}`
                      : ""}
                    {item.sessions > 0
                      ? ` · ${item.sessions} ${item.sessions === 1 ? "sessão" : "sessões"}`
                      : ""}
                    {item.duration > 0
                      ? ` · ${formatSessionDuration(item.duration)}`
                      : ""}
                  </p>
                ) : (
                  <p>Sem registros ou sessões no período.</p>
                )}
                {type === "book" && item.pagesRegistered > 0 && (
                  <small>{item.pagesRegistered} páginas em sessões</small>
                )}
                {type === "series" && item.episodesRegistered > 0 && (
                  <small>{item.episodesRegistered} episódios em sessões</small>
                )}
                {type === "physical_activity" && item.distanceMeters > 0 && (
                  <small>
                    {(item.distanceMeters / 1000).toLocaleString("pt-BR")} km{" "}
                    registrados
                  </small>
                )}
                {type === "study" &&
                  Object.entries(item.progressByUnit).map(([unit, value]) => (
                    <small key={unit}>
                      {value} {unit} em sessões
                    </small>
                  ))}
              </article>
            );
          })}
        </div>
      </section>
      <section className="statistics-ledger" aria-label="Sessões e histórico">
        <section aria-labelledby="recent-sessions">
          <h3 id="recent-sessions">Sessões recentes</h3>
          {snapshot.recentSessions.length === 0 ? (
            <p className="statistics-empty">
              Nenhuma sessão concluída no período.
            </p>
          ) : (
            <ul className="statistics-compact-list">
              {snapshot.recentSessions.map((session) => (
                <li key={session.id}>
                  <Link
                    to={`/registros/${encodeURIComponent(session.entryId)}`}
                  >
                    {entryById.get(session.entryId)?.title ??
                      "Registro removido"}
                  </Link>
                  <small>
                    {entryTypeLabels[session.entryType]} ·{" "}
                    {formatSessionDuration(session.accumulatedDuration)} ·{" "}
                    {new Date(
                      session.endedAt ?? session.startedAt,
                    ).toLocaleDateString("pt-BR")}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section aria-labelledby="timeline-title">
          <h3 id="timeline-title">Histórico</h3>
          {snapshot.timeline.length === 0 ? (
            <p className="statistics-empty">Nenhuma atividade no período.</p>
          ) : (
            <ol className="statistics-compact-list timeline">
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
