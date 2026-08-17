import { describe, expect, it } from "vitest";
import { ROOM_CATALOG } from "../content";
import {
  MILESTONE_ID,
  ROOM_IDS,
  ROOM_STAGE_MILESTONE_IDS,
  deriveRoomProgress,
  type RoomProgressFacts,
} from ".";

const zero = () => ({
  book: 0,
  movie: 0,
  series: 0,
  study: 0,
  physical_activity: 0,
  work: 0,
});
function facts(
  change: Partial<{
    entries: Partial<Record<keyof ReturnType<typeof zero>, number>>;
    completed: Partial<Record<keyof ReturnType<typeof zero>, number>>;
    sessions: Partial<Record<keyof ReturnType<typeof zero>, number>>;
    durations: Partial<Record<keyof ReturnType<typeof zero>, number>>;
    milestones: readonly string[];
  }> = {},
): RoomProgressFacts {
  return {
    entryCountsByType: { ...zero(), ...change.entries },
    completedCountsByType: { ...zero(), ...change.completed },
    sessionCountsByType: { ...zero(), ...change.sessions },
    sessionDurationByType: { ...zero(), ...change.durations },
    reachedMilestoneIds: change.milestones ?? [],
  };
}

describe("Room Engine", () => {
  it("declares exactly five unique rooms with valid hub connections", () => {
    expect(ROOM_CATALOG.map(({ id }) => id)).toEqual(ROOM_IDS);
    expect(new Set(ROOM_CATALOG.map(({ id }) => id)).size).toBe(5);
    for (const room of ROOM_CATALOG)
      for (const connection of room.connections)
        expect(ROOM_IDS).toContain(connection);
    expect(
      ROOM_CATALOG.filter(({ id }) => id !== "main-library").every(
        ({ connections }) => connections.includes("main-library"),
      ),
    ).toBe(true);
  });

  it.each([
    ["study-room", MILESTONE_ID.firstStudy],
    ["training-room", MILESTONE_ID.firstPhysicalActivity],
    ["office", MILESTONE_ID.firstWork],
  ] as const)("unlocks %s from its real P1 milestone", (roomId, milestone) => {
    const room = ROOM_CATALOG.find(({ id }) => id === roomId)!;
    expect(deriveRoomProgress(room, facts()).unlocked).toBe(false);
    expect(
      deriveRoomProgress(room, facts({ milestones: [milestone] })).unlocked,
    ).toBe(true);
  });

  it.each([MILESTONE_ID.firstMovie, MILESTONE_ID.firstSeries])(
    "unlocks projection with Movie OR Series (%s)",
    (milestone) => {
      const room = ROOM_CATALOG.find(({ id }) => id === "projection-room")!;
      expect(
        deriveRoomProgress(room, facts({ milestones: [milestone] })).unlocked,
      ).toBe(true);
    },
  );

  it.each([
    ["main-library", "book", 3, 120],
    ["study-room", "study", 3, 120],
    ["projection-room", "movie", 3, 180],
    ["training-room", "physical_activity", 3, 90],
    ["office", "work", 3, 120],
  ] as const)(
    "checks threshold -1, threshold and +1 for %s",
    (roomId, type, count, minutes) => {
      const room = ROOM_CATALOG.find(({ id }) => id === roomId)!;
      const unlockMilestones =
        roomId === "main-library"
          ? []
          : roomId === "study-room"
            ? [MILESTONE_ID.firstStudy]
            : roomId === "projection-room"
              ? [MILESTONE_ID.firstMovie]
              : roomId === "training-room"
                ? [MILESTONE_ID.firstPhysicalActivity]
                : [MILESTONE_ID.firstWork];
      expect(
        deriveRoomProgress(
          room,
          facts({
            sessions: { [type]: count - 1 },
            durations: { [type]: (minutes - 1) * 60 },
            milestones: unlockMilestones,
          }),
        ).currentStage,
      ).toBe(1);
      expect(
        deriveRoomProgress(
          room,
          facts({ sessions: { [type]: count }, milestones: unlockMilestones }),
        ).currentStage,
      ).toBe(2);
      expect(
        deriveRoomProgress(
          room,
          facts({
            durations: { [type]: (minutes + 1) * 60 },
            milestones: unlockMilestones,
          }),
        ).currentStage,
      ).toBe(2);
    },
  );

  it("keeps the highest stage after current facts decrease", () => {
    const room = ROOM_CATALOG[1];
    const stage2 = ROOM_STAGE_MILESTONE_IDS[room.id][2]!;
    const progress = deriveRoomProgress(
      room,
      facts({ milestones: [MILESTONE_ID.firstStudy, stage2] }),
    );
    expect(progress.currentStage).toBe(1);
    expect(progress.highestReachedStage).toBe(2);
  });
});
