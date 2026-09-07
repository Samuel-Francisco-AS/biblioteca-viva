import wallCornerContract from "../../../../art-guides/w3-a-r2-a/wall-corner-contract.json" with { type: "json" };
import {
  placementGeometry,
  structureDefinition,
  type CornerOrientation,
  type EdgeAxis,
  type GridPoint,
  type LogicalPlacementGeometry,
  type LogicalStructureIntervalPart,
  type StructureDefinition,
  type StructureDefinitionId,
  type StructurePlacement,
} from "../../../application/worldStructure";
import type { NormalizedStructureOrientation } from "../../../application/worldStructureAnalysis";

import { CELL_SIZE } from "./spatialWorld";
import type {
  StructureInteriorNormal,
  StructurePlacementInteriorNormals,
} from "./structureVisualTopology";

export type StructureVisualDefinitionId = Exclude<
  StructureDefinitionId,
  "architecture.floor.wood-01"
>;
export type StructureVisualRole =
  "corner" | "door-horizontal" | "segment-horizontal" | "segment-vertical";
export type StructureVisualDepthLayer =
  "architecture-back" | "architecture-front";
export type StructureVisualSide = "east" | "north" | "south" | "west";
export type StructureVisualPart = "horizontal-arm" | "main" | "vertical-arm";
export type CartesianAxis = "x" | "y";
export type TransverseOccupiedSide = "negative" | "positive" | "straddles-axis";
/**
 * Alpha-contour audit of the straight/corner joins: this is the least source
 * overdraw that closes every scanline in the stable body of both wall axes.
 */
export const STRUCTURE_LONGITUDINAL_SEAM_OVERDRAW_SOURCE_PX = 14;
export const HORIZONTAL_STRUCTURE_CONNECTION_PROFILE_CLASS =
  wallCornerContract.referenceProfiles.horizontal.compatibilityClass;
export type StructureConnectionProfileClassId =
  typeof HORIZONTAL_STRUCTURE_CONNECTION_PROFILE_CLASS;

export interface HalfOpenInterval {
  readonly end: number;
  readonly start: number;
}

export interface PixelPoint {
  readonly x: number;
  readonly y: number;
}

export interface PixelRectangle extends PixelPoint {
  readonly height: number;
  readonly width: number;
}

export interface StructureConnectionProfileClass {
  readonly axis: EdgeAxis;
  readonly compatibilityClass: StructureConnectionProfileClassId;
  readonly referenceAsset: string;
  readonly sourceInterval: HalfOpenInterval;
  readonly sourceThicknessPx: number;
}

export type SourceConnectionProfile =
  | {
      readonly kind: "measured";
    }
  | {
      readonly compatibilityClass: StructureConnectionProfileClassId;
      readonly kind: "compatibility-reference";
      readonly sourceSide: "after-reference" | "before-reference";
    };

export interface SourceJoinPlane {
  readonly axis: CartesianAxis;
  readonly connectionProfile: SourceConnectionProfile;
  readonly coordinate: number;
  readonly part: StructureVisualPart;
  /** Half-open structural connection profile in source pixels. */
  readonly profile: HalfOpenInterval;
  readonly side: StructureVisualSide;
  /** Full visual envelope at the plane, including non-structural overhang. */
  readonly visualProfile: HalfOpenInterval;
}

export interface StructureVisualArm {
  readonly axis: EdgeAxis;
  readonly direction: StructureVisualSide;
  readonly part: Exclude<StructureVisualPart, "main">;
}

export interface StructureVisualRegion {
  readonly bounds: PixelRectangle;
  readonly part: StructureVisualPart;
}

export interface StructureVisualAssetMetadata {
  readonly alphaBoundsPx: PixelRectangle;
  readonly arms: readonly StructureVisualArm[];
  readonly axes: readonly EdgeAxis[];
  readonly canvasPx: { readonly height: number; readonly width: number };
  readonly corner?: CornerOrientation;
  readonly definitionId: StructureVisualDefinitionId;
  readonly depth: {
    readonly layer: StructureVisualDepthLayer;
    readonly sortReference: "visible-bounds-bottom";
  };
  readonly joinPlanesPx: readonly SourceJoinPlane[];
  readonly logicalSpanCells: number;
  readonly occupiedRegionsPx: readonly StructureVisualRegion[];
  readonly orientation: NormalizedStructureOrientation;
  readonly role: StructureVisualRole;
  readonly runtimePath: string;
  /** Pixel point mapped exactly to the logical reference in world units. */
  readonly sourceReferencePx: PixelPoint;
  readonly sourcePixelsPerCell: number;
  readonly textureKey: StructureVisualDefinitionId;
}

export interface WorldRectangle extends GridPoint {
  readonly height: number;
  readonly width: number;
}

export interface WorldJoinPlane {
  /** Cartesian axis on which the longitudinal endpoint coordinate lies. */
  readonly axis: CartesianAxis;
  readonly connectionProfile: SourceConnectionProfile;
  readonly coordinate: number;
  readonly logicalEndpoint: GridPoint;
  readonly longitudinalAxis: EdgeAxis;
  readonly part: StructureVisualPart;
  /** Half-open structural connection profile in world units. */
  readonly profile: HalfOpenInterval;
  /** Existing longitudinal endpoint side; this is not the occupied cross side. */
  readonly side: StructureVisualSide;
  readonly transverseProfile: WorldTransverseProfile;
  /** Full visual envelope at the plane in world units. */
  readonly visualProfile: HalfOpenInterval;
}

export interface TransverseNormal {
  readonly axis: CartesianAxis;
  readonly negativeDirection: "north" | "west";
  readonly positiveDirection: "east" | "south";
}

