import { cardMediaSchema } from "../database/cardMedia";
import {
  arcanariumDataSchema,
  emptyArcanarium,
  validateArcanarium,
} from "../../domain/arcanarium";
import { DexieArcanariumRepository } from "../database/arcanariumRepository";
import { promoteLegacyFlashCards } from "../database/promoteLegacyFlashCards";
import { validateBackupData } from "./backupCodec";
import { posterSchema } from "../database/media";
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
  persistedSessionSchema,
  persistedSettingSchema,
  persistedTagSchema,
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
      media,
      arcanarium,
      cardMedia,
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
        this.database.media,
        this.database.arcanariumCards,
        this.database.arcanariumVersions,
        this.database.arcanariumDecks,
        this.database.studyCardLinks,
        this.database.knowledgeTags,
        this.database.cardSessions,
        this.database.cardMedia,
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
          this.database.media.toArray(),
          new DexieArcanariumRepository(this.database).read(),
          this.database.cardMedia.toArray(),
        ]),
    );
    const data: BackupData = {
      arcanarium,
      cardMedia: cardMedia.map((m) => cardMediaSchema.parse(m)),
      media: Object.freeze(media.map((p) => posterSchema.parse(p))),
      libraryEntries: Object.freeze(
        libraryEntries.map((item) => persistedLibraryEntrySchema.parse(item)),
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
      milestones: Object.freeze(
        milestones.map((item) => persistedMilestoneSchema.parse(item)),
      ),
      tags: Object.freeze(tags.map((item) => persistedTagSchema.parse(item))),
      sessions: Object.freeze(
        sessions.map((item) => persistedSessionSchema.parse(item)),
      ),
    };
    return Object.freeze({ ...data, isEmpty: !hasRelevantRestoreData(data) });
  }

  async replace(data: BackupData): Promise<void> {
    const valid = {
      cardMedia: (data.cardMedia ?? []).map((m) => cardMediaSchema.parse(m)),
      arcanarium: arcanariumDataSchema.parse(
        data.arcanarium ?? emptyArcanarium(),
      ),
      media: (data.media ?? []).map((p) => posterSchema.parse(p)),
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
    };
    validateBackupData({
      ...valid,
      arcanarium: data.arcanarium === undefined ? undefined : valid.arcanarium,
    });
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
        this.database.media,
        this.database.arcanariumCards,
        this.database.arcanariumVersions,
        this.database.arcanariumDecks,
        this.database.studyCardLinks,
        this.database.knowledgeTags,
        this.database.cardSessions,
        this.database.cardMedia,
      ],
      async (transaction) => {
        await Promise.all([
          this.database.arcanariumCards.clear(),
          this.database.arcanariumVersions.clear(),
          this.database.arcanariumDecks.clear(),
          this.database.studyCardLinks.clear(),
          this.database.knowledgeTags.clear(),
          this.database.cardSessions.clear(),
          this.database.cardMedia.clear(),
          this.database.libraryEntries.clear(),
          this.database.notes.clear(),
          this.database.quotes.clear(),
          this.database.activities.clear(),
          this.database.settings.clear(),
          this.database.milestones.clear(),
          this.database.tags.clear(),
          this.database.sessions.clear(),
          this.database.media.clear(),
        ]);
        await this.database.libraryEntries.bulkAdd(valid.libraryEntries);
        await this.database.notes.bulkAdd(valid.notes);
        await this.database.quotes.bulkAdd(valid.quotes);
        await this.database.activities.bulkAdd(valid.activities);
        await this.database.settings.bulkAdd(valid.settings);
        await this.database.milestones.bulkAdd(valid.milestones);
        await this.database.tags.bulkAdd(valid.tags);
        await this.database.sessions.bulkAdd(valid.sessions);
        await this.database.media.bulkAdd(valid.media);
        await this.database.cardMedia.bulkAdd(valid.cardMedia);
        await this.database.arcanariumCards.bulkAdd(valid.arcanarium.cards);
        await this.database.arcanariumVersions.bulkAdd(
          valid.arcanarium.versions,
        );
        await this.database.arcanariumDecks.bulkAdd(valid.arcanarium.decks);
        await this.database.studyCardLinks.bulkAdd(valid.arcanarium.studyLinks);
        await this.database.knowledgeTags.bulkAdd(valid.arcanarium.tags);
        await this.database.cardSessions.bulkAdd(valid.arcanarium.sessions);
        await promoteLegacyFlashCards(transaction);
        validateArcanarium(
          await new DexieArcanariumRepository(this.database).read(),
          new Set(
            valid.libraryEntries
              .filter((entry) => entry.type === "study")
              .map((entry) => entry.id),
          ),
        );
      },
    );
  }
}
