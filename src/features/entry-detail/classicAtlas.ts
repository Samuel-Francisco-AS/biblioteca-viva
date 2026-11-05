import type { PhysicalProfile } from "../../domain/workouts";
export type AtlasCollection = "male" | "female";
export const ATLAS_HOLD_MS = 8000;
export const ATLAS_DISSOLVE_MS = 1800;
const subjects = { male: "masculino", female: "feminino" } as const;
export const CLASSIC_ATLAS = {
  male: ["frontal", "tres-quartos", "movimento"],
  female: ["frontal", "tres-quartos", "movimento"],
} as const;
const descriptions = {
  frontal: "estudo frontal",
  "tres-quartos": "estudo em três quartos",
  movimento: "estudo do passo",
} as const;
export function atlasCollection(profile?: PhysicalProfile): AtlasCollection {
  if (profile?.atlas === "male" || profile?.atlas === "female")
    return profile.atlas;
  return profile?.gender === "female" ? "female" : "male";
}
export function atlasPlates(collection: AtlasCollection) {
  return CLASSIC_ATLAS[collection].map((plate) => ({
    id: `${collection}-${plate}`,
    src: `/illustrations/atlas-classico/${subjects[collection]}-${plate}.webp`,
    alt: `Atlas ${subjects[collection]}: ${descriptions[plate]}. Gravura artística.`,
  }));
}