export interface WorldTransverseProfile {
  /** Signed centerline offset from the logical structure axis. */
  readonly axisRelativeCenterline: number;
  /** Half-open interval expressed as signed offsets from the logical axis. */
  readonly axisRelativeInterval: HalfOpenInterval;
  readonly centerline: number;
  readonly interval: HalfOpenInterval;
  /** World coordinate of the logical structure axis on the transverse axis. */
  readonly logicalAxisCoordinate: number;
  readonly normal: TransverseNormal;
  readonly occupiedSide: TransverseOccupiedSide;
  /** Exactly one source pixel converted by this asset's scale. */
  readonly sourcePixelTolerance: number;
  readonly thickness: number;
}

export interface StructureInteractionRegion {
  readonly bounds: WorldRectangle;
  readonly part: StructureVisualPart;
}

export interface StructureSpriteRendering {
  readonly longitudinalOverdraw:
    | {
        readonly axis: EdgeAxis;
        readonly sourcePixelsPerEndpoint: number;
        readonly worldUnitsPerEndpoint: number;
      }
    | undefined;
  readonly position: GridPoint;
  readonly scale: GridPoint;
}

export interface StructureVisualAlignmentConstraint {
  readonly axis: CartesianAxis;
  readonly measuredProfile: HalfOpenInterval;
  readonly normal: StructureInteriorNormal;
  readonly part: StructureVisualPart;
  readonly sourcePixelTolerance: number;
  readonly targetProfile: HalfOpenInterval;
  readonly translation: number;
}

export type StructureVisualAlignmentIssue =
  | {
      readonly kind: "ambiguous-interior-normal";
      readonly part: LogicalStructureIntervalPart;
      readonly reason:
        "floor-on-both-sides" | "mixed-edge-adjacency" | "no-adjacent-floor";
    }
  | {
      readonly kind: "conflicting-axis-translations";
      readonly axis: CartesianAxis;
      readonly translations: readonly number[];
    }
  | {
      readonly kind: "inconsistent-interior-normal";
      readonly part: LogicalStructureIntervalPart;
      readonly reason: "contradictory-floor-sides";
    }
  | {
      readonly kind: "missing-interior-normal";
      readonly part: LogicalStructureIntervalPart;
    }
  | {
      readonly kind: "normal-axis-mismatch";
      readonly normalAxis: CartesianAxis;
      readonly part: StructureVisualPart;
      readonly transverseAxis: CartesianAxis;
    };

export type StructureVisualAlignment =
  | {
      readonly constraints: readonly StructureVisualAlignmentConstraint[];
      readonly issues: readonly StructureVisualAlignmentIssue[];
      readonly kind: "not-requested";
      readonly translation: GridPoint;
    }
  | {
      readonly constraints: readonly StructureVisualAlignmentConstraint[];
      readonly issues: readonly StructureVisualAlignmentIssue[];
      readonly kind: "applied";
      readonly translation: GridPoint;
    }
  | {
      readonly constraints: readonly StructureVisualAlignmentConstraint[];
      readonly issues: readonly StructureVisualAlignmentIssue[];
      readonly kind: "preserved";
      readonly translation: GridPoint;
    };

export interface StructureVisualTransform {
  readonly alignment: StructureVisualAlignment;
  readonly alphaBounds: WorldRectangle;
  readonly canvasBounds: WorldRectangle;
  readonly definitionId: StructureVisualDefinitionId;
  readonly depth: {
    readonly layer: StructureVisualDepthLayer;
    readonly visualSortY: number;
  };
  readonly interactionRegions: readonly StructureInteractionRegion[];
  readonly joinOrigin: GridPoint;
  readonly joinPlanes: readonly WorldJoinPlane[];
  readonly logicalReference: GridPoint;
  readonly orientation: NormalizedStructureOrientation;
  readonly placementKey: string;
  readonly scale: number;
  readonly spriteCanvasPosition: GridPoint;
  readonly spriteRendering: StructureSpriteRendering;
  readonly textureKey: StructureVisualDefinitionId;
}

export interface StructureVisualTransformInput {
  readonly definition: StructureDefinition;
  readonly geometry: LogicalPlacementGeometry;
  readonly metadata: StructureVisualAssetMetadata;
  readonly interiorNormals?: StructurePlacementInteriorNormals;
  readonly orientation: NormalizedStructureOrientation;
  readonly placement: StructurePlacement;
}

const SOURCE_PIXELS_PER_CELL = 300;
const WALL_RUNTIME_ROOT = "/assets/world/architecture/walls/";

function horizontalConnectionProfileClass(): StructureConnectionProfileClass {
  const profile = wallCornerContract.referenceProfiles.horizontal;
  if (
    typeof profile.compatibilityClass !== "string" ||
    profile.compatibilityClass.length === 0 ||
    profile.alphaEndExclusive - profile.alphaStart !== profile.alphaThickness ||
    profile.alphaThickness <= 0
  )
    throw new Error("Perfil estrutural horizontal incoerente.");
  return Object.freeze({
    axis: "horizontal",
    compatibilityClass: HORIZONTAL_STRUCTURE_CONNECTION_PROFILE_CLASS,
    referenceAsset: profile.asset,
    sourceInterval: Object.freeze({
      end: profile.alphaEndExclusive,
      start: profile.alphaStart,
    }),
    sourceThicknessPx: profile.alphaThickness,
  });
}

export const STRUCTURE_CONNECTION_PROFILE_CLASSES: readonly StructureConnectionProfileClass[] =
  Object.freeze([horizontalConnectionProfileClass()]);

const STRUCTURE_CONNECTION_PROFILE_CLASS_BY_ID = new Map<
  string,
  StructureConnectionProfileClass
>(
  STRUCTURE_CONNECTION_PROFILE_CLASSES.map((profile) => [
    profile.compatibilityClass,
    profile,
  ]),
);

export function structureConnectionProfileClass(
  compatibilityClass: string,
): StructureConnectionProfileClass | undefined {
  return STRUCTURE_CONNECTION_PROFILE_CLASS_BY_ID.get(compatibilityClass);
}

