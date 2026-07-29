import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LIBRARY_PATH = "/";

function reportNativeNavigationError(error: unknown) {
  console.error("Falha ao tratar a navegação nativa do Android.", error);
}

export function useAndroidBackButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  const pathnameRef = useRef(location.pathname);

  useEffect(() => {
    navigateRef.current = navigate;
    pathnameRef.current = location.pathname;
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let isMounted = true;
    let removeListener: (() => Promise<void>) | undefined;

    void CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      if (pathnameRef.current !== LIBRARY_PATH) {
        if (canGoBack) {
          void navigateRef.current(-1);
        } else {
          void navigateRef.current(LIBRARY_PATH, { replace: true });
        }
        return;
      }

      void CapacitorApp.exitApp().catch(reportNativeNavigationError);
    })
      .then((handle) => {
        if (isMounted) {
          removeListener = handle.remove;
          return;
        }

        void handle.remove().catch(reportNativeNavigationError);
      })
      .catch(reportNativeNavigationError);

    return () => {
      isMounted = false;
      if (removeListener) {
        void removeListener().catch(reportNativeNavigationError);
      }
    };
  }, []);
}
