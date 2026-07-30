import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import type { BookEntry, Note, Quote } from "../../domain";
import { presentApplicationError } from "../entry-editor/errorMessages";
import {
  formatDate,
  formatDateTime,
  progressText,
  statusLabels,
} from "../books/bookPresentation";
import { NoteForm, QuoteForm } from "./AnnotationForms";
import { ProgressForm } from "./ProgressForm";
import { StatusActions } from "./StatusActions";

export interface BookDetailApplication {
  readonly commands: {
    readonly addNote: { execute(input: unknown): Promise<Note> };
    readonly addQuote: { execute(input: unknown): Promise<Quote> };
    readonly changeBookStatus: { execute(input: unknown): Promise<BookEntry> };
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
}: {
  readonly notes: readonly Note[];
  readonly quotes: readonly Quote[];
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
                  {quote.page !== undefined && <p>Página {quote.page}</p>}
                  <p className="annotation-date">
                    Adicionada em {formatDateTime(quote.createdAt)}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function BookDetailPage({
  application,
}: {
  readonly application?: BookDetailApplication;
}) {
  const { id = "" } = useParams();
  const [book, setBook] = useState<BookEntry>();
  const [notes, setNotes] = useState<readonly Note[]>();
  const [quotes, setQuotes] = useState<readonly Quote[]>();
  const [loadError, setLoadError] = useState<string>();
  const [notFound, setNotFound] = useState(false);
  const [announcement, setAnnouncement] = useState("");

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
        <Link className="text-link" to="/colecao">
          Voltar à Coleção
        </Link>
      </section>
    );
  }
  if (!book || !notes || !quotes) return <p role="status">Carregando livro…</p>;

  function updateBook(updated: BookEntry, message: string) {
    setBook(updated);
    setAnnouncement(message);
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
            to={`/livros/${encodeURIComponent(book.id)}/editar`}
          >
            Editar dados
          </Link>
        </div>
        <dl className="book-facts">
          <div>
            <dt>Progresso</dt>
            <dd>{progressText(book)}</dd>
          </div>
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
        <Link className="text-link" to="/colecao">
          Voltar à Coleção
        </Link>
      </section>

      <section className="content-card" aria-labelledby="progress-title">
        <h2 id="progress-title">Progresso</h2>
        <ProgressForm
          key={`${book.id}-${book.revision}`}
          book={book}
          updateProgress={(input) =>
            application.commands.updateBookProgress.execute(input)
          }
          onUpdated={updateBook}
        />
      </section>

      <section className="content-card" aria-labelledby="status-title">
        <h2 id="status-title">Status da leitura</h2>
        <p>Status atual: {statusLabels[book.status]}.</p>
        <StatusActions
          book={book}
          changeStatus={(input) =>
            application.commands.changeBookStatus.execute(input)
          }
          onUpdated={updateBook}
        />
      </section>

      <section className="content-card" aria-labelledby="note-form-title">
        <h2 id="note-form-title">Adicionar nota</h2>
        <NoteForm
          entryId={book.id}
          addNote={(input) => application.commands.addNote.execute(input)}
          onAdded={(note, message) => {
            setNotes((current) => Object.freeze([...(current ?? []), note]));
            setAnnouncement(message);
          }}
        />
      </section>

      <section className="content-card" aria-labelledby="quote-form-title">
        <h2 id="quote-form-title">Adicionar citação</h2>
        <QuoteForm
          entryId={book.id}
          totalPages={book.totalPages}
          addQuote={(input) => application.commands.addQuote.execute(input)}
          onAdded={(quote, message) => {
            setQuotes((current) => Object.freeze([...(current ?? []), quote]));
            setAnnouncement(message);
          }}
        />
      </section>

      <section className="content-card" aria-labelledby="history-title">
        <h2 id="history-title">Histórico de leitura</h2>
        <History notes={notes} quotes={quotes} />
      </section>
    </article>
  );
}
