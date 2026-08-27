import { describe, expect, it } from "vitest";

import {
  INITIAL_WORLD_STRUCTURE,
  type StructurePlacement,
} from "../../../application";
import {
  FloorGestureBatch,
  constructionHitAreas,
  isStructurePreviewValid,
  screenToWorld,
  snapFloorCell,
  snapStructureAnchor,
  structureAtWorldPoint,
  structureHitArea,
} from "./constructionInput";
import { CELL_SIZE } from "./spatialWorld";
import { TapSelectionPolicy } from "./tapSelectionPolicy";

const horizontalWall: StructurePlacement = {
  anchor: { x: 5, y: 4 },
  definitionId: "architecture.wall.stone-01.horizontal-1",
  instanceId: "structure.wall.horizontal",
};

const verticalWall: StructurePlacement = {
  anchor: { x: 12, y: 6 },
  definitionId: "architecture.wall.stone-01.vertical-2",
  instanceId: "structure.wall.vertical",
};

describe("entrada de Construção", () => {
  it("ativa hit areas de móveis e estruturas apenas no modo apropriado", () => {
    expect(constructionHitAreas({ active: false, tool: "explore" })).toEqual({
      objects: true,
      structures: false,
    });
    expect(constructionHitAreas({ active: true, tool: "select" })).toEqual({
      objects: false,
      structures: true,
    });
    expect(constructionHitAreas({ active: true, tool: "paint-floor" })).toEqual(
      { objects: false, structures: false },
    );
  });

  it("emite seleção estrutural somente para toque curto e uma vez", () => {
    const selection = new TapSelectionPolicy<"empty" | "structure">();
    selection.begin("structure", 1, 10, 10);
    expect(selection.end(1)).toBe("structure");
    expect(selection.end(1)).toBeUndefined();
    selection.begin("structure", 2, 10, 10);
    selection.move(2, 30, 10);
    expect(selection.end(2)).toBeUndefined();
  });

  it("converte tela para mundo considerando scroll e zoom", () => {
    expect(
      screenToWorld({ x: 64, y: 48 }, { scrollX: 320, scrollY: 128, zoom: 2 }),
    ).toEqual({ x: 352, y: 152 });
  });

  it("encaixa estruturas em vértices e piso na origem da célula", () => {
    expect(
      snapStructureAnchor({ x: 5.5 * CELL_SIZE, y: 4.5 * CELL_SIZE }),
    ).toEqual({
      x: 6,
      y: 5,
    });
    expect(snapFloorCell({ x: 5.99 * CELL_SIZE, y: 4.99 * CELL_SIZE })).toEqual(
      {
        x: 5,
        y: 4,
      },
    );
  });

  it("mantém snap determinístico em coordenadas negativas e próximas ao limite", () => {
    const point = { x: -0.01, y: CELL_SIZE - 0.01 };
    expect(snapFloorCell(point)).toEqual({ x: -1, y: 0 });
    expect(snapStructureAnchor(point)).toEqual({ x: 0, y: 1 });
    expect(snapStructureAnchor(point)).toEqual(snapStructureAnchor(point));
  });

  it("usa áreas geométricas estruturais, sem depender do alpha dos assets", () => {
    const verticalArea = structureHitArea(verticalWall);
    expect(verticalArea).toEqual({
      height: CELL_SIZE * 2,
      width: CELL_SIZE,
      x: 12 * CELL_SIZE,
      y: 6 * CELL_SIZE,
    });
    const structure = {
      ...INITIAL_WORLD_STRUCTURE,
      placements: [horizontalWall, verticalWall],
    };
    expect(
      structureAtWorldPoint(structure, {
        x: 12 * CELL_SIZE + 2,
        y: 7 * CELL_SIZE + 2,
      }),
    ).toEqual(verticalWall);
    expect(
      structureAtWorldPoint(structure, { x: 2 * CELL_SIZE, y: 2 * CELL_SIZE }),
    ).toBeUndefined();
    expect(
      structureHitArea({
        anchor: { x: 15, y: 4 },
        definitionId: "architecture.wall.stone-01.corner-se",
        instanceId: "structure.corner",
      }),
    ).toEqual({
      height: CELL_SIZE * 4,
      width: CELL_SIZE * 4,
      x: 11 * CELL_SIZE,
      y: 4 * CELL_SIZE,
    });
  });

  it("marca localmente destino estrutural livre e rejeita ocupação", () => {
    expect(
      isStructurePreviewValid(
        INITIAL_WORLD_STRUCTURE,
        horizontalWall.definitionId,
        { x: 5, y: 6 },
      ),
    ).toBe(true);
    expect(
      isStructurePreviewValid(
        INITIAL_WORLD_STRUCTURE,
        "architecture.wall.stone-01.horizontal-4",
        { x: 7, y: 4 },
      ),
    ).toBe(false);
  });

  it("ignora a própria estrutura na validade do movimento", () => {
    const moving = INITIAL_WORLD_STRUCTURE.placements.find(
      (placement) => placement.instanceId === "initial.wall.top",
    );
    if (!moving) throw new Error("Fixture estrutural ausente.");
    expect(
      isStructurePreviewValid(
        INITIAL_WORLD_STRUCTURE,
        moving.definitionId,
        moving.anchor,
        moving.instanceId,
      ),
    ).toBe(true);
  });

  it("deduplica células de piso preservando a ordem do primeiro encontro", () => {
    const batch = new FloorGestureBatch();
    expect(batch.add({ x: 4, y: 5 })).toBe(true);
    expect(batch.add({ x: 5, y: 5 })).toBe(true);
    expect(batch.add({ x: 4, y: 5 })).toBe(false);
    expect(batch.values()).toEqual([
      { x: 4, y: 5 },
      { x: 5, y: 5 },
    ]);
  });

  it("descarta um lote de piso no cancelamento", () => {
    const batch = new FloorGestureBatch();
    batch.add({ x: 4, y: 5 });
    batch.clear();
    expect(batch.values()).toEqual([]);
  });
});
