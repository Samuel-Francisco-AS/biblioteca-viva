// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, expect, it } from "vitest";
import {
  createBook,
  createMovie,
  createSeries,
  createStudy,
  createPhysicalActivity,
  createWork,
  createManualSession,
} from "../../domain";
import { BibliotecaDatabase } from "./database";
import {
  DATABASE_SCHEMA_V8,
  DATABASE_VERSION,
  SCHEMA_MARKER_KEY,
  persistedLibraryEntrySchema,
  persistedSessionSchema,
} from "./schema";
import { JsonBackupCodec } from "../backup/backupCodec";
const names: string[] = [];
afterEach(async () => {
  await Promise.all(names.splice(0).map((name) => Dexie.delete(name)));
});
it("v8 → current preserves six types, annotations, sessions, tags, preferences and reopens workout snapshots", async () => {
  const name = `r5-upgrade-${crypto.randomUUID()}`;
  names.push(name);
  const createdAt = "2026-11-03T12:00:00.000Z";
  const entries = [
    createBook({ id: "book", title: "Livro fictício", createdAt }),
    createMovie({ id: "movie", title: "Filme fictício", createdAt }),
    createSeries({
      id: "series",
      title: "Série fictícia",
      currentSeason: 2,
      currentEpisode: 4,
      createdAt,
    }),
    createStudy({
      id: "study",
      title: "Estudo fictício",
      progressUnit: "hours",
      progressCurrent: 90,
      createdAt,
    }),
    createPhysicalActivity({
      id: "practice",
      title: "Treino fictício",
      category: "strength",
      createdAt,
    }),
    createWork({ id: "work", title: "Empreitada fictícia", createdAt }),
  ];
  const legacy = new Dexie(name);
  legacy.version(8).stores(DATABASE_SCHEMA_V8);
  await legacy.open();
  await legacy.table("libraryEntries").bulkPut(entries);
  const note = {
    id: "note",
    entryId: "book",
    content: "Nota fictícia",
    favorite: false,
    tagIds: [],
    createdAt,
    updatedAt: createdAt,
    revision: 1,
  };
  await legacy.table("notes").put(note);
  await legacy.table("quotes").put({ ...note, id: "quote" });
  const session = createManualSession({
    id: "session",
    entryId: "book",
    entryType: "book",
    occurredAt: createdAt,
    duration: 60,
    startPage: 1,
    endPage: 3,
  });
  await legacy.table("sessions").put(session);
  const tag = {
    id: "tag",
    name: "Fictícia",
    normalizedName: "fictícia",
    createdAt,
    updatedAt: createdAt,
    revision: 1,
  };
  await legacy.table("tags").put(tag);
  const setting = {
    key: "experience.preferences.v1",
    value: { highContrast: true, motion: "reduce", textSize: "large" },
    updatedAt: createdAt,
  };
  await legacy.table("settings").put(setting);
  legacy.close();
  const upgraded = new BibliotecaDatabase(name);
  await upgraded.open();
  expect(upgraded.verno).toBe(17);
  expect(await upgraded.libraryEntries.toArray()).toEqual(
    [...entries].sort((a, b) => a.id.localeCompare(b.id)),
  );
  expect(await upgraded.notes.get("note")).toEqual(note);
  expect(await upgraded.quotes.get("quote")).toEqual({ ...note, id: "quote" });
  expect(await upgraded.sessions.get("session")).toEqual(session);
  expect(await upgraded.tags.get("tag")).toEqual(tag);
  expect(await upgraded.settings.get(setting.key)).toEqual(setting);
  expect(await upgraded.metadata.get(SCHEMA_MARKER_KEY)).toMatchObject({
    value: "17",
  });
  const exercises = [
    { name: "Supino fictício", sets: 3, repetitions: 10, loadKg: 12.5 },
    { name: "Prancha fictícia", durationSeconds: 30 },
  ];
  const workout = createPhysicalActivity({
    id: "plan",
    title: "Ficha fictícia",
    category: "strength",
    exercises,
    createdAt,
  });
  const execution = createManualSession({
    id: "execution",
    entryId: "plan",
    entryType: "physical_activity",
    exercises,
    duration: 0,
    occurredAt: createdAt,
  });
  await upgraded.libraryEntries.put(workout);
  await upgraded.sessions.put(execution);
  upgraded.close();
  const reopened = new BibliotecaDatabase(name);
  await reopened.open();
  expect(
    persistedLibraryEntrySchema.parse(
      await reopened.libraryEntries.get("plan"),
    ),
  ).toEqual(workout);
  expect(
    persistedSessionSchema.parse(await reopened.sessions.get("execution")),
  ).toEqual(execution);
  const codec = new JsonBackupCodec();
  const artifact = await codec.encode({
    appVersion: "test",
    databaseVersion: DATABASE_VERSION,
    createdAt,
    data: {
      libraryEntries: await reopened.libraryEntries.toArray(),
      notes: [note],
      quotes: [{ ...note, id: "quote" }],
      activities: [],
      settings: [setting],
      milestones: [],
      sessions: await reopened.sessions.toArray(),
      tags: [tag],
    },
  });
  const inspected = await codec.inspect(artifact.content);
  expect(
    inspected.data.libraryEntries.find((entry) => entry.id === "plan"),
  ).toEqual(workout);
  expect(
    inspected.data.sessions.find((item) => item.id === "execution"),
  ).toEqual(execution);
  expect(
    persistedLibraryEntrySchema.safeParse({
      ...workout,
      exercises: [{ name: "x", loadKg: -1 }],
    }).success,
  ).toBe(false);
  expect(
    persistedSessionSchema.safeParse({
      ...execution,
      exercises: [{ name: "x", surprise: true }],
    }).success,
  ).toBe(false);
  reopened.close();
});
