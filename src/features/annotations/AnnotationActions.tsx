import { useRef, useState, type FormEvent } from "react";

import type { AnnotationShareResult } from "../../application";
import type { Note, Quote } from "../../domain";
import { presentApplicationError } from "../entry-editor/errorMessages";

type Props =
  | {
      readonly annotation: Note;
      readonly kind: "note";
      readonly onDelete: (id: string) => Promise<void>;
      readonly onShare: (id: string) => Promise<AnnotationShareResult>;
      readonly onUpdate: (input: unknown) => Promise<void>;
    }
  | {
      readonly annotation: Quote;
      readonly kind: "quote";
      readonly onDelete: (id: string) => Promise<void>;
      readonly onShare: (id: string) => Promise<AnnotationShareResult>;
      readonly onUpdate: (input: unknown) => Promise<void>;
      readonly totalPages?: number;
    };

function label(kind: Props["kind"]): "nota" | "citação" {
  return kind === "note" ? "nota" : "citação";
}

export function AnnotationActions(props: Props) {
  const { annotation, kind } = props;
  const itemLabel = label(kind);
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [content, setContent] = useState(annotation.content);
  const [page, setPage] = useState(
    kind === "quote" && annotation.location?.type === "book"
      ? String(annotation.location.page)
      : "",
  );
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const pageRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLElement>(null);

  function focusAfterRender(target: "content" | "edit" | "delete") {
    requestAnimationFrame(() => {
      if (target === "content") contentRef.current?.focus();
      else if (target === "edit") editButtonRef.current?.focus();
      else deleteButtonRef.current?.focus();
    });
  }

  function cancelEdit() {
    setContent(annotation.content);
    setPage(
      kind === "quote" && annotation.location?.type === "book"
        ? String(annotation.location.page)
        : "",
    );
    setError("");
    setMode("view");
    focusAfterRender("edit");
  }

  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current) return;
    if (content.trim() === "") {
      setError(`Escreva a ${itemLabel} antes de salvar.`);
      contentRef.current?.focus();
      return;
    }
    const parsedPage = page.trim() === "" ? undefined : Number(page);
    if (
      kind === "quote" &&
      parsedPage !== undefined &&
      (!Number.isInteger(parsedPage) ||
        parsedPage <= 0 ||
        (props.totalPages !== undefined && parsedPage > props.totalPages))
    ) {
      setError(
        props.totalPages === undefined
          ? "Informe uma página inteira maior que zero."
          : `Informe uma página inteira entre 1 e ${props.totalPages}.`,
      );
      pageRef.current?.focus();
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await props.onUpdate({
        id: annotation.id,
        content,
        ...(kind === "quote" &&
          parsedPage !== undefined && { page: parsedPage }),
      });
      setMode("view");
      setStatus(`${kind === "note" ? "Nota" : "Citação"} atualizada.`);
      focusAfterRender("edit");
    } catch (failure: unknown) {
      setError(presentApplicationError(failure).message);
      focusAfterRender("content");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function remove() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await props.onDelete(annotation.id);
    } catch (failure: unknown) {
      setError(presentApplicationError(failure).message);
      requestAnimationFrame(() => confirmationRef.current?.focus());
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function share() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const result = await props.onShare(annotation.id);
      setStatus(
        result === "cancelled"
          ? "O compartilhamento foi cancelado."
          : "O menu de compartilhamento foi encerrado.",
      );
    } catch (failure: unknown) {
      setError(presentApplicationError(failure).message);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  if (mode === "edit")
    return (
      <form
        className="compact-form annotation-editor"
        noValidate
        onSubmit={(event) => void update(event)}
      >
        <div className="form-field">
          <label htmlFor={`annotation-content-${annotation.id}`}>
            Editar conteúdo da {itemLabel}
          </label>
          <textarea
            id={`annotation-content-${annotation.id}`}
            ref={contentRef}
            rows={4}
            value={content}
            aria-describedby={
              error ? `annotation-error-${annotation.id}` : undefined
            }
            aria-invalid={error ? "true" : undefined}
            onChange={(event) => setContent(event.target.value)}
          />
        </div>
        {kind === "quote" && (
          <div className="form-field">
            <label htmlFor={`annotation-page-${annotation.id}`}>
              Página (opcional)
            </label>
            <input
              id={`annotation-page-${annotation.id}`}
              ref={pageRef}
              type="number"
              inputMode="numeric"
              min="1"
              max={props.totalPages}
              value={page}
              aria-describedby={
                error ? `annotation-error-${annotation.id}` : undefined
              }
              onChange={(event) => setPage(event.target.value)}
            />
          </div>
        )}
        {error && (
          <p id={`annotation-error-${annotation.id}`} role="alert">
            {error}
          </p>
        )}
        <div className="inline-actions">
          <button
            className="button button--secondary"
            disabled={busy}
            onClick={cancelEdit}
            type="button"
          >
            Cancelar edição
          </button>
          <button
            className="button button--primary"
            disabled={busy}
            type="submit"
          >
            {busy ? "Salvando…" : `Salvar ${itemLabel}`}
          </button>
        </div>
      </form>
    );

  if (mode === "delete")
    return (
      <section
        aria-label={`Confirmar exclusão de ${itemLabel}`}
        className="delete-confirmation"
        ref={confirmationRef}
        role="group"
        tabIndex={-1}
      >
        <p>
          Excluir esta {itemLabel}? O conteúdo será removido permanentemente e a
          ação não pode ser desfeita.
        </p>
        {error && <p role="alert">{error}</p>}
        <div className="inline-actions">
          <button
            className="button button--secondary"
            disabled={busy}
            type="button"
            onClick={() => {
              setError("");
              setMode("view");
              focusAfterRender("delete");
            }}
          >
            Cancelar exclusão
          </button>
          <button
            className="button button--danger"
            disabled={busy}
            type="button"
            onClick={() => void remove()}
          >
            {busy ? "Excluindo…" : `Excluir ${itemLabel}`}
          </button>
        </div>
      </section>
    );

  return (
    <div className="annotation-actions">
      <div className="inline-actions">
        <button
          className="button button--secondary"
          ref={editButtonRef}
          type="button"
          onClick={() => {
            setError("");
            setMode("edit");
            focusAfterRender("content");
          }}
        >
          Editar {itemLabel}
        </button>
        <button
          className="button button--secondary"
          disabled={busy}
          type="button"
          onClick={() => void share()}
        >
          Compartilhar {itemLabel}
        </button>
        <button
          className="button button--danger-outline"
          ref={deleteButtonRef}
          type="button"
          onClick={() => {
            setError("");
            setMode("delete");
            requestAnimationFrame(() => confirmationRef.current?.focus());
          }}
        >
          Excluir {itemLabel}
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      {status && <p role="status">{status}</p>}
    </div>
  );
}
