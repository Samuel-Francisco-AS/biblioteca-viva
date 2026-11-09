import { CombatCard } from "../duel/CombatCard";
import { useEffect, useState } from "react";
import type { CardContent } from "../../domain/arcanarium";
import type { ApplicationRuntime } from "../../app/createApplication";
import { cardTitle, familyLabels } from "./presentation";
import { ArcanaSeal, CardFrame } from "./ArcanaArt";
export function ArcanaCard({
  content,
  app,
  image,
  compact = false,
  flipped = false,
}: {
  readonly content: CardContent;
  readonly app?: ApplicationRuntime;
  readonly image?: string;
  readonly compact?: boolean;
  readonly flipped?: boolean;
}) {
  const imageId = content.type === "memory" ? content.imageId : undefined;
  const [stored, setStored] = useState<{ id: string; url: string }>();
  const [failedImage, setFailedImage] = useState<string>();
  useEffect(() => {
    let active = true;
    if (imageId && app)
      void app.workshop
        .media(imageId)
        .then((m) => {
          if (active) {
            if (m) setStored({ id: imageId, url: m.dataUrl });
            else setFailedImage(imageId);
          }
        })
        .catch(() => {
          if (active) setFailedImage(imageId);
        });
    return () => {
      active = false;
    };
  }, [app, imageId]);
  if (content.type === "combat" && content.combat)
    return (
      <CombatCard
        name={content.name}
        definition={content.combat}
        compact={compact}
      />
    );
  const appearance =
    content.type === "flashcard" || content.type === "memory"
      ? content.appearance
      : undefined;
  const picture =
    image ?? (stored && stored.id === imageId ? stored.url : undefined);
  const title = cardTitle(content);
  const back =
    content.type === "flashcard"
      ? content.back
      : content.type === "memory"
        ? (content.text ?? "Uma lembrança guardada entre as páginas.")
        : title;
  return (
    <article
      className={`arcana-card ${compact ? "arcana-card--compact" : ""}`}
      data-theme={appearance?.theme ?? "astral"}
      data-flipped={flipped}
    >
      <div className="arcana-card__turn">
        <div className="arcana-face" aria-hidden={flipped} inert={flipped}>
          <CardFrame frame={appearance?.frame ?? "constellation"} />
          <span className="arcana-card__family">
            {familyLabels[content.type]}
            {content.type === "memory" && content.category
              ? ` · ${content.category}`
              : ""}
          </span>
          {content.type === "memory" && picture ? (
            <img
              className="arcana-card__image"
              src={picture}
              alt="Imagem escolhida para a lembrança"
            />
          ) : (
            <ArcanaSeal kind={content.type === "memory" ? "memory" : "echo"} />
          )}
          {imageId && failedImage === imageId && !picture && (
            <p className="arcana-muted">
              Imagem local indisponível. Abra a Oficina para escolher outra.
            </p>
          )}
          <div
            className="arcana-card__writing"
            tabIndex={compact ? undefined : 0}
          >
            <h3>
              {content.type === "flashcard"
                ? content.front || "Sua pergunta ganha forma aqui"
                : title || "Uma lembrança por guardar"}
            </h3>
          </div>
          <span className="arcana-card__foot">
            {content.type === "flashcard"
              ? "FRENTE · PERGUNTA"
              : "RELICÁRIO · MEMÓRIA"}
          </span>
        </div>
        <div
          className="arcana-face arcana-face--back"
          aria-hidden={!flipped}
          inert={!flipped}
        >
          <CardFrame frame={appearance?.frame ?? "constellation"} />
          <span className="arcana-card__family">
            {content.type === "flashcard"
              ? "Verso · descoberta"
              : "Verso · inscrição"}
          </span>
          <div
            className="arcana-card__writing"
            tabIndex={compact ? undefined : 0}
          >
            <p>{back || "Sua resposta ganha forma aqui"}</p>
          </div>
          <span className="arcana-card__foot">✧ BIBLIOTECA VIVA ✧</span>
        </div>
      </div>
    </article>
  );
}
