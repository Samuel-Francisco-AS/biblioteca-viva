import { describe, expect, it } from "vitest";
import { LIVING_OBJECTS, LivingSession } from "./livingObjects";
describe("living environmental session", () => {
  it("has ten distinct families and stable environmental IDs in five rooms", () => {
    expect(new Set(LIVING_OBJECTS.map((o) => o.objectId)).size).toBe(10);
    expect(new Set(LIVING_OBJECTS.map((o) => o.family)).size).toBe(10);
    expect(new Set(LIVING_OBJECTS.map((o) => o.room)).size).toBe(5);
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
