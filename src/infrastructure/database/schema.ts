import {
  DECORATION_IDS,
  ENTRY_STATUSES,
  MILESTONE_IDS,
  PHYSICAL_ACTIVITY_CATEGORIES,
  SESSION_STATUSES,
  STRUCTURAL_INVENTORY_FAMILY_IDS,
  STUDY_PROGRESS_UNITS,
  type BookEntry,
  type LibraryEntry,
  type Note,
  type Quote,
  type Session,
  type Tag,
} from "../../domain";
import { placedObjectSchema, type PlacedObject } from "../../application/world";
import {
  worldStructureSchema,
  type WorldStructureState,
} from "../../application/worldStructure";
import { z } from "zod";

export const DATABASE_NAME = "biblioteca-viva";
export const DATABASE_VERSION = 7;
export const SCHEMA_MARKER_KEY = "schema-version";

export const DATABASE_SCHEMA_V1 = {
  libraryEntries: "&id, createdAt",
  notes: "&id, entryId",
  quotes: "&id, entryId",
  activities: "&id, aggregateId, occurredAt, [aggregateId+occurredAt]",
} as const;

export const DATABASE_SCHEMA_V2 = {
  ...DATABASE_SCHEMA_V1,
  settings: "&key",
  metadata: "&key",
} as const;

export const DATABASE_SCHEMA_V3 = {
  ...DATABASE_SCHEMA_V2,
  milestones: "&id, reachedAt",
} as const;

export const DATABASE_SCHEMA_V4 = {
  ...DATABASE_SCHEMA_V3,
  libraryEntries: "&id, type, status, createdAt",
} as const;

export const DATABASE_SCHEMA_V5 = {
  ...DATABASE_SCHEMA_V4,
  tags: "&id,&normalizedName",
  sessions: "&id,entryId,status,startedAt",
} as const;

export const DATABASE_SCHEMA_V6 = {
  ...DATABASE_SCHEMA_V5,
  placedObjects: "&instanceId, spaceId",
} as const;

export const DATABASE_SCHEMA_V7 = {
  ...DATABASE_SCHEMA_V6,
  worldStructures: "&id",
} as const;

const isoUtc = z.iso.datetime({ offset: false });
const entityMetadata = {
  id: z.string().trim().min(1),
  createdAt: isoUtc,
  updatedAt: isoUtc,
  revision: z.int().positive(),
};

const commonEntry = {
  ...entityMetadata,
  title: z.string().trim().min(1),
  status: z.enum(ENTRY_STATUSES),
  startedAt: isoUtc.optional(),
  completedAt: isoUtc.optional(),
  favorite: z.boolean(),
  tagIds: z.array(z.string().trim().min(1)),
};

export const persistedBookSchema = z
  .strictObject({
    ...entityMetadata,
    type: z.literal("book"),
    title: z.string().trim().min(1),
    author: z.string().trim().min(1).optional(),
    status: z.enum(ENTRY_STATUSES),
    totalPages: z.int().positive().optional(),
    currentPage: z.int().nonnegative(),
    rating: z.int().min(1).max(5).optional(),
    startedAt: isoUtc.optional(),
    completedAt: isoUtc.optional(),
    favorite: z.boolean(),
    tagIds: z.array(z.string().trim().min(1)),
  })
  .superRefine((book, context) => {
    if (book.updatedAt < book.createdAt) {
      context.addIssue({
        code: "custom",
        path: ["updatedAt"],
        message: "invalid chronology",
      });
    }
    if (
      book.completedAt !== undefined &&
      book.startedAt !== undefined &&
      book.completedAt < book.startedAt
    ) {
      context.addIssue({
        code: "custom",
        path: ["completedAt"],
        message: "invalid chronology",
      });
    }
    if (book.totalPages !== undefined && book.currentPage > book.totalPages) {
      context.addIssue({
        code: "custom",
        path: ["currentPage"],
        message: "invalid progress",
      });
    }
    if (book.status === "completed") {
      if (book.completedAt === undefined) {
        context.addIssue({
          code: "custom",
          path: ["completedAt"],
          message: "required",
        });
      }
      if (
        book.totalPages !== undefined &&
        book.currentPage !== book.totalPages
      ) {
        context.addIssue({
          code: "custom",
          path: ["currentPage"],
          message: "incomplete",
        });
      }
    } else if (book.completedAt !== undefined) {
      context.addIssue({
        code: "custom",
        path: ["completedAt"],
        message: "unexpected",
      });
    }
  });

