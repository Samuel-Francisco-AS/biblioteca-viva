import { describe, expect, it } from "vitest";

import {
  completeSession,
  createBook,
  createStudy,
  createTimedSession,
  createWork,
  pauseSession,
  resumeSession,
  type LibraryEntry,
} from "../domain";
import { projectWorldSessionActivity } from "./projectWorldSessionActivity";

const startedAt = "2026-11-05T18:00:00.000Z";

describe("BF-5.5F confirmed-session projection", () => {
  const book = createBook({
    id: "book-01",
    title: "Texto privado do usuário",
    createdAt: startedAt,
  });
  const reading = createTimedSession({
    id: "session-01",
    entryId: book.id,
    entryType: "book",
    startedAt,
    note: "Nunca expor a nota na cena",
  });

  it("preserves original book identity without private text", () => {
    const result = projectWorldSessionActivity(reading, [book]);
    expect(result).toEqual({
      sessionId: "session-01",
      entryId: "book-01",
      entryType: "book",
      instanceId: "reading-book:book-01",
      kind: "reading",
      status: "active",
      revision: 1,
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(JSON.stringify(result)).not.toContain("privado");
    expect(JSON.stringify(result)).not.toContain("Nunca expor");
    expect(projectWorldSessionActivity(reading, [book])).toEqual(result);
  });

  it("keeps paused sessions identifiable, then removes completed sessions", () => {
    const paused = pauseSession(reading, "2026-11-05T18:02:00.000Z");
    expect(projectWorldSessionActivity(paused, [book])).toMatchObject({
      status: "paused",
      instanceId: "reading-book:book-01",
      revision: 2,
    });
    const resumed = resumeSession(paused, "2026-11-05T18:03:00.000Z");
    expect(projectWorldSessionActivity(resumed, [book])).toMatchObject({
      status: "active",
      revision: 3,
    });
    expect(
      projectWorldSessionActivity(
        completeSession(resumed, "2026-11-05T18:04:00.000Z"),
        [book],
      ),
    ).toBeNull();
    expect(projectWorldSessionActivity(undefined, [book])).toBeNull();
  });

  it("rejects deleted/missing entries or a stale mismatched record", () => {
    const study = createStudy({
      id: "book-01",
      title: "Study",
      progressUnit: "sessions",
      progressCurrent: 0,
      createdAt: startedAt,
    });
    expect(projectWorldSessionActivity(reading, [])).toBeNull();
    expect(projectWorldSessionActivity(reading, [study])).toBeNull();
    expect(projectWorldSessionActivity(reading, [book, study])).toEqual(
      projectWorldSessionActivity(reading, [book]),
    );
  });

  it("distinguishes study and work without synthesizing new sessions", () => {
    const entries: readonly LibraryEntry[] = [
      createStudy({
        id: "study-01",
        title: "Study",
        progressUnit: "sessions",
        progressCurrent: 0,
        createdAt: startedAt,
      }),
      createWork({ id: "work-01", title: "Work", createdAt: startedAt }),
    ];
    for (const [entryType, expectedPrefix] of [
      ["study", "library-study:"],
      ["work", "library-work:"],
    ] as const) {
      const entry = entries.find((value) => value.type === entryType);
      if (!entry) throw new Error("Missing fixture");
      const session = createTimedSession({
        id: `session-${entryType}`,
        entryId: entry.id,
        entryType,
        startedAt,
      });
      expect(projectWorldSessionActivity(session, entries)).toMatchObject({
        instanceId: `${expectedPrefix}${entry.id}`,
        kind: entryType,
        status: "active",
      });
    }
  });
});
