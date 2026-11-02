import type { AgencySnapshot } from "./inhabitantAgency";
import type { InhabitantKey } from "./inhabitants";
const names: Record<InhabitantKey, string> = {
  samael: "Samael",
  aryn: "Aryn",
  ytha: "Ytha",
  lua: "Lua",
};
/** Discreet, opt-in semantic companion to the canvas. No relationship scores. */
export function InhabitantLife({
  snapshot,
  failed,
}: {
  readonly snapshot: AgencySnapshot | null;
  readonly failed: boolean;
}) {
  return (
    <section aria-label="Convivência dos habitantes">
      <p>
        {failed
          ? "A convivência 3D está indisponível. As descrições e o último estado confirmado permanecem; nenhum movimento é simulado."
          : snapshot?.mode === "paused"
            ? "Convivência pausada; intenções preservadas."
            : snapshot?.mode === "reduced"
              ? "Movimento reduzido: rotinas e percursos suspensos, sem teletransporte."
              : snapshot
                ? "Os habitantes escolhem suas atividades e encontros. A seleção oferece uma breve pausa; depois a rotina continua."
                : "Aguardando a convivência no mundo 3D."}
      </p>
      {snapshot && (
        <>
          <ul>
            {snapshot.agents.map((a) => (
              <li key={a.id}>
                <strong>{a.label}</strong> — {a.room}. {a.activity}
                {a.state === "navigate" ? " Em deslocamento real." : ""}
              </li>
            ))}
          </ul>
          <p aria-live="polite" aria-atomic="true">
            {snapshot.message}
          </p>
          <details>
            <summary>Encontros e vínculos desta sessão</summary>
            <ul>
              {snapshot.relations.map((r) => (
                <li key={r.id}>
                  <strong>
                    {names[r.pair[0]]} e {names[r.pair[1]]}
                  </strong>
                  : {r.description}
                </li>
              ))}
            </ul>
            {snapshot.recent.length > 0 && (
              <ol>
                {snapshot.recent.map((event, i) => (
                  <li key={`${snapshot.revision - i}:${event}`}>{event}</li>
                ))}
              </ol>
            )}
          </details>
        </>
      )}
    </section>
  );
}
