/// <reference lib="dom" />

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { expect, test, type Browser, type Page } from "@playwright/test";

import {
  INITIAL_WORLD_STRUCTURE,
  analyzeStructurePerimeter,
  placementGeometry,
  validateWorldStructure,
  type GridPoint,
  type PlacedObject,
  type StructurePlacement,
  type WorldStructureState,
} from "../src/application";
import {
  structurePieceDepth,
  structureRenderPlan,
  type StructureRenderPiece,
} from "../src/features/library-visual/phaser/structureRenderPlan";
import { structureVisualFallbackGeometry } from "../src/features/library-visual/phaser/structureVisualFallback";
import {
  STRUCTURE_LONGITUDINAL_SEAM_OVERDRAW_SOURCE_PX,
  structureVisualAsset,
  type WorldJoinPlane,
} from "../src/features/library-visual/phaser/structureVisualGeometry";
import { CELL_SIZE } from "../src/features/library-visual/phaser/spatialWorld";

const ARTIFACT_DIRECTORY = path.resolve(
  process.env.W3_A_R3_C_B2_ARTIFACT_DIRECTORY ?? "art-guides/w3-a-r3-c-b2",
);
const B2_DEVELOPMENT_BASE_URL =
  process.env.W3_A_R3_C_B2_BASE_URL ?? "http://127.0.0.1:4174";
const DIAGNOSTIC_DIRECTORY = process.env.W3_A_R3_C_B2_DIAGNOSTIC_DIRECTORY
  ? path.resolve(process.env.W3_A_R3_C_B2_DIAGNOSTIC_DIRECTORY)
  : undefined;
const FIXED_TIMESTAMP = "2026-09-02T00:00:00.000Z";

interface BrowserGame {
  destroy(): void;
  setConstructionState?(state: {
    readonly active: boolean;
    readonly movingInstanceId?: string;
    readonly placingDefinitionId?: StructurePlacement["definitionId"];
    readonly tool:
      "explore" | "paint-floor" | "place-structure" | "remove-floor" | "select";
  }): void;
}

interface BrowserGraphicsRecord {
  readonly fillRects: Array<
    readonly [x: number, y: number, width: number, height: number]
  >;
  readonly object: unknown;
  readonly strokeRects: Array<
    readonly [x: number, y: number, width: number, height: number]
  >;
  structureInstanceId?: string;
}

interface BrowserImageRecord {
  readonly object: unknown;
  readonly textureKey: string;
}

interface BrowserHarness {
  readonly game: BrowserGame;
  readonly graphics: BrowserGraphicsRecord[];
  readonly images: BrowserImageRecord[];
  readonly interactions: unknown[];
  readonly sceneRef: { value?: unknown };
}

declare global {
  interface Window {
    __w3R3CB2?: BrowserHarness;
  }
}

interface RuntimeImageSnapshot {
  readonly active: boolean;
  readonly depth: number;
  readonly originX: number;
  readonly originY: number;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly textureKey: string;
  readonly visible: boolean;
  readonly x: number;
  readonly y: number;
}

interface ComparableSpriteRecord {
  readonly depth: number;
  readonly originX: number;
  readonly originY: number;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly textureKey: string;
  readonly x: number;
  readonly y: number;
}

interface RuntimeFallbackSnapshot {
  readonly active: boolean;
  readonly depth: number;
  readonly fillRects: BrowserGraphicsRecord["fillRects"];
  readonly instanceId: string;
  readonly strokeRects: BrowserGraphicsRecord["strokeRects"];
  readonly visible: boolean;
}

interface RuntimeSnapshot {
  readonly canvasCount: number;
  readonly fallbacks: readonly RuntimeFallbackSnapshot[];
  readonly graphicsDepths: readonly number[];
  readonly interactions: readonly unknown[];
  readonly objectSprites: readonly RuntimeImageSnapshot[];
  readonly structuralSprites: readonly RuntimeImageSnapshot[];
}

interface CaptureRecord {
  readonly browser: string;
  readonly canvas: { readonly height: number; readonly width: number };
  readonly consoleErrors: readonly string[];
  readonly consoleWarnings: readonly string[];
  readonly doorState: "both" | "closed" | "open";
  readonly file: string;
  readonly requestFailures: readonly string[];
  readonly scenario: string;
  readonly sha256: string;
  readonly viewport: { readonly height: number; readonly width: number };
}

interface RenderedScenario {
  readonly consoleErrors: string[];
  readonly consoleWarnings: string[];
  readonly page: Page;
  readonly requestFailures: string[];
}

type SeamInspectionKind =
  "door" | "horizontal-corner" | "straight-straight" | "vertical-corner";

interface SeamProbe {
  readonly axis: "horizontal" | "vertical";
  readonly coordinate: number;
  readonly id: string;
  readonly kind: SeamInspectionKind;
  readonly logicalEndpoint: GridPoint;
  readonly logicalWorld: GridPoint;
  readonly members: readonly {
    readonly canvasPx: { readonly height: number; readonly width: number };
    readonly instanceId: string;
    readonly role: string;
    readonly scaleX: number;
    readonly scaleY: number;
    readonly textureKey: string;
    readonly x: number;
    readonly y: number;
  }[];
  readonly profileEnd: number;
  readonly profileStart: number;
  readonly transverseCoordinate: number;
}

interface SeamInspectionRecord {
  readonly categories: readonly SeamInspectionKind[];
  readonly connectedBackgroundChannels: number;
  readonly examinedSeams: number;
  readonly scenario: string;
  readonly transparentPixels: number;
}

const captures: CaptureRecord[] = [];
const seamInspections: SeamInspectionRecord[] = [];

test.use({
  launchOptions: {
    // Phaser.AUTO selects its Canvas renderer in headless Chromium. This avoids
    // a SwiftShader framebuffer error without changing production code.
    args: ["--disable-webgl"],
  },
});
test.describe.configure({ mode: "serial" });
test.setTimeout(60_000);

const MODIFIED_WORLD_STRUCTURE: WorldStructureState = {
  blueprintVersion: 1,
  createdAt: FIXED_TIMESTAMP,
  floorCells: rectangularFloor(2, 2, 15, 13),
  id: "world.main",
  placements: [
    placement("modified.corner.top-left", "corner-sw", 2, 2),
    placement("modified.corner.top-right", "corner-se", 17, 2),
    placement("modified.corner.bottom-left", "corner-nw", 2, 15),
    placement("modified.corner.bottom-right", "corner-ne", 17, 15),
    placement("modified.top.long", "horizontal-4", 6, 2),
    placement("modified.top.medium", "horizontal-2", 10, 2),
    placement("modified.top.short", "horizontal-1", 12, 2),
    placement("modified.bottom.door", "door-horizontal.open", 6, 15),
    placement("modified.bottom.medium", "horizontal-2", 10, 15),
    placement("modified.bottom.short", "horizontal-1", 12, 15),
    placement("modified.left.long", "vertical-4", 2, 6),
    placement("modified.left.short", "vertical-1", 2, 10),
    placement("modified.right.medium-a", "vertical-2", 17, 6),
    placement("modified.right.medium-b", "vertical-2", 17, 8),
    placement("modified.right.short", "vertical-1", 17, 10),
  ],
  revision: 2,
  updatedAt: FIXED_TIMESTAMP,
};

const DOOR_STATES_WORLD_STRUCTURE: WorldStructureState = {
  ...INITIAL_WORLD_STRUCTURE,
  createdAt: FIXED_TIMESTAMP,
  placements: INITIAL_WORLD_STRUCTURE.placements.map((item) =>
    item.instanceId === "initial.wall.top"
      ? {
          anchor: item.anchor,
          definitionId:
            "architecture.wall.stone-01.door-horizontal.open" as const,
          instanceId: "detail.door.open",
        }
      : item,
  ),
  revision: 2,
  updatedAt: FIXED_TIMESTAMP,
};

const DEPTH_OBJECTS: readonly PlacedObject[] = [
  {
    definitionId: "furniture.desk.wood-01",
    instanceId: "placed-object.furniture.desk.wood-01",
    rotation: 0,
    spaceId: "space-a",
    x: 96,
    y: 128,
  },
  {
    definitionId: "furniture.chair.wood-01",
    instanceId: "placed-object.furniture.chair.wood-01",
    rotation: 0,
    spaceId: "space-a",
    x: 368,
    y: 400,
  },
];

