import { useRef, useState, type FormEvent } from "react";

import { ENTRY_STATUSES } from "../../domain";
import type { BookFormErrors, BookFormField, BookFormValues } from "./types";

const statusLabels = {
  abandoned: "Abandonado",
  completed: "Concluído",
  in_progress: "Em andamento",
  paused: "Pausado",
  planned: "Planejado",
} as const;

interface BookFormProps {
  readonly errors: BookFormErrors;
  readonly generalError?: string;
  readonly mode: "create" | "edit";
  readonly onCancel: () => void;
  readonly onSubmit: (values: BookFormValues) => Promise<void>;
  readonly values: BookFormValues;
}

export function BookForm({
  errors,
  generalError,
  mode,
  onCancel,
  onSubmit,
  values: initialValues,
}: BookFormProps) {
  const [values, setValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  function change(field: BookFormField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  }

  const describedBy = (field: BookFormField, help?: boolean) =>
    [
      help ? `${field}-help` : undefined,
      errors[field] ? `${field}-error` : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  const hasErrors =
    Object.keys(errors).length > 0 || generalError !== undefined;

  return (
    <form
      className="book-form"
      noValidate
      onSubmit={(event) => void submit(event)}
    >
      {hasErrors && (
        <div
          className="error-summary"
          ref={summaryRef}
          role="alert"
          tabIndex={-1}
        >
          <h3>Não foi possível salvar</h3>
          <p>{generalError ?? "Revise os campos indicados abaixo."}</p>
        </div>
      )}

      <p className="book-form__required">
        Campos marcados como obrigatório precisam ser preenchidos.
      </p>

      <div className="form-field">
        <label htmlFor="title">Título (obrigatório)</label>
        <input
          id="title"
          name="title"
          autoComplete="off"
          value={values.title}
          aria-invalid={errors.title ? "true" : undefined}
          aria-describedby={describedBy("title")}
          onChange={(event) => change("title", event.target.value)}
        />
        {errors.title && (
          <p className="field-error" id="title-error">
            {errors.title}
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="author">Autor (opcional)</label>
        <input
          id="author"
          name="author"
          autoComplete="off"
          value={values.author}
          aria-invalid={errors.author ? "true" : undefined}
          aria-describedby={describedBy("author")}
          onChange={(event) => change("author", event.target.value)}
        />
        {errors.author && (
          <p className="field-error" id="author-error">
            {errors.author}
          </p>
        )}
      </div>

      <div className="book-form__numbers">
        <div className="form-field">
          <label htmlFor="totalPages">Total de páginas (opcional)</label>
          <p className="field-help" id="totalPages-help">
            Use um número inteiro maior que zero.
          </p>
          <input
            id="totalPages"
            name="totalPages"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={values.totalPages}
            aria-invalid={errors.totalPages ? "true" : undefined}
            aria-describedby={describedBy("totalPages", true)}
            onChange={(event) => change("totalPages", event.target.value)}
          />
          {errors.totalPages && (
            <p className="field-error" id="totalPages-error">
              {errors.totalPages}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="currentPage">Página atual (obrigatório)</label>
          <p className="field-help" id="currentPage-help">
            Use um número inteiro, começando em zero.
          </p>
          <input
            id="currentPage"
            name="currentPage"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={values.currentPage}
            disabled={mode === "edit"}
            aria-invalid={errors.currentPage ? "true" : undefined}
            aria-describedby={describedBy("currentPage", true)}
            onChange={(event) => change("currentPage", event.target.value)}
          />
          {mode === "edit" && (
            <p className="field-help">
              O progresso poderá ser alterado no detalhe do livro.
            </p>
          )}
          {errors.currentPage && (
            <p className="field-error" id="currentPage-error">
              {errors.currentPage}
            </p>
          )}
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="status">Status (obrigatório)</label>
        <select
          id="status"
          name="status"
          value={values.status}
          disabled={mode === "edit"}
          aria-invalid={errors.status ? "true" : undefined}
          aria-describedby={describedBy("status")}
          onChange={(event) => change("status", event.target.value)}
        >
          {ENTRY_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
        {mode === "edit" && (
          <p className="field-help">
            O status poderá ser alterado no detalhe do livro.
          </p>
        )}
        {errors.status && (
          <p className="field-error" id="status-error">
            {errors.status}
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="rating">Avaliação (opcional)</label>
        <p className="field-help" id="rating-help">
          Escolha uma nota de 1 a 5.
        </p>
        <select
          id="rating"
          name="rating"
          value={values.rating}
          aria-invalid={errors.rating ? "true" : undefined}
          aria-describedby={describedBy("rating", true)}
          onChange={(event) => change("rating", event.target.value)}
        >
          <option value="">Sem avaliação</option>
          {[1, 2, 3, 4, 5].map((rating) => (
            <option key={rating} value={rating}>
              {rating}
            </option>
          ))}
        </select>
        {errors.rating && (
          <p className="field-error" id="rating-error">
            {errors.rating}
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="startedAt">Data de início (opcional)</label>
        <p className="field-help" id="startedAt-help">
          Informe o dia em que a leitura começou.
        </p>
        <input
          id="startedAt"
          name="startedAt"
          type="date"
          value={values.startedAt}
          disabled={mode === "edit"}
          aria-invalid={errors.startedAt ? "true" : undefined}
          aria-describedby={describedBy("startedAt", true)}
          onChange={(event) => change("startedAt", event.target.value)}
        />
        {mode === "edit" && (
          <p className="field-help">
            A data de início é preservada nesta edição.
          </p>
        )}
        {errors.startedAt && (
          <p className="field-error" id="startedAt-error">
            {errors.startedAt}
          </p>
        )}
      </div>

      <div className="book-form__actions">
        <button
          className="button button--primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Salvando…"
            : mode === "create"
              ? "Salvar livro"
              : "Salvar alterações"}
        </button>
        <button
          className="button button--secondary"
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
