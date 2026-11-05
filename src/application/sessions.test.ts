// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";

import {
  createPhysicalActivity,
  updateLibraryEntryDetails,
  createBook,
  createSeries,
  createStudy,
  MilestoneEngine,
  PRODUCT_MILESTONE_DEFINITIONS,
  type DomainEvent,
} from "../domain";
import {
  BibliotecaDatabase,
  DexieActivityRepository,
  DexieLibraryEntryRepository,
  DexieMilestoneStore,
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
  DeleteSession,
  EditSession,
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
    milestones: new DexieMilestoneStore(
      database,
      new MilestoneEngine(),
      PRODUCT_MILESTONE_DEFINITIONS,
    ),
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
    expect(completed.session.accumulatedDuration).toBe(120);
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

  it("edita/exclui o histórico sem retroceder progresso e cancela sessão aberta", async () => {
    const test = await context();
    const book = createBook({
      id: "book-history",
      title: "Histórico",
      totalPages: 100,
      createdAt: "2026-08-16T09:00:00.000Z",
    });
    await test.dependencies.libraryEntries.save(book);
    const completed = await new CreateManualSession(test.dependencies).execute({
      entryId: book.id,
      entryType: "book",
      duration: 1_200,
      endPage: 50,
    });
    test.setNow("2026-08-16T11:00:00.000Z");
    const edited = await new EditSession(test.dependencies).execute({
      id: completed.session.id,
      duration: 900,
      note: "Registro corrigido",
    });
    expect(edited).toMatchObject({
      accumulatedDuration: 900,
      note: "Registro corrigido",
      revision: 2,
    });
    await new DeleteSession(test.dependencies).execute({
      id: completed.session.id,
    });
    expect(
      await test.dependencies.sessions.getById(completed.session.id),
    ).toBeUndefined();
    expect(
      await test.dependencies.libraryEntries.getById(book.id),
    ).toMatchObject({ currentPage: 50, status: "in_progress" });

    const open = await new StartSession(test.dependencies).execute({
      entryId: book.id,
      entryType: "book",
    });
    await new DeleteSession(test.dependencies).execute({ id: open.id });
    expect(await test.dependencies.sessions.getOpen()).toBeUndefined();
    expect(test.published.slice(-4).map(({ payload }) => payload)).toEqual([
      expect.objectContaining({ status: "completed" }),
      expect.objectContaining({ status: "deleted" }),
      expect.objectContaining({ status: "active" }),
      expect.objectContaining({ status: "deleted" }),
    ]);
    test.database.close();
  });

  it("coalesce duas conclusões simultâneas", async () => {
    const test = await context();
    const book = createBook({
      id: "book-concurrent",
      title: "Concorrência",
      createdAt: "2026-08-16T09:00:00.000Z",
    });
    await test.dependencies.libraryEntries.save(book);
    const open = await new StartSession(test.dependencies).execute({
      entryId: book.id,
      entryType: "book",
    });
    test.setNow("2026-08-16T10:01:00.000Z");
    const command = new CompleteSession(test.dependencies);
    const [first, second] = await Promise.all([
      command.execute({ id: open.id }),
      command.execute({ id: open.id }),
    ]);
    expect(first.session).toEqual(second.session);
    expect(
      (await test.dependencies.activities.list()).filter(
        ({ type }) => type === "session_completed",
      ),
    ).toHaveLength(1);
    test.database.close();
  });
});

