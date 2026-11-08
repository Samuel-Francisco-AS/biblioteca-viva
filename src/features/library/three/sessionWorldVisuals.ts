import {
  Group,
  Mesh,
  MeshBasicMaterial,
  PointLight,
  TorusGeometry,
} from "three";

import type { WorldSessionActivity } from "../../../contracts/worldSessionActivity";
import {
  LIBRARY_FURNISHING,
  FURNITURE_DIMENSIONS,
  furnitureWorldPoint,
  type FurnishingPlacement,
} from "./libraryFurnishingLayout";

import { SESSION_STATIONS as STATIONS } from "../sessionStations";

const COLORS = {
  reading: 0xf1ba70,
  viewing: 0x96a9ef,
  study: 0x8fdacc,
  physical_activity: 0xe8a87a,
  work: 0xc5a6fa,
} as const satisfies Record<WorldSessionActivity["kind"], number>;

function supportHeight(fixture: FurnishingPlacement): number {
  switch (fixture.kind) {
    case "study":
      return FURNITURE_DIMENSIONS.study.top;
    case "lounge":
      return FURNITURE_DIMENSIONS.lounge.top;
    case "bench":
      return FURNITURE_DIMENSIONS.bench.top;
    case "cabinet":
      return FURNITURE_DIMENSIONS.cabinet.top;
    case "plant":
      return 0;
  }
}

/**
 * A modest confirmed-session signal on existing furniture. It is neither a
 * selectable copy of the user's record nor a simulation of an NPC pickup.
 * Future BF-5.5F animation can reuse this same session authority.
 */
export function createSessionWorldVisuals(building: Group) {
  const root = new Group();
  root.name = "bf55f-confirmed-session-aura";
  const material = new MeshBasicMaterial({
    color: 0xf1ba70,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });
  const ring = new Mesh(new TorusGeometry(0.32, 0.035, 8, 48), material);
  ring.name = "bf55f-session-rune";
  ring.rotation.x = -Math.PI / 2;
  root.add(ring);
  const light = new PointLight(0xf1ba70, 0, 3.2, 2);
  light.name = "bf55f-session-light";
  light.position.y = 0.35;
  root.add(light);
  root.visible = false;
  building.add(root);

  return {
    root,
    apply(session: WorldSessionActivity | null): void {
      if (!session) {
        root.visible = false;
        light.intensity = 0;
        return;
      }
      const fixture = LIBRARY_FURNISHING.find(
        ({ id }) => id === STATIONS[session.kind],
      );
      if (!fixture) {
        root.visible = false;
        light.intensity = 0;
        return;
      }
      const point = furnitureWorldPoint(fixture, {
        x: 0,
        y: supportHeight(fixture) + 0.1,
        z: 0,
      });
      root.position.set(point.x, point.y, point.z);
      const color = COLORS[session.kind];
      material.color.setHex(color);
      light.color.setHex(color);
      root.visible = true;
      ring.scale.setScalar(session.kind === "reading" ? 1.3 : 1);
      material.opacity =
        session.status === "active"
          ? session.kind === "reading"
            ? 0.9
            : 0.65
          : 0.22;
      light.intensity = session.status === "active" ? 0.55 : 0.06;
    },
  };
}
