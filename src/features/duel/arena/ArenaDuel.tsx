import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { DuelAction } from "../../../domain/duel/contracts";
import {
  abilityText,
  kindNames,
  modeNames,
  rulesText,
} from "../../../domain/duel/text";
import { traditions } from "../../../domain/duel/catalogue";
import type { ArenaAnchor } from "./arenaScene";
import { ArenaCanvas } from "./ArenaCanvas";
import { ArenaFrame } from "./ArenaFrame";
import {
  arenaActionsForSelection,
  type ArenaCardView,
  type ArenaPlayerView,
} from "./arenaModel";
import { useArenaSession } from "./useArenaSession";

function ArenaDialog({
  label,
  children,
  onClose,
}: {
  readonly label: string;
  readonly children: ReactNode;
  readonly onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialog.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="arena-dialog"
      aria-label={label}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <button
        className="arena-dialog-close"
        aria-label="Fechar painel"
        onClick={onClose}
      >
        ×
      </button>
      {children}
    </dialog>
  );
}
const actionName = (a: DuelAction, card?: ArenaCardView) =>
  a.type === "attack"
    ? "Atacar"
    : a.type === "play"
      ? card?.kind === "creature"
        ? "Invocar"
        : card?.kind === "artifact"
          ? "Posicionar artefato"
          : "Conjurar"
      : a.type === "activate"
        ? `Ativar · ${card?.definition.abilities.find((b) => b.id === a.ability)?.cost ?? 0} ✦`
        : "Confirmar";
const eventNames: Record<string, string> = {
  summon: "Invocação",
  spell: "Feitiço",
  artifact: "Artefato",
  attack: "Ataque",
  damage: "Dano",
  heal: "Cura",
  shield: "Escudo",
  empower: "Fortalecimento",
  exhaust: "Exaustão",
  shatter: "Destruição",
  death: "Derrota",
  roll: "Caos",
  activate: "Ativação",
  draw: "Compra",
  scout: "Perscrutar",
  burn: "Mão cheia",
  fatigue: "Fadiga",
  turn: "Turno",
  pause: "Pausa",
  resume: "Retomada",
  result: "Resultado",
};