const rectangle = (
  x: number,
  y: number,
  width: number,
  height: number,
): PixelRectangle => Object.freeze({ height, width, x, y });

const point = (x: number, y: number): PixelPoint => Object.freeze({ x, y });

function region(
  part: StructureVisualPart,
  bounds: PixelRectangle,
): StructureVisualRegion {
  return Object.freeze({ bounds, part });
}

function plane(
  axis: SourceJoinPlane["axis"],
  coordinate: number,
  side: StructureVisualSide,
  part: StructureVisualPart,
  start: number,
  end: number,
  connectionProfile: SourceConnectionProfile = Object.freeze({
    kind: "measured",
  }),
  sourceReferenceTransverse?: number,
): SourceJoinPlane {
  const visualProfile = Object.freeze({ end, start });
  const profile = resolveSourceConnectionProfile(
    connectionProfile,
    visualProfile,
    sourceReferenceTransverse,
  );
  return Object.freeze({
    axis,
    connectionProfile,
    coordinate,
    part,
    profile,
    side,
    visualProfile,
  });
}

function sharedHorizontalConnectionProfile(
  sourceSide: "after-reference" | "before-reference",
): SourceConnectionProfile {
  return Object.freeze({
    compatibilityClass: HORIZONTAL_STRUCTURE_CONNECTION_PROFILE_CLASS,
    kind: "compatibility-reference",
    sourceSide,
  });
}

function resolveSourceConnectionProfile(
  connectionProfile: SourceConnectionProfile,
  measuredProfile: HalfOpenInterval,
  sourceReferenceTransverse?: number,
): HalfOpenInterval {
  if (connectionProfile.kind === "measured") return measuredProfile;
  const profileClass = structureConnectionProfileClass(
    connectionProfile.compatibilityClass,
  );
  if (!profileClass || sourceReferenceTransverse === undefined)
    throw new Error("Referência de perfil estrutural incoerente.");
  return connectionProfile.sourceSide === "after-reference"
    ? Object.freeze({
        end: sourceReferenceTransverse + profileClass.sourceThicknessPx,
        start: sourceReferenceTransverse,
      })
    : Object.freeze({
        end: sourceReferenceTransverse,
        start: sourceReferenceTransverse - profileClass.sourceThicknessPx,
      });
}

interface LinearMetadataInput {
  readonly alphaBoundsPx: PixelRectangle;
  readonly canvasPx: { readonly height: number; readonly width: number };
  readonly definitionId: StructureVisualDefinitionId;
  readonly file: string;
  readonly logicalSpanCells: number;
  readonly orientation: EdgeAxis;
  readonly role: Exclude<StructureVisualRole, "corner">;
}

function linearMetadata(
  input: LinearMetadataInput,
): StructureVisualAssetMetadata {
  const { alphaBoundsPx, orientation } = input;
  const longitudinalStart =
    orientation === "horizontal" ? alphaBoundsPx.x : alphaBoundsPx.y;
  const longitudinalEnd =
    longitudinalStart +
    (orientation === "horizontal" ? alphaBoundsPx.width : alphaBoundsPx.height);
  const profileStart =
    orientation === "horizontal" ? alphaBoundsPx.y : alphaBoundsPx.x;
  const profileEnd =
    profileStart +
    (orientation === "horizontal" ? alphaBoundsPx.height : alphaBoundsPx.width);
  const connectionProfile =
    orientation === "horizontal"
      ? sharedHorizontalConnectionProfile("after-reference")
      : undefined;
  const sourceReferenceTransverse =
    orientation === "horizontal" ? alphaBoundsPx.y : alphaBoundsPx.x;
  return freezeMetadata({
    ...input,
    arms: [],
    axes: [orientation],
    depth: {
      layer: "architecture-back",
      sortReference: "visible-bounds-bottom",
    },
    joinPlanesPx:
      orientation === "horizontal"
        ? [
            plane(
              "x",
              longitudinalStart,
              "west",
              "main",
              profileStart,
              profileEnd,
              connectionProfile,
              sourceReferenceTransverse,
            ),
            plane(
              "x",
              longitudinalEnd,
              "east",
              "main",
              profileStart,
              profileEnd,
              connectionProfile,
              sourceReferenceTransverse,
            ),
          ]
        : [
            plane(
              "y",
              longitudinalStart,
              "north",
              "main",
              profileStart,
              profileEnd,
            ),
            plane(
              "y",
              longitudinalEnd,
              "south",
              "main",
              profileStart,
              profileEnd,
            ),
          ],
    occupiedRegionsPx: [region("main", alphaBoundsPx)],
    sourceReferencePx: point(alphaBoundsPx.x, alphaBoundsPx.y),
    sourcePixelsPerCell: SOURCE_PIXELS_PER_CELL,
    textureKey: input.definitionId,
  });
}

interface CornerMetadataInput {
  readonly corner: CornerOrientation;
  readonly depthLayer: StructureVisualDepthLayer;
  readonly horizontalDirection: "east" | "west";
  readonly horizontalRegion: PixelRectangle;
  readonly horizontalSide: "east" | "west";
  readonly sourceReferencePx: PixelPoint;
  readonly verticalDirection: "north" | "south";
  readonly verticalRegion: PixelRectangle;
  readonly verticalSide: "north" | "south";
}

