// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  BACKUP_KIND,
  ExportBackup,
  GetBookEntry,
  ImportBackup,
  ListAllNotes,
  ListAllQuotes,
  ListBookEntries,
  ListNotesByBook,
  ListQuotesByBook,
  type BackupData,
  type BackupFileSharePort,
} from "../../application";
import { BibliotecaDatabase } from "../database/database";
import {
  DexieLibraryEntryRepository,
  DexieNoteRepository,
  DexieQuoteRepository,
} from "../database/repositories";
import { DexieBackupSnapshotStore } from "./dexieBackupStore";
import { JsonBackupCodec, canonicalize, checksumMaterial } from "./backupCodec";

const databases = new Set<string>();
afterEach(async () => {
  await Promise.all([...databases].map((name) => Dexie.delete(name)));
  databases.clear();
});

const book = Object.freeze({
  id: "book-ação",
  type: "book" as const,
  title: "Ação 🌿",
  author: "Autora",
  status: "in_progress" as const,
  currentPage: 12,
  totalPages: 300,
  createdAt: "2026-07-30T10:00:00.000Z",
  updatedAt: "2026-07-30T11:00:00.000Z",
  revision: 2,
});
const note = Object.freeze({
  id: "note-1",
  entryId: book.id,
  content: "n".repeat(20_000),
  createdAt: book.createdAt,
  updatedAt: book.updatedAt,
  revision: 1,
});
const quote = Object.freeze({
  id: "quote-1",
  entryId: book.id,
  content: "citação",
  page: 12,
  createdAt: book.createdAt,
  updatedAt: book.updatedAt,
  revision: 1,
});
const activity = Object.freeze({
  id: "activity-1",
  type: "progress_updated" as const,
  aggregateId: book.id,
  occurredAt: book.updatedAt,
  revision: 2,
  metadata: Object.freeze({ currentPage: 12, totalPages: 300 }),
});
const completionMilestone = Object.freeze({
  id: "milestone.first-completed-book" as const,
  reachedAt: "2026-07-30T11:30:00.000Z",
  rewards: Object.freeze([
    Object.freeze({
      decorationId: "decoration.reading-lamp" as const,
      id: "reward.first-completion-reading-lamp",
      type: "decoration" as const,
    }),
  ]),
  ruleVersion: 1,
  source: Object.freeze({
    eventId: "event-first-completion",
    eventType: "LibraryEntryCompleted" as const,
  }),
});
const data: BackupData = Object.freeze({
  libraryEntries: [book],
  milestones: [],
  notes: [note],
  quotes: [quote],
  activities: [activity],
  settings: [
    {
      key: "experience.preferences.v1",
      value: {
        highContrast: true,
        motion: "reduce",
        textSize: "larger",
      },
      updatedAt: book.updatedAt,
    },
  ],
});

const laterBook = Object.freeze({
  ...book,
  id: "book-z",
  title: "Zênite",
  createdAt: "2026-07-30T12:00:00.000Z",
  updatedAt: "2026-07-30T12:00:00.000Z",
  revision: 1,
});
const replacementData: BackupData = Object.freeze({
  libraryEntries: [laterBook],
  milestones: [],
  notes: [
    {
      ...note,
      id: "note-new",
      entryId: laterBook.id,
      content: "nota nova",
      createdAt: laterBook.createdAt,
      updatedAt: laterBook.updatedAt,
    },
  ],
  quotes: [
    {
      ...quote,
      id: "quote-new",
      entryId: laterBook.id,
      content: "citação nova",
      createdAt: laterBook.createdAt,
      updatedAt: laterBook.updatedAt,
    },
  ],
  activities: [
    {
      ...activity,
      id: "activity-new",
      aggregateId: laterBook.id,
      occurredAt: laterBook.updatedAt,
      revision: 1,
    },
  ],
  settings: [
    {
      key: "experience.preferences.v1",
      value: {
        highContrast: false,
        motion: "normal",
        textSize: "large",
      },
      updatedAt: laterBook.updatedAt,
    },
  ],
});

