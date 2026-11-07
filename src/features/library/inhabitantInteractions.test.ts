import { describe, expect, it, vi } from "vitest";
import { InteractionCoordinator } from "./inhabitantInteractions";

describe("BF-5.5B interaction leases", () => {
  it("allows one owner and rejects a concurrent owner", () => {
    const coordinator = new InteractionCoordinator();
    expect(coordinator.reserve("living:book", "aryn", "task-a", 0)).not.toBe(
      null,
    );
    expect(coordinator.reserve("living:book", "lua", "task-b", 1)).toBeNull();
    expect(coordinator.owns("living:book", "aryn", "task-a", 1)).toBe(true);
    expect(coordinator.reserve("living:book", "aryn", "task-b", 2)).toBeNull();
    expect(coordinator.renew("living:book", "aryn", "task-a", 2)).toBe(true);
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
    expect(coordinator.renew("seat:room-c", "lua", "task-b", 31_002)).toBe(
      false,
    );
  });
});

it("retains immutable leases without renewal churn and detects theft, expiry and release immediately", () => {
  const c = new InteractionCoordinator();
  const original = c.reserve("book", "session", "reading", 0)!;
  const reserve = vi.spyOn(c, "reserve");
  for (let t = 1; t < 20_000; t += 16)
    expect(c.retain("book", "session", "reading", t)).toBe(original);
  expect(reserve).not.toHaveBeenCalled();
  const renewed = c.retain("book", "session", "reading", 20_000)!;
  expect(renewed.expiresAt).toBe(50_000);
  expect(original.expiresAt).toBe(30_000);
  c.release("book", "session", "reading");
  c.reserve("book", "lua", "other", 20_001);
  expect(c.retain("book", "session", "reading", 20_002)).toBeNull();
  expect(c.owns("book", "lua", "other", 20_002)).toBe(true);
  expect(c.retain("book", "session", "reading", 50_002)?.owner).toBe("session");
});
