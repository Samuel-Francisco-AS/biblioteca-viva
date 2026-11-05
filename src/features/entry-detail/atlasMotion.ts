import type { PhysicalActivityCategory } from "../../domain";
import type { PhysicalProfile } from "../../domain/workouts";
export type AtlasVariant = "male" | "female";
export type AtlasMotion = "rest" | "squat" | "shoulders" | "aerobic";
export const atlasMotionLabels = {
  rest: "Repouso",
  squat: "Agachamento",
  shoulders: "Braços",
  aerobic: "Aeróbico",
} as const;
export function atlasVariant(profile?: PhysicalProfile): AtlasVariant {
  if (profile?.atlas === "female" || profile?.atlas === "male")
    return profile.atlas;
  return profile?.gender === "female" ? "female" : "male";
}
export function defaultAtlasMotion(
  category: PhysicalActivityCategory,
): AtlasMotion {
  return category === "cardio" || category === "sport"
    ? "aerobic"
    : category === "strength"
      ? "squat"
      : category === "resistance"
        ? "shoulders"
        : "rest";
}
export function atlasPose(motion: AtlasMotion, seconds: number) {
  const cycle =
    (1 -
      Math.cos((seconds * Math.PI * 2) / (motion === "aerobic" ? 2.2 : 4.5))) /
    2;
  const squat = motion === "squat" ? cycle : 0;
  const arms =
    motion === "shoulders" ? cycle : motion === "aerobic" ? cycle : 0;
  const legs = motion === "aerobic" ? cycle * 25 : squat * 46;
  return {
    y: squat * 48 - (motion === "aerobic" ? Math.sin(cycle * Math.PI) * 7 : 0),
    thigh: legs,
    knee: squat * -85 - (motion === "aerobic" ? cycle * 6 : 0),
    arm: arms * 145 + squat * 63 + 7,
    elbow: motion === "shoulders" ? 15 + (1 - cycle) * 65 : squat * 27 + 8,
    breath: motion === "rest" ? Math.sin(seconds * 1.5) * 0.8 : 0,
  };
}