function rectangularFloor(
  x: number,
  y: number,
  width: number,
  height: number,
): readonly GridPoint[] {
  return Array.from({ length: height }, (_row, row) =>
    Array.from({ length: width }, (_column, column) => ({
      x: x + column,
      y: y + row,
    })),
  ).flat();
}

function placement(
  instanceId: string,
  suffix: Exclude<
    StructurePlacement["definitionId"],
    "architecture.floor.wood-01"
  > extends `architecture.wall.stone-01.${infer Suffix}`
    ? Suffix
    : never,
  x: number,
  y: number,
): StructurePlacement {
  return {
    anchor: { x, y },
    definitionId: `architecture.wall.stone-01.${suffix}`,
    instanceId,
  };
}

function structureInterval(piece: StructureRenderPiece, part: string) {
  const geometry = placementGeometry({
    anchor: {
      x: piece.transform.logicalReference.x,
      y: piece.transform.logicalReference.y,
    },
    definitionId: piece.transform.definitionId,
    instanceId: piece.key,
  });
  if (geometry.kind !== "corner") return geometry.interval;
  return part === "horizontal-arm"
    ? geometry.horizontalArm
    : geometry.verticalArm;
}

function assertClosedComposition(
  structure: WorldStructureState,
  expectedMeetings: number,
): readonly {
  readonly first: WorldJoinPlane;
  readonly logicalPoint: string;
  readonly second: WorldJoinPlane;
}[] {
  expect(validateWorldStructure(structure)).toBe(true);
  const analysis = analyzeStructurePerimeter(structure);
  expect(analysis.closed).toBe(true);
  expect(analysis.missingEdges).toEqual([]);
  expect(analysis.extraEdges).toEqual([]);
  expect(analysis.duplicateEdges).toEqual([]);

  const meetings = new Map<string, WorldJoinPlane[]>();
  for (const piece of structureRenderPlan(structure)) {
    for (const plane of piece.transform.joinPlanes) {
      const interval = structureInterval(piece, plane.part);
      const point =
        plane.axis === "x"
          ? { x: plane.coordinate / 32, y: interval.start.y }
          : { x: interval.start.x, y: plane.coordinate / 32 };
      const expectedCoordinate =
        plane.axis === "x" ? point.x * 32 : point.y * 32;
      expect(plane.coordinate).toBeCloseTo(expectedCoordinate, 10);
      const key = `${point.x}:${point.y}`;
      meetings.set(key, [...(meetings.get(key) ?? []), plane]);
    }
  }
  expect(meetings.size).toBe(expectedMeetings);
  const mismatchedVisualCorridors: Array<{
    readonly first: WorldJoinPlane;
    readonly logicalPoint: string;
    readonly second: WorldJoinPlane;
  }> = [];
  for (const [logicalPoint, planes] of meetings) {
    expect(planes, `encontro ${logicalPoint}`).toHaveLength(2);
    expect(planes[1]?.axis, `eixo do encontro ${logicalPoint}`).toBe(
      planes[0]?.axis,
    );
    const [first, second] = planes;
    if (
      first &&
      second &&
      first.axis === "y" &&
      (Math.abs(first.profile.start - second.profile.start) > 32 / 300 + 1e-9 ||
        Math.abs(first.profile.end - second.profile.end) > 32 / 300 + 1e-9)
    )
      mismatchedVisualCorridors.push({ first, logicalPoint, second });
  }
  return mismatchedVisualCorridors;
}

function rounded(value: number): number {
  return Number(value.toFixed(9));
}

function expectedSpriteRecords(
  structure: WorldStructureState,
  excludedDefinitionIds: ReadonlySet<string> = new Set(),
): ComparableSpriteRecord[] {
  return structureRenderPlan(structure)
    .filter(
      ({ transform }) => !excludedDefinitionIds.has(transform.definitionId),
    )
    .map((piece) => {
      const rendering = expectedSpriteRendering(piece);
      return {
        depth: rounded(structurePieceDepth(piece)),
        originX: 0,
        originY: 0,
        scaleX: rounded(rendering.scaleX),
        scaleY: rounded(rendering.scaleY),
        textureKey: piece.metadata.textureKey,
        x: rounded(rendering.x),
        y: rounded(rendering.y),
      };
    })
    .sort(compareSpriteRecords);
}

function expectedSpriteRendering(piece: StructureRenderPiece): {
  readonly scaleX: number;
  readonly scaleY: number;
  readonly x: number;
  readonly y: number;
} {
  const { metadata, transform } = piece;
  const baseScale = CELL_SIZE / metadata.sourcePixelsPerCell;
  if (metadata.role === "corner")
    return {
      scaleX: baseScale,
      scaleY: baseScale,
      x: transform.spriteCanvasPosition.x,
      y: transform.spriteCanvasPosition.y,
    };

  const axis = metadata.orientation;
  if (axis !== "horizontal" && axis !== "vertical")
    throw new Error(`Orientação linear inválida: ${metadata.definitionId}`);
  const sourceStart =
    axis === "horizontal" ? metadata.alphaBoundsPx.x : metadata.alphaBoundsPx.y;
  const sourceSpan =
    axis === "horizontal"
      ? metadata.alphaBoundsPx.width
      : metadata.alphaBoundsPx.height;
  const overdrawWorldUnits =
    STRUCTURE_LONGITUDINAL_SEAM_OVERDRAW_SOURCE_PX * baseScale;
  const longitudinalScale =
    (baseScale *
      (sourceSpan + STRUCTURE_LONGITUDINAL_SEAM_OVERDRAW_SOURCE_PX * 2)) /
    sourceSpan;
  const longitudinalPosition =
    transform.spriteCanvasPosition[axis === "horizontal" ? "x" : "y"] +
    sourceStart * baseScale -
    overdrawWorldUnits -
    sourceStart * longitudinalScale;

  return axis === "horizontal"
    ? {
        scaleX: longitudinalScale,
        scaleY: baseScale,
        x: longitudinalPosition,
        y: transform.spriteCanvasPosition.y,
      }
    : {
        scaleX: baseScale,
        scaleY: longitudinalScale,
        x: transform.spriteCanvasPosition.x,
        y: longitudinalPosition,
      };
}

function actualSpriteRecords(
  snapshot: RuntimeSnapshot,
): ComparableSpriteRecord[] {
  return snapshot.structuralSprites
    .map(({ active, visible, ...sprite }) => {
      expect(active).toBe(true);
      expect(visible).toBe(true);
      return {
        ...sprite,
        depth: rounded(sprite.depth),
        scaleX: rounded(sprite.scaleX),
        scaleY: rounded(sprite.scaleY),
        x: rounded(sprite.x),
        y: rounded(sprite.y),
      };
    })
    .sort(compareSpriteRecords);
}

function compareSpriteRecords(
  first: ComparableSpriteRecord,
  second: ComparableSpriteRecord,
): number {
  return (
    first.textureKey.localeCompare(second.textureKey) ||
    first.x - second.x ||
    first.y - second.y ||
    first.depth - second.depth
  );
}

