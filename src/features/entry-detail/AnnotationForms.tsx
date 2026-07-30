import { useRef, useState, type FormEvent } from "react";

import type { Note, Quote } from "../../domain";
import { presentApplicationError } from "../entry-editor/errorMessages";

export function NoteForm({
  entryId,
  addNote,
  onAdded,
}: {
  readonly entryId: string;
  readonly addNote: (input: unknown) => Promise<Note>;
  readonly onAdded: (note: Note, message: string) => void;
}) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingRef.current) return;
    if (content.trim() === "") {
      setError("Escreva a nota antes de salvar.");
      fieldRef.current?.focus();
      return;
    }
    savingRef.current = true;
    setIsSaving(true);
    setError(undefined);
    try {
      const note = await addNote({ entryId, content });
      setContent("");
      onAdded(note, "Nota adicionada.");
    } catch (failure: unknown) {
      setError(presentApplicationError(failure).message);
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  return (
    <form
      className="compact-form"
      noValidate
      onSubmit={(event) => void submit(event)}
    >
      <div className="form-field">
        <label htmlFor="note-content">Nota (obrigatório)</label>
        <p className="field-help" id="note-content-help">
          Use texto simples.
        </p>
        <textarea
          id="note-content"
          ref={fieldRef}
          rows={4}
          value={content}
          aria-describedby={`note-content-help${error ? " note-content-error" : ""}`}
          aria-invalid={error ? "true" : undefined}
          onChange={(event) => setContent(event.target.value)}
        />
        {error && (
          <p className="field-error" id="note-content-error">
            {error}
          </p>
        )}
      </div>
      <button
        className="button button--primary"
        type="submit"
        disabled={isSaving}
      >
        {isSaving ? "Salvando nota…" : "Adicionar nota"}
      </button>
    </form>
  );
}

export function QuoteForm({
  entryId,
  totalPages,
  addQuote,
  onAdded,
}: {
  readonly entryId: string;
  readonly totalPages?: number;
  readonly addQuote: (input: unknown) => Promise<Quote>;
  readonly onAdded: (quote: Quote, message: string) => void;
}) {
  const [content, setContent] = useState("");
  const [page, setPage] = useState("");
  const [errors, setErrors] = useState<{
    readonly content?: string;
    readonly page?: string;
  }>({});
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const pageRef = useRef<HTMLInputElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingRef.current) return;
    const nextErrors: { content?: string; page?: string } = {};
    if (content.trim() === "")
      nextErrors.content = "Escreva a citação antes de salvar.";
    const parsedPage = page.trim() === "" ? undefined : Number(page);
    if (
      parsedPage !== undefined &&
      (!Number.isInteger(parsedPage) || parsedPage <= 0)
    ) {
      nextErrors.page = "Informe uma página inteira maior que zero.";
    } else if (
      parsedPage !== undefined &&
      totalPages !== undefined &&
      parsedPage > totalPages
    ) {
      nextErrors.page = `A página não pode ultrapassar ${totalPages}.`;
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      (nextErrors.content ? contentRef.current : pageRef.current)?.focus();
      return;
    }
    savingRef.current = true;
    setIsSaving(true);
    setErrors({});
    try {
      const quote = await addQuote({
        entryId,
        content,
        ...(parsedPage !== undefined && { page: parsedPage }),
      });
      setContent("");
      setPage("");
      onAdded(quote, "Citação adicionada.");
    } catch (failure: unknown) {
      setErrors({ content: presentApplicationError(failure).message });
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  return (
    <form
      className="compact-form"
      noValidate
      onSubmit={(event) => void submit(event)}
    >
      <div className="form-field">
        <label htmlFor="quote-content">Citação (obrigatório)</label>
        <p className="field-help" id="quote-content-help">
          Use texto simples.
        </p>
        <textarea
          id="quote-content"
          ref={contentRef}
          rows={4}
          value={content}
          aria-describedby={`quote-content-help${errors.content ? " quote-content-error" : ""}`}
          aria-invalid={errors.content ? "true" : undefined}
          onChange={(event) => setContent(event.target.value)}
        />
        {errors.content && (
          <p className="field-error" id="quote-content-error">
            {errors.content}
          </p>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="quote-page">Página (opcional)</label>
        <p className="field-help" id="quote-page-help">
          Informe um inteiro maior que zero
          {totalPages === undefined ? "." : ` e até ${totalPages}.`}
        </p>
        <input
          id="quote-page"
          ref={pageRef}
          type="number"
          inputMode="numeric"
          min="1"
          max={totalPages}
          step="1"
          value={page}
          aria-describedby={`quote-page-help${errors.page ? " quote-page-error" : ""}`}
          aria-invalid={errors.page ? "true" : undefined}
          onChange={(event) => setPage(event.target.value)}
        />
        {errors.page && (
          <p className="field-error" id="quote-page-error">
            {errors.page}
          </p>
        )}
      </div>
      <button
        className="button button--primary"
        type="submit"
        disabled={isSaving}
      >
        {isSaving ? "Salvando citação…" : "Adicionar citação"}
      </button>
    </form>
  );
}
