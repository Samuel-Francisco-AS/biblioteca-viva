import type { LocalizedDialogue } from "../../application";

export function LibrarySpeechBubble({
  dialogue,
  onClose,
}: {
  readonly dialogue: LocalizedDialogue;
  readonly onClose: () => void;
}) {
  const character =
    dialogue.characterId === "character.librarian" ? "librarian" : "creature";
  return (
    <aside
      aria-live="polite"
      className={`library-speech-bubble library-speech-bubble--${character}`}
    >
      <p className="visually-hidden">{dialogue.title}</p>
      <p lang={dialogue.locale}>{dialogue.text}</p>
      <button
        aria-label={dialogue.closeLabel}
        className="library-speech-bubble__close"
        onClick={onClose}
        type="button"
      >
        <span aria-hidden="true">×</span>
      </button>
    </aside>
  );
}
