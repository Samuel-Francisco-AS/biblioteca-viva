import { QuestionEditor } from "./QuestionEditor";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { z } from "zod";
import {
  cardAppearanceSchema,
  type Card,
  type CardContent,
} from "../../domain/arcanarium";
import { ApplicationError } from "../../application/errors";
import { Choices } from "./Choices";
import { ArcanaCard } from "./ArcanaCard";
import { ArcanaSeal } from "./ArcanaArt";
import { arcanaError, cardPath, useArcana } from "./context";
const draftSchema = z.strictObject({
  version: z.literal(1),
  type: z.enum(["flashcard", "memory"]),
  cardId: z.string().optional(),
  revision: z.int().positive().optional(),
  title: z.string().max(160),
  front: z.string().max(4000),
  back: z.string().max(8000),
  text: z.string().max(8000),
  category: z.string().max(80),
  appearance: cardAppearanceSchema,
  entryIds: z.array(z.string()).max(100),
  studyIds: z.array(z.string()).max(100),
  decks: z
    .array(
      z.strictObject({
        id: z.string(),
        expectedRevision: z.int().positive(),
        included: z.boolean(),
      }),
    )
    .max(500),
  imageId: z.string().optional(),
  image: z
    .strictObject({
      dataUrl: z.string().max(350000),
      width: z.int().positive().max(1600),
      height: z.int().positive().max(1600),
    })
    .nullable()
    .optional(),
});
type Draft = z.infer<typeof draftSchema>;
export function Workshop() {
  const { id = "nova" } = useParams();
  const [params] = useSearchParams();
  const { data } = useArcana();
  const card = id === "nova" ? undefined : data.cards.find((c) => c.id === id);
  const type =
    card?.type ??
    (params.get("tipo") === "question"
      ? "question"
      : params.get("tipo") === "memory"
        ? "memory"
        : "flashcard");
  if (id !== "nova" && !card)
    return (
      <p role="alert">
        Carta indisponível. Seu rascunho local permanece preservado.
      </p>
    );
  if (
    type === "question" &&
    !card?.archived &&
    card?.origin.kind !== "official"
  )
    return <QuestionEditor key={id} card={card} />;
  if (
    (type !== "flashcard" && type !== "memory") ||
    card?.archived ||
    card?.origin.kind === "official"
  )
    return <p>Esta carta não possui edição autoral nesta etapa.</p>;
  return <Editor key={`${id}:${type}`} card={card} type={type} />;
}
function Editor({
  card,
  type,
}: {
  readonly card?: Card;
  readonly type: "flashcard" | "memory";
}) {
  const { app, data, entries, reload } = useArcana();
  const navigate = useNavigate();
  const draftKey = card?.id ?? `nova:${type}`;
  const content = card?.content;
  const initial: Draft = {
    version: 1,
    type,
    ...(card && { cardId: card.id, revision: card.revision }),
    title:
      content?.type === "memory" || content?.type === "flashcard"
        ? (content.title ?? "")
        : "",
    front: content?.type === "flashcard" ? content.front : "",
    back: content?.type === "flashcard" ? content.back : "",
    text: content?.type === "memory" ? (content.text ?? "") : "",
    category: content?.type === "memory" ? (content.category ?? "") : "",
    appearance: (content?.type === "memory" || content?.type === "flashcard"
      ? content.appearance
      : undefined) ?? {
      theme: type === "memory" ? "verdant" : "astral",
      frame: type === "memory" ? "herbarium" : "constellation",
    },
    entryIds: content?.type === "memory" ? content.entryIds : [],
    studyIds: data.studyLinks
      .filter((l) => l.cardId === card?.id && l.active)
      .map((l) => l.studyId),
    decks: data.decks
      .filter(
        (d) => d.selection.kind === "static" && d.origin.kind !== "official",
      )
      .map((d) => ({
        id: d.id,
        expectedRevision: d.revision,
        included:
          d.selection.kind === "static" &&
          d.selection.cards.some((r) => r.cardId === card?.id),
      })),
    ...(content?.type === "memory" &&
      content.imageId && { imageId: content.imageId }),
  };
  const [recovery] = useState(() => {
    try {
      const saved = app.workshopDrafts.read(draftKey);
      if (!saved) return { draft: initial, message: "" };
      const d = draftSchema.parse(JSON.parse(saved));
      if (d.type !== type || d.cardId !== card?.id)
        throw new Error("Identidade incompatível.");
      const decks = initial.decks.map(
        (current) =>
          d.decks.find((saved) => saved.id === current.id) ?? current,
      );
      return {
        draft: { ...d, decks },
        message:
          "Rascunho recuperado deste aparelho. Confira a prévia antes de salvar.",
      };
    } catch {
      return {
        draft: initial,
        message:
          "O rascunho local não pôde ser recuperado. A carta salva permanece intacta.",
      };
    }
  });
  const [draft, setDraft] = useState(recovery.draft),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(recovery.message),
    [storageError, setStorageError] = useState(""),
    [busy, setBusy] = useState(false),
    [flipped, setFlipped] = useState(false),
    [conflict, setConflict] = useState(false),
    [saved, setSaved] = useState(false);
  const finished = useRef(false);
  const pending = useRef(draft);
  useLayoutEffect(() => {
    pending.current = draft;
  }, [draft]);
  const patch = (change: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...change }));
    setNotice("");
  };
  useEffect(() => {
    const store = () => {
      if (finished.current) return;
      try {
        app.workshopDrafts.write(draftKey, JSON.stringify(pending.current));
        setStorageError("");
      } catch {
        setStorageError(
          "Não foi possível guardar o rascunho local. Mantenha esta tela aberta e salve a carta antes de sair.",
        );
      }
    };
    const handle = window.setTimeout(store, 250);
    window.addEventListener("pagehide", store);
    const visibility = () => {
      if (document.visibilityState === "hidden") store();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.clearTimeout(handle);
      window.removeEventListener("pagehide", store);
      document.removeEventListener("visibilitychange", visibility);
      store();
    };
  }, [app, draftKey, draft]);
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
          "O rascunho não pôde ser guardado. Sair poderá perder as alterações. Sair mesmo assim?",
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
  const preview: CardContent =
    type === "flashcard"
      ? {
          type,
          front: draft.front,
          back: draft.back,
          ...(draft.title.trim() && { title: draft.title }),
          appearance: draft.appearance,
        }
      : {
          type,
          title: draft.title,
          text: draft.text,
          entryIds: draft.entryIds,
          appearance: draft.appearance,
          ...(draft.category.trim() && { category: draft.category }),
          ...(draft.image !== null &&
            draft.imageId && { imageId: draft.imageId }),
        };
  const stale = !!card && draft.revision !== card.revision;
  const save = async () => {
    if (busy || saved) return;
    setBusy(true);
    setError("");
    setConflict(false);
    try {
      const clean = { ...preview };
      if (clean.type === "memory" && !clean.text?.trim()) delete clean.text;
      const result = await app.workshop.save({
        ...(draft.cardId && {
          cardId: draft.cardId,
          expectedRevision: draft.revision,
        }),
        content: clean,
        studyIds: draft.studyIds,
        decks: draft.decks,
        ...(draft.image !== undefined && { image: draft.image }),
      });
      finished.current = true;
      setSaved(true);
      try {
        app.workshopDrafts.remove(draftKey);
      } catch {
        setNotice(
          "Carta salva. O rascunho local antigo não pôde ser removido.",
        );
      }
      await reload();
      void navigate(cardPath(result.id), { replace: true });
    } catch (e) {
      setError(arcanaError(e));
      setConflict(e instanceof ApplicationError && e.code === "CONFLICT");
    } finally {
      setBusy(false);
    }
  };
  const rebase = async () => {
    if (
      !window.confirm(
        "Manter seus textos e escolhas usando a revisão mais recente como base? Confira a carta atual abaixo; salvar criará uma nova revisão, preservando as anteriores.",
      )
    )
      return;
    try {
      await reload();
      const latest = card && (await app.arcanarium.getCard(card.id));
      const all = await app.arcanarium.list();
      patch({
        ...(latest && { revision: latest.revision }),
        decks: all.decks
          .filter(
            (d) =>
              d.selection.kind === "static" && d.origin.kind !== "official",
          )
          .map((d) => ({
            id: d.id,
            expectedRevision: d.revision,
            included: draft.decks.find((x) => x.id === d.id)?.included ?? false,
          })),
      });
      setConflict(false);
      setError("");
      setNotice(
        "Revisões atuais carregadas. Seus textos foram mantidos. Confira antes de salvar.",
      );
    } catch (e) {
      setError(arcanaError(e));
    }
  };
  const select = (values: string[], id: string) =>
    values.includes(id) ? values.filter((v) => v !== id) : [...values, id];
  return (
    <>
      <div className="arcana-heading">
        <div>
          <p className="arcana-eyebrow">O ateliê das pequenas eternidades</p>
          <h2>Oficina de Cartas</h2>
          <p>
            {card
              ? "Edite uma identidade, atualize todos os seus encontros."
              : "Dê forma a uma descoberta ou guarde um fragmento da sua história."}
          </p>
        </div>
        <ArcanaSeal kind="workshop" />
      </div>
      {!card && (
        <div className="arcana-kind">
          <Link
            aria-current={type === "flashcard" ? "page" : undefined}
            to="/arcanario/oficina/nova"
          >
            ✧ Eco · frente e verso
          </Link>
          <Link
            aria-current={type === "memory" ? "page" : undefined}
            to="/arcanario/oficina/nova?tipo=memory"
          >
            ❧ Lembrança · Relicário
          </Link>
          <Link to="/arcanario/oficina/nova?tipo=question">
            ◇ Questão · Provações
          </Link>
        </div>
      )}
      {notice && (
        <p role="status" className="arcana-notice">
          {notice}
        </p>
      )}
      {storageError && (
        <p role="alert" className="arcana-error">
          {storageError}
        </p>
      )}
      {error && (
        <p role="alert" className="arcana-error">
          {error}
        </p>
      )}
      {(conflict || stale) && (
        <div className="arcana-panel">
          <h3>A versão salva mudou</h3>
          <p>
            Seu texto continua no editor. Confira a carta atual e escolha
            conscientemente a próxima revisão.
          </p>
          {card && (
            <details>
              <summary>Conferir conteúdo atual</summary>
              <ArcanaCard content={card.content} compact app={app} />
            </details>
          )}
          <button disabled={busy} onClick={() => void rebase()}>
            Usar revisão atual e manter meu texto
          </button>
        </div>
      )}
      <div className="arcana-workshop">
        <form
          className="arcana-panel arcana-editor"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <fieldset disabled={busy || saved}>
            <legend>
              {type === "flashcard"
                ? "Inscrever um Eco"
                : "Compor uma lembrança"}
            </legend>
            <label>
              {type === "memory"
                ? "Título da lembrança"
                : "Nome da carta no acervo (opcional)"}
              <input
                required={type === "memory"}
                maxLength={160}
                aria-describedby={
                  type === "flashcard" ? "card-name-help" : undefined
                }
                value={draft.title}
                onChange={(e) => patch({ title: e.target.value })}
              />
            </label>
            {type === "flashcard" && (
              <p id="card-name-help">
                Usado para identificar e encontrar a carta nas coleções. Não
                substitui o texto da frente.
              </p>
            )}
            {type === "flashcard" ? (
              <>
                <label>
                  Frente da carta — pergunta ou pista
                  <textarea
                    required
                    rows={5}
                    maxLength={4000}
                    aria-label="Frente da carta — pergunta ou pista"
                    value={draft.front}
                    onChange={(e) => patch({ front: e.target.value })}
                  />
                  <small>
                    Este texto aparece na face frontal durante a revisão.{" "}
                    {draft.front.length}/4000
                  </small>
                </label>
                <label>
                  Verso da carta — resposta ou descoberta
                  <textarea
                    required
                    rows={7}
                    maxLength={8000}
                    aria-label="Verso da carta — resposta ou descoberta"
                    value={draft.back}
                    onChange={(e) => patch({ back: e.target.value })}
                  />
                  <small>
                    Este texto aparece quando você vira a carta.{" "}
                    {draft.back.length}/8000
                  </small>
                </label>
              </>
            ) : (
              <>
                <label>
                  Inscrição · texto da lembrança
                  <textarea
                    rows={7}
                    maxLength={8000}
                    aria-label="Inscrição · texto da lembrança"
                    value={draft.text}
                    onChange={(e) => patch({ text: e.target.value })}
                  />
                  <small>{draft.text.length}/8000</small>
                </label>
                <label>
                  Categoria decorativa
                  <input
                    maxLength={80}
                    value={draft.category}
                    onChange={(e) => patch({ category: e.target.value })}
                    placeholder="Encontro, obra, conquista…"
                  />
                </label>
                <label>
                  Imagem local (opcional)
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      setBusy(true);
                      setError("");
                      void app
                        .prepareCardImage(file)
                        .then((image) => patch({ image }))
                        .catch((e) => setError(arcanaError(e)))
                        .finally(() => setBusy(false));
                    }}
                  />
                </label>
                <p className="arcana-muted">
                  JPEG ou PNG até 10 MiB / 24 MP. A cópia local é reduzida a
                  1600 px e cerca de 256 KiB; o original permanece no seu
                  aparelho.
                </p>
                {(draft.image || (draft.imageId && draft.image !== null)) && (
                  <button type="button" onClick={() => patch({ image: null })}>
                    Retirar imagem desta revisão
                  </button>
                )}
              </>
            )}
            <fieldset className="arcana-themes">
              <legend>Luz & afinidade decorativa</legend>
              {[
                { id: "astral", label: "Astral · violeta" },
                { id: "verdant", label: "Jardim · jade" },
                { id: "ember", label: "Brasa · rubi" },
                { id: "parchment", label: "Pergaminho · ouro" },
              ].map((t) => (
                <label className="arcana-swatch" data-theme={t.id} key={t.id}>
                  <input
                    type="radio"
                    name="theme"
                    checked={draft.appearance.theme === t.id}
                    onChange={() =>
                      patch({
                        appearance: {
                          ...draft.appearance,
                          theme: cardAppearanceSchema.shape.theme.parse(t.id),
                        },
                      })
                    }
                  />
                  {t.label}
                </label>
              ))}
            </fieldset>
            <Choices
              label="Moldura"
              value={draft.appearance.frame}
              options={[
                {
                  value: "constellation",
                  label: "✧ Constelação · traços celestes",
                },
                { value: "herbarium", label: "❧ Herbário · ramos e folhas" },
                {
                  value: "illuminated",
                  label: "◇ Iluminura · ouro geométrico",
                },
              ]}
              onChange={(value) =>
                patch({
                  appearance: {
                    ...draft.appearance,
                    frame: cardAppearanceSchema.shape.frame.parse(value),
                  },
                })
              }
            />
            <details>
              <summary>
                {type === "flashcard"
                  ? "Vincular a Estudos (opcional)"
                  : "Relacionar a registros (opcional)"}
              </summary>
              <p>
                {type === "flashcard"
                  ? "O fólio e a Oficina usam a mesma carta. Desmarcar retira apenas o vínculo com o Estudo."
                  : "A lembrança será preservada mesmo se a origem for excluída."}
              </p>
              <div className="arcana-choice-list">
                {entries
                  .filter((e) => type === "memory" || e.type === "study")
                  .map((entry) => (
                    <label className="arcana-check" key={entry.id}>
                      <input
                        type="checkbox"
                        checked={(type === "memory"
                          ? draft.entryIds
                          : draft.studyIds
                        ).includes(entry.id)}
                        onChange={() =>
                          patch(
                            type === "memory"
                              ? { entryIds: select(draft.entryIds, entry.id) }
                              : { studyIds: select(draft.studyIds, entry.id) },
                          )
                        }
                      />
                      {entry.title}
                    </label>
                  ))}
                {!entries.length && (
                  <p>
                    Nenhum registro disponível. Sua carta pode ser independente.
                  </p>
                )}
                {draft.entryIds
                  .filter((id) => !entries.some((e) => e.id === id))
                  .map((id) => (
                    <p key={id}>
                      Origem indisponível · referência histórica preservada
                    </p>
                  ))}
              </div>
            </details>
            <details>
              <summary>Baralhos & coleções</summary>
              <div className="arcana-choice-list">
                {draft.decks.map((d) => {
                  const deck = data.decks.find((x) => x.id === d.id);
                  return (
                    deck && (
                      <label className="arcana-check" key={d.id}>
                        <input
                          type="checkbox"
                          checked={d.included}
                          onChange={() =>
                            patch({
                              decks: draft.decks.map((x) =>
                                x.id === d.id
                                  ? { ...x, included: !x.included }
                                  : x,
                              ),
                            })
                          }
                        />
                        {deck.name}
                      </label>
                    )
                  );
                })}
                {!draft.decks.length && (
                  <p>
                    Crie um baralho na sala de coleções. Seu rascunho fica
                    guardado ao sair.
                  </p>
                )}
              </div>
            </details>
            <div className="arcana-actions">
              <button
                className="button button--primary"
                type="submit"
                disabled={busy || saved || stale}
              >
                {busy
                  ? "Guardando…"
                  : saved
                    ? "Carta salva"
                    : "Guardar carta no acervo"}
              </button>
              <Link to={card ? cardPath(card.id) : "/arcanario"}>
                Voltar e manter rascunho
              </Link>
            </div>
          </fieldset>
        </form>
        <aside className="arcana-preview" aria-label="Prévia da carta">
          <p className="arcana-eyebrow">A carta que está nascendo</p>
          {type === "flashcard" && (
            <p>
              Nome no acervo: {draft.title || "Sem nome"} · Prévia da face{" "}
              {flipped ? "verso" : "frontal"}
            </p>
          )}
          <ArcanaCard
            content={preview}
            app={app}
            image={draft.image?.dataUrl}
            flipped={flipped}
          />
          <button onClick={() => setFlipped((f) => !f)} aria-pressed={flipped}>
            Virar prévia · {flipped ? "frente" : "verso"}
          </button>
          <p className="arcana-muted">
            Experimentar molduras altera somente este rascunho. O acervo muda ao
            guardar a carta.
          </p>
          <button
            className="arcana-danger"
            disabled={busy || saved}
            onClick={() => {
              if (
                window.confirm(
                  "Descartar este rascunho? A carta já salva no acervo será preservada.",
                )
              ) {
                try {
                  app.workshopDrafts.remove(draftKey);
                  finished.current = true;
                  void navigate(card ? cardPath(card.id) : "/arcanario");
                } catch {
                  setStorageError(
                    "Não foi possível remover o rascunho. Tente novamente.",
                  );
                }
              }
            }}
          >
            Descartar rascunho
          </button>
        </aside>
      </div>
    </>
  );
}