const persistedMovieSchema = z.strictObject({
  ...commonEntry,
  type: z.literal("movie"),
  director: z.string().trim().min(1).optional(),
  year: z.int().positive().optional(),
  durationMinutes: z.int().positive().optional(),
  platform: z.string().trim().min(1).optional(),
});

const persistedSeriesSchema = z
  .strictObject({
    ...commonEntry,
    type: z.literal("series"),
    platform: z.string().trim().min(1).optional(),
    episodesWatched: z.int().nonnegative(),
    totalEpisodes: z.int().positive().optional(),
    currentSeason: z.int().positive().optional(),
    currentEpisode: z.int().positive().optional(),
  })
  .superRefine((entry, context) => {
    if (
      entry.totalEpisodes !== undefined &&
      entry.episodesWatched > entry.totalEpisodes
    )
      context.addIssue({
        code: "custom",
        path: ["episodesWatched"],
        message: "invalid progress",
      });
  });

const persistedStudySchema = z
  .strictObject({
    ...commonEntry,
    type: z.literal("study"),
    area: z.string().trim().min(1).optional(),
    discipline: z.string().trim().min(1).optional(),
    objective: z.string().trim().min(1).optional(),
    progressUnit: z.enum(STUDY_PROGRESS_UNITS),
    progressCurrent: z.int().nonnegative(),
    progressTotal: z.int().positive().optional(),
    deadline: isoUtc.optional(),
  })
  .superRefine((entry, context) => {
    if (
      entry.progressTotal !== undefined &&
      entry.progressCurrent > entry.progressTotal
    )
      context.addIssue({
        code: "custom",
        path: ["progressCurrent"],
        message: "invalid progress",
      });
    if (
      entry.progressUnit === "percent" &&
      (entry.progressCurrent > 100 ||
        (entry.progressTotal !== undefined && entry.progressTotal !== 100))
    )
      context.addIssue({
        code: "custom",
        path: ["progressCurrent"],
        message: "invalid percent scale",
      });
  });

const persistedPhysicalActivitySchema = z.strictObject({
  ...commonEntry,
  type: z.literal("physical_activity"),
  category: z.enum(PHYSICAL_ACTIVITY_CATEGORIES),
  modality: z.string().trim().min(1).optional(),
  objective: z.string().trim().min(1).optional(),
});

const persistedWorkSchema = z.strictObject({
  ...commonEntry,
  type: z.literal("work"),
  area: z.string().trim().min(1).optional(),
  organization: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  deadline: isoUtc.optional(),
  nextAction: z.string().trim().min(1).optional(),
});

export const persistedLibraryEntrySchema = z
  .discriminatedUnion("type", [
    persistedBookSchema,
    persistedMovieSchema,
    persistedSeriesSchema,
    persistedStudySchema,
    persistedPhysicalActivitySchema,
    persistedWorkSchema,
  ])
  .superRefine((entry, context) => {
    if (entry.updatedAt < entry.createdAt)
      context.addIssue({
        code: "custom",
        path: ["updatedAt"],
        message: "invalid chronology",
      });
    if (
      entry.completedAt !== undefined &&
      entry.startedAt !== undefined &&
      entry.completedAt < entry.startedAt
    )
      context.addIssue({
        code: "custom",
        path: ["completedAt"],
        message: "invalid chronology",
      });
    if (entry.status === "completed" && entry.completedAt === undefined)
      context.addIssue({
        code: "custom",
        path: ["completedAt"],
        message: "required",
      });
    if (entry.status !== "completed" && entry.completedAt !== undefined)
      context.addIssue({
        code: "custom",
        path: ["completedAt"],
        message: "unexpected",
      });
  });

