import type { RoomId, RoomStage } from "../../../domain";
import type { LibraryVisualPeriod } from "../contracts";

export type RoomDecorationId =
  | "study.desk-lamp"
  | "study.map"
  | "study.globe"
  | "projection.reel"
  | "projection.curtains"
  | "projection.projector-upgrade"
  | "training.weights"
  | "training.rack"
  | "training.rope"
  | "office.desk-lamp"
  | "office.board"
  | "office.typewriter";

export interface RoomVisualDefinition {
  readonly roomId: RoomId;
  readonly baseObjects: readonly string[];
  readonly decorationStages: Readonly<Record<2 | 3 | 4, RoomDecorationId>>;
  readonly palette: {
    readonly accent: number;
    readonly floor: number;
    readonly wall: number;
  };
}

const definitions: readonly RoomVisualDefinition[] = [
  {
    roomId: "study-room",
    baseObjects: ["desk", "chair", "small-shelf", "passage"],
    decorationStages: {
      2: "study.desk-lamp",
      3: "study.map",
      4: "study.globe",
    },
    palette: { accent: 0x668a83, floor: 0x362a25, wall: 0x18302d },
  },
  {
    roomId: "projection-room",
    baseObjects: ["screen", "projector", "seats", "passage"],
    decorationStages: {
      2: "projection.reel",
      3: "projection.curtains",
      4: "projection.projector-upgrade",
    },
    palette: { accent: 0x87654d, floor: 0x302724, wall: 0x252338 },
  },
  {
    roomId: "training-room",
    baseObjects: ["open-floor", "bench", "mat", "passage"],
    decorationStages: {
      2: "training.weights",
      3: "training.rack",
      4: "training.rope",
    },
    palette: { accent: 0x7c7551, floor: 0x403126, wall: 0x29332c },
  },
  {
    roomId: "office",
    baseObjects: ["desk", "chair", "small-file", "passage"],
    decorationStages: {
      2: "office.desk-lamp",
      3: "office.board",
      4: "office.typewriter",
    },
    palette: { accent: 0x805f45, floor: 0x382a25, wall: 0x252c31 },
  },
] as const;

export const ROOM_VISUAL_DEFINITIONS: Readonly<
  Record<RoomId, RoomVisualDefinition | null>
> = Object.freeze({
  "main-library": {
    roomId: "main-library",
    baseObjects: ["shelves", "counter", "librarian", "lamp"],
    decorationStages: {
      2: "study.desk-lamp",
      3: "study.map",
      4: "study.globe",
    },
    palette: { accent: 0xc88759, floor: 0x3a2d26, wall: 0x162725 },
  },
  "study-room": definitions[0],
  "projection-room": definitions[1],
  "training-room": definitions[2],
  office: definitions[3],
});

export function decorationsForRoomStage(
  definition: RoomVisualDefinition,
  stage: RoomStage,
): readonly RoomDecorationId[] {
  if (stage < 2) return [];
  return ([2, 3, 4] as const)
    .filter((decorationStage) => decorationStage <= stage)
    .map((decorationStage) => definition.decorationStages[decorationStage]);
}

export function roomLighting(
  definition: RoomVisualDefinition,
  period: LibraryVisualPeriod,
): {
  readonly localAlpha: number;
  readonly overlayAlpha: number;
  readonly overlayColor: number;
} {
  const byPeriod = {
    morning: { localAlpha: 0.18, overlayAlpha: 0.08, overlayColor: 0x49655d },
    afternoon: { localAlpha: 0.24, overlayAlpha: 0.1, overlayColor: 0x8d542d },
    night: { localAlpha: 0.42, overlayAlpha: 0.3, overlayColor: 0x12162c },
    lateNight: { localAlpha: 0.48, overlayAlpha: 0.38, overlayColor: 0x10172d },
  } as const;
  const lighting = byPeriod[period];
  return {
    ...lighting,
    overlayColor: lighting.overlayColor ^ definition.palette.wall,
  };
}
