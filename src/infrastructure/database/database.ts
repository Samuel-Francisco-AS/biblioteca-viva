import Dexie, { type EntityTable } from "dexie";

import {
  DATABASE_NAME,
  DATABASE_SCHEMA_V1,
  DATABASE_SCHEMA_V2,
  SCHEMA_MARKER_KEY,
  type PersistedActivity,
  type PersistedBook,
  type PersistedMetadata,
  type PersistedNote,
  type PersistedQuote,
  type PersistedSetting,
} from "./schema";

const MIGRATION_TIMESTAMP = "1970-01-01T00:00:00.000Z";

export class BibliotecaDatabase extends Dexie {
  libraryEntries!: EntityTable<PersistedBook, "id">;
  notes!: EntityTable<PersistedNote, "id">;
  quotes!: EntityTable<PersistedQuote, "id">;
  activities!: EntityTable<PersistedActivity, "id">;
  settings!: EntityTable<PersistedSetting, "key">;
  metadata!: EntityTable<PersistedMetadata, "key">;

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
  }
}
