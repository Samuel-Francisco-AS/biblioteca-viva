import {
  Box3,
  Mesh,
  Vector3,
  type BufferGeometry,
  type Material,
  type Object3D,
} from "three";
import { describe, expect, it } from "vitest";

import { READING_SHELF_COMPOSITION_DEFINITIONS } from "./proceduralComposition";
import {
  createProceduralBookVolume,
  createProceduralBookshelf,
  getProceduralBookVolumeVariant,
  PROCEDURAL_BOOK_VOLUME_MAX_DIMENSIONS,
  type ProceduralBookVolume,
  type ProceduralBookVolumeVariant,
  type ProceduralBookshelfVariant,
} from "./proceduralContent";
import {
  assignReadingAreaBooksToSlots,
  createReadingAreaBookSlots,
  READING_AREA_BOOK_CAPACITY,
  READING_AREA_BOOK_SLOTS,
  type ReadingAreaBookLayoutItem,
  type ReadingAreaBookSlot,
} from "./readingAreaBookLayout";
import { disposeObjectTree } from "./referenceScene";

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

function hasPositiveVolumeOverlap(first: Box3, second: Box3): boolean {
  const intersection = first.clone().intersect(second);
  const size = intersection.getSize(new Vector3());
  const tolerance = 0.000_001;
  return size.x > tolerance && size.y > tolerance && size.z > tolerance;
}

function createBookForVariant(
  variant: ProceduralBookVolumeVariant,
): ProceduralBookVolume {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const entryId = `geometry-${variant}-${attempt}`;
    const instanceId = "reading-book:geometry-slot";
    if (getProceduralBookVolumeVariant({ entryId, instanceId }) !== variant) {
      continue;
    }
    return createProceduralBookVolume({
      entryId,
      instanceId,
      modelTypeId: "book-volume",
    });
  }
  throw new Error(`Não foi encontrada identidade para a variante ${variant}.`);
}

type DisposableMesh = Mesh<BufferGeometry, Material | Material[]>;

function isDisposableMesh(object: Object3D): object is DisposableMesh {
  return object instanceof Mesh;
}

function meshes(root: Object3D): readonly DisposableMesh[] {
  const result: DisposableMesh[] = [];
  root.traverse((object) => {
    if (isDisposableMesh(object)) result.push(object);
  });
  return result;
}

const BOOK_VARIANTS: readonly ProceduralBookVolumeVariant[] = [
  "book-amber",
  "book-blue",
  "book-green",
  "book-red",
];

const GEOMETRY_TOLERANCE = 0.000_001;

const SHELF_VARIANTS: readonly ProceduralBookshelfVariant[] = [
  "reading-balanced",
  "reading-dark-tall",
  "reading-light-wide",
];