function structureSeamProbes(structure: WorldStructureState): SeamProbe[] {
  const meetings = new Map<
    string,
    Array<{
      readonly piece: StructureRenderPiece;
      readonly plane: WorldJoinPlane;
    }>
  >();
  for (const piece of structureRenderPlan(structure)) {
    for (const plane of piece.transform.joinPlanes) {
      const key = `${plane.logicalEndpoint.x}:${plane.logicalEndpoint.y}:${plane.longitudinalAxis}`;
      meetings.set(key, [...(meetings.get(key) ?? []), { piece, plane }]);
    }
  }

  return [...meetings.entries()]
    .map(([id, members]) => {
      if (members.length !== 2)
        throw new Error(`Emenda ${id} possui ${members.length} endpoints`);
      const [first, second] = members;
      if (!first || !second || first.plane.axis !== second.plane.axis)
        throw new Error(`Emenda ${id} possui eixos incompatíveis`);
      if (Math.abs(first.plane.coordinate - second.plane.coordinate) > 1e-9)
        throw new Error(`Emenda ${id} possui coordenadas incompatíveis`);
      const profileStart = Math.max(
        first.plane.profile.start,
        second.plane.profile.start,
      );
      const profileEnd = Math.min(
        first.plane.profile.end,
        second.plane.profile.end,
      );
      if (profileStart >= profileEnd)
        throw new Error(`Emenda ${id} não compartilha perfil transversal`);
      const roles = members.map(({ piece }) => piece.metadata.role);
      const axis = first.plane.longitudinalAxis;
      const kind: SeamInspectionKind = roles.includes("door-horizontal")
        ? "door"
        : roles.includes("corner")
          ? axis === "horizontal"
            ? "horizontal-corner"
            : "vertical-corner"
          : "straight-straight";
      return {
        axis,
        coordinate: first.plane.coordinate,
        id,
        kind,
        logicalEndpoint: first.plane.logicalEndpoint,
        logicalWorld: {
          x: first.plane.logicalEndpoint.x * CELL_SIZE,
          y: first.plane.logicalEndpoint.y * CELL_SIZE,
        },
        members: members
          .map(({ piece }) => {
            const rendering = expectedSpriteRendering(piece);
            return {
              canvasPx: piece.metadata.canvasPx,
              instanceId: piece.key,
              role: piece.metadata.role,
              scaleX: rendering.scaleX,
              scaleY: rendering.scaleY,
              textureKey: piece.metadata.textureKey,
              x: rendering.x,
              y: rendering.y,
            };
          })
          .sort((left, right) =>
            left.instanceId.localeCompare(right.instanceId),
          ),
        profileEnd,
        profileStart,
        transverseCoordinate: (profileStart + profileEnd) / 2,
      };
    })
    .sort((first, second) => first.id.localeCompare(second.id));
}

