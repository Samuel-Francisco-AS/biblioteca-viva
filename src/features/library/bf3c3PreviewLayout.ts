import type { LibraryWorldSnapshot } from "./libraryWorldEntryContract";
import {
  getProceduralLibraryRecordDimensions,
  type LibraryRecordModelTypeId,
} from "./three/libraryRecordDimensions";

export type PreviewRoomId =
  "room-a" | "room-b" | "room-c" | "room-d" | "room-e";
export type PreviewCategory =
  "movie" | "series" | "study" | "physical_activity" | "work";

/** Positional geometry only. The category distribution below belongs solely to this preview. */
export const PREVIEW_ROOMS = Object.freeze([
  { id: "room-a", minX: -5, maxX: 5, minZ: -4.5, maxZ: 4.5 },
  { id: "room-b", minX: -10.6, maxX: -5.8, minZ: -7.8, maxZ: -1.5 },
  { id: "room-c", minX: 5.8, maxX: 10.6, minZ: -7.8, maxZ: -1.5 },
  { id: "room-d", minX: -10.6, maxX: -5.8, minZ: 1.5, maxZ: 7.8 },
  { id: "room-e", minX: 5.8, maxX: 10.6, minZ: 1.5, maxZ: 7.8 },
] as const);

interface PreviewSlot {
  readonly roomId: PreviewRoomId;
  readonly slotId: string;
  readonly modelTypeId: LibraryRecordModelTypeId;
  readonly position: readonly [number, number, number];
}

const TEMPORARY_DISTRIBUTION: readonly {
  category: PreviewCategory;
  modelTypeId: LibraryRecordModelTypeId;
  roomId: PreviewRoomId;
  centers: readonly (readonly [number, number])[];
}[] = [
  {
    category: "movie",
    modelTypeId: "movie-record",
    roomId: "room-b",
    centers: [
      [-9.1, -5.7],
      [-9.1, -3.3],
    ],
  },
  {
    category: "series",
    modelTypeId: "series-record",
    roomId: "room-b",
    centers: [
      [-7.1, -5.7],
      [-7.1, -3.3],
    ],
  },
  {
    category: "study",
    modelTypeId: "study-record",
    roomId: "room-c",
    centers: [
      [7.1, -5.7],
      [9.1, -5.7],
      [8.1, -3.3],
    ],
  },
  {
    category: "physical_activity",
    modelTypeId: "physical-activity-record",
    roomId: "room-d",
    centers: [
      [-9.1, 3.3],
      [-7.1, 3.3],
      [-8.1, 5.7],
    ],
  },
  {
    category: "work",
    modelTypeId: "work-record",
    roomId: "room-e",
    centers: [
      [7.1, 3.3],
      [9.1, 3.3],
      [8.1, 5.7],
    ],
  },
];

export const BF3C3_PREVIEW_SLOTS: readonly PreviewSlot[] = Object.freeze(
  TEMPORARY_DISTRIBUTION.flatMap(
    ({ category, modelTypeId, roomId, centers }) => {
      const room = PREVIEW_ROOMS.find(({ id }) => id === roomId);
      if (!room) throw new Error(`Cômodo ausente: ${roomId}`);
      const dimensions = getProceduralLibraryRecordDimensions(modelTypeId);
      return centers.map(([x, z], index) => {
        if (
          x - dimensions.width / 2 <= room.minX ||
          x + dimensions.width / 2 >= room.maxX ||
          z - dimensions.depth / 2 <= room.minZ ||
          z + dimensions.depth / 2 >= room.maxZ
        ) {
          throw new Error(`Slot fora do cômodo ${roomId}.`);
        }
        return Object.freeze({
          roomId,
          slotId: `${category}-${index + 1}`,
          modelTypeId,
          position: Object.freeze([x, 0, z] as const),
        });
      });
    },
  ),
);

export interface PreviewPlacement {
  readonly entryId: string;
  readonly instanceId: string;
  readonly modelTypeId: LibraryRecordModelTypeId;
  readonly roomId: PreviewRoomId;
  readonly slotId: string;
  readonly position: readonly [number, number, number];
}

export function assignBf3c3PreviewSlots(snapshot: LibraryWorldSnapshot) {
  const placements: PreviewPlacement[] = [];
  const overflow: {
    readonly entryId: string;
    readonly instanceId: string;
    readonly modelTypeId: LibraryRecordModelTypeId;
  }[] = [];
  const instanceIds = new Set<string>();
  for (const { category, modelTypeId } of TEMPORARY_DISTRIBUTION) {
    const entries = snapshot.categories.find(
      ({ type }) => type === category,
    )?.entries;
    if (!entries) throw new Error(`Categoria ausente: ${category}`);
    const slots = BF3C3_PREVIEW_SLOTS.filter(
      (slot) => slot.modelTypeId === modelTypeId,
    );
    for (const [index, entry] of entries.entries()) {
      if (
        entry.modelTypeId !== modelTypeId ||
        !entry.entryId ||
        !entry.instanceId ||
        instanceIds.has(entry.instanceId)
      )
        throw new Error(`Identidade inválida: ${category}`);
      instanceIds.add(entry.instanceId);
      const identity = {
        entryId: entry.entryId,
        instanceId: entry.instanceId,
        modelTypeId,
      };
      const slot = slots[index];
      if (slot)
        placements.push(
          Object.freeze({
            ...identity,
            roomId: slot.roomId,
            slotId: slot.slotId,
            position: slot.position,
          }),
        );
      else overflow.push(Object.freeze(identity));
    }
  }
  return Object.freeze({
    placements: Object.freeze(placements),
    overflow: Object.freeze(overflow),
  });
}
