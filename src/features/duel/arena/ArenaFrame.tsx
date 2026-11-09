import type { ReactNode } from "react";

/** Full-viewport safe-area shell for the ephemeral arena and accessible HUD. */
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
        aria-label="Pausar e salvar"
      >
        <span aria-hidden="true">Ⅱ</span>
      </button>
    </section>
  );
}
