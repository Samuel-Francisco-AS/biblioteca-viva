import type {
  BackupData,
  BackupSnapshot,
  BackupSnapshotPort,
} from "../../application";
import type { BibliotecaDatabase } from "../database/database";
import {
  persistedActivitySchema,
  persistedBookSchema,
  persistedMilestoneSchema,
  persistedNoteSchema,
  persistedQuoteSchema,
  persistedSettingSchema,
} from "../database/schema";

export class DexieBackupSnapshotStore implements BackupSnapshotPort {
  constructor(private readonly database: BibliotecaDatabase) {}

  async read(): Promise<BackupSnapshot> {
    const [libraryEntries, notes, quotes, activities, settings, milestones] =
      await this.database.transaction(
        "r",
        [
          this.database.libraryEntries,
          this.database.notes,
          this.database.quotes,
          this.database.activities,
          this.database.settings,
          this.database.milestones,
        ],
        () =>
          Promise.all([
            this.database.libraryEntries.toArray(),
            this.database.notes.toArray(),
            this.database.quotes.toArray(),
            this.database.activities.toArray(),
            this.database.settings.toArray(),
            this.database.milestones.toArray(),
          ]),
      );
    const data = {
      libraryEntries: Object.freeze(
        libraryEntries.map((item) => persistedBookSchema.parse(item)),
      ),
      milestones: Object.freeze(
        milestones.map((item) => persistedMilestoneSchema.parse(item)),
      ),
      notes: Object.freeze(
        notes.map((item) => persistedNoteSchema.parse(item)),
      ),
      quotes: Object.freeze(
        quotes.map((item) => persistedQuoteSchema.parse(item)),
      ),
      activities: Object.freeze(
        activities.map((item) => persistedActivitySchema.parse(item)),
      ),
      settings: Object.freeze(
        settings.map((item) => persistedSettingSchema.parse(item)),
      ),
    };
    return Object.freeze({
      ...data,
      isEmpty: Object.values(data).every((values) => values.length === 0),
    });
  }

  async replace(data: BackupData): Promise<void> {
    const valid = {
      libraryEntries: data.libraryEntries.map((item) =>
        persistedBookSchema.parse(item),
      ),
      notes: data.notes.map((item) => persistedNoteSchema.parse(item)),
      quotes: data.quotes.map((item) => persistedQuoteSchema.parse(item)),
      activities: data.activities.map((item) =>
        persistedActivitySchema.parse(item),
      ),
      settings: data.settings.map((item) => persistedSettingSchema.parse(item)),
      milestones: data.milestones.map((item) =>
        persistedMilestoneSchema.parse(item),
      ),
    };
    await this.database.transaction(
      "rw",
      [
        this.database.libraryEntries,
        this.database.notes,
        this.database.quotes,
        this.database.activities,
        this.database.settings,
        this.database.milestones,
      ],
      async () => {
        const existingMilestones = await this.database.milestones.toArray();
        const mergedMilestones = new Map(
          existingMilestones.map((milestone) => [milestone.id, milestone]),
        );
        for (const milestone of valid.milestones) {
          if (!mergedMilestones.has(milestone.id))
            mergedMilestones.set(milestone.id, milestone);
        }
        await Promise.all([
          this.database.libraryEntries.clear(),
          this.database.notes.clear(),
          this.database.quotes.clear(),
          this.database.activities.clear(),
          this.database.settings.clear(),
          this.database.milestones.clear(),
        ]);
        await this.database.libraryEntries.bulkAdd(valid.libraryEntries);
        await this.database.notes.bulkAdd(valid.notes);
        await this.database.quotes.bulkAdd(valid.quotes);
        await this.database.activities.bulkAdd(valid.activities);
        await this.database.settings.bulkAdd(valid.settings);
        await this.database.milestones.bulkAdd([...mergedMilestones.values()]);
      },
    );
  }
}