async function inspectSeamAlpha(
  page: Page,
  probes: readonly SeamProbe[],
  scenario: string,
) {
  const focusId =
    DIAGNOSTIC_DIRECTORY && scenario === "modified"
      ? "6:2:horizontal"
      : undefined;
  const result = await page.evaluate(
    ({ focusId: inputFocusId, probes: inputProbes }) => {
      const harness = window.__w3R3CB2;
      if (!harness) throw new Error("Harness visual ausente");
      const canvas = document.querySelector<HTMLCanvasElement>(
        "#w3-r3-c-b2-renderer canvas",
      );
      if (!canvas) throw new Error("Canvas visual ausente");
      const sceneValue = harness.sceneRef.value;
      if (typeof sceneValue !== "object" || sceneValue === null)
        throw new Error("Cena espacial indisponível");
      const camera = (
        sceneValue as {
          readonly cameras: {
            readonly main: {
              readonly scrollX: number;
              readonly scrollY: number;
              readonly x: number;
              readonly y: number;
              readonly zoom: number;
            };
          };
        }
      ).cameras.main;
      const bounds = canvas.getBoundingClientRect();
      const bitmapScaleX = canvas.width / bounds.width;
      const bitmapScaleY = canvas.height / bounds.height;
      const worldToBitmap = (x: number, y: number) => ({
        x: ((x - camera.scrollX) * camera.zoom + camera.x) * bitmapScaleX,
        y: ((y - camera.scrollY) * camera.zoom + camera.y) * bitmapScaleY,
      });
      const bitmapToWorld = (x: number, y: number) => ({
        x: camera.scrollX + (x / bitmapScaleX - camera.x) / camera.zoom,
        y: camera.scrollY + (y / bitmapScaleY - camera.y) / camera.zoom,
      });
      const runtimeSprite = (member: SeamProbe["members"][number]) => {
        for (const record of harness.images) {
          if (record.textureKey !== member.textureKey) continue;
          if (typeof record.object !== "object" || record.object === null)
            continue;
          const candidate = record.object as {
            readonly scaleX?: unknown;
            readonly scaleY?: unknown;
            readonly texture?: {
              readonly getSourceImage?: () => unknown;
            };
            readonly x?: unknown;
            readonly y?: unknown;
          };
          if (
            typeof candidate.x !== "number" ||
            typeof candidate.y !== "number" ||
            typeof candidate.scaleX !== "number" ||
            typeof candidate.scaleY !== "number" ||
            Math.abs(candidate.x - member.x) > 1e-6 ||
            Math.abs(candidate.y - member.y) > 1e-6 ||
            Math.abs(candidate.scaleX - member.scaleX) > 1e-6 ||
            Math.abs(candidate.scaleY - member.scaleY) > 1e-6 ||
            !candidate.texture ||
            typeof candidate.texture.getSourceImage !== "function"
          )
            continue;
          const source = candidate.texture.getSourceImage();
          if (
            !(source instanceof HTMLImageElement) &&
            !(source instanceof HTMLCanvasElement)
          )
            throw new Error(`Fonte Canvas inválida: ${member.instanceId}`);
          return {
            instanceId: member.instanceId,
            scaleX: candidate.scaleX,
            scaleY: candidate.scaleY,
            source,
            x: candidate.x,
            y: candidate.y,
          };
        }
        throw new Error(`Sprite não encontrado: ${member.instanceId}`);
      };
      const charForAlpha = (alpha: number) =>
        alpha === 0 ? "." : alpha === 255 ? "#" : "+";
      const connectedAcrossProfile = (
        alpha: readonly number[],
        width: number,
        height: number,
        axis: SeamProbe["axis"],
        diagonal: boolean,
      ) => {
        const pending: Array<readonly [number, number]> = [];
        const seen = new Set<string>();
        if (axis === "horizontal") {
          for (let x = 0; x < width; x += 1)
            if (alpha[x] === 0) pending.push([x, 0]);
        } else {
          for (let y = 0; y < height; y += 1)
            if (alpha[y * width] === 0) pending.push([0, y]);
        }
        const directions = diagonal
          ? [
              [-1, -1],
              [0, -1],
              [1, -1],
              [-1, 0],
              [1, 0],
              [-1, 1],
              [0, 1],
              [1, 1],
            ]
          : [
              [0, -1],
              [-1, 0],
              [1, 0],
              [0, 1],
            ];
        while (pending.length > 0) {
          const current = pending.shift();
          if (!current) break;
          const [x, y] = current;
          const key = `${x}:${y}`;
          if (seen.has(key)) continue;
          seen.add(key);
          if (
            (axis === "horizontal" && y === height - 1) ||
            (axis === "vertical" && x === width - 1)
          )
            return true;
          for (const [deltaX, deltaY] of directions) {
            const nextX = x + deltaX;
            const nextY = y + deltaY;
            if (
              nextX >= 0 &&
              nextY >= 0 &&
              nextX < width &&
              nextY < height &&
              alpha[nextY * width + nextX] === 0
            )
              pending.push([nextX, nextY]);
          }
        }
        return false;
      };
      const matrixLines = (
        alpha: readonly number[],
        width: number,
        height: number,
        axis: SeamProbe["axis"],
      ) =>
        axis === "horizontal"
          ? Array.from({ length: height }, (_row, y) =>
              Array.from({ length: width }, (_column, x) =>
                charForAlpha(alpha[y * width + x] ?? 0),
              ).join(""),
            )
          : Array.from({ length: width }, (_column, x) =>
              Array.from({ length: height }, (_row, y) =>
                charForAlpha(alpha[y * width + x] ?? 0),
              ).join(""),
            );
      const diagnostics = inputProbes.map((probe) => {
        const endpoint = worldToBitmap(
          probe.axis === "horizontal"
            ? probe.coordinate
            : probe.transverseCoordinate,
          probe.axis === "horizontal"
            ? probe.transverseCoordinate
            : probe.coordinate,
        );
        const profileStart = worldToBitmap(
          probe.axis === "horizontal" ? probe.coordinate : probe.profileStart,
          probe.axis === "horizontal" ? probe.profileStart : probe.coordinate,
        );
        const profileEnd = worldToBitmap(
          probe.axis === "horizontal" ? probe.coordinate : probe.profileEnd,
          probe.axis === "horizontal" ? probe.profileEnd : probe.coordinate,
        );
        const longitudinalRadius = 5;
        const x =
          probe.axis === "horizontal"
            ? Math.floor(endpoint.x) - longitudinalRadius
            : Math.floor(Math.min(profileStart.x, profileEnd.x));
        const y =
          probe.axis === "horizontal"
            ? Math.floor(Math.min(profileStart.y, profileEnd.y))
            : Math.floor(endpoint.y) - longitudinalRadius;
        const width =
          probe.axis === "horizontal"
            ? longitudinalRadius * 2 + 1
            : Math.max(1, Math.ceil(Math.abs(profileEnd.x - profileStart.x)));
        const height =
          probe.axis === "horizontal"
            ? Math.max(1, Math.ceil(Math.abs(profileEnd.y - profileStart.y)))
            : longitudinalRadius * 2 + 1;
        const sprites = probe.members.map(runtimeSprite);
        const renderAlpha = (selectedSprites: typeof sprites) => {
          const localCanvas = document.createElement("canvas");
          localCanvas.width = width;
          localCanvas.height = height;
          const localContext = localCanvas.getContext("2d");
          if (!localContext) throw new Error("Canvas alpha indisponível");
          localContext.imageSmoothingEnabled = true;
          for (const sprite of selectedSprites) {
            const position = worldToBitmap(sprite.x, sprite.y);
            localContext.drawImage(
              sprite.source,
              position.x - x,
              position.y - y,
              sprite.source.width * sprite.scaleX * camera.zoom * bitmapScaleX,
              sprite.source.height * sprite.scaleY * camera.zoom * bitmapScaleY,
            );
          }
          const rgba = localContext.getImageData(0, 0, width, height).data;
          return Array.from(
            { length: width * height },
            (_value, index) => rgba[index * 4 + 3] ?? 0,
          );
        };
        const individualAlpha = sprites.map((sprite) => ({
          alpha: renderAlpha([sprite]),
          instanceId: sprite.instanceId,
        }));
        const combinedAlpha = renderAlpha(sprites);
        const sampleDetails = [-1, 0, 1].flatMap((longitudinalOffset) =>
          [-1, 0, 1].map((transverseOffset) => {
            const world = {
              x:
                probe.axis === "horizontal"
                  ? probe.coordinate + longitudinalOffset
                  : probe.transverseCoordinate + transverseOffset,
              y:
                probe.axis === "horizontal"
                  ? probe.transverseCoordinate + transverseOffset
                  : probe.coordinate + longitudinalOffset,
            };
            const bitmap = worldToBitmap(world.x, world.y);
            const pixel = { x: Math.floor(bitmap.x), y: Math.floor(bitmap.y) };
            const localX = pixel.x - x;
            const localY = pixel.y - y;
            const localIndex = localY * width + localX;
            return {
              alpha: {
                combined: combinedAlpha[localIndex] ?? 0,
                individual: individualAlpha.map(({ alpha, instanceId }) => ({
                  alpha: alpha[localIndex] ?? 0,
                  instanceId,
                })),
              },
              bitmap,
              longitudinalOffset,
              pixel,
              sourceCoordinates: sprites.map((sprite) => ({
                instanceId: sprite.instanceId,
                x: (world.x - sprite.x) / sprite.scaleX,
                y: (world.y - sprite.y) / sprite.scaleY,
              })),
              transverseOffset,
              world,
            };
          }),
        );
        return {
          axis: probe.axis,
          combinedMatrix: matrixLines(combinedAlpha, width, height, probe.axis),
          connectedBackground: {
            fourNeighbor: connectedAcrossProfile(
              combinedAlpha,
              width,
              height,
              probe.axis,
              false,
            ),
            eightNeighbor: connectedAcrossProfile(
              combinedAlpha,
              width,
              height,
              probe.axis,
              true,
            ),
          },
          crop: { height, width, x, y },
          endpoint: {
            logical: probe.logicalEndpoint,
            logicalCanvas: worldToBitmap(
              probe.logicalWorld.x,
              probe.logicalWorld.y,
            ),
            logicalWorld: probe.logicalWorld,
            profileCenterCanvas: endpoint,
            profileCenterWorld:
              probe.axis === "horizontal"
                ? { x: probe.coordinate, y: probe.transverseCoordinate }
                : { x: probe.transverseCoordinate, y: probe.coordinate },
          },
          id: probe.id,
          individualMatrices: individualAlpha.map(({ alpha, instanceId }) => ({
            instanceId,
            matrix: matrixLines(alpha, width, height, probe.axis),
          })),
          kind: probe.kind,
          matrixLegend: ". alpha=0; + alpha=1..254; # alpha=255",
          matrixOrientation:
            "rows follow negative-to-positive transverse axis; columns follow negative-to-positive longitudinal axis",
          members: sprites.map((sprite) => ({
            instanceId: sprite.instanceId,
            renderedExtent: {
              endX: sprite.x + sprite.source.width * sprite.scaleX,
              endY: sprite.y + sprite.source.height * sprite.scaleY,
              startX: sprite.x,
              startY: sprite.y,
            },
            scaleX: sprite.scaleX,
            scaleY: sprite.scaleY,
            sourceSize: {
              height: sprite.source.height,
              width: sprite.source.width,
            },
            x: sprite.x,
            y: sprite.y,
          })),
          profile: { end: probe.profileEnd, start: probe.profileStart },
          positiveLongitudinalDirection:
            probe.axis === "horizontal" ? "+x (east)" : "+y (south)",
          samples: sampleDetails,
          transparentPixelCount: combinedAlpha.filter((alpha) => alpha === 0)
            .length,
        };
      });

      const focus = diagnostics.find(({ id }) => id === inputFocusId);
      let focusCrop:
        | {
            readonly enlarged: string;
            readonly original: string;
          }
        | undefined;
      if (focus) {
        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = focus.crop.width;
        cropCanvas.height = focus.crop.height;
        const cropContext = cropCanvas.getContext("2d");
        if (!cropContext) throw new Error("Canvas de recorte indisponível");
        cropContext.drawImage(
          canvas,
          focus.crop.x,
          focus.crop.y,
          focus.crop.width,
          focus.crop.height,
          0,
          0,
          focus.crop.width,
          focus.crop.height,
        );
        const enlargement = 16;
        const enlargedCanvas = document.createElement("canvas");
        enlargedCanvas.width = focus.crop.width * enlargement;
        enlargedCanvas.height = focus.crop.height * enlargement;
        const enlargedContext = enlargedCanvas.getContext("2d");
        if (!enlargedContext) throw new Error("Canvas ampliado indisponível");
        enlargedContext.imageSmoothingEnabled = false;
        enlargedContext.drawImage(
          cropCanvas,
          0,
          0,
          enlargedCanvas.width,
          enlargedCanvas.height,
        );
        focusCrop = {
          enlarged: enlargedCanvas.toDataURL("image/png"),
          original: cropCanvas.toDataURL("image/png"),
        };
      }
      return {
        camera: {
          bitmapScaleX,
          bitmapScaleY,
          canvas: { height: canvas.height, width: canvas.width },
          scrollX: camera.scrollX,
          scrollY: camera.scrollY,
          x: camera.x,
          y: camera.y,
          zoom: camera.zoom,
        },
        diagnostics,
        focusCrop,
        focusPixelWorldCenter: focus
          ? bitmapToWorld(
              focus.endpoint.profileCenterCanvas.x + 0.5,
              focus.endpoint.profileCenterCanvas.y + 0.5,
            )
          : undefined,
      };
    },
    { focusId, probes },
  );

  if (DIAGNOSTIC_DIRECTORY) {
    await mkdir(DIAGNOSTIC_DIRECTORY, { recursive: true });
    await writeFile(
      path.join(DIAGNOSTIC_DIRECTORY, `${scenario}-seams.json`),
      `${JSON.stringify(result, null, 2)}\n`,
      "utf8",
    );
    if (result.focusCrop) {
      const decode = (dataUrl: string) =>
        Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
      await writeFile(
        path.join(DIAGNOSTIC_DIRECTORY, `${scenario}-6-2-original.png`),
        decode(result.focusCrop.original),
      );
      await writeFile(
        path.join(DIAGNOSTIC_DIRECTORY, `${scenario}-6-2-enlarged-16x.png`),
        decode(result.focusCrop.enlarged),
      );
    }
  }
  return result.diagnostics.map(
    ({ connectedBackground, id, transparentPixelCount }) => ({
      connectedBackground,
      id,
      transparentPixelCount,
    }),
  );
}

