import { expect, it } from "vitest";
import { atlasPose, atlasVariant, defaultAtlasMotion } from "./atlasMotion";
import { estimateCalories, physicalProfileSchema } from "../../domain/workouts";
it("resolves independent voluntary presentation, preserves weight-only profiles and never changes MET by gender or atlas", () => {
  expect(atlasVariant()).toBe("male");
  for (const gender of ["male", "female", "other", "undisclosed"] as const) {
    const p = physicalProfileSchema.parse({
      weightKg: 70,
      gender,
      atlas: "auto",
    });
    expect(atlasVariant(p)).toBe(gender === "female" ? "female" : "male");
    expect(atlasVariant({ ...p, atlas: "male" })).toBe("male");
    expect(atlasVariant({ ...p, atlas: "female" })).toBe("female");
    expect(estimateCalories("strength", 30, 5, p)).toEqual(
      estimateCalories("strength", 30, 5, { weightKg: 70 }),
    );
  }
  expect(
    estimateCalories("strength", 30, 5, { gender: "female" }),
  ).toBeUndefined();
  expect(physicalProfileSchema.parse({ weightKg: 70 })).toEqual({
    weightKg: 70,
  });
  expect(physicalProfileSchema.safeParse({ gender: "unknown" }).success).toBe(
    false,
  );
});
it("articulates distinct hip/knee/shoulder/elbow poses for the same choreography on both variants", () => {
  expect(defaultAtlasMotion("strength")).toBe("squat");
  expect(defaultAtlasMotion("cardio")).toBe("aerobic");
  expect(defaultAtlasMotion("resistance")).toBe("shoulders");
  const low = atlasPose("squat", 2.25),
    high = atlasPose("squat", 0);
  expect(low.y - high.y).toBe(48);
  expect(low.knee).toBe(-85);
  expect(low.thigh).toBe(46);
  expect(atlasPose("shoulders", 2.25).arm).toBeGreaterThan(140);
  expect(atlasPose("aerobic", 1.1).thigh).toBe(25);
  expect(Math.abs(atlasPose("rest", 1).breath)).toBeLessThan(1);
});
