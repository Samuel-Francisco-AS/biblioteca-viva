import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import {
  ENTRY_TYPES,
  type LibraryEntry,
  type Note,
  type Quote,
  type Tag,
} from "../../domain";
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
    readonly organizeNote: { execute(input: unknown): Promise<Note> };
    readonly organizeQuote: { execute(input: unknown): Promise<Quote> };
  };
  readonly queries: {
    readonly listLibraryEntries: {
      execute(): Promise<readonly LibraryEntry[]>;
    };
    readonly listAllNotes: { execute(): Promise<readonly Note[]> };
    readonly listAllQuotes: { execute(): Promise<readonly Quote[]> };
    readonly listTags: { execute(): Promise<readonly Tag[]> };
  };
}

interface RelatedAnnotation<T extends Note | Quote> {
  readonly annotation: T;
  readonly entry?: LibraryEntry;
}

function matchesArchiveSearch(
  item: RelatedAnnotation<Note | Quote>,
  query: string,
): boolean {
  const searchable = `${item.annotation.content} ${item.entry?.title ?? ""} ${item.entry?.type === "book" ? (item.entry.author ?? "") : ""}`;
  return normalizeSearch(searchable).includes(normalizeSearch(query));
}

export function ArchivePage({
  application,
}: {
  readonly application?: ArchiveApplication;
}) {
  const [notes, setNotes] = useState<readonly Note[]>();
  const [quotes, setQuotes] = useState<readonly Quote[]>();
  const [entries, setEntries] = useState<readonly LibraryEntry[]>();
  const [tags, setTags] = useState<readonly Tag[]>([]);
  const [error, setError] = useState<string>();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  const filtersToggleRef = useRef<HTMLButtonElement>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const query = params.get("q") ?? "";
  const kind = params.get("kind") ?? "all";
  const entryType = params.get("entryType") ?? "all";
  const favoritesOnly = params.get("favorite") === "true";
  const tagId = params.get("tag") ?? "all";

  useEffect(() => {
    if (!application) return;
    let active = true;
    void Promise.all([
      application.queries.listLibraryEntries.execute(),
      application.queries.listAllNotes.execute(),
      application.queries.listAllQuotes.execute(),
      application.queries.listTags.execute(),
    ]).then(
      ([loadedEntries, loadedNotes, loadedQuotes, loadedTags]) => {
        if (!active) return;
        setEntries(loadedEntries);
        setNotes(loadedNotes);
        setQuotes(loadedQuotes);
        setTags(loadedTags);
      },
      (failure: unknown) => {
        if (active) setError(presentApplicationError(failure).message);
      },
    );
    return () => {
      active = false;
    };
  }, [application]);

  const entryById = useMemo(
    () => new Map((entries ?? []).map((entry) => [entry.id, entry])),
    [entries],
  );
  const visibleNotes = useMemo(
    () =>
      (notes ?? [])
        .map((annotation) => ({
          annotation,
          entry: entryById.get(annotation.entryId),
        }))
        .filter((item) => matchesArchiveSearch(item, query))
        .filter(
          ({ annotation, entry }) =>
            (kind === "all" || kind === "note") &&
            (entryType === "all" || entry?.type === entryType) &&
            (!favoritesOnly || annotation.favorite) &&
            (tagId === "all" || annotation.tagIds.includes(tagId)),
        ),
    [entryById, entryType, favoritesOnly, kind, notes, query, tagId],
  );
  const visibleQuotes = useMemo(
    () =>
      (quotes ?? [])
        .map((annotation) => ({
          annotation,
          entry: entryById.get(annotation.entryId),
        }))
        .filter((item) => matchesArchiveSearch(item, query))
        .filter(
          ({ annotation, entry }) =>
            (kind === "all" || kind === "quote") &&
            (entryType === "all" || entry?.type === entryType) &&
            (!favoritesOnly || annotation.favorite) &&
            (tagId === "all" || annotation.tagIds.includes(tagId)),
        ),
    [entryById, entryType, favoritesOnly, kind, query, quotes, tagId],
  );

  function clearSearch() {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("q");
        return next;
      },
      { replace: true },
    );
    requestAnimationFrame(() => searchRef.current?.focus());
  }

  useEffect(() => {
    if (!filtersExpanded) return;
    const closeFilters = () => {
      setFiltersExpanded(false);
      requestAnimationFrame(() => filtersToggleRef.current?.focus());
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeFilters();
    };
    const onNativeBack = (event: Event) => {
      event.preventDefault();
      closeFilters();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("biblioteca-viva:native-back", onNativeBack);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("biblioteca-viva:native-back", onNativeBack);
    };
  }, [filtersExpanded]);

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
  if (!entries || !notes || !quotes)
    return <p role="status">Carregando Arquivo…</p>;

  const total = notes.length + quotes.length;
  const visibleTotal = visibleNotes.length + visibleQuotes.length;
  const returnPath = `${location.pathname}${location.search}`;
  const detailSearch = `?from=${encodeURIComponent(returnPath)}`;
  const activeFilterCount = [
    kind !== "all",
    entryType !== "all",
    favoritesOnly,
    tagId !== "all",
  ].filter(Boolean).length;

  return (
    <section aria-labelledby="archive-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Suas leituras registradas</p>
          <h2 id="archive-title">Arquivo de anotações</h2>
        </div>
        <button
          aria-controls="archive-filter-controls"
          aria-expanded={filtersExpanded}
          className="button button--primary"
          onClick={() => {
            const next = !filtersExpanded;
            setFiltersExpanded(next);
            if (next)
              requestAnimationFrame(() => {
                document
                  .querySelector<HTMLElement>(
                    "#archive-filter-controls select",
                  )
                  ?.focus();
              });
          }}
          ref={filtersToggleRef}
          type="button"
        >
          Filtros{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ""}
        </button>
      </div>
      <div
        aria-hidden={!filtersExpanded}
        className="collapsible-controls"
        data-expanded={filtersExpanded}
        id="archive-filter-controls"
      >
        <fieldset className="collection-controls" inert={!filtersExpanded}>
          <legend>Filtros do Arquivo</legend>
        <label className="form-field">
          Anotação
          <select
            value={kind}
            onChange={(event) =>
              setParams(
                (current) => {
                  const next = new URLSearchParams(current);
                  if (event.target.value === "all") next.delete("kind");
                  else next.set("kind", event.target.value);
                  return next;
                },
                { replace: true },
              )
            }
          >
            <option value="all">Notas e citações</option>
            <option value="note">Notas</option>
            <option value="quote">Citações</option>
          </select>
        </label>
        <label className="form-field">
          Tipo de registro
          <select
            value={entryType}
            onChange={(event) =>
              setParams(
                (current) => {
                  const next = new URLSearchParams(current);
                  if (event.target.value === "all") next.delete("entryType");
                  else next.set("entryType", event.target.value);
                  return next;
                },
                { replace: true },
              )
            }
          >
            <option value="all">Todos</option>
            {ENTRY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          Etiqueta
          <select
            value={tagId}
            onChange={(event) =>
              setParams(
                (current) => {
                  const next = new URLSearchParams(current);
                  if (event.target.value === "all") next.delete("tag");
                  else next.set("tag", event.target.value);
                  return next;
                },
                { replace: true },
              )
            }
          >
            <option value="all">Todas</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </label>
        <label className="checkbox-field">
          <input
            checked={favoritesOnly}
            onChange={(event) =>
              setParams(
                (current) => {
                  const next = new URLSearchParams(current);
                  if (event.target.checked) next.set("favorite", "true");
                  else next.delete("favorite");
                  return next;
                },
                { replace: true },
              )
            }
            type="checkbox"
          />{" "}
          Somente favoritas
        </label>
        </fieldset>
      </div>
      <div className="form-field archive-search">
        <label htmlFor="archive-search">Buscar no Arquivo</label>
        <p className="field-help" id="archive-search-help">
          Busca no conteúdo e no título do registro, sem diferenciar maiúsculas
          e acentos.
        </p>
        <input
          id="archive-search"
          ref={searchRef}
          type="search"
          value={query}
          aria-describedby="archive-search-help"
          onChange={(event) => {
            const value = event.target.value;
            setParams(
              (current) => {
                const next = new URLSearchParams(current);
                if (value === "") next.delete("q");
                else next.set("q", value);
                return next;
              },
              { replace: true },
            );
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
                {visibleNotes.map(({ annotation, entry }) => (
                  <li key={annotation.id}>
                    <article aria-labelledby={`archive-note-${annotation.id}`}>
                      <p className="eyebrow">Nota</p>
                      <h4 id={`archive-note-${annotation.id}`}>
                        {entry?.title ?? "Registro relacionado indisponível"}
                      </h4>
                      {entry?.type === "book" && entry.author && (
                        <p>{entry.author}</p>
                      )}
                      <p>{annotation.content}</p>
                      <time
                        className="annotation-date"
                        dateTime={annotation.createdAt}
                      >
                        Adicionada em {formatDateTime(annotation.createdAt)}
                      </time>
                      {entry && (
                        <Link
                          className="text-link"
                          to={{
                            pathname: `/registros/${encodeURIComponent(entry.id)}`,
                            search: detailSearch,
                          }}
                        >
                          Abrir registro {entry.title}
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
                      <button
                        aria-pressed={annotation.favorite}
                        className="text-button"
                        onClick={() =>
                          void application.commands.organizeNote
                            .execute({
                              id: annotation.id,
                              favorite: !annotation.favorite,
                            })
                            .then((updated) =>
                              setNotes((current) =>
                                current?.map((item) =>
                                  item.id === updated.id ? updated : item,
                                ),
                              ),
                            )
                        }
                        type="button"
                      >
                        {annotation.favorite ? "Desfavoritar" : "Favoritar"}
                      </button>
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
                {visibleQuotes.map(({ annotation, entry }) => (
                  <li key={annotation.id}>
                    <article aria-labelledby={`archive-quote-${annotation.id}`}>
                      <p className="eyebrow">Citação</p>
                      <h4 id={`archive-quote-${annotation.id}`}>
                        {entry?.title ?? "Registro relacionado indisponível"}
                      </h4>
                      {entry?.type === "book" && entry.author && (
                        <p>{entry.author}</p>
                      )}
                      <blockquote>{annotation.content}</blockquote>
                      {annotation.location?.type === "book" && (
                        <p>Página {annotation.location.page}</p>
                      )}
                      <time
                        className="annotation-date"
                        dateTime={annotation.createdAt}
                      >
                        Adicionada em {formatDateTime(annotation.createdAt)}
                      </time>
                      {entry && (
                        <Link
                          className="text-link"
                          to={{
                            pathname: `/registros/${encodeURIComponent(entry.id)}`,
                            search: detailSearch,
                          }}
                        >
                          Abrir registro {entry.title}
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
                        {...(entry?.type === "book" &&
                          entry.totalPages !== undefined && {
                            totalPages: entry.totalPages,
                          })}
                      />
                      <button
                        aria-pressed={annotation.favorite}
                        className="text-button"
                        onClick={() =>
                          void application.commands.organizeQuote
                            .execute({
                              id: annotation.id,
                              favorite: !annotation.favorite,
                            })
                            .then((updated) =>
                              setQuotes((current) =>
                                current?.map((item) =>
                                  item.id === updated.id ? updated : item,
                                ),
                              ),
                            )
                        }
                        type="button"
                      >
                        {annotation.favorite ? "Desfavoritar" : "Favoritar"}
                      </button>
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
