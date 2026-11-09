import type {
  Card,
  CardVersion,
  Deck,
  StudyCardLink,
  KnowledgeTag,
  CardSession,
} from "../../domain/arcanarium";
import { promoteLegacyFlashCards } from "./promoteLegacyFlashCards";
import type { LocalPoster } from "../../application/media";
import Dexie, { type EntityTable } from "dexie";

import {
  DATABASE_NAME,
  DATABASE_SCHEMA_V1,
  DATABASE_SCHEMA_V2,
  DATABASE_SCHEMA_V3,
  DATABASE_SCHEMA_V4,
  DATABASE_SCHEMA_V5,
  DATABASE_SCHEMA_V6,
  DATABASE_SCHEMA_V7,
  DATABASE_SCHEMA_V8,
  DATABASE_SCHEMA_V9,
  DATABASE_SCHEMA_V10,
  DATABASE_SCHEMA_V11,
  DATABASE_SCHEMA_V12,
  DATABASE_SCHEMA_V13,
  DATABASE_SCHEMA_V14,
  DATABASE_SCHEMA_V15,
  DATABASE_SCHEMA_V16,
  DATABASE_SCHEMA_V17,
  DATABASE_SCHEMA_V18,
  SCHEMA_MARKER_KEY,
  type PersistedActivity,
  type PersistedLibraryEntry,
  type PersistedMetadata,
  type PersistedMilestone,
  type PersistedNote,
  type PersistedQuote,
  type PersistedSetting,
  type PersistedSession,
  type PersistedTag,
} from "./schema";

const MIGRATION_TIMESTAMP = "1970-01-01T00:00:00.000Z";

export class BibliotecaDatabase extends Dexie {
  educationalPacks!: EntityTable<
    import("../../domain/packManifest").PackReceipt,
    "id"
  >;
  cardMedia!: EntityTable<
    import("../../application/cardMedia").CardMedia,
    "id"
  >;
  arcanariumCards!: EntityTable<Card, "id">;
  arcanariumVersions!: import("dexie").Table<CardVersion, [string, number]>;
  arcanariumDecks!: EntityTable<Deck, "id">;
  studyCardLinks!: import("dexie").Table<StudyCardLink, [string, string]>;
  knowledgeTags!: EntityTable<KnowledgeTag, "id">;
  cardSessions!: EntityTable<CardSession, "id">;
  media!: EntityTable<LocalPoster, "entryId">;
  libraryEntries!: EntityTable<PersistedLibraryEntry, "id">;
  notes!: EntityTable<PersistedNote, "id">;
  quotes!: EntityTable<PersistedQuote, "id">;
  activities!: EntityTable<PersistedActivity, "id">;
  settings!: EntityTable<PersistedSetting, "key">;
  metadata!: EntityTable<PersistedMetadata, "key">;
  milestones!: EntityTable<PersistedMilestone, "id">;
  tags!: EntityTable<PersistedTag, "id">;
  sessions!: EntityTable<PersistedSession, "id">;

