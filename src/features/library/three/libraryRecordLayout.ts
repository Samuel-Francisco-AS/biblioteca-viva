import type { LibraryWorldSnapshot } from "../libraryWorldEntryContract";
import {
  getProceduralLibraryRecordDimensions,
  type LibraryRecordModelTypeId,
  type ProceduralLibraryRecordDimensions,
} from "./libraryRecordDimensions";

export type LibraryRecordLayoutCategoryType =
  "movie" | "series" | "study" | "physical_activity" | "work";

export interface LibraryRecordLayoutBounds {
  readonly maxX: number;
  readonly maxY: number;
  readonly maxZ: number;
  readonly minX: number;
  readonly minY: number;
  readonly minZ: number;
}

export interface LibraryRecordLayoutArea {
  readonly areaId: string;
  readonly bounds: LibraryRecordLayoutBounds;
  readonly categoryType: LibraryRecordLayoutCategoryType;
  readonly horizontalGap: number;
  readonly horizontalMargin: number;
  readonly modelTypeId: LibraryRecordModelTypeId;
}

/** Renderer-independent declaration of the temporary complementary zone. */
export interface LibraryRecordLayoutConfiguration {
  readonly areas: readonly LibraryRecordLayoutArea[];
  readonly zone: LibraryRecordLayoutBounds;
}

/** The only record data that crosses from the projection into the layout. */
export interface LibraryRecordLayoutItem {
  readonly entryId: string;
  readonly instanceId: string;
  readonly modelTypeId: LibraryRecordModelTypeId;
}

export interface LibraryRecordLayoutSlot {
  readonly areaId: string;
  readonly bounds: LibraryRecordLayoutBounds;
  readonly categoryType: LibraryRecordLayoutCategoryType;
  readonly dimensions: Readonly<ProceduralLibraryRecordDimensions>;
  readonly modelTypeId: LibraryRecordModelTypeId;
  readonly position: readonly [number, number, number];
  readonly slotId: string;
}

export interface LibraryRecordPlacement extends LibraryRecordLayoutItem {
  readonly areaId: string;
  readonly position: readonly [number, number, number];
  readonly slotId: string;
}

export interface LibraryRecordSlotAssignment {
  readonly overflow: readonly LibraryRecordLayoutItem[];
  readonly placements: readonly LibraryRecordPlacement[];
}

function requiredLayoutAreaPair(
  categoryType: LibraryRecordLayoutCategoryType,
  modelTypeId: LibraryRecordModelTypeId,
): readonly [LibraryRecordLayoutCategoryType, LibraryRecordModelTypeId] {
  return Object.freeze([categoryType, modelTypeId]);
}

const REQUIRED_LAYOUT_AREA_PAIRS: readonly (readonly [
  LibraryRecordLayoutCategoryType,
  LibraryRecordModelTypeId,
])[] = Object.freeze([
  requiredLayoutAreaPair("movie", "movie-record"),
  requiredLayoutAreaPair("series", "series-record"),
  requiredLayoutAreaPair("study", "study-record"),
  requiredLayoutAreaPair("physical_activity", "physical-activity-record"),
  requiredLayoutAreaPair("work", "work-record"),
]);

const COMPLEMENTARY_ZONE: LibraryRecordLayoutBounds = Object.freeze({
  maxX: 2.8,
  maxY: 0.7,
  maxZ: 4.5,
  minX: -3.2,
  minY: 0,
  minZ: 1,
});

function area(
  areaId: string,
  categoryType: LibraryRecordLayoutCategoryType,
  modelTypeId: LibraryRecordModelTypeId,
  minZ: number,
  maxZ: number,
): LibraryRecordLayoutArea {
  return Object.freeze({
    areaId,
    bounds: Object.freeze({
      maxX: COMPLEMENTARY_ZONE.maxX,
      maxY: COMPLEMENTARY_ZONE.maxY,
      maxZ,
      minX: COMPLEMENTARY_ZONE.minX,
      minY: COMPLEMENTARY_ZONE.minY,
      minZ,
    }),
    categoryType,
    horizontalGap: 0.12,
    horizontalMargin: 0.2,
    modelTypeId,
  });
}

/**
 * Five shallow, front-central bands on the 14 x 10 m technical floor.
 * They are deliberately outside the reading shelves at z≈-2 and between the
 * lateral table/bench/crate proxy clusters. These are not final rooms.
 */
