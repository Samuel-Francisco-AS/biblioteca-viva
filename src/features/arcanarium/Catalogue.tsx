import {
  cardAvailable,
  packOwned,
  gradable,
} from "../../domain/educationalPacks";
import { QuestionFolio } from "./QuestionEditor";
import { attempts } from "../../domain/provations";
import { Choices } from "./Choices";
import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ArcanaCard } from "./ArcanaCard";
import { cardTitle, familyLabels } from "./presentation";
import { ArcanaSeal } from "./ArcanaArt";
import {
  arcanaError,
  cardPath,
  deckPath,
  editorPath,
  useArcana,
} from "./context";
import type { Card } from "../../domain/arcanarium";
export function Catalogue({
  memories = false,
}: {
  readonly memories?: boolean;
}) {
  const { data, app } = useArcana();
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const family = memories ? "memory" : (params.get("family") ?? "all");
  const archived = params.get("archived") === "true";
  const packId = params.get("pacote") ?? "";
  const year = params.get("ano") ?? "";
  const origin = params.get("origem") ?? "";
  const exam = params.get("prova") ?? "";
  const tag = params.get("assunto") ?? "";
  const page = Math.max(1, Number(params.get("pagina")) || 1);
  const patch = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    if (key !== "pagina") next.delete("pagina");
    setParams(next, { replace: true });
  };
  const cards = data.cards.filter(
    (c) =>
      c.archived === archived &&
      cardAvailable(c, data) &&
      (!packId ||
        ((c.origin.kind === "official" || c.origin.kind === "imported") &&
          c.origin.packId === packId)) &&
      (!origin || c.origin.kind === origin) &&
      (!year ||
        (c.content.type === "question" &&
          c.content.source?.year === Number(year))) &&
      (!exam ||
        (c.content.type === "question" &&
          (c.content.source?.exam ?? "")
            .toLocaleLowerCase("pt-BR")
            .includes(exam.toLocaleLowerCase("pt-BR")))) &&
      (!tag ||
        (c.content.type === "question" &&
          c.content.classification.knowledgeTagIds.includes(tag))) &&
      (family === "all" || c.type === family) &&
      JSON.stringify(c.content)
        .toLocaleLowerCase("pt-BR")
        .includes(search.toLocaleLowerCase("pt-BR")),
  );
  return (
    <>
      <div className="arcana-heading">
        <div>
          <p className="arcana-eyebrow">
            {memories ? "Objetos de afeto" : "O arquivo das cartas"}
          </p>
          <h2>{memories ? "O Relicário" : "Acervo global"}</h2>
          <p>
            {memories
              ? "Guarde o que uma obra, um dia ou uma conquista deixou em você."
              : "Uma carta, muitos baralhos. Cada referência conserva a mesma identidade."}
          </p>
        </div>
        <Link
          className="button button--primary"
          to={`/arcanario/oficina/nova${memories ? "?tipo=memory" : ""}`}
        >
          {memories ? "Criar lembrança" : "Criar carta"}
        </Link>
      </div>
      <div className="arcana-filters">
        <label>
          Buscar cartas
          <input
            type="search"
            value={search}
            onChange={(e) => patch("q", e.target.value)}
            placeholder="Título, pergunta ou inscrição…"
          />
        </label>
        {!memories && (
          <Choices
            label="Família"
            value={family}
            options={[
              { value: "all", label: "Todas as famílias" },
              ...Object.entries(familyLabels).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
            onChange={(value) => patch("family", value)}
          />
        )}
        <label className="arcana-check">
          <input
            type="checkbox"
            checked={archived}
            onChange={(e) => patch("archived", String(e.target.checked))}
          />
          Ver arquivadas
        </label>
      </div>
      {!memories && (
        <details className="arcana-panel">
          <summary>Filtrar por coleção, prova, ano e origem</summary>
          <Choices
            label="Coleção no Acervo"
            value={packId}
            options={[
              { value: "", label: "Todas as coleções" },
              ...(data.packs ?? [])
                .filter((p) => p.status === "installed")
                .map((p) => ({ value: p.id, label: p.manifest.name })),
            ]}
            onChange={(v) => patch("pacote", v)}
          />
          <label>
            Prova no Acervo
            <input
              value={exam}
              onChange={(e) => patch("prova", e.target.value)}
              maxLength={160}
            />
          </label>
          <label>
            Ano no Acervo
            <input
              type="number"
              min={1900}
              max={9999}
              value={year}
              onChange={(e) => patch("ano", e.target.value)}
            />
          </label>
          <Choices
            label="Origem no Acervo"
            value={origin}
            options={[
              { value: "", label: "Todas" },
              { value: "local", label: "Autoral local" },
              { value: "imported", label: "Importada / demonstração" },
              { value: "official", label: "Oficial · origem declarada" },
              { value: "study", label: "Estudo" },
            ]}
            onChange={(v) => patch("origem", v)}
          />
          <Choices
            label="Conhecimento no Acervo"
            value={tag}
            options={[
              { value: "", label: "Todos os conhecimentos" },
              ...data.tags
                .filter((t) => t.namespace === "editorial")
                .map((t) => ({ value: t.id, label: t.label })),
            ]}
            onChange={(v) => patch("assunto", v)}
          />
        </details>
      )}
      <p className="arcana-muted" role="status">
        {cards.length}{" "}
        {cards.length === 1 ? "carta encontrada" : "cartas encontradas"}
      </p>
      {cards.length > 24 && (
        <nav aria-label="Páginas do Acervo">
          <button
            disabled={page <= 1}
            onClick={() => patch("pagina", String(page - 1))}
          >
            Página anterior
          </button>
          <span>
            {" "}
            Página {page} de {Math.ceil(cards.length / 24)}{" "}
          </span>
          <button
            disabled={page * 24 >= cards.length}
            onClick={() => patch("pagina", String(page + 1))}
          >
            Próxima página
          </button>
        </nav>
      )}
      {cards.length ? (
        <div className="arcana-grid">
          {cards.slice((page - 1) * 24, page * 24).map((c) => (
            <Link
              className="arcana-card-link"
              key={c.id}
              to={cardPath(c.id)}
              aria-label={`Abrir ${cardTitle(c.content)}`}
            >
              <ArcanaCard compact app={app} content={c.content} />
              <span className="arcana-card-caption">
                {cardTitle(c.content)}
              </span>
              <span className="arcana-muted">
                {c.origin.kind === "study"
                  ? "Originária de Estudo"
                  : c.origin.kind === "local"
                    ? "Carta autoral"
                    : "Acervo importado"}{" "}
                · revisão {c.revision}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="arcana-empty">
          <ArcanaSeal kind={memories ? "memory" : "echo"} />
          <h3>
            {search
              ? "Nenhum vestígio por aqui"
              : memories
                ? "Seu primeiro relicário começa com uma lembrança"
                : "Um arquivo à espera das suas descobertas"}
          </h3>
          <p>
            {search
              ? "Experimente outra busca ou família."
              : "Crie uma carta na Oficina e escolha sua moldura. Tudo permanece neste aparelho."}
          </p>
        </div>
      )}
    </>
  );
}
export function CardDetail() {
  const { id = "" } = useParams();
  const { data, entries, app, reload } = useArcana();
  const card = data.cards.find((c) => c.id === id);
  return card ? (
    <Detail
      key={card.id}
      card={card}
      data={data}
      entries={entries}
      app={app}
      reload={reload}
    />
  ) : (
    <p role="alert">
      Carta indisponível. Volte ao acervo para atualizar a seleção.
    </p>
  );
}
function Detail({
  card,
  data,
  entries,
  app,
  reload,
}: ReturnType<typeof useArcana> & { readonly card: Card }) {
  const [flipped, setFlipped] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(card.revision);
  const navigate = useNavigate();
  const shown =
    data.versions.find((v) => v.cardId === card.id && v.revision === version)
      ?.card ?? card;
  const rounds = data.sessions.flatMap((s) =>
    s.kind === "flashcard_review"
      ? s.answers.flatMap((a, i) =>
          s.cards[i].cardId === card.id
            ? [{ ...a, session: s.id, revision: s.cards[i].revision }]
            : [],
        )
      : [],
  );
  const decks = data.decks.filter(
    (d) =>
      d.selection.kind === "static" &&
      d.selection.cards.some((r) => r.cardId === card.id),
  );
  const links = data.studyLinks.filter((l) => l.cardId === card.id && l.active);
  const refs = shown.content.type === "memory" ? shown.content.entryIds : [];
  const act = async (f: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await f();
    } catch (e) {
      setError(arcanaError(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Link
        to={
          card.type === "memory" ? "/arcanario/relicario" : "/arcanario/acervo"
        }
      >
        ← Voltar ao acervo
      </Link>
      <div className="arcana-detail">
        <div className="arcana-detail__object">
          {shown.content.type === "question" ? (
            <section className="arcana-folio">
              <QuestionFolio question={shown.content} />
              <details>
                <summary>
                  {packOwned(card)
                    ? "Gabarito e comentário editorial"
                    : "Gabarito e resolução (Oficina)"}
                </summary>
                <p>
                  {gradable(shown)
                    ? "Correta: "
                    : "Questão anulada, sem gabarito válido ou preliminar; excluída de novas Provações. "}{" "}
                  {shown.content.correctAlternativeId &&
                    String.fromCharCode(
                      65 +
                        shown.content.alternatives.findIndex(
                          (a) =>
                            shown.content.type === "question" &&
                            a.id === shown.content.correctAlternativeId,
                        ),
                    )}
                </p>
                <p>
                  {shown.content.explanation ?? "Sem explicação cadastrada."}
                </p>
              </details>
            </section>
          ) : (
            <ArcanaCard content={shown.content} app={app} flipped={flipped} />
          )}
          {shown.content.type !== "question" && (
            <button
              className="button button--secondary"
              onClick={() => setFlipped((v) => !v)}
              aria-pressed={flipped}
            >
              Virar carta · {flipped ? "mostrar frente" : "mostrar verso"}
            </button>
          )}
        </div>
        <div className="arcana-detail__info">
          <p className="arcana-eyebrow">
            {familyLabels[card.type]} ·{" "}
            {!cardAvailable(card, data)
              ? "Conteúdo indisponível para novas sessões · histórico preservado"
              : packOwned(card)
                ? "Coleção instalada"
                : card.archived
                  ? "Arquivada"
                  : "Acervo pessoal"}
          </p>
          <h2>{cardTitle(card.content)}</h2>
          <p className="arcana-muted">
            {card.origin.kind === "study"
              ? "Proveniência histórica: Estudo"
              : card.origin.kind === "local"
                ? "Criação autoral local"
                : `Origem: ${card.origin.kind}`}{" "}
            · revisão {card.revision}
          </p>
          {error && (
            <p role="alert" className="arcana-error">
              {error}
            </p>
          )}
          {packOwned(card) && (
            <p>
              Item de pacote preservado com revisão editorial imutável.{" "}
              <Link to="/arcanario/pacotes">
                Gerenciar coleção e procedência
              </Link>
              .{" "}
              {shown.content.type === "question" &&
                shown.content.editorial?.commentary === "Arcanário" &&
                "Explicação independente: comentário editorial do Arcanário."}
            </p>
          )}
          <div className="arcana-actions">
            {!card.archived &&
              card.origin.kind !== "official" &&
              !packOwned(card) &&
              (card.type === "flashcard" ||
                card.type === "memory" ||
                card.type === "question") && (
                <Link
                  className="button button--primary"
                  to={editorPath(card.id)}
                >
                  Editar na Oficina
                </Link>
              )}
            {!card.archived && card.type === "flashcard" && (
              <button
                disabled={busy}
                onClick={() =>
                  void act(async () => {
                    const s = await app.arcanarium.startReview([
                      { cardId: card.id, revision: card.revision },
                    ]);
                    await reload();
                    void navigate(
                      `/arcanario/ecos/${encodeURIComponent(s.id)}`,
                    );
                  })
                }
              >
                Revisar este Eco
              </button>
            )}
          </div>
          {card.type === "question" && (
            <section>
              <h3>Histórico da questão</h3>
              <p>
                {attempts(data).filter((a) => a.cardId === card.id).length}{" "}
                tentativas confirmadas.
              </p>
              <ul>
                {attempts(data)
                  .filter((a) => a.cardId === card.id)
                  .map((a) => (
                    <li key={`${a.sessionId}:${a.revision}`}>
                      <Link
                        to={`/arcanario/provacoes/${encodeURIComponent(a.sessionId)}`}
                      >
                        {a.correct ? "Correta" : "Incorreta"} · revisão{" "}
                        {a.revision} ·{" "}
                        {new Date(a.answeredAt).toLocaleString("pt-BR")}
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          )}
          <h3>Baralhos & coleções</h3>
          {decks.length ? (
            <ul className="arcana-list">
              {decks.map((d) => (
                <li key={d.id}>
                  <Link to={deckPath(d.id)}>{d.name}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              Nenhum baralho. Organize pela Oficina ou abra um baralho
              existente.
            </p>
          )}
          {(links.length > 0 ||
            refs.length > 0 ||
            card.origin.kind === "study") && (
            <>
              <h3>Registros relacionados</h3>
              <ul className="arcana-list">
                {[
                  ...new Set([
                    ...links.map((l) => l.studyId),
                    ...refs,
                    ...(card.origin.kind === "study"
                      ? [card.origin.studyId]
                      : []),
                  ]),
                ].map((id) => {
                  const entry = entries.find((e) => e.id === id);
                  return (
                    <li key={id}>
                      {entry ? (
                        <Link to={`/registros/${encodeURIComponent(id)}`}>
                          {entry.title}
                        </Link>
                      ) : (
                        <span>
                          Registro de origem indisponível · carta preservada
                        </span>
                      )}
                      {links.some((l) => l.studyId === id) && (
                        <small> · vínculo ativo com Estudo</small>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          <Choices
            label="Revisão exibida"
            value={String(version)}
            options={data.versions
              .filter((v) => v.cardId === card.id)
              .map((v) => ({
                value: String(v.revision),
                label: `Revisão ${v.revision} · ${new Date(v.card.updatedAt).toLocaleString("pt-BR")}`,
              }))}
            onChange={(v) => setVersion(Number(v))}
          />
          {card.type === "flashcard" && (
            <>
              <h3>Memória dos Ecos</h3>
              <p>
                {rounds.length} respostas confirmadas ·{" "}
                {rounds.filter((a) => a.recalled).length} lembradas.
                Acompanhamento descritivo, sem nota de domínio.
              </p>
              <ul className="arcana-list">
                {rounds
                  .slice()
                  .reverse()
                  .map((a, i) => (
                    <li key={`${a.session}:${i}`}>
                      <Link
                        to={`/arcanario/ecos/${encodeURIComponent(a.session)}`}
                      >
                        {a.recalled ? "Lembrei" : "Preciso revisar"} · revisão{" "}
                        {a.revision} ·{" "}
                        {new Date(a.answeredAt).toLocaleString("pt-BR")}
                      </Link>
                    </li>
                  ))}
              </ul>
            </>
          )}
          {!card.archived &&
            card.origin.kind !== "official" &&
            !packOwned(card) && (
              <button
                className="arcana-danger"
                disabled={busy}
                onClick={() => {
                  if (
                    window.confirm(
                      "Arquivar esta carta global? Ela sai do acervo ativo e dos Estudos. Baralhos, versões e histórico são preservados.",
                    )
                  )
                    void act(async () => {
                      await app.arcanarium.archiveCard({
                        cardId: card.id,
                        expectedRevision: card.revision,
                      });
                      await reload();
                    });
                }}
              >
                Arquivar carta global
              </button>
            )}
        </div>
      </div>
    </>
  );
}