async function expectStructuralSeamsCovered(
  rendered: RenderedScenario,
  structure: WorldStructureState,
  scenario: string,
  requiredCategories: readonly SeamInspectionKind[],
): Promise<void> {
  const probes = structureSeamProbes(structure);
  const result = await rendered.page.evaluate(async (inputProbes) => {
    const harness = window.__w3R3CB2;
    if (!harness) throw new Error("Harness visual ausente");
    const canvas = document.querySelector<HTMLCanvasElement>(
      "#w3-r3-c-b2-renderer canvas",
    );
    if (!canvas) throw new Error("Canvas visual ausente");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Contexto Canvas 2D ausente");
    const sceneValue = harness.sceneRef.value;
    if (typeof sceneValue !== "object" || sceneValue === null)
      throw new Error("Cena espacial indisponível");
    const camera = (
      sceneValue as {
        readonly cameras: {
          readonly main: {
            readonly scrollX: number;
            readonly scrollY: number;
            readonly x: number;
            readonly y: number;
            readonly zoom: number;
          };
        };
      }
    ).cameras.main;
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0)
      throw new Error("Canvas visual sem dimensões CSS");
    const bitmapScaleX = canvas.width / bounds.width;
    const bitmapScaleY = canvas.height / bounds.height;
    const longitudinalOffsets = [-1, 0, 1] as const;
    const transverseOffsets = [-1, 0, 1] as const;
    const samples = inputProbes.flatMap((probe) =>
      longitudinalOffsets.flatMap((longitudinalOffset) =>
        transverseOffsets.map((transverseOffset) => {
          const worldX =
            probe.axis === "horizontal"
              ? probe.coordinate + longitudinalOffset
              : probe.transverseCoordinate + transverseOffset;
          const worldY =
            probe.axis === "horizontal"
              ? probe.transverseCoordinate + transverseOffset
              : probe.coordinate + longitudinalOffset;
          return {
            id: probe.id,
            kind: probe.kind,
            longitudinalOffset,
            x: Math.floor(
              ((worldX - camera.scrollX) * camera.zoom + camera.x) *
                bitmapScaleX,
            ),
            y: Math.floor(
              ((worldY - camera.scrollY) * camera.zoom + camera.y) *
                bitmapScaleY,
            ),
          };
        }),
      ),
    );
    const outOfBounds = samples
      .filter(
        ({ x, y }) => x < 0 || y < 0 || x >= canvas.width || y >= canvas.height,
      )
      .map(({ id, x, y }) => ({ id, x, y }));
    const colorAt = (x: number, y: number): readonly number[] =>
      Array.from(context.getImageData(x, y, 1, 1).data);
    const foreground = samples.map((sample) => ({
      ...sample,
      rgba: colorAt(sample.x, sample.y),
    }));

    const visibilityTargets = [
      ...harness.images
        .filter(({ textureKey }) =>
          textureKey.startsWith("architecture.wall.stone-01."),
        )
        .map(({ object }) => object),
      ...harness.graphics
        .filter(({ structureInstanceId }) => structureInstanceId !== undefined)
        .map(({ object }) => object),
    ].map((value) => {
      if (typeof value !== "object" || value === null)
        throw new Error("Objeto estrutural inválido");
      const target = value as {
        readonly setVisible?: unknown;
        readonly visible?: unknown;
      };
      if (
        typeof target.setVisible !== "function" ||
        typeof target.visible !== "boolean"
      )
        throw new Error("Visibilidade estrutural indisponível");
      return {
        object: target as {
          setVisible(visible: boolean): unknown;
          readonly visible: boolean;
        },
        visible: target.visible,
      };
    });
    const waitForFrames = (count: number) =>
      new Promise<void>((resolve) => {
        let remaining = count;
        const next = () => {
          remaining -= 1;
          if (remaining <= 0) resolve();
          else requestAnimationFrame(next);
        };
        requestAnimationFrame(next);
      });

    let background: readonly (typeof foreground)[number][] = [];
    try {
      for (const target of visibilityTargets) target.object.setVisible(false);
      await waitForFrames(2);
      background = foreground.map((sample) => ({
        ...sample,
        rgba: colorAt(sample.x, sample.y),
      }));
    } finally {
      for (const target of visibilityTargets)
        target.object.setVisible(target.visible);
      await waitForFrames(2);
    }

    const exposed = inputProbes.flatMap((probe) =>
      longitudinalOffsets.flatMap((longitudinalOffset) => {
        const candidates = foreground.filter(
          (sample) =>
            sample.id === probe.id &&
            sample.longitudinalOffset === longitudinalOffset,
        );
        const covered = candidates.some((sample) => {
          const backgroundSample = background.find(
            ({ x, y }) => x === sample.x && y === sample.y,
          );
          return sample.rgba.some(
            (channel, index) => channel !== backgroundSample?.rgba[index],
          );
        });
        return covered
          ? []
          : [{ id: probe.id, kind: probe.kind, longitudinalOffset }];
      }),
    );
    return { exposed, outOfBounds };
  }, probes);

  const alphaInspection = await inspectSeamAlpha(
    rendered.page,
    probes,
    scenario,
  );
  const connectedBackgroundChannels = alphaInspection.filter(
    ({ connectedBackground }) =>
      connectedBackground.fourNeighbor || connectedBackground.eightNeighbor,
  );

  expect(result.outOfBounds, `${scenario}: amostras fora do canvas`).toEqual(
    [],
  );
  expect(
    connectedBackgroundChannels,
    `${scenario}: canal conectado de fundo atravessa a faixa estrutural`,
  ).toEqual([]);
  const categories = [...new Set(probes.map(({ kind }) => kind))].sort();
  for (const category of requiredCategories)
    expect(categories, `${scenario}: categoria ${category}`).toContain(
      category,
    );
  seamInspections.push({
    categories,
    connectedBackgroundChannels: connectedBackgroundChannels.length,
    examinedSeams: probes.length,
    scenario,
    transparentPixels: alphaInspection.reduce(
      (total, inspection) => total + inspection.transparentPixelCount,
      0,
    ),
  });
}

