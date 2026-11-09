import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { classificationSchema, type Card } from "../../domain/arcanarium";
import type { Question } from "../../domain/provations";
import { Choices } from "./Choices";
import { ClassificationEditor } from "./Taxonomy";
import { arcanaError, cardPath, useArcana } from "./context";
const draftSchema = z.strictObject({
  version: z.literal(1),
  id: z.string().optional(),
  revision: z.int().positive().optional(),
  title: z.string().max(160),
  statement: z.string().max(16000),
  explanation: z.string().max(16000),
  alternatives: z
    .array(
      z.strictObject({ id: z.string().min(1), text: z.string().max(4000) }),
    )
    .min(2)
    .max(5),
  correct: z.string(),
  classification: classificationSchema,
  difficulty: z.enum(["", "easy", "medium", "hard"]),
  provenance: z.string().max(1000),
  exam: z.string().max(160),
  year: z.string().max(4),
  board: z.string().max(160),
  institution: z.string().max(160),
  booklet: z.string().max(160),
});
type Draft = z.infer<typeof draftSchema>;
export function QuestionEditor({ card }: { readonly card?: Card }) {
  const { app, reload, data } = useArcana();
  const navigate = useNavigate();
  const key = card?.id ?? "nova:question",
    q = card?.content.type === "question" ? card.content : undefined;
  const initial: Draft = {
    version: 1,
    ...(card && { id: card.id, revision: card.revision }),
    title: q?.title ?? "",
    statement: q?.statement ?? "",
    explanation: q?.explanation ?? "",
    alternatives: q?.alternatives ?? [
      { id: crypto.randomUUID(), text: "" },
      { id: crypto.randomUUID(), text: "" },
    ],
    correct: q?.correctAlternativeId ?? "",
    classification: q?.classification ?? {
      knowledgeTagIds: [],
      personalTagIds: [],
    },
    difficulty: q?.difficulty ?? "",
    provenance: q?.provenance ?? "",
    exam: q?.source?.exam ?? "",
    year: String(q?.source?.year ?? ""),
    board: q?.source?.board ?? "",
    institution: q?.source?.institution ?? "",
    booklet: q?.source?.booklet ?? "",
  };
  const [recovery] = useState(() => {
    try {
      const raw = app.workshopDrafts.read(key);
      if (!raw) return { draft: initial, message: "" };
      const d = draftSchema.parse(JSON.parse(raw));
      if (d.id !== card?.id) throw new Error("Identidade inválida");
      return {
        draft: d,
        message: "Rascunho de questão recuperado neste aparelho.",
      };
    } catch {
      return {
        draft: initial,
        message: "Rascunho inválido; a carta salva permanece intacta.",
      };
    }
  });
  const [draft, setDraft] = useState(recovery.draft),
    [message, setMessage] = useState(recovery.message),
    [error, setError] = useState(""),
    [storageError, setStorageError] = useState(""),
    [busy, setBusy] = useState(false),
    [preview, setPreview] = useState(false);
  const finished = useRef(false);
  const pending = useRef(draft);
  const patch = (change: Partial<Draft>) => {
    const next = { ...draft, ...change };
    pending.current = next;
    setDraft(next);
    setMessage("");
    try {
      app.workshopDrafts.write(key, JSON.stringify(next));
      setStorageError("");
    } catch {
      setStorageError(
        "Não foi possível guardar o rascunho. Salve a questão antes de sair.",
      );
    }
  };
  useEffect(() => {
    const store = () => {
      if (!finished.current)
        try {
          app.workshopDrafts.write(key, JSON.stringify(pending.current));
        } catch {
          setStorageError(
            "Não foi possível guardar o rascunho. Salve a questão antes de sair.",
          );
        }
    };
    window.addEventListener("pagehide", store);
    document.addEventListener("visibilitychange", store);
    return () => {
      window.removeEventListener("pagehide", store);
      document.removeEventListener("visibilitychange", store);
      store();
    };
  }, [app, key]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (storageError && !finished.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const back = (event: Event) => {
      if (
        storageError &&
        !finished.current &&
        !window.confirm(
          "O rascunho não pôde ser guardado. Sair poderá perder alterações. Sair mesmo assim?",
        )
      )
        event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    window.addEventListener("biblioteca-viva:native-back", back);
    return () => {
      window.removeEventListener("beforeunload", warn);
      window.removeEventListener("biblioteca-viva:native-back", back);
    };
  }, [storageError]);
  const content: Question = {
    type: "question",
    statement: draft.statement,
    alternatives: draft.alternatives,
    correctAlternativeId: draft.correct,
    classification: draft.classification,
    ...(draft.title.trim() && { title: draft.title.trim() }),
    ...(draft.explanation.trim() && { explanation: draft.explanation }),
    ...(draft.difficulty && { difficulty: draft.difficulty }),
    ...(draft.provenance.trim() && { provenance: draft.provenance }),
    source: {
      ...(draft.exam.trim() && { exam: draft.exam.trim() }),
      ...(draft.year && { year: Number(draft.year) }),
      ...(draft.board.trim() && { board: draft.board.trim() }),
      ...(draft.institution.trim() && {
        institution: draft.institution.trim(),
      }),
      ...(draft.booklet.trim() && { booklet: draft.booklet.trim() }),
    },
  };
  const move = (i: number, delta: number) => {
    const alternatives = [...draft.alternatives];
    [alternatives[i], alternatives[i + delta]] = [
      alternatives[i + delta],
      alternatives[i],
    ];
    patch({ alternatives });
  };
  const stale = !!card && draft.revision !== card.revision;
  return (
    <>
      <div className="arcana-heading">
        <div>
          <p className="arcana-eyebrow">Oficina · Inscrições de conhecimento</p>
          <h2>{card ? "Editar questão" : "Criar questão autoral"}</h2>
          <p>
            O enunciado conduz a Provação. O nome identifica a questão no
            acervo.
          </p>
        </div>
      </div>
      <div className="arcana-kind">
        <Link to="/arcanario/oficina/nova">✧ Eco</Link>
        <Link to="/arcanario/oficina/nova?tipo=memory">❧ Lembrança</Link>
        <Link aria-current="page" to="/arcanario/oficina/nova?tipo=question">
          ◇ Questão
        </Link>
      </div>
      {message && <p role="status">{message}</p>}
      {error && (
        <p role="alert" className="arcana-error">
          {error}
        </p>
      )}
      {storageError && <p role="alert">{storageError}</p>}
      {(stale || error) && card && (
        <div className="arcana-panel">
          <p>
            Seu texto continua preservado. A versão atual pode ser conferida
            antes de criar outra revisão.
          </p>
          <details>
            <summary>Conferir questão salva</summary>
            <QuestionFolio
              question={
                card.content.type === "question" ? card.content : content
              }
            />
          </details>
          <button
            disabled={busy}
            onClick={() => {
              void reload()
                .then(async () => {
                  const latest = await app.arcanarium.getCard(card.id);
                  if (
                    latest &&
                    window.confirm(
                      "Usar a revisão atual como base mantendo seus textos? Salvar criará outra revisão.",
                    )
                  ) {
                    patch({ revision: latest.revision });
                    setError("");
                  }
                })
                .catch((e) => setError(arcanaError(e)));
            }}
          >
            Usar revisão atual e manter meu texto
          </button>
        </div>
      )}
      <form
        className="arcana-panel arcana-question-editor"
        onSubmit={(e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          setError("");
          void app.workshop
            .save({
              ...(draft.id && {
                cardId: draft.id,
                expectedRevision: draft.revision,
              }),
              content,
              studyIds: [],
              decks: [],
            })
            .then(async (result) => {
              finished.current = true;
              try {
                app.workshopDrafts.remove(key);
              } catch {
                setMessage(
                  "Questão salva; não foi possível remover o rascunho antigo.",
                );
              }
              await reload();
              void navigate(cardPath(result.id), { replace: true });
            })
            .catch((e) => setError(arcanaError(e)))
            .finally(() => setBusy(false));
        }}
      >
        <fieldset disabled={busy}>
          <legend>Questão de múltipla escolha</legend>
          <label>
            Nome da questão no acervo (opcional)
            <input
              maxLength={160}
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
            />
          </label>
          <p>Usado para identificar e buscar. Não substitui o enunciado.</p>
          <label>
            Enunciado da questão
            <textarea
              required
              rows={8}
              maxLength={16000}
              value={draft.statement}
              onChange={(e) => patch({ statement: e.target.value })}
            />
          </label>
          <p>Este texto será apresentado durante a Provação.</p>
          <fieldset>
            <legend>Alternativas e gabarito</legend>
            <p>
              De 2 a 5 alternativas. As letras acompanham a ordem; a identidade
              da resposta é preservada ao reordenar.
            </p>
            {draft.alternatives.map((a, i) => (
              <div className="arcana-alternative-editor" key={a.id}>
                <label>
                  Alternativa {String.fromCharCode(65 + i)}
                  <textarea
                    required
                    maxLength={4000}
                    rows={3}
                    value={a.text}
                    onChange={(e) =>
                      patch({
                        alternatives: draft.alternatives.map((old) =>
                          old.id === a.id
                            ? { ...old, text: e.target.value }
                            : old,
                        ),
                      })
                    }
                  />
                </label>
                <label className="arcana-check">
                  <input
                    type="radio"
                    name="correct"
                    required
                    checked={draft.correct === a.id}
                    onChange={() => patch({ correct: a.id })}
                  />
                  Gabarito {String.fromCharCode(65 + i)}
                </label>
                <div className="arcana-actions">
                  <button
                    type="button"
                    aria-label={`Subir alternativa ${i + 1}`}
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={`Descer alternativa ${i + 1}`}
                    disabled={i === draft.alternatives.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    disabled={draft.alternatives.length <= 2}
                    onClick={() =>
                      patch({
                        alternatives: draft.alternatives.filter(
                          (v) => v.id !== a.id,
                        ),
                        correct: draft.correct === a.id ? "" : draft.correct,
                      })
                    }
                  >
                    Remover alternativa {String.fromCharCode(65 + i)}
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              disabled={draft.alternatives.length >= 5}
              onClick={() =>
                patch({
                  alternatives: [
                    ...draft.alternatives,
                    { id: crypto.randomUUID(), text: "" },
                  ],
                })
              }
            >
              Adicionar alternativa
            </button>
          </fieldset>
          <label>
            Explicação da resolução
            <textarea
              rows={6}
              maxLength={16000}
              value={draft.explanation}
              onChange={(e) => patch({ explanation: e.target.value })}
            />
          </label>
          <p>Exibida apenas depois de confirmar a resposta na Provação.</p>
          <ClassificationEditor
            value={draft.classification}
            onChange={(classification) => patch({ classification })}
          />
          <Choices
            label="Dificuldade opcional"
            value={draft.difficulty}
            options={[
              { value: "", label: "Não definida" },
              { value: "easy", label: "Fácil" },
              { value: "medium", label: "Média" },
              { value: "hard", label: "Difícil" },
            ]}
            onChange={(v) =>
              patch({ difficulty: draftSchema.shape.difficulty.parse(v) })
            }
          />
          <label>
            Fonte ou proveniência (opcional)
            <input
              maxLength={1000}
              value={draft.provenance}
              onChange={(e) => patch({ provenance: e.target.value })}
            />
          </label>
          <details>
            <summary>Metadados de prova (opcionais)</summary>
            <p>
              Identificam a prova de origem, sem classificar o conhecimento.
            </p>
            {(
              [
                { key: "exam", label: "Nome da prova" },
                { key: "year", label: "Ano" },
                { key: "board", label: "Banca" },
                { key: "institution", label: "Instituição" },
                { key: "booklet", label: "Caderno ou variante" },
              ] as const
            ).map((f) => (
              <label key={f.key}>
                {f.label}
                <input
                  type={f.key === "year" ? "number" : "text"}
                  min={f.key === "year" ? 1 : undefined}
                  max={f.key === "year" ? 9999 : undefined}
                  maxLength={f.key === "year" ? 4 : 160}
                  value={draft[f.key]}
                  onChange={(e) => patch({ [f.key]: e.target.value })}
                />
              </label>
            ))}
          </details>
          <div className="arcana-actions">
            <button
              type="button"
              onClick={() => setPreview((v) => !v)}
              aria-expanded={preview}
            >
              Conferir prévia da questão
            </button>
            <button
              className="button button--primary"
              type="submit"
              disabled={
                !draft.correct ||
                !draft.alternatives.some((a) => a.id === draft.correct)
              }
            >
              Guardar questão no acervo
            </button>
          </div>
        </fieldset>
      </form>
      {preview && (
        <section aria-label="Prévia da questão" className="arcana-folio">
          <p>Nome no acervo: {draft.title || "Sem nome"}</p>
          <QuestionFolio question={content} />
          <p>
            Gabarito do autor:{" "}
            {String.fromCharCode(
              65 + draft.alternatives.findIndex((a) => a.id === draft.correct),
            )}
          </p>
          <p>{draft.explanation}</p>
        </section>
      )}
      <div className="arcana-actions">
        <Link to={card ? cardPath(card.id) : "/arcanario"}>
          Voltar e manter rascunho
        </Link>
        <button
          disabled={busy}
          onClick={() => {
            if (
              window.confirm(
                "Descartar este rascunho? A questão salva será preservada.",
              )
            )
              try {
                app.workshopDrafts.remove(key);
                finished.current = true;
                void navigate(card ? cardPath(card.id) : "/arcanario");
              } catch {
                setStorageError("Não foi possível remover o rascunho.");
              }
          }}
        >
          Descartar rascunho
        </button>
      </div>
      <p className="arcana-muted">
        {data.cards.filter((c) => c.type === "question" && !c.archived).length}{" "}
        questões ativas. Nesta candidata, questões são textuais; imagens
        continuam disponíveis nas lembranças.
      </p>
    </>
  );
}
export function QuestionFolio({
  question,
}: {
  readonly question: Pick<Question, "statement" | "alternatives">;
}) {
  return (
    <div className="arcana-question-text">
      <h3>Enunciado</h3>
      <p>{question.statement}</p>
      <ol type="A">
        {question.alternatives.map((a) => (
          <li key={a.id}>{a.text}</li>
        ))}
      </ol>
    </div>
  );
}
