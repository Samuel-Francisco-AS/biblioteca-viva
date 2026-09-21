import { Box3, Vector3 } from "three";
import { describe, expect, it } from "vitest";

import {
  createProceduralComposition,
  READING_SHELF_COMPOSITION_DEFINITIONS,
  replaceProceduralBookshelfRepresentation,
} from "./proceduralComposition";
import {
  PROCEDURAL_BOOK_VOLUME_MAX_DIMENSIONS,
  type ProceduralBookshelfVariant,
} from "./proceduralContent";
import { disposeObjectTree } from "./referenceScene";
import {
  assignReadingAreaBooksToSlots,
  READING_AREA_BOOK_CAPACITY,
  READING_AREA_BOOK_SLOTS,
  type ReadingAreaBookLayoutItem,
  type ReadingAreaBookSlot,
} from "./readingAreaBookLayout";

function items(count: number): readonly ReadingAreaBookLayoutItem[] {
  return Array.from({ length: count }, (_, index) => ({
    instanceId: `reading-book:book-${String(index + 1).padStart(3, "0")}`,
  }));
}

function maximumBookBounds(slot: ReadingAreaBookSlot): Box3 {
  const { depth, height, width } = PROCEDURAL_BOOK_VOLUME_MAX_DIMENSIONS;
  return new Box3(
    new Vector3(
      slot.position[0] - width / 2,
      slot.position[1],
      slot.position[2] - depth / 2,
    ),
    new Vector3(
      slot.position[0] + width / 2,
      slot.position[1] + height,
      slot.position[2] + depth / 2,
    ),
  );
}