describe("backup JSON v2", () => {
  it("cria envelope versionado, legível, determinístico e íntegro", async () => {
    const codec = new JsonBackupCodec();
    const artifact = await codec.encode({
      appVersion: "0.2.0-alpha.1",
      createdAt: book.createdAt,
      databaseVersion: 2,
      data,
    });
    const raw = JSON.parse(artifact.content) as Record<string, unknown>;
    expect(raw).toMatchObject({
      kind: BACKUP_KIND,
      formatVersion: 2,
      appVersion: "0.2.0-alpha.1",
      databaseVersion: 2,
    });
    expect(artifact.content.endsWith("\n")).toBe(true);
    expect(artifact.content).toContain("Ação 🌿");
    expect(
      (await codec.inspect(artifact.content)).data.notes[0]?.content,
    ).toHaveLength(20_000);
    expect(
      await codec.encode({
        appVersion: "0.2.0-alpha.1",
        createdAt: book.createdAt,
        databaseVersion: 2,
        data: { ...data, libraryEntries: [...data.libraryEntries].reverse() },
      }),
    ).toEqual(artifact);
    expect(
      Object.isFrozen(
        (await codec.inspect(artifact.content)).data.libraryEntries,
      ),
    ).toBe(true);
  });

  it("usa serialização canônica com chaves ordenadas recursivamente", () => {
    expect(canonicalize({ z: [3, { b: true, a: "á" }], a: null })).toBe(
      '{"a":null,"z":[3,{"a":"á","b":true}]}',
    );
  });

  it("aceita backup v1 íntegro sem inventar marcos", async () => {
    const codec = new JsonBackupCodec();
    const current = await codec.encode({
      appVersion: "0.2.0-alpha.1",
      createdAt: book.createdAt,
      databaseVersion: 2,
      data,
    });
    const raw = JSON.parse(current.content) as {
      data: Record<string, unknown>;
      formatVersion: number;
      integrity?: { algorithm: "SHA-256"; digest: string };
      [key: string]: unknown;
    };
    raw.formatVersion = 1;
    delete raw.data.milestones;
    const unsigned = structuredClone(raw);
    delete unsigned.integrity;
    const bytes = new TextEncoder().encode(
      canonicalize(checksumMaterial(unsigned)),
    );
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    raw.integrity = {
      algorithm: "SHA-256",
      digest: [...new Uint8Array(digest)]
        .map((value) => value.toString(16).padStart(2, "0"))
        .join(""),
    };

    const inspected = await codec.inspect(JSON.stringify(raw));
    expect(inspected.summary.formatVersion).toBe(1);
    expect(inspected.data.milestones).toEqual([]);
    expect(inspected.summary.warnings.join(" ")).toMatch(/nenhum marco/u);
  });

  it("exporta marco/recompensa e rejeita adulteração", async () => {
    const codec = new JsonBackupCodec();
    const artifact = await codec.encode({
      appVersion: "0.2.0-alpha.1",
      createdAt: book.createdAt,
      databaseVersion: 3,
      data: { ...data, milestones: [completionMilestone] },
    });
    await expect(codec.inspect(artifact.content)).resolves.toMatchObject({
      data: {
        milestones: [
          {
            id: "milestone.first-completed-book",
            rewards: [{ decorationId: "decoration.reading-lamp" }],
          },
        ],
      },
    });
    const tampered = JSON.parse(artifact.content) as {
      data: { milestones: Array<{ ruleVersion: number }> };
    };
    tampered.data.milestones[0].ruleVersion = 2;
    await expect(codec.inspect(JSON.stringify(tampered))).rejects.toMatchObject(
      { code: "CHECKSUM_MISMATCH" },
    );
  });

  it.each([
    ["JSON inválido", "{", "INVALID_JSON"],
    ["formato desconhecido", "{}", "UNRECOGNIZED_FORMAT"],
  ])("rejeita %s", async (_label, content, code) => {
    await expect(new JsonBackupCodec().inspect(content)).rejects.toMatchObject({
      code,
    });
  });

  it("rejeita versão futura, checksum ausente, divergente, ID duplicado e tamanho excessivo", async () => {
    const codec = new JsonBackupCodec();
    const artifact = await codec.encode({
      appVersion: "x",
      createdAt: book.createdAt,
      databaseVersion: 2,
      data,
    });
    const raw = JSON.parse(artifact.content) as Record<string, unknown>;
    await expect(
      codec.inspect(JSON.stringify({ ...raw, formatVersion: 3 })),
    ).rejects.toMatchObject({ code: "FUTURE_FORMAT_VERSION" });
    const withoutIntegrity = { ...raw };
    delete withoutIntegrity.integrity;
    await expect(
      codec.inspect(JSON.stringify(withoutIntegrity)),
    ).rejects.toMatchObject({ code: "MISSING_CHECKSUM" });
    const changed = structuredClone(raw) as {
      data: { libraryEntries: Array<{ title: string }> };
    };
    changed.data.libraryEntries[0].title = "alterado";
    await expect(codec.inspect(JSON.stringify(changed))).rejects.toMatchObject({
      code: "CHECKSUM_MISMATCH",
    });
    const duplicateArtifact = await codec.encode({
      appVersion: "x",
      createdAt: book.createdAt,
      databaseVersion: 2,
      data: { ...data, notes: [] },
    });
    const duplicate = JSON.parse(duplicateArtifact.content) as {
      data: { notes: unknown[] };
      integrity: { digest: string };
    };
    duplicate.data.notes = [note, note];
    duplicate.integrity.digest = "0".repeat(64);
    await expect(
      codec.inspect(JSON.stringify(duplicate)),
    ).rejects.toMatchObject({ code: "DUPLICATE_ID" });
    await expect(
      codec.inspect(" ".repeat(10 * 1024 * 1024 + 1)),
    ).rejects.toMatchObject({ code: "BACKUP_TOO_LARGE" });
  });

  it("rejeita versão anterior desconhecida, entidade inválida e setting não JSON", async () => {
    const codec = new JsonBackupCodec();
    const artifact = await codec.encode({
      appVersion: "x",
      createdAt: book.createdAt,
      databaseVersion: 2,
      data,
    });
    const raw = JSON.parse(artifact.content) as Record<string, unknown>;
    await expect(
      codec.inspect(JSON.stringify({ ...raw, formatVersion: 0 })),
    ).rejects.toMatchObject({ code: "UNSUPPORTED_FORMAT_VERSION" });
    const invalidEntity = structuredClone(raw) as {
      data: { libraryEntries: Array<{ currentPage: number }> };
    };
    invalidEntity.data.libraryEntries[0].currentPage = -1;
    await expect(
      codec.inspect(JSON.stringify(invalidEntity)),
    ).rejects.toMatchObject({ code: "INVALID_BACKUP_DATA" });
    await expect(
      codec.encode({
        appVersion: "x",
        createdAt: book.createdAt,
        databaseVersion: 2,
        data: {
          ...data,
          settings: [
            { key: "invalid", value: new Date(), updatedAt: book.updatedAt },
          ],
        },
      }),
    ).rejects.toBeDefined();
  });

  it("aceita o texto final após JSON, Blob e File com opcionais ausentes", async () => {
    const sourceName = `roundtrip-source-${crypto.randomUUID()}`;
    const destinationName = `roundtrip-destination-${crypto.randomUUID()}`;
    databases.add(sourceName);
    databases.add(destinationName);
    const optionalBook = Object.freeze({
      id: "book-sem-opcionais",
      type: "book" as const,
      title: "Sem autor — 漢字",
      author: undefined,
      status: "planned" as const,
      totalPages: undefined,
      currentPage: 0,
      rating: undefined,
      startedAt: undefined,
      completedAt: undefined,
      createdAt: "2026-07-30T12:00:00.000Z",
      updatedAt: "2026-07-30T12:00:00.000Z",
      revision: 1,
    });
    const quoteWithoutPage = Object.freeze({
      id: "quote-sem-pagina",
      entryId: optionalBook.id,
      content: "Citação sem página",
      page: undefined,
      createdAt: optionalBook.createdAt,
      updatedAt: optionalBook.updatedAt,
      revision: 1,
    });
    const manyActivities = Object.freeze(
      Array.from({ length: 8 }, (_, index) =>
        Object.freeze({
          ...activity,
          id: `activity-roundtrip-${index}`,
          aggregateId: index % 2 === 0 ? book.id : optionalBook.id,
          occurredAt: `2026-07-30T11:00:0${index}.000Z`,
          revision: index + 1,
        }),
      ),
    );
    const roundTripData: BackupData = Object.freeze({
      libraryEntries: [optionalBook, book],
      milestones: [],
      notes: [note],
      quotes: [quoteWithoutPage, quote],
      activities: manyActivities,
      settings: [],
    });
    const source = new BibliotecaDatabase(sourceName);
    await source.open();
    const sourceStore = new DexieBackupSnapshotStore(source);
    await sourceStore.replace(roundTripData);
    const codec = new JsonBackupCodec();
    const exporter = new ExportBackup(
      sourceStore,
      codec,
      { now: () => Promise.resolve(optionalBook.updatedAt) },
      "0.2.0-alpha.1",
      2,
    );
    const artifact = await exporter.execute();
    const immediatelyInspected = await codec.inspect(artifact.content);
    const inspectedOptionalBook = immediatelyInspected.data.libraryEntries.find(
      (entry) => entry.id === optionalBook.id,
    );

    expect(inspectedOptionalBook).toBeDefined();
    expect(Object.hasOwn(inspectedOptionalBook ?? {}, "author")).toBe(false);
    expect(Object.hasOwn(inspectedOptionalBook ?? {}, "totalPages")).toBe(
      false,
    );
    source.close();
    const parsedEnvelope = JSON.parse(artifact.content) as {
      integrity: { digest: string };
      [key: string]: unknown;
    };
    const { integrity, ...unsigned } = parsedEnvelope;
    const exportCanonical = canonicalize(checksumMaterial(unsigned));
    const blobText = await new Blob([artifact.content], {
      type: "application/json;charset=utf-8",
    }).text();
    const fileText = await new File([artifact.content], "backup.json", {
      type: "application/json;charset=utf-8",
    }).text();
    const reparsedEnvelope = JSON.parse(blobText) as {
      integrity: { digest: string };
      [key: string]: unknown;
    };
    const { integrity: reparsedIntegrity, ...reparsedUnsigned } =
      reparsedEnvelope;
    const importCanonical = canonicalize(checksumMaterial(reparsedUnsigned));

    expect(blobText).toBe(artifact.content);
    expect(fileText).toBe(artifact.content);
    expect(exportCanonical.length).toBe(importCanonical.length);
    expect(exportCanonical).toBe(importCanonical);
    expect(integrity.digest).toBe(reparsedIntegrity.digest);
    const inspected = await codec.inspect(blobText);
    expect(inspected.data).toEqual(immediatelyInspected.data);
    expect(inspected.summary.counts).toEqual({
      activities: manyActivities.length,
      libraryEntries: 2,
      milestones: 0,
      notes: 1,
      quotes: 2,
      settings: 0,
    });

    const destination = new BibliotecaDatabase(destinationName);
    await destination.open();
    const destinationStore = new DexieBackupSnapshotStore(destination);
    await expect(
      new ImportBackup(destinationStore, codec, exporter, {
        shareBackupFile: () => Promise.resolve("flow-finished"),
      }).execute(fileText),
    ).resolves.toEqual({
      libraryEntries: 2,
      milestones: 0,
      notes: 1,
      quotes: 2,
      activities: 8,
      settings: 0,
    });
    expect(await destinationStore.read()).toEqual({
      ...inspected.data,
      isEmpty: false,
    });
    destination.close();
  });
});

