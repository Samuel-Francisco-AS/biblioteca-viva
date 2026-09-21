import {
  READING_SHELF_COMPOSITION_DEFINITIONS,
  type ProceduralContentPosition,
} from "./readingShelfDefinitions";
import {
  getProceduralBookshelfLayout,
  PROCEDURAL_BOOK_VOLUME_MAX_DIMENSIONS,
  type ProceduralBookshelfVariant,
} from "./proceduralContent";

export interface ReadingAreaBookLayoutItem {
  readonly instanceId: string;
}

export interface ReadingAreaBookSlotBounds {
  readonly maxX: number;
  readonly maxY: number;
  readonly maxZ: number;
  readonly minX: number;
  readonly minY: number;
  readonly minZ: number;
}

/**
 * A deterministic local location for a future book wrapper.
 *
 * Its position is relative to the stable bookshelf instance wrapper, never to
 * the replaceable representation root. BF-2C may therefore add a book wrapper
 * as a sibling of the bookshelf representation before BF-1D can replace it.
 */
export interface ReadingAreaBookSlot {
  readonly bounds: ReadingAreaBookSlotBounds;
  readonly hostInstanceId: string;
  readonly level: number;
  readonly position: ProceduralContentPosition;
  readonly slotId: string;
}

export interface ReadingAreaBookPlacement {
  readonly hostInstanceId: string;
  readonly instanceId: string;
  readonly level: number;
  readonly position: ProceduralContentPosition;
  readonly slotId: string;
}

export interface ReadingAreaBookSlotAssignment {
  readonly overflow: readonly ReadingAreaBookLayoutItem[];
  readonly placements: readonly ReadingAreaBookPlacement[];
}

const HORIZONTAL_GAP = 0.035;
const SIDE_MARGIN = 0.06;
const VERTICAL_MARGIN = 0.01;
const DEPTH_MARGIN = 0.02;

function createSlotsForShelf(
  hostInstanceId: string,
  variant: ProceduralBookshelfVariant,
): readonly ReadingAreaBookSlot[] {
  const shelf = getProceduralBookshelfLayout(variant);
  const firstX = -shelf.interiorWidth / 2 + SIDE_MARGIN;
  const lastX = shelf.interiorWidth / 2 - SIDE_MARGIN;
  const slotPitch =
    PROCEDURAL_BOOK_VOLUME_MAX_DIMENSIONS.width + HORIZONTAL_GAP;
  const slotCount = Math.floor((lastX - firstX + HORIZONTAL_GAP) / slotPitch);
  const usableLevels = shelf.shelves.slice(0, -1);
  const minZ = shelf.backFrontZ + DEPTH_MARGIN;
  const maxZ = shelf.shelfFrontZ - DEPTH_MARGIN;
  const slots: ReadingAreaBookSlot[] = [];

  for (const [levelIndex, support] of usableLevels.entries()) {
    const above = shelf.shelves[levelIndex + 1];
    if (!above) throw new Error("A estante precisa de uma prateleira acima.");
    const minY = support.topY + VERTICAL_MARGIN;
    const maxY = above.bottomY - VERTICAL_MARGIN;
    const level = levelIndex + 1;
    for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
      const slot = slotIndex + 1;
      const x =
        firstX +
        PROCEDURAL_BOOK_VOLUME_MAX_DIMENSIONS.width / 2 +
        slotIndex * slotPitch;
      slots.push(
        Object.freeze({
          bounds: Object.freeze({
            maxX: lastX,
            maxY,
            maxZ,
            minX: firstX,
            minY,
            minZ,
          }),
          hostInstanceId,
          level,
          position: Object.freeze([x, minY, (minZ + maxZ) / 2] as [
            number,
            number,
            number,
          ]),
          slotId: `${hostInstanceId}:level-${String(level).padStart(2, "0")}:slot-${String(slot).padStart(2, "0")}`,
        }),
      );
    }
  }
  return Object.freeze(slots);
}

/**
 * Slots fill shelves in declared composition order, then bottom-to-top levels,
 * then left-to-right positions. The capacity is their derived length.
 */
export const READING_AREA_BOOK_SLOTS: readonly ReadingAreaBookSlot[] =
  Object.freeze(
    READING_SHELF_COMPOSITION_DEFINITIONS.flatMap(({ identity, variant }) =>
      createSlotsForShelf(identity.instanceId, variant),
    ),
  );

export const READING_AREA_BOOK_CAPACITY = READING_AREA_BOOK_SLOTS.length;

function validateDistinctInstanceIds(
  items: readonly ReadingAreaBookLayoutItem[],
): void {
  const instanceIds = new Set<string>();
  for (const { instanceId } of items) {
    if (instanceId.trim().length === 0) {
      throw new Error("O layout da área de leitura contém instanceId vazio.");
    }
    if (instanceIds.has(instanceId)) {
      throw new Error(
        `O layout da área de leitura contém instanceId duplicado: ${instanceId}.`,
      );
    }
    instanceIds.add(instanceId);
  }
}

/**
 * Assigns the supplied order directly to deterministic shelf slots.
 *
 * It deliberately neither sorts nor deduplicates input: callers retain their
 * semantic order and duplicate world-occurrence identities are rejected.
 */
export function assignReadingAreaBooksToSlots(
  items: readonly ReadingAreaBookLayoutItem[],
): ReadingAreaBookSlotAssignment {
  validateDistinctInstanceIds(items);
  const placements = items
    .slice(0, READING_AREA_BOOK_SLOTS.length)
    .map(({ instanceId }, index) => {
      const slot = READING_AREA_BOOK_SLOTS[index];
      if (!slot)
        throw new Error("Slot de leitura ausente para placement válido.");
      return Object.freeze({
        hostInstanceId: slot.hostInstanceId,
        instanceId,
        level: slot.level,
        position: slot.position,
        slotId: slot.slotId,
      });
    });

  return Object.freeze({
    overflow: Object.freeze(items.slice(READING_AREA_BOOK_SLOTS.length)),
    placements: Object.freeze(placements),
  });
}
