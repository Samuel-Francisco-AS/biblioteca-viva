export type WallAssetRole =
  "corner" | "door-horizontal" | "segment-horizontal" | "segment-vertical";

export type WallCorner = "ne" | "nw" | "se" | "sw";
export type WallOrientation = "horizontal" | "vertical";
export type WallDepthPolicy = "architecture-back" | "architecture-front";

export interface WallAssetDefinition {
  readonly corner?: WallCorner;
  readonly depthPolicy: WallDepthPolicy;
  readonly fallback: "procedural-wall" | "procedural-door";
  readonly id: string;
  readonly logicalLengthCells: number;
  /** Anchor is the top-left of the canvas; offsets preserve source padding. */
  readonly offset: { readonly xCells: number; readonly yCells: number };
  readonly orientation: WallOrientation;
  /** Whole family is rendered at 32 world units for every 300 source pixels. */
  readonly pixelsPerLogicalCell: number;
  readonly pivot: { readonly x: number; readonly y: number };
  readonly role: WallAssetRole;
  readonly runtimePath: string;
}

const wallRuntimePath = (file: string) =>
  `/assets/world/architecture/walls/${file}`;

const common = {
  fallback: "procedural-wall",
  pixelsPerLogicalCell: 300,
  pivot: { x: 0, y: 0 },
} as const;

export const WALL_ASSETS: readonly WallAssetDefinition[] = Object.freeze([
  {
    ...common,
    corner: "ne",
    depthPolicy: "architecture-back",
    id: "architecture.wall.stone-01.corner-ne",
    logicalLengthCells: 4,
    offset: { xCells: -4, yCells: -4 },
    orientation: "horizontal",
    role: "corner",
    runtimePath: wallRuntimePath("wall-corner-ne.png"),
  },
  {
    ...common,
    corner: "nw",
    depthPolicy: "architecture-back",
    id: "architecture.wall.stone-01.corner-nw",
    logicalLengthCells: 4,
    offset: { xCells: 0, yCells: -4 },
    orientation: "horizontal",
    role: "corner",
    runtimePath: wallRuntimePath("wall-corner-nw.png"),
  },
  {
    ...common,
    corner: "se",
    depthPolicy: "architecture-front",
    id: "architecture.wall.stone-01.corner-se",
    logicalLengthCells: 4,
    offset: { xCells: -4, yCells: 0 },
    orientation: "horizontal",
    role: "corner",
    runtimePath: wallRuntimePath("wall-corner-se.png"),
  },
  {
    ...common,
    corner: "sw",
    depthPolicy: "architecture-front",
    id: "architecture.wall.stone-01.corner-sw",
    logicalLengthCells: 4,
    offset: { xCells: 0, yCells: 0 },
    orientation: "horizontal",
    role: "corner",
    runtimePath: wallRuntimePath("wall-corner-sw.png"),
  },
  {
    fallback: "procedural-door",
    depthPolicy: "architecture-back",
    id: "architecture.wall.stone-01.door-horizontal.closed",
    logicalLengthCells: 4,
    offset: { xCells: -1, yCells: 0 },
    orientation: "horizontal",
    pixelsPerLogicalCell: 300,
    pivot: { x: 0, y: 0 },
    role: "door-horizontal",
    runtimePath: wallRuntimePath("wall-door-horizontal-closed.png"),
  },
  {
    fallback: "procedural-door",
    depthPolicy: "architecture-back",
    id: "architecture.wall.stone-01.door-horizontal.open",
    logicalLengthCells: 4,
    offset: { xCells: -1, yCells: 0 },
    orientation: "horizontal",
    pixelsPerLogicalCell: 300,
    pivot: { x: 0, y: 0 },
    role: "door-horizontal",
    runtimePath: wallRuntimePath("wall-door-horizontal-open.png"),
  },
  ...([1, 2, 4] as const).flatMap((length) => [
    {
      ...common,
      depthPolicy: "architecture-back" as const,
      id: `architecture.wall.stone-01.horizontal-${length}`,
      logicalLengthCells: length,
      offset: { xCells: 0, yCells: 0 },
      orientation: "horizontal" as const,
      role: "segment-horizontal" as const,
      runtimePath: wallRuntimePath(
        length === 4
          ? "wall-horizontal.png"
          : `wall-horizontal-${length}cell.png`,
      ),
    },
    {
      ...common,
      depthPolicy: "architecture-back" as const,
      id: `architecture.wall.stone-01.vertical-${length}`,
      logicalLengthCells: length,
      offset: { xCells: 0, yCells: 0 },
      orientation: "vertical" as const,
      role: "segment-vertical" as const,
      runtimePath: wallRuntimePath(
        length === 4 ? "wall-vertical.png" : `wall-vertical-${length}cell.png`,
      ),
    },
  ]),
]);

export function wallAsset(id: string): WallAssetDefinition | undefined {
  return WALL_ASSETS.find((asset) => asset.id === id);
}

export function validateWallAssetCatalog(
  assets: readonly WallAssetDefinition[] = WALL_ASSETS,
): true {
  const ids = new Set<string>();
  for (const asset of assets) {
    if (ids.has(asset.id))
      throw new Error(`ID de parede duplicado: ${asset.id}`);
    ids.add(asset.id);
    if (!asset.runtimePath.startsWith("/assets/world/architecture/walls/"))
      throw new Error(`Caminho de parede inválido: ${asset.id}`);
    if (
      !Number.isInteger(asset.logicalLengthCells) ||
      asset.logicalLengthCells < 1
    )
      throw new Error(`Extensão lógica inválida: ${asset.id}`);
    if (
      asset.role === "segment-horizontal" &&
      asset.orientation !== "horizontal"
    )
      throw new Error(`Segmento horizontal inválido: ${asset.id}`);
    if (asset.role === "segment-vertical" && asset.orientation !== "vertical")
      throw new Error(`Segmento vertical inválido: ${asset.id}`);
    if (asset.role === "door-horizontal" && asset.orientation !== "horizontal")
      throw new Error(`Porta não horizontal: ${asset.id}`);
  }
  return true;
}