export const COMPLEMENTARY_LIBRARY_RECORD_LAYOUT_CONFIGURATION: Readonly<LibraryRecordLayoutConfiguration> =
  Object.freeze({
    areas: Object.freeze([
      area("complementary-movie", "movie", "movie-record", 1.15, 1.55),
      area("complementary-series", "series", "series-record", 1.8, 2.2),
      area("complementary-study", "study", "study-record", 2.45, 2.95),
      area(
        "complementary-physical-activity",
        "physical_activity",
        "physical-activity-record",
        3.2,
        3.7,
      ),
      area("complementary-work", "work", "work-record", 3.95, 4.45),
    ]),
    zone: COMPLEMENTARY_ZONE,
  });

function hasFiniteBounds(bounds: LibraryRecordLayoutBounds): boolean {
  return Object.values(bounds).every(Number.isFinite);
}

function containsBounds(
  outer: LibraryRecordLayoutBounds,
  inner: LibraryRecordLayoutBounds,
): boolean {
  return (
    inner.minX >= outer.minX &&
    inner.maxX <= outer.maxX &&
    inner.minY >= outer.minY &&
    inner.maxY <= outer.maxY &&
    inner.minZ >= outer.minZ &&
    inner.maxZ <= outer.maxZ
  );
}

function hasPositiveVolume(bounds: LibraryRecordLayoutBounds): boolean {
  return (
    bounds.maxX > bounds.minX &&
    bounds.maxY > bounds.minY &&
    bounds.maxZ > bounds.minZ
  );
}

function hasPositiveVolumeOverlap(
  first: LibraryRecordLayoutBounds,
  second: LibraryRecordLayoutBounds,
): boolean {
  return (
    Math.min(first.maxX, second.maxX) > Math.max(first.minX, second.minX) &&
    Math.min(first.maxY, second.maxY) > Math.max(first.minY, second.minY) &&
    Math.min(first.maxZ, second.maxZ) > Math.max(first.minZ, second.minZ)
  );
}

function validateConfiguration(
  configuration: LibraryRecordLayoutConfiguration,
): void {
  if (
    !hasFiniteBounds(configuration.zone) ||
    !hasPositiveVolume(configuration.zone)
  ) {
    throw new Error("A zona complementar exige bounds finitos e positivos.");
  }
  const areaIds = new Set<string>();
  const categories = new Set<LibraryRecordLayoutCategoryType>();
  const modelTypes = new Set<LibraryRecordModelTypeId>();
  for (const [areaIndex, layoutArea] of configuration.areas.entries()) {
    const { areaId, bounds, horizontalGap, horizontalMargin, modelTypeId } =
      layoutArea;
    if (typeof areaId !== "string" || areaId.trim().length === 0) {
      throw new Error("A configuração complementar contém areaId vazio.");
    }
    if (areaIds.has(areaId)) {
      throw new Error(
        `A configuração complementar contém areaId duplicado: ${areaId}.`,
      );
    }
    if (categories.has(layoutArea.categoryType)) {
      throw new Error(
        `A configuração complementar contém categoria duplicada: ${layoutArea.categoryType}.`,
      );
    }
    if (modelTypes.has(modelTypeId)) {
      throw new Error(
        `A configuração complementar contém modelTypeId duplicado: ${modelTypeId}.`,
      );
    }
    if (
      !hasFiniteBounds(bounds) ||
      !hasPositiveVolume(bounds) ||
      !containsBounds(configuration.zone, bounds) ||
      !Number.isFinite(horizontalGap) ||
      !Number.isFinite(horizontalMargin) ||
      horizontalGap <= 0 ||
      horizontalMargin < 0
    ) {
      throw new Error(
        `A área complementar ${areaId} possui bounds ou espaçamento inválidos.`,
      );
    }
    const requiredPair = REQUIRED_LAYOUT_AREA_PAIRS.find(
      ([categoryType]) => categoryType === layoutArea.categoryType,
    );
    if (!requiredPair || requiredPair[1] !== modelTypeId) {
      throw new Error(
        `A área complementar ${areaId} não corresponde ao tipo semântico ${layoutArea.categoryType}.`,
      );
    }
    if (
      REQUIRED_LAYOUT_AREA_PAIRS[areaIndex]?.[0] !== layoutArea.categoryType
    ) {
      throw new Error(
        `A configuração complementar exige a ordem lógica das categorias: ${REQUIRED_LAYOUT_AREA_PAIRS.map(([type]) => type).join(", ")}.`,
      );
    }
    for (const precedingArea of configuration.areas.slice(0, areaIndex)) {
      if (hasPositiveVolumeOverlap(bounds, precedingArea.bounds)) {
        throw new Error(
          `As áreas complementares ${precedingArea.areaId} e ${areaId} possuem interseção positiva.`,
        );
      }
    }
    const dimensions = getProceduralLibraryRecordDimensions(modelTypeId);
    if (
      bounds.maxY - bounds.minY < dimensions.height ||
      bounds.maxZ - bounds.minZ <= dimensions.depth ||
      bounds.maxX - bounds.minX <= dimensions.width + horizontalMargin * 2
    ) {
      throw new Error(
        `A área complementar ${areaId} não comporta ${modelTypeId} com espaçamento positivo.`,
      );
    }
    areaIds.add(areaId);
    categories.add(layoutArea.categoryType);
    modelTypes.add(modelTypeId);
  }
  for (const [categoryType, modelTypeId] of REQUIRED_LAYOUT_AREA_PAIRS) {
    if (!categories.has(categoryType) || !modelTypes.has(modelTypeId)) {
      throw new Error(
        `A configuração complementar exige a área ${categoryType}/${modelTypeId}.`,
      );
    }
  }
}

