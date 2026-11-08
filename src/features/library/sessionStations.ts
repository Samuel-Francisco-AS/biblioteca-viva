import type { WorldSessionActivity } from "../../contracts/worldSessionActivity";
import type { Position } from "./inhabitantNavigation";
import {
  LIBRARY_FURNISHING,
  furnitureWorldPoint,
} from "./three/libraryFurnishingLayout";

export const SESSION_STATIONS = {
  reading: "bf4-prop:2",
  viewing: "bf4-prop:6",
  study: "bf4-prop:9",
  physical_activity: "bf4-prop:14",
  work: "bf4-prop:16",
} as const satisfies Record<WorldSessionActivity["kind"], string>;
export interface SessionSeat {
  readonly id: string;
  readonly stationId: string;
  readonly center: Position;
  readonly approach: Position;
  readonly dock: Position;
  readonly facing: number;
  readonly height: number;
  readonly local: Position;
}
/** Functional seats have a clear side aisle, open arms and a low lumbar back.
 * Existing decorative seats retain their form. Docking excludes only its own
 * reserved seat collider; every other obstacle and the full wing radius remain.
 */
export const SESSION_SEATS: readonly SessionSeat[] = (
  ["reading", "study"] as const
).map((kind) => {
  const stationId = SESSION_STATIONS[kind];
  const p = LIBRARY_FURNISHING.find((p) => p.id === stationId)!;
  const local =
    kind === "study" ? { x: -1.55, z: -2.56 } : { x: -1.8, z: 0.35 };
  // Side approach goes to the open front of the seat, never through its back.
  const point = (x: number, z: number) =>
    furnitureWorldPoint(p, { x, y: 0, z });
  return Object.freeze({
    id: `seat:${stationId}:reader`,
    stationId,
    local,
    center: point(local.x, local.z),
    dock: point(local.x, local.z + (kind === "study" ? 0.4 : -0.4)),
    approach:
      kind === "study"
        ? point(local.x - 1.65, local.z + 0.4)
        : point(local.x, local.z - 2.05),
    facing: (kind === "study" ? 0 : Math.PI) + p.rotation,
    height: 0.42,
  });
});

/** Ytha's shorter thighs and hovering feet require a nearer docking origin.
 * This changes the seat pose, never the wing/travel collision envelope. */
export function seatForInhabitant(
  seat: SessionSeat,
  key: import("./inhabitants").InhabitantKey,
): SessionSeat {
  if (key !== "ytha") return seat;
  return {
    ...seat,
    dock: {
      x: seat.dock.x - Math.sin(seat.facing) * 0.11,
      z: seat.dock.z - Math.cos(seat.facing) * 0.11,
    },
  };
}
