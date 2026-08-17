import type { LocalizedDialogue } from "../../application";
import type { CSSProperties } from "react";

type BubbleStyle = CSSProperties & {
  readonly "--bubble-anchor-x": string;
  readonly "--bubble-anchor-y": string;
};

export function LibrarySpeechBubble({
  dialogue,
  onClose,
  anchor,
}: {
  readonly dialogue: LocalizedDialogue;
  readonly onClose: () => void;
  readonly anchor?: { readonly x: number; readonly y: number };
}) {
  const bubbleStyle: BubbleStyle | undefined = anchor
    ? {
        "--bubble-anchor-x": `${anchor.x}%`,
        "--bubble-anchor-y": `${anchor.y}%`,
      }
    : undefined;
  const character =
    dialogue.characterId === "character.librarian"
      ? "librarian"
      : dialogue.characterId === "character.creature"
        ? "creature"
        : "resident";
  return (
    <aside
      aria-live="polite"
      className={`library-speech-bubble library-speech-bubble--${character}`}
      style={bubbleStyle}
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
