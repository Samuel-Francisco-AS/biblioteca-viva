import {
  updateNote,
  updateQuote,
  type BookEntry,
  type LibraryEntry,
  type Note,
  type Quote,
} from "../domain";
import { ApplicationError, persistenceFailed } from "./errors";
import {
  applyDomain,
  currentTime,
  parseInput,
  runTransaction,
  saveEntity,
} from "./internal";
import type {
  AnnotationSharePort,
  ApplicationTransactionRunner,
  LibraryEntryRepository,
  NoteRepository,
  QuoteRepository,
} from "./ports";
import {
  annotationIdSchema,
  updateNoteSchema,
  updateQuoteSchema,
} from "./schemas";

type NoteDependencies = {
  readonly clock: { now(): Promise<string> };
  readonly notes: NoteRepository;
  readonly transaction: ApplicationTransactionRunner;
};

type QuoteDependencies = {
  readonly clock: { now(): Promise<string> };
  readonly libraryEntries: LibraryEntryRepository;
  readonly quotes: QuoteRepository;
  readonly transaction: ApplicationTransactionRunner;
};

function annotationNotFound(kind: "nota" | "citação"): ApplicationError {
  return new ApplicationError("NOT_FOUND", `${kind} não encontrada.`, {
    field: "id",
    operation: kind === "nota" ? "get_note" : "get_quote",
  });
}

async function loadNote(repository: NoteRepository, id: string): Promise<Note> {
  try {
    const note = await repository.getById(id);
    if (!note) throw annotationNotFound("nota");
    return note;
  } catch (error: unknown) {
    if (error instanceof ApplicationError) throw error;
    throw persistenceFailed("get_note");
  }
}

async function loadQuote(
  repository: QuoteRepository,
  id: string,
): Promise<Quote> {
  try {
    const quote = await repository.getById(id);
    if (!quote) throw annotationNotFound("citação");
    return quote;
  } catch (error: unknown) {
    if (error instanceof ApplicationError) throw error;
    throw persistenceFailed("get_quote");
  }
}

async function loadRelatedEntry(
  repository: LibraryEntryRepository,
  entryId: string,
): Promise<LibraryEntry> {
  try {
    const entry = await repository.getById(entryId);
    if (!entry)
      throw new ApplicationError(
        "NOT_FOUND",
        "Registro relacionado não encontrado.",
      );
    return entry;
  } catch (error: unknown) {
    if (error instanceof ApplicationError) throw error;
    throw persistenceFailed("get_entry");
  }
}

export class UpdateNote {
  constructor(private readonly dependencies: NoteDependencies) {}

  async execute(input: unknown): Promise<Note> {
    const parsed = parseInput(updateNoteSchema, input);
    const existing = await loadNote(this.dependencies.notes, parsed.id);
    const occurredAt = await currentTime(this.dependencies);
    const updated = applyDomain(() =>
      updateNote(existing, { content: parsed.content, updatedAt: occurredAt }),
    );
    await runTransaction(this.dependencies, () =>
      saveEntity(() => this.dependencies.notes.save(updated), "save_note"),
    );
    return updated;
  }
}

export class UpdateQuote {
  constructor(private readonly dependencies: QuoteDependencies) {}

  async execute(input: unknown): Promise<Quote> {
    const parsed = parseInput(updateQuoteSchema, input);
    const existing = await loadQuote(this.dependencies.quotes, parsed.id);
    const entry = await loadRelatedEntry(
      this.dependencies.libraryEntries,
      existing.entryId,
    );
    if (entry.type === "physical_activity" || entry.type === "work")
      throw new ApplicationError(
        "VALIDATION_FAILED",
        "Citações estão disponíveis para livros, filmes, séries e estudos.",
      );
    const occurredAt = await currentTime(this.dependencies);
    const updated = applyDomain(() =>
      updateQuote(
        existing,
        {
          content: parsed.content,
          updatedAt: occurredAt,
          ...(parsed.location !== undefined
            ? { location: parsed.location }
            : parsed.page !== undefined && {
                location: { type: "book", page: parsed.page },
              }),
        },
        entry.type === "book" ? entry : undefined,
      ),
    );
    await runTransaction(this.dependencies, () =>
      saveEntity(() => this.dependencies.quotes.save(updated), "save_quote"),
    );
    return updated;
  }
}

export class DeleteNote {
  constructor(
    private readonly dependencies: Pick<
      NoteDependencies,
      "notes" | "transaction"
    >,
  ) {}

  async execute(input: unknown): Promise<{ readonly deleted: true }> {
    const { id } = parseInput(annotationIdSchema, input);
    await loadNote(this.dependencies.notes, id);
    await runTransaction(this.dependencies, async () => {
      if (!(await this.dependencies.notes.delete(id)))
        throw annotationNotFound("nota");
    });
    return Object.freeze({ deleted: true as const });
  }
}

export class DeleteQuote {
  constructor(
    private readonly dependencies: Pick<
      QuoteDependencies,
      "quotes" | "transaction"
    >,
  ) {}

  async execute(input: unknown): Promise<{ readonly deleted: true }> {
    const { id } = parseInput(annotationIdSchema, input);
    await loadQuote(this.dependencies.quotes, id);
    await runTransaction(this.dependencies, async () => {
      if (!(await this.dependencies.quotes.delete(id)))
        throw annotationNotFound("citação");
    });
    return Object.freeze({ deleted: true as const });
  }
}

async function deliverShare(
  share: AnnotationSharePort,
  input: { readonly text: string; readonly title: string },
) {
  try {
    const result = await share.share(input);
    if (result === "unavailable")
      throw new ApplicationError(
        "SHARE_UNAVAILABLE",
        "O compartilhamento não está disponível nesta plataforma.",
      );
    return result;
  } catch (error: unknown) {
    if (error instanceof ApplicationError) throw error;
    throw new ApplicationError(
      "SHARE_FAILED",
      "Não foi possível abrir o compartilhamento.",
    );
  }
}

function bookReference(book: BookEntry): string {
  return `${book.title}${book.author ? ` — ${book.author}` : ""}`;
}

function entryReference(entry: LibraryEntry): string {
  return entry.type === "book" ? bookReference(entry) : entry.title;
}

export class ShareNote {
  constructor(
    private readonly notes: NoteRepository,
    private readonly books: LibraryEntryRepository,
    private readonly share: AnnotationSharePort,
  ) {}

  async execute(input: unknown) {
    const { id } = parseInput(annotationIdSchema, input);
    const note = await loadNote(this.notes, id);
    const entry = await loadRelatedEntry(this.books, note.entryId);
    return deliverShare(this.share, {
      title: "Compartilhar nota de leitura",
      text: `Nota do registro\n${entryReference(entry)}\n\n${note.content}`,
    });
  }
}

export class ShareQuote {
  constructor(
    private readonly quotes: QuoteRepository,
    private readonly books: LibraryEntryRepository,
    private readonly share: AnnotationSharePort,
  ) {}

  async execute(input: unknown) {
    const { id } = parseInput(annotationIdSchema, input);
    const quote = await loadQuote(this.quotes, id);
    const entry = await loadRelatedEntry(this.books, quote.entryId);
    const page =
      quote.location?.type === "book" ? quote.location.page : undefined;
    return deliverShare(this.share, {
      title: "Compartilhar citação de leitura",
      text: `Citação do registro\n${entryReference(entry)}${page === undefined ? "" : `\nPágina ${page}`}\n\n“${quote.content}”`,
    });
  }
}
