import { describe, expect, it, vi } from "vitest";

import {
  createBook,
  createMovie,
  createPhysicalActivity,
  createSeries,
  createStudy,
  createWork,
  createManualSession,
  createTimedSession,
  type LibraryEntry,
  type Session,
} from "../domain";
import { createActivity } from "./activities";
import { GetStatistics, deriveStatistics } from "./statistics";

const NOW = "2026-08-16T12:00:00.000Z";
const OLD = "2026-06-01T12:00:00.000Z";

function entries(): readonly LibraryEntry[] {
  return [
    createBook({
      id: "book",
      title: "Livro",
      status: "in_progress",
      totalPages: 100,
      currentPage: 20,
      createdAt: OLD,
    }),
    createMovie({
      id: "movie",
      title: "Filme",
      status: "completed",
      createdAt: OLD,
    }),
    createSeries({
      id: "series",
      title: "Série",
      totalEpisodes: 10,
      episodesWatched: 2,
      createdAt: OLD,
    }),
    createStudy({
      id: "study",
      title: "Estudo",
      progressUnit: "hours",
      createdAt: OLD,
    }),
    createPhysicalActivity({
      id: "physical",
      title: "Corrida",
      category: "cardio",
      createdAt: OLD,
    }),
    createWork({
      id: "work",
      title: "Projeto",
      favorite: true,
      createdAt: OLD,
    }),
  ];
}

function sessions(): readonly Session[] {
  return [
    createManualSession({
      id: "reading",
      entryId: "book",
      entryType: "book",
      startPage: 20,
      endPage: 40,
      occurredAt: NOW,
      duration: 1800,
    }),
    createManualSession({
      id: "viewing",
      entryId: "series",
      entryType: "series",
      episodesCompleted: 2,
      occurredAt: NOW,
      duration: 2400,
    }),
    createManualSession({
      id: "study-session",
      entryId: "study",
      entryType: "study",
      occurredAt: NOW,
      duration: 3600,
    }),
    createManualSession({
      id: "run",
      entryId: "physical",
      entryType: "physical_activity",
      distanceMeters: 5000,
      occurredAt: NOW,
      duration: 2700,
    }),
    createTimedSession({
      id: "active",
      entryId: "work",
      entryType: "work",
      startedAt: NOW,
    }),
    createManualSession({
      id: "old",
      entryId: "movie",
      entryType: "movie",
      occurredAt: OLD,
      duration: 7200,
    }),
  ];
}

describe("estatísticas derivadas P1-C", () => {
  it("agrega tipos, métricas especializadas e exclui sessão ativa/janela antiga", () => {
    const snapshot = deriveStatistics({
      entries: entries(),
      sessions: sessions(),
      activities: [],
      now: NOW,
      window: "30d",
    });
    expect(snapshot).toMatchObject({
      totalEntries: 6,
      inProgress: 2,
      completed: 1,
      favorites: 1,
      sessions: 4,
      duration: 10_500,
    });
    expect(snapshot.activeSession).toMatchObject({ id: "active" });
    expect(snapshot.byType.book).toMatchObject({
      pagesRegistered: 20,
      sessions: 1,
    });
    expect(snapshot.byType.series).toMatchObject({ episodesRegistered: 2 });
    expect(snapshot.byType.study.progressByUnit).toEqual({ hours: 60 });
    expect(snapshot.byType.physical_activity).toMatchObject({
      distanceMeters: 5000,
    });
    expect(snapshot.byType.movie.sessions).toBe(0);
  });

  it("não duplica sessão presente em Activity e respeita filtros", () => {
    const activity = createActivity({
      id: "activity-session",
      aggregateId: "book",
      type: "session_completed",
      occurredAt: NOW,
      revision: 1,
      metadata: { sessionId: "reading", entryType: "book", duration: 1800 },
    });
    const snapshot = deriveStatistics({
      entries: entries(),
      sessions: sessions(),
      activities: [activity],
      now: NOW,
      window: "7d",
      entryType: "book",
      category: "session",
    });
    expect(snapshot.timeline).toHaveLength(1);
    expect(snapshot.timeline[0]).toMatchObject({
      kind: "session_completed",
      duration: 1800,
    });
  });

  it("permanece determinístico com centenas de entries e milhares de sessions", () => {
    const bulkEntries = Array.from({ length: 300 }, (_, index) =>
      createWork({
        id: `work-${index}`,
        title: `Projeto ${index}`,
        createdAt: OLD,
      }),
    );
    const bulkSessions = Array.from({ length: 2_000 }, (_, index) =>
      createManualSession({
        id: `session-${index}`,
        entryId: `work-${index % 300}`,
        entryType: "work",
        occurredAt: NOW,
        duration: 60,
      }),
    );
    const first = deriveStatistics({
      entries: bulkEntries,
      sessions: bulkSessions,
      activities: [],
      now: NOW,
      window: "all",
    });
    const second = deriveStatistics({
      entries: bulkEntries,
      sessions: bulkSessions,
      activities: [],
      now: NOW,
      window: "all",
    });
    expect(first).toEqual(second);
    expect(first).toMatchObject({
      totalEntries: 300,
      sessions: 2_000,
      duration: 120_000,
    });
  });

  it("consulta cada coleção uma vez e reflete edição/exclusão pelo novo snapshot", async () => {
    const activityList = vi.fn(() => Promise.resolve([]));
    const entryList = vi.fn(() => Promise.resolve(entries()));
    const sessionList = vi.fn(() =>
      Promise.resolve(sessions().filter(({ id }) => id !== "run")),
    );
    const service = new GetStatistics({
      activities: { list: activityList, save: () => Promise.resolve() },
      clock: { now: () => Promise.resolve(NOW) },
      libraryEntries: {
        list: entryList,
        getById: () => Promise.resolve(undefined),
        save: () => Promise.resolve(),
      },
      sessions: {
        list: sessionList,
        listByEntryId: () => Promise.resolve([]),
        getById: () => Promise.resolve(undefined),
        getOpen: () => Promise.resolve(undefined),
        save: () => Promise.resolve(),
        delete: () => Promise.resolve(false),
      },
    });
    const snapshot = await service.execute({ window: "all" });
    expect(snapshot.sessions).toBe(4);
    expect(
      [activityList, entryList, sessionList].map((fn) => fn.mock.calls.length),
    ).toEqual([1, 1, 1]);
  });
});