function cornerMetadata(
  input: CornerMetadataInput,
): StructureVisualAssetMetadata {
  const definitionId =
    `architecture.wall.stone-01.corner-${input.corner}` as const;
  const horizontalCoordinate =
    input.horizontalSide === "west"
      ? input.horizontalRegion.x
      : input.horizontalRegion.x + input.horizontalRegion.width;
  const verticalCoordinate =
    input.verticalSide === "north"
      ? input.verticalRegion.y
      : input.verticalRegion.y + input.verticalRegion.height;
  const horizontalSourceSide = sourceSideForRegion(
    input.horizontalRegion.y,
    input.horizontalRegion.height,
    input.sourceReferencePx.y,
  );
  return freezeMetadata({
    alphaBoundsPx: rectangle(24, 24, 1200, 1200),
    arms: [
      {
        axis: "horizontal",
        direction: input.horizontalDirection,
        part: "horizontal-arm",
      },
      {
        axis: "vertical",
        direction: input.verticalDirection,
        part: "vertical-arm",
      },
    ],
    axes: ["horizontal", "vertical"],
    canvasPx: { height: 1248, width: 1248 },
    corner: input.corner,
    definitionId,
    depth: {
      layer: input.depthLayer,
      sortReference: "visible-bounds-bottom",
    },
    joinPlanesPx: [
      plane(
        "x",
        horizontalCoordinate,
        input.horizontalSide,
        "horizontal-arm",
        input.horizontalRegion.y,
        input.horizontalRegion.y + input.horizontalRegion.height,
        sharedHorizontalConnectionProfile(horizontalSourceSide),
        input.sourceReferencePx.y,
      ),
      plane(
        "y",
        verticalCoordinate,
        input.verticalSide,
        "vertical-arm",
        input.verticalRegion.x,
        input.verticalRegion.x + input.verticalRegion.width,
      ),
    ],
    logicalSpanCells: 4,
    occupiedRegionsPx: [
      region("horizontal-arm", input.horizontalRegion),
      region("vertical-arm", input.verticalRegion),
    ],
    orientation: input.corner,
    role: "corner",
    runtimePath: `${WALL_RUNTIME_ROOT}wall-corner-${input.corner}.png`,
    sourcePixelsPerCell: SOURCE_PIXELS_PER_CELL,
    sourceReferencePx: input.sourceReferencePx,
    textureKey: definitionId,
  });
}

export const STRUCTURE_VISUAL_ASSETS: readonly StructureVisualAssetMetadata[] =
  Object.freeze([
    cornerMetadata({
      corner: "ne",
      depthLayer: "architecture-back",
      horizontalDirection: "west",
      horizontalRegion: rectangle(24, 795, 1200, 429),
      horizontalSide: "west",
      sourceReferencePx: point(1224, 1224),
      verticalDirection: "north",
      verticalRegion: rectangle(988, 24, 236, 1200),
      verticalSide: "north",
    }),
    cornerMetadata({
      corner: "nw",
      depthLayer: "architecture-back",
      horizontalDirection: "east",
      horizontalRegion: rectangle(24, 795, 1200, 429),
      horizontalSide: "east",
      sourceReferencePx: point(24, 1224),
      verticalDirection: "north",
      verticalRegion: rectangle(24, 24, 236, 1200),
      verticalSide: "north",
    }),
    cornerMetadata({
      corner: "se",
      depthLayer: "architecture-front",
      horizontalDirection: "west",
      horizontalRegion: rectangle(24, 24, 1200, 429),
      horizontalSide: "west",
      sourceReferencePx: point(1224, 24),
      verticalDirection: "south",
      verticalRegion: rectangle(988, 24, 236, 1200),
      verticalSide: "south",
    }),
    cornerMetadata({
      corner: "sw",
      depthLayer: "architecture-front",
      horizontalDirection: "east",
      horizontalRegion: rectangle(24, 24, 1200, 429),
      horizontalSide: "east",
      sourceReferencePx: point(24, 24),
      verticalDirection: "south",
      verticalRegion: rectangle(24, 24, 236, 1200),
      verticalSide: "south",
    }),
    linearMetadata({
      alphaBoundsPx: rectangle(24, 24, 1200, 564),
      canvasPx: { height: 612, width: 1248 },
      definitionId: "architecture.wall.stone-01.door-horizontal.closed",
      file: "wall-door-horizontal-closed.png",
      logicalSpanCells: 4,
      orientation: "horizontal",
      role: "door-horizontal",
    }),
    linearMetadata({
      alphaBoundsPx: rectangle(24, 24, 1200, 740),
      canvasPx: { height: 788, width: 1248 },
      definitionId: "architecture.wall.stone-01.door-horizontal.open",
      file: "wall-door-horizontal-open.png",
      logicalSpanCells: 4,
      orientation: "horizontal",
      role: "door-horizontal",
    }),
    ...([1, 2, 4] as const).flatMap((span) => [
      linearMetadata({
        alphaBoundsPx: rectangle(24, 24, span * 300, 429),
        canvasPx: { height: 477, width: span * 300 + 48 },
        definitionId: `architecture.wall.stone-01.horizontal-${span}`,
        file:
          span === 4
            ? "wall-horizontal.png"
            : `wall-horizontal-${span}cell.png`,
        logicalSpanCells: span,
        orientation: "horizontal",
        role: "segment-horizontal",
      }),
      linearMetadata({
        alphaBoundsPx: rectangle(
          span === 4 ? 24 : 25,
          24,
          span === 4 ? 236 : 235,
          span * 300,
        ),
        canvasPx: { height: span * 300 + 48, width: 284 },
        definitionId: `architecture.wall.stone-01.vertical-${span}`,
        file:
          span === 4 ? "wall-vertical.png" : `wall-vertical-${span}cell.png`,
        logicalSpanCells: span,
        orientation: "vertical",
        role: "segment-vertical",
      }),
    ]),
  ]);

const STRUCTURE_VISUAL_ASSET_BY_ID = new Map<
  string,
  StructureVisualAssetMetadata
>(STRUCTURE_VISUAL_ASSETS.map((metadata) => [metadata.definitionId, metadata]));

export function structureVisualAsset(
  definitionId: string,
): StructureVisualAssetMetadata | undefined {
  return STRUCTURE_VISUAL_ASSET_BY_ID.get(definitionId);
}

