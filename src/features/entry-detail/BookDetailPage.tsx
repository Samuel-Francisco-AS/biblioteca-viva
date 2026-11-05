import { useRecordCover } from "../../ui/useRecordCover";
import type { PosterPort } from "../../application/media";
import { RecordCoverEditor } from "../../ui/RecordCoverEditor";
import { BVSelectSheet } from "../../ui/BVPicker";
import { ArtifactGlyph } from "../../app/ArtifactGlyph";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import type { BookEntry, Note, Quote } from "../../domain";
import type { AnnotationShareResult } from "../../application";
import type { ImageFilesPort } from "../../application/imageFiles";
import { BookImageShare } from "../book-share/BookImageShare";
import "./book-folio.css";
import { useBookDraftGuard } from "./useBookDraftGuard";
import { AnnotationActions } from "../annotations/AnnotationActions";
import { presentApplicationError } from "../entry-editor/errorMessages";
import {
  formatDate,
  formatDateTime,
  progressPercentage,
  remainingPages,
  statusLabels,
} from "../books/bookPresentation";
import { safeReturnPath } from "../books/navigationOrigin";
import { NoteForm, QuoteForm } from "./AnnotationForms";
import { ProgressForm } from "./ProgressForm";
import { StatusActions } from "./StatusActions";

