/** Positional geometry of the approved provisional building; no room owns a category. */
export type LibraryRoomId =
  "room-a" | "room-b" | "room-c" | "room-d" | "room-e";

// BF-4C: central 1.9×; side rooms 1.6× in both horizontal axes.
export const LIBRARY_ROOMS = Object.freeze([
  Object.freeze({
    id: "room-a",
    minX: -9.5,
    maxX: 9.5,
    minZ: -8.55,
    maxZ: 8.55,
  }),
  Object.freeze({
    id: "room-b",
    minX: -18.38,
    maxX: -10.7,
    minZ: -12.48,
    maxZ: -2.4,
  }),
  Object.freeze({
    id: "room-c",
    minX: 10.7,
    maxX: 18.38,
    minZ: -12.48,
    maxZ: -2.4,
  }),
  Object.freeze({
    id: "room-d",
    minX: -18.38,
    maxX: -10.7,
    minZ: 2.4,
    maxZ: 12.48,
  }),
  Object.freeze({
    id: "room-e",
    minX: 10.7,
    maxX: 18.38,
    minZ: 2.4,
    maxZ: 12.48,
  }),
] as const);
export const LIBRARY_PASSAGES = Object.freeze({
  x: 10.1,
  z: 4.8,
  length: 1.2,
  width: 2.6,
});