export function validateStructureVisualCatalog(
  catalog: readonly StructureVisualAssetMetadata[] = STRUCTURE_VISUAL_ASSETS,
): true {
  if (catalog.length !== 12)
    throw new Error(`Catálogo visual deve conter 12 assets: ${catalog.length}`);
  const ids = new Set<string>();
  for (const metadata of catalog) {
    if (ids.has(metadata.definitionId))
      throw new Error(`Metadado visual duplicado: ${metadata.definitionId}`);
    ids.add(metadata.definitionId);
    if (metadata.textureKey !== metadata.definitionId)
      throw new Error(`Texture key incoerente: ${metadata.definitionId}`);
    if (!metadata.runtimePath.startsWith(WALL_RUNTIME_ROOT))
      throw new Error(`Caminho runtime incoerente: ${metadata.definitionId}`);
    if (!isPositive(metadata.sourcePixelsPerCell))
      throw new Error(`Escala-fonte incoerente: ${metadata.definitionId}`);
    if (
      !isPositive(metadata.canvasPx.width) ||
      !isPositive(metadata.canvasPx.height)
    )
      throw new Error(`Canvas visual incoerente: ${metadata.definitionId}`);
    if (!rectangleInside(metadata.alphaBoundsPx, metadata.canvasPx))
      throw new Error(`Alpha bounds incoerente: ${metadata.definitionId}`);
    if (
      !Number.isSafeInteger(metadata.logicalSpanCells) ||
      metadata.logicalSpanCells <= 0
    )
      throw new Error(`Span visual incoerente: ${metadata.definitionId}`);
    if (
      metadata.occupiedRegionsPx.length === 0 ||
      metadata.occupiedRegionsPx.some(
        ({ bounds }) => !rectangleInside(bounds, metadata.canvasPx),
      )
    )
      throw new Error(`Região visual incoerente: ${metadata.definitionId}`);
    if (
      metadata.joinPlanesPx.length !== 2 ||
      metadata.joinPlanesPx.some(
        ({ axis, coordinate, profile, visualProfile }) =>
          !Number.isFinite(coordinate) ||
          !Number.isFinite(profile.start) ||
          !Number.isFinite(profile.end) ||
          profile.start >= profile.end ||
          !Number.isFinite(visualProfile.start) ||
          !Number.isFinite(visualProfile.end) ||
          visualProfile.start >= visualProfile.end ||
          profile.start < visualProfile.start ||
          profile.end > visualProfile.end ||
          (axis === "x"
            ? coordinate < 0 || coordinate > metadata.canvasPx.width
            : coordinate < 0 || coordinate > metadata.canvasPx.height),
      )
    )
      throw new Error(`Planos de junção incoerentes: ${metadata.definitionId}`);
    for (const sourcePlane of metadata.joinPlanesPx)
      validateSourceConnectionProfile(metadata, sourcePlane);
    validateMetadataRole(metadata);
  }
  return true;
}

/**
 * Canonical pure transform. Legacy offsets, pivots and visual spans are not
 * read: logical geometry and measured source pixels are its only authorities.
 */
export function transformStructureVisual(
  input: StructureVisualTransformInput,
): StructureVisualTransform {
  assertCoherentInput(input);
  const logicalReference = logicalReferenceFor(input.geometry);
  const scale = CELL_SIZE / input.metadata.sourcePixelsPerCell;
  const joinOrigin = freezePoint({
    x: logicalReference.x * CELL_SIZE,
    y: logicalReference.y * CELL_SIZE,
  });
  const alignment = structureVisualAlignment(input, scale);
  const spriteCanvasPosition = freezePoint({
    x:
      joinOrigin.x -
      input.metadata.sourceReferencePx.x * scale +
      alignment.translation.x,
    y:
      joinOrigin.y -
      input.metadata.sourceReferencePx.y * scale +
      alignment.translation.y,
  });
  const spriteRendering = structureSpriteRendering(
    input.metadata,
    spriteCanvasPosition,
    scale,
  );
  const canvasBounds = worldRectangle(
    spriteCanvasPosition,
    rectangle(
      0,
      0,
      input.metadata.canvasPx.width,
      input.metadata.canvasPx.height,
    ),
    scale,
  );
  const alphaBounds = worldRectangle(
    spriteCanvasPosition,
    input.metadata.alphaBoundsPx,
    scale,
  );
  const interactionRegions = Object.freeze(
    input.metadata.occupiedRegionsPx.map(({ bounds, part }) =>
      Object.freeze({
        bounds: worldRectangle(spriteCanvasPosition, bounds, scale),
        part,
      }),
    ),
  );
  const joinPlanes = Object.freeze(
    input.metadata.joinPlanesPx.map((sourcePlane) =>
      worldJoinPlane(
        spriteCanvasPosition,
        sourcePlane,
        logicalEndpointFor(input.geometry, sourcePlane),
        input.metadata.sourceReferencePx,
        scale,
        alignment.kind === "applied"
          ? alignment.constraints.find(
              ({ axis, part }) =>
                axis === (sourcePlane.axis === "x" ? "y" : "x") &&
                part === sourcePlane.part,
            )
          : undefined,
      ),
    ),
  );
  const visualSortY = Math.max(
    ...interactionRegions.map(({ bounds }) => bounds.y + bounds.height),
  );
  return Object.freeze({
    alignment,
    alphaBounds,
    canvasBounds,
    definitionId: input.metadata.definitionId,
    depth: Object.freeze({
      layer: input.metadata.depth.layer,
      visualSortY,
    }),
    interactionRegions,
    joinOrigin,
    joinPlanes,
    logicalReference: freezePoint(logicalReference),
    orientation: input.orientation,
    placementKey: input.placement.instanceId,
    scale,
    spriteCanvasPosition,
    spriteRendering,
    textureKey: input.metadata.textureKey,
  });
}

