import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { DuelSession } from "../../application/duels";
import type {
  DuelAction,
  DuelEvent,
  DuelMatch,
  DuelUnit,
} from "../../domain/duel/contracts";
import { chooseDuelAction } from "../../domain/duel/ai";
import {
  canAttack,
  cardAt,
  legalActions,
  unitStats,
} from "../../domain/duel/engine";
import { traditions } from "../../domain/duel/catalogue";
import { kindNames, modeNames } from "../../domain/duel/text";
import { useAppResume } from "../../app/useAppResume";
import { arcanaError, useArcana } from "../arcanarium/context";
import { CombatCard } from "./CombatCard";
export function eventText(m: DuelMatch, e: DuelEvent): string {
  const who = m.players[e.player].name;
  const name = (id?: string) =>
    id === "p0"
      ? "seu duelista"
      : id === "p1"
        ? m.players[1].name
        : (m.cards.find((c) => c.id === id)?.name ?? "o alvo");
  switch (e.type) {
    case "draw":
      return `${who} comprou uma carta.`;
    case "burn":
      return `${who}: mão cheia, ${name(e.target)} foi ao cemitério.`;
    case "summon":
      return `${name(e.target)} foi invocada.`;
    case "spell":
      return `${who} conjurou ${name(e.target)}.`;
    case "artifact":
      return `${who} posicionou ${name(e.target)}.`;
    case "attack":
      return `${name(e.source)} atacou ${name(e.target)}.`;
    case "damage":
      return `${name(e.target)} recebeu ${e.value} de dano.`;
    case "heal":
      return `${name(e.target)} restaurou ${e.value} de vida.`;
    case "shield":
      return `${name(e.target)} ganhou ${e.value} de escudo.`;
    case "empower":
      return `${name(e.target)} recebeu +${e.value}/+${e.value}.`;
    case "exhaust":
      return `${name(e.target)} ficou exausta até o fim do próximo turno de seu dono.`;
    case "shatter":
      return `${name(e.target)} foi destruído.`;
    case "scout":
      return `${who} reorganizou até ${e.value} cartas do topo.`;
    case "death":
      return `${name(e.target)} foi derrotada.`;
    case "fatigue":
      return `${who} sofreu ${e.value} de fadiga.`;
    case "turn":
      return `Turno ${e.value} · ${who}.`;
    case "activate":
      return `${name(e.target)} canalizou uma habilidade.`;
    case "pause":
      return "Duelo pausado e salvo.";
    case "resume":
      return "Duelo retomado do último comando confirmado.";
    case "result":
      return m.result?.winner === null
        ? "O círculo terminou em empate."
        : m.result?.winner === 0
          ? "Vitória! Seu círculo prevaleceu."
          : "Derrota. Outro círculo prevaleceu.";
  }
}
const resultReasons = {
  life: "Pontos de vida esgotados",
  fatigue: "Fadiga do deck",
  abandon: "Abandono confirmado",
  "turn-limit": "Limite de 120 turnos",
  "command-limit": "Limite de comandos",
  simultaneous: "Derrota simultânea dos duelistas",
};
export function DuelTable() {
  const { id = "" } = useParams(),
    { app } = useArcana();
  const [session, setSession] = useState<DuelSession>(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [selection, setSelection] = useState<string>(),
    [abandon, setAbandon] = useState(false),
    [visible, setVisible] = useState(document.visibilityState !== "hidden"),
    [expandedLog, setExpandedLog] = useState(false);
  const lock = useRef(false),
    mounted = useRef(true),
    tray = useRef<HTMLElement>(null);
  const accept = useCallback((s: DuelSession) => {
    setSession((old) =>
      !old ||
      old.id !== s.id ||
      (s.duel?.revision ?? 0) >= (old.duel?.revision ?? 0)
        ? s
        : old,
    );
  }, []);
  const refresh = useCallback(() => {
    void app.duels
      .get(id)
      .then((s) => {
        if (mounted.current) {
          accept(s);
          setError("");
        }
      })
      .catch((e) => {
        if (mounted.current) setError(arcanaError(e));
      });
  }, [app, id, accept]);
  useEffect(() => {
    mounted.current = true;
    refresh();
    const listener = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", listener);
    return () => {
      mounted.current = false;
      document.removeEventListener("visibilitychange", listener);
    };
  }, [refresh]);
  useAppResume(refresh);
  const command = useCallback(
    async (action: DuelAction, player = 0) => {
      if (lock.current || !session?.duel) return;
      lock.current = true;
      setBusy(true);
      setError("");
      try {
        const next = await app.duels.command(
          session.id,
          session.duel.revision,
          crypto.randomUUID(),
          player,
          action,
        );
        if (mounted.current) {
          accept(next);
          setSelection(undefined);
          setAbandon(false);
        }
      } catch (e) {
        if (mounted.current) setError(arcanaError(e));
      } finally {
        lock.current = false;
        if (mounted.current) setBusy(false);
      }
    },
    [app, session, accept],
  );
  useEffect(() => {
    if (
      !session?.duel ||
      session.duel.active !== 1 ||
      session.duel.status !== "active" ||
      busy ||
      error ||
      !visible ||
      abandon
    )
      return;
    const m = session.duel;
    const timer = window.setTimeout(() => {
      void command(chooseDuelAction(m), 1);
    }, 380);
    return () => window.clearTimeout(timer);
  }, [session, busy, error, visible, abandon, command]);
  const select = (id: string) => {
    setSelection(id);
    window.requestAnimationFrame(() => tray.current?.focus());
  };
  if (!session?.duel)
    return (
      <div className="duel">
        <h2>Duelo Arcano</h2>
        {error ? (
          <p role="alert">{error}</p>
        ) : (
          <p role="status">Recuperando o círculo…</p>
        )}
        <Link to="/arcanario/duelos">Voltar ao salão</Link>
      </div>
    );
  const m = session.duel,
    own = m.players[0],
    enemy = m.players[1],
    card = selection ? cardAt(m, selection) : undefined;
  const choices = m.active === 0 ? legalActions(m, 0) : [];
  const offered = choices.filter(
    (a) =>
      (a.type === "play" && a.card === selection) ||
      (a.type === "attack" && a.source === selection) ||
      (a.type === "activate" && a.source === selection),
  );
  const last = m.history.at(-1),
    lastEvents = last?.events ?? [];
  const highlights = new Set(
    lastEvents
      .filter((e) =>
        [
          "damage",
          "heal",
          "shield",
          "empower",
          "summon",
          "activate",
          "attack",
        ].includes(e.type),
      )
      .map((e) => e.target),
  );
  const targetName = (id?: string) =>
    id === "p1"
      ? enemy.name
      : id === "p0"
        ? "seu duelista"
        : (m.cards.find((c) => c.id === id)?.name ?? "");
  const actionLabel = (a: DuelAction) =>
    a.type === "play"
      ? `${card?.definition.kind === "creature" ? "Invocar" : card?.definition.kind === "artifact" ? "Posicionar artefato" : "Conjurar"}${a.target ? ` em ${targetName(a.target)}` : ""}`
      : a.type === "attack"
        ? `Atacar ${targetName(a.target)}`
        : a.type === "activate"
          ? `Ativar ${card?.definition.abilities.find((b) => b.id === a.ability)?.cost ?? 0} energia${a.target ? ` em ${targetName(a.target)}` : ""}`
          : "";
  const unit = (u: DuelUnit, player: number) => {
    const c = cardAt(m, u.id),
      stats = unitStats(m, u);
    return (
      <button
        type="button"
        key={u.id}
        className="duel-unit"
        data-affinity={c.definition.affinity}
        data-highlight={highlights.has(u.id)}
        data-ready={player === m.active && canAttack(m, u)}
        aria-pressed={selection === u.id}
        aria-label={`Inspecionar ${c.name}, ${stats.attack} ataque, ${stats.health} resistência, ${u.shield} escudo${c.definition.keywords.includes("guard") ? ", Guardião" : ""}`}
        onClick={() => select(u.id)}
      >
        <img
          loading="lazy"
          src={`/assets/duel/${c.definition.artId}.svg`}
          alt=""
          width="160"
          height="120"
        />
        <span>{c.name}</span>
        <strong>
          ⚔ {stats.attack} <span>◆ {stats.health}</span>
          {u.shield > 0 && <span>◉ {u.shield}</span>}
        </strong>
        <small>
          {c.definition.keywords.includes("guard") ? "Guardião · " : ""}
          {u.exhaustedThrough >= m.turn
            ? "Exausta"
            : u.attacked
              ? "Já atacou"
              : u.summoned === m.turn &&
                  !c.definition.keywords.includes("haste")
                ? "Invocada agora"
                : player === m.active && canAttack(m, u)
                  ? "Pode atacar"
                  : "Em campo"}
        </small>
      </button>
    );
  };
  return (
    <section
      className="duel duel-table"
      aria-label="Mesa do Duelo Arcano"
      data-testid="duel-table"
      data-revision={m.revision}
      data-active={m.active}
      data-state={m.status}
    >
      <div className="duel-table-heading">
        <div>
          <p className="arcana-eyebrow">
            {modeNames[m.mode]}
            {m.mode !== "official" ? " · experimental" : " · local"}
          </p>
          <h2>Duelo Arcano</h2>
        </div>
        <Link to="/arcanario/duelos">← Salão · salvo</Link>
      </div>
      <div className="duel-turn-strip">
        <strong>
          Turno {m.turn} ·{" "}
          {m.result
            ? "Encerrado"
            : m.status === "paused"
              ? "Pausado"
              : m.active === 0
                ? "Seu turno"
                : `${enemy.name} está escolhendo`}
        </strong>
        <span>{busy ? "Confirmando…" : `Salvo · ação ${m.revision}`}</span>
      </div>
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button onClick={refresh}>Reconsultar última confirmação</button>
        </div>
      )}
      {m.result && (
        <div
          className="duel-result"
          role="status"
          data-result={
            m.result.winner === 0
              ? "victory"
              : m.result.winner === 1
                ? "defeat"
                : "draw"
          }
        >
          <span aria-hidden="true">{m.result.winner === 0 ? "✧" : "◇"}</span>
          <h3>
            {m.result.winner === 0
              ? "Vitória"
              : m.result.winner === 1
                ? "Derrota"
                : "Empate"}
          </h3>
          <p>
            {resultReasons[m.result.reason]} · {m.turn} turnos · {m.revision}{" "}
            comandos
          </p>
          <Link className="button button--primary" to="/arcanario/duelos">
            Histórico & novo duelo
          </Link>
        </div>
      )}
      <div
        className="duel-battlefield"
        data-fx={
          lastEvents.find((e) =>
            [
              "attack",
              "spell",
              "damage",
              "heal",
              "shield",
              "summon",
              "death",
              "activate",
            ].includes(e.type),
          )?.type ?? "quiet"
        }
      >
        <div className="duel-duelist" data-affinity={enemy.affinity}>
          <span className="duel-tradition-mark" aria-hidden="true">
            {traditions[enemy.affinity].symbol}
          </span>
          <div>
            <h3>{enemy.name}</h3>
            <small>
              {traditions[enemy.affinity].name} · {enemy.hand.length} na mão ·{" "}
              {enemy.deck.length} no deck · {enemy.grave.length} no cemitério
            </small>
          </div>
          <div className="duel-life" data-highlight={highlights.has("p1")}>
            <strong aria-label={`Vida adversária: ${enemy.life}`}>
              ♥ {enemy.life}
            </strong>
            <span
              aria-label={`Energia adversária: ${enemy.energy} de ${enemy.maximum}`}
            >
              ✦ {enemy.energy}/{enemy.maximum}
            </span>
          </div>
        </div>
        <section className="duel-field" aria-label="Criaturas adversárias">
          <div className="duel-zone-label">
            CÍRCULO ADVERSÁRIO · {enemy.units.length}/4
          </div>
          <div className="duel-unit-row">
            {enemy.units.map((u) => unit(u, 1))}
            {!enemy.units.length && (
              <p className="duel-empty-zone">
                O outro lado ainda aguarda uma invocação.
              </p>
            )}
          </div>
        </section>
        <section className="duel-artifacts" aria-label="Artefatos adversários">
          {enemy.artifacts.map((a) => (
            <button
              key={a.id}
              aria-pressed={selection === a.id}
              onClick={() => select(a.id)}
            >
              ◇ {cardAt(m, a.id).name}
            </button>
          ))}
          {!enemy.artifacts.length && (
            <small>Nenhum artefato adversário · 0/2</small>
          )}
        </section>
        <div className="duel-center-rune" aria-hidden="true">
          ✧ ─── ◈ ─── ✧
        </div>
        <section className="duel-artifacts" aria-label="Seus artefatos">
          {own.artifacts.map((a) => (
            <button
              key={a.id}
              aria-pressed={selection === a.id}
              onClick={() => select(a.id)}
            >
              ◇ {cardAt(m, a.id).name}
            </button>
          ))}
          {!own.artifacts.length && <small>Seus artefatos · 0/2</small>}
        </section>
        <section className="duel-field" aria-label="Suas criaturas">
          <div className="duel-zone-label">
            SEU CÍRCULO · {own.units.length}/4
          </div>
          <div className="duel-unit-row">
            {own.units.map((u) => unit(u, 0))}
            {!own.units.length && (
              <p className="duel-empty-zone">
                Toque em uma carta da mão para invocar.
              </p>
            )}
          </div>
        </section>
        <div className="duel-duelist" data-affinity={own.affinity}>
          <span className="duel-tradition-mark" aria-hidden="true">
            {traditions[own.affinity].symbol}
          </span>
          <div>
            <h3>Seu círculo</h3>
            <small>
              {traditions[own.affinity].name} · {own.deck.length} no deck ·{" "}
              {own.grave.length} no cemitério
            </small>
          </div>
          <div className="duel-life" data-highlight={highlights.has("p0")}>
            <strong aria-label={`Sua vida: ${own.life}`}>♥ {own.life}</strong>
            <span aria-label={`Sua energia: ${own.energy} de ${own.maximum}`}>
              ✦ {own.energy}/{own.maximum}
            </span>
          </div>
        </div>
      </div>
      <section aria-label="Sua mão" className="duel-hand-section">
        <h3>
          Sua mão <small>{own.hand.length}/8 · toque para ler e jogar</small>
        </h3>
        <div className="duel-hand">
          {own.hand.map((id) => {
            const c = cardAt(m, id);
            return (
              <button
                className="duel-hand-card"
                key={id}
                aria-label={`Selecionar ${c.name}, custo ${c.definition.cost}`}
                aria-pressed={selection === id}
                onClick={() => select(id)}
              >
                <span className="duel-hand-cost">{c.definition.cost}</span>
                <img
                  src={`/assets/duel/${c.definition.artId}.svg`}
                  alt=""
                  width="160"
                  height="120"
                  loading="lazy"
                />
                <strong>{c.name}</strong>
                <small>
                  {kindNames[c.definition.kind]}
                  {c.definition.kind === "creature"
                    ? ` · ${c.definition.attack}/${c.definition.health}`
                    : ""}
                </small>
              </button>
            );
          })}
          {!own.hand.length && (
            <p>
              Mão vazia. Ataque, ative seus artefatos ou encerre o turno para
              comprar.
            </p>
          )}
        </div>
      </section>
      <aside
        ref={tray}
        tabIndex={-1}
        className="duel-selection"
        aria-label="Inspeção e ações da carta"
      >
        {card ? (
          <>
            <CombatCard
              name={card.name}
              definition={card.definition}
              official={card.official}
            />
            <div>
              <h3>{card.name}</h3>
              <p>
                Revisão {card.revision} ·{" "}
                {card.official ? "Oficial" : "Autoral"}
              </p>
              {offered.length ? (
                <div className="duel-targets">
                  {offered.map((a, i) => (
                    <button
                      key={i}
                      disabled={busy}
                      onClick={() => void command(a)}
                    >
                      {actionLabel(a)}
                    </button>
                  ))}
                </div>
              ) : (
                <p>
                  {m.result
                    ? "Partida concluída. A carta permanece neste retrato histórico."
                    : m.status === "paused"
                      ? "Retome a partida para agir."
                      : m.active !== 0
                        ? "Espere o adversário encerrar o turno."
                        : "Sem ação disponível: confira energia, vagas, exaustão e alvos válidos."}
                </p>
              )}
              <button onClick={() => setSelection(undefined)}>
                Cancelar seleção
              </button>
            </div>
          </>
        ) : (
          <p className="duel-selection-hint">
            Selecione uma carta ou criatura para ler as regras e escolher uma
            ação. Nenhuma ação depende de arrastar.
          </p>
        )}
      </aside>
      {!m.result && (
        <div className="duel-turn-actions">
          {m.status === "paused" ? (
            <button
              disabled={busy}
              onClick={() => void command({ type: "resume" })}
            >
              Retomar duelo salvo
            </button>
          ) : (
            <>
              <button
                className="button--primary"
                disabled={busy || m.active !== 0 || abandon}
                onClick={() => void command({ type: "end" })}
              >
                Encerrar turno
              </button>
              <button
                disabled={busy}
                onClick={() => void command({ type: "pause" })}
              >
                Pausar e salvar
              </button>
            </>
          )}
          <button disabled={busy} onClick={() => setAbandon(true)}>
            Abandonar duelo…
          </button>
        </div>
      )}
      {abandon && !m.result && (
        <div
          className="duel-abandon"
          role="alertdialog"
          aria-labelledby="duel-abandon-title"
        >
          <h3 id="duel-abandon-title">Abandonar este círculo?</h3>
          <p>Conta como derrota permanente. O histórico será preservado.</p>
          <button
            disabled={busy}
            onClick={() => void command({ type: "abandon" })}
          >
            Confirmar abandono
          </button>
          <button onClick={() => setAbandon(false)}>Continuar duelo</button>
        </div>
      )}
      <div
        className="duel-event-live"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        key={m.revision}
      >
        {lastEvents.slice(-4).map((e, i) => (
          <span key={i}>{eventText(m, e)} </span>
        ))}
      </div>
      <section className="duel-log" aria-label="Registro de eventos">
        <h3>Vestígios do duelo</h3>
        <button
          aria-expanded={expandedLog}
          onClick={() => setExpandedLog(!expandedLog)}
        >
          {expandedLog ? "Recolher histórico" : "Ver histórico completo"}
        </button>
        <ol>
          {(expandedLog ? m.history : m.history.slice(-5)).map((h) => (
            <li key={h.command.id}>
              <strong>
                Ação {h.command.revision + 1} ·{" "}
                {m.players[h.command.player].name}
              </strong>
              <p>{h.events.map((e) => eventText(m, e)).join(" ")}</p>
            </li>
          ))}
        </ol>
        <p className="arcana-muted">
          {m.ruleset} · semente {m.seed}. A história usa as cartas desta
          partida, mesmo após edições no acervo.
        </p>
      </section>
    </section>
  );
}
