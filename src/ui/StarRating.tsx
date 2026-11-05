import { useId, useRef, useState } from "react";
import "./star-rating.css";

export function StarRating({
  value: controlled,
  defaultValue,
  onChange,
  name,
  disabled = false,
  label = "Avaliação",
  onTouched,
}: {
  readonly value?: number;
  readonly defaultValue?: number;
  readonly onChange?: (value: number | undefined) => void;
  readonly onTouched?: () => void;
  readonly name?: string;
  readonly disabled?: boolean;
  readonly label?: string;
}) {
  const id = useId();
  const [local, setLocal] = useState(defaultValue);
  const value = onChange ? controlled : local;
  function choose(next: number | undefined) {
    if (disabled || next === value) return;
    setLocal(next);
    onChange?.(next);
    onTouched?.();
  }
  return (
    <fieldset className="star-rating" disabled={disabled}>
      <legend>{label}</legend>
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      <div className="star-rating__line">
        <div className="star-rating__stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <label key={star} data-filled={star <= (value ?? 0)}>
              <input
                type="radio"
                name={`stars-${id}`}
                value={star}
                checked={value === star}
                aria-label={`${star} de 5 estrelas`}
                onChange={() => choose(star)}
              />
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <path d="m16 2 4.3 8.8 9.7 1.4-7 6.8 1.7 9.6-8.7-4.5-8.7 4.5L9 19l-7-6.8 9.7-1.4Z" />
              </svg>
            </label>
          ))}
        </div>
        {value !== undefined && (
          <button
            type="button"
            className="text-button"
            aria-label="Remover avaliação"
            onClick={() => choose(undefined)}
          >
            Limpar
          </button>
        )}
      </div>
      <span className="star-rating__value">
        {value === undefined ? "Sem avaliação" : `${value} de 5`}
      </span>
    </fieldset>
  );
}
/** Optimistic touch feedback is temporary; a failed write restores the persisted prop. */
export function PersistedRating({
  value,
  save,
  disabled,
}: {
  readonly value?: number;
  readonly save: (next: number | undefined) => Promise<void>;
  readonly disabled?: boolean;
}) {
  const lock = useRef(false);
  const [pending, setPending] = useState<{ value?: number }>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function change(next: number | undefined) {
    if (lock.current || next === value) return;
    lock.current = true;
    setPending({ value: next });
    setMessage("Salvando…");
    setError("");
    try {
      await save(next);
      setMessage(
        next === undefined ? "Avaliação removida." : "Avaliação salva.",
      );
    } catch {
      setMessage("");
      setError(
        "Não foi possível concluir a gravação. Reabra a obra para conferir a avaliação salva.",
      );
    } finally {
      lock.current = false;
      setPending(undefined);
    }
  }
  return (
    <div className="persisted-rating" aria-busy={Boolean(pending)}>
      <StarRating
        value={pending ? pending.value : value}
        onChange={(next) => void change(next)}
        disabled={disabled || Boolean(pending)}
      />
      <span role="status">{message}</span>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
