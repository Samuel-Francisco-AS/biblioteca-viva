import type {
  StructureVisualDepthLayer,
  StructureVisualTransform,
} from "./structureVisualGeometry";

export interface StructureVisualDepth {
  readonly layer: StructureVisualDepthLayer;
  readonly stableKey: string;
  readonly value: number;
  readonly visualSortY: number;
}

export const STRUCTURE_DEPTH_CONTRACT = Object.freeze({
  interiorDepthOrigin: 40,
  layerOffsets: Object.freeze({
    "architecture-back": -0.25,
    "architecture-front": 0.25,
  } satisfies Readonly<Record<StructureVisualDepthLayer, number>>),
});

/** Pure depth projection from the bottommost visible canonical region. */
export function structureVisualDepth(
  transform: StructureVisualTransform,
): StructureVisualDepth {
  const { layer, visualSortY } = transform.depth;
  if (!Number.isFinite(visualSortY))
    throw new Error(`Depth visual inválido: ${transform.placementKey}`);
  return Object.freeze({
    layer,
    stableKey: transform.placementKey,
    value:
      STRUCTURE_DEPTH_CONTRACT.interiorDepthOrigin +
      visualSortY +
      STRUCTURE_DEPTH_CONTRACT.layerOffsets[layer],
    visualSortY,
  });
}

/** Stable tie-break for equal numeric depths, independent of input order. */
export function compareStructureVisualDepth(
  first: StructureVisualDepth,
  second: StructureVisualDepth,
): number {
  if (first.value !== second.value) return first.value - second.value;
  if (first.stableKey < second.stableKey) return -1;
  if (first.stableKey > second.stableKey) return 1;
  return 0;
}
