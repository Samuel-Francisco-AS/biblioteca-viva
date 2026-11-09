import { useId, useState, type ReactNode } from "react";
/** A React-owned expansion remains stable while filter inputs update their parent. */
export function Disclosure({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  const id = useId(),
    [open, setOpen] = useState(false);
  return (
    <div className="arcana-disclosure">
      <button
        type="button"
        className="arcana-disclosure__toggle"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "▾" : "▸"} {label}
      </button>
      <div id={id} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