export const persistedAnnotationLocationSchema = z
  .discriminatedUnion("type", [
    z.strictObject({ type: z.literal("book"), page: z.int().positive() }),
    z.strictObject({ type: z.literal("movie"), minute: z.int().nonnegative() }),
    z.strictObject({
      type: z.literal("series"),
      season: z.int().positive(),
      episode: z.int().positive(),
      minute: z.int().nonnegative().optional(),
    }),
    z.strictObject({
      type: z.literal("study"),
      module: z.string().trim().min(1).optional(),
      topic: z.string().trim().min(1).optional(),
    }),
  ])
  .superRefine((location, context) => {
    if (
      location.type === "study" &&
      location.module === undefined &&
      location.topic === undefined
    )
      context.addIssue({
        code: "custom",
        path: ["module"],
        message: "module or topic required",
      });
  });

export const persistedNoteSchema = z.strictObject({
  ...entityMetadata,
  entryId: z.string().trim().min(1),
  content: z.string().trim().min(1),
  favorite: z.boolean(),
  tagIds: z.array(z.string().trim().min(1)),
  location: persistedAnnotationLocationSchema.optional(),
});

export const persistedQuoteSchema = persistedNoteSchema;

export const persistedTagSchema = z.strictObject({
  ...entityMetadata,
  name: z.string().trim().min(1),
  normalizedName: z.string().trim().min(1),
});

const sessionMetadata = {
  ...entityMetadata,
  entryId: z.string().trim().min(1),
  status: z.enum(SESSION_STATUSES),
  startedAt: isoUtc,
  endedAt: isoUtc.optional(),
  accumulatedDuration: z.int().nonnegative(),
  activeSince: isoUtc.optional(),
  note: z.string().trim().min(1).optional(),
};

export const persistedSessionSchema = z
  .discriminatedUnion("kind", [
    z.strictObject({
      ...sessionMetadata,
      kind: z.literal("reading"),
      entryType: z.literal("book"),
      startPage: z.int().positive().optional(),
      endPage: z.int().positive().optional(),
    }),
    z.strictObject({
      ...sessionMetadata,
      kind: z.literal("viewing"),
      entryType: z.enum(["movie", "series"]),
      watchedDuration: z.int().nonnegative().optional(),
      episodesCompleted: z.int().nonnegative().optional(),
    }),
    z.strictObject({
      ...sessionMetadata,
      kind: z.literal("study"),
      entryType: z.literal("study"),
    }),
    z.strictObject({
      ...sessionMetadata,
      kind: z.literal("physical_activity"),
      entryType: z.literal("physical_activity"),
      distanceMeters: z.int().nonnegative().optional(),
      perceivedExertion: z.int().min(1).max(10).optional(),
    }),
    z.strictObject({
      ...sessionMetadata,
      kind: z.literal("work"),
      entryType: z.literal("work"),
      result: z.string().trim().min(1).optional(),
    }),
  ])
  .superRefine((session, context) => {
    if (session.status === "active" && session.activeSince === undefined)
      context.addIssue({
        code: "custom",
        path: ["activeSince"],
        message: "required",
      });
    if (session.status !== "active" && session.activeSince !== undefined)
      context.addIssue({
        code: "custom",
        path: ["activeSince"],
        message: "unexpected",
      });
    if (session.status === "completed" && session.endedAt === undefined)
      context.addIssue({
        code: "custom",
        path: ["endedAt"],
        message: "required",
      });
    if (session.status !== "completed" && session.endedAt !== undefined)
      context.addIssue({
        code: "custom",
        path: ["endedAt"],
        message: "unexpected",
      });
  });

const activityMetadata = {
  id: z.string().trim().min(1),
  aggregateId: z.string().trim().min(1),
  occurredAt: isoUtc,
  revision: z.int().positive(),
};

