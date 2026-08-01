import { useEffect, useRef } from "react";

export type LibraryCharacterPanelKind = "creature" | "librarian";

interface LibraryCharacterPanelProps {
  readonly kind: LibraryCharacterPanelKind;
  readonly onClose: () => void;
}

const CHARACTER_PANEL_CONTENT: Readonly<
  Record<
    LibraryCharacterPanelKind,
    {
      readonly description: string;
      readonly eyebrow: string;
      readonly title: string;
    }
  >
> = {
  creature: {
    description:
      "Uma pequena criatura percorre devagar o espaço entre a estante e o balcão, curiosa com as histórias ao redor.",
    eyebrow: "Criatura",
    title: "Uma presença curiosa",
  },
  librarian: {
    description:
      "Há sempre espaço para mais uma história. Posso guardar silêncio enquanto você escolhe a próxima.",
    eyebrow: "Bibliotecária",
    title: "Uma acolhida tranquila",
  },
};

export function LibraryCharacterPanel({
  kind,
  onClose,
}: LibraryCharacterPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const content = CHARACTER_PANEL_CONTENT[kind];
  const titleId = `library-${kind}-panel-title`;

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, [kind]);

  return (
    <section className="library-character-panel" aria-labelledby={titleId}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{content.eyebrow}</p>
          <h3 id={titleId}>{content.title}</h3>
        </div>
        <button
          className="button button--secondary"
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          Fechar painel
        </button>
      </div>
      <p>{content.description}</p>
    </section>
  );
}
