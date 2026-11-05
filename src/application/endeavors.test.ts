import { UpdateBookEntry } from "./useCases";
import { SaveEntertainment } from "./entertainment";
import { createMovie } from "../domain";
// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, expect, it, vi } from "vitest";
import {
  createWork,
  createBook,
  createNote,
  createTimedSession,
  type WorkEntry,
  type DomainEvent,
} from "../domain";
import { SaveEndeavor, type WorkOperation } from "./endeavors";
import { workProgress, workPlanSchema } from "../domain/endeavors";
import { BibliotecaDatabase } from "../infrastructure/database/database";
import {
  DATABASE_SCHEMA_V13,
  DATABASE_VERSION,
  persistedLibraryEntrySchema,
} from "../infrastructure/database/schema";
import {
  DexieLibraryEntryRepository,
  DexieActivityRepository,
} from "../infrastructure/database/repositories";
import { DexieTransactionRunner } from "../infrastructure/database/transactionRunner";
import { DexiePhysicalProfile } from "../infrastructure/database/physicalProfile";
import { DexieLibraryEntryDeletionStore } from "../infrastructure/database/bookDeletionStore";
import { DexieBackupSnapshotStore } from "../infrastructure/backup/dexieBackupStore";
import { JsonBackupCodec } from "../infrastructure/backup/backupCodec";
import { UpdateLibraryEntry } from "./libraryEntries";
import { projectLibraryWorldEntries } from "../features/library/libraryWorldEntries";
const now = "2026-11-05T12:00:00.000Z";
const dbs: BibliotecaDatabase[] = [];
afterEach(async () => {
  for (const db of dbs.splice(0)) {
    db.close();
    await Dexie.delete(db.name);
  }
});
async function setup() {
  const db = new BibliotecaDatabase(`endeavors-${crypto.randomUUID()}`);
  dbs.push(db);
  await db.open();
  const entries = new DexieLibraryEntryRepository(db);
  let work = createWork({
    id: "w",
    title: "Observatório fictício",
    createdAt: now,
    nextAction: "Desenhar a planta",
  });
  await entries.save(work);
  const deps = {
    clock: { now: () => Promise.resolve(now) },
    ids: { generate: () => Promise.resolve(crypto.randomUUID()) },
    libraryEntries: entries,
    transaction: new DexieTransactionRunner(db),
    events: {
      publish: vi.fn(async (event: DomainEvent) => {
        expect(Dexie.currentTransaction).toBeNull();
        expect(await entries.getById(event.aggregateId)).toBeDefined();
      }),
    },
  };
  const command = new SaveEndeavor(deps);
  const act = async (operation: WorkOperation) => {
    work = await command.execute({
      id: work.id,
      expectedRevision: work.revision,
      operation,
    });
    return work;
  };
  return { db, entries, deps, command, act, current: () => work };
}
it("creates/edits stages and tasks, moves within groups, blocks, completes/reopens, clears priority, rehomes stage tasks and writes a chronological manual journal", async () => {
  const s = await setup();
  await s.act({
    kind: "stage",
    value: { title: "Planejamento", reference: "https://example.org/planta" },
  });
  const stageId = s.current().plan!.stages[0].id;
  await s.act({ kind: "stage", value: { title: "Construção" } });
  const secondStage = s.current().plan!.stages[1].id;
  await s.act({
    kind: "move",
    itemId: secondStage,
    collection: "stages",
    direction: "up",
  });
  expect(s.current().plan!.stages.map((stage) => stage.id)).toEqual([
    secondStage,
    stageId,
  ]);
  await s.act({
    kind: "task",
    value: {
      title: "Revisar desenho",
      stageId,
      state: "pending",
      reference: "https://example.org/revisao",
      description: "Duas assinaturas",
      deadline: "2026-11-20",
    },
  });
  const taskId = s.current().plan!.tasks[0].id;
  await s.act({
    kind: "task",
    value: { title: "Validar encaixe", stageId, state: "blocked" },
  });
  const otherTask = s.current().plan!.tasks[1].id;
  await s.act({
    kind: "move",
    itemId: otherTask,
    collection: "tasks",
    direction: "up",
  });
  expect(s.current().plan!.tasks.map((task) => task.id)).toEqual([
    otherTask,
    taskId,
  ]);
  await s.act({ kind: "next", itemId: taskId, text: "Validar a planta" });
  await s.act({ kind: "state", itemId: taskId, state: "completed" });
  expect(s.current().plan!.nextTaskId).toBeUndefined();
  expect(workProgress(s.current().plan!.tasks).percentage).toBe(50);
  await s.act({ kind: "state", itemId: taskId, state: "pending" });
  expect(workProgress(s.current().plan!.tasks).percentage).toBe(0);
  await s.act({
    kind: "task",
    itemId: taskId,
    value: {
      title: "Revisar a planta final",
      state: "in_progress",
      stageId: secondStage,
    },
  });
  await s.act({
    kind: "stage",
    itemId: secondStage,
    value: { title: "Construção revisada", description: "Montagem" },
  });
  await s.act({ kind: "deleteStage", itemId: secondStage });
  expect(
    s.current().plan!.tasks.find((task) => task.id === taskId)?.stageId,
  ).toBeUndefined();
  await s.act({
    kind: "journal",
    value: {
      kind: "decision",
      content: "Entrega fictícia publicada; falta validar os encaixes.",
    },
  });
  const journalId = s.current().plan!.journal[0].id;
  await s.act({
    kind: "journal",
    itemId: journalId,
    value: { kind: "result", content: "Encaixes validados." },
  });
  expect(s.current().plan!.journal[0]).toMatchObject({
    id: journalId,
    createdAt: now,
    content: "Encaixes validados.",
  });
  await s.act({ kind: "deleteJournal", itemId: journalId });
  await s.act({ kind: "deleteTask", itemId: taskId });
  expect(s.current().plan!.tasks).toHaveLength(1);
  expect(s.deps.events.publish).toHaveBeenCalledTimes(16);
});
it("serializes competing revisions, rejects missing/unsafe references and rolls back writes without events", async () => {
  const s = await setup();
  const operation = {
    kind: "task",
    value: { title: "Única", state: "pending" },
  };
  const results = await Promise.allSettled([
    s.command.execute({ id: "w", expectedRevision: 1, operation }),
    s.command.execute({ id: "w", expectedRevision: 1, operation }),
  ]);
  expect(
    results.filter((result) => result.status === "fulfilled"),
  ).toHaveLength(1);
  expect(results.filter((result) => result.status === "rejected")).toHaveLength(
    1,
  );
  expect((await s.entries.getById("w"))?.revision).toBe(2);
  expect(s.deps.events.publish).toHaveBeenCalledOnce();
  await expect(
    s.command.execute({
      id: "w",
      expectedRevision: 2,
      operation: {
        kind: "task",
        value: { title: "Orfã", state: "pending", stageId: "missing" },
      },
    }),
  ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  await expect(
    s.command.execute({
      id: "w",
      expectedRevision: 2,
      operation: {
        kind: "task",
        value: {
          title: "Insegura",
          state: "pending",
          reference: "javascript:alert(1)",
        },
      },
    }),
  ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  const failing = new SaveEndeavor({
    ...s.deps,
    libraryEntries: {
      ...s.entries,
      getById: s.entries.getById.bind(s.entries),
      list: s.entries.list.bind(s.entries),
      save: async (entry) => {
        await s.entries.save(entry);
        throw new Error("disk fixture");
      },
    },
  });
  await expect(
    failing.execute({
      id: "w",
      expectedRevision: 2,
      operation: {
        kind: "journal",
        value: { kind: "advance", content: "Não deve gravar" },
      },
    }),
  ).rejects.toMatchObject({ code: "PERSISTENCE_FAILED" });
  expect((await s.entries.getById("w"))?.revision).toBe(2);
  expect(s.deps.events.publish).toHaveBeenCalledOnce();
});
it("upgrades v13 verbatim, preserves old sessions/notes/profile, round-trips new v6, restores old v6 and deletes dependents atomically", async () => {
  const name = `endeavors-upgrade-${crypto.randomUUID()}`;
  const work = createWork({
    id: "w",
    title: "Empreitada antiga",
    createdAt: now,
    nextAction: "Próximo passo anterior",
  });
  const note = createNote({
    id: "n",
    entryId: "w",
    content: "Decisão anterior",
    createdAt: now,
  });
  const session = createTimedSession({
    id: "s",
    entryId: "w",
    entryType: "work",
    startedAt: now,
  });
  const book = createBook({
    id: "b",
    title: "Livro preservado",
    createdAt: now,
  });
  const old = new Dexie(name);
  old.version(13).stores(DATABASE_SCHEMA_V13);
  await old.open();
  await old.table("libraryEntries").bulkPut([work, book]);
  await old.table("notes").put(note);
  await old.table("sessions").put(session);
  await old.table("settings").put({
    key: "physical.profile.v1",
    value: { weightKg: 70 },
    updatedAt: now,
  });
  old.close();
  const db = new BibliotecaDatabase(name);
  dbs.push(db);
  await db.open();
  expect(db.verno).toBe(14);
  expect(await db.libraryEntries.get("w")).toEqual(work);
  expect(await db.sessions.get("s")).toEqual(session);
  expect(await db.notes.get("n")).toEqual(note);
  const store = new DexieBackupSnapshotStore(db),
    codec = new JsonBackupCodec(),
    profile = new DexiePhysicalProfile(db, { now: () => Promise.resolve(now) });
  const previous = await codec.encode({
    appVersion: "test",
    databaseVersion: 13,
    createdAt: now,
    data: await store.read(),
  });
  const plan = workPlanSchema.parse({
    stages: [{ id: "stage", title: "Plano" }],
    tasks: [
      { id: "task", title: "Entrega", stageId: "stage", state: "completed" },
    ],
    journal: [
      {
        id: "journal",
        kind: "result",
        content: "Obra fictícia pronta",
        createdAt: now,
      },
    ],
  });
  const planned: WorkEntry = { ...work, plan };
  await db.libraryEntries.put(planned);
  await profile.save({ gender: "female", atlas: "male" });
  db.close();
  await db.open();
  expect((await db.libraryEntries.get("w"))?.type).toBe("work");
  expect(await profile.load()).toEqual({ gender: "female", atlas: "male" });
  const backup = await codec.encode({
    appVersion: "test",
    databaseVersion: DATABASE_VERSION,
    createdAt: now,
    data: await store.read(),
  });
  const restored = await codec.inspect(backup.content);
  expect(restored.summary.formatVersion).toBe(6);
  await store.replace(restored.data);
  db.close();
  await db.open();
  expect(await db.libraryEntries.get("w")).toEqual({ ...work, plan });
  expect(await db.sessions.get("s")).toEqual(session);
  expect(await db.notes.get("n")).toEqual(note);
  expect(
    persistedLibraryEntrySchema.safeParse({
      ...work,
      plan: { ...plan, tasks: [...plan.tasks, ...plan.tasks] },
    }).success,
  ).toBe(false);
  await expect(
    codec.encode({
      appVersion: "test",
      databaseVersion: 14,
      createdAt: now,
      data: {
        ...restored.data,
        libraryEntries: [
          {
            ...work,
            plan: {
              ...plan,
              tasks: [{ ...plan.tasks[0], stageId: "missing" }],
            },
          },
        ],
      },
    }),
  ).rejects.toThrow();
  const oldRestore = await codec.inspect(previous.content);
  await store.replace(oldRestore.data);
  expect(await db.libraryEntries.get("w")).toEqual(work);
  expect(await profile.load()).toEqual({ weightKg: 70 });
  await new DexieLibraryEntryDeletionStore(db).deleteLibraryEntry("w");
  expect(await db.notes.get("n")).toBeUndefined();
  expect(await db.sessions.get("s")).toBeUndefined();
  expect(await db.libraryEntries.get("b")).toEqual(book);
});
it("keeps world IDs and projection byte-for-byte while details editing preserves the new plan and rejects stale revisions", async () => {
  const s = await setup();
  const before = projectLibraryWorldEntries([s.current()]);
  await s.act({
    kind: "task",
    value: { title: "Uma tarefa", state: "pending" },
  });
  await s.act({
    kind: "journal",
    value: { kind: "advance", content: "Avanço fictício" },
  });
  expect(projectLibraryWorldEntries([s.current()])).toEqual(before);
  const edit = new UpdateLibraryEntry({
    ...s.deps,
    activities: new DexieActivityRepository(s.db),
  });
  const updated = await edit.execute({
    id: "w",
    type: "work",
    expectedRevision: s.current().revision,
    title: "Novo título",
    kind: "service",
    startDate: "2026-11-01",
  });
  expect(updated.type).toBe("work");
  if (updated.type !== "work") throw new Error("wrong fixture");
  expect(updated.plan).toEqual(s.current().plan);
  await expect(
    edit.execute({
      id: "w",
      type: "work",
      expectedRevision: 1,
      title: "Edição antiga",
    }),
  ).rejects.toMatchObject({ code: "CONFLICT" });
});

it("persists all five ratings through existing book/catalog commands, clears them, reopens and rejects stale/invalid writes without altering progress", async () => {
  const s = await setup();
  let book = createBook({
    id: "b",
    title: "Códice fictício",
    currentPage: 18,
    totalPages: 100,
    createdAt: now,
  });
  let movie = createMovie({
    id: "m",
    title: "Lanterna fictícia",
    catalog: { genre: "Fantasia" },
    createdAt: now,
  });
  await s.entries.save(book);
  await s.entries.save(movie);
  const saveBook = new UpdateBookEntry({
    ...s.deps,
    activities: new DexieActivityRepository(s.db),
  });
  const saveMovie = new SaveEntertainment(s.deps);
  for (const rating of [1, 2, 3, 4, 5]) {
    book = await saveBook.execute({
      id: book.id,
      expectedRevision: book.revision,
      rating,
    });
    const updated = await saveMovie.execute({
      id: movie.id,
      expectedRevision: movie.revision,
      catalog: { ...movie.catalog, rating },
    });
    if (updated.type !== "movie") throw new Error("wrong fixture");
    movie = updated;
    s.db.close();
    await s.db.open();
    expect(await s.entries.getById(book.id)).toMatchObject({
      rating,
      currentPage: 18,
      totalPages: 100,
    });
    expect(await s.entries.getById(movie.id)).toMatchObject({
      catalog: { rating, genre: "Fantasia" },
    });
  }
  await expect(
    saveBook.execute({ id: book.id, expectedRevision: 1, rating: 2 }),
  ).rejects.toMatchObject({ code: "CONFLICT" });
  for (const rating of [0, 6, 2.5]) {
    await expect(
      saveBook.execute({ id: book.id, rating }),
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
    await expect(
      saveMovie.execute({
        id: movie.id,
        expectedRevision: movie.revision,
        catalog: { rating },
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  }
  book = await saveBook.execute({
    id: book.id,
    expectedRevision: book.revision,
    rating: null,
  });
  await saveMovie.execute({
    id: movie.id,
    expectedRevision: movie.revision,
    catalog: { ...movie.catalog, rating: undefined },
  });
  s.db.close();
  await s.db.open();
  const reopenedBook = await s.entries.getById(book.id);
  if (reopenedBook?.type !== "book") throw new Error("wrong fixture");
  expect(reopenedBook.rating).toBeUndefined();
  const reopened = await s.entries.getById(movie.id);
  if (reopened?.type !== "movie") throw new Error("wrong fixture");
  expect(reopened.catalog?.rating).toBeUndefined();
  expect(reopened.catalog?.genre).toBe("Fantasia");
});

it("preserves latest work plan and book rating when a manual session was drafted before another command committed", async () => {
  const s = await setup();
  const { CreateManualSession } = await import("./sessions");
  const { OrganizeLibraryEntry } = await import("./tags");
  const {
    DexieSessionRepository,
    DexieNoteRepository,
    DexieQuoteRepository,
    DexieTagRepository,
  } = await import("../infrastructure/database/repositories");
  const full = {
    ...s.deps,
    activities: new DexieActivityRepository(s.db),
    sessions: new DexieSessionRepository(s.db),
    notes: new DexieNoteRepository(s.db),
    quotes: new DexieQuoteRepository(s.db),
    tags: new DexieTagRepository(s.db),
  };
  let changed = false;
  const delayed = new CreateManualSession({
    ...full,
    ids: {
      generate: async () => {
        if (!changed) {
          changed = true;
          await s.act({
            kind: "task",
            value: {
              title: "Tarefa confirmada durante o rascunho",
              state: "pending",
            },
          });
        }
        return crypto.randomUUID();
      },
    },
  });
  await delayed.execute({
    entryId: "w",
    entryType: "work",
    duration: 60,
    result: "Sessão fictícia",
  });
  const work = await s.entries.getById("w");
  if (work?.type !== "work") throw new Error("wrong fixture");
  expect(work.plan?.tasks).toHaveLength(1);
  expect(work.status).toBe("in_progress");
  expect(workProgress(work.plan!.tasks).percentage).toBe(0);
  const organize = new OrganizeLibraryEntry(full);
  await organize.execute({ id: "w", favorite: true });
  const organized = await s.entries.getById("w");
  if (organized?.type !== "work") throw new Error("wrong fixture");
  expect(organized.plan).toEqual(work.plan);
  const book = createBook({ id: "b", title: "Livro fictício", createdAt: now });
  await s.entries.save(book);
  let rated = false;
  const reading = new CreateManualSession({
    ...full,
    ids: {
      generate: async () => {
        if (!rated) {
          rated = true;
          await new UpdateBookEntry({ ...full }).execute({
            id: "b",
            rating: 4,
          });
        }
        return crypto.randomUUID();
      },
    },
  });
  await reading.execute({
    entryId: "b",
    entryType: "book",
    duration: 60,
    endPage: 2,
  });
  expect(await s.entries.getById("b")).toMatchObject({
    rating: 4,
    currentPage: 2,
  });
});
