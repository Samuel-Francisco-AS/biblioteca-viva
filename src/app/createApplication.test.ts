// @vitest-environment node

import "fake-indexeddb/auto";

import Dexie from "dexie";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApplicationError, BackupError, BackupFileError } from "../application";
import {
  createApplication,
  type ApplicationRuntime,
} from "./createApplication";
import type { AudioBackend, AudioPlayback } from "../infrastructure";

function fakeAudioBackend(play = vi.fn()): AudioBackend {
  return {
    dispose: vi.fn(),
    initialize: vi.fn(() => Promise.resolve(true)),
    play: (cue, volume) => {
      play(cue, volume);
      const playback: AudioPlayback = {
        completed: new Promise<void>(() => undefined),
        setVolume: vi.fn(),
        stop: vi.fn(),
      };
      return Promise.resolve(playback);
    },
  };
}

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
  it("compõe diálogo, persiste once em settings e o recarrega", async () => {
    const name = databaseName("dialogue-composition");
    const first = await createApplication({ databaseName: name });
    await first.dialogue.enterLibrary({
      completedBooks: 0,
      inProgressBooks: 0,
      totalBooks: 1,
    });
    await expect(
      first.dialogue.select("librarian.interaction"),
    ).resolves.toMatchObject({ id: "dialogue.librarian.first-book" });
    expect((await first.diagnostics.inspect()).counts.settings).toBe(1);
    first.close();

    const second = await createApplication({ databaseName: name });
    runtimes.push(second);
    await second.dialogue.enterLibrary({
      completedBooks: 0,
      inProgressBooks: 0,
      totalBooks: 1,
    });
    await expect(
      second.dialogue.select("librarian.interaction"),
    ).resolves.not.toMatchObject({ id: "dialogue.librarian.first-book" });
  });

  it("conecta conclusão pós-commit ao efeito e recarrega preferências", async () => {
    const name = databaseName("audio-composition");
    const play = vi.fn();
    const first = await createApplication({
      audioBackend: fakeAudioBackend(play),
      databaseName: name,
    });
    await first.audio.initialize();
    await first.audio.setMusicVolume(0.22);
    await first.audio.setEffectsVolume(0.73);
    await first.audio.setMuted(false);
    const book = await first.commands.createBookEntry.execute({
      title: "Conclusão fictícia",
      status: "in_progress",
    });
    await first.commands.changeBookStatus.execute({
      id: book.id,
      status: "completed",
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(play.mock.calls.at(-1)?.[0]).toMatchObject({
      id: "milestone.book-completed",
    });
    first.close();

    const second = await createApplication({
      audioBackend: fakeAudioBackend(),
      databaseName: name,
    });
    runtimes.push(second);
    expect(second.audio.preferences()).toEqual({
      effectsVolume: 0.73,
      musicVolume: 0.22,
      muted: false,
    });
  });

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
      backupFileShare: {
        shareBackupFile: () => Promise.reject(new Error("private file path")),
      },
    });
    runtimes.push(runtime);
    const artifact = await runtime.backup.export();
    const failure = await runtime.backup
      .shareBackupFile(artifact)
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(BackupError);
    expect(failure).toMatchObject({ code: "BACKUP_DELIVERY_FAILED" });
    expect((failure as Error).message).not.toContain("private file path");
  });

  it.each([
    ["TEMPORARY_WRITE_FAILED", "BACKUP_TEMPORARY_WRITE_FAILED"],
    ["SHARE_FAILED", "BACKUP_SHARE_FAILED"],
  ] as const)(
    "mapeia %s para erro público específico",
    async (code, expected) => {
      const runtime = await createApplication({
        databaseName: databaseName(`delivery-${code}`),
        backupFileShare: {
          shareBackupFile: () => Promise.reject(new BackupFileError(code)),
        },
      });
      runtimes.push(runtime);
      const artifact = await runtime.backup.export();
      await expect(
        runtime.backup.shareBackupFile(artifact),
      ).rejects.toMatchObject({
        code: expected,
      });
    },
  );

  it("exportar e encerrar a entrega não altera tabela alguma", async () => {
    const runtime = await createApplication({
      databaseName: databaseName("delivery-read-only"),
      backupFileShare: {
        shareBackupFile: () => Promise.resolve("flow-finished"),
      },
    });
    runtimes.push(runtime);
    await runtime.commands.createBookEntry.execute({ title: "Livro fictício" });
    const before = await runtime.diagnostics.inspect();
    const artifact = await runtime.backup.export();
    await runtime.backup.shareBackupFile(artifact);
    const after = await runtime.diagnostics.inspect();
    expect(after.counts).toEqual(before.counts);
  });

  it("salva exatamente o artefato e não altera tabela alguma", async () => {
    const saveBackupFile = vi.fn(() => Promise.resolve("saved" as const));
    const runtime = await createApplication({
      databaseName: databaseName("save-read-only"),
      backupFileSave: { saveBackupFile },
      nativeSaveAvailable: true,
    });
    runtimes.push(runtime);
    await runtime.commands.createBookEntry.execute({ title: "Livro fictício" });
    const before = await runtime.diagnostics.inspect();
    const artifact = await runtime.backup.export();

    await expect(runtime.backup.saveBackupFile(artifact)).resolves.toBe(
      "saved",
    );
    expect(saveBackupFile).toHaveBeenCalledWith({
      content: artifact.content,
      name: artifact.fileName,
    });
    await expect(runtime.backup.inspect(artifact.content)).resolves.toEqual(
      artifact.summary,
    );
    expect((await runtime.diagnostics.inspect()).counts).toEqual(before.counts);
  });

  it.each([
    ["DOCUMENT_PICKER_FAILED", "BACKUP_DOCUMENT_PICKER_FAILED"],
    ["DOCUMENT_WRITE_FAILED", "BACKUP_DOCUMENT_WRITE_FAILED"],
  ] as const)("sanitiza falha nativa %s", async (code, expected) => {
    const runtime = await createApplication({
      databaseName: databaseName(`save-${code}`),
      backupFileSave: {
        saveBackupFile: () => Promise.reject(new BackupFileError(code)),
      },
      nativeSaveAvailable: true,
    });
    runtimes.push(runtime);
    const artifact = await runtime.backup.export();
    const failure = await runtime.backup
      .saveBackupFile(artifact)
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(BackupError);
    expect(failure).toMatchObject({ code: expected });
    expect((failure as Error).message).not.toContain("content://");
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
      backupFileShare: {
        shareBackupFile: () => Promise.resolve("flow-finished"),
      },
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

  it("exclui o livro agregado e o backup/projeção consultável refletem a ausência", async () => {
    const runtime = await createApplication({
      databaseName: databaseName("delete-and-export"),
    });
    runtimes.push(runtime);
    const deletedBook = await runtime.commands.createBookEntry.execute({
      title: "Livro descartável fictício",
    });
    const keptBook = await runtime.commands.createBookEntry.execute({
      title: "Livro preservado fictício",
    });
    await runtime.commands.addNote.execute({
      entryId: deletedBook.id,
      content: "Nota fictícia descartável",
    });
    await runtime.commands.addQuote.execute({
      entryId: deletedBook.id,
      content: "Citação fictícia descartável",
    });

    await expect(
      runtime.commands.deleteBookEntry.execute({ id: deletedBook.id }),
    ).resolves.toEqual({ deleted: true });
    await expect(runtime.queries.listBookEntries.execute()).resolves.toEqual([
      keptBook,
    ]);
    await expect(runtime.queries.listAllNotes.execute()).resolves.toEqual([]);
    await expect(runtime.queries.listAllQuotes.execute()).resolves.toEqual([]);

    const artifact = await runtime.backup.export();
    expect(artifact.content).not.toContain(deletedBook.id);
    await expect(
      runtime.backup.inspect(artifact.content),
    ).resolves.toMatchObject({
      counts: {
        activities: 1,
        libraryEntries: 1,
        notes: 0,
        quotes: 0,
      },
    });
  });
});
