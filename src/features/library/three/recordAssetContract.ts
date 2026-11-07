import { Box3, Group, Material, Vector3 } from "three";
import type {
  LibraryRecordModelTypeId,
  ProceduralLibraryRecordDimensions,
} from "./libraryRecordDimensions";
import {
  setSpatialComponents,
  spatialBox,
  type SpatialComponents,
} from "./spatialComponents";

export type RecordAssetType = LibraryRecordModelTypeId | "book-volume";
export interface RecordAssetIdentity<
  T extends RecordAssetType = RecordAssetType,
> {
  readonly entryId: string;
  readonly instanceId: string;
  readonly modelTypeId: T;
}
export interface BookCoverAnimation {
  readonly kind: "hinged-cover";
  setOpening(progress: number): void;
  worldBounds(): Box3;
  opening(): number;
}
export interface RecordAsset<
  T extends RecordAssetIdentity = RecordAssetIdentity,
> {
  readonly assetId: string;
  readonly identity: T;
  readonly dimensions: Readonly<ProceduralLibraryRecordDimensions>;
  readonly pivot: readonly [number, number, number];
  readonly scale: readonly [number, number, number];
  readonly orientation: readonly [number, number, number];
  readonly root: Group;
  readonly spatial: SpatialComponents;
  readonly materials: readonly Material[];
  readonly animation?: BookCoverAnimation;
}
export type RecordAssetFactory<
  T extends RecordAssetIdentity = RecordAssetIdentity,
> = (identity: T) => RecordAsset<T>;

export function recordSpatial(
  dimensions: Readonly<ProceduralLibraryRecordDimensions>,
  navigationDepth = dimensions.depth,
): SpatialComponents {
  const { width, height, depth } = dimensions;
  const physical = [spatialBox(0, height / 2, 0, width, height, depth)];
  return {
    physical,
    navigation: [spatialBox(0, height / 2, 0, width, height, navigationDepth)],
    picking: physical,
    mobility: "static",
    manipulation: [{ id: "grip", position: [0, height * 0.6, 0] }],
    supports: [],
    approaches: [{ id: "front", position: [0, 0, depth / 2 + 0.8] }],
  };
}
export function bindRecordSpatial(
  root: Group,
  spatial: SpatialComponents,
): void {
  setSpatialComponents(root, spatial);
}
/** Replacement is a visual operation inside an already approved slot. Reject a
 * different identity or physical profile before touching the attached owner. */
export function validateRecordReplacement(
  asset: RecordAsset,
  expected: RecordAssetIdentity,
  maximum: Readonly<ProceduralLibraryRecordDimensions>,
): void {
  if (
    asset.identity.entryId !== expected.entryId ||
    asset.identity.instanceId !== expected.instanceId ||
    asset.identity.modelTypeId !== expected.modelTypeId
  )
    throw new Error("A substituição deve preservar a identidade do registro.");
  const { width, height, depth } = asset.dimensions;
  if (
    ![
      width,
      height,
      depth,
      ...asset.pivot,
      ...asset.scale,
      ...asset.orientation,
    ].every(Number.isFinite) ||
    Math.min(width, height, depth, ...asset.scale) <= 0 ||
    width > maximum.width + 1e-6 ||
    height > maximum.height + 1e-6 ||
    depth > maximum.depth + 1e-6 ||
    asset.root.parent
  )
    throw new Error("Asset incompatível com o slot do registro.");
  const b = new Box3().setFromObject(asset.root),
    size = b.getSize(new Vector3());
  if (
    asset.pivot.some((value) => Math.abs(value) > 1e-6) ||
    asset.orientation.some((value) => Math.abs(value) > 1e-6) ||
    asset.root.position.lengthSq() > 1e-12 ||
    asset.root.rotation.x !== 0 ||
    asset.root.rotation.y !== 0 ||
    asset.root.rotation.z !== 0 ||
    asset.root.scale.toArray().some((value) => Math.abs(value - 1) > 1e-6) ||
    Math.abs(b.min.y) > 1e-6 ||
    Math.abs(b.min.x + width / 2) > 1e-6 ||
    Math.abs(b.min.z + depth / 2) > 1e-6 ||
    Math.abs(size.x - width) > 1e-5 ||
    Math.abs(size.y - height) > 1e-5 ||
    Math.abs(size.z - depth) > 1e-5
  )
    throw new Error("Bounds do asset não correspondem ao contrato.");
}

export interface BookRecordAsset extends RecordAsset<
  RecordAssetIdentity<"book-volume">
> {
  readonly animation: BookCoverAnimation;
  setSessionGlow(strength: number): void;
}
export type BookRecordFactory = (
  identity: RecordAssetIdentity<"book-volume">,
) => BookRecordAsset;
