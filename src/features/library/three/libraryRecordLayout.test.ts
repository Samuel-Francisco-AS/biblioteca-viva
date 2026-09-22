import { Box3, Group, Object3D, Vector3 } from "three";
import { describe, expect, it } from "vitest";

import type { LibraryWorldSnapshot } from "../libraryWorldEntryContract";
import {
  createProceduralMovieRecord,
  createProceduralPhysicalActivityRecord,
  createProceduralSeriesRecord,
  createProceduralStudyRecord,
  createProceduralWorkRecord,
} from "./libraryRecordRepresentations";
import {
  assignLibraryWorldRecordsToSlots,
  COMPLEMENTARY_LIBRARY_RECORD_CAPACITY,
  COMPLEMENTARY_LIBRARY_RECORD_LAYOUT_CONFIGURATION,
  COMPLEMENTARY_LIBRARY_RECORD_SLOTS,
  createComplementaryLibraryRecordSlots,
  type LibraryRecordLayoutBounds,
  type LibraryRecordLayoutConfiguration,
  type LibraryRecordPlacement,
} from "./libraryRecordLayout";
import { createProceduralComposition } from "./proceduralComposition";
import { createProceduralBookVolume } from "./proceduralContent";
import { READING_AREA_BOOK_SLOTS } from "./readingAreaBookLayout";
import { READING_SHELF_COMPOSITION_DEFINITIONS } from "./readingShelfDefinitions";
import { createReferenceScene, disposeObjectTree } from "./referenceScene";

const TOLERANCE = 0.000_001;

function snapshot(
  counts: Partial<
    Record<"movie" | "series" | "study" | "physical_activity" | "work", number>
  >,
  duplicateInstanceId?: string,
): LibraryWorldSnapshot {
  const identity = (type: string, index: number, modelTypeId: string) => {
    const id = `${type}-${String(index + 1).padStart(2, "0")}`;
    return {
      createdAt: "2026-09-22T00:00:00.000Z",
      entryId: id,
      instanceId:
        duplicateInstanceId && index === 0
          ? duplicateInstanceId
          : `library-${type}:${id}`,
      modelTypeId,
      title: id,
    };
  };
  const movieEntries = Array.from({ length: counts.movie ?? 0 }, (_, index) =>
    Object.freeze({
      ...identity("movie", index, "movie-record"),
      modelTypeId: "movie-record" as const,
      type: "movie" as const,
    }),
  );
  const seriesEntries = Array.from({ length: counts.series ?? 0 }, (_, index) =>
    Object.freeze({
      ...identity("series", index, "series-record"),
      episodesWatched: 0,
      modelTypeId: "series-record" as const,
      type: "series" as const,
    }),
  );
  const studyEntries = Array.from({ length: counts.study ?? 0 }, (_, index) =>
    Object.freeze({
      ...identity("study", index, "study-record"),
      modelTypeId: "study-record" as const,
      progressCurrent: 0,
      progressUnit: "hours" as const,
      type: "study" as const,
    }),
  );
  const activityEntries = Array.from(
    { length: counts.physical_activity ?? 0 },
    (_, index) =>
      Object.freeze({
        ...identity("physical_activity", index, "physical-activity-record"),
        category: "cardio" as const,
        modelTypeId: "physical-activity-record" as const,
        type: "physical_activity" as const,
      }),
  );
  const workEntries = Array.from({ length: counts.work ?? 0 }, (_, index) =>
    Object.freeze({
      ...identity("work", index, "work-record"),
      modelTypeId: "work-record" as const,
      type: "work" as const,
    }),
  );
  const categories: LibraryWorldSnapshot["categories"] = [
    Object.freeze({ entries: Object.freeze([]), type: "book" as const }),
    Object.freeze({
      entries: Object.freeze(movieEntries),
      type: "movie" as const,
    }),
    Object.freeze({
      entries: Object.freeze(seriesEntries),
      type: "series" as const,
    }),
    Object.freeze({
      entries: Object.freeze(studyEntries),
      type: "study" as const,
    }),
    Object.freeze({
      entries: Object.freeze(activityEntries),
      type: "physical_activity" as const,
    }),
    Object.freeze({
      entries: Object.freeze(workEntries),
      type: "work" as const,
    }),
  ];
  return Object.freeze({ categories: Object.freeze(categories) });
}

