import { DECORATION_IDS, ENTRY_STATUSES, MILESTONE_IDS } from "../../domain";
import { z } from "zod";

export const DATABASE_NAME = "biblioteca-viva";
export const DATABASE_VERSION = 3;
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

const isoUtc = z.iso.datetime({ offset: false });
const entityMetadata = {
  id: z.string().trim().min(1),
  createdAt: isoUtc,
  updatedAt: isoUtc,
  revision: z.int().positive(),
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

export const persistedNoteSchema = z.strictObject({
  ...entityMetadata,
  entryId: z.string().trim().min(1),
  content: z.string().trim().min(1),
});

export const persistedQuoteSchema = persistedNoteSchema.extend({
  page: z.int().positive().optional(),
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
    z.strictObject({
      decorationId: z.enum(DECORATION_IDS).optional(),
      id: z.string().trim().min(1),
      type: z.literal("decoration"),
    }),
  ),
  ruleVersion: z.int().positive(),
  source: z.strictObject({
    eventId: z.string().trim().min(1),
    eventType: z.enum([
      "LibraryEntryCreated",
      "NoteCreated",
      "QuoteCreated",
      "LibraryEntryCompleted",
    ]),
  }),
});

export type PersistedBook = z.infer<typeof persistedBookSchema>;
export type PersistedNote = z.infer<typeof persistedNoteSchema>;
export type PersistedQuote = z.infer<typeof persistedQuoteSchema>;
export type PersistedActivity = z.infer<typeof persistedActivitySchema>;
export type PersistedMetadata = z.infer<typeof persistedMetadataSchema>;
export type PersistedSetting = z.infer<typeof persistedSettingSchema>;
export type PersistedMilestone = z.infer<typeof persistedMilestoneSchema>;
