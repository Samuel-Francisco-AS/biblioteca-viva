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
  { id: "room-a", minX: -7, maxX: 7, minZ: -5, maxZ: 0 },
  { id: "room-b", minX: -7, maxX: -3.5, minZ: 0, maxZ: 5 },
  { id: "room-c", minX: -3.5, maxX: 0, minZ: 0, maxZ: 5 },
  { id: "room-d", minX: 0, maxX: 3.5, minZ: 0, maxZ: 5 },
  { id: "room-e", minX: 3.5, maxX: 7, minZ: 0, maxZ: 5 },
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
      [-6, 1.35],
      [-6, 3.45],
    ],
  },
  {
    category: "series",
    modelTypeId: "series-record",
    roomId: "room-b",
    centers: [
      [-4.5, 1.35],
      [-4.5, 3.45],
    ],
  },
  {
    category: "study",
    modelTypeId: "study-record",
    roomId: "room-c",
    centers: [
      [-2.65, 1.2],
      [-0.85, 1.2],
      [-1.75, 3.5],
    ],
  },
  {
    category: "physical_activity",
    modelTypeId: "physical-activity-record",
    roomId: "room-d",
    centers: [
      [0.8, 1.2],
      [2.65, 1.2],
      [1.75, 3.5],
    ],
  },
  {
    category: "work",
    modelTypeId: "work-record",
    roomId: "room-e",
    centers: [
      [4.35, 1.2],
      [6.15, 1.2],
      [5.25, 3.5],
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
