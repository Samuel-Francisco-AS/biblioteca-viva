import { useState } from "react";
import {
  dayState,
  isPlanned,
  plannedDayCount,
  type DayState,
} from "../../domain/workouts";
import type { PhysicalActivityEntry } from "../../domain";
const dayLabels: Record<DayState, string> = {
  unplanned: "Livre",
  planned: "Previsto",
  missed: "Não realizado",
  partial: "Parcial",
  done: "Realizado",
  less: "Menos que a base",
  more: "Mais que a base",
  mixed: "Adaptação mista",
};
const symbols: Record<DayState, string> = {
  unplanned: "·",
  planned: "○",
  missed: "—",
  partial: "◐",
  done: "✓",
  less: "↓",
  more: "↑",
  mixed: "↕",
};
export function WorkoutChart({
  entry,
  today,
  selected,
  onSelect,
}: {
  readonly entry: PhysicalActivityEntry;
  readonly today: string;
  readonly selected: string;
  readonly onSelect: (date: string) => void;
}) {
  const [month, setMonth] = useState(selected.slice(0, 7));
  const days = new Map(entry.workoutDays?.map((d) => [d.date, d]));
  const planned = plannedDayCount(entry.schedule);
  const elapsed = plannedDayCount(entry.schedule, today);
  const completed = [...days.values()].filter(
    (d) =>
      d.date <= today &&
      isPlanned(entry.schedule, d.date) &&
      d.movements.every((m) => m.done),
  );
  const first = new Date(`${month}-01T12:00:00Z`);
  const count = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0, 12),
  ).getUTCDate();
  function shift(delta: number) {
    const d = new Date(first);
    d.setUTCMonth(d.getUTCMonth() + delta);
    setMonth(d.toISOString().slice(0, 7));
  }
  return (
    <section className="workout-chart" aria-labelledby="workout-chart-title">
      <div className="workout-section-heading">
        <div>
          <p className="workout-eyebrow">II · Ritmo & presença</p>
          <h3 id="workout-chart-title">O desenho da sua constância</h3>
        </div>
        <span className="workout-chart-seal" aria-hidden="true">
          ✧
        </span>
      </div>
      <dl className="workout-summary">
        <div>
          <dt>Previstos no período</dt>
          <dd>{planned}</dd>
        </div>
        <div>
          <dt>Realizados no plano</dt>
          <dd>{completed.length}</dd>
        </div>
        <div>
          <dt>Aderência até hoje</dt>
          <dd>
            {elapsed
              ? `${Math.round((completed.length / elapsed) * 100)}%`
              : "—"}
          </dd>
        </div>
      </dl>
      <div className="workout-month">
        <button
          type="button"
          onClick={() => shift(-1)}
          aria-label="Mês anterior"
        >
          ←
        </button>
        <h4>
          {first.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          })}
        </h4>
        <button type="button" onClick={() => shift(1)} aria-label="Próximo mês">
          →
        </button>
      </div>
      <div className="workout-calendar" aria-label="Calendário de frequência">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <span className="workout-week-header" key={`w${i}`}>
            {d}
          </span>
        ))}
        {Array.from({ length: first.getUTCDay() }, (_, i) => (
          <span key={`e${i}`} />
        ))}
        {Array.from({ length: count }, (_, i) => {
          const date = `${month}-${String(i + 1).padStart(2, "0")}`;
          const planned = isPlanned(entry.schedule, date);
          const state = dayState(days.get(date), planned, date, today);
          return (
            <button
              type="button"
              key={date}
              data-state={state}
              data-planned={planned}
              aria-pressed={selected === date}
              aria-label={`${date}: ${dayLabels[state]}${planned ? ", no plano" : ""}`}
              onClick={() => onSelect(date)}
            >
              <span>{i + 1}</span>
              <strong aria-hidden="true">{symbols[state]}</strong>
            </button>
          );
        })}
      </div>
      <div className="workout-legend">
        {(
          [
            "planned",
            "done",
            "missed",
            "partial",
            "less",
            "more",
            "mixed",
          ] as const
        ).map((s) => (
          <span key={s}>
            <b data-state={s}>{symbols[s]}</b>
            {dayLabels[s]}
          </span>
        ))}
      </div>
      <p className="workout-chart-note">
        Contorno: dia previsto. As setas registram volume, sem julgamento.
      </p>
      {!entry.schedule && <p>Edite o treino para definir seu calendário.</p>}
    </section>
  );
}