export function ArenaDuel() {
  const { id = "" } = useParams();
  return <ArenaSession key={id} id={id} />;
}
function ArenaSession({ id }: { readonly id: string }) {
  const navigate = useNavigate();
  const { view, busy, error, visible, submit, refresh, pause, resume } =
    useArenaSession(id);
  const [selection, setSelection] = useState<string>();
  const [target, setTarget] = useState<string>();
  const [inspect, setInspect] = useState(false);
  const [log, setLog] = useState(false);
  const [abandon, setAbandon] = useState(false);
  const [anchors, setAnchors] = useState<ArenaAnchor[]>([]);
  const [feedback, setFeedback] = useState("");
  const revision = useRef<number | undefined>(undefined);
  const offered = useMemo(
    () => (view ? arenaActionsForSelection(view, selection) : []),
    [view, selection],
  );
  const targets = useMemo(
    () =>
      new Set(
        offered.flatMap((a) => ("target" in a && a.target ? [a.target] : [])),
      ),
    [offered],
  );
  const card =
    view &&
    [
      ...view.hand,
      ...view.player.units,
      ...view.opponent.units,
      ...view.player.artifacts,
      ...view.opponent.artifacts,
    ].find((c) => c.id === selection);
  const choices = offered.filter(
    (a) => !("target" in a) || !a.target || a.target === target,
  );
  const select = (id: string) => {
    if (targets.has(id)) {
      setTarget(id);
      return;
    }
    setSelection((old) => (old === id ? undefined : id));
    setTarget(undefined);
  };
  const cancel = useCallback(() => {
    setSelection(undefined);
    setTarget(undefined);
  }, []);
  const command = async (a: DuelAction) => {
    if (await submit(a)) cancel();
  };
  const exit = async (path = "/") => {
    if (busy) return;
    if (await pause()) void navigate(path);
  };
  const back = useCallback(() => {
    if (inspect) setInspect(false);
    else if (log) setLog(false);
    else if (abandon) setAbandon(false);
    else if (selection) cancel();
    else if (view?.status === "active") void pause();
    else void navigate("/");
  }, [inspect, log, abandon, selection, cancel, view?.status, pause, navigate]);
  useEffect(() => {
    const listener = (e: Event) => {
      e.preventDefault();
      back();
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector("dialog[open]")) {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener("biblioteca-viva:native-back", listener);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("biblioteca-viva:native-back", listener);
      window.removeEventListener("keydown", escape);
    };
  }, [back]);
  useEffect(() => {
    if (!view) return;
    const old = revision.current;
    revision.current = view.revision;
    if (old === undefined || old === view.revision) return;
    const text = view.events
      .filter((e) => !["draw", "turn"].includes(e.type))
      .map(
        (e) =>
          `${eventNames[e.type]}${e.value !== undefined ? ` ${e.type === "damage" ? "−" : "+"}${e.value}` : ""}`,
      )
      .join(" · ");
    const show = window.setTimeout(() => setFeedback(text), 0);
    const hide = window.setTimeout(() => setFeedback(""), 1700);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [view]);
  const name = (id: string) =>
    id === "p0"
      ? "Você"
      : id === "p1"
        ? view?.opponent.name
        : ([
            ...(view?.player.units ?? []),
            ...(view?.opponent.units ?? []),
            ...(view?.player.artifacts ?? []),
            ...(view?.opponent.artifacts ?? []),
          ].find((c) => c.id === id)?.name ?? "Alvo");
  const duelist = (p: ArenaPlayerView, own: boolean) => (
    <button
      className={`arena-duelist ${own ? "arena-own" : "arena-enemy"}`}
      data-target={targets.has(p.id)}
      data-aimed={target === p.id}
      aria-label={`${p.name}, vida ${p.life}, energia ${p.energy} de ${p.maximum}${targets.has(p.id) ? ", alvo válido" : ""}`}
      onClick={() => {
        if (targets.has(p.id)) setTarget(p.id);
      }}
    >
      <span
        className="arena-portrait"
        data-affinity={p.affinity}
        aria-hidden="true"
      >
        {traditions[p.affinity]?.symbol ?? "◇"}
      </span>
      <span className="arena-duelist-name">
        {p.name}
        <small>
          ▤ {p.deckCount} · ✋ {p.handCount}
        </small>
      </span>
      <strong className="arena-life">♥ {p.life}</strong>
      <span className="arena-energy">
        ✦ {p.energy}/{p.maximum}
      </span>
    </button>
  );
  return (
    <ArenaFrame
      onExit={() => {
        void pause();
      }}
    >
      {!view ? (
        <div className="arena-loading" role="status">
          {error || "Abrindo o círculo…"}
          <button onClick={() => void navigate("/arcanario/duelos")}>
            Salão
          </button>
        </div>
      ) : (
        <div
          className="arena-game"
          data-testid="arena-duel"
          data-state={view.status}
          data-mode={view.mode}
          data-active={view.active}
          data-revision={view.revision}
        >
          <header className="arena-top">
            {duelist(view.opponent, false)}
            <span className="arena-turn" aria-live="polite">
              {view.turn} · {view.active === 0 ? "Seu turno" : "Rival"}
              <small>
                {modeNames[view.mode]}
                {view.mode !== "official" ? " · experimental" : ""}
              </small>
            </span>
          </header>
          <div className="arena-board" data-testid="arena-board">
            <ArenaCanvas
              view={view}
              selected={selection}
              targets={targets}
              active={visible && view.status === "active" && !inspect && !log}
              onAnchors={setAnchors}
            />
            <div className="arena-hit-layer">
              {[view.opponent, view.player].map((p, side) => (
                <section
                  key={p.id}
                  aria-label={
                    side === 1
                      ? "Suas criaturas e artefatos"
                      : "Criaturas e artefatos adversários"
                  }
                >
                  {[...p.units, ...p.artifacts].map((c, i) => {
                    const anchor = anchors.find((a) => a.id === c.id);
                    return (
                      <button
                        key={c.id}
                        className={`arena-piece ${c.kind === "artifact" ? "arena-piece--artifact" : ""}`}
                        style={{
                          left: `${anchor?.x ?? 20 + i * 20}%`,
                          top: `${anchor?.y ?? (side ? 72 : 28)}%`,
                        }}
                        data-selected={selection === c.id}
                        data-target={targets.has(c.id)}
                        data-aimed={target === c.id}
                        data-ready={
                          side === 1 &&
                          (c.canAttack ||
                            arenaActionsForSelection(view, c.id).length > 0)
                        }
                        data-exhausted={c.exhausted}
                        aria-pressed={selection === c.id}
                        aria-label={`${targets.has(c.id) ? "Alvo: " : "Selecionar "}${c.name}${c.kind === "creature" ? `, ataque ${c.attack}, resistência ${c.health}, escudo ${c.shield ?? 0}${c.guard ? ", Guardião" : ""}${c.exhausted ? ", Exausta" : ""}` : ", Artefato"}`}
                        onClick={() => select(c.id)}
                      >
                        <span className="arena-piece-name">{c.name}</span>
                        <strong>
                          {c.kind === "creature"
                            ? `⚔ ${c.attack} ◆ ${c.health}`
                            : "◇"}
                          {!!c.shield && ` ◉${c.shield}`}
                          {c.guard && " ⛨"}
                          {c.exhausted && " ⏾"}
                        </strong>
                      </button>
                    );
                  })}
                </section>
              ))}
            </div>
            {feedback && (
              <div key={view.revision} className="arena-feedback" role="status">
                {feedback}
              </div>
            )}
          </div>
          {duelist(view.player, true)}
          <aside className="arena-context" aria-label="Ações da seleção">
            {card ? (
              <>
                <div className="arena-selected-title">
                  <strong>{card.name}</strong>
                  <span>
                    ✦ {card.cost}
                    {card.kind === "creature"
                      ? ` · ⚔ ${card.attack} ◆ ${card.health}`
                      : ` · ${kindNames[card.kind]}`}
                  </span>
                </div>
                <div className="arena-context-buttons">
                  <button
                    aria-label={`Inspecionar ${card.name}`}
                    onClick={() => setInspect(true)}
                  >
                    ⓘ
                  </button>
                  {choices.map((a, i) => (
                    <button
                      className="arena-primary"
                      key={i}
                      aria-label={`${actionName(a, card)}${
                        a.type === "activate"
                          ? `: ${card.definition.abilities
                              .filter((b) => b.id === a.ability)
                              .map(abilityText)
                              .join(" ")}`
                          : ""
                      }${"target" in a && a.target ? ` → ${name(a.target)}` : ""}`}
                      disabled={busy || view.status !== "active"}
                      onClick={() => void command(a)}
                    >
                      {actionName(a, card)}
                      {"target" in a && a.target ? " → ◎" : ""}
                      {a.type === "activate" &&
                      offered.filter((x) => x.type === "activate").length > 1
                        ? ` · ${card.definition.abilities.findIndex((b) => b.id === a.ability) + 1}`
                        : ""}
                    </button>
                  ))}
                  {targets.size > 0 && !target && (
                    <span
                      className="arena-target-mark"
                      aria-label="Escolha um alvo destacado"
                    >
                      ◎
                    </span>
                  )}
                  <button aria-label="Cancelar seleção" onClick={cancel}>
                    ×
                  </button>
                </div>
              </>
            ) : (
              <span className="arena-seal" aria-hidden="true">
                ✧ · DU E L O A R C A N O · ✧
              </span>
            )}
          </aside>
          <section
            className="arena-hand"
            aria-label="Sua mão"
            style={
              {
                "--hand-count": Math.max(view.hand.length, 1),
              } as React.CSSProperties
            }
          >
            {view.hand.map((c) => (
              <button
                key={c.id}
                className="arena-hand-card"
                data-selected={selection === c.id}
                data-playable={view.actions.some(
                  (a) => a.type === "play" && a.card === c.id,
                )}
                aria-pressed={selection === c.id}
                aria-label={`Selecionar ${c.name}, custo ${c.cost}${c.kind === "creature" ? `, ataque ${c.attack}, resistência ${c.health}` : ""}`}
                onClick={() => select(c.id)}
              >
                <span className="arena-hand-cost">{c.cost}</span>
                <img src={`/assets/duel/${c.artId}.svg`} alt="" />
                <strong>{c.name}</strong>
                <small>
                  {c.kind === "creature"
                    ? `${c.attack} / ${c.health}`
                    : kindNames[c.kind]}
                </small>
              </button>
            ))}
          </section>
          <footer className="arena-commands">
            <span aria-live="polite">
              {busy
                ? "Confirmando…"
                : view.status === "paused"
                  ? "Pausado"
                  : view.status === "completed"
                    ? "Encerrado"
                    : view.active === 0
                      ? "✦ Sua vez"
                      : "◌ Rival"}
            </span>
            <button
              className="arena-primary"
              disabled={busy || !view.actions.some((a) => a.type === "end")}
              onClick={() => void command({ type: "end" })}
            >
              Encerrar turno
            </button>
          </footer>
          {error && (
            <div className="arena-command-error" role="alert">
              {error}
              <button onClick={() => void refresh()}>Reconsultar</button>
            </div>
          )}
          {inspect && card && (
            <ArenaDialog
              label={`Inspecionar ${card.name}`}
              onClose={() => setInspect(false)}
            >
              <img
                className="arena-inspect-art"
                src={`/assets/duel/${card.artId}.svg`}
                alt={`Gravura de ${card.name}`}
              />
              <h2>{card.name}</h2>
              <p>
                ✦ {card.cost} · {kindNames[card.kind]}
                {card.kind === "creature"
                  ? ` · ⚔ ${card.attack} ◆ ${card.health} ◉ ${card.shield ?? 0}`
                  : ""}
              </p>
              <p>{rulesText(card.definition)}</p>
              <p className="arena-flavor">{card.definition.flavor}</p>
            </ArenaDialog>
          )}
          {log && (
            <ArenaDialog
              label="Registro do círculo"
              onClose={() => setLog(false)}
            >
              <h2>Última confirmação</h2>
              <p>
                Turno {view.turn} · ação {view.revision} · {view.ruleset}
              </p>
              <ul>
                {view.events.map((e, i) => (
                  <li key={i}>
                    {eventNames[e.type]}
                    {e.value !== undefined ? ` · ${e.value}` : ""}
                    {e.target ? ` · ${name(e.target)}` : ""}
                  </li>
                ))}
              </ul>
              <h3>Regras do círculo</h3>
              <p>
                Até quatro criaturas e dois artefatos. Guardiões protegem o
                duelista de ataques. Criaturas recém-invocadas aguardam seu
                próximo turno, salvo Ímpeto. Energia se recupera no início do
                turno, até seis.
              </p>
            </ArenaDialog>
          )}
          {view.status === "paused" && !inspect && !log && (
            <ArenaDialog
              label="Duelo pausado"
              onClose={() => {
                if (!busy) void resume();
              }}
            >
              <h2>{abandon ? "Abandonar o círculo?" : "Círculo suspenso"}</h2>
              <p>
                {abandon
                  ? "O abandono registra uma derrota permanente no histórico."
                  : "Sua última ação está salva."}
              </p>
              <div className="arena-menu-actions">
                {abandon ? (
                  <>
                    <button
                      disabled={busy}
                      onClick={() => {
                        void command({ type: "abandon" });
                      }}
                    >
                      Confirmar abandono
                    </button>
                    <button onClick={() => setAbandon(false)}>
                      Continuar duelo
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="arena-primary"
                      disabled={busy}
                      onClick={() => void resume()}
                    >
                      Retomar duelo salvo
                    </button>
                    <button onClick={() => setLog(true)}>
                      Registro e regras
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => void exit("/arcanario/duelos")}
                    >
                      Salão de duelos
                    </button>
                    <button disabled={busy} onClick={() => void exit()}>
                      Voltar à Biblioteca
                    </button>
                    <button disabled={busy} onClick={() => setAbandon(true)}>
                      Abandonar duelo…
                    </button>
                  </>
                )}
              </div>
            </ArenaDialog>
          )}
          {view.result && (
            <ArenaDialog
              label="Resultado do duelo"
              onClose={() => void navigate("/arcanario/duelos")}
            >
              <div className="arena-result-sigil" aria-hidden="true">
                {view.result.winner === 0 ? "✧" : "◇"}
              </div>
              <h2>
                {view.result.winner === 0
                  ? "Vitória"
                  : view.result.winner === 1
                    ? "Derrota"
                    : "Empate"}
              </h2>
              <p>
                {view.turn} turnos · {view.revision} ações confirmadas
              </p>
              <div className="arena-menu-actions">
                <button onClick={() => void navigate("/arcanario/duelos")}>
                  Histórico & novo duelo
                </button>
                <button onClick={() => void navigate("/")}>
                  Voltar à Biblioteca
                </button>
              </div>
            </ArenaDialog>
          )}
        </div>
      )}
    </ArenaFrame>
  );
}