  constructor(name = DATABASE_NAME) {
    super(name);
    this.version(1).stores(DATABASE_SCHEMA_V1);
    this.version(2)
      .stores(DATABASE_SCHEMA_V2)
      .upgrade(async (transaction) => {
        await transaction.table<PersistedMetadata>("metadata").put({
          key: SCHEMA_MARKER_KEY,
          value: "2",
          updatedAt: MIGRATION_TIMESTAMP,
        });
      });
    this.version(3)
      .stores(DATABASE_SCHEMA_V3)
      .upgrade(async (transaction) => {
        await transaction.table<PersistedMetadata>("metadata").put({
          key: SCHEMA_MARKER_KEY,
          value: "3",
          updatedAt: MIGRATION_TIMESTAMP,
        });
      });
    this.version(4)
      .stores(DATABASE_SCHEMA_V4)
      .upgrade(async (transaction) => {
        await transaction
          .table<Record<string, unknown>>("libraryEntries")
          .toCollection()
          .modify((entry) => {
            if (!("favorite" in entry)) entry.favorite = false;
            if (!("tagIds" in entry)) entry.tagIds = [];
          });
        for (const tableName of ["notes", "quotes"] as const) {
          await transaction
            .table<Record<string, unknown>>(tableName)
            .toCollection()
            .modify((annotation) => {
              if (!("favorite" in annotation)) annotation.favorite = false;
              if (!("tagIds" in annotation)) annotation.tagIds = [];
              if (
                tableName === "quotes" &&
                typeof annotation.page === "number" &&
                !("location" in annotation)
              ) {
                annotation.location = {
                  type: "book",
                  page: annotation.page,
                };
                delete annotation.page;
              }
            });
        }
        await transaction.table<PersistedMetadata>("metadata").put({
          key: SCHEMA_MARKER_KEY,
          value: "4",
          updatedAt: MIGRATION_TIMESTAMP,
        });
      });
    this.version(5)
      .stores(DATABASE_SCHEMA_V5)
      .upgrade(async (transaction) => {
        await transaction.table<PersistedMetadata>("metadata").put({
          key: SCHEMA_MARKER_KEY,
          value: "5",
          updatedAt: MIGRATION_TIMESTAMP,
        });
      });
    this.version(6)
      .stores(DATABASE_SCHEMA_V6)
      .upgrade(async (transaction) => {
        await transaction.table<PersistedMetadata>("metadata").put({
          key: SCHEMA_MARKER_KEY,
          value: "6",
          updatedAt: MIGRATION_TIMESTAMP,
        });
      });
    this.version(7)
      .stores(DATABASE_SCHEMA_V7)
      .upgrade(async (transaction) => {
        await transaction.table<PersistedMetadata>("metadata").put({
          key: SCHEMA_MARKER_KEY,
          value: "7",
          updatedAt: MIGRATION_TIMESTAMP,
        });
      });
    this.version(8)
      .stores(DATABASE_SCHEMA_V8)
      .upgrade(async (transaction) => {
        for (const tableName of [
          "libraryEntries",
          "notes",
          "quotes",
          "activities",
          "settings",
          "metadata",
          "milestones",
          "tags",
          "sessions",
        ] as const) {
          await transaction.table(tableName).clear();
        }
        await transaction.table<PersistedMetadata>("metadata").put({
          key: SCHEMA_MARKER_KEY,
          value: "8",
          updatedAt: MIGRATION_TIMESTAMP,
        });
      });
    this.version(9)
      .stores(DATABASE_SCHEMA_V9)
      .upgrade(async (transaction) => {
        // Optional exercise plans/snapshots: preserve every v8 row verbatim.
        await transaction.table<PersistedMetadata>("metadata").put({
          key: SCHEMA_MARKER_KEY,
          value: "9",
          updatedAt: MIGRATION_TIMESTAMP,
        });
      });
    this.version(10)
      .stores(DATABASE_SCHEMA_V10)
      .upgrade(async (transaction) => {
        // Additive embedded flash cards and focus limits; keep v9 rows untouched.
        await transaction.table<PersistedMetadata>("metadata").put({
          key: SCHEMA_MARKER_KEY,
          value: "10",
          updatedAt: MIGRATION_TIMESTAMP,
        });
      });
    this.version(11)
      .stores(DATABASE_SCHEMA_V11)
      .upgrade(async (transaction) => {
        await transaction.table<PersistedMetadata>("metadata").put({
          key: SCHEMA_MARKER_KEY,
          value: "11",
          updatedAt: MIGRATION_TIMESTAMP,
        });
      });
    this.version(12)
      .stores(DATABASE_SCHEMA_V12)
      .upgrade(async (transaction) => {
        await transaction.table<PersistedMetadata>("metadata").put({
          key: SCHEMA_MARKER_KEY,
          value: "12",
          updatedAt: MIGRATION_TIMESTAMP,
        });
      });
    this.version(13)
      .stores(DATABASE_SCHEMA_V13)
      .upgrade(async (transaction) => {
        // Generalized ownership only: preserve every record, poster and relationship.
        await transaction.table<PersistedMetadata>("metadata").put({
          key: SCHEMA_MARKER_KEY,
          value: "13",
          updatedAt: MIGRATION_TIMESTAMP,
        });
      });
    this.version(14)
      .stores(DATABASE_SCHEMA_V14)
      .upgrade(async (transaction) => {
        await transaction.table<PersistedMetadata>("metadata").put({
          key: SCHEMA_MARKER_KEY,
          value: "14",
          updatedAt: MIGRATION_TIMESTAMP,
        });
      });
    this.version(15)
      .stores(DATABASE_SCHEMA_V15)
      .upgrade(async (transaction) => {
        await promoteLegacyFlashCards(transaction);
        await transaction.table<PersistedMetadata>("metadata").put({
          key: SCHEMA_MARKER_KEY,
          value: "15",
          updatedAt: MIGRATION_TIMESTAMP,
        });
      });
    this.version(16)
      .stores(DATABASE_SCHEMA_V16)
      .upgrade(async (transaction) => {
        await transaction.table<PersistedMetadata>("metadata").put({
          key: SCHEMA_MARKER_KEY,
          value: "16",
          updatedAt: MIGRATION_TIMESTAMP,
        });
      });
    this.version(17)
      .stores(DATABASE_SCHEMA_V17)
      .upgrade(async (transaction) => {
        // Optional trial snapshots/criteria/metadata; existing rows remain byte-for-byte unchanged.
        await transaction.table<PersistedMetadata>("metadata").put({
          key: SCHEMA_MARKER_KEY,
          value: "17",
          updatedAt: MIGRATION_TIMESTAMP,
        });
      });
    this.version(18)
      .stores(DATABASE_SCHEMA_V18)
      .upgrade(async (tx) => {
        await tx.table<PersistedMetadata>("metadata").put({
          key: SCHEMA_MARKER_KEY,
          value: "18",
          updatedAt: MIGRATION_TIMESTAMP,
        });
      });
  }
}
