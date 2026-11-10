import {
  Profiler,
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";

import { APP_ROUTE_PATHS, appRoutes, primaryAppRoutes } from "./routes";
import { useAndroidBackButton } from "./useAndroidBackButton";
import { AppErrorBoundary } from "./app/AppErrorBoundary";
import { AppHeader } from "./app/AppHeader";
import { DevelopmentDiagnostics } from "./app/DevelopmentDiagnostics";
import { PrimaryDock } from "./app/PrimaryDock";
import { isArenaRoute } from "./features/duel/arena/arenaRoute";
import type {
  ApplicationDiagnostics,
  ApplicationRuntime,
} from "./app/createApplication";
import { isDiagnosticsEnabled } from "./app/diagnosticsAvailability";

import { LibraryPage } from "./pages";
import { useExperiencePreferences } from "./useExperiencePreferences";
import { ActiveSessionIndicator } from "./features/sessions/ActiveSessionIndicator";

import { useAudioExperience } from "./useAudioExperience";
import { measureStartupPhase } from "./startupPerformance";
import "./styles.css";
import "./styles-legacy.css";
import "./styles-atelier.css";
import "./features/library/canvas-hud.css";
import "./features/duel/arena/arena.css";
import { pulseTouch } from "./app/touchFeedback";
import {
  beginPassage,
  cancelPassage,
  completePassageAnimation,
  completePassageDeparture,
  notifyPassageLocation,
  schedulePassage,
  signalPassageReady,
} from "./app/interactionContinuity";
import {
  recordUiActionStart,
  recordUiRouteCommit,
  recordUiReactRender,
  recordUiRouteContentCommit,
} from "./app/uiActionProbe";
import { routeModules, warmCollectionWhenIdle } from "./app/routeModules";
import { completeStartupExperience } from "./startupExperience";

const ArcanariumPage = lazy(
  () => import("./features/arcanarium/ArcanariumPage"),
);

const CollectionPage = lazy(async () => ({
  default: (await routeModules.collection()).CollectionPage,
}));
const ArchivePage = lazy(async () => ({
  default: (await routeModules.archive()).ArchivePage,
}));
const StatisticsPage = lazy(async () => ({
  default: (await routeModules.statistics()).StatisticsPage,
}));
const SettingsPage = lazy(async () => ({
  default: (await routeModules.settings()).SettingsPage,
}));
const NewEntryPage = lazy(async () => ({
  default: (await routeModules.newEntry()).NewEntryPage,
}));
const EditEntryPage = lazy(async () => ({
  default: (await routeModules.editEntry()).EditEntryPage,
}));
const EntryDetailPage = lazy(async () => ({
  default: (await routeModules.detail()).EntryDetailPage,
}));

// Effects in this Suspense subtree commit only once the destination is mounted.
function RouteStartupReady({ active }: { readonly active: boolean }) {
  const location = useLocation();
  useEffect(() => {
    if (active && !location.pathname.startsWith("/arcanario")) {
      recordUiRouteContentCommit(location.pathname);
      // A lazy module mounting is not the same as its data having loaded.
      // Data-backed folios signal readiness from their own loaded state.
      const dataBacked =
        ["/colecao", "/arquivo", "/estatisticas"].includes(location.pathname) ||
        /^\/(registros|livros)\/[^/]+(?:\/editar)?$/.test(location.pathname);
      if (!dataBacked) signalPassageReady(location.pathname);
    }
  }, [active, location.pathname]);
  useEffect(() => {
    if (active) completeStartupExperience();
  }, [active]);
  return null;
}

function NotFoundPage() {
  return (
    <section className="placeholder" aria-labelledby="not-found-title">
      <p className="placeholder__status">Caminho desconhecido</p>
      <h2 id="not-found-title">Esta página não existe</h2>
      <p>O endereço informado não corresponde a uma área da Biblioteca Viva.</p>
      <Link className="text-link" to="/">
        Voltar para a Biblioteca
      </Link>
    </section>
  );
}

function LegacyEntryRedirect({ edit = false }: { readonly edit?: boolean }) {
  const { id = "" } = useParams();
  const location = useLocation();
  return (
    <Navigate
      replace
      to={`/registros/${encodeURIComponent(id)}${edit ? "/editar" : ""}${location.search}`}
    />
  );
}

interface AppProps {
  readonly application?: ApplicationRuntime;
  readonly diagnostics?: ApplicationDiagnostics;
  readonly shellStartedAt?: number;
}

function EntryRoute({
  application,
  edit = false,
}: {
  readonly application?: ApplicationRuntime;
  readonly edit?: boolean;
}) {
  const { id } = useParams();
  return edit ? (
    <EditEntryPage key={id} application={application} />
  ) : (
    <EntryDetailPage key={id} application={application} />
  );
}

const diagnosticsBuildEnabled =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_DIAGNOSTICS === "true";

const unsafeContextGuidance =
  "Este ambiente não oferece todas as APIs necessárias para salvar e exportar com segurança. Abra a aplicação por localhost, HTTPS ou pelo APK Android. Os dados de outras origens do navegador não foram apagados.";

export function App({ application, diagnostics, shellStartedAt }: AppProps) {
  const location = useLocation();
  const libraryActive = location.pathname === APP_ROUTE_PATHS.library;
  const arenaActive = isArenaRoute(location.pathname);
  const [libraryVisited, setLibraryVisited] = useState(libraryActive);
  if (libraryActive && !libraryVisited) setLibraryVisited(true);
  const mainRef = useRef<HTMLElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const sessionStripRef = useRef<HTMLDivElement>(null);
  const previousPathRef = useRef(location.pathname);
  const previousPassagePathRef = useRef(location.pathname);
  const pressedRef = useRef<HTMLElement | null>(null);
  const replayingLinksRef = useRef(new WeakSet<HTMLAnchorElement>());
  const pendingNavigationRef = useRef<(() => void) | null>(null);
  useEffect(
    () => () => {
      pendingNavigationRef.current?.();
      cancelPassage();
    },
    [],
  );
  const pressedOriginRef = useRef<{ id: number; x: number; y: number } | null>(
    null,
  );
  const activeRoute = appRoutes.find(
    (route) => route.path === location.pathname,
  );
  const sectionTitle =
    (location.pathname.startsWith("/arcanario") ? "O Arcanário" : undefined) ??
    activeRoute?.title ??
    (location.pathname.endsWith("/editar")
      ? "Editar registro"
      : location.pathname.startsWith("/registros/")
        ? "Detalhes do registro"
        : "Página não encontrada");
  const primaryTopLevel = primaryAppRoutes.some(
    (route) => route.path === location.pathname,
  );
  const headerBackTo =
    location.pathname === APP_ROUTE_PATHS.newEntry ||
    location.pathname.startsWith("/registros/")
      ? APP_ROUTE_PATHS.collection
      : undefined;

  useAndroidBackButton();
  useAudioExperience(application?.audio);
  const effectiveExperience = useExperiencePreferences(application?.experience);

  useLayoutEffect(() => {
    if (shellStartedAt !== undefined)
      measureStartupPhase("react-shell", shellStartedAt);
  }, [shellStartedAt]);

  useLayoutEffect(() => {
    const strip = sessionStripRef.current;
    if (!strip) return;
    const dock = shellRef.current?.querySelector<HTMLElement>(".primary-dock");
    const resize = () => {
      // Finish all geometry reads before changing variables used by layout.
      const sessionHeight = `${strip.getBoundingClientRect().height}px`;
      const bottom = dock
        ? Number.parseFloat(window.getComputedStyle(dock).bottom)
        : 0;
      const dockHeight = dock
        ? `${dock.getBoundingClientRect().height + (Number.isFinite(bottom) ? bottom : 0)}px`
        : undefined;
      const style = shellRef.current?.style;
      if (style?.getPropertyValue("--canvas-session-height") !== sessionHeight)
        style?.setProperty("--canvas-session-height", sessionHeight);
      if (
        dockHeight &&
        style?.getPropertyValue("--canvas-dock-height") !== dockHeight
      )
        style?.setProperty("--canvas-dock-height", dockHeight);
    };
    resize();
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(resize);
    observer?.observe(strip);
    if (dock) observer?.observe(dock);
    window.addEventListener("resize", resize);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    let cancelWarmup: (() => void) | undefined;
    const onReady = () => {
      cancelWarmup?.();
      cancelWarmup = warmCollectionWhenIdle();
    };
    window.addEventListener("biblioteca-viva:startup-ready", onReady);
    return () => {
      window.removeEventListener("biblioteca-viva:startup-ready", onReady);
      cancelWarmup?.();
    };
  }, []);

  useLayoutEffect(() => {
    if (previousPassagePathRef.current === location.pathname) return;
    previousPassagePathRef.current = location.pathname;
    notifyPassageLocation(location.pathname);
    recordUiRouteCommit(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      mainRef.current?.focus();
      previousPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  function clearTap(): void {
    pressedRef.current?.removeAttribute("data-tap-active");
    pressedRef.current = null;
    pressedOriginRef.current = null;
  }

  useEffect(
    () => () => {
      pressedRef.current?.removeAttribute("data-tap-active");
    },
    [],
  );

  function revealTap(event: ReactPointerEvent<HTMLDivElement>): void {
    clearTap();
    if (event.target instanceof Element)
      event.target
        .closest(".book-card__link")
        ?.removeAttribute("data-tap-confirmed");
    if (event.pointerType === "mouse" || !event.isPrimary) return;
    if (!(event.target instanceof Element)) return;
    const control = event.target.closest<HTMLElement>(
      "button, a, summary, [role='button']",
    );
    if (
      !control ||
      control.matches(":disabled, [aria-disabled='true']") ||
      !event.currentTarget.contains(control)
    )
      return;

    // Do not parse a destination module before the pressed state can paint.
    // Cards acknowledge semantic clicks only: pointerdown may begin a scroll.
    if (!control.matches(".book-card__link"))
      control.setAttribute("data-tap-active", "true");
    pressedRef.current = control;
    pressedOriginRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  }

  return (
    <div
      className="app-shell"
      ref={shellRef}
      onPointerDownCapture={revealTap}
      onPointerMoveCapture={(event) => {
        const origin = pressedOriginRef.current;
        if (
          origin &&
          (event.pointerId !== origin.id ||
            Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 8)
        )
          clearTap();
      }}
      onPointerUpCapture={clearTap}
      onPointerCancelCapture={clearTap}
      onLostPointerCapture={clearTap}
      onClickCapture={(event) => {
        if (!(event.target instanceof Element)) return;
        const control = event.target.closest<HTMLElement>(
          "button, summary, a, [role='button'], [role='tab']",
        );
        if (
          !control ||
          control.matches(
            ":disabled, [aria-disabled='true'], [aria-current='page']",
          )
        )
          return;
        if (
          control instanceof HTMLAnchorElement &&
          replayingLinksRef.current.has(control)
        )
          return;
        if (control.matches(".book-card__link"))
          control.setAttribute("data-tap-confirmed", "true");
        // Global opt-in diagnostic: measure the next two RAF callbacks for
        // ordinary buttons and links, even outside the resident Canvas.
        const localHref =
          control instanceof HTMLAnchorElement &&
          control.origin === window.location.origin
            ? control.pathname
            : null;
        recordUiActionStart({
          source: control.closest(".primary-dock")
            ? "dock"
            : control.closest(".arcanarium")
              ? "arcanarium"
              : control.closest(".library-page")
                ? "library-controls"
                : "other",
          kind: control instanceof HTMLAnchorElement ? "link" : "control",
          from: location.pathname,
          to: localHref !== location.pathname ? localHref : null,
        });
        // Delegate the actual React Router Link click to a later frame.
        // Replaying the SAME Link preserves its state/replace/relative route
        // semantics instead of reconstructing a location from its href.
        if (
          control instanceof HTMLAnchorElement &&
          !control.closest(".primary-dock") &&
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.altKey &&
          !event.shiftKey &&
          !event.defaultPrevented &&
          !control.hasAttribute("download") &&
          (!control.target || control.target === "_self") &&
          control.origin === window.location.origin &&
          control.getAttribute("href")?.startsWith("/") &&
          !control.getAttribute("href")?.startsWith("//") &&
          control.pathname !== location.pathname
        ) {
          event.preventDefault();
          // No child Link onClick runs on the original event. Its semantics,
          // including custom handlers, run exactly once on the replay.
          event.stopPropagation();
          pendingNavigationRef.current?.();
          beginPassage(control.pathname);
          pendingNavigationRef.current = schedulePassage(() => {
            pendingNavigationRef.current = null;
            if (!control.isConnected) {
              cancelPassage();
              return;
            }
            replayingLinksRef.current.add(control);
            try {
              control.click();
            } finally {
              replayingLinksRef.current.delete(control);
            }
          });
        }
        pulseTouch(
          effectiveExperience.reducedMotion,
          control.matches(
            ".button--primary, [type='submit'], .rpg-choices button",
          )
            ? "confirm"
            : "selection",
        );
      }}
      data-route={
        location.pathname === "/" ? "library" : location.pathname.split("/")[1]
      }
      data-arena-route={arenaActive ? "true" : undefined}
      data-high-contrast={effectiveExperience.highContrast}
      data-reduced-motion={effectiveExperience.reducedMotion}
      data-text-size={effectiveExperience.textSize}
    >
      <a className="skip-link" href="#main-content">
        Ir para o conteúdo principal
      </a>
      <AppHeader
        backTo={headerBackTo}
        brandOnly={
          primaryTopLevel && location.pathname !== APP_ROUTE_PATHS.library
        }
        title={sectionTitle}
      />
      <div className="session-strip" ref={sessionStripRef}>
        <ActiveSessionIndicator application={application} />
      </div>
      <main
        className="app-content"
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
      >
        {application?.platform.supported === false && (
          <p className="context-guidance" role="alert">
            {unsafeContextGuidance}
          </p>
        )}
        {(libraryActive || libraryVisited) && (
          <div
            hidden={!libraryActive}
            inert={!libraryActive}
            className="library-residence"
          >
            <Profiler id="library" onRender={recordUiReactRender}>
              <LibraryPage application={application} active={libraryActive} />
            </Profiler>
          </div>
        )}
        <AppErrorBoundary
          embedded
          resetKey={location.pathname}
          onFailure={() =>
            queueMicrotask(() => signalPassageReady(location.pathname))
          }
        >
          <Profiler id="route" onRender={recordUiReactRender}>
            <Suspense
              fallback={
                <section
                  className="passage-preparing"
                  role="status"
                  aria-live="polite"
                >
                  <span aria-hidden="true">✧</span>
                  <p>Desdobrando as páginas do Códice…</p>
                </section>
              }
            >
              <Routes>
                <Route path={APP_ROUTE_PATHS.library} element={null} />
                <Route
                  path="/arcanario/*"
                  element={<ArcanariumPage application={application} />}
                />
                <Route
                  path={APP_ROUTE_PATHS.collection}
                  element={<CollectionPage application={application} />}
                />
                <Route
                  path={APP_ROUTE_PATHS.archive}
                  element={<ArchivePage application={application} />}
                />
                <Route
                  path={APP_ROUTE_PATHS.statistics}
                  element={<StatisticsPage application={application} />}
                />
                <Route
                  path={APP_ROUTE_PATHS.settings}
                  element={
                    <SettingsPage
                      application={application}
                      diagnostics={diagnostics}
                    />
                  }
                />
                <Route
                  path={APP_ROUTE_PATHS.newEntry}
                  element={<NewEntryPage application={application} />}
                />
                <Route
                  path={APP_ROUTE_PATHS.entryEdit}
                  element={<EntryRoute edit application={application} />}
                />
                <Route
                  path={APP_ROUTE_PATHS.entryDetail}
                  element={<EntryRoute application={application} />}
                />
                <Route
                  path={APP_ROUTE_PATHS.legacyNewBook}
                  element={<Navigate replace to={APP_ROUTE_PATHS.newEntry} />}
                />
                <Route
                  path={APP_ROUTE_PATHS.legacyBookEdit}
                  element={<LegacyEntryRedirect edit />}
                />
                <Route
                  path={APP_ROUTE_PATHS.legacyBookDetail}
                  element={<LegacyEntryRedirect />}
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              <RouteStartupReady active={!libraryActive} />
            </Suspense>
          </Profiler>
        </AppErrorBoundary>
        {diagnosticsBuildEnabled &&
          isDiagnosticsEnabled(
            import.meta.env.DEV,
            import.meta.env.VITE_ENABLE_DIAGNOSTICS,
          ) &&
          location.pathname === APP_ROUTE_PATHS.settings &&
          diagnostics && <DevelopmentDiagnostics diagnostics={diagnostics} />}
      </main>
      <div
        className="passage-veil"
        aria-hidden="true"
        onAnimationEnd={(event) => {
          if (
            event.target === event.currentTarget &&
            event.animationName === "bv-passage-unfold"
          ) completePassageAnimation();
          if (
            event.target === event.currentTarget &&
            event.animationName === "bv-passage-fold"
          ) completePassageDeparture();
        }}
      />
      <PrimaryDock pathname={location.pathname} />
    </div>
  );
}
