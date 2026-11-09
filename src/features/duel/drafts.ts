import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkshopDrafts } from "../../application/workshopDrafts";
/** Flush on pagehide/unmount; a successful save cannot resurrect a removed draft. */
export function useDuelDraft(
  port: WorkshopDrafts,
  key: string,
  draft: unknown,
) {
  const finished = useRef(false),
    [storageError, setStorageError] = useState("");
  useEffect(() => {
    const store = () => {
      if (finished.current) return;
      try {
        port.write(key, JSON.stringify(draft));
        setStorageError("");
      } catch {
        setStorageError(
          "Falha ao proteger o rascunho local. Salve antes de sair.",
        );
      }
    };
    const timer = window.setTimeout(store, 150);
    const hidden = () => {
      if (document.visibilityState === "hidden") store();
    };
    window.addEventListener("pagehide", store);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", store);
      document.removeEventListener("visibilitychange", hidden);
      store();
    };
  }, [port, key, draft]);
  const finish = useCallback(() => {
    finished.current = true;
    port.remove(key);
  }, [port, key]);
  return { storageError, finish };
}