function overlaps(first: Box3, second: Box3): boolean {
  const intersection = first.clone().intersect(second).getSize(new Vector3());
  return (
    intersection.x > TOLERANCE &&
    intersection.y > TOLERANCE &&
    intersection.z > TOLERANCE
  );
}

function asBox3(bounds: LibraryRecordLayoutBounds): Box3 {
  return new Box3(
    new Vector3(bounds.minX, bounds.minY, bounds.minZ),
    new Vector3(bounds.maxX, bounds.maxY, bounds.maxZ),
  );
}

function containsBoxWithTolerance(outer: Box3, inner: Box3): boolean {
  return (
    inner.min.x >= outer.min.x - TOLERANCE &&
    inner.max.x <= outer.max.x + TOLERANCE &&
    inner.min.y >= outer.min.y - TOLERANCE &&
    inner.max.y <= outer.max.y + TOLERANCE &&
    inner.min.z >= outer.min.z - TOLERANCE &&
    inner.max.z <= outer.max.z + TOLERANCE
  );
}

function createRepresentation(placement: LibraryRecordPlacement) {
  switch (placement.modelTypeId) {
    case "movie-record":
      return createProceduralMovieRecord({
        entryId: placement.entryId,
        instanceId: placement.instanceId,
        modelTypeId: "movie-record",
      });
    case "series-record":
      return createProceduralSeriesRecord({
        entryId: placement.entryId,
        instanceId: placement.instanceId,
        modelTypeId: "series-record",
      });
    case "study-record":
      return createProceduralStudyRecord({
        entryId: placement.entryId,
        instanceId: placement.instanceId,
        modelTypeId: "study-record",
      });
    case "physical-activity-record":
      return createProceduralPhysicalActivityRecord({
        entryId: placement.entryId,
        instanceId: placement.instanceId,
        modelTypeId: "physical-activity-record",
      });
    case "work-record":
      return createProceduralWorkRecord({
        entryId: placement.entryId,
        instanceId: placement.instanceId,
        modelTypeId: "work-record",
      });
  }
}

