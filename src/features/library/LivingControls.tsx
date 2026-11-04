import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  LIVING_OBJECTS,
  type LivingSession,
  type LivingAction,
} from "./livingObjects";

const labels: Record<LivingAction, string> = {
  examine: "Examinar",
  toggle: "Alternar",
  turn: "Girar",
  touch: "Tocar",
};

const actionLabels: Record<string, Partial<Record<LivingAction, string>>> = {
  "living:lamp": { toggle: "Acender / apagar", turn: "Ajustar intensidade" },
  "living:cabinet": { toggle: "Abrir / fechar gaveta" },
  "living:book": { toggle: "Abrir / fechar livro", turn: "Virar página" },
  "living:table": { turn: "Desenrolar / recolher pergaminho" },
  "living:plant": {
    touch: "Estimular folhas",
    toggle: "Florescer / recolher flores",
  },
  "living:seat": { touch: "Comprimir / soltar almofada" },
  "living:shelf": { touch: "Pressionar / soltar entalhe" },
  "living:clock": { turn: "Dar corda" },
  "living:hearth": { toggle: "Acender / apagar brasas" },
};

export function LivingFeedback({ session }: { session: LivingSession }) {
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot);
  const previousObjects = useRef(state.objects);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Context-only clock updates preserve the objects map: no stale toast.
    if (state.objects === previousObjects.current) return;
    previousObjects.current = state.objects;
    setVisible(true);
    setFading(false);
    const fade = window.setTimeout(() => setFading(true), 3600);
    const hide = window.setTimeout(() => setVisible(false), 4000);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(hide);
    };
  }, [state.objects, state.message]);

  if (!visible) return null;
  return (
    <p
      className="living-world-feedback"
      data-fading={fading}
      role="status"
      aria-live="polite"
      data-testid="living-feedback"
    >
      {state.message}
      {state.discovery > 0 && state.discovery < 4
        ? ` · Pista ${state.discovery}/4`
        : ""}
    </p>
  );
}

export function LivingControls({
  session,
  selected,
  onSelect,
  fallback = false,
}: {
  session: LivingSession;
  selected: string | null;
  onSelect: (id: string) => void;
  fallback?: boolean;
}) {
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot);
  return (
    <section className="living-controls" aria-label="Objetos vivos">
      {!fallback && selected && (
        <aside
          className="living-context"
          aria-label="Ações do objeto selecionado"
        >
          {LIVING_OBJECTS.filter((object) => object.objectId === selected).map(
            (object) => (
              <div key={object.objectId}>
                <strong>{object.label}</strong>
                <div>
                  {object.actions.map((action) => (
                    <button
                      className="button button--secondary"
                      key={action}
                      type="button"
                      onClick={() => session.act(object.objectId, action)}
                    >
                      {actionLabels[object.objectId]?.[action] ??
                        labels[action]}
                    </button>
                  ))}
                </div>
              </div>
            ),
          )}
        </aside>
      )}
      <details open={fallback}>
        <summary>Explorar objetos sem o canvas (alternativa acessível)</summary>
        <p>
          Toque nos objetos do mundo para interagir diretamente. Esta lista
          oferece ações alternativas por cômodo.
        </p>
        <p>
          Atmosfera atual: {state.atmosphere}. Ela acompanha o horário local, a
          leitura e descobertas.
        </p>
        <p role="status">{state.message}</p>
        <p>Segredo do Pergaminho: {state.discovery}/4</p>
        {["A", "B", "C", "D", "E"].map((room) => (
          <details
            key={room}
            open={LIVING_OBJECTS.some(
              (o) => o.room === room && o.objectId === selected,
            )}
          >
            <summary>Cômodo {room}</summary>
            {LIVING_OBJECTS.filter((o) => o.room === room).map((o) => (
              <article key={o.objectId}>
                <button
                  className="button button--secondary"
                  type="button"
                  aria-pressed={selected === o.objectId}
                  onClick={() => onSelect(o.objectId)}
                >
                  {o.label}
                </button>
                <p>{o.description}</p>
                <p>
                  Estado:{" "}
                  {state.objects[o.objectId]?.active ? "ativo" : "em repouso"};
                  movimentos: {state.objects[o.objectId]?.turns}
                </p>
                {o.actions.map((action) => (
                  <button
                    className="button button--secondary"
                    type="button"
                    aria-label={`${actionLabels[o.objectId]?.[action] ?? labels[action]} — ${o.label}`}
                    key={action}
                    onClick={() => {
                      onSelect(o.objectId);
                      session.act(o.objectId, action);
                    }}
                  >
                    {actionLabels[o.objectId]?.[action] ?? labels[action]}
                  </button>
                ))}
              </article>
            ))}
          </details>
        ))}
      </details>
    </section>
  );
}
