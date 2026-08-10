import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import type { AudioPort } from "./application";

function reportLifecycleFailure(): void {
  console.warn("Áudio degradado: LIFECYCLE_LISTENER_FAILED.");
}

export function useAudioExperience(audio?: AudioPort): void {
  const location = useLocation();
  const previousPath = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!audio) return;
    let unlockRequested = audio.availability() !== "not-initialized";
    const removeUnlockListeners = () => {
      document.removeEventListener("pointerdown", enableFromPointer, true);
      document.removeEventListener("keydown", enableFromKeyboard, true);
    };
    const enable = () => {
      if (unlockRequested) return;
      unlockRequested = true;
      removeUnlockListeners();
      void audio.initialize();
    };
    const enableFromPointer = () => enable();
    const enableFromKeyboard = (event: KeyboardEvent) => {
      if (
        event.isComposing ||
        ["Alt", "Control", "Meta", "Shift"].includes(event.key)
      )
        return;
      enable();
    };
    const visibility = () => {
      if (document.visibilityState === "hidden") audio.pause();
      else audio.resume();
    };
    const dispose = () => audio.dispose();
    let nativeHandle: PluginListenerHandle | undefined;
    let active = true;

    if (!unlockRequested) {
      document.addEventListener("pointerdown", enableFromPointer, {
        capture: true,
        passive: true,
      });
      document.addEventListener("keydown", enableFromKeyboard, {
        capture: true,
      });
    }
    window.addEventListener("beforeunload", dispose);
    document.addEventListener("visibilitychange", visibility);

    if (Capacitor.isNativePlatform()) {
      void CapacitorApp.addListener("appStateChange", ({ isActive }) => {
        if (isActive) audio.resume();
        else audio.pause();
      })
        .then((handle) => {
          if (active) nativeHandle = handle;
          else void handle.remove().catch(reportLifecycleFailure);
        })
        .catch(reportLifecycleFailure);
    }

    return () => {
      active = false;
      removeUnlockListeners();
      window.removeEventListener("beforeunload", dispose);
      document.removeEventListener("visibilitychange", visibility);
      if (nativeHandle)
        void nativeHandle.remove().catch(reportLifecycleFailure);
    };
  }, [audio]);

  useEffect(() => {
    if (!audio) return;
    const previous = previousPath.current;
    if (previous !== undefined && previous !== location.pathname)
      audio.emit({ type: "PageChanged" });
    if (location.pathname === "/") audio.emit({ type: "LibraryEntered" });
    else audio.emit({ type: "LibraryExited" });
    previousPath.current = location.pathname;
  }, [audio, location.pathname]);
}
