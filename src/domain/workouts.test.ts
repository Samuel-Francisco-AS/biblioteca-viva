import { describe, expect, it } from "vitest";
import { createPhysicalActivity } from "./libraryEntries";
import {
  createDay,
  dayState,
  estimateCalories,
  groupText,
  isPlanned,
  plannedDayCount,
  workoutDaysSchema,
  workoutScheduleSchema,
} from "./workouts";
const entry = createPhysicalActivity({
  id: "training",
  title: "Treino fictício",
  category: "strength",
  exercises: [
    { name: "Supino", sets: 3, repetitions: 15 },
    { name: "Prancha", sets: 4, durationSeconds: 40 },
  ],
  createdAt: "2026-11-01T12:00:00.000Z",
});
const schedule = {
  start: "2026-11-01",
  end: "2026-11-30",
  weekdays: [1, 3, 5],
};
describe("ficha viva", () => {
  it("derives independent days with repetition/time bases and never changes the reusable plan", () => {
    const a = createDay(entry, "2026-11-04");
    a.movements[0].actual.push({ count: 1, target: 10 });
    a.movements[0].done = true;
    expect(groupText(a.movements[0].actual, "reps")).toBe("3 × 15 + 1 × 10");
    expect(createDay(entry, "2026-11-05").movements[0].actual).toEqual([
      { count: 3, target: 15 },
    ]);
    expect(entry.exercises?.[0].sets).toBe(3);
    expect(a.movements[1].unit).toBe("seconds");
  });
  it("counts schedule and elapsed adherence including boundaries without materializing the period", () => {
    expect(plannedDayCount(schedule)).toBe(13);
    expect(plannedDayCount(schedule, "2026-11-04")).toBe(2);
    expect(plannedDayCount(schedule, "2026-10-31")).toBe(0);
    expect(isPlanned(schedule, "2026-11-04")).toBe(true);
    expect(isPlanned(schedule, "2026-12-02")).toBe(false);
    expect(isPlanned(schedule, "2026-11-08")).toBe(false);
    expect(
      plannedDayCount({
        start: "0001-01-01",
        end: "9999-12-31",
        weekdays: [0, 1, 2, 3, 4, 5, 6],
      }),
    ).toBeGreaterThan(3000000);
  });
  it("distinguishes future, missed, off-plan, partial, less, more and mixed without rewarding volume", () => {
    const date = "2026-11-04";
    expect(dayState(undefined, true, "2026-11-05", date)).toBe("planned");
    expect(dayState(undefined, true, "2026-11-03", date)).toBe("missed");
    expect(dayState(undefined, false, date, date)).toBe("unplanned");
    const day = createDay(entry, date);
    day.movements[0].done = true;
    expect(dayState(day, true, date, date)).toBe("partial");
    day.movements[1].done = true;
    expect(dayState(day, true, date, date)).toBe("done");
    day.movements[0].actual = [{ count: 3, target: 10 }];
    expect(dayState(day, true, date, date)).toBe("less");
    day.movements[0].actual = [{ count: 4, target: 15 }];
    expect(dayState(day, true, date, date)).toBe("more");
    day.movements[1].actual = [{ count: 2, target: 40 }];
    expect(dayState(day, true, date, date)).toBe("mixed");
  });
  it("validates dates, unique days, ranges and unknown external keys", () => {
    expect(
      workoutScheduleSchema.safeParse({ ...schedule, end: "2026-10-31" })
        .success,
    ).toBe(false);
    expect(
      workoutScheduleSchema.safeParse({ ...schedule, weekdays: [] }).success,
    ).toBe(false);
    expect(
      workoutScheduleSchema.safeParse({ ...schedule, weekdays: [1, 1] })
        .success,
    ).toBe(false);
    const d = createDay(entry, "2026-11-04");
    expect(workoutDaysSchema.safeParse([d, d]).success).toBe(false);
    expect(workoutDaysSchema.safeParse([{ ...d, intensity: 11 }]).success).toBe(
      false,
    );
    expect(
      workoutDaysSchema.safeParse([{ ...d, unexpected: true }]).success,
    ).toBe(false);
  });
  it("estimates only with sufficient data, uses type/effort/weight/duration and rounds to tens", () => {
    expect(estimateCalories("strength", 30, 5, { weightKg: 70 })).toEqual({
      method: "met-v1",
      weightKg: 70,
      met: 3.5,
      kcal: 130,
    });
    expect(estimateCalories("strength", 30, 8, { weightKg: 70 })?.kcal).toBe(
      220,
    );
    expect(estimateCalories("cardio", 30, 8, { weightKg: 70 })?.met).toBe(7.3);
    expect(estimateCalories("resistance", 30, 5, { weightKg: 70 })?.met).toBe(
      5,
    );
    expect(
      estimateCalories("strength", undefined, 5, { weightKg: 70 }),
    ).toBeUndefined();
    expect(
      estimateCalories("strength", 30, undefined, { weightKg: 70 }),
    ).toBeUndefined();
    expect(estimateCalories("strength", 30, 5, undefined)).toBeUndefined();
    expect(estimateCalories("other", 30, 5, { weightKg: 70 })).toBeUndefined();
  });
});
