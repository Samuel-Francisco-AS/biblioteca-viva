import { describe, expect, it } from "vitest";

import {
  completeSession,
  createManualSession,
  createTag,
  createTimedSession,
  currentSessionDuration,
  pauseSession,
  renameTag,
  resumeSession,
} from ".";

const T0 = "2026-08-16T10:00:00.000Z";
const T1 = "2026-08-16T10:01:30.000Z";
const T2 = "2026-08-16T10:02:00.000Z";

describe("etiquetas P1", () => {
  it.each([
    [" Python ", "python"],
    ["PYTHON", "python"],
    ["Ação", "ação"],
    ["Acao", "acao"],
    ["estudo   profundo", "estudo profundo"],
  ])("normaliza %s de forma determinística", (name, normalizedName) => {
    expect(
      createTag({ id: `tag-${normalizedName}`, name, createdAt: T0 })
        .normalizedName,
    ).toBe(normalizedName);
  });

  it("renomeia preservando ID e avançando revisão", () => {
    const original = createTag({ id: "tag-1", name: "Python", createdAt: T0 });
    expect(renameTag(original, " TypeScript ", T1)).toMatchObject({
      id: "tag-1",
      name: "TypeScript",
      normalizedName: "typescript",
      revision: 2,
      updatedAt: T1,
    });
  });
});

describe("sessões P1", () => {
  it("calcula por timestamps, pausa, sobrevive pausada e retoma sem ticks persistidos", () => {
    const active = createTimedSession({
      id: "session-1",
      entryId: "book-1",
      entryType: "book",
      startedAt: T0,
      endPage: 20,
    });
    expect(currentSessionDuration(active, T1)).toBe(90);
    const paused = pauseSession(active, T1);
    expect(paused).toMatchObject({
      status: "paused",
      accumulatedDuration: 90,
      activeSince: undefined,
    });
    expect(currentSessionDuration(paused, T2)).toBe(90);
    const resumed = resumeSession(paused, T2);
    expect(completeSession(resumed, "2026-08-16T10:03:00.000Z")).toMatchObject({
      status: "completed",
      accumulatedDuration: 150,
    });
  });

  it.each([
    { entryType: "book" as const, startPage: 2, endPage: 8 },
    { entryType: "movie" as const, watchedDuration: 1200 },
    { entryType: "series" as const, episodesCompleted: 2 },
    { entryType: "study" as const },
    {
      entryType: "physical_activity" as const,
      distanceMeters: 5000,
      perceivedExertion: 6,
    },
    { entryType: "work" as const, result: "Revisão concluída" },
  ])("cria sessão manual tipada para $entryType", (specific) => {
    expect(
      createManualSession({
        id: `session-${specific.entryType}`,
        entryId: `entry-${specific.entryType}`,
        occurredAt: T0,
        duration: 1800,
        ...specific,
      }),
    ).toMatchObject({
      entryType: specific.entryType,
      status: "completed",
      accumulatedDuration: 1800,
    });
  });
});
