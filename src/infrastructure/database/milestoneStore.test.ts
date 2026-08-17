// @vitest-environment node

import "fake-indexeddb/auto";

import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";

import { PROTOTYPE_CONTENT, ROOM_CATALOG } from "../../content";
import { ApplicationError, CreateBookEntry } from "../../application";
import {
  MILESTONE_ID,
  MilestoneEngine,
  createLibraryEntryCompletedEvent,
  createManualSession,
  createSessionChangedEvent,
} from "../../domain";
import { BibliotecaDatabase } from "./database";
import { DexieMilestoneStore } from "./milestoneStore";
import { DexieTransactionRunner } from "./transactionRunner";
import {
  DexieActivityRepository,
  DexieLibraryEntryRepository,
} from "./repositories";
import { LocalEventBus } from "../events/localEventBus";
import { InfrastructureError } from "./errors";

const names = new Set<string>();

function database(): BibliotecaDatabase {
  const name = `milestones-${crypto.randomUUID()}`;
  names.add(name);
  return new BibliotecaDatabase(name);
}

function store(db: BibliotecaDatabase): DexieMilestoneStore {
  return new DexieMilestoneStore(
    db,
    new MilestoneEngine(),
    PROTOTYPE_CONTENT.milestones,
    PROTOTYPE_CONTENT.rewards,
  );
}

const completedBook = {
  completedAt: "2026-08-10T12:00:00.000Z",
  createdAt: "2026-08-10T10:00:00.000Z",
  currentPage: 100,
  favorite: false,
  id: "book-1",
  revision: 2,
  status: "completed" as const,
  title: "Fixture fictícia",
  tagIds: [],
  totalPages: 100,
  type: "book" as const,
  updatedAt: "2026-08-10T12:00:00.000Z",
};

const completionEvent = createLibraryEntryCompletedEvent({
  aggregateId: completedBook.id,
  eventId: "event-completed-1",
  occurredAt: completedBook.completedAt,
  payload: { entryType: "book", completedAt: completedBook.completedAt },
  revision: completedBook.revision,
});

afterEach(async () => {
  await Promise.all([...names].map((name) => Dexie.delete(name)));
  names.clear();
});