export function structureVisualTransform(
  placement: StructurePlacement,
  interiorNormals?: StructurePlacementInteriorNormals,
): StructureVisualTransform {
  const definition = structureDefinition(placement.definitionId);
  const metadata = structureVisualAsset(placement.definitionId);
  if (!definition || !metadata)
    throw new Error(`Metadado visual ausente: ${placement.definitionId}`);
  const geometry = placementGeometry(placement);
  const orientation = orientationFor(geometry);
  return transformStructureVisual({
    definition,
    geometry,
    interiorNormals,
    metadata,
    orientation,
    placement,
  });
}

/** Stable collection projection independent of persisted reading order. */
export function structureVisualTransforms(
  placements: readonly StructurePlacement[],
): readonly StructureVisualTransform[] {
  return Object.freeze(
    placements
      .map((placement) => structureVisualTransform(placement))
      .sort((first, second) =>
        first.placementKey.localeCompare(second.placementKey),
      ),
  );
}

function freezeMetadata(
  metadata: Omit<StructureVisualAssetMetadata, "runtimePath"> & {
    readonly file?: string;
    readonly runtimePath?: string;
  },
): StructureVisualAssetMetadata {
  const { file, runtimePath: suppliedRuntimePath, ...canonical } = metadata;
  const runtimePath = suppliedRuntimePath ?? `${WALL_RUNTIME_ROOT}${file}`;
  return Object.freeze({
    ...canonical,
    alphaBoundsPx: Object.freeze({ ...canonical.alphaBoundsPx }),
    arms: Object.freeze(canonical.arms.map((arm) => Object.freeze({ ...arm }))),
    axes: Object.freeze([...canonical.axes]),
    canvasPx: Object.freeze({ ...canonical.canvasPx }),
    depth: Object.freeze({ ...canonical.depth }),
    joinPlanesPx: Object.freeze([...canonical.joinPlanesPx]),
    occupiedRegionsPx: Object.freeze([...canonical.occupiedRegionsPx]),
    runtimePath,
    sourceReferencePx: Object.freeze({ ...canonical.sourceReferencePx }),
  });
}

function validateMetadataRole(metadata: StructureVisualAssetMetadata): void {
  if (metadata.role === "corner") {
    if (
      !metadata.corner ||
      metadata.orientation !== metadata.corner ||
      metadata.axes.length !== 2 ||
      metadata.arms.length !== 2 ||
      metadata.occupiedRegionsPx.length !== 2
    )
      throw new Error(`Metadado de canto incoerente: ${metadata.definitionId}`);
    return;
  }
  const expectedOrientation =
    metadata.role === "segment-vertical" ? "vertical" : "horizontal";
  if (
    metadata.corner ||
    metadata.orientation !== expectedOrientation ||
    metadata.axes.length !== 1 ||
    metadata.axes[0] !== expectedOrientation ||
    metadata.arms.length !== 0 ||
    metadata.occupiedRegionsPx.length !== 1
  )
    throw new Error(`Metadado linear incoerente: ${metadata.definitionId}`);
}

function assertCoherentInput(input: StructureVisualTransformInput): void {
  const { definition, geometry, metadata, orientation, placement } = input;
  if (
    definition.id !== placement.definitionId ||
    metadata.definitionId !== placement.definitionId
  )
    throw new Error(`Definição visual incoerente: ${placement.definitionId}`);
  const geometryOrientation = orientationFor(geometry);
  if (
    orientation !== geometryOrientation ||
    metadata.orientation !== geometryOrientation
  )
    throw new Error(`Orientação visual incoerente: ${placement.definitionId}`);
  const category =
    metadata.role === "corner"
      ? "corner"
      : metadata.role === "door-horizontal"
        ? "door"
        : "wall";
  if (definition.category !== category || geometry.kind !== category)
    throw new Error(`Papel visual incoerente: ${placement.definitionId}`);
  const span =
    geometry.kind === "corner"
      ? geometry.horizontalArm.spanCells
      : geometry.interval.spanCells;
  if (span !== metadata.logicalSpanCells)
    throw new Error(`Span visual incoerente: ${placement.definitionId}`);
}