describe("snapshot Dexie e restauração", () => {
  it("restaura marcos por união monotônica e preserva desbloqueio legítimo", async () => {
    const name = `milestone-restore-${crypto.randomUUID()}`;
    databases.add(name);
    const database = new BibliotecaDatabase(name);
    await database.open();
    const store = new DexieBackupSnapshotStore(database);
    const existingFirstBook = {
      id: "milestone.first-book" as const,
      reachedAt: book.createdAt,
      rewards: [],
      ruleVersion: 1,
      source: {
        eventId: "event-first-book",
        eventType: "LibraryEntryCreated" as const,
      },
    };
    await store.replace({ ...data, milestones: [existingFirstBook] });
    await store.replace({
      ...replacementData,
      milestones: [completionMilestone],
    });
    await store.replace({
      ...replacementData,
      milestones: [completionMilestone],
    });

    expect((await store.read()).milestones.map(({ id }) => id)).toEqual([
      "milestone.first-book",
      "milestone.first-completed-book",
    ]);
    database.close();
  });

  it("não inicia replace nem altera tabelas para cinco classes de backup inválido", async () => {
    const name = `invalid-no-write-${crypto.randomUUID()}`;
    databases.add(name);
    const database = new BibliotecaDatabase(name);
    await database.open();
    const store = new DexieBackupSnapshotStore(database);
    await store.replace(data);
    const before = await store.read();
    const codec = new JsonBackupCodec();
    const validArtifact = await codec.encode({
      appVersion: "x",
      createdAt: book.updatedAt,
      databaseVersion: 2,
      data: replacementData,
    });
    const raw = JSON.parse(validArtifact.content) as {
      formatVersion: number;
      data: {
        libraryEntries: Array<{ currentPage: number }>;
        notes: unknown[];
      };
      integrity: { digest: string };
    };
    const future = structuredClone(raw);
    future.formatVersion = 3;
    const badChecksum = structuredClone(raw);
    badChecksum.integrity.digest = "0".repeat(64);
    const invalidEntity = structuredClone(raw);
    invalidEntity.data.libraryEntries[0].currentPage = -1;
    const duplicate = structuredClone(raw);
    duplicate.data.notes.push(duplicate.data.notes[0]);
    const cases = [
      ["{", "INVALID_JSON"],
      [JSON.stringify(future), "FUTURE_FORMAT_VERSION"],
      [JSON.stringify(badChecksum), "CHECKSUM_MISMATCH"],
      [JSON.stringify(invalidEntity), "INVALID_BACKUP_DATA"],
      [JSON.stringify(duplicate), "DUPLICATE_ID"],
    ] as const;
    const exporter = new ExportBackup(
      store,
      codec,
      { now: () => Promise.resolve(book.updatedAt) },
      "x",
      2,
    );
    const replace = vi.spyOn(store, "replace");
    for (const [content, code] of cases) {
      await expect(
        new ImportBackup(store, codec, exporter, {
          shareBackupFile: () => Promise.resolve("flow-finished"),
        }).execute(content),
      ).rejects.toMatchObject({ code });
    }
    expect(replace).not.toHaveBeenCalled();
    expect(await store.read()).toEqual(before);
    database.close();
  });

  it("restaura em banco limpo e atende às consultas reais após reabrir", async () => {
    const sourceName = `source-${crypto.randomUUID()}`;
    const destinationName = `destination-${crypto.randomUUID()}`;
    databases.add(sourceName);
    databases.add(destinationName);
    const linkedNote = Object.freeze({
      ...note,
      id: "note-2",
      entryId: laterBook.id,
      content: "segunda nota",
      createdAt: laterBook.createdAt,
      updatedAt: laterBook.updatedAt,
    });
    const linkedQuote = Object.freeze({
      ...quote,
      id: "quote-2",
      entryId: laterBook.id,
      content: "segunda citação",
      createdAt: laterBook.createdAt,
      updatedAt: laterBook.updatedAt,
    });
    const sourceData: BackupData = {
      ...data,
      libraryEntries: [laterBook, book],
      notes: [linkedNote, note],
      quotes: [linkedQuote, quote],
    };
    const source = new BibliotecaDatabase(sourceName);
    await source.open();
    const sourceStore = new DexieBackupSnapshotStore(source);
    await sourceStore.replace(sourceData);
    const codec = new JsonBackupCodec();
    const exporter = new ExportBackup(
      sourceStore,
      codec,
      { now: () => Promise.resolve(laterBook.updatedAt) },
      "0.2.0-alpha.1",
      2,
    );
    const artifact = await exporter.execute();
    source.close();

    const destination = new BibliotecaDatabase(destinationName);
    await destination.open();
    const destinationStore = new DexieBackupSnapshotStore(destination);
    await new ImportBackup(destinationStore, codec, exporter, {
      shareBackupFile: () => Promise.resolve("flow-finished"),
    }).execute(artifact.content);
    destination.close();

    const reopened = new BibliotecaDatabase(destinationName);
    await reopened.open();
    const books = new DexieLibraryEntryRepository(reopened);
    const notes = new DexieNoteRepository(reopened);
    const quotes = new DexieQuoteRepository(reopened);
    await expect(new ListBookEntries(books).execute()).resolves.toEqual([
      book,
      laterBook,
    ]);
    await expect(
      new GetBookEntry(books).execute({ id: laterBook.id }),
    ).resolves.toEqual(laterBook);
    await expect(new ListAllNotes(notes).execute()).resolves.toEqual([
      linkedNote,
      note,
    ]);
    await expect(new ListAllQuotes(quotes).execute()).resolves.toEqual([
      linkedQuote,
      quote,
    ]);
    await expect(
      new ListNotesByBook(notes).execute({ id: laterBook.id }),
    ).resolves.toEqual([linkedNote]);
    await expect(
      new ListQuotesByBook(quotes).execute({ id: laterBook.id }),
    ).resolves.toEqual([linkedQuote]);
    reopened.close();
  });

  it("restaura todas as coleções, preserva metadata técnica e reabre", async () => {
    const name = `backup-${crypto.randomUUID()}`;
    databases.add(name);
    const database = new BibliotecaDatabase(name);
    await database.open();
    await database.metadata.put({
      key: "destination",
      value: "keep",
      updatedAt: book.createdAt,
    });
    const store = new DexieBackupSnapshotStore(database);
    await store.replace(data);
    expect(await store.read()).toMatchObject({
      isEmpty: false,
      libraryEntries: [book],
      notes: [note],
      quotes: [quote],
    });
    expect(await database.metadata.get("destination")).toBeDefined();
    database.close();
    const reopened = new BibliotecaDatabase(name);
    await reopened.open();
    expect(await reopened.libraryEntries.get(book.id)).toMatchObject({
      currentPage: 12,
      revision: 2,
    });
    expect(await reopened.notes.count()).toBe(1);
    expect(await reopened.quotes.count()).toBe(1);
    reopened.close();
  });

  it.each(["libraryEntries", "notes", "activities", "settings"] as const)(
    "faz rollback total quando %s falha",
    async (tableName) => {
      const name = `rollback-${tableName}-${crypto.randomUUID()}`;
      databases.add(name);
      const database = new BibliotecaDatabase(name);
      await database.open();
      await database.metadata.put({
        key: "destination-marker",
        value: "preserved",
        updatedAt: book.createdAt,
      });
      const store = new DexieBackupSnapshotStore(database);
      await store.replace(data);
      const before = await store.read();
      const codec = new JsonBackupCodec();
      const incoming = (
        await codec.encode({
          appVersion: "x",
          createdAt: laterBook.updatedAt,
          databaseVersion: 2,
          data: replacementData,
        })
      ).content;
      const exporter = new ExportBackup(
        store,
        codec,
        { now: () => Promise.resolve(book.updatedAt) },
        "x",
        2,
      );
      const failure = vi
        .spyOn(database[tableName], "bulkAdd")
        .mockRejectedValueOnce(new Error("private transaction detail"));
      await expect(
        new ImportBackup(store, codec, exporter, {
          shareBackupFile: () => Promise.resolve("flow-finished"),
        }).execute(incoming),
      ).rejects.toMatchObject({
        code: "RESTORE_FAILED",
        message:
          "Não foi possível restaurar os dados. O estado anterior foi preservado.",
      });
      failure.mockRestore();
      database.close();

      const reopened = new BibliotecaDatabase(name);
      await reopened.open();
      expect(await new DexieBackupSnapshotStore(reopened).read()).toEqual(
        before,
      );
      expect(await reopened.metadata.get("destination-marker")).toMatchObject({
        value: "preserved",
      });
      expect(await reopened.libraryEntries.get(laterBook.id)).toBeUndefined();
      expect(await reopened.notes.get("note-new")).toBeUndefined();
      expect(await reopened.quotes.get("quote-new")).toBeUndefined();
      expect(await reopened.activities.get("activity-new")).toBeUndefined();
      reopened.close();
    },
  );

  it("exige entrega do backup de segurança antes da substituição", async () => {
    let replaced = false;
    const order: string[] = [];
    const snapshots = {
      read: () => Promise.resolve({ ...data, isEmpty: false }),
      replace: () => {
        replaced = true;
        order.push("replace");
        return Promise.resolve();
      },
    };
    const codec = new JsonBackupCodec();
    const exporter = new ExportBackup(
      snapshots,
      codec,
      { now: () => Promise.resolve(book.updatedAt) },
      "x",
      2,
    );
    const files: BackupFileSharePort = {
      shareBackupFile: ({ name }) => {
        order.push(name);
        return Promise.resolve("cancelled");
      },
    };
    const content = (
      await codec.encode({
        appVersion: "x",
        createdAt: book.createdAt,
        databaseVersion: 2,
        data,
      })
    ).content;
    await expect(
      new ImportBackup(snapshots, codec, exporter, files).execute(content),
    ).rejects.toMatchObject({ code: "BACKUP_DELIVERY_CANCELLED" });
    expect(replaced).toBe(false);
    expect(order[0]).toContain("seguranca-antes-da-restauracao");
  });

  it("não abre escrita para arquivo inválido", async () => {
    let writes = 0;
    const snapshots = {
      read: () => Promise.resolve({ ...data, isEmpty: true }),
      replace: () => {
        writes += 1;
        return Promise.resolve();
      },
    };
    const codec = new JsonBackupCodec();
    const exporter = new ExportBackup(
      snapshots,
      codec,
      { now: () => Promise.resolve(book.updatedAt) },
      "x",
      2,
    );
    await expect(
      new ImportBackup(snapshots, codec, exporter, {
        shareBackupFile: () => Promise.resolve("flow-finished"),
      }).execute("{}"),
    ).rejects.toMatchObject({ code: "UNRECOGNIZED_FORMAT" });
    expect(writes).toBe(0);
  });

  it("entrega a segurança antes de substituir e dispensa-a em base vazia", async () => {
    const codec = new JsonBackupCodec();
    const content = (
      await codec.encode({
        appVersion: "x",
        createdAt: book.createdAt,
        databaseVersion: 2,
        data,
      })
    ).content;
    for (const isEmpty of [false, true]) {
      const order: string[] = [];
      const snapshots = {
        read: () => Promise.resolve({ ...data, isEmpty }),
        replace: () => {
          order.push("replace");
          return Promise.resolve();
        },
      };
      const exporter = new ExportBackup(
        snapshots,
        codec,
        { now: () => Promise.resolve(book.updatedAt) },
        "x",
        2,
      );
      const result = await new ImportBackup(snapshots, codec, exporter, {
        shareBackupFile: () => {
          order.push("deliver");
          return Promise.resolve("flow-finished");
        },
      }).execute(content);
      expect(result).toEqual({
        libraryEntries: 1,
        milestones: 0,
        notes: 1,
        quotes: 1,
        activities: 1,
        settings: 1,
      });
      expect(order).toEqual(isEmpty ? ["replace"] : ["deliver", "replace"]);
    }
  });
});
