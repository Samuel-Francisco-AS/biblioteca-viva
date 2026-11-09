import { useDuelDraft } from "./drafts";
import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { z } from "zod";
import { combatDeckSchema } from "../../domain/duel/contracts";
import { traditions } from "../../domain/duel/catalogue";
import { modeNames } from "../../domain/duel/text";
import { Choices } from "../arcanarium/Choices";
import { arcanaError, useArcana } from "../arcanarium/context";
import { CombatCard } from "./CombatCard";
const draftSchema = z.strictObject({
  name: z.string().max(160),
  combat: combatDeckSchema,
  revision: z.int().positive().optional(),
});
export function DuelDeckEditor() {
  const { id = "novo" } = useParams(),
    [params] = useSearchParams();
  const { data, app, reload } = useArcana(),
    navigate = useNavigate();
  const deck = data.decks.find((d) => d.id === id),
    source = deck ?? data.decks.find((d) => d.id === params.get("copia"));
  const key = `duel-deck:${id}:${params.get("copia") ?? ""}`;
  const [recovery] = useState(() => {
    const initial: z.infer<typeof draftSchema> = {
      name: deck?.name ?? (source ? `Cópia · ${source.name}` : ""),
      combat: source?.combat ?? {
        version: 1,
        affinity: "ruin",
        mode: "creator",
        copies: {},
      },
      ...(deck && { revision: deck.revision }),
    };
    try {
      const saved = app.workshopDrafts.read(key);
      return {
        draft: saved ? draftSchema.parse(JSON.parse(saved)) : initial,
        notice: saved ? "Rascunho recuperado deste aparelho." : "",
      };
    } catch {
      return {
        draft: initial,
        notice: "Não foi possível recuperar o rascunho.",
      };
    }
  });
  const [draft, setDraft] = useState(recovery.draft),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [search, setSearch] = useState(""),
    [inspect, setInspect] = useState<string>(),
    [savedId, setSavedId] = useState("");
  const { storageError, finish } = useDuelDraft(app.workshopDrafts, key, draft);

  const total = Object.values(draft.combat.copies).reduce((v, n) => v + n, 0);
  if (id !== "novo" && !deck)
    return (
      <p role="alert">
        Baralho indisponível. Seu rascunho permanece neste aparelho.
      </p>
    );
  if (deck?.origin.kind === "official")
    return (
      <div className="duel">
        <h2>{deck.name}</h2>
        <p>
          Baralho oficial imutável · 24 cartas · duas cópias por identidade.
        </p>
        <Link
          className="button"
          to={`/arcanario/duelos/baralhos/novo?copia=${encodeURIComponent(deck.id)}`}
        >
          Criar cópia pessoal
        </Link>
        <div className="duel-gallery">
          {deck.selection.kind === "static" &&
            deck.selection.cards.map((r) => {
              const card = data.cards.find((c) => c.id === r.cardId);
              return card?.content.type === "combat" && card.content.combat ? (
                <div key={r.cardId}>
                  <CombatCard
                    name={card.content.name}
                    definition={card.content.combat}
                    official
                  />
                  <p>2 cópias · revisão {r.revision ?? card.revision}</p>
                </div>
              ) : null;
            })}
        </div>
      </div>
    );
  const c = data.cards.find((c) => c.id === inspect);
  return (
    <section className="duel" aria-label="Construtor de baralhos TCG">
      <Link to="/arcanario/duelos">← Salão dos duelos</Link>
      <h2>{deck ? "Editar baralho arcano" : "Construir baralho arcano"}</h2>
      <p>
        Uma carta pode participar de vários decks. As cópias usam a mesma
        identidade global.
      </p>
      {recovery.notice && <p role="status">{recovery.notice}</p>}
      {storageError && <p role="alert">{storageError}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          setError("");
          void app.duels
            .saveDeck({
              ...(deck && { id: deck.id, expectedRevision: draft.revision }),
              name: draft.name,
              combat: draft.combat,
            })
            .then(async (saved) => {
              setSavedId(saved.id);
              finish();
              await reload();
              void navigate("/arcanario/duelos");
            })
            .catch((e) => setError(arcanaError(e)))
            .finally(() => setBusy(false));
        }}
      >
        <label>
          Nome do baralho
          <input
            required
            maxLength={160}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </label>
        <Choices
          label="Formato do baralho"
          value={draft.combat.mode}
          options={Object.entries(modeNames).map(([value, label]) => ({
            value,
            label,
          }))}
          onChange={(value) =>
            setDraft({
              ...draft,
              combat: {
                ...draft.combat,
                mode: z.enum(["official", "creator", "free"]).parse(value),
              },
            })
          }
        />
        <Choices
          label="Afinidade do baralho"
          value={draft.combat.affinity}
          options={Object.entries(traditions)
            .filter(([a]) => a !== "neutral")
            .map(([value, t]) => ({ value, label: t.name }))}
          onChange={(value) =>
            setDraft({
              ...draft,
              combat: {
                ...draft.combat,
                affinity: combatDeckSchema.shape.affinity.parse(value),
              },
            })
          }
        />
        <p role="status">
          <strong>{total} cartas</strong> ·{" "}
          {draft.combat.mode === "free"
            ? "12–60; até quatro cópias; todas as afinidades"
            : "24; até duas cópias; afinidade escolhida e neutras"}
        </p>
        <p>
          Curva de custos:{" "}
          {[1, 2, 3, 4, 5, 6]
            .map(
              (cost) =>
                `${cost}: ${data.cards.reduce((n, c) => n + (c.content.type === "combat" && c.content.combat?.cost === cost ? (draft.combat.copies[c.id] ?? 0) : 0), 0)}`,
            )
            .join(" · ")}
        </p>
        <label>
          Buscar no acervo de combate
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="duel-deck-picks">
          {data.cards
            .filter(
              (c) =>
                !c.archived &&
                c.content.type === "combat" &&
                c.content.combat &&
                c.content.name
                  .toLocaleLowerCase("pt-BR")
                  .includes(search.toLocaleLowerCase("pt-BR")),
            )
            .map((c) => {
              if (c.content.type !== "combat" || !c.content.combat) return null;
              const def = c.content.combat,
                n = draft.combat.copies[c.id] ?? 0;
              const eligible =
                draft.combat.mode === "free" ||
                ((def.affinity === "neutral" ||
                  def.affinity === draft.combat.affinity) &&
                  (draft.combat.mode !== "official" ||
                    c.origin.kind === "official"));
              return (
                <div className="duel-pick-row" key={c.id}>
                  <img
                    src={`/assets/duel/${def.artId}.svg`}
                    alt=""
                    width="80"
                    height="60"
                    loading="lazy"
                  />
                  <button type="button" onClick={() => setInspect(c.id)}>
                    {c.content.name}
                    <small>
                      {def.cost} energia · {traditions[def.affinity].name}
                      {!eligible ? " · incompatível neste formato" : ""}
                    </small>
                  </button>
                  <label>
                    Cópias
                    <input
                      aria-label={`Cópias de ${c.content.name}`}
                      type="number"
                      min={0}
                      max={draft.combat.mode === "free" ? 4 : 2}
                      disabled={!eligible && !n}
                      value={n}
                      onChange={(e) => {
                        const count = Number(e.target.value);
                        if (!Number.isInteger(count) || count < 0 || count > 4)
                          return;
                        const copies = { ...draft.combat.copies };
                        if (count) copies[c.id] = count;
                        else delete copies[c.id];
                        setDraft({
                          ...draft,
                          combat: { ...draft.combat, copies },
                        });
                      }}
                    />
                  </label>
                </div>
              );
            })}
        </div>
        {error && <p role="alert">{error}</p>}
        <div className="duel-actions">
          <button type="submit" disabled={busy || !!savedId}>
            {busy ? "Salvando…" : "Salvar baralho validado"}
          </button>
          <button
            type="button"
            onClick={() => {
              finish();
              void navigate("/arcanario/duelos");
            }}
          >
            Descartar rascunho
          </button>
        </div>
      </form>
      {c?.content.type === "combat" && c.content.combat && (
        <aside aria-label="Carta inspecionada">
          <CombatCard
            name={c.content.name}
            definition={c.content.combat}
            official={c.origin.kind === "official"}
          />
          <button onClick={() => setInspect(undefined)}>Fechar inspeção</button>
        </aside>
      )}
    </section>
  );
}
