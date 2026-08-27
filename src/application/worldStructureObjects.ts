import {
  WORLD_PLACEMENT_AREAS,
  objectDefinition,
  placementIsValid,
  type PlacedObject,
} from "./world";

/** Deterministic W2 recovery used only while creating the first structure. */
export function recoverObjectsForInitialStructure(
  objects: readonly PlacedObject[],
): readonly PlacedObject[] {
  const accepted: PlacedObject[] = [];
  for (const object of [...objects].sort((a, b) =>
    a.instanceId.localeCompare(b.instanceId),
  )) {
    if (
      placementIsValid(object, WORLD_PLACEMENT_AREAS) &&
      !overlapsAny(object, accepted)
    ) {
      accepted.push(object);
      continue;
    }
    const recovered = firstRecoveryPosition(object, accepted);
    if (!recovered)
      throw new Error(
        "Não há posição estrutural segura para recuperar os objetos existentes.",
      );
    accepted.push(recovered);
  }
  return Object.freeze(accepted);
}

function firstRecoveryPosition(
  object: PlacedObject,
  accepted: readonly PlacedObject[],
): PlacedObject | undefined {
  for (let y = 128; y <= 416; y += 32) {
    for (let x = 96; x <= 448; x += 32) {
      const candidate: PlacedObject = { ...object, spaceId: "space-a", x, y };
      if (
        placementIsValid(candidate, WORLD_PLACEMENT_AREAS) &&
        !overlapsAny(candidate, accepted)
      )
        return Object.freeze(candidate);
    }
  }
  return undefined;
}

function overlapsAny(
  candidate: PlacedObject,
  existing: readonly PlacedObject[],
): boolean {
  const candidateBounds = footprintBounds(candidate);
  if (!candidateBounds) return true;
  return existing.some((object) => {
    const bounds = footprintBounds(object);
    return (
      !!bounds &&
      candidateBounds.x < bounds.x + bounds.width &&
      candidateBounds.x + candidateBounds.width > bounds.x &&
      candidateBounds.y < bounds.y + bounds.height &&
      candidateBounds.y + candidateBounds.height > bounds.y
    );
  });
}

function footprintBounds(object: PlacedObject):
  | {
      readonly height: number;
      readonly width: number;
      readonly x: number;
      readonly y: number;
    }
  | undefined {
  const definition = objectDefinition(object.definitionId);
  if (!definition) return undefined;
  const swapped = object.rotation === 90 || object.rotation === 270;
  return {
    height: swapped ? definition.footprint.width : definition.footprint.height,
    width: swapped ? definition.footprint.height : definition.footprint.width,
    x: object.x,
    y: object.y,
  };
}
