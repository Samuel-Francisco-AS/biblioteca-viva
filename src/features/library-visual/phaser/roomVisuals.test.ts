import { describe, expect, it } from "vitest";

import type { RoomId } from "../../../domain";
import {
  decorationsForRoomStage,
  roomLighting,
  ROOM_VISUAL_DEFINITIONS,
} from "./roomVisuals";

describe("definições visuais das salas", () => {
  const secondaryRooms = [
    "study-room",
    "projection-room",
    "training-room",
    "office",
  ] as const;

  it.each(secondaryRooms)("expande %s do estágio 1 ao 4", (roomId) => {
    const definition = ROOM_VISUAL_DEFINITIONS[roomId];
    expect(definition).not.toBeNull();
    if (!definition) return;
    expect(decorationsForRoomStage(definition, 1)).toEqual([]);
    expect(decorationsForRoomStage(definition, 4)).toHaveLength(3);
  });

  it.each(
    (
      [
        "main-library",
        "study-room",
        "projection-room",
        "training-room",
        "office",
      ] as const
    ).flatMap((roomId) =>
      (["morning", "afternoon", "night", "lateNight"] as const).map(
        (period) => [roomId, period] as const,
      ),
    ),
  )("deriva iluminação estática para %s em %s", (roomId: RoomId, period) => {
    const definition = ROOM_VISUAL_DEFINITIONS[roomId];
    expect(definition).not.toBeNull();
    if (!definition) return;
    const lighting = roomLighting(definition, period);
    expect(Number.isFinite(lighting.localAlpha)).toBe(true);
    expect(Number.isFinite(lighting.overlayAlpha)).toBe(true);
    expect(Number.isFinite(lighting.overlayColor)).toBe(true);
  });
});
