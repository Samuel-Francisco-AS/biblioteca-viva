import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { WorldRuntime } from "./worldRuntime";
import { INHABITANTS } from "./inhabitants";
import {
  matches,
  nodeFor,
  textFor,
  type NarrativeSession,
} from "./narrative/session";
import { QUEST_IDS, STORIES } from "./narrative/stories";

export function NarrativePanel({
  session,
  failed,
  enabled = true,
  questProbe,
}: {
  readonly session: NarrativeSession;
  readonly failed: boolean;
  readonly enabled?: boolean;
  readonly questProbe?: Pick<WorldRuntime, "observeQuest">;
}) {
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot);
  const node = nodeFor(state);
  const heading = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const previousActive = useRef(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [journal, setJournal] = useState(false);
  const choices =
    node?.choices.filter((c) => matches(c.condition, state)) ?? [];
  const speaker = INHABITANTS.find((a) => a.key === node?.speakerId);
  useLayoutEffect(() => {
    if (enabled && state.active && state.talkingTo)
      questProbe?.observeQuest?.({
        type: "mark",
        stage: "reactCommit",
        inhabitant: state.talkingTo,
      });
  }, [enabled, state.active, state.revision, state.talkingTo, questProbe]);
  useEffect(() => {
    if (!enabled) return;
    if (state.active) {
      if (
        !previousActive.current &&
        document.activeElement instanceof HTMLElement
      )
        opener.current = document.activeElement;
      if (state.talkingTo)
        questProbe?.observeQuest?.({
          type: "mark",
          stage: "focusStart",
          inhabitant: state.talkingTo,
        });
      heading.current?.focus({ preventScroll: true });
      if (state.talkingTo)
        questProbe?.observeQuest?.({
          type: "mark",
          stage: "focusEnd",
          inhabitant: state.talkingTo,
        });
    } else if (previousActive.current)
      opener.current?.focus({ preventScroll: true });
    previousActive.current = Boolean(state.active);
  }, [state.revision, state.active, state.talkingTo, enabled, questProbe]);
  useEffect(() => {
    if (!enabled || (!state.active && !journal)) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      event.preventDefault();
      if (journal) {
        setJournal(false);
        setConfirmReset(false);
      } else session.close();
    };
    window.addEventListener("keydown", close);
    window.addEventListener("biblioteca-viva:native-back", close);
    return () => {
      window.removeEventListener("keydown", close);
      window.removeEventListener("biblioteca-viva:native-back", close);
    };
  }, [state.active, journal, session, enabled]);
  if (!enabled) return null;
  return (
    <section
      className={`rpg-shell${state.active ? " rpg-shell--open" : ""}`}
      aria-label="Histórias da Biblioteca"
    >
      <div className="rpg-tools">
        <button
          type="button"
          aria-expanded={journal}
          onClick={() => setJournal(!journal)}
        >
          Diário de histórias ·{" "}
          {
            QUEST_IDS.filter((q) => state.quests[q].status === "resolved")
              .length
          }
          /5
        </button>
        {!state.active && (
          <button type="button" onClick={() => session.open("rift")}>
            A Noite da Fenda Lilás
          </button>
        )}
      </div>
      {state.active && node && (
        <article
          className={`rpg-dialogue rpg-dialogue--${node.speakerId}`}
          aria-label="Conversa RPG"
        >
          <header>
            <span className="rpg-sigil" aria-hidden="true">
              {node.speakerId === "lua"
                ? "☾"
                : node.speakerId === "ytha"
                  ? "✧"
                  : node.speakerId === "aryn"
                    ? "❧"
                    : "♜"}
            </span>
            <div>
              <small>{STORIES[state.active].title}</small>
              <h3 ref={heading} tabIndex={-1}>
                {speaker?.label}
              </h3>
            </div>
            <button
              type="button"
              className="rpg-close"
              onClick={() => session.close()}
              aria-label="Adiar conversa e voltar ao mundo"
            >
              Adiar ×
            </button>
          </header>
          <div
            className="rpg-dialogue-content"
            onAnimationStart={(event) => {
              if (event.target === event.currentTarget && state.talkingTo)
                questProbe?.observeQuest?.({
                  type: "mark",
                  stage: "animationStart",
                  inhabitant: state.talkingTo,
                });
            }}
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget && state.talkingTo)
                questProbe?.observeQuest?.({
                  type: "mark",
                  stage: "animationEnd",
                  inhabitant: state.talkingTo,
                });
            }}
          >
            <p className="rpg-voice" key={node.nodeId}>
              {textFor(node, state)}
            </p>
            <p className="rpg-objective">
              <span aria-hidden="true">✦ </span>
              {node.objective}
            </p>
            <div className="rpg-choices">
              {choices.map((choice, index) => (
                <button
                  type="button"
                  key={choice.choiceId}
                  onClick={() =>
                    session.choose(choice.choiceId, state.revision)
                  }
                >
                  <span aria-hidden="true">{index + 1}.</span> {choice.text}
                </button>
              ))}
              {node.outcome && (
                <button
                  type="button"
                  onClick={() => {
                    session.close();
                    setJournal(true);
                  }}
                >
                  Guardar o epílogo no diário
                </button>
              )}
            </div>
            <p className="rpg-feedback" role="status" aria-atomic="true">
              {state.feedback}
            </p>
            {failed && (
              <p className="rpg-fallback">
                Modo de leitura: os acontecimentos seguem na ficção. A encenação
                3D está indisponível; nenhuma animação é confirmada.
              </p>
            )}
            {!failed && (
              <p className="rpg-fallback">
                Você pode adiar e retomar esta história durante a visita.
              </p>
            )}
          </div>
        </article>
      )}
      {journal && (
        <aside className="rpg-journal" aria-label="Diário de quests">
          <header>
            <h3>Histórias desta visita</h3>
            <button
              type="button"
              onClick={() => setJournal(false)}
              aria-label="Fechar diário"
            >
              ×
            </button>
          </header>
          <p>
            Progresso ficcional desta sessão. Recarregar o aplicativo inicia uma
            nova visita. Trocar de aba preserva suas histórias.
          </p>
          <ul>
            {QUEST_IDS.map((q) => {
              const progress = state.quests[q],
                current = nodeFor(state, q);
              return (
                <li key={q}>
                  <h4>{STORIES[q].title}</h4>
                  <p>
                    {progress.status === "available"
                      ? "Por descobrir"
                      : progress.status === "resolved"
                        ? "Concluída"
                        : "Em curso"}{" "}
                    · {current?.objective}
                  </p>
                  {progress.outcome && <p>{progress.outcome}</p>}
                  <button
                    type="button"
                    onClick={() => {
                      session.open(q);
                      setJournal(false);
                    }}
                  >
                    {progress.status === "resolved"
                      ? "Reler epílogo"
                      : progress.status === "available"
                        ? "Descobrir história"
                        : "Retomar história"}
                  </button>
                </li>
              );
            })}
          </ul>
          <details>
            <summary>Lembranças das escolhas recentes</summary>
            <ol>
              {state.history.map((line, i) => (
                <li key={`${state.revision}:${i}`}>{line}</li>
              ))}
            </ol>
          </details>
          {confirmReset ? (
            <div>
              <p>
                Reiniciar apaga apenas o progresso destas cinco histórias e suas
                consequências nesta visita.
              </p>
              <button
                type="button"
                onClick={() => {
                  session.reset();
                  setConfirmReset(false);
                }}
              >
                Reiniciar sessão ficcional
              </button>
              <button type="button" onClick={() => setConfirmReset(false)}>
                Manter histórias
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmReset(true)}>
              Recomeçar estas histórias…
            </button>
          )}
        </aside>
      )}
    </section>
  );
}
