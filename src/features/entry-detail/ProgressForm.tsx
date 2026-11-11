import { useRef, useState, type FormEvent } from "react";

import type { BookEntry } from "../../domain";
import { presentApplicationError } from "../entry-editor/errorMessages";

interface ProgressFormProps {
  readonly book: BookEntry;
  readonly updateProgress: (input: unknown) => Promise<BookEntry>;
  readonly onUpdated: (book: BookEntry, message: string) => void;
}

export function ProgressForm({
  book,
  updateProgress,
  onUpdated,
}: ProgressFormProps) {
  const [value, setValue] = useState(String(book.currentPage));
  const [error, setError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);
  const fieldRef = useRef<HTMLInputElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingRef.current) return;
    const page = Number(value);
    if (value.trim() === "" || !Number.isSafeInteger(page) || page < 0) {
      setError("Informe uma página inteira, igual ou maior que zero.");
      fieldRef.current?.focus();
      return;
    }
    if (book.totalPages !== undefined && page > book.totalPages) {
      setError(`A página atual não pode ultrapassar ${book.totalPages}.`);
      fieldRef.current?.focus();
      return;
    }
    savingRef.current = true;
    setIsSaving(true);
    setError(undefined);
    try {
      const updated = await updateProgress({ id: book.id, currentPage: page });
      onUpdated(updated, "Progresso atualizado.");
    } catch (failure: unknown) {
      setError(presentApplicationError(failure).message);
      requestAnimationFrame(() => fieldRef.current?.focus());
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  if (book.status === "completed") {
    return <p>Retome a leitura antes de alterar o progresso.</p>;
  }

  return (
    <form
      className="folio-progress-form"
      noValidate
      onSubmit={(event) => void submit(event)}
    >
      <div className="form-field">
        <label htmlFor="detail-current-page">Página atual (obrigatório)</label>
        <div className="folio-page-stepper">
          <button
            className="folio-step"
            type="button"
            aria-label="Diminuir uma página"
            disabled={
              isSaving ||
              value.trim() === "" ||
              !Number.isSafeInteger(Number(value)) ||
              Number(value) <= 0
            }
            onClick={() => setValue(String(Number(value) - 1))}
          >
            −
          </button>
          <input
            id="detail-current-page"
            ref={fieldRef}
            type="number"
            inputMode="numeric"
            min="0"
            max={book.totalPages}
            step="1"
            value={value}
            aria-describedby={error ? "detail-current-page-error" : undefined}
            aria-invalid={error ? "true" : undefined}
            onChange={(event) => setValue(event.target.value)}
          />
          <button
            className="folio-step"
            type="button"
            aria-label="Avançar uma página"
            disabled={
              isSaving ||
              value.trim() === "" ||
              !Number.isSafeInteger(Number(value)) ||
              Number(value) < 0 ||
              (book.totalPages !== undefined &&
                Number(value) >= book.totalPages)
            }
            onClick={() => setValue(String(Number(value) + 1))}
          >
            +
          </button>
          <span className="folio-page-total">de {book.totalPages ?? "—"}</span>
        </div>
        {error && (
          <p className="field-error" id="detail-current-page-error">
            {error}
          </p>
        )}
      </div>
      <button
        className="button button--primary"
        type="submit"
        disabled={isSaving}
      >
        {isSaving ? "Salvando progresso…" : "Salvar progresso"}
      </button>
    </form>
  );
}
