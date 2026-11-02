import type { LibraryWorldSnapshot } from "./libraryWorldEntryContract";
import {
  getProceduralLibraryRecordDimensions,
  type LibraryRecordModelTypeId,
} from "./three/libraryRecordDimensions";

import { LIBRARY_ROOMS, type LibraryRoomId } from "./libraryBuildingGeometry";

type LibraryCategory =
  "movie" | "series" | "study" | "physical_activity" | "work";

export interface LibraryRecordSlot {
  readonly roomId: LibraryRoomId;
  readonly slotId: string;
  readonly modelTypeId: LibraryRecordModelTypeId;
  readonly position: readonly [number, number, number];
}

/** Initial content arrangement only; rooms retain no category restriction. */
const INITIAL_LIBRARY_RECORD_DISTRIBUTION: readonly {
  category: LibraryCategory;
  modelTypeId: LibraryRecordModelTypeId;
  spots: readonly (readonly [LibraryRoomId, number, number])[];
}[] = [
  {
    category: "movie",
    modelTypeId: "movie-record",
    spots: [
      ["room-b", -16.5, -10.8],
      ["room-a", 5.6, -7.2],
    ],
  },
  {
    category: "series",
    modelTypeId: "series-record",
    spots: [
      ["room-b", -14.1, -10.8],
      ["room-e", 16.1, 3.6],
    ],
  },
  {
    category: "study",
    modelTypeId: "study-record",
    spots: [
      ["room-c", 14.1, -8.3],
      ["room-c", 16, -8.3],
      ["room-a", 3, -7.2],
    ],
  },
  {
    category: "physical_activity",
    modelTypeId: "physical-activity-record",
    spots: [
      ["room-d", -17.1, 10.8],
      ["room-d", -15.3, 10.8],
      ["room-e", 17, 10.8],
    ],
  },
  {
    category: "work",
    modelTypeId: "work-record",
    spots: [
      ["room-e", 14.1, 10.8],
      ["room-e", 15.6, 10.8],
      ["room-b", -16.7, -8.2],
    ],
  },
];

export const INITIAL_LIBRARY_RECORD_SLOTS: readonly LibraryRecordSlot[] =
  Object.freeze(
    INITIAL_LIBRARY_RECORD_DISTRIBUTION.flatMap(
      ({ category, modelTypeId, spots }) => {
        const dimensions = getProceduralLibraryRecordDimensions(modelTypeId);
        return spots.map(([roomId, x, z], index) => {
          const room = LIBRARY_ROOMS.find(({ id }) => id === roomId);
          if (!room) throw new Error(`Cômodo ausente: ${roomId}`);
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

export interface LibraryRecordPlacement {
  readonly entryId: string;
  readonly instanceId: string;
  readonly modelTypeId: LibraryRecordModelTypeId;
  readonly roomId: LibraryRoomId;
  readonly slotId: string;
  readonly position: readonly [number, number, number];
}

export function assignLibraryRecordSlots(snapshot: LibraryWorldSnapshot) {
  const placements: LibraryRecordPlacement[] = [];
  const overflow: {
    readonly entryId: string;
    readonly instanceId: string;
    readonly modelTypeId: LibraryRecordModelTypeId;
  }[] = [];
  const instanceIds = new Set<string>();
  const entryIds = new Set<string>();
  if (
    !snapshot ||
    !Array.isArray(snapshot.categories) ||
    snapshot.categories.length !== 6 ||
    new Set(snapshot.categories.map(({ type }) => type)).size !== 6
  )
    throw new Error("Snapshot inválido.");
  for (const { category, modelTypeId } of INITIAL_LIBRARY_RECORD_DISTRIBUTION) {
    const entries = snapshot.categories.find(
      ({ type }) => type === category,
    )?.entries;
    if (!entries) throw new Error(`Categoria ausente: ${category}`);
    const slots = INITIAL_LIBRARY_RECORD_SLOTS.filter(
      (slot) => slot.modelTypeId === modelTypeId,
    );
    for (const [index, entry] of entries.entries()) {
      if (
        !("type" in entry) ||
        entry.type !== category ||
        entry.modelTypeId !== modelTypeId ||
        typeof entry.entryId !== "string" ||
        entry.entryId.trim() === "" ||
        typeof entry.instanceId !== "string" ||
        entry.instanceId.trim() === "" ||
        instanceIds.has(entry.instanceId) ||
        entryIds.has(entry.entryId)
      )
        throw new Error(`Identidade inválida: ${category}`);
      instanceIds.add(entry.instanceId);
      entryIds.add(entry.entryId);
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
