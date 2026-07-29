// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { createLibraryEntryCreatedEvent } from "../../domain";
import { LocalEventBus } from "./localEventBus";

const event = createLibraryEntryCreatedEvent({
  aggregateId: "book-1",
  eventId: "event-1",
  occurredAt: "2026-07-29T12:00:00.000Z",
  payload: { entryType: "book", status: "planned" },
  revision: 1,
});

describe("LocalEventBus", () => {
  it("publishes to typed subscribers and allows unsubscribe", async () => {
    const bus = new LocalEventBus();
    const listener = vi.fn();
    const unsubscribe = bus.subscribe("LibraryEntryCreated", listener);
    await bus.publish(event);
    unsubscribe();
    await bus.publish(event);
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(event);
  });

  it("does not register the same listener twice for one event type", async () => {
    const bus = new LocalEventBus();
    const listener = vi.fn();
    bus.subscribe("LibraryEntryCreated", listener);
    bus.subscribe("LibraryEntryCreated", listener);
    await bus.publish(event);
    expect(listener).toHaveBeenCalledOnce();
  });

  it("propagates subscriber failures", async () => {
    const bus = new LocalEventBus();
    bus.subscribe("LibraryEntryCreated", () => {
      throw new Error("subscriber failed");
    });
    await expect(bus.publish(event)).rejects.toThrow("subscriber failed");
  });
});
