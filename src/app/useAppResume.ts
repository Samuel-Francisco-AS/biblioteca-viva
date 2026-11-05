import { App } from "@capacitor/app";
import { useEffect } from "react";

/** Reconcile persisted state after browser visibility or Android Activity resume. */
export function useAppResume(refresh: () => void) {
  useEffect(() => {
    let mounted = true;
    let native: { remove(): Promise<void> } | undefined;
    const visible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", visible);
    void App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) refresh();
    }).then((handle) => {
      if (mounted) native = handle;
      else void handle.remove();
    });
    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", visible);
      void native?.remove();
    };
  }, [refresh]);
}
