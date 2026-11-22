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
  const panelRoot = useRef<HTMLElement>(null);
  const focusFrame = useRef<number | null>(null);
  const focusedSpeaker = useRef<string | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const previousActive = useRef(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [journal, setJournal] = useState(false);
  const choices =
    node?.choices.filter((c) => matches(c.condition, state)) ?? [];
  const completedStories = QUEST_IDS.filter(
    (quest) => state.quests[quest].status === "resolved",
  ).length;

  // Avoid expensive full-subtree :has() style invalidation when a story
  // materializes on top of the continuously rendered Three.js world.
  useLayoutEffect(() => {
    const page = panelRoot.current?.closest<HTMLElement>(".library-page");
    if (!page) return;
    if (enabled && (state.active || journal))
      page.dataset.questPanelOpen = "true";
    else delete page.dataset.questPanelOpen;
    return () => {
      delete page.dataset.questPanelOpen;
    };
  }, [enabled, state.active, journal]);

  useEffect(
    () => () => {
      if (
        focusFrame.current !== null &&
        typeof cancelAnimationFrame === "function"
      )
        cancelAnimationFrame(focusFrame.current);
    },
    [],
  );
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
    if (!enabled) {
      if (
        focusFrame.current !== null &&
        typeof cancelAnimationFrame === "function"
      )
        cancelAnimationFrame(focusFrame.current);
      focusFrame.current = null;
      previousActive.current = false;
      focusedSpeaker.current = null;
      return;
    }
    if (state.active) {
      if (
        !previousActive.current &&
        document.activeElement instanceof HTMLElement
      )
        opener.current = document.activeElement;
      const shouldFocus =
        !previousActive.current || focusedSpeaker.current !== state.talkingTo;
      if (shouldFocus) {
        if (
          focusFrame.current !== null &&
          typeof cancelAnimationFrame === "function"
        )
          cancelAnimationFrame(focusFrame.current);
        const speaking = state.talkingTo;
        // Let the card commit and its entrance animation start before focus
        // requests potentially expensive style/layout calculations.
        const focusAfterCommit = () => {
          focusFrame.current = null;
          if (!heading.current?.isConnected) return;
          if (speaking)
            questProbe?.observeQuest?.({
              type: "mark",
              stage: "focusStart",
              inhabitant: speaking,
            });
          heading.current.focus({ preventScroll: true });
          if (speaking)
            questProbe?.observeQuest?.({
              type: "mark",
              stage: "focusEnd",
              inhabitant: speaking,
            });
        };
        if (typeof requestAnimationFrame === "function")
          focusFrame.current = requestAnimationFrame(focusAfterCommit);
        else focusAfterCommit();
      }
      focusedSpeaker.current = state.talkingTo;
    } else {
      if (focusFrame.current !== null) {
        if (typeof cancelAnimationFrame === "function")
          cancelAnimationFrame(focusFrame.current);
        focusFrame.current = null;
      }
      if (previousActive.current)
        opener.current?.focus({ preventScroll: true });
      focusedSpeaker.current = null;
    }
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
      ref={panelRoot}
      className={`rpg-shell${state.active ? " rpg-shell--open" : ""}`}
      data-journal-open={journal ? "true" : undefined}
      aria-label="Histórias da Biblioteca"
    >
      <div className="rpg-tools" aria-label="Atalhos das histórias">
        <button
          type="button"
          className="rpg-tools__beacon rpg-tools__beacon--journal"
          aria-label={`Diário de histórias · ${completedStories}/5`}
          aria-expanded={journal}
          title="Diário de histórias"
          onClick={() => setJournal(!journal)}
        >
          <span className="visually-hidden">Diário de histórias</span>
          <span className="rpg-tools__count" aria-hidden="true">
            {completedStories}/5
          </span>
        </button>
        {!state.active && (
          <button
            type="button"
            className="rpg-tools__beacon rpg-tools__beacon--rift"
            aria-label="A Noite da Fenda Lilás"
            title="A Noite da Fenda Lilás"
            onClick={() => session.open("rift")}
          >
            <span className="visually-hidden">A Noite da Fenda Lilás</span>
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
