import { describe, expect, it, vi } from "vitest";

import {
  CHAIR_OBJECT_INSTANCE_ID,
  DEFAULT_PLACED_OBJECTS,
  DESK_OBJECT_INSTANCE_ID,
  WORLD_PLACEMENT_AREAS,
  placementIsValid,
} from "./world";
import type { PlacedObject } from "./world";
import {
  ListPlacedObjects,
  UpdatePlacedObjectTransform,
  type PlacedObjectRepository,
} from "./worldObjects";

function createRepository(objects: readonly PlacedObject[] = []) {
  const save = vi.fn<PlacedObjectRepository["save"]>(() => Promise.resolve());
  return {
    save,
    store: {
      getById: vi.fn((id: string) =>
        Promise.resolve(objects.find((object) => object.instanceId === id)),
      ),
      list: vi.fn(() => Promise.resolve(objects)),
      save,
    },
  };
}

describe("W2 furniture bootstrap and transforms", () => {
  it("hides only the former procedural fixture while adding furniture once", async () => {
    const legacy: PlacedObject = {
      definitionId: "object.reading-table",
      instanceId: "placed-object.reading-table",
      rotation: 0,
      spaceId: "space-a",
      x: 192,
      y: 224,
    };
    const { save, store } = createRepository([legacy]);
    const objects = await new ListPlacedObjects(store).execute();
    expect(objects.map((object) => object.instanceId)).toEqual([
      DESK_OBJECT_INSTANCE_ID,
      CHAIR_OBJECT_INSTANCE_ID,
    ]);
    expect(save).not.toHaveBeenCalled();
  });

  it("commits a valid drag for each new furniture object", async () => {
    const { save, store } = createRepository();
    const update = new UpdatePlacedObjectTransform(store, (object) =>
      placementIsValid(object, WORLD_PLACEMENT_AREAS),
    );
    await update.execute({
      instanceId: DEFAULT_PLACED_OBJECTS[0].instanceId,
      rotation: 0,
      spaceId: "space-a",
      x: 224,
      y: 224,
    });
    await update.execute({
      instanceId: DEFAULT_PLACED_OBJECTS[1].instanceId,
      rotation: 0,
      spaceId: "space-a",
      x: 320,
      y: 288,
    });
    expect(save).toHaveBeenCalledTimes(2);
  });

  it("rejects an invalid drag without persistence and saves a rotation", async () => {
    const { save, store } = createRepository();
    const update = new UpdatePlacedObjectTransform(store, (object) =>
      placementIsValid(object, WORLD_PLACEMENT_AREAS),
    );
    await expect(
      update.execute({
        instanceId: DEFAULT_PLACED_OBJECTS[0].instanceId,
        rotation: 0,
        spaceId: "space-a",
        x: 448,
        y: 224,
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
    expect(save).not.toHaveBeenCalled();
    await update.execute({
      instanceId: DEFAULT_PLACED_OBJECTS[1].instanceId,
      rotation: 90,
      spaceId: "space-a",
      x: 320,
      y: 256,
    });
    expect(save).toHaveBeenLastCalledWith(
      expect.objectContaining({ rotation: 90 }),
    );
  });
});
