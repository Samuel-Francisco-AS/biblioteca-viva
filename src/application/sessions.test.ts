// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";

import {
  createBook,
  createSeries,
  createStudy,
  type DomainEvent,
} from "../domain";
import {
  BibliotecaDatabase,
  DexieActivityRepository,
  DexieLibraryEntryRepository,
  DexieNoteRepository,
  DexieQuoteRepository,
  DexieSessionRepository,
  DexieTagRepository,
  DexieTransactionRunner,
  LocalEventBus,
} from "../infrastructure";
import {
  CompleteSession,
  CreateManualSession,
  PauseSession,
  ResumeSession,
  StartSession,
  type ApplicationDependencies,
} from ".";

const names = new Set<string>();
afterEach(async () => {
  await Promise.all([...names].map((name) => Dexie.delete(name)));
  names.clear();
});

async function context() {
  const name = `sessions-${crypto.randomUUID()}`;
  names.add(name);
  const database = new BibliotecaDatabase(name);
  await database.open();
  let now = "2026-08-16T10:00:00.000Z";
  let sequence = 0;
  const events = new LocalEventBus();
  const published: DomainEvent[] = [];
  events.subscribe("SessionChanged", (event) => {
    published.push(event);
  });
  const dependencies: ApplicationDependencies = {
    activities: new DexieActivityRepository(database),
    clock: { now: () => Promise.resolve(now) },
    events,
    ids: { generate: () => Promise.resolve(`generated-${++sequence}`) },
    libraryEntries: new DexieLibraryEntryRepository(database),
    notes: new DexieNoteRepository(database),
    quotes: new DexieQuoteRepository(database),
    sessions: new DexieSessionRepository(database),
    tags: new DexieTagRepository(database),
    transaction: new DexieTransactionRunner(database),
  };
  return {
    database,
    dependencies,
    published,
    setNow(value: string) {
      now = value;
    },
  };
}

describe("casos de uso de sessão", () => {
  it("impõe uma sessão global, pausa/retoma e integra página pelo mesmo domínio", async () => {
    const test = await context();
    const book = createBook({
      id: "book-1",
      title: "Livro",
      totalPages: 100,
      createdAt: "2026-08-16T09:00:00.000Z",
    });
    const series = createSeries({
      id: "series-1",
      title: "Série",
      totalEpisodes: 10,
      createdAt: "2026-08-16T09:00:00.000Z",
    });
    await test.dependencies.libraryEntries.save(book);
    await test.dependencies.libraryEntries.save(series);
    const start = new StartSession(test.dependencies);
    const session = await start.execute({
      entryId: book.id,
      entryType: "book",
      endPage: 30,
    });
    await expect(
      start.execute({ entryId: series.id, entryType: "series" }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
    test.setNow("2026-08-16T10:01:00.000Z");
    const paused = await new PauseSession(test.dependencies).execute({
      id: session.id,
    });
    test.setNow("2026-08-16T10:02:00.000Z");
    await new ResumeSession(test.dependencies).execute({ id: paused.id });
    test.setNow("2026-08-16T10:03:00.000Z");
    const completed = await new CompleteSession(test.dependencies).execute({
      id: paused.id,
    });
    expect(completed.accumulatedDuration).toBe(120);
    expect(
      await test.dependencies.libraryEntries.getById(book.id),
    ).toMatchObject({ currentPage: 30, status: "in_progress" });
    expect(await test.dependencies.sessions.getOpen()).toBeUndefined();
    expect(test.published.map(({ type }) => type)).toEqual([
      "SessionChanged",
      "SessionChanged",
      "SessionChanged",
      "SessionChanged",
    ]);
    test.database.close();
  });

  it("integra sessão manual de estudo e episódios sem inferir conclusão de filme", async () => {
    const test = await context();
    const study = createStudy({
      id: "study-1",
      title: "Curso",
      progressUnit: "hours",
      progressTotal: 180,
      createdAt: "2026-08-16T09:00:00.000Z",
    });
    const series = createSeries({
      id: "series-1",
      title: "Série",
      totalEpisodes: 2,
      createdAt: "2026-08-16T09:00:00.000Z",
    });
    await test.dependencies.libraryEntries.save(study);
    await test.dependencies.libraryEntries.save(series);
    const manual = new CreateManualSession(test.dependencies);
    await manual.execute({
      entryId: study.id,
      entryType: "study",
      duration: 3600,
    });
    await manual.execute({
      entryId: series.id,
      entryType: "series",
      duration: 1200,
      episodesCompleted: 2,
    });
    expect(
      await test.dependencies.libraryEntries.getById(study.id),
    ).toMatchObject({ progressCurrent: 60, status: "in_progress" });
    expect(
      await test.dependencies.libraryEntries.getById(series.id),
    ).toMatchObject({ episodesWatched: 2, status: "completed" });
    test.database.close();
  });
});