describe("layout complementar BF-3C2", () => {
  it("deriva slots válidos e capacidade do espaço efetivo, sem usar os 70 slots de livros", () => {
    const slots = createComplementaryLibraryRecordSlots();
    expect(slots).toEqual(COMPLEMENTARY_LIBRARY_RECORD_SLOTS);
    expect(
      COMPLEMENTARY_LIBRARY_RECORD_LAYOUT_CONFIGURATION.areas.map(
        ({ modelTypeId }) => [
          modelTypeId,
          slots.filter((slot) => slot.modelTypeId === modelTypeId).length,
        ],
      ),
    ).toEqual([
      ["movie-record", 6],
      ["series-record", 7],
      ["study-record", 8],
      ["physical-activity-record", 9],
      ["work-record", 7],
    ]);
    expect(COMPLEMENTARY_LIBRARY_RECORD_CAPACITY).toBe(slots.length);
    expect(COMPLEMENTARY_LIBRARY_RECORD_CAPACITY).toBe(37);
    expect(COMPLEMENTARY_LIBRARY_RECORD_CAPACITY).not.toBe(
      READING_AREA_BOOK_SLOTS.length,
    );
    for (const slot of slots) {
      expect(asBox3(slot.bounds).containsBox(asBox3(slot.bounds))).toBe(true);
      expect(
        asBox3(
          COMPLEMENTARY_LIBRARY_RECORD_LAYOUT_CONFIGURATION.zone,
        ).containsBox(asBox3(slot.bounds)),
      ).toBe(true);
      expect(slot.position.every(Number.isFinite)).toBe(true);
    }
  });

  it("confere dimensões transportadas pelo layout contra Box3 real das cinco fábricas", () => {
    const representatives = assignLibraryWorldRecordsToSlots(
      snapshot({
        movie: 1,
        physical_activity: 1,
        series: 1,
        study: 1,
        work: 1,
      }),
    ).placements.map(createRepresentation);
    for (const representation of representatives) {
      const measured = new Box3()
        .setFromObject(representation.root)
        .getSize(new Vector3());
      const slot = COMPLEMENTARY_LIBRARY_RECORD_SLOTS.find(
        ({ modelTypeId }) =>
          modelTypeId === representation.identity.modelTypeId,
      );
      if (!slot) throw new Error("Slot ausente para fábrica C1.");
      expect(measured.x).toBeCloseTo(slot.dimensions.width, 6);
      expect(measured.y).toBeCloseTo(slot.dimensions.height, 6);
      expect(measured.z).toBeCloseTo(slot.dimensions.depth, 6);
      disposeObjectTree(representation.root);
    }
  });

  it("preserva a ordem lógica por categoria, identidades e slots determinísticos", () => {
    const input = snapshot({
      movie: 2,
      physical_activity: 2,
      series: 2,
      study: 2,
      work: 2,
    });
    const first = assignLibraryWorldRecordsToSlots(input);
    const second = assignLibraryWorldRecordsToSlots(input);
    expect(first).toEqual(second);
    expect(first.placements.map(({ modelTypeId }) => modelTypeId)).toEqual([
      "movie-record",
      "movie-record",
      "series-record",
      "series-record",
      "study-record",
      "study-record",
      "physical-activity-record",
      "physical-activity-record",
      "work-record",
      "work-record",
    ]);
    expect(first.placements.map(({ slotId }) => slotId)).toEqual([
      "complementary-movie:slot-01",
      "complementary-movie:slot-02",
      "complementary-series:slot-01",
      "complementary-series:slot-02",
      "complementary-study:slot-01",
      "complementary-study:slot-02",
      "complementary-physical-activity:slot-01",
      "complementary-physical-activity:slot-02",
      "complementary-work:slot-01",
      "complementary-work:slot-02",
    ]);
    expect(
      first.placements.map(({ entryId, instanceId }) => [entryId, instanceId]),
    ).toEqual([
      ["movie-01", "library-movie:movie-01"],
      ["movie-02", "library-movie:movie-02"],
      ["series-01", "library-series:series-01"],
      ["series-02", "library-series:series-02"],
      ["study-01", "library-study:study-01"],
      ["study-02", "library-study:study-02"],
      [
        "physical_activity-01",
        "library-physical_activity:physical_activity-01",
      ],
      [
        "physical_activity-02",
        "library-physical_activity:physical_activity-02",
      ],
      ["work-01", "library-work:work-01"],
      ["work-02", "library-work:work-02"],
    ]);
  });

  it("distingue vazio, parcial, exatamente cheio e overflow ordenado em mais de uma categoria", () => {
    expect(assignLibraryWorldRecordsToSlots(snapshot({}))).toEqual({
      overflow: [],
      placements: [],
    });
    expect(
      assignLibraryWorldRecordsToSlots(snapshot({ movie: 1 })).placements,
    ).toHaveLength(1);
    const full = assignLibraryWorldRecordsToSlots(
      snapshot({
        movie: 6,
        physical_activity: 9,
        series: 7,
        study: 8,
        work: 7,
      }),
    );
    expect(full.placements).toHaveLength(COMPLEMENTARY_LIBRARY_RECORD_CAPACITY);
    expect(full.overflow).toEqual([]);
    const overfull = assignLibraryWorldRecordsToSlots(
      snapshot({
        movie: 8,
        physical_activity: 9,
        series: 9,
        study: 8,
        work: 7,
      }),
    );
    expect(overfull.placements).toHaveLength(
      COMPLEMENTARY_LIBRARY_RECORD_CAPACITY,
    );
    expect(overfull.overflow.map(({ instanceId }) => instanceId)).toEqual([
      "library-movie:movie-07",
      "library-movie:movie-08",
      "library-series:series-08",
      "library-series:series-09",
    ]);
  });

  it("mantém todos os volumes colocados em bounds e sem interseção positiva", () => {
    const assignment = assignLibraryWorldRecordsToSlots(
      snapshot({
        movie: 6,
        physical_activity: 9,
        series: 7,
        study: 8,
        work: 7,
      }),
    );
    const representations = assignment.placements.map(createRepresentation);
    const bounds = representations.map((representation, index) => {
      const placement = assignment.placements[index];
      if (!placement) throw new Error("Placement ausente.");
      representation.root.position.set(...placement.position);
      representation.root.updateMatrixWorld(true);
      return new Box3().setFromObject(representation.root);
    });
    for (const current of bounds) {
      expect(
        containsBoxWithTolerance(
          asBox3(COMPLEMENTARY_LIBRARY_RECORD_LAYOUT_CONFIGURATION.zone),
          current,
        ),
      ).toBe(true);
    }
    for (const [index, current] of bounds.entries()) {
      for (const other of bounds.slice(index + 1)) {
        expect(overlaps(current, other)).toBe(false);
      }
    }
    for (const representation of representations)
      disposeObjectTree(representation.root);
  });

  it("não cruza estantes, livros, paredes ou proxies técnicos efetivamente modelados", () => {
    const assignment = assignLibraryWorldRecordsToSlots(
      snapshot({
        movie: 6,
        physical_activity: 9,
        series: 7,
        study: 8,
        work: 7,
      }),
    );
    const world = new Group();
    const reference = createReferenceScene();
    const shelves = createProceduralComposition(
      READING_SHELF_COMPOSITION_DEFINITIONS,
    );
    world.add(reference.root, shelves.root);
    const books = READING_AREA_BOOK_SLOTS.map((slot, index) => {
      const book = createProceduralBookVolume({
        entryId: `book-${index + 1}`,
        instanceId: `reading-book:book-${index + 1}`,
        modelTypeId: "book-volume",
      });
      const shelf = shelves.instances.find(
        ({ identity }) => identity.instanceId === slot.hostInstanceId,
      );
      if (!shelf) throw new Error("Estante BF-2 ausente.");
      book.root.position.set(...slot.position);
      shelf.node.add(book.root);
      return book.root;
    });
    const placed = assignment.placements.map((placement) => {
      const representation = createRepresentation(placement);
      representation.root.position.set(...placement.position);
      world.add(representation.root);
      return representation.root;
    });
    world.updateMatrixWorld(true);
    const obstacles: readonly Object3D[] = [
      ...reference.root.children.filter(({ name }) => name !== "floor"),
      ...shelves.instances.map(({ node }) => node),
      ...books,
    ];
    for (const root of placed) {
      const bounds = new Box3().setFromObject(root);
      for (const obstacle of obstacles) {
        expect(overlaps(bounds, new Box3().setFromObject(obstacle))).toBe(
          false,
        );
      }
    }
    disposeObjectTree(world);
  });

  it("rejeita duplicatas e configuração inválida sem mutar entradas", () => {
    expect(() =>
      assignLibraryWorldRecordsToSlots(
        snapshot({ movie: 1, series: 1 }, "library-duplicate:01"),
      ),
    ).toThrow("instanceId duplicado");
    const firstArea =
      COMPLEMENTARY_LIBRARY_RECORD_LAYOUT_CONFIGURATION.areas[0];
    if (!firstArea) throw new Error("Área complementar ausente.");
    const invalid: LibraryRecordLayoutConfiguration = {
      ...COMPLEMENTARY_LIBRARY_RECORD_LAYOUT_CONFIGURATION,
      areas: [
        {
          ...firstArea,
          bounds: { ...firstArea.bounds, maxX: Number.NaN },
        },
        ...COMPLEMENTARY_LIBRARY_RECORD_LAYOUT_CONFIGURATION.areas.slice(1),
      ],
    };
    expect(() => createComplementaryLibraryRecordSlots(invalid)).toThrow(
      "bounds ou espaçamento inválidos",
    );

    const input = snapshot({ movie: 1 });
    const beforeInput = structuredClone(input);
    const configuration = structuredClone(
      COMPLEMENTARY_LIBRARY_RECORD_LAYOUT_CONFIGURATION,
    );
    const beforeConfiguration = structuredClone(configuration);
    const result = assignLibraryWorldRecordsToSlots(input, configuration);
    expect(input).toEqual(beforeInput);
    expect(configuration).toEqual(beforeConfiguration);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.placements)).toBe(true);
    expect(Object.isFrozen(result.placements[0])).toBe(true);
    expect(Object.isFrozen(result.placements[0]?.position)).toBe(true);
    expect(result.placements[0]).not.toHaveProperty("root");
    expect(result.overflow).toEqual([]);
  });
});
