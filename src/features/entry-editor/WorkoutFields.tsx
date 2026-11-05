import { BVDatePicker } from "../../ui/BVPicker";
import { workoutTypes, weekLabels } from "./workoutFormModel";
import { useRef, useState } from "react";
import type { Exercise, PhysicalActivityEntry } from "../../domain";
import "../entry-detail/workout-folio.css";
export function WorkoutSetup({
  entry,
}: {
  readonly entry?: PhysicalActivityEntry;
}) {
  return (
    <>
      <input type="hidden" name="modality" value={entry?.modality ?? ""} />
      <input type="hidden" name="objective" value={entry?.objective ?? ""} />
      <fieldset className="workout-options">
        <legend>Tipo do treino</legend>
        {Object.entries(workoutTypes)
          .filter(([value]) =>
            ["strength", "resistance", "cardio", entry?.category].includes(
              value,
            ),
          )
          .map(([value, label]) => (
            <label key={value}>
              <input
                type="radio"
                name="category"
                value={value}
                defaultChecked={value === (entry?.category ?? "strength")}
                required
              />
              <span>{label}</span>
            </label>
          ))}
      </fieldset>
      <div className="ritual-pair">
        <label className="form-field">
          Data de início
          <BVDatePicker
            name="workoutStart"
            defaultValue={entry?.schedule?.start}
            required
          />
        </label>
        <label className="form-field">
          Data final
          <BVDatePicker
            name="workoutEnd"
            defaultValue={entry?.schedule?.end}
            required
          />
        </label>
      </div>
      <fieldset className="workout-options workout-week">
        <legend>Dias previstos</legend>
        {weekLabels.map((label, day) => (
          <label key={day}>
            <input
              type="checkbox"
              name="workoutWeekday"
              value={day}
              defaultChecked={entry?.schedule?.weekdays.includes(day)}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
    </>
  );
}
export function WorkoutFields({
  exercises = [],
}: {
  readonly exercises?: readonly Exercise[];
}) {
  const nextId = useRef(exercises.length);
  const [rows, setRows] = useState(() =>
    exercises.map((exercise, id) => ({
      id,
      exercise,
      unit: exercise.durationSeconds ? "seconds" : "reps",
    })),
  );
  function move(index: number, delta: number) {
    setRows((current) => {
      const copy = [...current];
      [copy[index], copy[index + delta]] = [copy[index + delta], copy[index]];
      return copy;
    });
  }
  return (
    <div className="workout-sheet">
      {rows.map(({ id, exercise, unit }, index) => (
        <fieldset className="exercise-leaf" key={id}>
          <legend>{String(index + 1).padStart(2, "0")} · Exercício</legend>
          <label className="form-field">
            Nome do exercício
            <input
              name="exerciseName"
              defaultValue={exercise.name}
              maxLength={160}
              required
            />
          </label>
          <fieldset className="workout-options">
            <legend>Meta</legend>
            {[
              ["reps", "Repetições"],
              ["seconds", "Tempo"],
            ].map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name={`goal-${id}`}
                  value={value}
                  checked={unit === value}
                  onChange={() =>
                    setRows((current) =>
                      current.map((r) =>
                        r.id === id ? { ...r, unit: value } : r,
                      ),
                    )
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>
          <input type="hidden" name="exerciseUnit" value={unit} />
          <div className="ritual-pair">
            <label className="form-field">
              Séries
              <input
                name="exerciseSets"
                type="number"
                min="1"
                max="100"
                defaultValue={exercise.sets ?? 3}
                required
              />
            </label>
            <label className="form-field">
              {unit === "seconds"
                ? "Segundos por série"
                : "Repetições por série"}
              <input
                name="exerciseTarget"
                type="number"
                min="1"
                max={unit === "seconds" ? 86400 : 10000}
                defaultValue={
                  exercise.durationSeconds ?? exercise.repetitions ?? 12
                }
                required
              />
            </label>
          </div>
          <input
            type="hidden"
            name="exerciseLoad"
            value={exercise.loadKg ?? ""}
          />
          <input
            type="hidden"
            name="exerciseNote"
            value={exercise.note ?? ""}
          />
          <div className="workout-row-actions">
            <button
              type="button"
              className="text-button"
              disabled={index === 0}
              onClick={() => move(index, -1)}
              aria-label={`Subir exercício ${index + 1}`}
            >
              ↑
            </button>
            <button
              type="button"
              className="text-button"
              disabled={index === rows.length - 1}
              onClick={() => move(index, 1)}
              aria-label={`Descer exercício ${index + 1}`}
            >
              ↓
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() =>
                setRows((current) => current.filter((r) => r.id !== id))
              }
            >
              Remover exercício {index + 1}
            </button>
          </div>
        </fieldset>
      ))}
      <button
        className="button button--secondary"
        type="button"
        disabled={rows.length >= 80}
        onClick={() =>
          setRows((current) => [
            ...current,
            { id: nextId.current++, exercise: { name: "" }, unit: "reps" },
          ])
        }
      >
        Adicionar exercício
      </button>
    </div>
  );
}
