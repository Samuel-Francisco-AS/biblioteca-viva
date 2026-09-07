import { describe, expect, it } from "vitest";

import {
  INITIAL_WORLD_STRUCTURE,
  type FloorCell,
  type StructureDefinitionId,
  type StructurePlacement,
  type WorldStructureState,
} from "../../../application";
import { resolveStructureInteriorNormals } from "./structureVisualTopology";

function placement(
  definitionId: StructureDefinitionId,
  anchor: { readonly x: number; readonly y: number } = { x: 0, y: 0 },
  instanceId = "topology.subject",
): StructurePlacement {
  return { anchor, definitionId, instanceId };
}

function state(
  floorCells: readonly FloorCell[],
  subject: StructurePlacement,
): WorldStructureState {
  return {
    ...INITIAL_WORLD_STRUCTURE,
    floorCells,
    placements: [subject],
  };
}

function mainNormal(
  definitionId: StructureDefinitionId,
  floorCells: readonly FloorCell[],
) {
  const subject = placement(definitionId);
  return resolveStructureInteriorNormals(state(floorCells, subject), subject)
    .parts[0];
}

describe("W3-A-R3-C-B2-FIX-B2 interior topology", () => {
  it.each([
    {
      definitionId: "architecture.wall.stone-01.horizontal-1" as const,
      floorCells: [{ x: 0, y: -1 }],
      normal: { axis: "y", direction: "negative", side: "north" },
    },
    {
      definitionId: "architecture.wall.stone-01.horizontal-1" as const,
      floorCells: [{ x: 0, y: 0 }],
      normal: { axis: "y", direction: "positive", side: "south" },
    },
    {
      definitionId: "architecture.wall.stone-01.vertical-1" as const,
      floorCells: [{ x: -1, y: 0 }],
      normal: { axis: "x", direction: "negative", side: "west" },
    },
    {
      definitionId: "architecture.wall.stone-01.vertical-1" as const,
      floorCells: [{ x: 0, y: 0 }],
      normal: { axis: "x", direction: "positive", side: "east" },
    },
  ])(
    "resolves $normal.side from the only adjacent floor side",
    ({ definitionId, floorCells, normal }) => {
      expect(mainNormal(definitionId, floorCells)).toMatchObject({
        kind: "resolved",
        normal,
      });
    },
  );

  it("resolves an open chain without requiring a closed perimeter", () => {
    const result = mainNormal("architecture.wall.stone-01.horizontal-2", [
      { x: 0, y: -1 },
      { x: 1, y: -1 },
    ]);

    expect(result).toMatchObject({
      kind: "resolved",
      normal: { axis: "y", direction: "negative", side: "north" },
    });
    expect(result?.observations).toHaveLength(2);
  });

  it("keeps an isolated piece ambiguous without choosing a side", () => {
    expect(
      mainNormal("architecture.wall.stone-01.horizontal-1", []),
    ).toMatchObject({
      kind: "ambiguous",
      reason: "no-adjacent-floor",
    });
  });

  it("reports floor on both sides as ambiguous", () => {
    expect(
      mainNormal("architecture.wall.stone-01.horizontal-1", [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
      ]),
    ).toMatchObject({
      kind: "ambiguous",
      reason: "floor-on-both-sides",
    });
  });

  it("reports partially supported segments as ambiguous", () => {
    expect(
      mainNormal("architecture.wall.stone-01.horizontal-2", [{ x: 0, y: -1 }]),
    ).toMatchObject({
      kind: "ambiguous",
      reason: "mixed-edge-adjacency",
    });
  });

  it("reports contradictory normals across one placement", () => {
    const result = mainNormal("architecture.wall.stone-01.horizontal-2", [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
    ]);

    expect(result).toMatchObject({
      kind: "inconsistent",
      normals: [
        { axis: "y", direction: "negative", side: "north" },
        { axis: "y", direction: "positive", side: "south" },
      ],
      reason: "contradictory-floor-sides",
    });
  });

  it("resolves the two perpendicular arms of a corner independently", () => {
    const subject = placement("architecture.wall.stone-01.corner-sw");
    const floorCells = Array.from({ length: 4 }, (_row, y) =>
      Array.from({ length: 4 }, (_column, x) => ({ x, y })),
    ).flat();
    const result = resolveStructureInteriorNormals(
      state(floorCells, subject),
      subject,
    );

    expect(result.parts).toHaveLength(2);
    expect(result.parts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "resolved",
          normal: { axis: "y", direction: "positive", side: "south" },
          part: "corner-horizontal-arm",
        }),
        expect.objectContaining({
          kind: "resolved",
          normal: { axis: "x", direction: "positive", side: "east" },
          part: "corner-vertical-arm",
        }),
      ]),
    );
  });

  it("is invariant under floor and placement order", () => {
    const subject = INITIAL_WORLD_STRUCTURE.placements[0];
    if (!subject) throw new Error("Placement canônico ausente.");
    const direct = resolveStructureInteriorNormals(
      INITIAL_WORLD_STRUCTURE,
      subject,
    );
    const reordered = resolveStructureInteriorNormals(
      {
        ...INITIAL_WORLD_STRUCTURE,
        floorCells: [...INITIAL_WORLD_STRUCTURE.floorCells].reverse(),
        placements: [...INITIAL_WORLD_STRUCTURE.placements].reverse(),
      },
      subject,
    );

    expect(reordered).toEqual(direct);
  });

  it("uses the same rule for shifted negative coordinates", () => {
    const subject = placement("architecture.wall.stone-01.vertical-2", {
      x: -7,
      y: -5,
    });
    const result = resolveStructureInteriorNormals(
      state(
        [
          { x: -8, y: -5 },
          { x: -8, y: -4 },
        ],
        subject,
      ),
      subject,
    );

    expect(result.parts[0]).toMatchObject({
      kind: "resolved",
      normal: { axis: "x", direction: "negative", side: "west" },
    });
  });

  it("preserves every resolved normal when the whole room is shifted", () => {
    const offset = { x: -23, y: 17 };
    const shifted: WorldStructureState = {
      ...INITIAL_WORLD_STRUCTURE,
      floorCells: INITIAL_WORLD_STRUCTURE.floorCells.map(({ x, y }) => ({
        x: x + offset.x,
        y: y + offset.y,
      })),
      placements: INITIAL_WORLD_STRUCTURE.placements.map((item) => ({
        ...item,
        anchor: {
          x: item.anchor.x + offset.x,
          y: item.anchor.y + offset.y,
        },
      })),
    };
    const summarize = (structure: WorldStructureState) =>
      structure.placements.flatMap((subject) =>
        resolveStructureInteriorNormals(structure, subject).parts.map(
          (result) => ({
            kind: result.kind,
            normal: result.kind === "resolved" ? result.normal : undefined,
            part: result.part,
          }),
        ),
      );

    expect(summarize(shifted)).toEqual(summarize(INITIAL_WORLD_STRUCTURE));
  });

  it("resolves every arm in the canonical room without identity checks", () => {
    const results = INITIAL_WORLD_STRUCTURE.placements.map((subject) =>
      resolveStructureInteriorNormals(INITIAL_WORLD_STRUCTURE, subject),
    );

    expect(results.flatMap(({ parts }) => parts)).toHaveLength(12);
    expect(
      results
        .flatMap(({ parts }) => parts)
        .every(({ kind }) => kind === "resolved"),
    ).toBe(true);
  });
});