describe("layout determinístico de livros BF-2B", () => {
  it("declara slots para as três variantes e somente níveis internos utilizáveis", () => {
    const slotsByHost = new Map<string, readonly ReadingAreaBookSlot[]>();
    for (const definition of READING_SHELF_COMPOSITION_DEFINITIONS) {
      slotsByHost.set(
        definition.identity.instanceId,
        READING_AREA_BOOK_SLOTS.filter(
          ({ hostInstanceId }) =>
            hostInstanceId === definition.identity.instanceId,
        ),
      );
    }

    expect(
      READING_SHELF_COMPOSITION_DEFINITIONS.map(({ variant }) => variant),
    ).toEqual([
      "reading-balanced",
      "reading-dark-tall",
      "reading-light-wide",
    ] satisfies readonly ProceduralBookshelfVariant[]);
    expect(
      [...slotsByHost.entries()].map(([host, slots]) => [host, slots.length]),
    ).toEqual([
      ["reading-shelf-01", 32],
      ["reading-shelf-02", 30],
      ["reading-shelf-03", 27],
    ]);
    expect(
      [...slotsByHost.values()].map((slots) => [
        ...new Set(slots.map(({ level }) => level)),
      ]),
    ).toEqual([
      [1, 2, 3, 4],
      [1, 2, 3, 4, 5],
      [1, 2, 3],
    ]);
  });

  it("tem IDs únicos, hosts conhecidos e posições finitas", () => {
    const knownHosts = new Set(
      READING_SHELF_COMPOSITION_DEFINITIONS.map(
        ({ identity }) => identity.instanceId,
      ),
    );

    expect(
      new Set(READING_AREA_BOOK_SLOTS.map(({ slotId }) => slotId)).size,
    ).toBe(READING_AREA_BOOK_SLOTS.length);
    for (const slot of READING_AREA_BOOK_SLOTS) {
      expect(slot.slotId).toMatch(
        /^reading-shelf-0[1-3]:level-\d{2}:slot-\d{2}$/u,
      );
      expect(knownHosts.has(slot.hostInstanceId)).toBe(true);
      expect(slot.position.every(Number.isFinite)).toBe(true);
    }
  });

  it("mantém o maior volume dentro dos limites úteis e sem sobreposição", () => {
    for (const slot of READING_AREA_BOOK_SLOTS) {
      const bounds = maximumBookBounds(slot);
      expect(bounds.min.x).toBeGreaterThanOrEqual(slot.bounds.minX);
      expect(bounds.max.x).toBeLessThanOrEqual(slot.bounds.maxX);
      expect(bounds.min.y).toBeGreaterThanOrEqual(slot.bounds.minY);
      expect(bounds.max.y).toBeLessThanOrEqual(slot.bounds.maxY);
      expect(bounds.min.z).toBeGreaterThanOrEqual(slot.bounds.minZ);
      expect(bounds.max.z).toBeLessThanOrEqual(slot.bounds.maxZ);
    }

    const slotsByLevel = new Map<string, ReadingAreaBookSlot[]>();
    for (const slot of READING_AREA_BOOK_SLOTS) {
      const key = `${slot.hostInstanceId}:${slot.level}`;
      const current = slotsByLevel.get(key) ?? [];
      current.push(slot);
      slotsByLevel.set(key, current);
    }
    for (const slots of slotsByLevel.values()) {
      for (const [index, slot] of slots.entries()) {
        const bounds = maximumBookBounds(slot);
        for (const other of slots.slice(index + 1)) {
          expect(bounds.intersectsBox(maximumBookBounds(other))).toBe(false);
        }
      }
    }
  });

  it("mantém slots locais ao wrapper estável quando BF-1D troca a representação", () => {
    const before = structuredClone(
      READING_AREA_BOOK_SLOTS.filter(
        ({ hostInstanceId }) => hostInstanceId === "reading-shelf-02",
      ),
    );
    const composition = createProceduralComposition(
      READING_SHELF_COMPOSITION_DEFINITIONS,
    );
    const shelf = composition.instances[1];
    if (!shelf) throw new Error("A segunda estante deve existir.");
    const previousRepresentation = shelf.representation.root;

    expect(
      replaceProceduralBookshelfRepresentation(
        composition,
        "reading-shelf-02",
        "reading-balanced",
      ),
    ).toBe("replaced");
    expect(shelf.representation.root).not.toBe(previousRepresentation);
    expect(
      READING_AREA_BOOK_SLOTS.filter(
        ({ hostInstanceId }) => hostInstanceId === "reading-shelf-02",
      ),
    ).toEqual(before);
    disposeObjectTree(composition.root);
  });

  it("atribui zero, um e vários itens na ordem recebida", () => {
    expect(assignReadingAreaBooksToSlots([])).toEqual({
      overflow: [],
      placements: [],
    });

    const input = items(3);
    const assigned = assignReadingAreaBooksToSlots(input);
    expect(assigned.placements.map(({ instanceId }) => instanceId)).toEqual(
      input.map(({ instanceId }) => instanceId),
    );
    expect(assigned.placements.map(({ slotId }) => slotId)).toEqual(
      READING_AREA_BOOK_SLOTS.slice(0, 3).map(({ slotId }) => slotId),
    );
    expect(assigned.overflow).toEqual([]);
  });

  it("deriva capacidade dos slots e preserva overflow sem perda ou duplicidade", () => {
    expect(READING_AREA_BOOK_CAPACITY).toBe(READING_AREA_BOOK_SLOTS.length);
    expect(READING_AREA_BOOK_CAPACITY).toBe(89);

    const atCapacity = items(READING_AREA_BOOK_CAPACITY);
    const full = assignReadingAreaBooksToSlots(atCapacity);
    expect(full.placements).toHaveLength(READING_AREA_BOOK_CAPACITY);
    expect(full.overflow).toEqual([]);

    const overCapacity = items(READING_AREA_BOOK_CAPACITY + 1);
    const overflow = assignReadingAreaBooksToSlots(overCapacity);
    const returned = [
      ...overflow.placements.map(({ instanceId }) => instanceId),
      ...overflow.overflow.map(({ instanceId }) => instanceId),
    ];
    expect(overflow.placements).toHaveLength(READING_AREA_BOOK_CAPACITY);
    expect(overflow.overflow).toEqual([overCapacity.at(-1)]);
    expect(returned).toEqual(overCapacity.map(({ instanceId }) => instanceId));
    expect(new Set(returned)).toHaveLength(overCapacity.length);
  });

  it("rejeita instanceId duplicado sem deduplicação silenciosa", () => {
    expect(() =>
      assignReadingAreaBooksToSlots([
        { instanceId: "reading-book:duplicated" },
        { instanceId: "reading-book:duplicated" },
      ]),
    ).toThrow("instanceId duplicado: reading-book:duplicated");
  });

  it("reconstrói exatamente o mesmo layout para a mesma entrada", () => {
    const input = items(7);

    expect(assignReadingAreaBooksToSlots(input)).toEqual(
      assignReadingAreaBooksToSlots(input),
    );
  });
});
