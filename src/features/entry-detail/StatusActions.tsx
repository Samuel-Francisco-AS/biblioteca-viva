import { useRef, useState } from "react";

import {
  getAllowedStatusTransitions,
  type BookEntry,
  type EntryStatus,
} from "../../domain";
import { presentApplicationError } from "../entry-editor/errorMessages";

function actionLabel(current: EntryStatus, target: EntryStatus): string {
  if (target === "in_progress") {
    return current === "planned" ? "Iniciar leitura" : "Retomar leitura";
  }
  if (target === "paused") return "Pausar leitura";
  if (target === "completed") return "Concluir leitura";
  if (target === "abandoned") return "Abandonar leitura";
  return "Planejar leitura";
}

interface StatusActionsProps {
  readonly book: BookEntry;
  readonly changeStatus: (input: unknown) => Promise<BookEntry>;
  readonly onUpdated: (book: BookEntry, message: string) => void;
}

export function StatusActions({
  book,
  changeStatus,
  onUpdated,
}: StatusActionsProps) {
  const [pendingStatus, setPendingStatus] = useState<EntryStatus>();
  const [error, setError] = useState<string>();
  const savingRef = useRef(false);
  const allowed = getAllowedStatusTransitions(book.status);

  async function change(target: EntryStatus) {
    if (savingRef.current) return;
    savingRef.current = true;
    setPendingStatus(target);
    setError(undefined);
    try {
      const updated = await changeStatus({ id: book.id, status: target });
      onUpdated(
        updated,
        `Status alterado para ${actionLabel(book.status, target).toLowerCase()}.`,
      );
    } catch (failure: unknown) {
      setError(presentApplicationError(failure).message);
    } finally {
      savingRef.current = false;
      setPendingStatus(undefined);
    }
  }

  return (
    <div>
      <div className="inline-actions">
        {allowed.map((status) => (
          <button
            className={
              status === "completed"
                ? "button button--primary"
                : "button button--secondary"
            }
            disabled={pendingStatus !== undefined}
            key={status}
            type="button"
            onClick={() => void change(status)}
          >
            {pendingStatus === status
              ? "Salvando status…"
              : actionLabel(book.status, status)}
          </button>
        ))}
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
