// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  createManualSession,
  createTimedSession,
  deriveStructuralProgressFacts,
  isStructuralProgressSessionEligible,
  pauseSession,
  type LibraryEntry,
  type Session,
} from "./index";

const at = "2026-08-27T12:00:00.000Z";
const entries = [
  { id: "entry-book", type: "book" },
  { id: "entry-movie", type: "movie" },
  { id: "entry-series", type: "series" },
  { id: "entry-study", type: "study" },
  { id: "entry-physical", type: "physical_activity" },
  { id: "entry-work", type: "work" },
] satisfies readonly Pick<LibraryEntry, "id" | "type">[];

const completedSessions: readonly Session[] = [
  createManualSession({
    duration: 60,
    entryId: "entry-book",
    entryType: "book",
    id: "session-book",
    occurredAt: at,
  }),
  createManualSession({
    duration: 60,
    entryId: "entry-movie",
    entryType: "movie",
    id: "session-movie",
    occurredAt: at,
  }),
  createManualSession({
    duration: 60,
    entryId: "entry-series",
    entryType: "series",
    id: "session-series",
    occurredAt: at,
  }),
  createManualSession({
    duration: 60,
    entryId: "entry-study",
    entryType: "study",
    id: "session-study",
    occurredAt: at,
  }),
  createManualSession({
    duration: 60,
    entryId: "entry-physical",
    entryType: "physical_activity",
    id: "session-physical",
    occurredAt: at,
  }),
  createManualSession({
    duration: 60,
    entryId: "entry-work",
    entryType: "work",
    id: "session-work",
    occurredAt: at,
    result: "feito",
  }),
];

describe("fatos puros de progressão estrutural", () => {
  it("aceita uma sessão concluída positiva para cada um dos seis tipos", () => {
    expect(
      completedSessions.every((session) =>
        isStructuralProgressSessionEligible(session, entries),
      ),
    ).toBe(true);
    expect(deriveStructuralProgressFacts(completedSessions, entries)).toEqual({
      eligibleCompletedSessionCount: 6,
    });
  });

  it("exclui aberta, pausada, duração zero e registro inexistente", () => {
    const active = createTimedSession({
      entryId: "entry-book",
      entryType: "book",
      id: "session-active",
      startedAt: at,
    });
    const paused = pauseSession(active, "2026-08-27T12:01:00.000Z");
    const zero: Session = {
      ...completedSessions[0]!,
      accumulatedDuration: 0,
      id: "session-zero",
    };
    const missing: Session = {
      ...completedSessions[0]!,
      entryId: "entry-missing",
      id: "session-missing",
    };
    expect(
      deriveStructuralProgressFacts([active, paused, zero, missing], entries),
    ).toEqual({
      eligibleCompletedSessionCount: 0,
    });
  });

  it("deduplica ID e independe da ordem de leitura", () => {
    const input = [
      completedSessions[2]!,
      completedSessions[0]!,
      { ...completedSessions[0]! },
      completedSessions[1]!,
    ];
    expect(deriveStructuralProgressFacts(input, entries)).toEqual({
      eligibleCompletedSessionCount: 3,
    });
    expect(
      deriveStructuralProgressFacts([...input].reverse(), entries),
    ).toEqual({ eligibleCompletedSessionCount: 3 });
  });
});
