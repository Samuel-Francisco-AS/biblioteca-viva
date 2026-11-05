import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
export function useAnnotationTarget(
  notes: readonly { id: string }[],
  quotes: readonly { id: string }[],
  visibleKind?: "note" | "quote",
) {
  const [params] = useSearchParams();
  const kind = params.get("annotationKind");
  const id = params.get("annotationId");
  const requestedKind: "note" | "quote" = kind === "quote" ? "quote" : "note";
  const requested = Boolean(id && (kind === "quote" || kind === "note"));
  const found =
    requested &&
    (requestedKind === "quote" ? quotes : notes).some((n) => n.id === id);
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (!found || !ref.current) return;
    const item = Array.from(
      ref.current.querySelectorAll<HTMLElement>("[data-annotation-id]"),
    ).find(
      (e) =>
        e.dataset.annotationId === id &&
        e.dataset.annotationKind === requestedKind,
    );
    if (!item) return;
    for (let p: HTMLElement | null = item; p; p = p.parentElement)
      if (p instanceof HTMLDetailsElement) p.open = true;
    item.focus({ preventScroll: true });
    item.scrollIntoView?.({ block: "center", behavior: "instant" });
  }, [found, id, requestedKind, notes, quotes, visibleKind]);
  return { ref, requestedKind, id, missing: requested && !found };
}
