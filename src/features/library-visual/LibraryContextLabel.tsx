import { useEffect, useState } from "react";

export const LIBRARY_CONTEXT_LABEL_DURATION_MS = 5_000;

interface LibraryContextLabelProps {
  readonly periodLabel: string;
  readonly reducedMotion: boolean;
  readonly roomName: string;
}

function LibraryContextLabelCycle({
  periodLabel,
  reducedMotion,
  roomName,
}: LibraryContextLabelProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setVisible(false),
      LIBRARY_CONTEXT_LABEL_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <p
      aria-hidden="true"
      className={`library-context-label${
        reducedMotion ? "" : " library-context-label--animated"
      }`}
    >
      {roomName} · {periodLabel}
    </p>
  );
}

export function LibraryContextLabel(props: LibraryContextLabelProps) {
  return (
    <LibraryContextLabelCycle
      {...props}
      key={`${props.roomName}:${props.periodLabel}`}
    />
  );
}