function structureVisualAlignment(
  input: StructureVisualTransformInput,
  scale: number,
): StructureVisualAlignment {
  if (!input.interiorNormals)
    return Object.freeze({
      constraints: Object.freeze([]),
      issues: Object.freeze([]),
      kind: "not-requested",
      translation: freezePoint({ x: 0, y: 0 }),
    });

  const constraints: StructureVisualAlignmentConstraint[] = [];
  const issues = new Map<string, StructureVisualAlignmentIssue>();
  for (const sourcePlane of input.metadata.joinPlanesPx) {
    const logicalPart = logicalPartForVisualPart(sourcePlane.part);
    const resolution = input.interiorNormals.parts.find(
      ({ part }) => part === logicalPart,
    );
    if (!resolution) {
      issues.set(logicalPart, {
        kind: "missing-interior-normal",
        part: logicalPart,
      });
      continue;
    }
    if (resolution.kind === "ambiguous") {
      issues.set(logicalPart, {
        kind: "ambiguous-interior-normal",
        part: logicalPart,
        reason: resolution.reason,
      });
      continue;
    }
    if (resolution.kind === "inconsistent") {
      issues.set(logicalPart, {
        kind: "inconsistent-interior-normal",
        part: logicalPart,
        reason: resolution.reason,
      });
      continue;
    }

    const transverseAxis = sourcePlane.axis === "x" ? "y" : "x";
    if (resolution.normal.axis !== transverseAxis) {
      issues.set(logicalPart, {
        kind: "normal-axis-mismatch",
        normalAxis: resolution.normal.axis,
        part: sourcePlane.part,
        transverseAxis,
      });
      continue;
    }
    const sourceReference =
      transverseAxis === "x"
        ? input.metadata.sourceReferencePx.x
        : input.metadata.sourceReferencePx.y;
    const measuredProfile = Object.freeze({
      end: (sourcePlane.profile.end - sourceReference) * scale,
      start: (sourcePlane.profile.start - sourceReference) * scale,
    });
    const thickness = measuredProfile.end - measuredProfile.start;
    const targetProfile =
      resolution.normal.direction === "positive"
        ? Object.freeze({ end: thickness, start: 0 })
        : Object.freeze({ end: 0, start: -thickness });
    constraints.push(
      Object.freeze({
        axis: transverseAxis,
        measuredProfile,
        normal: resolution.normal,
        part: sourcePlane.part,
        sourcePixelTolerance: scale,
        targetProfile,
        translation: targetProfile.start - measuredProfile.start,
      }),
    );
  }

  const frozenConstraints = Object.freeze(constraints);
  if (issues.size > 0)
    return Object.freeze({
      constraints: frozenConstraints,
      issues: Object.freeze([...issues.values()]),
      kind: "preserved",
      translation: freezePoint({ x: 0, y: 0 }),
    });

  const translation = { x: 0, y: 0 };
  for (const axis of ["x", "y"] as const) {
    const axisConstraints = constraints.filter(
      (constraint) => constraint.axis === axis,
    );
    if (axisConstraints.length === 0) continue;
    const translations = axisConstraints.map(
      (constraint) => constraint.translation,
    );
    const tolerance = Math.max(
      ...axisConstraints.map((constraint) => constraint.sourcePixelTolerance),
    );
    if (Math.max(...translations) - Math.min(...translations) > tolerance) {
      issues.set(axis, {
        axis,
        kind: "conflicting-axis-translations",
        translations: Object.freeze(translations),
      });
      continue;
    }
    translation[axis] = translations[0] ?? 0;
  }
  if (issues.size > 0)
    return Object.freeze({
      constraints: frozenConstraints,
      issues: Object.freeze([...issues.values()]),
      kind: "preserved",
      translation: freezePoint({ x: 0, y: 0 }),
    });
  return Object.freeze({
    constraints: frozenConstraints,
    issues: Object.freeze([]),
    kind: "applied",
    translation: freezePoint(translation),
  });
}

function logicalPartForVisualPart(
  part: StructureVisualPart,
): LogicalStructureIntervalPart {
  return part === "horizontal-arm"
    ? "corner-horizontal-arm"
    : part === "vertical-arm"
      ? "corner-vertical-arm"
      : "main";
}

function orientationFor(
  geometry: LogicalPlacementGeometry,
): NormalizedStructureOrientation {
  return geometry.kind === "corner"
    ? geometry.orientation
    : geometry.interval.axis;
}

function logicalReferenceFor(geometry: LogicalPlacementGeometry): GridPoint {
  return geometry.kind === "corner" ? geometry.vertex : geometry.interval.start;
}

function logicalEndpointFor(
  geometry: LogicalPlacementGeometry,
  plane: SourceJoinPlane,
): GridPoint {
  const interval =
    geometry.kind !== "corner"
      ? geometry.interval
      : plane.part === "horizontal-arm"
        ? geometry.horizontalArm
        : plane.part === "vertical-arm"
          ? geometry.verticalArm
          : undefined;
  if (!interval)
    throw new Error(`Parte visual sem intervalo lógico: ${plane.part}`);
  const expectedAxis = interval.axis === "horizontal" ? "x" : "y";
  if (plane.axis !== expectedAxis)
    throw new Error(`Eixo de plano visual incoerente: ${plane.part}`);
  const endpoint =
    plane.side === "west" || plane.side === "north"
      ? interval.start
      : interval.end;
  return freezePoint(endpoint);
}

function worldRectangle(
  spriteCanvasPosition: GridPoint,
  source: PixelRectangle,
  scale: number,
): WorldRectangle {
  return Object.freeze({
    height: source.height * scale,
    width: source.width * scale,
    x: spriteCanvasPosition.x + source.x * scale,
    y: spriteCanvasPosition.y + source.y * scale,
  });
}

/**
 * Keeps canonical geometry exact while extending only a straight sprite's
 * longitudinal sampling range. Corners stay untouched; their neighboring
 * straight module supplies the small, symmetric seam coverage.
 */
function structureSpriteRendering(
  metadata: StructureVisualAssetMetadata,
  spriteCanvasPosition: GridPoint,
  scale: number,
): StructureSpriteRendering {
  if (metadata.role === "corner")
    return Object.freeze({
      longitudinalOverdraw: undefined,
      position: spriteCanvasPosition,
      scale: freezePoint({ x: scale, y: scale }),
    });

  const axis = metadata.axes[0];
  if (axis !== "horizontal" && axis !== "vertical")
    throw new Error(`Eixo longitudinal ausente: ${metadata.definitionId}`);
  const cartesianAxis = axis === "horizontal" ? "x" : "y";
  const expectedPlaneAxis = cartesianAxis;
  if (
    metadata.joinPlanesPx.length !== 2 ||
    metadata.joinPlanesPx.some(
      ({ axis: planeAxis }) => planeAxis !== expectedPlaneAxis,
    )
  )
    throw new Error(
      `Planos longitudinais incoerentes: ${metadata.definitionId}`,
    );
  const coordinates = metadata.joinPlanesPx.map(({ coordinate }) => coordinate);
  const sourceStart = Math.min(...coordinates);
  const sourceEnd = Math.max(...coordinates);
  const sourceSpan = sourceEnd - sourceStart;
  if (!isPositive(sourceSpan))
    throw new Error(`Span longitudinal incoerente: ${metadata.definitionId}`);

  const sourcePixelsPerEndpoint =
    STRUCTURE_LONGITUDINAL_SEAM_OVERDRAW_SOURCE_PX;
  const worldUnitsPerEndpoint = sourcePixelsPerEndpoint * scale;
  const longitudinalScale =
    (scale * (sourceSpan + sourcePixelsPerEndpoint * 2)) / sourceSpan;
  const position = { ...spriteCanvasPosition };
  const renderScale = { x: scale, y: scale };
  position[cartesianAxis] =
    spriteCanvasPosition[cartesianAxis] +
    sourceStart * scale -
    worldUnitsPerEndpoint -
    sourceStart * longitudinalScale;
  renderScale[cartesianAxis] = longitudinalScale;

  return Object.freeze({
    longitudinalOverdraw: Object.freeze({
      axis,
      sourcePixelsPerEndpoint,
      worldUnitsPerEndpoint,
    }),
    position: freezePoint(position),
    scale: freezePoint(renderScale),
  });
}

