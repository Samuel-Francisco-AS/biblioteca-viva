import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  affinities,
  affinitySchema,
  modeSchema,
  type Affinity,
  type DuelMode,
} from "../../domain/duel/contracts";
import { traditions } from "../../domain/duel/catalogue";
import { modeNames } from "../../domain/duel/text";
import { Choices } from "../arcanarium/Choices";
import { arcanaError, editorPath, useArcana } from "../arcanarium/context";
import { CombatCard } from "./CombatCard";
import { arenaRouteFor as duelPath } from "./arena/arenaRoute";
export function DuelHall() {
  const { app, data, reload } = useArcana(),
    navigate = useNavigate();
  const [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [mode, setMode] = useState<DuelMode>("official"),
    [deckId, setDeckId] = useState("arcane-deck:ruin"),
    [opponent, setOpponent] = useState("arcane-deck:knowledge"),
    [filter, setFilter] = useState<Affinity | "all">("all"),
    [showCollection, setShowCollection] = useState(false),
    [historyLimit, setHistoryLimit] = useState(30);
  useEffect(() => {
    let active = true;
    void app.duels
      .ensureCatalogue()
      .then(() => reload())
      .then(() => {
        if (active) setReady(true);
      })
      .catch((e) => {
        if (active) setError(arcanaError(e));
      });
    return () => {
      active = false;
    };
  }, [app, reload]);
  const sessions = data.sessions
    .filter((s) => s.kind === "combat_match" && s.duel)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const pending = sessions.find(
    (s) => s.kind === "combat_match" && s.duel?.status !== "completed",
  );
  const decks = data.decks.filter((d) => d.combat);
  return (
    <section className="duel" aria-label="Salão do Duelo Arcano">
      <div className="duel-hero">
        <p className="arcana-eyebrow">QUATRO TRADIÇÕES · INFINITAS ESCOLHAS</p>
        <h2>O Duelo Arcano</h2>
        <p>
          Invoque o impossível. Defenda seu círculo. Escolha o instante em que
          toda a magia muda de mãos.
        </p>
        <p>
          Um jogo de duelistas invocadores da Biblioteca Viva. Coleção completa
          offline, sem desbloqueios de estudo.
        </p>
        <Link className="button" to="/arcanario/duelos/regras">
          Aprender a duelar · regulamento v1
        </Link>
      </div>
      {error && <p role="alert">{error}</p>}
      {!ready && !error && (
        <p role="status">Abrindo as 48 cartas do arquivo oficial…</p>
      )}
      {pending && (
        <div className="duel-deck">
          <h3>Seu círculo espera</h3>
          <p>
            A última ação confirmada está guardada. Retome ou abandone esse
            duelo para iniciar outro.
          </p>
          <Link className="button button--primary" to={duelPath(pending.id)}>
            Retomar duelo
          </Link>
        </div>
      )}
      <div className="duel-toolbar">
        <Link to="/arcanario/duelos/baralhos/novo">Construir um deck</Link>
        <Link to="/arcanario/oficina/nova?tipo=combat">
          Criar carta de combate
        </Link>
        <button
          onClick={() => setShowCollection(!showCollection)}
          aria-expanded={showCollection}
        >
          {showCollection
            ? "Fechar coleção oficial"
            : "Ver as 48 cartas oficiais"}
        </button>
      </div>
      <form
        className="duel-deck"
        onSubmit={(e) => {
          e.preventDefault();
          if (busy || pending) return;
          setBusy(true);
          setError("");
          const seed = crypto.getRandomValues(new Uint32Array(1))[0];
          void app.duels
            .start({ deckId, opponentId: opponent, mode, seed })
            .then(async (s) => {
              await reload();
              void navigate(duelPath(s.id));
            })
            .catch((e) => setError(arcanaError(e)))
            .finally(() => setBusy(false));
        }}
      >
        <h3>Traçar um novo círculo</h3>
        <Choices
          label="Modo de duelo"
          value={mode}
          options={Object.entries(modeNames).map(([value, label]) => ({
            value,
            label,
          }))}
          onChange={(v) => setMode(modeSchema.parse(v))}
        />
        <p>
          {mode === "official"
            ? "Somente cartas oficiais. Resultados oficiais locais separados dos experimentais."
            : mode === "creator"
              ? "Cartas autorais com orçamento de poder aproximado. Resultado experimental."
              : "12–60 cartas, até quatro cópias e afinidades livres. Limites técnicos preservados. Resultado experimental."}
        </p>
        <div className="duel-start-grid">
          <Choices
            label="Seu deck"
            value={deckId}
            options={decks.map((d) => ({ value: d.id, label: d.name }))}
            onChange={setDeckId}
          />
          <Choices
            label="Adversário PvE"
            value={opponent}
            options={decks
              .filter((d) => d.origin.kind === "official")
              .map((d) => ({ value: d.id, label: d.name }))}
            onChange={setOpponent}
          />
        </div>
        <button type="submit" disabled={!ready || busy || !!pending}>
          {busy ? "Guardando o círculo…" : "Iniciar duelo PvE"}
        </button>
        <p className="arcana-muted">
          IA local: avalia ameaças, trocas, dano letal e sinergias. Um nível,
          sem vantagens ocultas. Você começa; adversário recebe uma carta
          adicional.
        </p>
      </form>
      <h3>Tradições & baralhos</h3>
      <div className="duel-decks">
        {decks.map((d) => {
          const a = d.combat?.affinity ?? "neutral",
            t = traditions[a];
          return (
            <article className="duel-deck" key={d.id}>
              <span className="duel-tradition-mark" data-affinity={a}>
                {t.symbol}
              </span>
              <h3>{d.name}</h3>
              <p>{t.motto}</p>
              <p>
                {Object.values(d.combat?.copies ?? {}).reduce(
                  (n, c) => n + c,
                  0,
                )}{" "}
                cartas · {modeNames[d.combat?.mode ?? "official"]}
              </p>
              <Link
                to={`/arcanario/duelos/baralhos/${encodeURIComponent(d.id)}`}
              >
                {d.origin.kind === "official"
                  ? "Consultar / copiar deck"
                  : "Editar deck"}
              </Link>
              {d.origin.kind !== "official" && (
                <button
                  disabled={busy}
                  onClick={() => {
                    if (
                      !confirm(
                        `Excluir o baralho “${d.name}”? Cartas e partidas serão preservadas.`,
                      )
                    )
                      return;
                    setBusy(true);
                    void app.arcanarium
                      .deleteDeck({ id: d.id, expectedRevision: d.revision })
                      .then(reload)
                      .catch((e) => setError(arcanaError(e)))
                      .finally(() => setBusy(false));
                  }}
                >
                  Excluir baralho
                </button>
              )}
            </article>
          );
        })}
      </div>
      {showCollection && (
        <section aria-label="Coleção oficial de combate">
          <h3>As 48 páginas do impossível</h3>
          <Choices
            label="Tradição da coleção"
            value={filter}
            options={[
              { value: "all", label: "Todas" },
              ...affinities.map((a) => ({
                value: a,
                label: traditions[a].name,
              })),
              { value: "neutral", label: "Neutras" },
            ]}
            onChange={(v) =>
              setFilter(v === "all" ? "all" : affinitySchema.parse(v))
            }
          />
          <div className="duel-gallery">
            {data.cards
              .filter(
                (c) =>
                  c.origin.kind === "official" &&
                  c.content.type === "combat" &&
                  c.content.combat &&
                  (filter === "all" || c.content.combat.affinity === filter),
              )
              .map(
                (c) =>
                  c.content.type === "combat" &&
                  c.content.combat && (
                    <div key={c.id}>
                      <CombatCard
                        name={c.content.name}
                        definition={c.content.combat}
                        official
                      />
                      <Link
                        to={`${editorPath("nova")}?tipo=combat&copia=${encodeURIComponent(c.id)}`}
                      >
                        Criar cópia autoral
                      </Link>
                    </div>
                  ),
              )}
          </div>
        </section>
      )}
      <section aria-label="Histórico de duelos">
        <h3>Memória dos círculos</h3>
        <p>
          {sessions.length} duelos guardados · até {historyLimit} por modo nesta
          página.
        </p>
        {!sessions.length && <p>Nenhum duelo foi iniciado ainda.</p>}
        {(["official", "creator", "free"] as const).map((mode) => (
          <div key={mode}>
            <h4>
              {modeNames[mode]}
              {mode !== "official" ? " · experimental" : " · local"}
            </h4>
            <ul className="duel-history">
              {sessions
                .filter(
                  (s) => s.kind === "combat_match" && s.duel?.mode === mode,
                )
                .slice(0, historyLimit)
                .map((s) => {
                  if (s.kind !== "combat_match" || !s.duel) return null;
                  const m = s.duel;
                  return (
                    <li key={s.id}>
                      <Link to={duelPath(s.id)}>
                        {m.players[0].deckName} × {m.players[1].name} ·{" "}
                        {m.result
                          ? m.result.winner === null
                            ? "Empate"
                            : m.result.winner === 0
                              ? "Vitória"
                              : "Derrota"
                          : m.status === "paused"
                            ? "Pausado"
                            : "Em andamento"}
                      </Link>
                      <small>
                        {new Date(s.startedAt).toLocaleString("pt-BR")} · turno{" "}
                        {m.turn} · {m.ruleset}
                      </small>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
        {(["official", "creator", "free"] as const).some(
          (mode) =>
            sessions.filter(
              (s) => s.kind === "combat_match" && s.duel?.mode === mode,
            ).length > historyLimit,
        ) && (
          <button onClick={() => setHistoryLimit((n) => n + 30)}>
            Mostrar mais duelos guardados
          </button>
        )}
      </section>
    </section>
  );
}
