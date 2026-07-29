// @vitest-environment node

import "fake-indexeddb/auto";

import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";

import { ApplicationError } from "../application";
import {
  createApplication,
  type ApplicationRuntime,
} from "./createApplication";

const databases = new Set<string>();
const runtimes: ApplicationRuntime[] = [];

function databaseName(label: string): string {
  const name = `biblioteca-viva-composition-${label}-${crypto.randomUUID()}`;
  databases.add(name);
  return name;
}

afterEach(async () => {
  runtimes.splice(0).forEach((runtime) => runtime.close());
  await Promise.all([...databases].map((name) => Dexie.delete(name)));
  databases.clear();
});

describe("createApplication", () => {
  it("composes real use cases and persists book plus activity", async () => {
    const runtime = await createApplication({
      databaseName: databaseName("create"),
    });
    runtimes.push(runtime);
    const book = await runtime.commands.createBookEntry.execute({
      title: "Livro integrado",
    });
    await expect(
      runtime.queries.getBookEntry.execute({ id: book.id }),
    ).resolves.toEqual(book);
    const diagnostics = await runtime.diagnostics.inspect();
    expect(diagnostics.counts.libraryEntries).toBe(1);
    expect(diagnostics.counts.activities).toBe(1);
  });

  it("publishes only after the concrete transaction commits", async () => {
    const runtime = await createApplication({
      databaseName: databaseName("commit-order"),
    });
    runtimes.push(runtime);
    const countsObserved: Array<[number, number]> = [];
    runtime.events.subscribe("LibraryEntryCreated", async () => {
      const snapshot = await runtime.diagnostics.inspect();
      countsObserved.push([
        snapshot.counts.libraryEntries,
        snapshot.counts.activities,
      ]);
    });
    await runtime.commands.createBookEntry.execute({ title: "Após o commit" });
    expect(countsObserved).toEqual([[1, 1]]);
  });

  it("keeps committed data when event publication fails", async () => {
    const runtime = await createApplication({
      databaseName: databaseName("event-failure"),
    });
    runtimes.push(runtime);
    runtime.events.subscribe("LibraryEntryCreated", () => {
      throw new Error("subscriber internals");
    });
    const failure = await runtime.commands.createBookEntry
      .execute({ title: "Persistido antes do evento" })
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(ApplicationError);
    expect((failure as ApplicationError).code).toBe("EVENT_PUBLICATION_FAILED");
    const diagnostics = await runtime.diagnostics.inspect();
    expect(diagnostics.counts.libraryEntries).toBe(1);
    expect(diagnostics.counts.activities).toBe(1);
  });

  it("preserves data after controlled close and recomposition", async () => {
    const name = databaseName("reopen");
    const first = await createApplication({ databaseName: name });
    const book = await first.commands.createBookEntry.execute({
      title: "Durável",
    });
    first.close();
    const second = await createApplication({ databaseName: name });
    runtimes.push(second);
    await expect(
      second.queries.getBookEntry.execute({ id: book.id }),
    ).resolves.toEqual(book);
  });
});
