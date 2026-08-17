import {
  MILESTONE_ID,
  type EntryType,
  type MilestoneId,
  type RoomDefinition,
  type RoomRequirement,
} from "../domain";

const sessions = (
  entryTypes: readonly EntryType[],
  minimum: number,
): RoomRequirement => ({ type: "session-count", entryTypes, minimum });
const duration = (
  entryTypes: readonly EntryType[],
  minimumMinutes: number,
): RoomRequirement => ({
  type: "session-duration",
  entryTypes,
  minimumMinutes,
});
const completed = (
  entryTypes: readonly EntryType[],
  minimum: number,
): RoomRequirement => ({ type: "completed-entry-count", entryTypes, minimum });
const unlock = (...milestoneIds: readonly MilestoneId[]): RoomRequirement => ({
  type: "milestone",
  milestoneIds,
});
const any = (...requirements: readonly RoomRequirement[]) => ({
  operator: "any" as const,
  requirements,
});
const all = (...requirements: readonly RoomRequirement[]) => ({
  operator: "all" as const,
  requirements,
});

function room(
  input: Omit<RoomDefinition, "stages"> & {
    readonly unlock?: RoomRequirement;
    readonly stage2: readonly RoomRequirement[];
    readonly stage3: readonly RoomRequirement[];
    readonly stage4: readonly RoomRequirement[];
  },
): RoomDefinition {
  const {
    unlock: unlockRequirement,
    stage2,
    stage3,
    stage4,
    ...definition
  } = input;
  return Object.freeze({
    ...definition,
    stages: Object.freeze([
      ...(unlockRequirement
        ? [{ stage: 1 as const, groups: [all(unlockRequirement)] }]
        : []),
      { stage: 2 as const, groups: [any(...stage2)] },
      { stage: 3 as const, groups: [all(...stage3)] },
      { stage: 4 as const, groups: [all(...stage4)] },
    ]),
  });
}

export const ROOM_CATALOG: readonly RoomDefinition[] = Object.freeze([
  room({
    id: "main-library",
    nameKey: "room.main-library.name",
    descriptionKey: "room.main-library.description",
    associatedEntryTypes: ["book"],
    connections: ["study-room", "projection-room", "training-room", "office"],
    stage2: [sessions(["book"], 3), duration(["book"], 120)],
    stage3: [sessions(["book"], 10), duration(["book"], 300)],
    stage4: [
      sessions(["book"], 20),
      duration(["book"], 900),
      completed(["book"], 1),
    ],
  }),
  room({
    id: "study-room",
    nameKey: "room.study-room.name",
    descriptionKey: "room.study-room.description",
    associatedEntryTypes: ["study"],
    connections: ["main-library"],
    unlock: unlock(MILESTONE_ID.firstStudy),
    stage2: [sessions(["study"], 3), duration(["study"], 120)],
    stage3: [sessions(["study"], 10), duration(["study"], 300)],
    stage4: [
      sessions(["study"], 20),
      duration(["study"], 900),
      completed(["study"], 1),
    ],
  }),
  room({
    id: "projection-room",
    nameKey: "room.projection-room.name",
    descriptionKey: "room.projection-room.description",
    associatedEntryTypes: ["movie", "series"],
    connections: ["main-library"],
    unlock: unlock(MILESTONE_ID.firstMovie, MILESTONE_ID.firstSeries),
    stage2: [
      sessions(["movie", "series"], 3),
      duration(["movie", "series"], 180),
    ],
    stage3: [
      sessions(["movie", "series"], 8),
      duration(["movie", "series"], 480),
    ],
    stage4: [
      sessions(["movie", "series"], 15),
      duration(["movie", "series"], 900),
      completed(["movie", "series"], 2),
    ],
  }),
  room({
    id: "training-room",
    nameKey: "room.training-room.name",
    descriptionKey: "room.training-room.description",
    associatedEntryTypes: ["physical_activity"],
    connections: ["main-library"],
    unlock: unlock(MILESTONE_ID.firstPhysicalActivity),
    stage2: [
      sessions(["physical_activity"], 3),
      duration(["physical_activity"], 90),
    ],
    stage3: [
      sessions(["physical_activity"], 10),
      duration(["physical_activity"], 300),
    ],
    stage4: [
      sessions(["physical_activity"], 20),
      duration(["physical_activity"], 600),
    ],
  }),
  room({
    id: "office",
    nameKey: "room.office.name",
    descriptionKey: "room.office.description",
    associatedEntryTypes: ["work"],
    connections: ["main-library"],
    unlock: unlock(MILESTONE_ID.firstWork),
    stage2: [sessions(["work"], 3), duration(["work"], 120)],
    stage3: [sessions(["work"], 10), duration(["work"], 360)],
    stage4: [
      sessions(["work"], 20),
      duration(["work"], 900),
      completed(["work"], 1),
    ],
  }),
]);

export const ROOM_NAMES = Object.freeze({
  "main-library": "Biblioteca Principal",
  "study-room": "Sala de Estudos",
  "projection-room": "Sala de Projeção",
  "training-room": "Sala de Treino",
  office: "Escritório",
});
