import { StarRating } from "../../ui/StarRating";
import { BVSelectSheet, BVDatePicker } from "../../ui/BVPicker";
import { RitualChapter } from "./RitualFields";
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

  const hasErrors =
    Object.keys(errors).length > 0 || generalError !== undefined;
  function inscription(
    field: BookFormField,
    label: string,
    type = "text",
    locked = false,
  ) {
    const Field = type === "date" ? BVDatePicker : "input";
    return (
      <div className="form-field inscription">
        <label htmlFor={field}>{label}</label>
        <Field
          id={field}
          name={field}
          type={type}
          inputMode={type === "number" ? "numeric" : undefined}
          min={type === "number" ? (field === "totalPages" ? 1 : 0) : undefined}
          step={type === "number" ? 1 : undefined}
          value={values[field]}
          disabled={locked}
          aria-invalid={errors[field] ? true : undefined}
          aria-describedby={errors[field] ? `${field}-error` : undefined}
          onChange={(event) => change(field, event.target.value)}
        />
        {errors[field] && (
          <p className="field-error" id={`${field}-error`}>
            {errors[field]}
          </p>
        )}
      </div>
    );
  }
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

      <RitualChapter number="I" title="Na folha de rosto">
        {inscription("title", "Título (obrigatório)")}
        {inscription("author", "Autor (opcional)")}
      </RitualChapter>
      <RitualChapter number="II" title="Um marcador na jornada">
        <div className="ritual-pair">
          {inscription(
            "currentPage",
            "Página atual (obrigatório)",
            "number",
            mode === "edit",
          )}
          {inscription("totalPages", "Total de páginas (opcional)", "number")}
        </div>
        <div className="form-field">
          <label htmlFor="status">Status (obrigatório)</label>
          <BVSelectSheet
            id="status"
            name="status"
            value={values.status}
            disabled={mode === "edit"}
            onChange={(event) => change("status", event.target.value)}
          >
            {ENTRY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </BVSelectSheet>
          {mode === "edit" && (
            <p className="field-help">
              O progresso e o status podem ser alterados no detalhe do livro.
            </p>
          )}
        </div>
      </RitualChapter>
      <details className="ritual-marginalia">
        <summary>Impressões e data de início</summary>
        <div className="ritual-chapter__body">
          <div className="form-field">
            <StarRating
              name="rating"
              value={values.rating ? Number(values.rating) : undefined}
              onChange={(value) =>
                change("rating", value === undefined ? "" : String(value))
              }
              disabled={isSubmitting}
            />
            {errors.rating && <p className="field-error">{errors.rating}</p>}
          </div>
          {inscription(
            "startedAt",
            "Data de início (opcional)",
            "date",
            mode === "edit",
          )}
        </div>
      </details>

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
