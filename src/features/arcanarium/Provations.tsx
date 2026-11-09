import { useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  selectDeck,
  isTrial,
  trialPresentation,
  trialScore,
  type Trial,
  type TrialCommand,
} from "../../domain/provations";
import type { Deck } from "../../domain/arcanarium";
import { TrialFilters } from "./TrialFilters";
import {
  defaultCriteria,
  modernCriteria,
  trialPath,
  statusNames,
  type Criteria,
} from "./presentation";
import { arcanaError, useArcana, deckPath } from "./context";
export function Provations() {
  const { app, data, reload } = useArcana();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [criteria, setCriteria] = useState(() => ({
      ...defaultCriteria,
      ...(params.get("pacote") ? { packId: params.get("pacote")! } : {}),
    })),
    [deckId, setDeckId] = useState(params.get("baralho") ?? ""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const deck = data.decks.find((d) => d.id === deckId),
    selection = deck?.selection ?? { kind: "dynamic" as const, criteria };
  let count = 0,
    selectionError = "";
  try {
    count = selectDeck(data, selection).filter((r) =>
      data.versions.some(
        (v) =>
          v.cardId === r.cardId &&
          v.revision === r.revision &&
          v.card.type === "question",
      ),
    ).length;
  } catch {
    selectionError = "Critérios inválidos ou referências indisponíveis.";
  }
  const history = data.sessions.filter(isTrial).slice().reverse();
  return (
    <>
      <div className="arcana-heading">
        <div>
          <p className="arcana-eyebrow">O fólio das Provações</p>
          <h2>Provações</h2>
          <p>
            Exercite, confira a resolução e reconheça o que ainda pede estudo.
            Tudo fica neste aparelho.
          </p>
        </div>
        <span className="arcana-trial-sigil" aria-hidden="true">
          ✧ ◇ ✧
        </span>
      </div>
      <div className="arcana-actions">
        <Link to="/arcanario/oficina/nova?tipo=question">Criar questão</Link>
        <Link to="/arcanario/pacotes">Biblioteca de Provas</Link>
        <Link to="/arcanario/assuntos">Organizar assuntos</Link>
        <Link to="/arcanario/diagnostico">Diagnóstico e relatórios</Link>
        <Link to="/arcanario/baralhos/novo?tipo=dynamic">
          Criar baralho dinâmico
        </Link>
      </div>
      {error && <p role="alert">{error}</p>}
      <form
        className="arcana-panel"
        onSubmit={(e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          setError("");
          void app.provations
            .start(deck ? { deckId: deck.id } : { selection })
            .then(async (s) => {
              await reload();
              void navigate(trialPath(s.id));
            })
            .catch((e) => setError(arcanaError(e)))
            .finally(() => setBusy(false));
        }}
      >
        <fieldset disabled={busy}>
          <legend>Preparar uma Provação</legend>
          <label className="arcana-choice">
            <input
              type="radio"
              name="trialDeck"
              checked={!deckId}
              onChange={() => setDeckId("")}
            />
            Configurar critérios agora
          </label>
          <details>
            <summary>Usar um baralho salvo</summary>
            {data.decks.map((d) => (
              <label className="arcana-choice" key={d.id}>
                <input
                  type="radio"
                  name="trialDeck"
                  checked={deckId === d.id}
                  onChange={() => setDeckId(d.id)}
                />
                {d.name} ·{" "}
                {d.selection.kind === "static" ? "estático" : "dinâmico"}
              </label>
            ))}
          </details>
          {!deck && <TrialFilters value={criteria} onChange={setCriteria} />}
          {deck && (
            <>
              <h3>{deck.name}</h3>
              <p>A seleção usa os critérios e revisões salvos no baralho.</p>
              <Link to={deckPath(deck.id)}>Conferir critérios e ordem</Link>
            </>
          )}
          <p role="status">
            {selectionError ||
              `${count} questões elegíveis. A quantidade é limitada ao acervo disponível; cada questão aparece uma vez.`}
          </p>
          <p>
            A seleção e a ordem serão fixadas ao iniciar. Arquivadas ficam de
            fora; revisões fixas são respeitadas.
          </p>
          <button
            className="button button--primary"
            type="submit"
            disabled={!count || !!selectionError || busy}
          >
            Iniciar Provação
          </button>
        </fieldset>
      </form>
      <section className="arcana-panel">
        <h3>Histórico e retomada</h3>
        {!history.length && (
          <p>
            Nenhuma Provação iniciada. Crie questões e prepare sua primeira
            sessão.
          </p>
        )}
        <ul className="arcana-list">
          {history.map((s) => (
            <li key={s.id}>
              <Link to={trialPath(s.id)}>
                {statusNames[s.trial.status]} ·{" "}
                {new Date(s.startedAt).toLocaleString("pt-BR")} ·{" "}
                {s.trial.answers.length}/{s.cards.length} respostas
                {s.trial.deck ? ` · ${s.trial.deck.name}` : ""}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      {data.sessions.some((s) => s.kind === "question_session" && !s.trial) && (
        <p>
          Contratos de sessão antigos sem respostas permanecem preservados; não
          são contabilizados como Provações.
        </p>
      )}
    </>
  );
}
export function DynamicDeckEditor({ deck }: { readonly deck?: Deck }) {
  const { app, data, reload } = useArcana();
  const navigate = useNavigate();
  const [base, setBase] = useState(deck),
    [name, setName] = useState(deck?.name ?? ""),
    [criteria, setCriteria] = useState<Criteria>(
      deck?.selection.kind === "dynamic"
        ? modernCriteria(deck.selection.criteria)
        : defaultCriteria,
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  let count = 0;
  try {
    count = selectDeck(data, { kind: "dynamic", criteria }).length;
  } catch {
    /* Invalid drafts cannot be saved by the application. */
  }
  return (
    <>
      <Link to="/arcanario/baralhos">← Baralhos</Link>
      <h2>{base?.name ?? "Novo baralho dinâmico"}</h2>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      <form
        className="arcana-panel"
        onSubmit={(e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          setError("");
          void app.arcanarium
            .saveDeck({
              ...(base && { id: base.id, expectedRevision: base.revision }),
              name,
              selection: { kind: "dynamic", criteria },
            })
            .then(async (saved) => {
              setBase(saved);
              await reload();
              setMessage(
                "Critérios salvos. A seleção concreta será fixada somente ao iniciar a Provação.",
              );
              if (!deck) void navigate(deckPath(saved.id), { replace: true });
            })
            .catch((e) => setError(arcanaError(e)))
            .finally(() => setBusy(false));
        }}
      >
        <fieldset disabled={busy || base?.origin.kind === "official"}>
          <legend>Baralho por critérios</legend>
          <label>
            Nome do baralho
            <input
              required
              maxLength={160}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <TrialFilters value={criteria} onChange={setCriteria} />
          <p role="status">{count} cartas elegíveis agora.</p>
          <button className="button button--primary" type="submit">
            Salvar baralho
          </button>
        </fieldset>
      </form>
      {error && base && (
        <button
          onClick={() =>
            void app.arcanarium
              .getDeck(base.id)
              .then((d) => {
                if (
                  d &&
                  window.confirm(
                    "Usar revisão atual mantendo os seus critérios?",
                  )
                )
                  setBase(d);
              })
              .catch((e) => setError(arcanaError(e)))
          }
        >
          Atualizar revisão e manter critérios
        </button>
      )}
      {base && (
        <Link
          to={`/arcanario/provacoes?baralho=${encodeURIComponent(base.id)}`}
        >
          Preparar Provação com baralho salvo →
        </Link>
      )}
    </>
  );
}
export function TrialSession() {
  const { id } = useParams();
  const { data } = useArcana();
  const s = data.sessions.find((s) => s.id === id);
  if (!s || !isTrial(s)) return <p role="alert">Provação indisponível.</p>;
  return <TrialView key={`${s.id}:${s.trial.position}`} session={s} />;
}
function TrialView({ session: s }: { readonly session: Trial }) {
  const { app, data, reload } = useArcana();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [historyIndex, setHistoryIndex] = useState(0);
  const terminal =
    s.trial.status === "completed" || s.trial.status === "abandoned";
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [s.id, s.trial.position, s.trial.status, terminal]);
  const p = trialPresentation(
      data,
      s,
      terminal ? historyIndex : s.trial.position,
    ),
    score = trialScore(s);
  const command = async (c: TrialCommand, exit = false) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await app.provations.command({
        sessionId: s.id,
        expectedRevision: s.trial.revision,
        command: c,
      });
      await reload();
      if (exit) void navigate("/arcanario/provacoes");
    } catch (e) {
      setError(arcanaError(e));
      await reload().catch(() => undefined);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Link to="/arcanario/provacoes">← Provações e histórico</Link>
      <div className="arcana-heading">
        <div>
          <p className="arcana-eyebrow">
            {s.trial.deck?.name ?? "Fólio de exercícios"}
          </p>
          <h2 ref={heading} tabIndex={-1}>
            {terminal
              ? "Resultado da Provação"
              : s.trial.status === "paused"
                ? "Provação pausada"
                : `Questão ${s.trial.position + 1} de ${s.cards.length}`}
          </h2>
          <p>
            {statusNames[s.trial.status]} · {s.trial.answers.length} respostas
            confirmadas
          </p>
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      {terminal && (
        <>
          <Score score={score} />
          <p>
            Acertos sobre respondidas. Repetir a mesma questão não equivale a
            novas evidências de domínio.
          </p>
          <Link to="/arcanario/diagnostico">Consultar diagnóstico</Link>
          <div className="arcana-actions">
            <button
              disabled={!historyIndex}
              onClick={() => setHistoryIndex((i) => i - 1)}
            >
              Questão anterior
            </button>
            <span>
              Questão {historyIndex + 1} de {s.cards.length}
            </span>
            <button
              disabled={historyIndex === s.cards.length - 1}
              onClick={() => setHistoryIndex((i) => i + 1)}
            >
              Questão seguinte
            </button>
          </div>
        </>
      )}
      {s.trial.status === "paused" ? (
        <div className="arcana-panel">
          <p>
            Sua posição, alternativas e respostas estão guardadas. A sessão
            conserva as revisões do início.
          </p>
          <button
            className="button button--primary"
            disabled={busy}
            onClick={() => void command({ kind: "resume" })}
          >
            Retomar Provação
          </button>
        </div>
      ) : (
        <section className="arcana-folio" aria-label="Questão da Provação">
          <p className="arcana-eyebrow">
            Inscrição {terminal ? historyIndex + 1 : s.trial.position + 1} ·
            revisão{" "}
            {s.cards[terminal ? historyIndex : s.trial.position].revision}
          </p>
          <h3>Enunciado</h3>
          <p className="arcana-statement">{p.statement}</p>
          <fieldset disabled={busy || !!p.answer || terminal}>
            <legend>Escolha uma alternativa</legend>
            {p.alternatives.map((a, i) => (
              <label
                className="arcana-answer"
                key={a.id}
                data-selected={(p.answer?.alternativeId ?? selected) === a.id}
                data-correct={
                  p.correction?.correctAlternativeId === a.id || undefined
                }
              >
                <input
                  type="radio"
                  name="answer"
                  value={a.id}
                  checked={(p.answer?.alternativeId ?? selected) === a.id}
                  onChange={() => setSelected(a.id)}
                />
                <strong>{String.fromCharCode(65 + i)}</strong>{" "}
                <span>{a.text}</span>
              </label>
            ))}
          </fieldset>
          {!terminal && !p.answer && (
            <button
              disabled={!selected || busy}
              className="button button--primary"
              onClick={() =>
                void command({ kind: "answer", alternativeId: selected })
              }
            >
              Confirmar resposta
            </button>
          )}
          {p.answer && p.correction && (
            <div className="arcana-correction" role="status">
              <h3>
                {p.answer.correct ? "Resposta correta" : "Resposta incorreta"}
              </h3>
              <p>
                Sua escolha:{" "}
                {String.fromCharCode(
                  65 +
                    p.alternatives.findIndex(
                      (a) => a.id === p.answer?.alternativeId,
                    ),
                )}
                . Correta:{" "}
                {String.fromCharCode(
                  65 +
                    p.alternatives.findIndex(
                      (a) => a.id === p.correction?.correctAlternativeId,
                    ),
                )}
                .
              </p>
              <h4>Resolução comentada</h4>
              <p>
                {p.correction.explanation ??
                  "O autor ainda não cadastrou uma explicação."}
              </p>
              {!terminal && (
                <button
                  autoFocus
                  disabled={busy}
                  className="button button--primary"
                  onClick={() => void command({ kind: "next" })}
                >
                  {s.trial.position === s.cards.length - 1
                    ? "Concluir Provação"
                    : "Próxima questão"}
                </button>
              )}
            </div>
          )}
          {terminal && !p.answer && (
            <p>Não respondida. Nenhum erro foi atribuído.</p>
          )}
        </section>
      )}
      {!terminal && (
        <div className="arcana-actions">
          <button
            disabled={busy}
            onClick={() => void command({ kind: "pause" }, true)}
          >
            Pausar e sair
          </button>
          <button
            disabled={busy}
            onClick={() => {
              if (
                window.confirm(
                  "Concluir agora? Questões sem resposta serão registradas como não respondidas.",
                )
              )
                void command({ kind: "complete" });
            }}
          >
            Concluir com não respondidas
          </button>
          <button
            disabled={busy}
            onClick={() => {
              if (
                window.confirm(
                  "Abandonar esta sessão? Respostas confirmadas e histórico serão preservados.",
                )
              )
                void command({ kind: "abandon" });
            }}
          >
            Abandonar Provação
          </button>
        </div>
      )}
    </>
  );
}
export function Score({
  score,
}: {
  readonly score: ReturnType<typeof trialScore>;
}) {
  return (
    <dl className="arcana-score">
      {[
        ["Apresentadas", score.presented],
        ["Respondidas", score.answered],
        ["Corretas", score.correct],
        ["Incorretas", score.incorrect],
        ["Não respondidas", score.unanswered],
        [
          "Acertos sobre respondidas",
          score.accuracy === null ? "Sem respostas" : `${score.accuracy}%`,
        ],
      ].map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
