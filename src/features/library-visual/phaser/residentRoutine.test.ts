import { describe, expect, it } from "vitest";
import {
  chooseRoutineAction,
  creatureRoomForPeriod,
  residentIsUnlocked,
  routineAnchorsForRoom,
  routineStatesForPeriod,
} from "./residentRoutine";

describe("resident routines", () => {
  it("aplica períodos e filtra estados permitidos", () => {
    expect(
      routineStatesForPeriod("morning", ["walking", "working", "organizing"]),
    ).toEqual(["organizing", "working"]);
    expect(
      routineStatesForPeriod("lateNight", ["walking", "resting", "idle"]),
    ).toEqual(["resting", "idle"]);
  });

  it("só desbloqueia residentes secundários no estágio 2", () => {
    expect(residentIsUnlocked("study-room", 1)).toBe(false);
    expect(residentIsUnlocked("study-room", 2)).toBe(true);
    expect(residentIsUnlocked("main-library", 1)).toBe(true);
  });

  it("escolhe uma âncora conhecida por ação", () => {
    const anchors = routineAnchorsForRoom("study-room", 400, 800);
    expect(
      chooseRoutineAction({
        period: "afternoon",
        allowedStates: ["working", "walking"],
        anchors,
        index: 1,
      }),
    ).toMatchObject({ state: "walking", target: { anchor: "shelf" } });
  });

  it("define presença determinística da criatura com fallback principal", () => {
    expect(
      creatureRoomForPeriod({
        period: "morning",
        unlockedRoomIds: ["main-library"],
      }),
    ).toBe("main-library");
    expect(
      creatureRoomForPeriod({
        period: "afternoon",
        unlockedRoomIds: ["study-room"],
      }),
    ).toBe("study-room");
    expect(
      creatureRoomForPeriod({ period: "night", unlockedRoomIds: [] }),
    ).toBe("main-library");
    expect(
      creatureRoomForPeriod({
        period: "lateNight",
        unlockedRoomIds: ["office"],
      }),
    ).toBe("office");
  });
});
