import { useRef, useState } from "react";
import type { Exercise } from "../../domain";

export function WorkoutFields({
  exercises = [],
}: {
  readonly exercises?: readonly Exercise[];
}) {
  const nextId = useRef(exercises.length);
  const [rows, setRows] = useState(() =>
    exercises.map((exercise, id) => ({ id, exercise })),
  );
  return (
    <div className="workout-sheet">
      <p className="field-help">
        Sua ficha fica pronta para repetir. Cada execução guarda uma cópia dos
        exercícios, mesmo que você mude o treino depois.
      </p>
      {rows.map(({ id, exercise }, index) => (
        <fieldset className="exercise-leaf" key={id}>
          <legend>
            <span aria-hidden="true">✦</span> Movimento {String(index + 1).padStart(2, "0")}
          </legend>
          <label className="form-field">
            Nome do exercício
            <input
              name="exerciseName"
              defaultValue={exercise.name}
              maxLength={160}
              required
            />
          </label>
          <div className="exercise-measures">
            <label className="form-field">
              Séries
              <input
                name="exerciseSets"
                type="number"
                min="1"
                max="100"
                defaultValue={exercise.sets}
              />
            </label>
            <label className="form-field">
              Repetições
              <input
                name="exerciseRepetitions"
                type="number"
                min="1"
                max="10000"
                defaultValue={exercise.repetitions}
              />
            </label>
            <label className="form-field">
              Carga (kg)
              <input
                name="exerciseLoad"
                type="number"
                min="0"
                max="10000"
                step="0.25"
                defaultValue={exercise.loadKg}
              />
            </label>
            <label className="form-field">
              Tempo (segundos)
              <input
                name="exerciseTime"
                type="number"
                min="1"
                max="86400"
                defaultValue={exercise.durationSeconds}
              />
            </label>
          </div>
          <label className="form-field">
            Observação do exercício
            <input
              name="exerciseNote"
              defaultValue={exercise.note}
              maxLength={2000}
            />
          </label>
          <button
            className="text-button"
            type="button"
            onClick={() => setRows(rows.filter((row) => row.id !== id))}
          >
            Remover exercício {index + 1}
          </button>
        </fieldset>
      ))}
      <button
        className="button button--secondary"
        type="button"
        disabled={rows.length >= 80}
        onClick={() =>
          setRows([...rows, { id: nextId.current++, exercise: { name: "" } }])
        }
      >
        Adicionar exercício
      </button>
    </div>
  );
}
