import Dexie, { type EntityTable } from "dexie";

import {
  DATABASE_NAME,
  DATABASE_SCHEMA_V1,
  DATABASE_SCHEMA_V2,
  DATABASE_SCHEMA_V3,
  DATABASE_SCHEMA_V4,
  DATABASE_SCHEMA_V5,
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
  }
}