export interface BookDetailApplication {
  readonly posters?: PosterPort;
  readonly imageFiles?: ImageFilesPort;
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
  const items = [
    ...notes.map((annotation) => ({ annotation, kind: "note" as const })),
    ...quotes.map((annotation) => ({ annotation, kind: "quote" as const })),
  ].sort((a, b) =>
    b.annotation.createdAt.localeCompare(a.annotation.createdAt),
  );
  return (
    <div className="folio-memories">
      {notes.length === 0 && (
        <p className="folio-empty">Nenhuma nota adicionada.</p>
      )}
      {quotes.length === 0 && (
        <p className="folio-empty">Nenhuma citação adicionada.</p>
      )}
      <ul className="folio-annotations">
        {items.map(({ annotation, kind }) => (
          <li key={`${kind}-${annotation.id}`}>
            <article>
              <div className="folio-annotation-caption">
                <h4>{kind === "note" ? "Nota pessoal" : "Citação"}</h4>
                {annotation.location?.type === "book" && (
                  <span>Página {annotation.location.page}</span>
                )}
              </div>
              {kind === "quote" ? (
                <blockquote>{annotation.content}</blockquote>
              ) : (
                <p className="folio-note-content">{annotation.content}</p>
              )}
              <p className="annotation-date">
                Adicionada em {formatDateTime(annotation.createdAt)}
              </p>
              <details className="folio-annotation-tools">
                <summary>
                  {kind === "note" ? "Opções da nota" : "Opções da citação"}
                </summary>
                {kind === "note" ? (
                  <AnnotationActions
                    annotation={annotation}
                    kind="note"
                    onDelete={onDeleteNote}
                    onShare={onShareNote}
                    onUpdate={onUpdateNote}
                  />
                ) : (
                  <AnnotationActions
                    annotation={annotation}
                    kind="quote"
                    onDelete={onDeleteQuote}
                    onShare={onShareQuote}
                    onUpdate={onUpdateQuote}
                    {...(totalPages !== undefined && { totalPages })}
                  />
                )}
              </details>
            </article>
          </li>
        ))}
      </ul>
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
  refreshKey = 0,
  secondary,
}: {
  readonly application?: BookDetailApplication;
  readonly refreshKey?: number;
  readonly secondary?: (
    book: BookEntry,
    onUpdated: (book: BookEntry) => void,
  ) => ReactNode;
}) {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const {
    cover,
    setCover,
    error: coverError,
  } = useRecordCover(application?.posters, id);
  const [searchParams] = useSearchParams();
  const returnPath = safeReturnPath(searchParams.get("from"));
  const [book, setBook] = useState<BookEntry>();
  const folioRef = useRef<HTMLElement>(null);
  useBookDraftGuard(folioRef, book?.currentPage);
  const [notes, setNotes] = useState<readonly Note[]>();
  const [quotes, setQuotes] = useState<readonly Quote[]>();
  const [loadError, setLoadError] = useState<string>();
  const [notFound, setNotFound] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [confirmingDeletion, setConfirmingDeletion] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [annotationKind, setAnnotationKind] = useState("note");
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
  }, [application, id, refreshKey]);

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
            : returnPath.startsWith("/colecao")
              ? "Voltar à Coleção"
              : "Voltar à Biblioteca"}
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
    <article
      ref={folioRef}
      className="book-folio"
      aria-labelledby="detail-title"
    >
      <p className="folio-announcement" role="status" aria-live="polite">
        {announcement}
      </p>
      <nav className="folio-navigation" aria-label="Navegação do livro">
        <Link className="text-link" to={returnPath}>
          {returnPath.startsWith("/arquivo")
            ? "Voltar ao Arquivo"
            : returnPath.startsWith("/colecao")
              ? "Voltar à Coleção"
              : "Voltar à Biblioteca"}
        </Link>
        <a className="text-link" href="#book-secondary">
          Ações do livro ↓
        </a>
      </nav>
      <header
        className={`folio-identity${cover ? " folio-identity--covered" : ""}`}
      >
        {cover ? (
          <img
            className="folio-book-cover"
            src={cover.dataUrl}
            width={cover.width}
            height={cover.height}
            alt={`Capa de ${book.title}`}
          />
        ) : (
          <span className="folio-emblem" aria-hidden="true">
            <ArtifactGlyph type="book" />
          </span>
        )}
        <div className="folio-identity-text">
          <p className="folio-kicker">Códice pessoal · Livro</p>
          <h2 id="detail-title">{book.title}</h2>
          <p className="folio-author">{book.author ?? "Autor não informado"}</p>
          <details className="folio-status">
            <summary>
              <span className="visually-hidden">Status da leitura: </span>
              {statusLabels[book.status]} <span aria-hidden="true">⌄</span>
            </summary>
            <p>Status atual: {statusLabels[book.status]}.</p>
            <StatusActions
              book={book}
              changeStatus={(input) =>
                application.commands.changeBookStatus.execute(input)
              }
              onUpdated={updateBook}
            />
          </details>
        </div>
        <span
          className="folio-seal"
          aria-label={
            progressPercentage(book) === undefined
              ? "Total de páginas não informado"
              : `${progressPercentage(book)} por cento concluído`
          }
        >
          <strong>
            {progressPercentage(book) === undefined
              ? "—"
              : `${progressPercentage(book)}%`}
          </strong>
          <span>da jornada</span>
        </span>
      </header>
      <section
        className="folio-chapter folio-progress"
        aria-labelledby="progress-title"
      >
        <div className="folio-chapter-heading">
          <span aria-hidden="true">I</span>
          <h3 id="progress-title">Seu marcador</h3>
        </div>
        <ProgressSummary book={book} />
        <ProgressForm
          key={`${book.id}-${book.revision}`}
          book={book}
          updateProgress={(input) =>
            application.commands.updateBookProgress.execute(input)
          }
          onUpdated={updateBook}
        />
        <Link
          className="text-link folio-hint"
          to={`/registros/${encodeURIComponent(book.id)}/editar?from=${encodeURIComponent(returnPath)}`}
        >
          Corrigir total de páginas
        </Link>
      </section>
      <section className="folio-chapter" aria-labelledby="history-title">
        <div className="folio-chapter-heading">
          <span aria-hidden="true">II</span>
          <h3 id="history-title">Notas e citações</h3>
          <span className="folio-count">{notes.length + quotes.length}</span>
        </div>
        <details className="folio-composer">
          <summary>Escrever nas margens</summary>
          <label className="form-field">
            Tipo de anotação
            <BVSelectSheet
              value={annotationKind}
              onChange={(event) => setAnnotationKind(event.target.value)}
            >
              <option value="note">Nota pessoal</option>
              <option value="quote">Citação textual</option>
            </BVSelectSheet>
          </label>
          <div hidden={annotationKind !== "note"}>
            <NoteForm
              entryId={book.id}
              totalPages={book.totalPages}
              addNote={(input) => application.commands.addNote.execute(input)}
              onAdded={(note, message) => {
                setNotes((current) =>
                  Object.freeze([...(current ?? []), note]),
                );
                setAnnouncement(message);
              }}
            />
          </div>
          <div hidden={annotationKind !== "quote"}>
            <QuoteForm
              entryId={book.id}
              totalPages={book.totalPages}
              addQuote={(input) => application.commands.addQuote.execute(input)}
              onAdded={(quote, message) => {
                setQuotes((current) =>
                  Object.freeze([...(current ?? []), quote]),
                );
                setAnnouncement(message);
              }}
            />
          </div>
        </details>

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
      </section>
      <section
        className="folio-chapter folio-share"
        aria-labelledby="share-title"
      >
        <div className="folio-chapter-heading">
          <span aria-hidden="true">III</span>
          <h3 id="share-title">Leve uma página com você</h3>
        </div>
        <p>Seu percurso ou uma passagem especial, em uma imagem do Códice.</p>
        <BookImageShare
          book={book}
          quotes={quotes}
          poster={cover}
          files={application.imageFiles}
        />
      </section>
      <details className="folio-secondary" id="book-secondary">
        <summary>Ações do livro</summary>
        {coverError && <p role="alert">{coverError}</p>}
        <RecordCoverEditor
          key={book.id}
          entryId={book.id}
          images={application.posters}
          cover={cover}
          onSaved={setCover}
        />
        <Link
          className="button button--secondary"
          to={`/registros/${encodeURIComponent(book.id)}/editar?from=${encodeURIComponent(returnPath)}`}
        >
          Editar dados
        </Link>
        <details className="folio-metadata">
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
                {book.startedAt ? formatDate(book.startedAt) : "Não informado"}
              </dd>
            </div>
            <div>
              <dt>Conclusão</dt>
              <dd>
                {book.completedAt
                  ? formatDate(book.completedAt)
                  : "Não concluído"}
              </dd>
            </div>
            <div>
              <dt>Última atualização</dt>
              <dd>{formatDateTime(book.updatedAt)}</dd>
            </div>
          </dl>
        </details>
        {secondary?.(book, setBook)}
        <section className="folio-danger" aria-labelledby="delete-book-title">
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
      </details>
    </article>
  );
}
