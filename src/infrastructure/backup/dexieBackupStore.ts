import type {
  BackupData,
  BackupSnapshot,
  BackupSnapshotPort,
} from "../../application";
import { hasRelevantRestoreData } from "../../application";
import type { BibliotecaDatabase } from "../database/database";
import {
  persistedActivitySchema,
  persistedLibraryEntrySchema,
  persistedMilestoneSchema,
  persistedNoteSchema,
  persistedQuoteSchema,
  persistedSettingSchema,
  persistedSessionSchema,
  persistedTagSchema,
  persistedPlacedObjectSchema,
  persistedWorldStructureSchema,
} from "../database/schema";

export class DexieBackupSnapshotStore implements BackupSnapshotPort {
  constructor(private readonly database: BibliotecaDatabase) {}

  async read(): Promise<BackupSnapshot> {
    const [
      libraryEntries,
      notes,
      quotes,
      activities,
      settings,
      milestones,
      tags,
      sessions,
      placedObjects,
      worldStructures,
    ] = await this.database.transaction(
      "r",
      [
        this.database.libraryEntries,
        this.database.notes,
        this.database.quotes,
        this.database.activities,
        this.database.settings,
        this.database.milestones,
        this.database.tags,
        this.database.sessions,
        this.database.placedObjects,
        this.database.worldStructures,
      ],
      () =>
        Promise.all([
          this.database.libraryEntries.toArray(),
          this.database.notes.toArray(),
          this.database.quotes.toArray(),
          this.database.activities.toArray(),
          this.database.settings.toArray(),
          this.database.milestones.toArray(),
          this.database.tags.toArray(),
          this.database.sessions.toArray(),
          this.database.placedObjects.toArray(),
          this.database.worldStructures.toArray(),
        ]),
    );
    const data = {
      libraryEntries: Object.freeze(
        libraryEntries.map((item) => persistedLibraryEntrySchema.parse(item)),
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
      tags: Object.freeze(tags.map((item) => persistedTagSchema.parse(item))),
      sessions: Object.freeze(
        sessions.map((item) => persistedSessionSchema.parse(item)),
      ),
      placedObjects: Object.freeze(
        placedObjects.map((item) => persistedPlacedObjectSchema.parse(item)),
      ),
      ...(worldStructures.length > 0 && {
        worldStructure: persistedWorldStructureSchema.parse(worldStructures[0]),
      }),
    };
    return Object.freeze({
      ...data,
      isEmpty: !hasRelevantRestoreData(data),
    });
  }

  async replace(data: BackupData): Promise<void> {
    const valid = {
      libraryEntries: data.libraryEntries.map((item) =>
        persistedLibraryEntrySchema.parse(item),
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
      tags: data.tags.map((item) => persistedTagSchema.parse(item)),
      sessions: data.sessions.map((item) => persistedSessionSchema.parse(item)),
      placedObjects: (data.placedObjects ?? []).map((item) =>
        persistedPlacedObjectSchema.parse(item),
      ),
      ...(data.worldStructure && {
        worldStructure: persistedWorldStructureSchema.parse(
          data.worldStructure,
        ),
      }),
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
        this.database.tags,
        this.database.sessions,
        this.database.placedObjects,
        this.database.worldStructures,
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
          this.database.tags.clear(),
          this.database.sessions.clear(),
          this.database.placedObjects.clear(),
          this.database.worldStructures.clear(),
        ]);
        await this.database.libraryEntries.bulkAdd(valid.libraryEntries);
        await this.database.notes.bulkAdd(valid.notes);
        await this.database.quotes.bulkAdd(valid.quotes);
        await this.database.activities.bulkAdd(valid.activities);
        await this.database.settings.bulkAdd(valid.settings);
        await this.database.milestones.bulkAdd([...mergedMilestones.values()]);
        await this.database.tags.bulkAdd(valid.tags);
        await this.database.sessions.bulkAdd(valid.sessions);
        await this.database.placedObjects.bulkAdd(valid.placedObjects);
        if (valid.worldStructure)
          await this.database.worldStructures.add(valid.worldStructure);
      },
    );
  }
}
