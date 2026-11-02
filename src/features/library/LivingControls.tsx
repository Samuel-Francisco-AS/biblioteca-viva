import { useSyncExternalStore } from "react";
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
export function LivingControls({
  session,
  selected,
  onSelect,
}: {
  session: LivingSession;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot);
  return (
    <section className="living-controls" aria-label="Objetos vivos">
      <h3>Objetos vivos</h3>
      <fieldset>
        <legend>Atmosfera</legend>
        {(["tranquila", "noturna", "encantada"] as const).map((a) => (
          <button
            className="button button--secondary"
            type="button"
            key={a}
            aria-pressed={state.atmosphere === a}
            onClick={() => session.setAtmosphere(a)}
          >
            {a}
          </button>
        ))}
      </fieldset>
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
    </section>
  );
}