async function startRenderedScenario(
  page: Page,
  options: {
    readonly missingDefinitionIds?: readonly StructurePlacement["definitionId"][];
    readonly objects?: readonly PlacedObject[];
    readonly structure: WorldStructureState;
    readonly viewport: { readonly height: number; readonly width: number };
  },
): Promise<RenderedScenario> {
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const requestFailures: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
    if (message.type() === "warning") consoleWarnings.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("requestfailed", (request) => {
    requestFailures.push(
      `${new URL(request.url()).pathname}: ${request.failure()?.errorText ?? "unknown"}`,
    );
  });

  await page.setViewportSize(options.viewport);
  await page.route("**/src/main.tsx", (route) =>
    route.fulfill({
      body: "export {};",
      contentType: "application/javascript",
      status: 200,
    }),
  );
  const missingTextureKeys = (options.missingDefinitionIds ?? []).map(
    (definitionId) => {
      const asset = structureVisualAsset(definitionId);
      if (!asset) throw new Error(`Asset visual ausente: ${definitionId}`);
      return asset.textureKey;
    },
  );
  await page.goto(B2_DEVELOPMENT_BASE_URL, {
    waitUntil: "domcontentloaded",
  });

  await page.evaluate(
    async ({ missingTextureKeys, objects, structure, viewport }) => {
      document.documentElement.style.margin = "0";
      document.documentElement.style.overflow = "hidden";
      document.body.innerHTML = "";
      document.body.style.margin = "0";
      document.body.style.overflow = "hidden";
      const container = document.createElement("main");
      container.id = "w3-r3-c-b2-renderer";
      container.style.height = `${viewport.height}px`;
      container.style.width = `${viewport.width}px`;
      document.body.append(container);

      const factoryModulePath =
        "/src/features/library-visual/phaser/createPhaserGame.ts";
      const factoryModule: unknown = await import(
        /* @vite-ignore */ factoryModulePath
      );
      if (
        typeof factoryModule !== "object" ||
        factoryModule === null ||
        !("createLibraryVisualGame" in factoryModule) ||
        typeof factoryModule.createLibraryVisualGame !== "function"
      )
        throw new Error("Factory Phaser ativo indisponível");
      const createLibraryVisualGame = (
        factoryModule as {
          readonly createLibraryVisualGame: (
            options: unknown,
          ) => Promise<unknown>;
        }
      ).createLibraryVisualGame;
      const browserWindow = window as unknown as { readonly Phaser?: unknown };
      const phaserModule = browserWindow.Phaser;
      if (typeof phaserModule !== "object" || phaserModule === null)
        throw new Error("Módulo Phaser indisponível no harness visual");
      const phaser = phaserModule as {
        readonly GameObjects: {
          readonly GameObject: {
            readonly prototype: {
              setData: (this: unknown, key: string, value: unknown) => unknown;
            };
          };
          readonly GameObjectFactory: {
            readonly prototype: {
              graphics: (this: unknown, ...args: unknown[]) => unknown;
              image: (this: unknown, ...args: unknown[]) => unknown;
            };
          };
          readonly Graphics: {
            readonly prototype: {
              fillRect: (
                this: unknown,
                x: number,
                y: number,
                width: number,
                height: number,
              ) => unknown;
              strokeRect: (
                this: unknown,
                x: number,
                y: number,
                width: number,
                height: number,
              ) => unknown;
            };
          };
        };
        readonly Loader: {
          readonly LoaderPlugin: {
            readonly prototype: {
              image: (this: unknown, ...args: unknown[]) => unknown;
            };
          };
        };
        readonly Textures: {
          readonly TextureManager: {
            readonly prototype: {
              exists: (this: unknown, key: string) => boolean;
            };
          };
        };
      };

      const images: BrowserImageRecord[] = [];
      const graphics: BrowserGraphicsRecord[] = [];
      const interactions: unknown[] = [];
      const sceneRef: { value?: unknown } = {};
      const missingTextureKeySet = new Set<string>(missingTextureKeys);
      const loader = phaser.Loader.LoaderPlugin.prototype;
      const originalLoaderImage = loader.image;
      loader.image = function (...args: unknown[]) {
        const textureKey = args[0];
        if (
          typeof textureKey === "string" &&
          missingTextureKeySet.has(textureKey)
        )
          return this;
        return Reflect.apply(originalLoaderImage, this, args);
      };
      const textureManager = phaser.Textures.TextureManager.prototype;
      const originalTextureExists = textureManager.exists;
      textureManager.exists = function (key: string) {
        if (missingTextureKeySet.has(key)) return false;
        return Reflect.apply(originalTextureExists, this, [key]);
      };
      const factory = phaser.GameObjects.GameObjectFactory.prototype;
      const originalImage = factory.image;
      factory.image = function (...args: unknown[]) {
        const factoryWithScene = this as { readonly scene?: unknown };
        sceneRef.value ??= factoryWithScene.scene;
        const object = Reflect.apply(originalImage, this, args);
        const textureKey = args[2];
        if (typeof textureKey === "string") images.push({ object, textureKey });
        return object;
      };
      const originalGraphics = factory.graphics;
      factory.graphics = function (...args: unknown[]) {
        const factoryWithScene = this as { readonly scene?: unknown };
        sceneRef.value ??= factoryWithScene.scene;
        const object = Reflect.apply(originalGraphics, this, args);
        graphics.push({ fillRects: [], object, strokeRects: [] });
        return object;
      };

      const gameObject = phaser.GameObjects.GameObject.prototype;
      const originalSetData = gameObject.setData;
      gameObject.setData = function (key: string, value: unknown) {
        const result = Reflect.apply(originalSetData, this, [key, value]);
        if (key === "structureInstanceId" && typeof value === "string") {
          const record = graphics.find(
            (candidate) => candidate.object === this,
          );
          if (record) record.structureInstanceId = value;
        }
        return result;
      };

      const graphicsPrototype = phaser.GameObjects.Graphics.prototype;
      const originalFillRect = graphicsPrototype.fillRect;
      graphicsPrototype.fillRect = function (
        x: number,
        y: number,
        width: number,
        height: number,
      ) {
        const record = graphics.find((candidate) => candidate.object === this);
        if (record?.structureInstanceId)
          record.fillRects.push([x, y, width, height]);
        return Reflect.apply(originalFillRect, this, [x, y, width, height]);
      };
      const originalStrokeRect = graphicsPrototype.strokeRect;
      graphicsPrototype.strokeRect = function (
        x: number,
        y: number,
        width: number,
        height: number,
      ) {
        const record = graphics.find((candidate) => candidate.object === this);
        if (record?.structureInstanceId)
          record.strokeRects.push([x, y, width, height]);
        return Reflect.apply(originalStrokeRect, this, [x, y, width, height]);
      };

      const game = (await createLibraryVisualGame({
        constructionState: { active: false, tool: "explore" },
        container,
        onInteraction: (interaction: unknown) => interactions.push(interaction),
        onSceneEvent: () => undefined,
        period: "night",
        projection: {
          completedBooks: 0,
          decorationUnlockAnimation: null,
          hasCompletedBook: false,
          hasFirstCompletionMilestone: false,
          highlightedBook: null,
          inProgressBooks: 0,
          placedObjects: objects,
          roomState: "default",
          shelfOccupancy: "empty",
          shelfVisualGroupCount: 0,
          totalBooks: 0,
          unlockedDecorationIds: [],
          worldStructure: structure,
        },
        reducedMotion: true,
        room: {
          dayPeriod: "night",
          highContrast: false,
          reducedMotion: true,
          roomId: "main-library",
          stage: 1,
          unlocked: true,
          unlockedRoomIds: ["main-library"],
        },
        size: viewport,
      })) as BrowserGame;
      window.__w3R3CB2 = { game, graphics, images, interactions, sceneRef };
    },
    {
      missingTextureKeys,
      objects: options.objects ?? [],
      structure: options.structure,
      viewport: options.viewport,
    },
  );

  const missingDefinitions = new Set(options.missingDefinitionIds ?? []);
  const expectedFallbacks = options.structure.placements.filter((placement) =>
    missingDefinitions.has(placement.definitionId),
  ).length;
  await expect
    .poll(async () => {
      const snapshot = await runtimeSnapshot(page);
      return {
        canvasCount: snapshot.canvasCount,
        fallbacks: snapshot.fallbacks.length,
        sprites: snapshot.structuralSprites.length,
      };
    })
    .toEqual({
      canvasCount: 1,
      fallbacks: expectedFallbacks,
      sprites: options.structure.placements.length - expectedFallbacks,
    });
  await waitForFrames(page, 3);
  return { consoleErrors, consoleWarnings, page, requestFailures };
}

