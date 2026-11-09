import type { ReactNode } from "react";

/**
 * F2 mounts its visual arena and touch/accessible HUD into this full-viewport
 * stage. F1 intentionally does not ship a second scene or a mock battle UI.
 */
export function ArenaFrame({
  children,
  onExit,
}: {
  readonly children: ReactNode;
  readonly onExit: () => void;
}) {
  return (
    <section className="arena-frame" aria-label="Arena do Duelo Arcano">
      <div className="arena-frame__stage" data-testid="arena-stage">
        {children}
      </div>
      <button
        type="button"
        className="arena-frame__exit"
        onClick={onExit}
        aria-label="Sair da arena e voltar ao salão; duelo salvo"
      >
        <span aria-hidden="true">←</span>
      </button>
    </section>
  );
}