function slotBounds(
  position: readonly [number, number, number],
  dimensions: Readonly<ProceduralLibraryRecordDimensions>,
): LibraryRecordLayoutBounds {
  return Object.freeze({
    maxX: position[0] + dimensions.width / 2,
    maxY: position[1] + dimensions.height,
    maxZ: position[2] + dimensions.depth / 2,
    minX: position[0] - dimensions.width / 2,
    minY: position[1],
    minZ: position[2] - dimensions.depth / 2,
  });
}

/**
 * Derives finite slots from actual C1 envelopes and declarative band bounds.
 * Area order is the category fill order; slots are left-to-right inside one
 * area. No Three.js object is imported or created here.
 */
export function createComplementaryLibraryRecordSlots(
  configuration: LibraryRecordLayoutConfiguration = COMPLEMENTARY_LIBRARY_RECORD_LAYOUT_CONFIGURATION,
): readonly LibraryRecordLayoutSlot[] {
  validateConfiguration(configuration);
  const slots: LibraryRecordLayoutSlot[] = [];
  for (const layoutArea of configuration.areas) {
    const dimensions = getProceduralLibraryRecordDimensions(
      layoutArea.modelTypeId,
    );
    const usableWidth =
      layoutArea.bounds.maxX -
      layoutArea.bounds.minX -
      layoutArea.horizontalMargin * 2;
    const count = Math.floor(
      (usableWidth + layoutArea.horizontalGap) /
        (dimensions.width + layoutArea.horizontalGap),
    );
    if (count < 1) {
      throw new Error(
        `A área complementar ${layoutArea.areaId} não gera slot.`,
      );
    }
    const firstX =
      layoutArea.bounds.minX +
      layoutArea.horizontalMargin +
      dimensions.width / 2;
    const positionZ = (layoutArea.bounds.minZ + layoutArea.bounds.maxZ) / 2;
    for (let index = 0; index < count; index += 1) {
      const position = Object.freeze([
        firstX + index * (dimensions.width + layoutArea.horizontalGap),
        layoutArea.bounds.minY,
        positionZ,
      ] as [number, number, number]);
      const bounds = slotBounds(position, dimensions);
      if (!containsBounds(layoutArea.bounds, bounds)) {
        throw new Error(
          `O slot ${layoutArea.areaId}:${index + 1} ultrapassa sua área.`,
        );
      }
      slots.push(
        Object.freeze({
          areaId: layoutArea.areaId,
          bounds,
          categoryType: layoutArea.categoryType,
          dimensions,
          modelTypeId: layoutArea.modelTypeId,
          position,
          slotId: `${layoutArea.areaId}:slot-${String(index + 1).padStart(2, "0")}`,
        }),
      );
    }
  }
  return Object.freeze(slots);
}