async function runtimeSnapshot(page: Page): Promise<RuntimeSnapshot> {
  return page.evaluate(() => {
    const harness = window.__w3R3CB2;
    if (!harness) throw new Error("Harness visual ausente");
    const readObject = (value: unknown) => {
      if (typeof value !== "object" || value === null)
        throw new Error("GameObject inválido no harness visual");
      return value as {
        readonly active: boolean;
        readonly depth: number;
        readonly originX: number;
        readonly originY: number;
        readonly scaleX: number;
        readonly scaleY: number;
        readonly visible: boolean;
        readonly x: number;
        readonly y: number;
      };
    };
    return {
      canvasCount: document.querySelectorAll("#w3-r3-c-b2-renderer canvas")
        .length,
      fallbacks: harness.graphics
        .filter(({ structureInstanceId }) => structureInstanceId !== undefined)
        .map((record) => {
          const object = readObject(record.object);
          return {
            active: object.active,
            depth: object.depth,
            fillRects: record.fillRects,
            instanceId: record.structureInstanceId ?? "",
            strokeRects: record.strokeRects,
            visible: object.visible,
          };
        }),
      graphicsDepths: harness.graphics
        .map(({ object }) => readObject(object))
        .filter(({ active, visible }) => active && visible)
        .map(({ depth }) => depth),
      interactions: harness.interactions,
      objectSprites: harness.images
        .filter(({ textureKey }) => textureKey.startsWith("furniture."))
        .map(({ object, textureKey }) => {
          const image = readObject(object);
          return {
            active: image.active,
            depth: image.depth,
            originX: image.originX,
            originY: image.originY,
            scaleX: image.scaleX,
            scaleY: image.scaleY,
            textureKey,
            visible: image.visible,
            x: image.x,
            y: image.y,
          };
        }),
      structuralSprites: harness.images
        .filter(({ textureKey }) =>
          textureKey.startsWith("architecture.wall.stone-01."),
        )
        .map(({ object, textureKey }) => {
          const image = readObject(object);
          return {
            active: image.active,
            depth: image.depth,
            originX: image.originX,
            originY: image.originY,
            scaleX: image.scaleX,
            scaleY: image.scaleY,
            textureKey,
            visible: image.visible,
            x: image.x,
            y: image.y,
          };
        }),
    };
  });
}

async function setConstructionState(
  page: Page,
  state: Parameters<NonNullable<BrowserGame["setConstructionState"]>>[0],
): Promise<void> {
  await page.evaluate((nextState) => {
    const game = window.__w3R3CB2?.game;
    if (!game?.setConstructionState)
      throw new Error("Estado de construção indisponível");
    game.setConstructionState(nextState);
  }, state);
  await waitForFrames(page, 2);
}

async function waitForFrames(page: Page, count: number): Promise<void> {
  await page.evaluate(
    (frameCount) =>
      new Promise<void>((resolve) => {
        let remaining = frameCount;
        const next = () => {
          remaining -= 1;
          if (remaining <= 0) resolve();
          else requestAnimationFrame(next);
        };
        requestAnimationFrame(next);
      }),
    count,
  );
}

async function worldToCanvas(page: Page, point: GridPoint): Promise<GridPoint> {
  return page.evaluate((worldPoint) => {
    const sceneValue = window.__w3R3CB2?.sceneRef.value;
    if (typeof sceneValue !== "object" || sceneValue === null)
      throw new Error("Cena espacial indisponível");
    const scene = sceneValue as {
      readonly cameras: {
        readonly main: { readonly scrollX: number; readonly scrollY: number };
      };
    };
    return {
      x: worldPoint.x - scene.cameras.main.scrollX,
      y: worldPoint.y - scene.cameras.main.scrollY,
    };
  }, point);
}

async function captureCanvas(
  browser: Browser,
  rendered: RenderedScenario,
  details: {
    readonly doorState: CaptureRecord["doorState"];
    readonly file: string;
    readonly scenario: string;
    readonly viewport: CaptureRecord["viewport"];
  },
): Promise<Buffer> {
  const canvas = rendered.page.locator("#w3-r3-c-b2-renderer canvas");
  const target = path.join(ARTIFACT_DIRECTORY, details.file);
  const buffer = await canvas.screenshot({ path: target });
  const dimensions = pngDimensions(buffer);
  captures.push({
    browser: browser.version(),
    canvas: dimensions,
    consoleErrors: [...rendered.consoleErrors],
    consoleWarnings: [...rendered.consoleWarnings],
    doorState: details.doorState,
    file: details.file,
    requestFailures: [...rendered.requestFailures],
    scenario: details.scenario,
    sha256: createHash("sha256").update(buffer).digest("hex"),
    viewport: details.viewport,
  });
  return buffer;
}

function pngDimensions(buffer: Buffer) {
  if (buffer.toString("ascii", 1, 4) !== "PNG")
    throw new Error("Evidência não é PNG");
  return {
    height: buffer.readUInt32BE(20),
    width: buffer.readUInt32BE(16),
  };
}

function expectCleanRuntime(rendered: RenderedScenario): void {
  expect(rendered.consoleErrors).toEqual([]);
  expect(rendered.consoleWarnings).toEqual([]);
  expect(rendered.requestFailures).toEqual([]);
}

async function stopScenario(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__w3R3CB2?.game.destroy();
    delete window.__w3R3CB2;
  });
}

test.beforeAll(async () => {
  await mkdir(ARTIFACT_DIRECTORY, { recursive: true });
});

