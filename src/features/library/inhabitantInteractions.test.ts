import { describe, expect, it } from "vitest";
import { InteractionCoordinator } from "./inhabitantInteractions";

describe("BF-5.5B interaction leases", () => {
  it("allows one owner and rejects a concurrent owner", () => {
    const coordinator = new InteractionCoordinator();
    expect(coordinator.reserve("living:book", "aryn", "task-a", 0)).not.toBe(
      null,
    );
    expect(coordinator.reserve("living:book", "lua", "task-b", 1)).toBeNull();
    expect(coordinator.owns("living:book", "aryn", "task-a", 1)).toBe(true);
  });

  it("releases on cancellation and reclaims abandoned leases", () => {
    const coordinator = new InteractionCoordinator();
    coordinator.reserve("seat:room-c", "aryn", "task-a", 0, 1_000);
    coordinator.release("seat:room-c", "aryn", "task-a");
    expect(
      coordinator.reserve("seat:room-c", "lua", "task-b", 1),
    ).not.toBeNull();
    coordinator.reclaim(31_001);
    expect(coordinator.snapshot()).toEqual([]);
  });
});