it("R5 snapshots each workout execution and accepts an honestly unmeasured duration", async () => {
  const test = await context();
  const plan = createPhysicalActivity({
    id: "plan",
    title: "Peito fictício",
    category: "strength",
    exercises: [
      { name: "Supino fictício", sets: 3, repetitions: 10, loadKg: 12.5 },
    ],
    createdAt: "2026-08-16T09:00:00.000Z",
  });
  await test.dependencies.libraryEntries.save(plan);
  const manual = new CreateManualSession(test.dependencies);
  const first = await manual.execute({
    entryId: plan.id,
    entryType: "physical_activity",
    duration: 0,
    perceivedExertion: 6,
  });
  expect(first.session).toMatchObject({
    exercises: plan.exercises,
    accumulatedDuration: 0,
    perceivedExertion: 6,
  });
  const changed = updateLibraryEntryDetails(
    plan,
    { ...plan, exercises: [{ name: "Supino fictício", sets: 4, loadKg: 15 }] },
    "2026-08-16T10:00:00.000Z",
  );
  await test.dependencies.libraryEntries.save(changed);
  const second = await manual.execute({
    entryId: plan.id,
    entryType: "physical_activity",
    duration: 0,
  });
  expect(second.session).toMatchObject({
    exercises: changed.type === "physical_activity" ? changed.exercises : [],
  });
  expect(
    await test.dependencies.sessions.getById(first.session.id),
  ).toMatchObject({ exercises: plan.exercises });
  await expect(
    manual.execute({
      entryId: plan.id,
      entryType: "physical_activity",
      duration: 0,
      exercises: [{ name: "x", loadKg: -1 }],
    }),
  ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  test.database.close();
});

it("R5 starts an unmeasured study encounter without inventing minutes", async () => {
  const test = await context();
  const study = createStudy({
    id: "unmeasured-study",
    title: "Estudo fictício",
    progressUnit: "hours",
    createdAt: "2026-08-16T09:00:00.000Z",
  });
  await test.dependencies.libraryEntries.save(study);
  await new CreateManualSession(test.dependencies).execute({
    entryId: study.id,
    entryType: "study",
    duration: 0,
  });
  expect(
    await test.dependencies.libraryEntries.getById(study.id),
  ).toMatchObject({ status: "in_progress", progressCurrent: 0 });
  test.database.close();
});

it("P2B recovers timestamp focus after database reopen, excludes pauses, caps screen-off time and credits once", async () => {
  const test = await context();
  const entry = createStudy({
    id: "pomodoro",
    title: "Astros fictícios",
    progressUnit: "hours",
    progressTotal: 10,
    createdAt: "2026-08-16T09:00:00.000Z",
  });
  await test.dependencies.libraryEntries.save(entry);
  const started = await new StartSession(test.dependencies).execute({
    entryId: entry.id,
    entryType: "study",
    focusDurationSeconds: 1500,
  });
  test.setNow("2026-08-16T10:05:00.000Z");
  await new PauseSession(test.dependencies).execute({ id: started.id });
  test.database.close();
  await test.database.open();
  const paused = await test.dependencies.sessions.getOpen();
  expect(paused).toMatchObject({
    status: "paused",
    accumulatedDuration: 300,
    focusDurationSeconds: 1500,
  });
  test.setNow("2026-08-16T12:00:00.000Z");
  await new ResumeSession(test.dependencies).execute({ id: started.id });
  // No interval executes during two hours of screen-off/process suspension.
  test.database.close();
  await test.database.open();
  test.setNow("2026-08-16T14:00:00.000Z");
  const [first, second] = await Promise.all([
    new CompleteSession(test.dependencies).execute({ id: started.id }),
    new CompleteSession(test.dependencies).execute({ id: started.id }),
  ]);
  expect(first.session.accumulatedDuration).toBe(1500);
  expect(second.session).toEqual(first.session);
  expect(
    await test.dependencies.libraryEntries.getById(entry.id),
  ).toMatchObject({ progressCurrent: 10, status: "completed" });
  expect(
    (await test.dependencies.activities.list()).filter(
      (activity) => activity.type === "session_completed",
    ),
  ).toHaveLength(1);
  expect(
    test.published.filter(
      (event) =>
        event.type === "SessionChanged" && event.payload.status === "completed",
    ),
  ).toHaveLength(1);
  expect(await test.dependencies.sessions.getOpen()).toBeUndefined();
  test.database.close();
});

it("P2B persists early finish and restart does not credit discarded time", async () => {
  const test = await context();
  await test.dependencies.libraryEntries.save(
    createStudy({
      id: "short-focus",
      title: "Pistas fictícias",
      progressUnit: "sessions",
      createdAt: "2026-08-16T09:00:00.000Z",
    }),
  );
  const start = new StartSession(test.dependencies);
  const first = await start.execute({
    entryId: "short-focus",
    entryType: "study",
    focusDurationSeconds: 900,
  });
  test.setNow("2026-08-16T10:02:05.000Z");
  const ended = await new CompleteSession(test.dependencies).execute({
    id: first.id,
  });
  expect(ended.session.accumulatedDuration).toBe(125);
  const discarded = await start.execute({
    entryId: "short-focus",
    entryType: "study",
    focusDurationSeconds: 1500,
  });
  test.setNow("2026-08-16T10:05:00.000Z");
  await new DeleteSession(test.dependencies).execute({ id: discarded.id });
  expect(
    await test.dependencies.libraryEntries.getById("short-focus"),
  ).toMatchObject({ progressCurrent: 1 });
  expect(
    await test.dependencies.sessions.listByEntryId("short-focus"),
  ).toHaveLength(1);
  await expect(
    start.execute({
      entryId: "short-focus",
      entryType: "study",
      focusDurationSeconds: 0,
    }),
  ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  test.database.close();
});

it("P2B preserves old hours once and adds exact seconds without compounding minute rounding", async () => {
  const test = await context();
  await test.dependencies.libraryEntries.save(
    createStudy({
      id: "legacy-time",
      title: "Tempo anterior fictício",
      progressUnit: "hours",
      progressCurrent: 90,
      createdAt: "2026-08-16T09:00:00.000Z",
    }),
  );
  const session = await new StartSession(test.dependencies).execute({
    entryId: "legacy-time",
    entryType: "study",
    focusDurationSeconds: 1500,
  });
  expect(
    await test.dependencies.libraryEntries.getById("legacy-time"),
  ).toMatchObject({ studyTimeBaselineSeconds: 5400 });
  test.setNow("2026-08-16T10:02:05.000Z");
  await new CompleteSession(test.dependencies).execute({ id: session.id });
  const entry = await test.dependencies.libraryEntries.getById("legacy-time");
  expect(entry).toMatchObject({
    progressCurrent: 93,
    studyTimeBaselineSeconds: 5400,
  });
  const history = await test.dependencies.sessions.listByEntryId("legacy-time");
  expect(
    history.reduce((sum, item) => sum + item.accumulatedDuration, 5400),
  ).toBe(5525);
  test.database.close();
});
