// @vitest-environment node
import "fake-indexeddb/auto";

import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";

import {
  BACKUP_FORMAT_VERSION,
  ExportBackup,
  ImportBackup,
  type BackupData,
} from "../../application";
import { createBook, createManualSession } from "../../domain";
import { BibliotecaDatabase } from "../database/database";
import { JsonBackupCodec } from "./backupCodec";
import { DexieBackupSnapshotStore } from "./dexieBackupStore";

const databases: string[] = [];
afterEach(async () => {
  await Promise.all(databases.splice(0).map((name) => Dexie.delete(name)));
});

const emptyData = (): BackupData => ({
  libraryEntries: [],
  notes: [],
  quotes: [],
  activities: [],
  settings: [],
  milestones: [],
  sessions: [],
  tags: [],
});

describe("backup pós-reset", () => {
  it("exporta e restaura dados convencionais em formato v6", async () => {
    const name = `backup-${crypto.randomUUID()}`;
    databases.push(name);
    const database = new BibliotecaDatabase(name);
    await database.open();
    const book = createBook({
      id: "book-1",
      title: "Livro fictício",
      createdAt: "2026-09-08T10:00:00.000Z",
    });
    await database.libraryEntries.add(book);
    await database.notes.add({
      id: "note-1",
      entryId: book.id,
      content: "Nota fictícia",
      favorite: true,
      tagIds: ["tag-1"],
      createdAt: "2026-09-08T10:00:00.000Z",
      updatedAt: "2026-09-08T10:00:00.000Z",
      revision: 1,
    });
    await database.quotes.add({
      id: "quote-1",
      entryId: book.id,
      content: "Citação fictícia",
      favorite: false,
      tagIds: [],
      location: { type: "book", page: 1 },
      createdAt: "2026-09-08T10:00:00.000Z",
      updatedAt: "2026-09-08T10:00:00.000Z",
      revision: 1,
    });
    await database.activities.add({
      id: "activity-1",
      aggregateId: book.id,
      occurredAt: "2026-09-08T10:00:00.000Z",
      revision: 1,
      type: "entry_created",
      metadata: { entryType: "book", status: "planned" },
    });
    await database.settings.add({
      key: "audio.preferences.v1",
      value: { effectsVolume: 0.4, muted: false },
      updatedAt: "2026-09-08T10:00:00.000Z",
    });
    await database.milestones.add({
      id: "milestone.first-book",
      reachedAt: "2026-09-08T10:00:00.000Z",
      ruleVersion: 1,
      source: {
        eventId: "event-1",
        eventType: "LibraryEntryCreated",
      },
    });
    await database.sessions.add(
      createManualSession({
        id: "session-1",
        entryId: book.id,
        entryType: "book",
        occurredAt: "2026-09-08T10:30:00.000Z",
        duration: 1800,
        startPage: 1,
        endPage: 10,
      }),
    );
    await database.tags.add({
      id: "tag-1",
      name: "Ficção",
      normalizedName: "ficcao",
      createdAt: "2026-09-08T10:00:00.000Z",
      updatedAt: "2026-09-08T10:00:00.000Z",
      revision: 1,
    });
    const store = new DexieBackupSnapshotStore(database);
    const codec = new JsonBackupCodec();
    const exporter = new ExportBackup(
      store,
      codec,
      { now: () => Promise.resolve("2026-09-08T10:00:00.000Z") },
      "0.2.0-test",
      8,
    );
    const snapshot = await store.read();
    expect(snapshot.isEmpty).toBe(false);
    const artifact = await exporter.execute();
    expect(artifact.summary.formatVersion).toBe(BACKUP_FORMAT_VERSION);

    await store.replace(emptyData());
    expect((await store.read()).isEmpty).toBe(true);
    const importer = new ImportBackup(store, codec, exporter, {
      shareBackupFile: () => Promise.resolve("flow-finished"),
    });
    await importer.execute(artifact.content, "empty-destination");
    expect(await store.read()).toEqual(snapshot);
    database.close();
  });

  it.each([1, 2, 3, 4, 5])(
    "rejeita com clareza backup legado v%d",
    async (formatVersion) => {
      const codec = new JsonBackupCodec();
      await expect(
        codec.inspect(
          JSON.stringify({
            kind: "biblioteca-viva-backup",
            formatVersion,
          }),
        ),
      ).rejects.toMatchObject({
        code: "UNSUPPORTED_FORMAT_VERSION",
      });
    },
  );

  it("rejeita backup v6 sem checksum", async () => {
    const codec = new JsonBackupCodec();
    await expect(
      codec.inspect(
        JSON.stringify({
          kind: "biblioteca-viva-backup",
          formatVersion: 6,
        }),
      ),
    ).rejects.toMatchObject({ code: "MISSING_CHECKSUM" });
  });

  it("detecta checksum alterado", async () => {
    const codec = new JsonBackupCodec();
    const artifact = await codec.encode({
      appVersion: "0.2.0-test",
      createdAt: "2026-09-08T10:00:00.000Z",
      databaseVersion: 8,
      data: {
        ...emptyData(),
        libraryEntries: [
          createBook({
            id: "a",
            title: "A",
            createdAt: "2026-09-08T10:00:00.000Z",
          }),
        ],
      },
    });
    const changed = artifact.content.replace('"title": "A"', '"title": "B"');
    await expect(codec.inspect(changed)).rejects.toMatchObject({
      code: "CHECKSUM_MISMATCH",
    });
  });

  it("rejeita identificadores duplicados", async () => {
    const codec = new JsonBackupCodec();
    const book = createBook({
      id: "duplicate",
      title: "Duplicado",
      createdAt: "2026-09-08T10:00:00.000Z",
    });
    await expect(
      codec.encode({
        appVersion: "0.2.0-test",
        createdAt: "2026-09-08T10:00:00.000Z",
        databaseVersion: 8,
        data: { ...emptyData(), libraryEntries: [book, book] },
      }),
    ).rejects.toMatchObject({ code: "DUPLICATE_ID" });
  });
});
