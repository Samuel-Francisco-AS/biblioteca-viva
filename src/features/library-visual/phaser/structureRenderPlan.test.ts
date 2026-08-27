import { describe, expect, it } from "vitest";

import { INITIAL_WORLD_STRUCTURE } from "../../../application";
import { structureRenderPlan } from "./structureRenderPlan";

describe("structureRenderPlan", () => {
  it("renders explicit placements only and never manufactures a vertical door", () => {
    const plan = structureRenderPlan(INITIAL_WORLD_STRUCTURE);
    expect(plan).toHaveLength(INITIAL_WORLD_STRUCTURE.placements.length);
    expect(plan.filter((piece) => piece.kind === "corner")).toHaveLength(4);
    expect(plan.filter((piece) => piece.kind === "door")).toHaveLength(1);
    expect(
      plan.every(
        (piece) =>
          piece.kind !== "door" || piece.asset.orientation === "horizontal",
      ),
    ).toBe(true);
    expect(plan.map((piece) => piece.key)).toEqual(
      [...plan.map((piece) => piece.key)].sort(),
    );
  });
});
