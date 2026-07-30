import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import type { BookEntry } from "../../domain";
import { safeReturnPath } from "../books/navigationOrigin";
import { BookForm } from "./BookForm";
import { createInputFromValues, updateInputFromValues } from "./formConversion";
import { presentApplicationError } from "./errorMessages";
import {
  emptyBookFormValues,
  valuesFromBook,
  type BookFormErrors,
  type BookFormValues,
} from "./types";

export interface EditorApplication {
  readonly commands: {
    readonly createBookEntry: { execute(input: unknown): Promise<BookEntry> };
    readonly updateBookEntry: { execute(input: unknown): Promise<BookEntry> };
  };
  readonly queries: {
    readonly getBookEntry: { execute(input: unknown): Promise<BookEntry> };
  };
}

function UnavailableEditor() {
  return (
    <section className="content-card" role="alert">
      <h2>Formulário indisponível</h2>
      <p>
        Não foi possível iniciar o armazenamento local. Reabra o aplicativo e
        tente novamente.
      </p>
    </section>
  );
}

export function NewBookPage({
  application,
}: {
  readonly application?: EditorApplication;
}) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<BookFormErrors>({});
  const [generalError, setGeneralError] = useState<string>();
  if (!application) return <UnavailableEditor />;
  const availableApplication = application;

  async function save(values: BookFormValues) {
    setErrors({});
    setGeneralError(undefined);
    const converted = createInputFromValues(values);
    if (!converted.success) {
      setErrors(converted.errors);
      return;
    }
    try {
      const book = await availableApplication.commands.createBookEntry.execute(
        converted.data,
      );
      void navigate(`/livros/${encodeURIComponent(book.id)}`);
    } catch (error: unknown) {
      const presented = presentApplicationError(error);
      setErrors(presented.fieldErrors);
      setGeneralError(presented.message);
    }
  }

  return (
    <section className="content-card" aria-labelledby="book-editor-title">
      <p className="eyebrow">Cadastro</p>
      <h2 id="book-editor-title">Adicionar livro</h2>
      <BookForm
        mode="create"
        values={emptyBookFormValues}
        errors={errors}
        generalError={generalError}
        onSubmit={save}
        onCancel={() => void navigate("/colecao")}
      />
    </section>
  );
}

export function EditBookPage({
  application,
}: {
  readonly application?: EditorApplication;
}) {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnPath = safeReturnPath(searchParams.get("from"));
  const [book, setBook] = useState<BookEntry>();
  const [loadError, setLoadError] = useState<string>();
  const [notFound, setNotFound] = useState(false);
  const [errors, setErrors] = useState<BookFormErrors>({});
  const [generalError, setGeneralError] = useState<string>();

  useEffect(() => {
    if (!application) return;
    let active = true;
    void application.queries.getBookEntry.execute({ id }).then(
      (loaded) => {
        if (active) setBook(loaded);
      },
      (error: unknown) => {
        if (!active) return;
        const presented = presentApplicationError(error);
        setNotFound(presented.message === "Este livro não foi encontrado.");
        setLoadError(presented.message);
      },
    );
    return () => {
      active = false;
    };
  }, [application, id]);

  if (!application) return <UnavailableEditor />;
  if (loadError)
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
  if (!book)
    return (
      <p className="loading-status" role="status">
        Carregando livro…
      </p>
    );
  const availableApplication = application;
  const loadedBook = book;

  async function save(values: BookFormValues) {
    setErrors({});
    setGeneralError(undefined);
    const converted = updateInputFromValues(loadedBook.id, values);
    if (!converted.success) {
      setErrors(converted.errors);
      return;
    }
    try {
      const updated =
        await availableApplication.commands.updateBookEntry.execute(
          converted.data,
        );
      void navigate({
        pathname: `/livros/${encodeURIComponent(updated.id)}`,
        search: `?from=${encodeURIComponent(returnPath)}`,
      });
    } catch (error: unknown) {
      const presented = presentApplicationError(error);
      setErrors(presented.fieldErrors);
      setGeneralError(presented.message);
    }
  }

  return (
    <section className="content-card" aria-labelledby="book-editor-title">
      <p className="eyebrow">Edição</p>
      <h2 id="book-editor-title">Editar livro</h2>
      <BookForm
        mode="edit"
        values={valuesFromBook(book)}
        errors={errors}
        generalError={generalError}
        onSubmit={save}
        onCancel={() =>
          void navigate({
            pathname: `/livros/${encodeURIComponent(book.id)}`,
            search: `?from=${encodeURIComponent(returnPath)}`,
          })
        }
      />
    </section>
  );
}
