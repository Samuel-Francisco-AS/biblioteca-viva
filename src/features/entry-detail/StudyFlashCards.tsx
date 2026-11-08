import type { ArcanariumService } from "../../application/arcanarium";
import { useRef, useState, type FormEvent } from "react";
import type { FlashCard, StudyEntry } from "../../domain";
import { presentApplicationError } from "../entry-editor/errorMessages";

export interface FlashCardApplication {
  readonly arcanarium: Pick<ArcanariumService, "startReview" | "answerReview">;
  readonly commands: {
    readonly saveFlashCard: { execute(input: unknown): Promise<StudyEntry> };
    readonly deleteFlashCard: { execute(input: unknown): Promise<StudyEntry> };
  };
}

export function StudyFlashCards({
  application,
  entry,
  onChange,
}: {
  readonly application: FlashCardApplication;
  readonly entry: StudyEntry;
  readonly onChange: (entry: StudyEntry) => void;
}) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [editing, setEditing] = useState<string>();
  const [editingRevision, setEditingRevision] = useState<number>();
  const [reviewId, setReviewId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState("");
  const [deck, setDeck] = useState<readonly FlashCard[]>();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [remembered, setRemembered] = useState(0);
  const [again, setAgain] = useState<readonly FlashCard[]>([]);
  const cardButton = useRef<HTMLButtonElement>(null);
  const reviewButton = useRef<HTMLButtonElement>(null);
  const frontField = useRef<HTMLTextAreaElement>(null);
  const saving = useRef(false);
  const cards = entry.flashCards ?? [];
  const card = deck?.[index];
  const reset = () => {
    setFront("");
    setBack("");
    setEditing(undefined);
    setEditingRevision(undefined);
  };
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError(undefined);
    try {
      onChange(
        await application.commands.saveFlashCard.execute({
          entryId: entry.id,
          cardId: editing,
          expectedRevision: editingRevision,
          front,
          back,
        }),
      );
      reset();
      setMessage(
        editing
          ? "Carta atualizada."
          : "Uma nova carta entrou no seu grimório.",
      );
    } catch (failure: unknown) {
      setError(presentApplicationError(failure).message);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  async function review(selection: readonly FlashCard[]) {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError(undefined);
    try {
      // Shuffle a snapshot; the persisted deck and its order remain untouched.
      const shuffled = [...selection];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const refs = shuffled.map((item) => {
        if (!item.globalCardId || !item.revision)
          throw new Error("Missing canonical card reference");
        return { cardId: item.globalCardId, revision: item.revision };
      });
      const session = await application.arcanarium.startReview(refs);
      setReviewId(session.id);
      setDeck(shuffled);
      setIndex(0);
      setFlipped(false);
      setRemembered(0);
      setAgain([]);
      window.requestAnimationFrame(() => cardButton.current?.focus());
    } catch (failure: unknown) {
      setError(presentApplicationError(failure).message);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  async function next(recalled: boolean) {
    if (!card || !flipped || !reviewId || saving.current) return;
    saving.current = true;
    setBusy(true);
    setError(undefined);
    try {
      await application.arcanarium.answerReview({
        sessionId: reviewId,
        index,
        recalled,
      });
      if (recalled) setRemembered((value) => value + 1);
      else setAgain((value) => [...value, card]);
      setFlipped(false);
      setIndex((value) => value + 1);
      window.requestAnimationFrame(() => cardButton.current?.focus());
    } catch (failure: unknown) {
      setError(presentApplicationError(failure).message);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  return (
    <section
      className="study-chapter study-cards"
      aria-labelledby="study-cards-title"
    >
      <div className="study-chapter-heading">
        <div>
          <p className="study-kicker">IV · Pequenos encantamentos da memória</p>
          <h3 id="study-cards-title">Grimório de revisão</h3>
        </div>
        <span className="study-card-count">
          {cards.length} {cards.length === 1 ? "carta" : "cartas"}
        </span>
      </div>
      <p>
        Escreva uma pista. Guarde uma descoberta no verso. Depois, desafie sua
        memória.
      </p>
      {error && <p role="alert">{error}</p>}
      <p className="study-feedback" role="status">
        {message}
      </p>
      {!deck && (
        <button
          className="button button--primary"
          ref={reviewButton}
          disabled={busy || cards.length === 0}
          onClick={() => void review(cards)}
          type="button"
        >
          Revisar cartas
        </button>
      )}
      {deck && (
        <div className="study-review" aria-label="Revisão de flash cards">
          {card ? (
            <>
              <p className="study-review__counter" aria-live="polite">
                Carta {index + 1} de {deck.length} · {remembered} lembradas
              </p>
              <div className="study-card-arrival" key={`${card.id}-${index}`}>
                <button
                  ref={cardButton}
                  type="button"
                  className="study-flash-card"
                  data-flipped={flipped}
                  aria-pressed={flipped}
                  aria-label={`${flipped ? "Resposta" : "Pergunta"}: ${flipped ? card.back : card.front}. ${flipped ? "Toque para voltar à pergunta" : "Toque para revelar o verso"}`}
                  onClick={() => setFlipped((value) => !value)}
                >
                  <span className="study-flash-card__rotor">
                    <span className="study-flash-card__face" aria-hidden="true">
                      <span className="study-kicker">✧ A pista</span>
                      <span className="study-flash-card__content">
                        {card.front}
                      </span>
                      <small>Toque para revelar</small>
                    </span>
                    <span
                      className="study-flash-card__face study-flash-card__back"
                      aria-hidden="true"
                    >
                      <span className="study-kicker">✦ A descoberta</span>
                      <span className="study-flash-card__content">
                        {card.back}
                      </span>
                      <small>Toque para voltar</small>
                    </span>
                  </span>
                </button>
              </div>
              <div className="study-review-controls">
                <button
                  className="button button--secondary"
                  disabled={busy || !flipped}
                  type="button"
                  onClick={() => void next(false)}
                >
                  Rever depois →
                </button>
                <button
                  className="button button--primary"
                  disabled={busy || !flipped}
                  type="button"
                  onClick={() => void next(true)}
                >
                  Lembrei →
                </button>
              </div>
              <p className="study-hint">
                Revele o verso antes de escolher. Suas respostas são guardadas
                no histórico de revisão.
              </p>
            </>
          ) : (
            <div
              className="study-review-result"
              tabIndex={-1}
              ref={(node) => node?.focus()}
            >
              <span aria-hidden="true">✦</span>
              <h4>Uma volta pelo seu saber</h4>
              <p>
                {remembered} de {deck.length} cartas lembradas.{" "}
                {again.length > 0
                  ? "As outras merecem um reencontro."
                  : "Cada descoberta encontrou seu lugar."}
              </p>
              {again.length > 0 && (
                <button
                  className="button button--primary"
                  type="button"
                  disabled={busy}
                  onClick={() => void review(again)}
                >
                  Revisitar {again.length} cartas
                </button>
              )}
              <button
                className="button button--secondary"
                type="button"
                disabled={busy}
                onClick={() => void review(cards)}
              >
                Nova rodada
              </button>
            </div>
          )}
          <button
            className="text-button"
            disabled={busy}
            type="button"
            onClick={() => {
              setDeck(undefined);
              window.requestAnimationFrame(() => reviewButton.current?.focus());
            }}
          >
            Encerrar revisão
          </button>
        </div>
      )}
      <details
        className="study-disclosure study-card-editor"
        open={editing !== undefined || undefined}
      >
        <summary>
          {editing ? "Editar carta" : "Inscrever uma nova carta"}
        </summary>
        <form onSubmit={(event) => void save(event)}>
          <label className="form-field">
            Frente · pergunta ou pista
            <textarea
              ref={frontField}
              data-study-draft
              name="front"
              rows={3}
              value={front}
              onChange={(event) => setFront(event.target.value)}
              maxLength={4000}
              required
            />
          </label>
          <label className="form-field">
            Verso · resposta ou descoberta
            <textarea
              data-study-draft
              name="back"
              rows={4}
              value={back}
              onChange={(event) => setBack(event.target.value)}
              maxLength={8000}
              required
            />
          </label>
          <div className="form-actions">
            <button
              className="button button--primary"
              type="submit"
              disabled={busy}
            >
              {editing ? "Salvar carta" : "Guardar carta"}
            </button>
            {editing && (
              <button
                className="button button--secondary"
                disabled={busy}
                type="button"
                onClick={reset}
              >
                Cancelar edição
              </button>
            )}
          </div>
        </form>
      </details>
      <details className="study-disclosure">
        <summary>Suas cartas · {cards.length}</summary>
        {cards.length === 0 ? (
          <p>O grimório espera sua primeira descoberta.</p>
        ) : (
          <ol className="study-card-library">
            {cards.map((item) => (
              <li key={item.id}>
                <details>
                  <summary>{item.front}</summary>
                  <p>{item.back}</p>
                </details>
                <div className="form-actions">
                  <button
                    className="text-button"
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      if (
                        (front.trim() || back.trim()) &&
                        !window.confirm("Descartar o rascunho da carta atual?")
                      )
                        return;
                      setEditing(item.id);
                      setEditingRevision(item.revision);
                      setFront(item.front);
                      setBack(item.back);
                      window.requestAnimationFrame(() =>
                        frontField.current?.focus(),
                      );
                    }}
                  >
                    Editar carta
                  </button>
                  <button
                    className="text-button"
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      if (saving.current) return;
                      if (
                        !window.confirm(
                          "Retirar esta carta deste estudo? Ela continuará no acervo global.",
                        )
                      )
                        return;
                      saving.current = true;
                      setBusy(true);
                      setError(undefined);
                      void application.commands.deleteFlashCard
                        .execute({
                          entryId: entry.id,
                          cardId: item.id,
                          expectedRevision: item.revision,
                        })
                        .then(
                          (updated) => {
                            onChange(updated);
                            if (editing === item.id) reset();
                            setMessage("Carta retirada deste estudo.");
                          },
                          (failure: unknown) =>
                            setError(presentApplicationError(failure).message),
                        )
                        .finally(() => {
                          saving.current = false;
                          setBusy(false);
                        });
                    }}
                  >
                    Excluir carta
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </details>
    </section>
  );
}
