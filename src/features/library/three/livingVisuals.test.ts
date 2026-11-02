import { LIBRARY_CIRCULATION } from "../librarySpatialLayout";
import { rectanglesOverlap } from "../librarySpatialGeometry";
import { describe, expect, it, vi } from "vitest";
import {
  Box3,
  HemisphereLight,
  Mesh,
  Scene,
  type Object3D,
  type BufferGeometry,
  type Material,
} from "three";
function isMesh(
  object: Object3D,
): object is Mesh<BufferGeometry, Material | Material[]> {
  return object instanceof Mesh;
}
import { LivingSession } from "../livingObjects";
import { createProceduralLibraryBuilding } from "./proceduralLibraryBuilding";
import { createLivingVisuals } from "./livingVisuals";
import { disposeObjectTree } from "./referenceScene";
import { LIBRARY_ROOMS } from "../libraryBuildingGeometry";
describe("living visuals", () => {
  it("animates real pieces, lights the scene and disposes resources exactly once", () => {
    const scene = new Scene();
    const building = createProceduralLibraryBuilding(true);
    scene.add(building);
    const light = new HemisphereLight(0xffffff, 0xffffff, 2);
    scene.add(light);
    const session = new LivingSession();
    const visuals = createLivingVisuals(building, scene, session);
    const find = (id: string) => {
      const item = visuals.selectables.find((i) => i.descriptor.id === id);
      if (!item) throw new Error(id);
      return item;
    };
    visuals.update(0, true);
    expect(find("living:lamp").light?.intensity).toBe(0);
    session.act("living:lamp", "toggle");
    visuals.update(0, true);
    expect(find("living:lamp").light?.intensity).toBeGreaterThan(0);
    session.act("living:cabinet", "toggle");
    visuals.update(0, true);
    expect(find("living:cabinet").moving.position.z).toBe(-0.42);
    session.act("living:cabinet", "toggle");
    visuals.update(0, true);
    expect(find("living:cabinet").moving.position.z).toBeCloseTo(0);
    session.act("living:seat", "touch");
    visuals.update(0, true);
    expect(
      find("living:seat").moving.getObjectByName("living-seat-cushion"),
    ).toBeDefined();
    expect(find("living:seat").moving.scale.y).toBe(0.65);
    session.act("living:globe", "turn");
    visuals.update(0, true);
    expect(find("living:globe").moving.rotation.y).toBe(Math.PI / 2);
    session.act("living:book", "toggle");
    visuals.update(0, true);
    expect(find("living:book").moving.rotation.z).toBe(2.1);
    session.setAtmosphere("noturna");
    visuals.update(0, true);
    expect(light.intensity).toBe(0.65);
    for (const item of visuals.selectables) {
      const room = LIBRARY_ROOMS.find(
        (r) => r.id === `room-${item.object.room.toLowerCase()}`,
      );
      if (!room) throw new Error("room");
      const bounds = new Box3().setFromObject(item.root);
      for (const corridor of LIBRARY_CIRCULATION)
        expect(
          rectanglesOverlap(corridor, {
            minX: bounds.min.x,
            maxX: bounds.max.x,
            minZ: bounds.min.z,
            maxZ: bounds.max.z,
          }),
          item.descriptor.id,
        ).toBe(false);
      expect(bounds.min.x).toBeGreaterThan(room.minX);
      expect(bounds.max.x).toBeLessThan(room.maxX);
      expect(bounds.min.z).toBeGreaterThan(room.minZ);
      expect(bounds.max.z).toBeLessThan(room.maxZ);
    }
    const resources = new Set<{ dispose: () => void }>();
    building.traverse((o) => {
      if (isMesh(o)) {
        resources.add(o.geometry);
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          resources.add(m);
      }
    });
    const spies = [...resources].map((r) => vi.spyOn(r, "dispose"));
    disposeObjectTree(building);
    disposeObjectTree(building);
    for (const spy of spies) expect(spy).toHaveBeenCalledOnce();
  });
});
