import { useEffect, useRef } from "react";

import type { LocalizedDialogue } from "../../application";

interface LibraryCharacterPanelProps {
  readonly dialogue: LocalizedDialogue;
  readonly onClose: () => void;
}

export function LibraryCharacterPanel({
  dialogue,
  onClose,
}: LibraryCharacterPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = `library-${dialogue.characterId}-panel-title`;

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, [dialogue.id]);

  return (
    <section className="library-character-panel" aria-labelledby={titleId}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{dialogue.eyebrow}</p>
          <h3 id={titleId}>{dialogue.title}</h3>
        </div>
        <button
          className="button button--secondary"
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          {dialogue.closeLabel}
        </button>
      </div>
      <p lang={dialogue.locale}>{dialogue.text}</p>
    </section>
  );
}
