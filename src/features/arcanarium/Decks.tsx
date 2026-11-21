import { Choices } from "./Choices";
import { DynamicDeckEditor } from "./Provations";
import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import type { Deck } from "../../domain/arcanarium";
import { ArcanaSeal } from "./ArcanaArt";
import { cardTitle, familyLabels } from "./presentation";
import { arcanaError, cardPath, deckPath, useArcana } from "./context";
export function Decks() {
  const { data } = useArcana();
  return (
    <>
      <div className="arcana-heading">
        <div>
          <p className="arcana-eyebrow">Coleções que se cruzam</p>
          <h2>Baralhos & coleções</h2>
          <p>
            Reúna Ecos e lembranças. Compartilhar uma carta entre baralhos
            conserva uma única fonte.
          </p>
        </div>
        <Link className="button button--primary" to="/arcanario/baralhos/novo">
          Criar baralho
        </Link>
      </div>
      <Link to="/arcanario/baralhos/novo?tipo=dynamic">
        Criar baralho dinâmico →
      </Link>
      <Link to="/arcanario/importar">Importar baralho autoral →</Link>
      <div className="arcana-deck-grid">
        {data.decks.map((d) => (
          <Link to={deckPath(d.id)} className="arcana-deck" key={d.id}>
            <ArcanaSeal />
            <span className="arcana-eyebrow">
              {d.selection.kind === "static"
                ? "Coleção estática"
                : "Baralho dinâmico"}
            </span>
            <h3>{d.name}</h3>
            <p>
              {d.selection.kind === "static"
                ? `${d.selection.cards.length} cartas · revisão ${d.revision}`
                : "Filtros executados ao iniciar Provação"}
            </p>
            <span>Abrir baralho →</span>
          </Link>
        ))}
      </div>
      {!data.decks.length && (
        <div className="arcana-empty">
          <ArcanaSeal />
          <h3>Um novo volume para suas cartas</h3>
          <p>Comece um baralho vazio ou importe uma coleção autoral local.</p>
        </div>
      )}
    </>
  );
}
export function DeckEditor() {
  const [params] = useSearchParams();
  const { id } = useParams();
  const { data } = useArcana();
  const deck = id ? data.decks.find((d) => d.id === id) : undefined;
  if (id && !deck) return <p role="alert">Baralho indisponível.</p>;
  if (
    deck?.selection.kind === "dynamic" ||
    (!deck && params.get("tipo") === "dynamic")
  )
    return <DynamicDeckEditor key={deck?.id ?? "new"} deck={deck} />;
  return <StaticDeck key={deck?.id ?? "new"} deck={deck} />;
}
function StaticDeck({ deck }: { readonly deck?: Deck }) {
  const { data, app, reload } = useArcana();
  const navigate = useNavigate();
  const [name, setName] = useState(deck?.name ?? "");
  const [selection, setSelection] = useState(
    deck?.selection.kind === "static" ? deck.selection.cards : [],
  );
  const [base, setBase] = useState(deck);
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [search, setSearch] = useState("");
  const readonly = deck?.origin.kind === "official";
  const dirty =
    name !== (base?.name ?? "") ||
    JSON.stringify(selection) !==
      JSON.stringify(
        base?.selection.kind === "static" ? base.selection.cards : [],
      );
  const act = async (f: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await f();
    } catch (e) {
      setError(arcanaError(e));
    } finally {
      setBusy(false);
    }
  };
  const move = (index: number, delta: number) => {
    const next = [...selection];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    setSelection(next);
  };
  const start = () =>
    void act(async () => {
      const refs = selection.flatMap((r) => {
        const c = r.revision
          ? data.versions.find(
              (v) => v.cardId === r.cardId && v.revision === r.revision,
            )?.card
          : data.cards.find((c) => c.id === r.cardId);
        return c?.type === "flashcard" &&
          !c.archived &&
          !data.cards.find((current) => current.id === c.id)?.archived
          ? [{ cardId: c.id, revision: c.revision }]
          : [];
      });
      if (!refs.length) {
        setMessage("Este baralho ainda não contém Ecos ativos para revisar.");
        return;
      }
      const s = await app.arcanarium.startReview(refs);
      await reload();
      void navigate(`/arcanario/ecos/${encodeURIComponent(s.id)}`);
    });
  return (
    <>
      <Link to="/arcanario/baralhos">← Voltar aos baralhos</Link>
      <div className="arcana-heading">
        <div>
          <p className="arcana-eyebrow">Volume do acervo</p>
          <h2>{base?.name ?? "Novo baralho"}</h2>
          <p>
            A ordem abaixo será a ordem da revisão. Retirar daqui preserva a
            carta global.
          </p>
        </div>
      </div>
      {error && (
        <div className="arcana-error" role="alert">
          <p>{error}</p>
          <button
            onClick={() =>
              void act(async () => {
                const latest = deck && (await app.arcanarium.getDeck(deck.id));
                if (latest) {
                  setBase(latest);
                  setMessage(
                    "Versão atual carregada. Suas escolhas foram mantidas; confira a lista e salve para aplicá-las.",
                  );
                }
                await reload();
              })
            }
          >
            Conferir revisão atual e manter escolhas
          </button>
        </div>
      )}
      {message && <p role="status">{message}</p>}
      <form
        className="arcana-panel"
        onSubmit={(e) => {
          e.preventDefault();
          void act(async () => {
            const saved = await app.arcanarium.saveDeck({
              ...(base && { id: base.id, expectedRevision: base.revision }),
              name,
              selection: { kind: "static", cards: selection },
            });
            setBase(saved);
            await reload();
            setMessage("Baralho salvo.");
            if (!deck) void navigate(deckPath(saved.id), { replace: true });
          });
        }}
      >
        <label>
          Nome do baralho
          <input
            required
            maxLength={160}
            value={name}
            disabled={readonly}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <ol className="arcana-deck-order">
          {selection.map((ref, i) => {
            const c = data.cards.find((c) => c.id === ref.cardId);
            return (
              <li key={ref.cardId}>
                <span>
                  <Link to={cardPath(ref.cardId)}>
                    {c ? cardTitle(c.content) : "Carta indisponível"}
                  </Link>
                  <small>
                    {c && familyLabels[c.type]}
                    {c?.archived ? " · arquivada" : ""}
                    {ref.revision
                      ? ` · revisão fixa ${ref.revision}`
                      : " · acompanha atual"}
                  </small>
                </span>
                {!readonly && (
                  <div>
                    <Choices
                      label={`Revisão da carta ${i + 1}`}
                      value={ref.revision ? String(ref.revision) : ""}
                      options={[
                        { value: "", label: "Acompanhar revisão atual" },
                        ...data.versions
                          .filter((v) => v.cardId === ref.cardId)
                          .map((v) => ({
                            value: String(v.revision),
                            label: `Fixar revisão ${v.revision}`,
                          })),
                      ]}
                      onChange={(value) =>
                        setSelection((old) =>
                          old.map((r) =>
                            r.cardId === ref.cardId
                              ? value
                                ? { cardId: r.cardId, revision: Number(value) }
                                : { cardId: r.cardId }
                              : r,
                          ),
                        )
                      }
                    />
                    <div className="arcana-actions">
                      <button
                        type="button"
                        disabled={i === 0}
                        aria-label={`Subir carta ${i + 1}`}
                        onClick={() => move(i, -1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={i === selection.length - 1}
                        aria-label={`Descer carta ${i + 1}`}
                        onClick={() => move(i, 1)}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSelection((s) =>
                            s.filter((r) => r.cardId !== ref.cardId),
                          )
                        }
                        aria-label={`Retirar carta ${i + 1} deste baralho`}
                      >
                        Retirar
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {!selection.length && (
          <p>
            Este volume ainda está vazio. Acrescente cartas do acervo abaixo.
          </p>
        )}
        {!readonly && (
          <>
            <label>
              Localizar no acervo
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <div className="arcana-choice-list">
              {data.cards
                .filter(
                  (c) =>
                    !c.archived &&
                    !selection.some((r) => r.cardId === c.id) &&
                    cardTitle(c.content)
                      .toLocaleLowerCase()
                      .includes(search.toLocaleLowerCase()),
                )
                .map((c) => (
                  <button
                    type="button"
                    className="arcana-add-card"
                    key={c.id}
                    aria-label={`Adicionar carta ${cardTitle(c.content)}`}
                    onClick={() =>
                      setSelection((s) => [...s, { cardId: c.id }])
                    }
                  >
                    <span>
                      ＋ {cardTitle(c.content)}
                      <small>{familyLabels[c.type]}</small>
                    </span>
                  </button>
                ))}
            </div>
            <button
              className="button button--primary"
              disabled={busy}
              type="submit"
            >
              Salvar baralho
            </button>
          </>
        )}
      </form>
      {base && (
        <div className="arcana-actions arcana-panel">
          <Link
            to={`/arcanario/provacoes?baralho=${encodeURIComponent(base.id)}`}
          >
            Preparar Provação deste baralho
          </Link>
          <button disabled={busy || dirty} onClick={start}>
            Revisar Ecos do baralho
          </button>
          <button
            disabled={busy || dirty}
            onClick={() =>
              void act(async () => {
                const content = await app.cardExchange.exportDeck(base.id);
                const result = await app.saveDeckFile(content);
                setMessage(
                  result === "cancelled"
                    ? "Exportação cancelada; seu baralho permanece aqui."
                    : "Arquivo preparado. Confira o destino escolhido.",
                );
              })
            }
          >
            Exportar baralho autoral
          </button>
          {!readonly && (
            <button
              className="arcana-danger"
              disabled={busy}
              onClick={() => {
                if (
                  window.confirm(
                    "Excluir somente este baralho? Cartas, vínculos com Estudos e histórico serão preservados.",
                  )
                )
                  void act(async () => {
                    await app.arcanarium.deleteDeck({
                      id: base.id,
                      expectedRevision: base.revision,
                    });
                    await reload();
                    void navigate("/arcanario/baralhos");
                  });
              }}
            >
              Excluir baralho
            </button>
          )}
        </div>
      )}
      {dirty && base && (
        <p className="arcana-muted">
          Salve as alterações de nome e ordem antes de revisar ou exportar.
        </p>
      )}
    </>
  );
}
