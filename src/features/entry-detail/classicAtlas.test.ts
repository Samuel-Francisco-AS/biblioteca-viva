import { expect, it } from "vitest";
import { atlasCollection, atlasPlates } from "./classicAtlas";
import { estimateCalories, physicalProfileSchema } from "../../domain/workouts";
it("uses voluntary gender in auto, independent manual preference and an explicit male fallback without changing MET", () => {
  expect(atlasCollection()).toBe("male");
  for (const gender of ["male", "female", "other", "undisclosed"] as const) {
    const profile = physicalProfileSchema.parse({
      weightKg: 70,
      gender,
      atlas: "auto",
    });
    expect(atlasCollection(profile)).toBe(
      gender === "female" ? "female" : "male",
    );
    expect(atlasCollection({ ...profile, atlas: "female" })).toBe("female");
    expect(atlasCollection({ ...profile, atlas: "male" })).toBe("male");
    expect(estimateCalories("strength", 30, 5, profile)).toEqual(
      estimateCalories("strength", 30, 5, { weightKg: 70 }),
    );
  }
  expect(
    estimateCalories("strength", 30, 5, { gender: "female" }),
  ).toBeUndefined();
});
it("provides three distinct local artworks in each set, with original male/female paths and useful alternative text", () => {
  const plates = [...atlasPlates("male"), ...atlasPlates("female")];
  expect(plates).toHaveLength(6);
  expect(new Set(plates.map((plate) => plate.src)).size).toBe(6);
  expect(
    plates.every(
      (plate) =>
        plate.src.startsWith("/illustrations/atlas-classico/") &&
        plate.src.endsWith(".webp"),
    ),
  ).toBe(true);
  expect(plates.every((plate) => plate.alt.includes("Gravura artística"))).toBe(
    true,
  );
});
