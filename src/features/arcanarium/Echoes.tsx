import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { CardSession } from "../../domain/arcanarium";
import { ArcanaCard } from "./ArcanaCard";
import { cardTitle } from "./presentation";
import { ArcanaSeal } from "./ArcanaArt";
import { arcanaError, cardPath, useArcana } from "./context";
type ReviewSession = Extract<CardSession, { kind: "flashcard_review" }>;
export function Echoes() {
  const { data } = useArcana();
  const sessions = data.sessions
    .filter((s): s is ReviewSession => s.kind === "flashcard_review")
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const pending = sessions.filter((s) => s.answers.length < s.cards.length),
    complete = sessions.filter((s) => s.answers.length === s.cards.length);
  const answers = sessions.flatMap((s) => s.answers);
  return (
    <>
      <div className="arcana-heading">
        <div>
          <p className="arcana-eyebrow">A memória é um encontro</p>
          <h2>Ecos do conhecimento</h2>
          <p>
            Revisite seus flashcards sem pressa. Cada resposta confirmada fica
            guardada antes do próximo Eco.
          </p>
        </div>
        <ArcanaSeal />
      </div>
      <div className="arcana-stats">
        <span>
          <strong>{answers.length}</strong>respostas guardadas
        </span>
        <span>
          <strong>{answers.filter((a) => a.recalled).length}</strong>lembradas
        </span>
        <span>
          <strong>{pending.length}</strong>rodadas por retomar
        </span>
      </div>
      <div className="arcana-actions">
        <Link className="button button--primary" to="/arcanario/baralhos">
          Escolher um baralho para revisar
        </Link>
        <Link to="/arcanario/oficina/nova">Inscrever um novo Eco</Link>
      </div>
      <p className="arcana-muted">
        Revisão em ordem de baralho, sem algoritmo de repetição espaçada ou
        pontuação de domínio. Só Ecos ativos entram em novas rodadas; rodadas
        iniciadas conservam suas versões.
      </p>
      <h3>Retomar uma rodada</h3>
      {pending.length ? (
        <div className="arcana-history">
          {pending.map((s) => (
            <SessionLink key={s.id} session={s} />
          ))}
        </div>
      ) : (
        <p>Não há rodada interrompida. Escolha um baralho para começar.</p>
      )}
      <h3>Histórico de encontros</h3>
      {complete.length ? (
        <div className="arcana-history">
          {complete.map((s) => (
            <SessionLink key={s.id} session={s} />
          ))}
        </div>
      ) : (
        <div className="arcana-empty">
          <ArcanaSeal />
          <h3>As descobertas deixam rastros</h3>
          <p>
            Suas rodadas concluídas e respostas aparecerão aqui, inclusive após
            reabrir o aplicativo.
          </p>
        </div>
      )}
    </>
  );
}
function SessionLink({ session: s }: { readonly session: ReviewSession }) {
  return (
    <Link
      className="arcana-session-link"
      to={`/arcanario/ecos/${encodeURIComponent(s.id)}`}
    >
      <span>Rodada de {new Date(s.startedAt).toLocaleString("pt-BR")}</span>
      <strong>
        {s.answers.length}/{s.cards.length} respostas ·{" "}
        {s.answers.filter((a) => a.recalled).length} lembradas
      </strong>
      <span>
        {s.answers.length < s.cards.length
          ? "Retomar do próximo Eco →"
          : "Consultar resultado →"}
      </span>
    </Link>
  );
}
export function Review() {
  const { id = "" } = useParams();
  const { data } = useArcana();
  const session = data.sessions.find((s) => s.id === id);
  if (!session || session.kind !== "flashcard_review")
    return (
      <p role="alert">
        Rodada indisponível. Volte aos Ecos e atualize o acervo.
      </p>
    );
  return <Round key={session.id} initial={session} />;
}
function Round({ initial }: { readonly initial: ReviewSession }) {
  const { data, app, reload } = useArcana();
  const [session, setSession] = useState(initial),
    [turn, setTurn] = useState({
      index: initial.answers.length,
      flipped: false,
    }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  // A response confirmed in this screen wins over an older context while refresh finishes.
  const stored = data.sessions.find((s) => s.id === session.id);
  const s =
    stored?.kind === "flashcard_review" &&
    stored.answers.length > session.answers.length
      ? stored
      : session;
  const index = s.answers.length,
    ref = s.cards[index];
  const flipped = turn.index === index && turn.flipped;
  const card =
    ref &&
    data.versions.find(
      (v) => v.cardId === ref.cardId && v.revision === ref.revision,
    )?.card;
  const answer = async (recalled: boolean) => {
    if (busy || !flipped) return;
    setBusy(true);
    setError("");
    try {
      const next = await app.arcanarium.answerReview({
        sessionId: s.id,
        index,
        recalled,
      });
      if (next.kind !== "flashcard_review")
        throw new Error("Rodada incompatível.");
      setSession(next);
      setTurn({ index: next.answers.length, flipped: false });
      await reload();
    } catch (e) {
      setError(arcanaError(e));
    } finally {
      setBusy(false);
    }
  };
  const finished = index === s.cards.length;
  return (
    <>
      <Link to="/arcanario/ecos">
        ← {finished ? "Voltar aos Ecos" : "Interromper e guardar rodada"}
      </Link>
      <div className="arcana-heading">
        <div>
          <p className="arcana-eyebrow">
            {finished ? "Um encontro guardado" : "Frente, verso, descoberta"}
          </p>
          <h2>{finished ? "Rodada concluída" : "Revisão dos Ecos"}</h2>
          <p>
            {finished
              ? `${s.answers.filter((a) => a.recalled).length} de ${s.cards.length} Ecos lembrados`
              : `${index} de ${s.cards.length} respostas confirmadas · Eco ${index + 1}`}
          </p>
        </div>
      </div>
      {error && (
        <div role="alert" className="arcana-error">
          <p>{error}</p>
          <button
            disabled={busy}
            onClick={() =>
              void reload()
                .then(() => setError(""))
                .catch((e) => setError(arcanaError(e)))
            }
          >
            Consultar respostas salvas
          </button>
        </div>
      )}
      {finished ? (
        <div className="arcana-result">
          <ArcanaSeal />
          <p>
            Você lembrou de {s.answers.filter((a) => a.recalled).length} e
            escolheu revisitar {s.answers.filter((a) => !a.recalled).length}. As
            respostas e as versões vistas permanecem no histórico.
          </p>
          <ol className="arcana-list">
            {s.cards.map((r, i) => {
              const c = data.versions.find(
                (v) => v.cardId === r.cardId && v.revision === r.revision,
              )?.card;
              return (
                <li key={`${r.cardId}:${i}`}>
                  <Link to={cardPath(r.cardId)}>
                    {c ? cardTitle(c.content) : "Carta indisponível"}
                  </Link>
                  <span>
                    {" "}
                    · {s.answers[i].recalled ? "Lembrei" : "Preciso revisar"} ·
                    revisão {r.revision}
                  </span>
                </li>
              );
            })}
          </ol>
          <Link className="button button--primary" to="/arcanario/baralhos">
            Escolher outro encontro
          </Link>
        </div>
      ) : card ? (
        <div className="arcana-review">
          <progress
            value={index}
            max={s.cards.length}
            aria-label="Respostas confirmadas"
          />
          <ArcanaCard content={card.content} flipped={flipped} />
          <button
            className="button button--secondary"
            disabled={busy}
            aria-pressed={flipped}
            onClick={() => setTurn({ index, flipped: !flipped })}
          >
            Virar carta · {flipped ? "mostrar frente" : "revelar resposta"}
          </button>
          <div className="arcana-review__answers">
            <button
              disabled={!flipped || busy}
              onClick={() => void answer(false)}
            >
              Preciso revisar
            </button>
            <button
              className="button button--primary"
              disabled={!flipped || busy}
              onClick={() => void answer(true)}
            >
              Lembrei · próximo Eco
            </button>
          </div>
          <p className="arcana-muted">
            {busy
              ? "Confirmando resposta no acervo…"
              : "Revele o verso antes de responder. Você pode sair e retomar pelo histórico."}
          </p>
        </div>
      ) : (
        <p role="alert">
          A versão desta carta não pôde ser carregada. Consulte as respostas
          salvas ou volte aos Ecos.
        </p>
      )}
    </>
  );
}
