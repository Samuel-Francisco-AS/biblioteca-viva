import type { BookEntry, DomainEvent, Note, Quote } from "../domain";
import type { Activity } from "./activities";

export interface LibraryEntryRepository {
  getById(id: string): Promise<BookEntry | undefined>;
  list(): Promise<readonly BookEntry[]>;
  save(entry: BookEntry): Promise<void>;
}

export interface NoteRepository {
  list(): Promise<readonly Note[]>;
  listByEntryId(entryId: string): Promise<readonly Note[]>;
  save(note: Note): Promise<void>;
}

export interface QuoteRepository {
  list(): Promise<readonly Quote[]>;
  listByEntryId(entryId: string): Promise<readonly Quote[]>;
  save(quote: Quote): Promise<void>;
}

export interface ActivityRepository {
  save(activity: Activity): Promise<void>;
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
  readonly notes: NoteRepository;
  readonly quotes: QuoteRepository;
  readonly transaction: ApplicationTransactionRunner;
}