describe("DexieMilestoneStore", () => {
  it("grava marco e recompensa uma vez, recarrega e não armazena conteúdo pessoal", async () => {
    const db = database();
    await db.open();
    await db.libraryEntries.add(completedBook);
    const milestones = store(db);

    const first = await milestones.process(completionEvent);
    const repeated = await milestones.process(completionEvent);
    expect(first).toHaveLength(1);
    expect(repeated).toEqual([]);
    db.close();

    const reopened = new BibliotecaDatabase(db.name);
    await reopened.open();
    const loaded = await store(reopened).list();
    expect(loaded).toMatchObject([
      {
        id: MILESTONE_ID.firstCompletedBook,
        rewards: [{ decorationId: "decoration.reading-lamp" }],
        source: {
          eventId: completionEvent.eventId,
          eventType: "LibraryEntryCompleted",
        },
      },
    ]);
    expect(JSON.stringify(loaded)).not.toMatch(
      /Fixture fictícia|author|content|note|quote/iu,
    );
    reopened.close();
  });

  it("usa a chave única como proteção final para avaliações concorrentes", async () => {
    const db = database();
    await db.open();
    await db.libraryEntries.add(completedBook);
    const milestones = store(db);
    const results = await Promise.all([
      milestones.process(completionEvent),
      milestones.process({ ...completionEvent, eventId: "event-equivalent" }),
    ]);
    expect(results.flat()).toHaveLength(1);
    expect(await db.milestones.count()).toBe(1);
    db.close();
  });

  it("faz rollback com a ação e permite retry após falha", async () => {
    const db = database();
    await db.open();
    const milestones = store(db);
    const transaction = new DexieTransactionRunner(db);
    await expect(
      transaction.run(async () => {
        await db.libraryEntries.add(completedBook);
        await milestones.process(completionEvent);
        throw new Error("falha simulada sem conteúdo pessoal");
      }),
    ).rejects.toThrow();
    expect(await db.libraryEntries.count()).toBe(0);
    expect(await db.milestones.count()).toBe(0);

    await transaction.run(async () => {
      await db.libraryEntries.add(completedBook);
      await milestones.process(completionEvent);
    });
    expect(await db.milestones.count()).toBe(1);
    db.close();
  });

  it("não confirma a ação principal quando a gravação do marco falha", async () => {
    const db = database();
    await db.open();
    let sequence = 0;
    const command = new CreateBookEntry({
      activities: new DexieActivityRepository(db),
      clock: { now: () => Promise.resolve(completedBook.createdAt) },
      events: new LocalEventBus(),
      ids: {
        generate: () => {
          sequence += 1;
          return Promise.resolve(`generated-${sequence}`);
        },
      },
      libraryEntries: new DexieLibraryEntryRepository(db),
      milestones: {
        process: () => Promise.reject(new Error("falha interna sensível")),
      },
      transaction: new DexieTransactionRunner(db),
    });

    const failure: unknown = await command
      .execute({ title: "Não deve persistir" })
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(ApplicationError);
    if (!(failure instanceof ApplicationError)) throw failure;
    expect(failure.code).toBe("PERSISTENCE_FAILED");
    expect(failure.message).not.toMatch(/sensível|Não deve persistir/u);
    expect(await db.libraryEntries.count()).toBe(0);
    expect(await db.activities.count()).toBe(0);
    expect(await db.milestones.count()).toBe(0);
    db.close();
  });

  it("preserva o marco e a decoração após excluir o livro de origem", async () => {
    const db = database();
    await db.open();
    await db.libraryEntries.add(completedBook);
    const milestones = store(db);
    await milestones.process(completionEvent);
    await db.libraryEntries.delete(completedBook.id);
    expect(await milestones.list()).toHaveLength(1);
    expect(await db.libraryEntries.count()).toBe(0);
    db.close();
  });

  it("rejeita registro externo inválido com erro sanitizado", async () => {
    const db = database();
    await db.open();
    await db.milestones.add({
      id: MILESTONE_ID.firstBook,
      reachedAt: "inválido",
      rewards: [],
      ruleVersion: 1,
      source: {
        eventId: "event-private-title",
        eventType: "LibraryEntryCreated",
      },
    });
    const failure: unknown = await store(db)
      .list()
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(InfrastructureError);
    if (!(failure instanceof InfrastructureError)) throw failure;
    expect(failure.code).toBe("DATABASE_READ_FAILED");
    expect(failure.message).not.toMatch(/private-title/u);
    db.close();
  });

  it("persiste estágio de sala uma vez sob avaliações concorrentes", async () => {
    const db = database();
    await db.open();
    await db.libraryEntries.add(completedBook);
    for (let index = 0; index < 3; index += 1) {
      await db.sessions.add(
        createManualSession({
          id: `session-${index}`,
          entryId: completedBook.id,
          entryType: "book",
          occurredAt: `2026-08-10T1${index}:00:00.000Z`,
          duration: 60,
        }),
      );
    }
    const milestones = new DexieMilestoneStore(
      db,
      new MilestoneEngine(),
      PROTOTYPE_CONTENT.milestones,
      PROTOTYPE_CONTENT.rewards,
      ROOM_CATALOG,
    );
    const event = createSessionChangedEvent({
      aggregateId: completedBook.id,
      eventId: "event-room-stage",
      occurredAt: "2026-08-10T14:00:00.000Z",
      revision: 2,
      payload: {
        entryType: "book",
        sessionId: "session-2",
        status: "completed",
      },
    });
    await Promise.all([milestones.process(event), milestones.process(event)]);
    expect(
      (await milestones.list()).filter(
        ({ id }) => id === MILESTONE_ID.mainLibraryStage2,
      ),
    ).toHaveLength(1);
    db.close();
  });
});