describe("layout determinístico de livros BF-2B", () => {
  it("reproduz o layout inicial e deriva cada configuração a partir da variante atual", () => {
    const initial = READING_SHELF_COMPOSITION_DEFINITIONS.map(
      ({ identity, variant }) => ({
        hostInstanceId: identity.instanceId,
        variant,
      }),
    );
    expect(createReadingAreaBookSlots(initial)).toEqual(
      READING_AREA_BOOK_SLOTS,
    );
    expect(createReadingAreaBookSlots(initial)).toEqual(
      createReadingAreaBookSlots(initial),
    );

    for (const current of SHELF_VARIANTS) {
      for (const next of SHELF_VARIANTS) {
        if (current === next) continue;
        const slots = createReadingAreaBookSlots([
          { hostInstanceId: "shelf", variant: next },
        ]);
        expect(slots).not.toHaveLength(0);
        expect(new Set(slots.map(({ slotId }) => slotId)).size).toBe(
          slots.length,
        );
        for (const slot of slots) {
          const bounds = maximumBookBounds(slot);
          expect(bounds.min.x).toBeGreaterThanOrEqual(slot.bounds.minX);
          expect(bounds.max.x).toBeLessThanOrEqual(slot.bounds.maxX);
          expect(bounds.min.y).toBeGreaterThanOrEqual(slot.bounds.minY);
          expect(bounds.max.y).toBeLessThanOrEqual(slot.bounds.maxY);
          expect(bounds.min.z).toBeGreaterThanOrEqual(slot.bounds.minZ);
          expect(bounds.max.z).toBeLessThanOrEqual(slot.bounds.maxZ);
        }
      }
    }
  });
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
      ["reading-shelf-01", 24],
      ["reading-shelf-02", 25],
      ["reading-shelf-03", 21],
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

  it("deriva a capacidade de cada variante e de toda troca unitária BF-1D", () => {
    const capacities = new Map(
      SHELF_VARIANTS.map((variant) => [
        variant,
        createReadingAreaBookSlots([{ hostInstanceId: "shelf", variant }])
          .length,
      ]),
    );

    expect([...capacities.entries()]).toEqual([
      ["reading-balanced", 24],
      ["reading-dark-tall", 25],
      ["reading-light-wide", 21],
    ]);
    const capacitiesAfterReplacement = [
      ["reading-shelf-01", "reading-balanced", 70],
      ["reading-shelf-01", "reading-dark-tall", 71],
      ["reading-shelf-01", "reading-light-wide", 67],
      ["reading-shelf-02", "reading-balanced", 69],
      ["reading-shelf-02", "reading-dark-tall", 70],
      ["reading-shelf-02", "reading-light-wide", 66],
      ["reading-shelf-03", "reading-balanced", 73],
      ["reading-shelf-03", "reading-dark-tall", 74],
      ["reading-shelf-03", "reading-light-wide", 70],
    ] satisfies readonly (readonly [
      string,
      ProceduralBookshelfVariant,
      number,
    ])[];

    for (const [
      hostInstanceId,
      replacement,
      expectedCapacity,
    ] of capacitiesAfterReplacement) {
      const configuration = READING_SHELF_COMPOSITION_DEFINITIONS.map(
        ({ identity, variant }) => ({
          hostInstanceId: identity.instanceId,
          variant:
            identity.instanceId === hostInstanceId ? replacement : variant,
        }),
      );
      expect(createReadingAreaBookSlots(configuration)).toHaveLength(
        expectedCapacity,
      );
    }
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

  it("acomoda os bounds reais das quatro variantes sem atravessar a geometria das três estantes", () => {
    for (const shelfVariant of SHELF_VARIANTS) {
      const shelf = createProceduralBookshelf(
        { instanceId: `geometry-${shelfVariant}`, modelTypeId: "bookshelf" },
        shelfVariant,
      );
      shelf.root.updateMatrixWorld(true);
      const shelfPartBounds = meshes(shelf.root).map((part) =>
        new Box3().setFromObject(part),
      );
      const slots = createReadingAreaBookSlots([
        { hostInstanceId: "shelf", variant: shelfVariant },
      ]);

      for (const slot of slots) {
        for (const bookVariant of BOOK_VARIANTS) {
          const book = createBookForVariant(bookVariant);
          book.root.position.set(...slot.position);
          book.root.updateMatrixWorld(true);
          const bounds = new Box3().setFromObject(book.root);

          expect(bounds.min.x).toBeGreaterThanOrEqual(
            slot.bounds.minX - GEOMETRY_TOLERANCE,
          );
          expect(bounds.max.x).toBeLessThanOrEqual(
            slot.bounds.maxX + GEOMETRY_TOLERANCE,
          );
          expect(bounds.min.y).toBeGreaterThanOrEqual(
            slot.bounds.minY - GEOMETRY_TOLERANCE,
          );
          expect(bounds.max.y).toBeLessThanOrEqual(
            slot.bounds.maxY + GEOMETRY_TOLERANCE,
          );
          expect(bounds.min.z).toBeGreaterThanOrEqual(
            slot.bounds.minZ - GEOMETRY_TOLERANCE,
          );
          expect(bounds.max.z).toBeLessThanOrEqual(
            slot.bounds.maxZ + GEOMETRY_TOLERANCE,
          );
          for (const partBounds of shelfPartBounds) {
            expect(hasPositiveVolumeOverlap(bounds, partBounds)).toBe(false);
          }
          disposeObjectTree(book.root);
        }
      }
      disposeObjectTree(shelf.root);
    }
  });

  it("mantém volumes reais de slots adjacentes sem interseção", () => {
    for (const shelfVariant of SHELF_VARIANTS) {
      const slots = createReadingAreaBookSlots([
        { hostInstanceId: "shelf", variant: shelfVariant },
      ]);
      const left = slots[0];
      const right = slots[1];
      if (!left || !right)
        throw new Error("A estante precisa de slots adjacentes.");

      for (const leftVariant of BOOK_VARIANTS) {
        for (const rightVariant of BOOK_VARIANTS) {
          const leftBook = createBookForVariant(leftVariant);
          const rightBook = createBookForVariant(rightVariant);
          leftBook.root.position.set(...left.position);
          rightBook.root.position.set(...right.position);
          leftBook.root.updateMatrixWorld(true);
          rightBook.root.updateMatrixWorld(true);

          expect(
            hasPositiveVolumeOverlap(
              new Box3().setFromObject(leftBook.root),
              new Box3().setFromObject(rightBook.root),
            ),
          ).toBe(false);
          disposeObjectTree(leftBook.root);
          disposeObjectTree(rightBook.root);
        }
      }
    }
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
    expect(READING_AREA_BOOK_CAPACITY).toBe(70);

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
