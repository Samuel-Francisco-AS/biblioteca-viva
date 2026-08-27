import { describe, expect, it } from "vitest";

import {
  AddFloorCells,
  GetStructuralInventory,
  INITIAL_WORLD_STRUCTURE,
  MoveStructure,
  PlaceStructure,
  RemoveFloorCells,
  RotateStructure,
  StoreStructure,
  type WorldStructureRepository,
  type WorldStructureState,
} from "./index";
import { MILESTONE_ID, STRUCTURAL_INVENTORY_FAMILY_ID } from "../domain";

function harness(initial: WorldStructureState = INITIAL_WORLD_STRUCTURE) {
  let state = initial;
  const repository: WorldStructureRepository = {
    get: () => Promise.resolve(state),
    initializeIfAbsent: () => Promise.resolve(state),
    save: (next, expectedRevision) => {
      if (expectedRevision !== state.revision)
        throw new Error("stale_structure");
      state = next;
      return Promise.resolve(state);
    },
  };
  return {
    repository,
    deps: {
      clock: { now: () => Promise.resolve("2026-08-27T00:00:00.000Z") },
      ids: { generate: () => Promise.resolve("new-piece") },
      objects: { list: () => Promise.resolve([]) },
      repository,
    },
    state: () => state,
  };
}

describe("W3 structural editing", () => {
  it("places, rotates, moves and stores a piece without changing its id", async () => {
    const world = harness();
    const placed = await new PlaceStructure(world.deps).execute({
      anchor: { x: 7, y: 5 },
      definitionId: "architecture.wall.stone-01.horizontal-1",
      expectedRevision: 1,
    });
    expect(placed.placements.at(-1)?.instanceId).toBe("new-piece");
    const rotated = await new RotateStructure(world.deps).execute({
      expectedRevision: 2,
      instanceId: "new-piece",
    });
    expect(rotated.placements.at(-1)?.definitionId).toBe(
      "architecture.wall.stone-01.vertical-1",
    );
    const moved = await new MoveStructure(world.deps).execute({
      anchor: { x: 8, y: 5 },
      expectedRevision: 3,
      instanceId: "new-piece",
    });
    expect(moved.placements.at(-1)?.instanceId).toBe("new-piece");
    const stored = await new StoreStructure(world.deps).execute({
      expectedRevision: 4,
      instanceId: "new-piece",
    });
    expect(
      stored.placements.some((item) => item.instanceId === "new-piece"),
    ).toBe(false);
  });

  it("adds in deterministic order and never creates a disconnected floor island", async () => {
    const world = harness();
    const result = await new AddFloorCells(world.deps).execute({
      cells: [
        { x: 15, y: 4 },
        { x: 99, y: 99 },
        { x: 15, y: 4 },
      ],
      expectedRevision: 1,
    });
    expect(result.placed).toBe(1);
    expect(result.ignored).toBe(2);
  });

  it("refuses to remove the protected anchor and does not persist a rejected batch", async () => {
    const world = harness();
    const result = await new RemoveFloorCells(world.deps).execute({
      cells: [{ x: 3, y: 4 }],
      expectedRevision: 1,
    });
    expect(result.removed).toBe(0);
    expect(world.state().revision).toBe(1);
  });

  it("deriva o inventário a partir das concessões estruturais persistidas", async () => {
    const world = harness();
    const inventory = await new GetStructuralInventory(world.repository, {
      list: () =>
        Promise.resolve([
          {
            id: MILESTONE_ID.structureFirstActivity,
            reachedAt: "2026-08-27T00:00:00.000Z",
            rewards: [
              {
                familyId: STRUCTURAL_INVENTORY_FAMILY_ID.wallShort,
                id: "reward.fixture.wall-short",
                quantity: 3,
                type: "structure-grant" as const,
              },
            ],
            ruleVersion: 1,
            source: {
              eventId: "event-fixture",
              eventType: "SessionChanged" as const,
            },
          },
        ]),
    }).execute();
    expect(inventory.available[STRUCTURAL_INVENTORY_FAMILY_ID.wallShort]).toBe(
      5,
    );
  });
});
