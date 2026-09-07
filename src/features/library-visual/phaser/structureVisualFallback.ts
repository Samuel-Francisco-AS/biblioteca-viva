import type {
  StructureInteractionRegion,
  StructureVisualTransform,
  WorldJoinPlane,
  WorldRectangle,
} from "./structureVisualGeometry";
import type { StructureVisualDepth } from "./structureVisualDepth";

export interface StructureVisualFallbackGeometry {
  readonly bounds: WorldRectangle;
  readonly definitionId: StructureVisualTransform["definitionId"];
  readonly depth: number;
  readonly instanceId: string;
  readonly joinPlanes: readonly WorldJoinPlane[];
  readonly regions: readonly StructureInteractionRegion[];
}

/**
 * Pure fallback projection from the measured occupied regions of the canonical
 * transform. Those regions and each plane's visualProfile remain visual even
 * when its structural connection profile is narrower, so a corner remains two
 * arms and a door keeps its leaf/overhang envelope.
 */
export function structureVisualFallbackGeometry(
  transform: StructureVisualTransform,
  depth: StructureVisualDepth,
): StructureVisualFallbackGeometry {
  assertMatchingDepth(transform, depth);
  const regions = transform.interactionRegions;
  if (regions.length === 0)
    throw new Error(`Fallback visual sem regiões: ${transform.placementKey}`);
  for (const region of regions) assertRegion(transform, region);
  for (const plane of transform.joinPlanes)
    assertPlaneMatchesRegion(transform, plane, regions);

  const left = Math.min(...regions.map(({ bounds }) => bounds.x));
  const top = Math.min(...regions.map(({ bounds }) => bounds.y));
  const right = Math.max(
    ...regions.map(({ bounds }) => bounds.x + bounds.width),
  );
  const bottom = Math.max(
    ...regions.map(({ bounds }) => bounds.y + bounds.height),
  );

  return Object.freeze({
    bounds: Object.freeze({
      height: bottom - top,
      width: right - left,
      x: left,
      y: top,
    }),
    definitionId: transform.definitionId,
    depth: depth.value,
    instanceId: transform.placementKey,
    joinPlanes: transform.joinPlanes,
    regions,
  });
}

function assertMatchingDepth(
  transform: StructureVisualTransform,
  depth: StructureVisualDepth,
): void {
  if (
    depth.stableKey !== transform.placementKey ||
    depth.layer !== transform.depth.layer ||
    depth.visualSortY !== transform.depth.visualSortY ||
    !Number.isFinite(depth.value)
  )
    throw new Error(`Depth de fallback incoerente: ${transform.placementKey}`);
}

function assertRegion(
  transform: StructureVisualTransform,
  region: StructureInteractionRegion,
): void {
  const { height, width, x, y } = region.bounds;
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  )
    throw new Error(`Região de fallback incoerente: ${transform.placementKey}`);
}

function assertPlaneMatchesRegion(
  transform: StructureVisualTransform,
  plane: WorldJoinPlane,
  regions: readonly StructureInteractionRegion[],
): void {
  const region = regions.find(({ part }) => part === plane.part);
  if (!region)
    throw new Error(`Plano de fallback sem região: ${transform.placementKey}`);
  const { bounds } = region;
  const expectedCoordinate =
    plane.side === "west"
      ? bounds.x
      : plane.side === "east"
        ? bounds.x + bounds.width
        : plane.side === "north"
          ? bounds.y
          : bounds.y + bounds.height;
  const expectedProfile =
    plane.axis === "x"
      ? { end: bounds.y + bounds.height, start: bounds.y }
      : { end: bounds.x + bounds.width, start: bounds.x };
  if (
    !nearlyEqual(plane.coordinate, expectedCoordinate) ||
    !nearlyEqual(plane.visualProfile.start, expectedProfile.start) ||
    !nearlyEqual(plane.visualProfile.end, expectedProfile.end)
  )
    throw new Error(`Plano de fallback incoerente: ${transform.placementKey}`);
}

function nearlyEqual(first: number, second: number): boolean {
  return Math.abs(first - second) <= 1e-9;
}
