import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import type { BookEntry, Note, Quote } from "../../domain";
import type { AnnotationShareResult } from "../../application";
import { AnnotationActions } from "../annotations/AnnotationActions";
import { formatDateTime } from "../books/bookPresentation";
import { normalizeSearch } from "../collection/collectionControls";
import { presentApplicationError } from "../entry-editor/errorMessages";

export interface ArchiveApplication {
  readonly commands: {
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
  };
  readonly queries: {
    readonly listBookEntries: { execute(): Promise<readonly BookEntry[]> };
    readonly listAllNotes: { execute(): Promise<readonly Note[]> };
    readonly listAllQuotes: { execute(): Promise<readonly Quote[]> };
  };
}

interface RelatedAnnotation<T extends Note | Quote> {
  readonly annotation: T;
  readonly book?: BookEntry;
}

function matchesArchiveSearch(
  item: RelatedAnnotation<Note | Quote>,
  query: string,
): boolean {
  const searchable = `${item.annotation.content} ${item.book?.title ?? ""} ${item.book?.author ?? ""}`;
  return normalizeSearch(searchable).includes(normalizeSearch(query));
}

export function ArchivePage({
  application,
}: {
  readonly application?: ArchiveApplication;
}) {
  const [notes, setNotes] = useState<readonly Note[]>();
  const [quotes, setQuotes] = useState<readonly Quote[]>();
  const [books, setBooks] = useState<readonly BookEntry[]>();
  const [error, setError] = useState<string>();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  const query = params.get("q") ?? "";

  useEffect(() => {
    if (!application) return;
    let active = true;
    void Promise.all([
      application.queries.listBookEntries.execute(),
      application.queries.listAllNotes.execute(),
      application.queries.listAllQuotes.execute(),
    ]).then(
      ([loadedBooks, loadedNotes, loadedQuotes]) => {
        if (!active) return;
        setBooks(loadedBooks);
        setNotes(loadedNotes);
        setQuotes(loadedQuotes);
      },
      (failure: unknown) => {
        if (active) setError(presentApplicationError(failure).message);
      },
    );
    return () => {
      active = false;
    };
  }, [application]);

  const bookById = useMemo(
    () => new Map((books ?? []).map((book) => [book.id, book])),
    [books],
  );
  const visibleNotes = useMemo(
    () =>
      (notes ?? [])
        .map((annotation) => ({
          annotation,
          book: bookById.get(annotation.entryId),
        }))
        .filter((item) => matchesArchiveSearch(item, query)),
    [bookById, notes, query],
  );
  const visibleQuotes = useMemo(
    () =>
      (quotes ?? [])
        .map((annotation) => ({
          annotation,
          book: bookById.get(annotation.entryId),
        }))
        .filter((item) => matchesArchiveSearch(item, query)),
    [bookById, query, quotes],
  );

  function clearSearch() {
    setParams({}, { replace: true });
    requestAnimationFrame(() => searchRef.current?.focus());
  }

  if (!application)
    return (
      <section className="content-card" role="alert">
        <h2>Arquivo indisponível</h2>
        <p>Não foi possível iniciar o armazenamento local.</p>
      </section>
    );
  if (error)
    return (
      <section className="content-card" role="alert">
        <h2>Não foi possível abrir o Arquivo</h2>
        <p>{error}</p>
      </section>
    );
  if (!books || !notes || !quotes)
    return <p role="status">Carregando Arquivo…</p>;

  const total = notes.length + quotes.length;
  const visibleTotal = visibleNotes.length + visibleQuotes.length;
  const returnPath = `${location.pathname}${location.search}`;
  const detailSearch = `?from=${encodeURIComponent(returnPath)}`;

  return (
    <section aria-labelledby="archive-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Suas leituras registradas</p>
          <h2 id="archive-title">Arquivo de anotações</h2>
        </div>
      </div>
      <div className="form-field archive-search">
        <label htmlFor="archive-search">Buscar no Arquivo</label>
        <p className="field-help" id="archive-search-help">
          Busca no conteúdo, título ou autor, sem diferenciar maiúsculas e
          acentos.
        </p>
        <input
          id="archive-search"
          ref={searchRef}
          type="search"
          value={query}
          aria-describedby="archive-search-help"
          onChange={(event) => {
            const value = event.target.value;
            setParams(value === "" ? {} : { q: value }, { replace: true });
          }}
        />
      </div>
      <div className="result-summary" aria-live="polite">
        <p>
          {visibleTotal} {visibleTotal === 1 ? "resultado" : "resultados"}:{" "}
          {visibleNotes.length} {visibleNotes.length === 1 ? "nota" : "notas"} e{" "}
          {visibleQuotes.length}{" "}
          {visibleQuotes.length === 1 ? "citação" : "citações"}
          {query.trim() !== "" ? ` de ${total} itens` : ""}.
        </p>
        {query !== "" && visibleTotal > 0 && (
          <button
            className="button button--secondary"
            type="button"
            onClick={clearSearch}
          >
            Limpar busca
          </button>
        )}
      </div>
      {total === 0 ? (
        <section
          className="content-card no-results"
          aria-labelledby="empty-archive-title"
        >
          <h3 id="empty-archive-title">Arquivo vazio</h3>
          <p>Notas e citações adicionadas aos livros aparecerão aqui.</p>
        </section>
      ) : visibleTotal === 0 ? (
        <section
          className="content-card no-results"
          aria-labelledby="archive-no-results"
        >
          <h3 id="archive-no-results">Nenhuma anotação encontrada</h3>
          <p>Altere o texto para consultar outros registros.</p>
          <button
            className="button button--secondary"
            type="button"
            onClick={clearSearch}
          >
            Limpar busca
          </button>
        </section>
      ) : (
        <div className="history-grid archive-groups">
          <section aria-labelledby="archive-notes-title">
            <h3 id="archive-notes-title">Notas</h3>
            {visibleNotes.length === 0 ? (
              <p>Nenhuma nota corresponde à busca.</p>
            ) : (
              <ul className="annotation-list">
                {visibleNotes.map(({ annotation, book }) => (
                  <li key={annotation.id}>
                    <article aria-labelledby={`archive-note-${annotation.id}`}>
                      <p className="eyebrow">Nota</p>
                      <h4 id={`archive-note-${annotation.id}`}>
                        {book?.title ?? "Livro relacionado indisponível"}
                      </h4>
                      {book?.author && <p>{book.author}</p>}
                      <p>{annotation.content}</p>
                      <time
                        className="annotation-date"
                        dateTime={annotation.createdAt}
                      >
                        Adicionada em {formatDateTime(annotation.createdAt)}
                      </time>
                      {book && (
                        <Link
                          className="text-link"
                          to={{
                            pathname: `/livros/${encodeURIComponent(book.id)}`,
                            search: detailSearch,
                          }}
                        >
                          Abrir livro {book.title}
                        </Link>
                      )}
                      <AnnotationActions
                        annotation={annotation}
                        kind="note"
                        onDelete={async (id) => {
                          await application.commands.deleteNote.execute({ id });
                          setNotes((current) =>
                            current?.filter((note) => note.id !== id),
                          );
                        }}
                        onShare={(id) =>
                          application.commands.shareNote.execute({ id })
                        }
                        onUpdate={async (input) => {
                          const updated =
                            await application.commands.updateNote.execute(
                              input,
                            );
                          setNotes((current) =>
                            current?.map((note) =>
                              note.id === updated.id ? updated : note,
                            ),
                          );
                        }}
                      />
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section aria-labelledby="archive-quotes-title">
            <h3 id="archive-quotes-title">Citações</h3>
            {visibleQuotes.length === 0 ? (
              <p>Nenhuma citação corresponde à busca.</p>
            ) : (
              <ul className="annotation-list">
                {visibleQuotes.map(({ annotation, book }) => (
                  <li key={annotation.id}>
                    <article aria-labelledby={`archive-quote-${annotation.id}`}>
                      <p className="eyebrow">Citação</p>
                      <h4 id={`archive-quote-${annotation.id}`}>
                        {book?.title ?? "Livro relacionado indisponível"}
                      </h4>
                      {book?.author && <p>{book.author}</p>}
                      <blockquote>{annotation.content}</blockquote>
                      {annotation.page !== undefined && (
                        <p>Página {annotation.page}</p>
                      )}
                      <time
                        className="annotation-date"
                        dateTime={annotation.createdAt}
                      >
                        Adicionada em {formatDateTime(annotation.createdAt)}
                      </time>
                      {book && (
                        <Link
                          className="text-link"
                          to={{
                            pathname: `/livros/${encodeURIComponent(book.id)}`,
                            search: detailSearch,
                          }}
                        >
                          Abrir livro {book.title}
                        </Link>
                      )}
                      <AnnotationActions
                        annotation={annotation}
                        kind="quote"
                        onDelete={async (id) => {
                          await application.commands.deleteQuote.execute({
                            id,
                          });
                          setQuotes((current) =>
                            current?.filter((quote) => quote.id !== id),
                          );
                        }}
                        onShare={(id) =>
                          application.commands.shareQuote.execute({ id })
                        }
                        onUpdate={async (input) => {
                          const updated =
                            await application.commands.updateQuote.execute(
                              input,
                            );
                          setQuotes((current) =>
                            current?.map((quote) =>
                              quote.id === updated.id ? updated : quote,
                            ),
                          );
                        }}
                        {...(book?.totalPages !== undefined && {
                          totalPages: book.totalPages,
                        })}
                      />
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
