import { Box3, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import {
  BF3C3_PREVIEW_SLOTS,
  PREVIEW_ROOMS,
  assignBf3c3PreviewSlots,
} from "./bf3c3PreviewLayout";
import {
  BF3C3_PREVIEW_SCENARIOS,
  createBf3c3PreviewSnapshot,
} from "./bf3c3PreviewScenarios";
import { getProceduralLibraryRecordDimensions } from "./three/libraryRecordDimensions";
import { createBf3c3PreviewBuilding } from "./three/bf3c3PreviewBuilding";
import { disposeObjectTree } from "./three/referenceScene";

function bounds(
  modelTypeId: (typeof BF3C3_PREVIEW_SLOTS)[number]["modelTypeId"],
  position: readonly [number, number, number],
) {
  const { width, height, depth } =
    getProceduralLibraryRecordDimensions(modelTypeId);
  return new Box3(
    new Vector3(position[0] - width / 2, 0, position[2] - depth / 2),
    new Vector3(position[0] + width / 2, height, position[2] + depth / 2),
  );
}

describe("prévia multiambiente BF-3C3", () => {
  it("mantém cinco cômodos com identidade apenas posicional e passagens no volume compartilhado", () => {
    expect(PREVIEW_ROOMS.map(({ id }) => id)).toEqual([
      "room-a",
      "room-b",
      "room-c",
      "room-d",
      "room-e",
    ]);
    expect(
      PREVIEW_ROOMS.every((room) => !Object.hasOwn(room, "category")),
    ).toBe(true);
    const building = createBf3c3PreviewBuilding();
    expect(
      building.children.filter(({ name }) => name.endsWith("-floor")),
    ).toHaveLength(5);
    expect(
      building.children.filter(({ name }) => name === "cross-wall-segment"),
    ).toHaveLength(5);
    expect(
      building.children.filter(({ name }) => name === "partition-segment"),
    ).toHaveLength(6);
    disposeObjectTree(building);
  });

  it("deriva 13 placements reais, sem interseções, e deixa overflow sem root", () => {
    expect(BF3C3_PREVIEW_SLOTS).toHaveLength(13);
    const assignment = assignBf3c3PreviewSlots(
      createBf3c3PreviewSnapshot(BF3C3_PREVIEW_SCENARIOS[2]),
    );
    expect(assignment).toEqual(
      assignBf3c3PreviewSlots(
        createBf3c3PreviewSnapshot(BF3C3_PREVIEW_SCENARIOS[2]),
      ),
    );
    expect(assignment.placements).toHaveLength(13);
    expect(assignment.overflow).toHaveLength(4);
    expect(
      assignment.overflow.every((item) => !Object.hasOwn(item, "root")),
    ).toBe(true);
    const placedBounds = assignment.placements.map(
      ({ modelTypeId, position }) => bounds(modelTypeId, position),
    );
    for (const [index, box] of placedBounds.entries()) {
      for (const other of placedBounds.slice(index + 1)) {
        const overlap = box.clone().intersect(other).getSize(new Vector3());
        expect(overlap.x > 0 && overlap.y > 0 && overlap.z > 0).toBe(false);
      }
    }
  });
});
