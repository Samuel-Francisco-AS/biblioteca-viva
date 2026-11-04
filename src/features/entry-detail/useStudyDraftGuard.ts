import { useEffect, type RefObject } from "react";

export function useStudyDraftGuard(
  root: RefObject<HTMLElement | null>,
  message = "Há anotações ou cartas não salvas. Sair e descartar o rascunho?",
) {
  useEffect(() => {
    const hasDraft = () =>
      Boolean(root.current?.matches('[data-has-record-draft="true"]')) ||
      Boolean(
        root.current?.querySelector(
          '[data-has-study-draft="true"], .annotation-editor',
        ),
      ) ||
      [
        ...(root.current?.querySelectorAll<HTMLTextAreaElement>(
          "[data-study-draft]",
        ) ?? []),
      ].some((field) => field.value.trim() !== "");
    const confirm = () => !hasDraft() || window.confirm(message);
    function link(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a[href]");
      if (
        anchor instanceof HTMLAnchorElement &&
        anchor.href !== location.href &&
        !confirm()
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    const unload = (event: BeforeUnloadEvent) => {
      if (hasDraft()) event.preventDefault();
    };
    const back = (event: Event) => {
      if (!confirm()) event.preventDefault();
    };
    document.addEventListener("click", link, true);
    window.addEventListener("beforeunload", unload);
    window.addEventListener("biblioteca-viva:native-back", back);
    return () => {
      document.removeEventListener("click", link, true);
      window.removeEventListener("beforeunload", unload);
      window.removeEventListener("biblioteca-viva:native-back", back);
    };
  }, [root, message]);
}
