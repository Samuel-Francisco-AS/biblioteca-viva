import { describe, expect, it } from "vitest";
import { selectInitialRoom } from "./rooms";
import type { RoomProgress } from "../domain";

const progress = (
  roomId: RoomProgress["roomId"],
  unlocked: boolean,
): RoomProgress => ({
  roomId,
  unlocked,
  currentStage: unlocked ? 1 : 0,
  highestReachedStage: unlocked ? 1 : 0,
  requirements: [],
});

describe("room navigation policy", () => {
  const rooms = [
    progress("main-library", true),
    progress("study-room", true),
    progress("office", false),
  ];
  it("accepts an unlocked room", () =>
    expect(selectInitialRoom("study-room", rooms)).toBe("study-room"));
  it("falls back from a locked room", () =>
    expect(selectInitialRoom("office", rooms)).toBe("main-library"));
  it("falls back from an absent preference", () =>
    expect(selectInitialRoom(undefined, rooms)).toBe("main-library"));
});
