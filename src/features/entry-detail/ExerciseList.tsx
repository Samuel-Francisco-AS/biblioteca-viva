import type { Exercise } from "../../domain";
export function ExerciseList({
  exercises,
}: {
  readonly exercises: readonly Exercise[];
}) {
  return (
    <ol className="exercise-list">
      {exercises.map((exercise, index) => (
        <li key={index}>
          <strong>{exercise.name}</strong>
          <span>
            {[
              exercise.sets !== undefined
                ? `${exercise.sets} séries`
                : undefined,
              exercise.repetitions !== undefined
                ? `${exercise.repetitions} repetições`
                : undefined,
              exercise.loadKg !== undefined
                ? `${exercise.loadKg} kg`
                : undefined,
              exercise.durationSeconds !== undefined
                ? `${exercise.durationSeconds} s`
                : undefined,
            ]
              .filter(Boolean)
              .join(" · ") || "No seu ritmo"}
          </span>
          {exercise.note && <p>{exercise.note}</p>}
        </li>
      ))}
    </ol>
  );
}
