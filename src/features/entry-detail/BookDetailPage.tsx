import { useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import type { BookEntry, Note, Quote } from "../../domain";
import type { AnnotationShareResult } from "../../application";
import { AnnotationActions } from "../annotations/AnnotationActions";
import { presentApplicationError } from "../entry-editor/errorMessages";
import {
  formatDate,
  formatDateTime,
  progressText,
  progressPercentage,
  remainingPages,
  statusLabels,
} from "../books/bookPresentation";
import { safeReturnPath } from "../books/navigationOrigin";
import { NoteForm, QuoteForm } from "./AnnotationForms";
import { ProgressForm } from "./ProgressForm";
import { StatusActions } from "./StatusActions";

export interface BookDetailApplication {
  readonly commands: {
    readonly addNote: { execute(input: unknown): Promise<Note> };
    readonly addQuote: { execute(input: unknown): Promise<Quote> };
    readonly changeBookStatus: { execute(input: unknown): Promise<BookEntry> };
    readonly deleteBookEntry: {
      execute(input: unknown): Promise<{ readonly deleted: true }>;
    };
    readonly deleteNote: {
      execute(input: unknown): Promise<{ readonly deleted: true }>;
    };
    readonly deleteQuote: {
      execute(input: unknown): Promise<{ readonly deleted: true }>;
    };
    readonly shareNote: {
      execute(input: unknown): Promise<AnnotationShareResult>;
    };
    readonly shareQuote: {
      execute(input: unknown): Promise<AnnotationShareResult>;
    };
    readonly updateNote: { execute(input: unknown): Promise<Note> };
    readonly updateQuote: { execute(input: unknown): Promise<Quote> };
    readonly updateBookProgress: {
      execute(input: unknown): Promise<BookEntry>;
    };
  };
  readonly queries: {
    readonly getBookEntry: { execute(input: unknown): Promise<BookEntry> };
    readonly listNotesByBook: {
      execute(input: unknown): Promise<readonly Note[]>;
    };
    readonly listQuotesByBook: {
      execute(input: unknown): Promise<readonly Quote[]>;
    };
  };
}

function History({
  notes,
  quotes,
  totalPages,
  onDeleteNote,
  onDeleteQuote,
  onShareNote,
  onShareQuote,
  onUpdateNote,
  onUpdateQuote,
}: {
  readonly notes: readonly Note[];
  readonly quotes: readonly Quote[];
  readonly totalPages?: number;
  readonly onDeleteNote: (id: string) => Promise<void>;
  readonly onDeleteQuote: (id: string) => Promise<void>;
  readonly onShareNote: (id: string) => Promise<AnnotationShareResult>;
  readonly onShareQuote: (id: string) => Promise<AnnotationShareResult>;
  readonly onUpdateNote: (input: unknown) => Promise<void>;
  readonly onUpdateQuote: (input: unknown) => Promise<void>;
}) {
  return (
    <div className="history-grid">
      <section aria-labelledby="notes-history-title">
        <h3 id="notes-history-title">Notas salvas</h3>
        {notes.length === 0 ? (
          <p>Nenhuma nota adicionada.</p>
        ) : (
          <ul className="annotation-list">
            {notes.map((note) => (
              <li key={note.id}>
                <article>
                  <h4>Nota</h4>
                  <p>{note.content}</p>
                  <p className="annotation-date">
                    Adicionada em {formatDateTime(note.createdAt)}
                  </p>
                  <AnnotationActions
                    annotation={note}
                    kind="note"
                    onDelete={onDeleteNote}
                    onShare={onShareNote}
                    onUpdate={onUpdateNote}
                  />
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="quotes-history-title">
        <h3 id="quotes-history-title">Citações salvas</h3>
        {quotes.length === 0 ? (
          <p>Nenhuma citação adicionada.</p>
        ) : (
          <ul className="annotation-list">
            {quotes.map((quote) => (
              <li key={quote.id}>
                <article>
                  <h4>Citação</h4>
                  <blockquote>{quote.content}</blockquote>
                  {quote.location?.type === "book" && (
                    <p>Página {quote.location.page}</p>
                  )}
                  <p className="annotation-date">
                    Adicionada em {formatDateTime(quote.createdAt)}
                  </p>
                  <AnnotationActions
                    annotation={quote}
                    kind="quote"
                    onDelete={onDeleteQuote}
                    onShare={onShareQuote}
                    onUpdate={onUpdateQuote}
                    {...(totalPages !== undefined && { totalPages })}
                  />
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ProgressSummary({ book }: { readonly book: BookEntry }) {
  const percentage = progressPercentage(book);
  const remaining = remainingPages(book);
  if (
    book.totalPages === undefined ||
    percentage === undefined ||
    remaining === undefined
  ) {
    return (
      <div className="reading-progress">
        <p>
          Página atual: <strong>{book.currentPage}</strong>
        </p>
        <p>O total de páginas não foi definido.</p>
      </div>
    );
  }
  const currentPage = Math.min(book.currentPage, book.totalPages);
  return (
    <div className="reading-progress">
      <label htmlFor={`book-${book.id}-detail-progress`}>
        <strong>{percentage}% concluído</strong>
      </label>
      <progress
        id={`book-${book.id}-detail-progress`}
        max={book.totalPages}
        value={currentPage}
      />
      <p>
        {currentPage} de {book.totalPages} páginas
      </p>
      <p>
        {remaining} {remaining === 1 ? "página restante" : "páginas restantes"}
      </p>
    </div>
  );
}

export function BookDetailPage({
  application,
}: {
  readonly application?: BookDetailApplication;
}) {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnPath = safeReturnPath(searchParams.get("from"));
  const [book, setBook] = useState<BookEntry>();
  const [notes, setNotes] = useState<readonly Note[]>();
  const [quotes, setQuotes] = useState<readonly Quote[]>();
  const [loadError, setLoadError] = useState<string>();
  const [notFound, setNotFound] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [confirmingDeletion, setConfirmingDeletion] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const deletionInProgressRef = useRef(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const deletionConfirmationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!application) return;
    let active = true;
    void Promise.all([
      application.queries.getBookEntry.execute({ id }),
      application.queries.listNotesByBook.execute({ id }),
      application.queries.listQuotesByBook.execute({ id }),
    ]).then(
      ([loadedBook, loadedNotes, loadedQuotes]) => {
        if (!active) return;
        setBook(loadedBook);
        setNotes(loadedNotes);
        setQuotes(loadedQuotes);
      },
      (failure: unknown) => {
        if (!active) return;
        const presented = presentApplicationError(failure);
        setNotFound(presented.message === "Este livro não foi encontrado.");
        setLoadError(presented.message);
      },
    );
    return () => {
      active = false;
    };
  }, [application, id]);

  if (!application) {
    return (
      <section className="content-card" role="alert">
        <h2>Detalhe indisponível</h2>
        <p>Não foi possível iniciar o armazenamento local.</p>
      </section>
    );
  }
  if (loadError) {
    return (
      <section className="content-card" role="alert">
        <h2>
          {notFound ? "Livro não encontrado" : "Não foi possível abrir o livro"}
        </h2>
        <p>{loadError}</p>
        <Link className="text-link" to={returnPath}>
          {returnPath.startsWith("/arquivo")
            ? "Voltar ao Arquivo"
            : "Voltar à Coleção"}
        </Link>
      </section>
    );
  }
  if (!book || !notes || !quotes) return <p role="status">Carregando livro…</p>;

  const loadedApplication = application;
  const loadedBook = book;

  function updateBook(updated: BookEntry, message: string) {
    setBook(updated);
    setAnnouncement(message);
  }

  function openDeletionConfirmation() {
    setDeleteError("");
    setConfirmingDeletion(true);
    requestAnimationFrame(() => deletionConfirmationRef.current?.focus());
  }

  function cancelDeletion() {
    if (deletionInProgressRef.current) return;
    setDeleteError("");
    setConfirmingDeletion(false);
    requestAnimationFrame(() => deleteButtonRef.current?.focus());
  }

  async function deleteBook() {
    if (deletionInProgressRef.current) return;
    deletionInProgressRef.current = true;
    setDeleting(true);
    setDeleteError("");
    try {
      await loadedApplication.commands.deleteBookEntry.execute({
        id: loadedBook.id,
      });
      void navigate("/colecao", { replace: true });
    } catch (error: unknown) {
      setDeleteError(presentApplicationError(error).message);
      requestAnimationFrame(() => deletionConfirmationRef.current?.focus());
    } finally {
      deletionInProgressRef.current = false;
      setDeleting(false);
    }
  }

  return (
    <article className="detail-layout" aria-labelledby="detail-title">
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
      <section className="content-card detail-summary">
        <div className="section-heading">
          <div>
            <p className="status-badge">{statusLabels[book.status]}</p>
            <h2 id="detail-title">{book.title}</h2>
            <p>{book.author ?? "Autor não informado"}</p>
          </div>
          <Link
            className="button button--secondary"
            to={{
              pathname: `/registros/${encodeURIComponent(book.id)}/editar`,
              search: `?from=${encodeURIComponent(returnPath)}`,
            }}
          >
            Editar dados
          </Link>
        </div>
        <dl className="book-facts detail-summary__essentials">
          <div>
            <dt>Progresso</dt>
            <dd>{progressText(book)}</dd>
          </div>
        </dl>
        <details className="detail-disclosure">
          <summary>Mais informações</summary>
          <dl className="book-facts">
            <div>
              <dt>Avaliação</dt>
              <dd>
                {book.rating === undefined
                  ? "Não informada"
                  : `${book.rating} de 5`}
              </dd>
            </div>
            <div>
              <dt>Início</dt>
              <dd>
                {book.startedAt === undefined
                  ? "Não informado"
                  : formatDate(book.startedAt)}
              </dd>
            </div>
            <div>
              <dt>Conclusão</dt>
              <dd>
                {book.completedAt === undefined
                  ? "Não concluído"
                  : formatDate(book.completedAt)}
              </dd>
            </div>
            <div>
              <dt>Última atualização</dt>
              <dd>{formatDateTime(book.updatedAt)}</dd>
            </div>
          </dl>
        </details>
        <Link className="text-link" to={returnPath}>
          {returnPath.startsWith("/arquivo")
            ? "Voltar ao Arquivo"
            : "Voltar à Coleção"}
        </Link>
      </section>

      <section className="content-card" aria-labelledby="progress-title">
        <h2 id="progress-title">Progresso</h2>
        <ProgressSummary book={book} />
        <ProgressForm
          key={`${book.id}-${book.revision}`}
          book={book}
          updateProgress={(input) =>
            application.commands.updateBookProgress.execute(input)
          }
          onUpdated={updateBook}
        />
      </section>

      <details className="content-card detail-disclosure">
        <summary id="status-title">Status da leitura</summary>
        <p>Status atual: {statusLabels[book.status]}.</p>
        <StatusActions
          book={book}
          changeStatus={(input) =>
            application.commands.changeBookStatus.execute(input)
          }
          onUpdated={updateBook}
        />
      </details>

      <details className="content-card detail-disclosure">
        <summary id="note-form-title">Adicionar nota</summary>
        <NoteForm
          entryId={book.id}
          addNote={(input) => application.commands.addNote.execute(input)}
          onAdded={(note, message) => {
            setNotes((current) => Object.freeze([...(current ?? []), note]));
            setAnnouncement(message);
          }}
        />
      </details>

      <details className="content-card detail-disclosure">
        <summary id="quote-form-title">Adicionar citação</summary>
        <QuoteForm
          entryId={book.id}
          totalPages={book.totalPages}
          addQuote={(input) => application.commands.addQuote.execute(input)}
          onAdded={(quote, message) => {
            setQuotes((current) => Object.freeze([...(current ?? []), quote]));
            setAnnouncement(message);
          }}
        />
      </details>

      <details className="content-card detail-disclosure">
        <summary id="history-title">Histórico de leitura</summary>
        <History
          notes={notes}
          quotes={quotes}
          {...(book.totalPages !== undefined && {
            totalPages: book.totalPages,
          })}
          onDeleteNote={async (noteId) => {
            await application.commands.deleteNote.execute({ id: noteId });
            setNotes((current) => current?.filter(({ id }) => id !== noteId));
            setAnnouncement("Nota excluída.");
          }}
          onDeleteQuote={async (quoteId) => {
            await application.commands.deleteQuote.execute({ id: quoteId });
            setQuotes((current) => current?.filter(({ id }) => id !== quoteId));
            setAnnouncement("Citação excluída.");
          }}
          onShareNote={(noteId) =>
            application.commands.shareNote.execute({ id: noteId })
          }
          onShareQuote={(quoteId) =>
            application.commands.shareQuote.execute({ id: quoteId })
          }
          onUpdateNote={async (input) => {
            const updated =
              await application.commands.updateNote.execute(input);
            setNotes((current) =>
              current?.map((note) => (note.id === updated.id ? updated : note)),
            );
          }}
          onUpdateQuote={async (input) => {
            const updated =
              await application.commands.updateQuote.execute(input);
            setQuotes((current) =>
              current?.map((quote) =>
                quote.id === updated.id ? updated : quote,
              ),
            );
          }}
        />
      </details>

      <section
        className="content-card destructive-section"
        aria-labelledby="delete-book-title"
      >
        <p className="eyebrow">Ação permanente</p>
        <h2 id="delete-book-title">Excluir livro</h2>
        <p>
          Esta ação é permanente. O livro, suas notas, suas citações e o
          histórico de atividades relacionado serão removidos.
        </p>
        {!confirmingDeletion ? (
          <button
            className="button button--danger-outline"
            onClick={openDeletionConfirmation}
            ref={deleteButtonRef}
            type="button"
          >
            Excluir livro
          </button>
        ) : (
          <section
            aria-labelledby="delete-confirmation-title"
            className="delete-confirmation"
            ref={deletionConfirmationRef}
            tabIndex={-1}
          >
            <h3 id="delete-confirmation-title">
              Excluir permanentemente “{book.title}”?
            </h3>
            <p>
              As notas e citações vinculadas também serão excluídas. Esta ação
              não pode ser desfeita.
            </p>
            {deleteError && <p role="alert">{deleteError}</p>}
            <div className="inline-actions">
              <button
                className="button button--secondary"
                disabled={deleting}
                onClick={cancelDeletion}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="button button--danger"
                disabled={deleting}
                onClick={() => void deleteBook()}
                type="button"
              >
                {deleting ? "Excluindo…" : "Excluir permanentemente"}
              </button>
            </div>
          </section>
        )}
      </section>
    </article>
  );
}
