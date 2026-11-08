import { useEffect, useState } from "react";

/** Mounted for each usable Canvas entry; never remounts the resident world. */
export function CanvasWelcome() {
  const [phase, setPhase] = useState<"visible" | "fading" | "hidden">(
    "visible",
  );
  useEffect(() => {
    const fade = window.setTimeout(() => setPhase("fading"), 3000);
    const hide = window.setTimeout(() => setPhase("hidden"), 3220);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(hide);
    };
  }, []);
  if (phase === "hidden") return null;
  return (
    <div className="exploration-header" data-phase={phase} aria-hidden="true">
      <span className="exploration-header__eyebrow">✦ MUNDO VIVO</span>
      <p className="exploration-header__title">Biblioteca Viva</p>
      <p>O santuário das histórias</p>
    </div>
  );
}