function worldJoinPlane(
  spriteCanvasPosition: GridPoint,
  source: SourceJoinPlane,
  logicalEndpoint: GridPoint,
  sourceReferencePx: PixelPoint,
  scale: number,
  alignmentConstraint?: StructureVisualAlignmentConstraint,
): WorldJoinPlane {
  const longitudinalOrigin =
    source.axis === "x" ? spriteCanvasPosition.x : spriteCanvasPosition.y;
  const transverseOrigin =
    source.axis === "x" ? spriteCanvasPosition.y : spriteCanvasPosition.x;
  const visualProfile = Object.freeze({
    end: transverseOrigin + source.visualProfile.end * scale,
    start: transverseOrigin + source.visualProfile.start * scale,
  });
  const longitudinalAxis = source.axis === "x" ? "horizontal" : "vertical";
  const logicalAxisCoordinate =
    (source.axis === "x" ? logicalEndpoint.y : logicalEndpoint.x) * CELL_SIZE;
  const sourceReferenceTransverse =
    source.axis === "x" ? sourceReferencePx.y : sourceReferencePx.x;
  const axisRelativeInterval = alignmentConstraint
    ? alignmentConstraint.targetProfile
    : Object.freeze({
        end: (source.profile.end - sourceReferenceTransverse) * scale,
        start: (source.profile.start - sourceReferenceTransverse) * scale,
      });
  const profile = Object.freeze({
    end: logicalAxisCoordinate + axisRelativeInterval.end,
    start: logicalAxisCoordinate + axisRelativeInterval.start,
  });
  const axisRelativeCenterline =
    (axisRelativeInterval.start + axisRelativeInterval.end) / 2;
  const normal = transverseNormal(source.axis);
  return Object.freeze({
    axis: source.axis,
    connectionProfile: source.connectionProfile,
    coordinate: longitudinalOrigin + source.coordinate * scale,
    logicalEndpoint,
    longitudinalAxis,
    part: source.part,
    profile,
    side: source.side,
    transverseProfile: Object.freeze({
      axisRelativeCenterline,
      axisRelativeInterval,
      centerline: (profile.start + profile.end) / 2,
      interval: profile,
      logicalAxisCoordinate,
      normal,
      occupiedSide: transverseOccupiedSide(axisRelativeInterval, 0),
      sourcePixelTolerance: scale,
      thickness: (source.profile.end - source.profile.start) * scale,
    }),
    visualProfile,
  });
}

function validateSourceConnectionProfile(
  metadata: StructureVisualAssetMetadata,
  plane: SourceJoinPlane,
): void {
  if (plane.connectionProfile.kind === "measured") return;
  const profileClass = structureConnectionProfileClass(
    plane.connectionProfile.compatibilityClass,
  );
  const expectedAxis = plane.axis === "x" ? "horizontal" : "vertical";
  const sourceReferenceTransverse =
    plane.axis === "x"
      ? metadata.sourceReferencePx.y
      : metadata.sourceReferencePx.x;
  const expectedProfile = resolveSourceConnectionProfile(
    plane.connectionProfile,
    plane.visualProfile,
    sourceReferenceTransverse,
  );
  if (
    !profileClass ||
    profileClass.axis !== expectedAxis ||
    expectedProfile.start !== plane.profile.start ||
    expectedProfile.end !== plane.profile.end
  )
    throw new Error(
      `Referência de perfil incoerente: ${metadata.definitionId}`,
    );
}

function sourceSideForRegion(
  start: number,
  thickness: number,
  sourceReference: number,
): "after-reference" | "before-reference" {
  if (start === sourceReference) return "after-reference";
  if (start + thickness === sourceReference) return "before-reference";
  throw new Error("Região estrutural não toca a referência-fonte.");
}

function transverseNormal(longitudinalAxis: CartesianAxis): TransverseNormal {
  return longitudinalAxis === "x"
    ? Object.freeze({
        axis: "y",
        negativeDirection: "north",
        positiveDirection: "south",
      })
    : Object.freeze({
        axis: "x",
        negativeDirection: "west",
        positiveDirection: "east",
      });
}

function transverseOccupiedSide(
  interval: HalfOpenInterval,
  logicalAxisCoordinate: number,
): TransverseOccupiedSide {
  if (interval.end <= logicalAxisCoordinate) return "negative";
  if (interval.start >= logicalAxisCoordinate) return "positive";
  return "straddles-axis";
}

function freezePoint(value: GridPoint): GridPoint {
  return Object.freeze({ x: value.x, y: value.y });
}

function isPositive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function rectangleInside(
  value: PixelRectangle,
  container: { readonly height: number; readonly width: number },
): boolean {
  return (
    value.x >= 0 &&
    value.y >= 0 &&
    isPositive(value.width) &&
    isPositive(value.height) &&
    value.x + value.width <= container.width &&
    value.y + value.height <= container.height
  );
}

validateStructureVisualCatalog();