test.afterAll(async () => {
  const manifest = {
    generatedAt: FIXED_TIMESTAMP,
    rendererPath: [
      "WorldStructureState",
      "structureRenderPlan",
      "structureVisualGeometry",
      "SpatialWorldScene",
      "canvas Phaser",
    ],
    rendererBackend: "Phaser.AUTO → Canvas (Chromium --disable-webgl)",
    seamInspections: [...seamInspections].sort((first, second) =>
      first.scenario.localeCompare(second.scenario),
    ),
    captures: [...captures].sort((first, second) =>
      first.file.localeCompare(second.file),
    ),
  };
  await writeFile(
    path.join(ARTIFACT_DIRECTORY, "capture-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
});

test("captures the complete canonical room through the active renderer", async ({
  browser,
  page,
}) => {
  const viewport = { height: 720, width: 960 };
  const rendered = await startRenderedScenario(page, {
    objects: DEPTH_OBJECTS,
    structure: INITIAL_WORLD_STRUCTURE,
    viewport,
  });
  const snapshot = await runtimeSnapshot(page);
  await expectStructuralSeamsCovered(
    rendered,
    INITIAL_WORLD_STRUCTURE,
    "canonical",
    ["door", "horizontal-corner", "vertical-corner"],
  );
  await captureCanvas(browser, rendered, {
    doorState: "closed",
    file: "canonical-room-full.png",
    scenario: "Sala canônica completa com assets reais e móveis",
    viewport,
  });

  expect(snapshot.fallbacks).toEqual([]);
  expect(actualSpriteRecords(snapshot)).toEqual(
    expectedSpriteRecords(INITIAL_WORLD_STRUCTURE),
  );
  expectCleanRuntime(rendered);
  await stopScenario(page);
});

for (const viewport of [
  { height: 640, width: 320 },
  { height: 800, width: 360 },
] as const) {
  test(`captures the canonical room at ${viewport.width}x${viewport.height}`, async ({
    browser,
    page,
  }) => {
    const rendered = await startRenderedScenario(page, {
      objects: DEPTH_OBJECTS,
      structure: INITIAL_WORLD_STRUCTURE,
      viewport,
    });
    const snapshot = await runtimeSnapshot(page);
    await captureCanvas(browser, rendered, {
      doorState: "closed",
      file: `canonical-room-mobile-${viewport.width}x${viewport.height}.png`,
      scenario: "Sala canônica em viewport móvel; captura direta do canvas",
      viewport,
    });

    expect(snapshot.fallbacks).toEqual([]);
    expect(actualSpriteRecords(snapshot)).toEqual(
      expectedSpriteRecords(INITIAL_WORLD_STRUCTURE),
    );
    expectCleanRuntime(rendered);
    await stopScenario(page);
  });
}

test("captures a closed non-canonical room with short, medium and long pieces", async ({
  browser,
  page,
}) => {
  const viewport = { height: 720, width: 960 };
  const rendered = await startRenderedScenario(page, {
    objects: DEPTH_OBJECTS,
    structure: MODIFIED_WORLD_STRUCTURE,
    viewport,
  });
  const snapshot = await runtimeSnapshot(page);
  await expectStructuralSeamsCovered(
    rendered,
    MODIFIED_WORLD_STRUCTURE,
    "modified",
    ["door", "horizontal-corner", "straight-straight", "vertical-corner"],
  );
  await captureCanvas(browser, rendered, {
    doorState: "open",
    file: "modified-room-full.png",
    scenario:
      "Cômodo fechado não canônico com peças de 1, 2 e 4 células e quatro cantos",
    viewport,
  });

  expect(snapshot.fallbacks).toEqual([]);
  expect(actualSpriteRecords(snapshot)).toEqual(
    expectedSpriteRecords(MODIFIED_WORLD_STRUCTURE),
  );
  expectCleanRuntime(rendered);
  await stopScenario(page);
});

test("captures open and closed doors on identical longitudinal planes", async ({
  browser,
  page,
}) => {
  const viewport = { height: 720, width: 960 };
  const rendered = await startRenderedScenario(page, {
    objects: DEPTH_OBJECTS,
    structure: DOOR_STATES_WORLD_STRUCTURE,
    viewport,
  });
  const snapshot = await runtimeSnapshot(page);
  await expectStructuralSeamsCovered(
    rendered,
    DOOR_STATES_WORLD_STRUCTURE,
    "door-states",
    ["door", "vertical-corner"],
  );
  await captureCanvas(browser, rendered, {
    doorState: "both",
    file: "door-states-detail.png",
    scenario:
      "Porta aberta ao norte e fechada ao sul nos mesmos planos x=224..352",
    viewport,
  });

  const doors = structureRenderPlan(DOOR_STATES_WORLD_STRUCTURE).filter(
    ({ kind }) => kind === "door",
  );
  expect(doors).toHaveLength(2);
  for (const door of doors)
    expect(
      door.transform.joinPlanes.map(({ coordinate }) => coordinate),
    ).toEqual([224, 352]);
  expect(snapshot.fallbacks).toEqual([]);
  expect(actualSpriteRecords(snapshot)).toEqual(
    expectedSpriteRecords(DOOR_STATES_WORLD_STRUCTURE),
  );
  expectCleanRuntime(rendered);
  await stopScenario(page);
});

test("captures canonical depth with selection highlight and placement preview", async ({
  browser,
  page,
}) => {
  const viewport = { height: 720, width: 960 };
  const rendered = await startRenderedScenario(page, {
    objects: DEPTH_OBJECTS,
    structure: INITIAL_WORLD_STRUCTURE,
    viewport,
  });
  await setConstructionState(page, { active: true, tool: "select" });
  const canvas = page.locator("#w3-r3-c-b2-renderer canvas");
  const bottomDoorPoint = await worldToCanvas(page, { x: 256, y: 460 });
  await canvas.click({ position: bottomDoorPoint });
  await waitForFrames(page, 2);
  await setConstructionState(page, {
    active: true,
    placingDefinitionId: "architecture.wall.stone-01.horizontal-1",
    tool: "place-structure",
  });
  const snapshot = await runtimeSnapshot(page);
  await captureCanvas(browser, rendered, {
    doorState: "closed",
    file: "depth-selection-detail.png",
    scenario:
      "Móvel entre arquitetura traseira/frontal, estrutura selecionada e preview ativo",
    viewport,
  });

  expect(snapshot.fallbacks).toEqual([]);
  expect(snapshot.graphicsDepths).toContain(89);
  expect(snapshot.graphicsDepths).toContain(90);
  expect(snapshot.interactions).toContainEqual({
    instanceId: "initial.door.bottom",
    type: "StructureSelected",
  });
  const desk = snapshot.objectSprites.find(({ textureKey }) =>
    textureKey.startsWith("furniture.desk.wood-01."),
  );
  const chair = snapshot.objectSprites.find(({ textureKey }) =>
    textureKey.startsWith("furniture.chair.wood-01."),
  );
  const rearWall = snapshot.structuralSprites.find(
    ({ textureKey }) =>
      textureKey === "architecture.wall.stone-01.horizontal-4",
  );
  const frontDoor = snapshot.structuralSprites.find(
    ({ textureKey }) =>
      textureKey === "architecture.wall.stone-01.door-horizontal.closed",
  );
  expect(desk?.depth).toBeGreaterThan(
    rearWall?.depth ?? Number.POSITIVE_INFINITY,
  );
  expect(chair?.depth).toBeLessThan(
    frontDoor?.depth ?? Number.NEGATIVE_INFINITY,
  );
  expect(actualSpriteRecords(snapshot)).toEqual(
    expectedSpriteRecords(INITIAL_WORLD_STRUCTURE),
  );
  expectCleanRuntime(rendered);
  await stopScenario(page);
});

test("captures canonical fallback shapes without simultaneous structural sprites", async ({
  browser,
  page,
}) => {
  const viewport = { height: 720, width: 960 };
  const missingDefinitionIds = [
    "architecture.wall.stone-01.corner-sw",
    "architecture.wall.stone-01.vertical-2",
    "architecture.wall.stone-01.door-horizontal.open",
    "architecture.wall.stone-01.door-horizontal.closed",
  ] as const;
  const rendered = await startRenderedScenario(page, {
    missingDefinitionIds,
    objects: DEPTH_OBJECTS,
    structure: DOOR_STATES_WORLD_STRUCTURE,
    viewport,
  });
  const snapshot = await runtimeSnapshot(page);
  await captureCanvas(browser, rendered, {
    doorState: "both",
    file: "fallback-detail.png",
    scenario:
      "Fallback forçado de canto, reta e portas aberta/fechada por supressão externa de disponibilidade",
    viewport,
  });

  const missingSet = new Set<string>(missingDefinitionIds);
  expect(actualSpriteRecords(snapshot)).toEqual(
    expectedSpriteRecords(DOOR_STATES_WORLD_STRUCTURE, missingSet),
  );
  expect(
    snapshot.structuralSprites.every(
      ({ textureKey }) => !missingSet.has(textureKey),
    ),
  ).toBe(true);
  const expectedFallbacks = structureRenderPlan(DOOR_STATES_WORLD_STRUCTURE)
    .filter(({ transform }) => missingSet.has(transform.definitionId))
    .map((piece) => {
      const geometry = structureVisualFallbackGeometry(
        piece.transform,
        piece.depth,
      );
      return {
        depth: rounded(geometry.depth),
        fillRects: geometry.regions.map(({ bounds }) => [
          bounds.x,
          bounds.y,
          bounds.width,
          bounds.height,
        ]),
        instanceId: geometry.instanceId,
      };
    })
    .sort((first, second) => first.instanceId.localeCompare(second.instanceId));
  const actualFallbacks = snapshot.fallbacks
    .map(({ active, strokeRects, visible, ...fallback }) => {
      expect(active).toBe(true);
      expect(visible).toBe(true);
      expect(strokeRects).toEqual(fallback.fillRects);
      return { ...fallback, depth: rounded(fallback.depth) };
    })
    .sort((first, second) => first.instanceId.localeCompare(second.instanceId));
  expect(actualFallbacks).toEqual(expectedFallbacks);
  expect(
    new Set(actualFallbacks.map(({ instanceId }) => instanceId)).size,
  ).toBe(actualFallbacks.length);
  expectCleanRuntime(rendered);
  await stopScenario(page);
});

test("validates every generated PNG and its recorded SHA-256", async () => {
  expect(captures).toHaveLength(7);
  for (const capture of captures) {
    const buffer = await readFile(path.join(ARTIFACT_DIRECTORY, capture.file));
    expect(pngDimensions(buffer)).toEqual(capture.canvas);
    expect(capture.canvas).toEqual(capture.viewport);
    expect(createHash("sha256").update(buffer).digest("hex")).toBe(
      capture.sha256,
    );
  }
});

test("checks closure, stable ordering and collinearity of visible corridors", () => {
  for (const structure of [
    INITIAL_WORLD_STRUCTURE,
    MODIFIED_WORLD_STRUCTURE,
    DOOR_STATES_WORLD_STRUCTURE,
  ]) {
    const direct = structureRenderPlan(structure);
    const reversed = structureRenderPlan({
      ...structure,
      placements: [...structure.placements].reverse(),
    });
    expect(reversed).toEqual(direct);
  }

  const mismatches = [
    ["canonical", INITIAL_WORLD_STRUCTURE, 8],
    ["modified", MODIFIED_WORLD_STRUCTURE, 15],
    ["door-states", DOOR_STATES_WORLD_STRUCTURE, 8],
  ].flatMap(([scenario, structure, meetings]) =>
    assertClosedComposition(
      structure as WorldStructureState,
      meetings as number,
    ).map((mismatch) => ({ ...mismatch, scenario })),
  );
  expect(mismatches).toEqual([]);
});
