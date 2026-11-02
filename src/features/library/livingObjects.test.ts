import { describe, expect, it } from "vitest";
import {
  LIVING_OBJECTS,
  LivingSession,
  atmosphereForHour,
} from "./livingObjects";
describe("living environmental session", () => {
  it("has ten distinct families and stable environmental IDs in five rooms", () => {
    expect(new Set(LIVING_OBJECTS.map((o) => o.objectId)).size).toBe(10);
    expect(new Set(LIVING_OBJECTS.map((o) => o.family)).size).toBe(10);
    expect(new Set(LIVING_OBJECTS.map((o) => o.room)).size).toBe(5);
  });
  it("each of the ten families has an effective primary action for canvas taps", () => {
    for (const object of LIVING_OBJECTS) {
      const session = new LivingSession(() => new Date(2026, 10, 2, 10));
      const revision = session.getSnapshot().revision;
      expect(session.actPrimary(object.objectId), object.objectId).toContainEqual({
        type: "acted",
        objectId: object.objectId,
      });
      expect(session.getSnapshot().revision, object.objectId).toBe(revision + 1);
    }
    expect(new LivingSession().actPrimary("not-present")).toEqual([]);
  });

  it("derives local time, brief reading and discovery without user atmosphere buttons", () => {
    let current = new Date(2026, 10, 2, 21, 0);
    const session = new LivingSession(() => current);
    expect(atmosphereForHour(5)).toBe("noturna");
    expect(atmosphereForHour(6)).toBe("tranquila");
    expect(atmosphereForHour(17)).toBe("tranquila");
    expect(atmosphereForHour(18)).toBe("noturna");
    expect(session.getSnapshot().atmosphere).toBe("noturna");
    session.actPrimary("living:table");
    expect(session.getSnapshot().atmosphere).toBe("tranquila");
    current = new Date(2026, 10, 2, 21, 6);
    session.refreshContext();
    expect(session.getSnapshot().atmosphere).toBe("noturna");
    current = new Date(2026, 10, 3, 10, 0);
    session.refreshContext();
    expect(session.getSnapshot().atmosphere).toBe("tranquila");
  });

  it("completes the secret solely through four primary canvas actions", () => {
    let current = new Date(2026, 10, 2, 22, 0);
    const session = new LivingSession(() => current);
    session.actPrimary("living:lamp");
    expect(session.getSnapshot().discovery).toBe(1);
    session.actPrimary("living:table");
    expect(session.getSnapshot().discovery).toBe(2);
    const events = session.actPrimary("living:book");
    expect(events).toContainEqual({
      type: "mechanism",
      objectId: "living:cabinet",
    });
    expect(session.getSnapshot().discovery).toBe(3);
    expect(session.getSnapshot().atmosphere).toBe("encantada");
    expect(session.actPrimary("living:cabinet")).toContainEqual({
      type: "discovered",
      objectId: "living:cabinet",
    });
    expect(session.getSnapshot().discovery).toBe(4);
    current = new Date(2026, 10, 2, 22, 3);
    session.refreshContext();
    expect(session.getSnapshot().atmosphere).toBe("tranquila");
    current = new Date(2026, 10, 2, 22, 6);
    session.refreshContext();
    expect(session.getSnapshot().atmosphere).toBe("noturna");
    expect(session.getSnapshot().discovery).toBe(4);
  });

  it("rejects unknown objects and unauthorized actions without changing state", () => {
    const session = new LivingSession();
    const initial = session.getSnapshot();
    expect(session.act("unknown", "toggle")).toEqual([]);
    expect(session.act("living:clock", "toggle")).toEqual([]);
    expect(session.getSnapshot()).toBe(initial);
  });
  it("completes the discovery with observable cross-object consequences exactly once", () => {
    const session = new LivingSession();
    session.act("living:table", "examine");
    expect(session.getSnapshot().discovery).toBe(0);
    session.act("living:book", "toggle");
    expect(session.getSnapshot().discovery).toBe(0);
    session.act("living:book", "toggle");
    session.act("living:lamp", "toggle");
    expect(session.getSnapshot().discovery).toBe(1);
    session.act("living:lamp", "toggle");
    session.act("living:table", "examine");
    expect(session.getSnapshot().discovery).toBe(2);
    const events = session.act("living:book", "toggle");
    expect(events).toContainEqual({
      type: "mechanism",
      objectId: "living:cabinet",
    });
    expect(session.getSnapshot().objects["living:cabinet"]?.active).toBe(true);
    expect(session.getSnapshot().atmosphere).toBe("encantada");
    expect(session.act("living:cabinet", "examine")).toContainEqual({
      type: "discovered",
      objectId: "living:cabinet",
    });
    expect(session.act("living:cabinet", "examine")).not.toContainEqual({
      type: "discovered",
      objectId: "living:cabinet",
    });
    expect(session.getSnapshot().discovery).toBe(4);
  });
  it("isolates sessions, reverses toggles and ignores actions after disposal", () => {
    const a = new LivingSession(),
      b = new LivingSession();
    a.act("living:cabinet", "toggle");
    expect(b.getSnapshot().objects["living:cabinet"]?.active).toBe(false);
    a.act("living:cabinet", "toggle");
    expect(a.getSnapshot().objects["living:cabinet"]?.active).toBe(false);
    const snapshot = a.getSnapshot();
    a.dispose();
    a.act("living:lamp", "toggle");
    a.setAtmosphere("noturna");
    expect(a.getSnapshot()).toBe(snapshot);
  });
});
