import { OrthographicCamera } from "three";
import { describe, expect, it } from "vitest";
import baseline from "../../../../docs/audits/evidence/bv-recovery-r1/before.json";
import { LIBRARY_ROOMS } from "../libraryBuildingGeometry";
import { CameraNavigation } from "./CameraNavigation";
import {
  CameraNavigationGeometry,
  clampCameraNavigationState,
  panCameraNavigationStateBetweenScreenPoints,
  zoomCameraNavigationStateBetweenScreenPoints,
} from "./cameraMath";

describe("R1: bounded camera geometry cache", () => {
  it("keeps the original F camera trajectory for continuous pan and focal pinch", () => {
    for (const scenario of baseline.results) {
      const { width, height, gesture, states } = scenario;
      const navigation = new CameraNavigation(
        new OrthographicCamera(),
        1,
        LIBRARY_ROOMS,
      );
      navigation.setViewport(width, height);
      const previous = { x: width * 0.4, y: height * 0.4 };
      const run = (i: number) => {
        const current = {
          x: previous.x + Math.sin(i / 17) * 6,
          y: previous.y + Math.cos(i / 19) * 6,
        };
        if (gesture === "pan")
          navigation.panBetweenScreenPoints(previous, current);
        else
          navigation.zoomBetweenScreenPoints(
            previous,
            current,
            1.45 + Math.sin(i / 70) * 0.7,
          );
      };
      for (let i = 0; i < 100; i++) run(i);
      for (let i = 0; i < 600; i++) {
        run(i);
        if (i % 60 !== 0) continue;
        const expected = states[i / 60];
        expect(navigation.getState().targetX).toBeCloseTo(expected.targetX, 9);
        expect(navigation.getState().targetZ).toBeCloseTo(expected.targetZ, 9);
        expect(navigation.getState().zoom).toBe(expected.zoom);
      }
    }
  });

  it("does not rebuild invariant constraints during pan, and retains only two zooms", () => {
    const geometry = new CameraNavigationGeometry(LIBRARY_ROOMS);
    let state = { targetX: 0, targetZ: 0, zoom: 1 };
    const previous = { x: 200, y: 300 };
    for (let i = 0; i < 600; i++) {
      state = panCameraNavigationStateBetweenScreenPoints(
        state,
        previous,
        { x: 203, y: 304 },
        412,
        840,
        geometry,
      )!;
    }
    expect(geometry.getDiagnostics()).toEqual({
      projectedFloors: 5,
      constraintBuilds: 5,
      cachedZooms: 1,
    });
    for (let i = 1; i <= 100; i++) {
      state = zoomCameraNavigationStateBetweenScreenPoints(
        state,
        previous,
        previous,
        1 + i / 100,
        412,
        840,
        geometry,
      )!;
    }
    expect(geometry.getDiagnostics()).toEqual({
      projectedFloors: 5,
      constraintBuilds: 505,
      cachedZooms: 2,
    });
  });

  it("invalidates on orientation/layout changes and agrees with uncached limits across all rooms", () => {
    const geometry = new CameraNavigationGeometry(LIBRARY_ROOMS);
    for (const [width, height] of [
      [412, 840],
      [840, 412],
      [412, 840],
    ]) {
      for (const zoom of [0.7, 1, 2.2]) {
        for (const room of LIBRARY_ROOMS) {
          for (const scale of [1, 1e4, -1e4]) {
            const state = {
              targetX: room.maxX * scale,
              targetZ: room.maxZ * scale,
              zoom,
            };
            expect(
              clampCameraNavigationState(state, width, height, geometry),
            ).toEqual(
              clampCameraNavigationState(state, width, height, LIBRARY_ROOMS),
            );
          }
        }
      }
    }
    const builds = geometry.getDiagnostics().constraintBuilds;
    clampCameraNavigationState(
      { targetX: 0, targetZ: 0, zoom: 2.2 },
      412,
      840,
      geometry,
    );
    expect(geometry.getDiagnostics().constraintBuilds).toBe(builds);
    expect(
      clampCameraNavigationState(
        { targetX: 0, targetZ: 0, zoom: 2.2 },
        0,
        0,
        geometry,
      ),
    ).toBeNull();
    clampCameraNavigationState(
      { targetX: 0, targetZ: 0, zoom: 2.2 },
      412,
      840,
      geometry,
    );
    expect(geometry.getDiagnostics().constraintBuilds).toBe(builds + 10);

    const mutableFloors = [{ minX: -2, maxX: 2, minZ: -2, maxZ: 2 }];
    const owned = new CameraNavigationGeometry(mutableFloors);
    const extreme = { targetX: 1e4, targetZ: 1e4, zoom: 2.2 };
    const before = clampCameraNavigationState(extreme, 412, 840, owned);
    mutableFloors[0].maxX = 200;
    expect(clampCameraNavigationState(extreme, 840, 412, owned)).toEqual(
      clampCameraNavigationState(extreme, 840, 412, [
        { minX: -2, maxX: 2, minZ: -2, maxZ: 2 },
      ]),
    );
    expect(clampCameraNavigationState(extreme, 412, 840, owned)).toEqual(
      before,
    );
    expect(
      clampCameraNavigationState(
        extreme,
        412,
        840,
        new CameraNavigationGeometry(mutableFloors),
      ),
    ).not.toEqual(before);
  });
});
