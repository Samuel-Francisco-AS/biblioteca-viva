import { useEffect, type RefObject } from "react";

/** Keep the live editor state when the writer folds it, and guard navigation away. */
export function useBookDraftGuard(
  root: RefObject<HTMLElement | null>,
  currentPage?: number,
) {
  useEffect(() => {
    function hasDraft() {
      const folio = root.current;
      if (!folio) return false;
      const drafts = folio.querySelectorAll<
        HTMLTextAreaElement | HTMLInputElement
      >(
        "#note-content, #note-page, #quote-content, #quote-page, .annotation-editor textarea, .annotation-editor input",
      );
      if (
        [...drafts].some((field) => {
          if (field.closest(".annotation-editor")) return true;
          return field.value.trim() !== "";
        })
      )
        return true;
      const progress = folio.querySelector<HTMLInputElement>(
        "#detail-current-page",
      );
      return progress !== null && progress.value !== String(currentPage);
    }
    function confirmDiscard() {
      return (
        !hasDraft() ||
        window.confirm(
          "Há alterações não salvas neste livro. Sair e descartar o rascunho?",
        )
      );
    }
    function onLink(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const destination = new URL(link.href, location.href);
      if (
        destination.pathname === location.pathname &&
        destination.search === location.search
      )
        return;
      if (!confirmDiscard()) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    function onUnload(event: BeforeUnloadEvent) {
      if (hasDraft()) event.preventDefault();
    }
    function onNativeBack(event: Event) {
      // The top-layer preview owns Back while open.
      if (document.querySelector("dialog[open]")) return;
      if (!confirmDiscard()) event.preventDefault();
    }
    document.addEventListener("click", onLink, true);
    window.addEventListener("beforeunload", onUnload);
    window.addEventListener("biblioteca-viva:native-back", onNativeBack);
    return () => {
      document.removeEventListener("click", onLink, true);
      window.removeEventListener("beforeunload", onUnload);
      window.removeEventListener("biblioteca-viva:native-back", onNativeBack);
    };
  }, [root, currentPage]);
}
