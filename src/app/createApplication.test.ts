// @vitest-environment node

import "fake-indexeddb/auto";

import Dexie from "dexie";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApplicationError, BackupError } from "../application";
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
  it("recusa criação e backup em contexto inseguro sem gravar livros", async () => {
    const runtime = await createApplication({
      databaseName: databaseName("unsafe-context"),
      platformCapabilities: {
        inspect: () => ({
          secureContext: false,
          secureUuid: false,
          backupIntegrity: false,
          supported: false,
        }),
      },
    });
    runtimes.push(runtime);

    await expect(
      runtime.commands.createBookEntry.execute({ title: "Não salvar" }),
    ).rejects.toMatchObject({ code: "UNSAFE_CONTEXT" });
    await expect(runtime.backup.export()).rejects.toMatchObject({
      code: "PLATFORM_CAPABILITY_UNAVAILABLE",
    });
    expect((await runtime.diagnostics.inspect()).counts.libraryEntries).toBe(0);
    expect(runtime.platform.supported).toBe(false);
  });

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

  it("composes global annotation queries without changing the database schema", async () => {
    const runtime = await createApplication({
      databaseName: databaseName("global-annotations"),
    });
    runtimes.push(runtime);
    const book = await runtime.commands.createBookEntry.execute({
      title: "Livro",
    });
    const note = await runtime.commands.addNote.execute({
      entryId: book.id,
      content: "Nota",
    });
    const quote = await runtime.commands.addQuote.execute({
      entryId: book.id,
      content: "Citação",
    });
    await expect(runtime.queries.listAllNotes.execute()).resolves.toEqual([
      note,
    ]);
    await expect(runtime.queries.listAllQuotes.execute()).resolves.toEqual([
      quote,
    ]);
  });

  it("encapsula falha da entrega do arquivo sem expor infraestrutura", async () => {
    const runtime = await createApplication({
      databaseName: databaseName("file-delivery-failure"),
      fileDelivery: {
        deliver: () => Promise.reject(new Error("private file path")),
      },
    });
    runtimes.push(runtime);
    const artifact = await runtime.backup.export();
    const failure = await runtime.backup
      .deliver(artifact)
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(BackupError);
    expect(failure).toMatchObject({ code: "BACKUP_DELIVERY_FAILED" });
    expect((failure as Error).message).not.toContain("private file path");
  });

  it("restaura snapshot sem eventos, atividades ou casos de escrita artificiais", async () => {
    const source = await createApplication({
      databaseName: databaseName("restore-source"),
    });
    runtimes.push(source);
    const sourceBook = await source.commands.createBookEntry.execute({
      title: "Livro fictício restaurado",
    });
    await source.commands.addNote.execute({
      entryId: sourceBook.id,
      content: "Nota fictícia",
    });
    await source.commands.addQuote.execute({
      entryId: sourceBook.id,
      content: "Citação fictícia",
    });
    const artifact = await source.backup.export();

    const destination = await createApplication({
      databaseName: databaseName("restore-destination"),
      fileDelivery: { deliver: () => Promise.resolve("delivered") },
    });
    runtimes.push(destination);
    await destination.commands.createBookEntry.execute({
      title: "Estado anterior fictício",
    });
    const published: string[] = [];
    const eventTypes = [
      "LibraryEntryCreated",
      "LibraryEntryUpdated",
      "ProgressUpdated",
      "LibraryEntryCompleted",
      "NoteCreated",
      "QuoteCreated",
    ] as const;
    eventTypes.forEach((type) =>
      destination.events.subscribe(type, (event) => {
        published.push(event.type);
      }),
    );
    const commandSpies = [
      vi.spyOn(destination.commands.createBookEntry, "execute"),
      vi.spyOn(destination.commands.updateBookEntry, "execute"),
      vi.spyOn(destination.commands.updateBookProgress, "execute"),
      vi.spyOn(destination.commands.changeBookStatus, "execute"),
      vi.spyOn(destination.commands.addNote, "execute"),
      vi.spyOn(destination.commands.addQuote, "execute"),
    ];

    await expect(destination.backup.import(artifact.content)).resolves.toEqual(
      artifact.summary.counts,
    );
    expect(published).toEqual([]);
    commandSpies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
    const diagnostics = await destination.diagnostics.inspect();
    expect(diagnostics.counts.activities).toBe(
      artifact.summary.counts.activities,
    );
    await expect(
      destination.queries.listBookEntries.execute(),
    ).resolves.toEqual([sourceBook]);
  });
});
