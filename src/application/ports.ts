import type {
  DomainEvent,
  LibraryEntry,
  Note,
  Quote,
  Session,
  Tag,
} from "../domain";
import type { Activity } from "./activities";
import type { MilestoneProcessor } from "./milestones";
export type { AudioPort, AudioSettingsPort } from "./audio";

export interface LibraryEntryRepository {
  getById(id: string): Promise<LibraryEntry | undefined>;
  list(): Promise<readonly LibraryEntry[]>;
  save(entry: LibraryEntry): Promise<void>;
}

export interface NoteRepository {
  delete(id: string): Promise<boolean>;
  getById(id: string): Promise<Note | undefined>;
  list(): Promise<readonly Note[]>;
  listByEntryId(entryId: string): Promise<readonly Note[]>;
  save(note: Note): Promise<void>;
}

export interface QuoteRepository {
  delete(id: string): Promise<boolean>;
  getById(id: string): Promise<Quote | undefined>;
  list(): Promise<readonly Quote[]>;
  listByEntryId(entryId: string): Promise<readonly Quote[]>;
  save(quote: Quote): Promise<void>;
}

export type AnnotationShareResult =
  "flow-finished" | "cancelled" | "unavailable";

export interface AnnotationSharePort {
  share(input: {
    readonly text: string;
    readonly title: string;
  }): Promise<AnnotationShareResult>;
}

export interface ActivityRepository {
  list(): Promise<readonly Activity[]>;
  save(activity: Activity): Promise<void>;
}

export interface TagRepository {
  delete(id: string): Promise<boolean>;
  getById(id: string): Promise<Tag | undefined>;
  getByNormalizedName(normalizedName: string): Promise<Tag | undefined>;
  list(): Promise<readonly Tag[]>;
  save(tag: Tag): Promise<void>;
}

export interface SessionRepository {
  delete(id: string): Promise<boolean>;
  getById(id: string): Promise<Session | undefined>;
  getOpen(): Promise<Session | undefined>;
  list(): Promise<readonly Session[]>;
  listByEntryId(entryId: string): Promise<readonly Session[]>;
  save(session: Session): Promise<void>;
}

export interface LibraryEntryDeletionStore {
  deleteLibraryEntry(id: string): Promise<"deleted" | "not-found">;
}

export interface BookDeletionStore {
  deleteBookEntry(id: string): Promise<"deleted" | "not-found">;
}

export interface IdGenerator {
  generate(): Promise<string>;
}

export interface Clock {
  now(): Promise<string>;
}

export interface ApplicationEventBus {
  publish(event: DomainEvent): Promise<void>;
}

export interface ApplicationTransactionRunner {
  run<T>(operation: () => Promise<T>): Promise<T>;
}

export interface ApplicationDependencies {
  readonly activities: ActivityRepository;
  readonly clock: Clock;
  readonly events: ApplicationEventBus;
  readonly ids: IdGenerator;
  readonly libraryEntries: LibraryEntryRepository;
  readonly milestones?: MilestoneProcessor;
  readonly notes: NoteRepository;
  readonly quotes: QuoteRepository;
  readonly sessions: SessionRepository;
  readonly tags: TagRepository;
  readonly transaction: ApplicationTransactionRunner;
}
