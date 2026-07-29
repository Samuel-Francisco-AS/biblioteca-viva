export const ENTRY_STATUSES = [
  "planned",
  "in_progress",
  "paused",
  "completed",
  "abandoned",
] as const;

export type EntryStatus = (typeof ENTRY_STATUSES)[number];

export interface EntityMetadata {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly revision: number;
}

export interface BookEntry extends EntityMetadata {
  readonly type: "book";
  readonly title: string;
  readonly author?: string;
  readonly status: EntryStatus;
  readonly totalPages?: number;
  readonly currentPage: number;
  readonly rating?: number;
  readonly startedAt?: string;
  readonly completedAt?: string;
}

export type LibraryEntry = BookEntry;

export interface Note extends EntityMetadata {
  readonly entryId: string;
  readonly content: string;
}

export interface Quote extends EntityMetadata {
  readonly entryId: string;
  readonly content: string;
  readonly page?: number;
}

export interface CreateBookInput {
  readonly id: string;
  readonly title: string;
  readonly author?: string;
  readonly status?: EntryStatus;
  readonly totalPages?: number;
  readonly currentPage?: number;
  readonly rating?: number;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly createdAt: string;
}

export interface UpdateBibliographicDataInput {
  readonly title?: string;
  readonly author?: string;
  readonly totalPages?: number | null;
  readonly rating?: number | null;
  readonly updatedAt: string;
}

export interface CreateAnnotationInput {
  readonly id: string;
  readonly entryId: string;
  readonly content: string;
  readonly createdAt: string;
}

export interface CreateQuoteInput extends CreateAnnotationInput {
  readonly page?: number;
}
