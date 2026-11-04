import { describe, expect, it } from "vitest";
import { OrthographicCamera, Plane, Raycaster, Vector2, Vector3 } from "three";
import { CameraNavigation } from "./CameraNavigation";
import { LIBRARY_ROOMS } from "../libraryBuildingGeometry";

describe("BF-5R4: depth and projection of the sanctuary", () => {
  it("reproduces near-plane clipping when exploring portrait at zoom 1", () => {
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    const navigation = new CameraNavigation(camera, 1, LIBRARY_ROOMS);
    navigation.setViewport(390, 844);
    camera.updateMatrixWorld(true);
    const ray = new Raycaster();
    ray.setFromCamera(new Vector2(0, -1), camera);
    expect(
      ray.ray.intersectPlane(new Plane(new Vector3(0, 1, 0), 0), new Vector3()),
    ).toBeNull();
  });
  it.each([
    [390, 844],
    [844, 390],
    [320, 960],
  ])(
    "keeps the exterior floor in front of the near plane at %s×%s",
    (width, height) => {
      const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
      const navigation = new CameraNavigation(camera, 1, LIBRARY_ROOMS, 10);
      navigation.setViewport(width, height);
      for (const zoom of [0.7, 1, 2.2]) {
        navigation.setZoom(zoom);
        camera.updateMatrixWorld(true);
        for (const x of [-1, 1])
          for (const y of [-1, 1]) {
            const ray = new Raycaster();
            ray.setFromCamera(new Vector2(x, y), camera);
            const hit = ray.ray.intersectPlane(
              new Plane(new Vector3(0, 1, 0), 1.1),
              new Vector3(),
            );
            expect(hit).not.toBeNull();
            if (!hit) throw new Error("Floor behind camera");
            const ndc = hit.clone().project(camera);
            expect(ndc.z).toBeGreaterThan(-1);
            expect(ndc.z).toBeLessThan(1);
            expect(Math.abs(hit.x)).toBeLessThan(250);
            expect(Math.abs(hit.z)).toBeLessThan(250);
          }
      }
      const before = navigation.getState();
      navigation.setViewport(height, width);
      expect(navigation.getState().zoom).toBe(before.zoom);
    },
  );
});