export const COMPLEMENTARY_LIBRARY_RECORD_SLOTS: readonly LibraryRecordLayoutSlot[] =
  createComplementaryLibraryRecordSlots();

export const COMPLEMENTARY_LIBRARY_RECORD_CAPACITY =
  COMPLEMENTARY_LIBRARY_RECORD_SLOTS.length;

function validateLayoutItem(
  item: LibraryRecordLayoutItem,
  expectedModelTypeId: LibraryRecordModelTypeId,
): void {
  if (
    typeof item.entryId !== "string" ||
    item.entryId.trim().length === 0 ||
    typeof item.instanceId !== "string" ||
    item.instanceId.trim().length === 0
  ) {
    throw new Error(
      "O layout complementar exige entryId e instanceId não vazios.",
    );
  }
  if (item.modelTypeId !== expectedModelTypeId) {
    throw new Error(
      `A categoria complementar não corresponde a ${expectedModelTypeId}.`,
    );
  }
}

function isLibraryRecordModelTypeId(
  modelTypeId: string,
): modelTypeId is LibraryRecordModelTypeId {
  return Object.hasOwn(PROCEDURAL_LIBRARY_RECORD_MODEL_TYPES, modelTypeId);
}

const PROCEDURAL_LIBRARY_RECORD_MODEL_TYPES: Readonly<
  Record<LibraryRecordModelTypeId, true>
> = Object.freeze({
  "movie-record": true,
  "physical-activity-record": true,
  "series-record": true,
  "study-record": true,
  "work-record": true,
});

/**
 * Assigns projected BF-3B occurrences without sorting them. It returns only
 * identity plus provisional spatial data; title/progress and other
 * presentation fields never enter the result. Overflow keeps the same logical
 * category and occurrence ordering and has no Three/root representation.
 */
export function assignLibraryWorldRecordsToSlots(
  snapshot: LibraryWorldSnapshot,
  configuration: LibraryRecordLayoutConfiguration = COMPLEMENTARY_LIBRARY_RECORD_LAYOUT_CONFIGURATION,
): LibraryRecordSlotAssignment {
  const slots = createComplementaryLibraryRecordSlots(configuration);
  const slotsByModelType = new Map<
    LibraryRecordModelTypeId,
    readonly LibraryRecordLayoutSlot[]
  >();
  for (const slot of slots) {
    const existing = slotsByModelType.get(slot.modelTypeId) ?? [];
    slotsByModelType.set(slot.modelTypeId, [...existing, slot]);
  }

  const placements: LibraryRecordPlacement[] = [];
  const overflow: LibraryRecordLayoutItem[] = [];
  const instanceIds = new Set<string>();
  for (const layoutArea of configuration.areas) {
    const category = snapshot.categories.find(
      ({ type }) => type === layoutArea.categoryType,
    );
    if (!category) {
      throw new Error(
        `O snapshot não contém a categoria ${layoutArea.categoryType}.`,
      );
    }
    const categorySlots = slotsByModelType.get(layoutArea.modelTypeId) ?? [];
    for (const [index, entry] of category.entries.entries()) {
      if (!isLibraryRecordModelTypeId(entry.modelTypeId)) {
        throw new Error(
          `A categoria complementar contém modelTypeId inválido: ${entry.modelTypeId}.`,
        );
      }
      const item: LibraryRecordLayoutItem = {
        entryId: entry.entryId,
        instanceId: entry.instanceId,
        modelTypeId: entry.modelTypeId,
      };
      validateLayoutItem(item, layoutArea.modelTypeId);
      if (instanceIds.has(item.instanceId)) {
        throw new Error(
          `O layout complementar contém instanceId duplicado: ${item.instanceId}.`,
        );
      }
      instanceIds.add(item.instanceId);
      const frozenItem = Object.freeze(item);
      const slot = categorySlots[index];
      if (!slot) {
        overflow.push(frozenItem);
        continue;
      }
      placements.push(
        Object.freeze({
          areaId: slot.areaId,
          entryId: frozenItem.entryId,
          instanceId: frozenItem.instanceId,
          modelTypeId: frozenItem.modelTypeId,
          position: slot.position,
          slotId: slot.slotId,
        }),
      );
    }
  }
  return Object.freeze({
    overflow: Object.freeze(overflow),
    placements: Object.freeze(placements),
  });
}
