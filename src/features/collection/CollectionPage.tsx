import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import type { BookEntry } from "../../domain";
import { presentApplicationError } from "../entry-editor/errorMessages";
import {
  formatDateTime,
  progressPercentage,
  progressText,
  statusLabels,
} from "../books/bookPresentation";

export interface CollectionApplication {
  readonly queries: {
    readonly listBookEntries: {
      execute(): Promise<readonly BookEntry[]>;
    };
  };
}

export function CollectionPage({
  application,
}: {
  readonly application?: CollectionApplication;
}) {
  const [books, setBooks] = useState<readonly BookEntry[]>();
  const [error, setError] = useState<string>();

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

  if (!application) {
    return (
      <section className="content-card" role="alert">
        <h2>Coleção indisponível</h2>
        <p>Não foi possível iniciar o armazenamento local.</p>
      </section>
    );
  }
  if (error) {
    return (
      <section className="content-card" role="alert">
        <h2>Não foi possível abrir a Coleção</h2>
        <p>{error}</p>
      </section>
    );
  }
  if (!books) return <p role="status">Carregando Coleção…</p>;
  if (books.length === 0) {
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
  }

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
      <ul className="book-grid">
        {books.map((book) => {
          const percentage = progressPercentage(book);
          return (
            <li className="book-card" key={book.id}>
              <article aria-labelledby={`book-${book.id}-title`}>
                <p className="status-badge">{statusLabels[book.status]}</p>
                <h3 id={`book-${book.id}-title`}>{book.title}</h3>
                <p>{book.author ?? "Autor não informado"}</p>
                <p id={`book-${book.id}-progress`}>{progressText(book)}</p>
                {book.totalPages !== undefined && percentage !== undefined ? (
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
                <Link
                  className="text-link"
                  to={`/livros/${encodeURIComponent(book.id)}`}
                >
                  Abrir detalhes de {book.title}
                </Link>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