export const persistedActivitySchema = z.discriminatedUnion("type", [
  z.strictObject({
    ...activityMetadata,
    type: z.literal("entry_created"),
    metadata: z.strictObject({
      entryType: z.enum([
        "book",
        "movie",
        "series",
        "study",
        "physical_activity",
        "work",
      ]),
      status: z.enum(ENTRY_STATUSES),
    }),
  }),
  z.strictObject({
    ...activityMetadata,
    type: z.literal("entry_updated"),
    metadata: z.strictObject({
      entryType: z.enum([
        "book",
        "movie",
        "series",
        "study",
        "physical_activity",
        "work",
      ]),
      changedFields: z.array(z.string().min(1)).min(1),
    }),
  }),
  z.strictObject({
    ...activityMetadata,
    type: z.literal("book_created"),
    metadata: z.strictObject({ status: z.enum(ENTRY_STATUSES) }),
  }),
  z.strictObject({
    ...activityMetadata,
    type: z.literal("book_updated"),
    metadata: z.strictObject({
      changedFields: z.array(z.string().min(1)).min(1),
    }),
  }),
  z.strictObject({
    ...activityMetadata,
    type: z.literal("progress_updated"),
    metadata: z.strictObject({
      currentPage: z.int().nonnegative(),
      totalPages: z.int().positive().optional(),
    }),
  }),
  z.strictObject({
    ...activityMetadata,
    type: z.literal("status_changed"),
    metadata: z.strictObject({
      from: z.enum(ENTRY_STATUSES),
      to: z.enum(ENTRY_STATUSES),
    }),
  }),
  z.strictObject({
    ...activityMetadata,
    type: z.literal("note_added"),
    metadata: z.strictObject({ noteId: z.string().trim().min(1) }),
  }),
  z.strictObject({
    ...activityMetadata,
    type: z.literal("quote_added"),
    metadata: z.strictObject({
      quoteId: z.string().trim().min(1),
      page: z.int().positive().optional(),
    }),
  }),
  z.strictObject({
    ...activityMetadata,
    type: z.literal("session_started"),
    metadata: z.strictObject({
      sessionId: z.string().trim().min(1),
      entryType: z.enum([
        "book",
        "movie",
        "series",
        "study",
        "physical_activity",
        "work",
      ]),
    }),
  }),
  z.strictObject({
    ...activityMetadata,
    type: z.literal("session_completed"),
    metadata: z.strictObject({
      sessionId: z.string().trim().min(1),
      entryType: z.enum([
        "book",
        "movie",
        "series",
        "study",
        "physical_activity",
        "work",
      ]),
      duration: z.int().nonnegative(),
    }),
  }),
]);

export const persistedMetadataSchema = z.strictObject({
  key: z.string().trim().min(1),
  value: z.string(),
  updatedAt: isoUtc,
});

export const persistedSettingSchema = z.strictObject({
  key: z.string().trim().min(1),
  value: z.unknown(),
  updatedAt: isoUtc,
});

export const persistedMilestoneSchema = z.strictObject({
  id: z.enum(MILESTONE_IDS),
  reachedAt: isoUtc,
  rewards: z.array(
    z.discriminatedUnion("type", [
      z.strictObject({
        decorationId: z.enum(DECORATION_IDS).optional(),
        id: z.string().trim().min(1),
        type: z.literal("decoration"),
      }),
      z.strictObject({
        familyId: z.enum(STRUCTURAL_INVENTORY_FAMILY_IDS),
        id: z.string().trim().min(1),
        quantity: z.int().positive(),
        type: z.literal("structure-grant"),
      }),
    ]),
  ),
  ruleVersion: z.int().positive(),
  source: z.strictObject({
    eventId: z.string().trim().min(1),
    eventType: z.enum([
      "LibraryEntryCreated",
      "NoteCreated",
      "QuoteCreated",
      "LibraryEntryCompleted",
      "SessionChanged",
    ]),
  }),
});

export const persistedPlacedObjectSchema = placedObjectSchema;
export const persistedWorldStructureSchema = worldStructureSchema;

export type PersistedBook = BookEntry;
export type PersistedLibraryEntry = LibraryEntry;
export type PersistedNote = Note;
export type PersistedQuote = Quote;
export type PersistedTag = Tag;
export type PersistedSession = Session;
export type PersistedActivity = z.infer<typeof persistedActivitySchema>;
export type PersistedMetadata = z.infer<typeof persistedMetadataSchema>;
export type PersistedSetting = z.infer<typeof persistedSettingSchema>;
export type PersistedMilestone = z.infer<typeof persistedMilestoneSchema>;
export type PersistedPlacedObject = PlacedObject;
export type PersistedWorldStructure = WorldStructureState;
