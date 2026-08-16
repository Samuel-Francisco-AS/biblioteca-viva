import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import { ENTRY_STATUSES, type BookEntry } from "../../domain";
import { presentApplicationError } from "../entry-editor/errorMessages";
import {
  formatDateTime,
  progressPercentage,
  progressText,
  statusLabels,
} from "../books/bookPresentation";
import {
  deriveCollection,
  parseCollectionSort,
  parseStatusFilter,
} from "./collectionControls";

export interface CollectionApplication {
  readonly queries: {
    readonly listBookEntries: { execute(): Promise<readonly BookEntry[]> };
  };
}

export function CollectionPage({
  application,
}: {
  readonly application?: CollectionApplication;
}) {
  const [books, setBooks] = useState<readonly BookEntry[]>();
  const [error, setError] = useState<string>();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  const query = params.get("q") ?? "";
  const status = parseStatusFilter(params.get("status"));
  const sort = parseCollectionSort(params.get("sort"));
  const visibleBooks = useMemo(
    () => deriveCollection(books ?? [], query, status, sort),
    [books, query, sort, status],
  );

  useEffect(() => {
    if (!application) return;
    let active = true;
    void application.queries.listBookEntries.execute().then(
      (loaded) => {
        if (active) setBooks(loaded);
      },
      (failure: unknown) => {
        if (active) setError(presentApplicationError(failure).message);
      },
    );
    return () => {
      active = false;
    };
  }, [application]);

  function updateParam(name: "q" | "sort" | "status", value: string) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (
          value === "" ||
          value === "all" ||
          (name === "sort" && value === "recent")
        ) {
          next.delete(name);
        } else next.set(name, value);
        return next;
      },
      { replace: true },
    );
  }

  function clearControls() {
    setParams({}, { replace: true });
    requestAnimationFrame(() => searchRef.current?.focus());
  }

  if (!application)
    return (
      <section className="content-card" role="alert">
        <h2>Coleção indisponível</h2>
        <p>Não foi possível iniciar o armazenamento local.</p>
      </section>
    );
  if (error)
    return (
      <section className="content-card" role="alert">
        <h2>Não foi possível abrir a Coleção</h2>
        <p>{error}</p>
      </section>
    );
  if (!books) return <p role="status">Carregando Coleção…</p>;
  if (books.length === 0)
    return (
      <section
        className="content-card"
        aria-labelledby="empty-collection-title"
      >
        <p className="eyebrow">Coleção vazia</p>
        <h2 id="empty-collection-title">Seu primeiro livro começa aqui</h2>
        <p>Cadastre um livro para acompanhar sua leitura.</p>
        <Link className="button button--primary" to="/novo-livro">
          Cadastrar primeiro livro
        </Link>
      </section>
    );

  const controlsActive =
    query.trim() !== "" || status !== "all" || sort !== "recent";
  const returnPath = `${location.pathname}${location.search}`;

  return (
    <section aria-labelledby="collection-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Seus livros</p>
          <h2 id="collection-title">Coleção</h2>
        </div>
        <Link className="button button--primary" to="/novo-livro">
          Adicionar livro
        </Link>
      </div>
      <fieldset className="collection-controls">
        <legend className="visually-hidden">Controles da Coleção</legend>
        <div className="form-field">
          <label htmlFor="collection-search">Buscar livros</label>
          <p className="field-help" id="collection-search-help">
            Busca por título ou autor, sem diferenciar maiúsculas e acentos.
          </p>
          <input
            id="collection-search"
            ref={searchRef}
            type="search"
            value={query}
            aria-describedby="collection-search-help"
            onChange={(event) => updateParam("q", event.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="collection-status">Status</label>
          <select
            id="collection-status"
            value={status}
            onChange={(event) => updateParam("status", event.target.value)}
          >
            <option value="all">Todos os status</option>
            {ENTRY_STATUSES.map((entryStatus) => (
              <option key={entryStatus} value={entryStatus}>
                {statusLabels[entryStatus]}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="collection-sort">Ordenar por</label>
          <select
            id="collection-sort"
            value={sort}
            onChange={(event) => updateParam("sort", event.target.value)}
          >
            <option value="recent">Atualização recente</option>
            <option value="title">Título</option>
            <option value="progress">Progresso</option>
          </select>
        </div>
      </fieldset>
      <div className="result-summary" aria-live="polite">
        <p>
          {visibleBooks.length}{" "}
          {visibleBooks.length === 1
            ? "livro encontrado"
            : "livros encontrados"}
          {controlsActive ? ` de ${books.length}` : ""}.
        </p>
        {query !== "" && (
          <button
            className="button button--secondary"
            type="button"
            onClick={() => {
              updateParam("q", "");
              requestAnimationFrame(() => searchRef.current?.focus());
            }}
          >
            Limpar busca
          </button>
        )}
      </div>
      {visibleBooks.length === 0 ? (
        <section
          className="content-card no-results"
          aria-labelledby="collection-no-results"
        >
          <h3 id="collection-no-results">
            Nenhum livro corresponde aos controles
          </h3>
          <p>Altere a busca ou o status para ver outros livros.</p>
          <button
            className="button button--secondary"
            type="button"
            onClick={clearControls}
          >
            Limpar busca e filtros
          </button>
        </section>
      ) : (
        <ul className="book-grid">
          {visibleBooks.map((book) => {
            const percentage = progressPercentage(book);
            return (
              <li className="book-card" key={book.id}>
                <Link
                  aria-label={`Abrir detalhes de ${book.title}`}
                  aria-describedby={`book-${book.id}-progress`}
                  className="book-card__link"
                  to={{
                    pathname: `/livros/${encodeURIComponent(book.id)}`,
                    search: `?from=${encodeURIComponent(returnPath)}`,
                  }}
                >
                  <article aria-labelledby={`book-${book.id}-title`}>
                    <p className="status-badge">{statusLabels[book.status]}</p>
                    <h3 id={`book-${book.id}-title`}>{book.title}</h3>
                    <p>{book.author ?? "Autor não informado"}</p>
                    <p id={`book-${book.id}-progress`}>{progressText(book)}</p>
                    {book.totalPages !== undefined &&
                    percentage !== undefined ? (
                      <progress
                        aria-label={`Progresso de ${book.title}`}
                        aria-describedby={`book-${book.id}-progress`}
                        max={book.totalPages}
                        value={Math.min(book.currentPage, book.totalPages)}
                      />
                    ) : (
                      <p className="progress-unknown">
                        Porcentagem indisponível sem total de páginas.
                      </p>
                    )}
                    <p className="book-card__updated">
                      Última atualização: {formatDateTime(book.updatedAt)}
                    </p>
                    <span className="book-card__action" aria-hidden="true">
                      Ver detalhes <span>→</span>
                    </span>
                  </article>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
