/** Positional geometry of the approved provisional building; no room owns a category. */
export type LibraryRoomId =
  "room-a" | "room-b" | "room-c" | "room-d" | "room-e";

export const LIBRARY_ROOMS = Object.freeze([
  Object.freeze({ id: "room-a", minX: -5, maxX: 5, minZ: -4.5, maxZ: 4.5 }),
  Object.freeze({
    id: "room-b",
    minX: -10.6,
    maxX: -5.8,
    minZ: -7.8,
    maxZ: -1.5,
  }),
  Object.freeze({
    id: "room-c",
    minX: 5.8,
    maxX: 10.6,
    minZ: -7.8,
    maxZ: -1.5,
  }),
  Object.freeze({
    id: "room-d",
    minX: -10.6,
    maxX: -5.8,
    minZ: 1.5,
    maxZ: 7.8,
  }),
  Object.freeze({ id: "room-e", minX: 5.8, maxX: 10.6, minZ: 1.5, maxZ: 7.8 }),
] as const);
