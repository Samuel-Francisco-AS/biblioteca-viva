import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { BookEntry } from "../../domain";
import { presentApplicationError } from "./errorMessages";

interface DetailApplication {
  readonly queries: {
    readonly getBookEntry: { execute(input: unknown): Promise<BookEntry> };
  };
}

export function BookDetailPlaceholder({
  application,
}: {
  readonly application?: DetailApplication;
}) {
  const { id = "" } = useParams();
  const [book, setBook] = useState<BookEntry>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    if (!application) return;
    let active = true;
    void application.queries.getBookEntry.execute({ id }).then(
      (loaded) => {
        if (active) setBook(loaded);
      },
      (failure: unknown) => {
        if (active) setError(presentApplicationError(failure).message);
      },
    );
    return () => {
      active = false;
    };
  }, [application, id]);
  if (!application)
    return (
      <section className="content-card" role="alert">
        <h2>Detalhe indisponível</h2>
        <p>Não foi possível iniciar o armazenamento local.</p>
      </section>
    );
  if (error)
    return (
      <section className="content-card" role="alert">
        <h2>Não foi possível abrir o livro</h2>
        <p>{error}</p>
        <Link className="text-link" to="/colecao">
          Voltar à Coleção
        </Link>
      </section>
    );
  if (!book)
    return (
      <p className="loading-status" role="status">
        Carregando livro…
      </p>
    );
  return (
    <section className="content-card" aria-labelledby="book-detail-title">
      <p className="eyebrow">Livro salvo</p>
      <h2 id="book-detail-title">{book.title}</h2>
      <p>{book.author ?? "Autor não informado"}</p>
      <p className="content-card__notice">
        O detalhe completo será implementado no Prompt 8.
      </p>
      <div className="inline-actions">
        <Link
          className="button button--primary"
          to={`/livros/${encodeURIComponent(book.id)}/editar`}
        >
          Editar livro
        </Link>
        <Link className="button button--secondary" to="/colecao">
          Voltar à Coleção
        </Link>
      </div>
    </section>
  );
}
