import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { WorkshopDrafts } from "../../application/workshopDrafts";
/** Flush on pagehide/unmount; a successful save cannot resurrect a removed draft. */
export function useDuelDraft(
  port: WorkshopDrafts,
  key: string,
  draft: unknown,
) {
  const finished = useRef(false),
    [storageError, setStorageError] = useState("");
  const pending = useRef(draft);
  useLayoutEffect(() => {
    pending.current = draft;
  }, [draft]);
  const store = useCallback(() => {
    if (finished.current) return;
    try {
      port.write(key, JSON.stringify(pending.current));
      setStorageError("");
    } catch {
      setStorageError(
        "Falha ao proteger o rascunho local. Salve antes de sair.",
      );
    }
  }, [port, key]);
  useEffect(() => {
    const timer = window.setTimeout(store, 150);
    return () => window.clearTimeout(timer);
  }, [draft, store]);
  useEffect(() => {
    const hidden = () => {
      if (document.visibilityState === "hidden") store();
    };
    window.addEventListener("pagehide", store);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("pagehide", store);
      document.removeEventListener("visibilitychange", hidden);
      store();
    };
  }, [store]);
  const finish = useCallback(() => {
    finished.current = true;
    port.remove(key);
  }, [port, key]);
  return { storageError, finish };
}
