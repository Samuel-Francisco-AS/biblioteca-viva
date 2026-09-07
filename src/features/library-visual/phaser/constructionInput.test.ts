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
  structureContainsWorldPoint,
  structureHitArea,
  structureHitRegions,
} from "./constructionInput";
import { CELL_SIZE } from "./spatialWorld";
import { structureVisualTransform } from "./structureVisualGeometry";
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

  it("usa as regiões ocupadas da mesma transformação que posiciona o sprite", () => {
    const verticalArea = structureHitArea(verticalWall);
    const verticalTransform = structureVisualTransform(verticalWall);
    expect(verticalArea).toEqual(
      verticalTransform.interactionRegions[0]?.bounds,
    );
    expect(verticalArea?.height).toBe(CELL_SIZE * 2);
    expect(verticalArea?.width).toBeCloseTo(235 * (CELL_SIZE / 300), 10);
    expect(verticalArea?.x).toBe(12 * CELL_SIZE);
    expect(verticalArea?.y).toBe(6 * CELL_SIZE);
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

  it("seleciona a parede direita na região transladada para o interior", () => {
    const rightWall = INITIAL_WORLD_STRUCTURE.placements.find(
      ({ instanceId }) => instanceId === "initial.wall.right",
    );
    if (!rightWall) throw new Error("Parede direita canônica ausente.");
    const alignedRegions = structureHitRegions(
      rightWall,
      INITIAL_WORLD_STRUCTURE,
    );
    const unalignedRegions = structureHitRegions(rightWall);
    const aligned = alignedRegions[0];
    const unaligned = unalignedRegions[0];
    if (!aligned || !unaligned) throw new Error("Região vertical ausente.");
    const point = {
      x: aligned.x + aligned.width / 2,
      y: aligned.y + aligned.height / 2,
    };

    expect(aligned.x + aligned.width).toBeCloseTo(15 * CELL_SIZE, 10);
    expect(unaligned.x).toBe(15 * CELL_SIZE);
    expect(structureAtWorldPoint(INITIAL_WORLD_STRUCTURE, point)).toEqual(
      rightWall,
    );
    expect(structureContainsWorldPoint(rightWall, point)).toBe(false);
  });

  it.each(["ne", "nw", "se", "sw"] as const)(
    "treats corner-%s as two arms and excludes its transparent interior",
    (corner) => {
      const candidate: StructurePlacement = {
        anchor: { x: -2, y: 3 },
        definitionId: `architecture.wall.stone-01.corner-${corner}`,
        instanceId: `structure.corner.${corner}`,
      };
      const transform = structureVisualTransform(candidate);
      const regions = structureHitRegions(candidate);
      expect(regions).toEqual(
        transform.interactionRegions.map(({ bounds }) => bounds),
      );
      expect(regions).toHaveLength(2);

      for (const area of regions) {
        expect(
          structureContainsWorldPoint(candidate, {
            x: area.x + area.width / 2,
            y: area.y + area.height / 2,
          }),
        ).toBe(true);
      }

      expect(
        structureContainsWorldPoint(candidate, {
          x: transform.alphaBounds.x + transform.alphaBounds.width / 2,
          y: transform.alphaBounds.y + transform.alphaBounds.height / 2,
        }),
      ).toBe(false);
    },
  );

  it("selects one corner instance once at either arm or their intersection", () => {
    const corner: StructurePlacement = {
      anchor: { x: 0, y: 0 },
      definitionId: "architecture.wall.stone-01.corner-sw",
      instanceId: "structure.corner.compound",
    };
    const [horizontal, vertical] = structureHitRegions(corner);
    if (!horizontal || !vertical) throw new Error("Braços de canto ausentes.");
    const structure = { ...INITIAL_WORLD_STRUCTURE, placements: [corner] };
    const points = [
      {
        x: horizontal.x + horizontal.width / 2,
        y: horizontal.y + horizontal.height / 2,
      },
      {
        x: vertical.x + vertical.width / 2,
        y: vertical.y + vertical.height / 2,
      },
      {
        x: Math.max(horizontal.x, vertical.x) + 1,
        y: Math.max(horizontal.y, vertical.y) + 1,
      },
    ];
    expect(
      points.map((point) => structureAtWorldPoint(structure, point)),
    ).toEqual([corner, corner, corner]);
  });

  it("aligns open and closed doors to x=224..352 without lateral offset", () => {
    const regions = ["closed", "open"].map((state) => {
      const candidate: StructurePlacement = {
        anchor: { x: 7, y: 14 },
        definitionId:
          state === "closed"
            ? "architecture.wall.stone-01.door-horizontal.closed"
            : "architecture.wall.stone-01.door-horizontal.open",
        instanceId: `structure.door.${state}`,
      };
      const [area] = structureHitRegions(candidate);
      if (!area) throw new Error(`Área da porta ${state} ausente.`);
      expect(area).toEqual(
        structureVisualTransform(candidate).interactionRegions[0]?.bounds,
      );
      expect(area.x).toBe(224);
      expect(area.x + area.width).toBe(352);
      return area;
    });
    expect(regions[0]?.x).toBe(regions[1]?.x);
    expect(regions[0]?.width).toBe(regions[1]?.width);
  });

  it("recomputes negative and rotated placements through the canonical function", () => {
    const horizontal: StructurePlacement = {
      anchor: { x: -4, y: -3 },
      definitionId: "architecture.wall.stone-01.horizontal-2",
      instanceId: "structure.moved",
    };
    const vertical: StructurePlacement = {
      ...horizontal,
      definitionId: "architecture.wall.stone-01.vertical-2",
    };
    for (const candidate of [horizontal, vertical]) {
      const regions = structureHitRegions(candidate);
      expect(regions).toEqual(
        structureVisualTransform(candidate).interactionRegions.map(
          ({ bounds }) => bounds,
        ),
      );
      expect(regions[0]?.x).toBeLessThan(0);
      expect(regions[0]?.y).toBeLessThan(0);
    }
    expect(structureHitRegions(vertical)).not.toEqual(
      structureHitRegions(horizontal),
    );
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
