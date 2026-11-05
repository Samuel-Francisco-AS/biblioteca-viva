import { InvalidFieldError } from "./errors";
import { z } from "zod";
import type {
  Exercise,
  PhysicalActivityEntry,
  PhysicalActivityCategory,
} from "./types";
import { exercisePlanSchema } from "./schemas";

export const workoutScheduleSchema = z
  .strictObject({
    start: z.iso.date(),
    end: z.iso.date(),
    weekdays: z
      .array(z.int().min(0).max(6))
      .min(1)
      .max(7)
      .refine((v) => new Set(v).size === v.length),
  })
  .refine((v) => v.end >= v.start, {
    message: "A data final deve ser igual ou posterior ao início.",
  });
export const physicalProfileSchema = z.strictObject({
  weightKg: z.number().finite().min(20).max(400).optional(),
  gender: z.enum(["male", "female", "other", "undisclosed"]).optional(),
  atlas: z.enum(["auto", "male", "female"]).optional(),
});
export const workoutEstimateSchema = z.strictObject({
  method: z.literal("met-v1"),
  weightKg: z.number().finite().min(20).max(400),
  met: z.number().positive().max(20),
  kcal: z.int().nonnegative(),
});
const groupSchema = z.strictObject({
  count: z.int().min(1).max(100),
  target: z.int().min(1).max(86400),
});
export const workoutMovementSchema = z.strictObject({
  name: z.string().trim().min(1).max(160),
  unit: z.enum(["reps", "seconds"]),
  base: z.array(groupSchema).min(1).max(100),
  actual: z.array(groupSchema).max(100),
  done: z.boolean(),
});
export const workoutDaySchema = z.strictObject({
  date: z.iso.date(),
  movements: z.array(workoutMovementSchema).min(1).max(80),
  durationMinutes: z.int().min(1).max(1440).optional(),
  intensity: z.int().min(1).max(10).optional(),
  note: z.string().trim().max(2000).optional(),
  estimate: workoutEstimateSchema.optional(),
  updatedAt: z.iso.datetime({ offset: false }),
});
export const workoutDaysSchema = z
  .array(workoutDaySchema)
  .max(20000)
  .refine((days) => new Set(days.map((d) => d.date)).size === days.length);
export type WorkoutSchedule = z.infer<typeof workoutScheduleSchema>;
export type WorkoutDay = z.infer<typeof workoutDaySchema>;
export type WorkoutMovement = z.infer<typeof workoutMovementSchema>;
export type PhysicalProfile = z.infer<typeof physicalProfileSchema>;
export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function isPlanned(schedule: WorkoutSchedule | undefined, date: string) {
  return Boolean(
    schedule &&
    date >= schedule.start &&
    date <= schedule.end &&
    schedule.weekdays.includes(new Date(`${date}T12:00:00Z`).getUTCDay()),
  );
}
export function createDay(
  entry: PhysicalActivityEntry,
  date: string,
): WorkoutDay {
  const movements = exercisePlanSchema
    .parse(entry.exercises ?? [])
    .map((e: Exercise) => {
      const base = [
        { count: e.sets ?? 1, target: e.durationSeconds ?? e.repetitions ?? 1 },
      ];
      return {
        name: e.name,
        unit: e.durationSeconds ? ("seconds" as const) : ("reps" as const),
        base,
        actual: base.map((g) => ({ ...g })),
        done: false,
      };
    });
  return { date, movements, updatedAt: entry.updatedAt };
}
export function groupText(
  groups: WorkoutMovement["base"],
  unit: WorkoutMovement["unit"],
) {
  return (
    groups
      .map((g) => `${g.count} × ${g.target}${unit === "seconds" ? "s" : ""}`)
      .join(" + ") || "—"
  );
}
export function estimateCalories(
  category: PhysicalActivityCategory,
  duration: number | undefined,
  intensity: number | undefined,
  profile: PhysicalProfile | undefined,
) {
  if (!duration || !intensity || !profile?.weightKg) return undefined;
  // Pragmatic perceived-effort bands inspired by the 2024 Adult Compendium; not a measured conversion of RPE to MET.
  const bands =
    category === "strength"
      ? [3, 3.5, 6]
      : category === "resistance"
        ? [3.5, 5, 7.5]
        : category === "cardio"
          ? [3.5, 5, 7.3]
          : undefined;
  if (!bands) return undefined;
  const met = bands[intensity <= 3 ? 0 : intensity <= 6 ? 1 : 2];
  return workoutEstimateSchema.parse({
    method: "met-v1",
    weightKg: profile.weightKg,
    met,
    kcal:
      Math.round((((met * 3.5 * profile.weightKg) / 200) * duration) / 10) * 10,
  });
}
export type DayState =
  | "unplanned"
  | "planned"
  | "missed"
  | "partial"
  | "done"
  | "less"
  | "more"
  | "mixed";
export function dayState(
  day: WorkoutDay | undefined,
  planned: boolean,
  date: string,
  today: string,
): DayState {
  if (
    day?.movements.some(
      (m) => m.done || JSON.stringify(m.actual) !== JSON.stringify(m.base),
    )
  ) {
    if (!day.movements.every((m) => m.done)) return "partial";
    const changes = day.movements.map((m) => {
      const sum = (g: WorkoutMovement["base"]) =>
        g.reduce((n, v) => n + v.count * v.target, 0);
      return Math.sign(sum(m.actual) - sum(m.base));
    });
    if (changes.includes(-1) && changes.includes(1)) return "mixed";
    return changes.includes(-1)
      ? "less"
      : changes.includes(1)
        ? "more"
        : "done";
  }
  return planned ? (date < today ? "missed" : "planned") : "unplanned";
}
export function plannedDayCount(
  schedule: WorkoutSchedule | undefined,
  through?: string,
) {
  if (!schedule) return 0;
  const end = through && through < schedule.end ? through : schedule.end;
  if (end < schedule.start) return 0;
  const first = new Date(`${schedule.start}T12:00:00Z`);
  const length =
    Math.floor(
      (new Date(`${end}T12:00:00Z`).getTime() - first.getTime()) / 86400000,
    ) + 1;
  const weeks = Math.floor(length / 7);
  let total = weeks * schedule.weekdays.length;
  for (let i = 0; i < length % 7; i++)
    if (schedule.weekdays.includes((first.getUTCDay() + i) % 7)) total++;
  return total;
}

export function validateWorkoutPlan(
  schedule: WorkoutSchedule | undefined,
  exercises: readonly Exercise[] | undefined,
) {
  if (!schedule) return;
  workoutScheduleSchema.parse(schedule);
  if (
    !exercises?.length ||
    exercises.some((e) => !e.sets || (!e.repetitions && !e.durationSeconds))
  )
    throw new InvalidFieldError(
      "exercises",
      "adicione exercícios com séries e repetições ou tempo",
    );
}
