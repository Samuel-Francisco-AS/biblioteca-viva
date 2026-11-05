import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import "./pickers.css";

type ValueChange = (event: { target: { value: string } }) => void;
/** A DOM modal: browser top layer, focus containment and Android Back, no platform picker. */
function PickerSheet({
  title,
  children,
  close,
  id,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
  id: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  }, [close]);
  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    const back = (event: Event) => {
      if (Array.from(document.querySelectorAll("dialog[open]")).at(-1) !== node)
        return;
      event.preventDefault();
      event.stopImmediatePropagation();
      closeRef.current();
    };
    // Capture before page guards/disclosures; close only the topmost surface.
    window.addEventListener("biblioteca-viva:native-back", back, true);
    return () =>
      window.removeEventListener("biblioteca-viva:native-back", back, true);
  }, []);
  return createPortal(
    <dialog
      ref={dialog}
      id={id}
      className="bv-picker-sheet"
      aria-labelledby={`${id}-title`}
      onCancel={(e) => {
        e.preventDefault();
        e.stopPropagation();
        close();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") e.stopPropagation();
      }}
    >
      <header>
        <h2 id={`${id}-title`}>{title}</h2>
        <button type="button" className="text-button" onClick={close}>
          Cancelar
        </button>
      </header>
      {children}
    </dialog>,
    document.body,
  );
}
function labelOf(button: HTMLButtonElement | null) {
  return (
    button?.getAttribute("aria-label") ??
    (Array.from(button?.labels ?? [])
      .map((label) =>
        Array.from(label.childNodes)
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent)
          .join("")
          .trim(),
      )
      .join(" ") ||
      "Escolher")
  );
}
type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "onChange" | "multiple" | "size" | "value" | "defaultValue"
> & {
  value?: string | number;
  defaultValue?: string | number;
  onChange?: ValueChange;
};
export function BVSelectSheet({
  children,
  value,
  defaultValue,
  onChange,
  name,
  id,
  disabled,
  required,
  className,
  ...aria
}: SelectProps) {
  const options = Children.toArray(children).flatMap((child) =>
    isValidElement<{
      value?: string | number;
      children?: ReactNode;
      disabled?: boolean;
    }>(child) && child.type === "option"
      ? [
          {
            value: String(child.props.value ?? ""),
            label: child.props.children,
            disabled: child.props.disabled,
          },
        ]
      : [],
  );
  const firstValue = options[0]?.value ?? "";
  const initialValue = String(defaultValue ?? firstValue);
  const [local, setLocal] = useState(initialValue);
  const current = String(value ?? local);
  const [open, setOpen] = useState(false);
  const [sheetTitle, setSheetTitle] = useState("Escolher");
  const [draft, setDraft] = useState(current);
  const trigger = useRef<HTMLButtonElement>(null);
  const backing = useRef<HTMLInputElement>(null);
  const sheetId = useId();
  useEffect(() => {
    const form = backing.current?.form;
    const reset = () => setLocal(initialValue);
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [initialValue]);
  const close = () => {
    const sheet = document.getElementById(sheetId);
    if (sheet instanceof HTMLDialogElement) sheet.close();
    setOpen(false);
    trigger.current?.focus();
  };
  return (
    <>
      <button
        ref={trigger}
        id={id}
        type="button"
        className={`bv-picker-trigger ${className ?? ""}`}
        role="combobox"
        aria-haspopup="dialog"
        aria-controls={sheetId}
        aria-expanded={open}
        aria-required={required}
        aria-label={aria["aria-label"]}
        aria-labelledby={aria["aria-labelledby"]}
        aria-describedby={aria["aria-describedby"]}
        aria-invalid={aria["aria-invalid"]}
        disabled={disabled}
        onClick={() => {
          setSheetTitle(labelOf(trigger.current));
          setDraft(current);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (["ArrowDown", "ArrowUp"].includes(e.key)) {
            e.preventDefault();
            setSheetTitle(labelOf(trigger.current));
            setDraft(current);
            setOpen(true);
          }
        }}
      >
        {options.find((option) => option.value === current)?.label ??
          "Escolher"}
        <span aria-hidden="true">⌄</span>
      </button>
      <input
        ref={backing}
        className="bv-picker-value"
        tabIndex={-1}
        aria-hidden="true"
        name={name}
        value={current}
        onChange={() => {}}
        required={required}
        disabled={disabled}
        onInvalid={(e) => {
          e.preventDefault();
          if (
            backing.current?.form?.querySelector(
              "input:invalid, textarea:invalid, select:invalid",
            ) !== backing.current
          )
            return;
          setSheetTitle(labelOf(trigger.current));
          setDraft(current);
          setOpen(true);
        }}
      />
      {open && (
        <PickerSheet title={sheetTitle} close={close} id={sheetId}>
          <fieldset className="bv-picker-options">
            <legend className="visually-hidden">Opções</legend>
            {options.map((option) => (
              <label key={option.value}>
                <input
                  autoFocus={option.value === current}
                  type="radio"
                  name={sheetId}
                  value={option.value}
                  checked={draft === option.value}
                  disabled={option.disabled}
                  onChange={() => setDraft(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </fieldset>
          <button
            className="button button--primary bv-picker-confirm"
            type="button"
            onClick={() => {
              setLocal(draft);
              onChange?.({ target: { value: draft } });
              close();
            }}
          >
            Confirmar
          </button>
        </PickerSheet>
      )}
    </>
  );
}

type DateProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "defaultValue"
> & {
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  onChange?: ValueChange;
};
const iso = (year: number, month: number, day: number) =>
  `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
function civilMonth(year: number, month: number) {
  const date = new Date(0);
  date.setFullYear(year, month, 1);
  date.setHours(12, 0, 0, 0);
  return date;
}
function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  return (
    y >= 1 &&
    y <= 9999 &&
    m >= 1 &&
    m <= 12 &&
    d >= 1 &&
    d <= new Date(Date.UTC(y < 100 ? y + 400 : y, m, 0)).getUTCDate()
  );
}
export function BVDatePicker({
  value,
  defaultValue,
  onChange,
  name,
  id,
  disabled,
  required,
  min,
  max,
  className,
  ...aria
}: DateProps) {
  const [local, setLocal] = useState(String(defaultValue ?? ""));
  const current = String(value ?? local);
  const [open, setOpen] = useState(false);
  const [sheetTitle, setSheetTitle] = useState("Escolher");
  const [draft, setDraft] = useState(current);
  const [month, setMonth] = useState(() => new Date());
  const trigger = useRef<HTMLButtonElement>(null),
    backing = useRef<HTMLInputElement>(null);
  const sheetId = useId();
  useEffect(() => {
    const form = backing.current?.form;
    const reset = () => setLocal(String(defaultValue ?? ""));
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [defaultValue]);
  const allowed = (v: string) =>
    validDate(v) && (!min || v >= String(min)) && (!max || v <= String(max));
  const close = () => {
    const sheet = document.getElementById(sheetId);
    if (sheet instanceof HTMLDialogElement) sheet.close();
    setOpen(false);
    trigger.current?.focus();
  };
  const start = () => {
    setSheetTitle(labelOf(trigger.current));
    setDraft(current);
    const [y, m] = current.split("-").map(Number);
    setMonth(validDate(current) ? civilMonth(y, m - 1) : new Date());
    setOpen(true);
  };
  const year = month.getFullYear(),
    mo = month.getMonth();
  const count = new Date(
      Date.UTC(year < 100 ? year + 400 : year, mo + 1, 0),
    ).getUTCDate(),
    offset = civilMonth(year, mo).getDay();
  const parts = draft.split("-");
  return (
    <>
      <button
        ref={trigger}
        id={id}
        type="button"
        className={`bv-picker-trigger ${className ?? ""}`}
        aria-haspopup="dialog"
        aria-controls={sheetId}
        aria-expanded={open}
        aria-label={aria["aria-label"]}
        aria-labelledby={aria["aria-labelledby"]}
        aria-describedby={aria["aria-describedby"]}
        aria-invalid={aria["aria-invalid"]}
        disabled={disabled}
        onClick={start}
      >
        {validDate(current)
          ? current.split("-").reverse().join("/")
          : "Escolher data"}
        <span aria-hidden="true">✧</span>
      </button>
      <input
        ref={backing}
        type="text"
        className="bv-picker-value"
        tabIndex={-1}
        aria-hidden="true"
        name={name}
        value={current}
        onChange={() => {}}
        required={required}
        disabled={disabled}
        pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
        onInvalid={(e) => {
          e.preventDefault();
          if (
            backing.current?.form?.querySelector(
              "input:invalid, textarea:invalid, select:invalid",
            ) !== backing.current
          )
            return;
          start();
        }}
      />
      {open && (
        <PickerSheet title={sheetTitle} close={close} id={sheetId}>
          <div className="bv-date-parts">
            {["Ano", "Mês", "Dia"].map((label, i) => (
              <label key={label}>
                {label}
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus={i === 0}
                  maxLength={i === 0 ? 4 : 2}
                  value={parts[i] ?? ""}
                  onChange={(e) => {
                    const next = [...parts];
                    next[i] = e.target.value.replace(/\D/g, "");
                    setDraft(next.join("-"));
                  }}
                  onBlur={() => {
                    const [y, m, d] = draft.split("-").map(Number);
                    if (y && m && d) {
                      const normalized = iso(y, m, d);
                      setDraft(normalized);
                      if (validDate(normalized)) setMonth(civilMonth(y, m - 1));
                    }
                  }}
                />
              </label>
            ))}
          </div>
          <div className="bv-calendar-heading">
            <button
              className="text-button"
              aria-label="Mês anterior"
              type="button"
              disabled={year === 1 && mo === 0}
              onClick={() => setMonth(civilMonth(year, mo - 1))}
            >
              ‹
            </button>
            <strong aria-live="polite">
              {month.toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </strong>
            <button
              className="text-button"
              aria-label="Próximo mês"
              type="button"
              disabled={year === 9999 && mo === 11}
              onClick={() => setMonth(civilMonth(year, mo + 1))}
            >
              ›
            </button>
          </div>
          <div className="bv-calendar">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
              <span key={i} aria-hidden="true">
                {d}
              </span>
            ))}
            {Array.from({ length: offset }, (_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {Array.from({ length: count }, (_, i) => {
              const date = iso(year, mo + 1, i + 1);
              return (
                <button
                  key={date}
                  type="button"
                  disabled={!allowed(date)}
                  aria-label={date.split("-").reverse().join("/")}
                  aria-pressed={draft === date}
                  onClick={() => setDraft(date)}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="form-actions">
            {!required && (
              <button
                type="button"
                className="text-button"
                onClick={() => setDraft("")}
              >
                Sem data
              </button>
            )}
            <button
              type="button"
              className="button button--primary"
              disabled={draft ? !allowed(draft) : required}
              onClick={() => {
                setLocal(draft);
                onChange?.({ target: { value: draft } });
                close();
              }}
            >
              Confirmar
            </button>
          </div>
        </PickerSheet>
      )}
    </>
  );
}
