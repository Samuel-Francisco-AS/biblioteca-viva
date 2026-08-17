// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import type { DomainEvent, LibraryEntry } from "../domain";
import {
  ChangeLibraryEntryStatus,
  CreateLibraryEntry,
  UpdateLibraryEntry,
  UpdateLibraryEntryProgress,
} from "./libraryEntries";
import type {
  ActivityRepository,
  ApplicationEventBus,
  ApplicationTransactionRunner,
  Clock,
  IdGenerator,
  LibraryEntryRepository,
} from "./ports";

const T0 = "2026-08-16T10:00:00.000Z";
const T1 = "2026-08-16T11:00:00.000Z";

function setup(now = T0) {
  const entries = new Map<string, LibraryEntry>();
  const activities: unknown[] = [];
  const events: DomainEvent[] = [];
  let sequence = 0;
  let inTransaction = false;
  const libraryEntries: LibraryEntryRepository = {
    getById: (id) => Promise.resolve(entries.get(id)),
    list: () => Promise.resolve([...entries.values()]),
    save: (entry) => {
      entries.set(entry.id, entry);
      return Promise.resolve();
    },
  };
  const activityRepository: ActivityRepository = {
    list: () => Promise.resolve([]),
    save: (activity) => {
      activities.push(activity);
      return Promise.resolve();
    },
  };
  const clock: Clock = { now: () => Promise.resolve(now) };
  const ids: IdGenerator = {
    generate: () => Promise.resolve(`id-${++sequence}`),
  };
  const transaction: ApplicationTransactionRunner = {
    run: async (operation) => {
      inTransaction = true;
      try {
        return await operation();
      } finally {
        inTransaction = false;
      }
    },
  };
  const eventBus: ApplicationEventBus = {
    publish: vi.fn((event: DomainEvent) => {
      expect(inTransaction).toBe(false);
      events.push(event);
      return Promise.resolve();
    }),
  };
  return {
    activities: activityRepository,
    clock,
    events: eventBus,
    ids,
    libraryEntries,
    transaction,
    state: { activities, entries, events },
  };
}

const inputs = [
  { type: "movie", title: "Filme", director: "Pessoa Fictícia" },
  { type: "series", title: "Série", totalEpisodes: 8 },
  {
    type: "study",
    title: "Estudo",
    progressUnit: "sessions",
    progressTotal: 10,
  },
  { type: "physical_activity", title: "Caminhada", category: "cardio" },
  { type: "work", title: "Projeto", nextAction: "Revisar" },
] as const;

describe("casos de uso genéricos de LibraryEntry", () => {
  it.each(inputs)(
    "cria $type em transação e publica evento técnico pós-commit",
    async (input) => {
      const context = setup();
      const entry = await new CreateLibraryEntry(context).execute(input);
      expect(context.state.entries.get(entry.id)).toBe(entry);
      expect(context.state.activities).toHaveLength(1);
      expect(context.state.events).toEqual([
        expect.objectContaining({
          type: "LibraryEntryCreated",
          aggregateId: entry.id,
          payload: { entryType: entry.type, status: "planned" },
        }),
      ]);
      expect(JSON.stringify(context.state.events)).not.toContain(entry.title);
    },
  );

  it("edita variante sem alterar tipo ou identidade", async () => {
    const created = setup();
    const movie = await new CreateLibraryEntry(created).execute({
      type: "movie",
      title: "Antes",
    });
    const context = { ...created, clock: { now: () => Promise.resolve(T1) } };
    const updated = await new UpdateLibraryEntry(context).execute({
      id: movie.id,
      type: "movie",
      title: "Depois",
      platform: "Cinema",
    });
    expect(updated).toMatchObject({
      id: movie.id,
      type: "movie",
      title: "Depois",
      platform: "Cinema",
      revision: 2,
      updatedAt: T1,
    });
    await expect(
      new UpdateLibraryEntry(context).execute({
        id: movie.id,
        type: "work",
        title: "Incompatível",
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  });

  it("aplica progresso especializado de Série e Estudo", async () => {
    const context = setup();
    const series = await new CreateLibraryEntry(context).execute({
      type: "series",
      title: "Série",
      totalEpisodes: 2,
    });
    const study = await new CreateLibraryEntry(context).execute({
      type: "study",
      title: "Estudo",
      progressUnit: "percent",
      progressTotal: 100,
    });
    const later = { ...context, clock: { now: () => Promise.resolve(T1) } };
    await expect(
      new UpdateLibraryEntryProgress(later).execute({
        id: series.id,
        type: "series",
        episodesWatched: 2,
      }),
    ).resolves.toMatchObject({ status: "completed", episodesWatched: 2 });
    await expect(
      new UpdateLibraryEntryProgress(later).execute({
        id: study.id,
        type: "study",
        progressCurrent: 50,
      }),
    ).resolves.toMatchObject({ status: "in_progress", progressCurrent: 50 });
  });

  it("mantém conclusão explícita para filme, atividade física e trabalho", async () => {
    for (const input of [inputs[0], inputs[3], inputs[4]]) {
      const context = setup();
      const entry = await new CreateLibraryEntry(context).execute(input);
      const later = { ...context, clock: { now: () => Promise.resolve(T1) } };
      const started = await new ChangeLibraryEntryStatus(later).execute({
        id: entry.id,
        status: "in_progress",
      });
      expect(started.completedAt).toBeUndefined();
      await expect(
        new ChangeLibraryEntryStatus(later).execute({
          id: entry.id,
          status: "completed",
        }),
      ).resolves.toMatchObject({ status: "completed", completedAt: T1 });
    }
  });
});
