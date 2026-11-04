import {
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
import { AppHeader } from "./app/AppHeader";
import { DevelopmentDiagnostics } from "./app/DevelopmentDiagnostics";
import { PrimaryDock } from "./app/PrimaryDock";
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
import "./styles-arcane.css";
import "./styles-touch.css";
import "./styles-ritual.css";
import "./styles-sanctuary.css";
import "./styles-living.css";
import "./styles-atelier.css";
import { pulseTouch } from "./app/touchFeedback";
import {
  preloadRoute,
  routeModules,
  warmCollectionWhenIdle,
} from "./app/routeModules";
import { completeStartupExperience } from "./startupExperience";

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

const diagnosticsBuildEnabled =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_DIAGNOSTICS === "true";

const unsafeContextGuidance =
  "Este ambiente não oferece todas as APIs necessárias para salvar e exportar com segurança. Abra a aplicação por localhost, HTTPS ou pelo APK Android. Os dados de outras origens do navegador não foram apagados.";

export function App({ application, diagnostics, shellStartedAt }: AppProps) {
  const location = useLocation();
  const libraryActive = location.pathname === APP_ROUTE_PATHS.library;
  const [libraryVisited, setLibraryVisited] = useState(libraryActive);
  if (libraryActive && !libraryVisited) setLibraryVisited(true);
  const mainRef = useRef<HTMLElement>(null);
  const previousPathRef = useRef(location.pathname);
  const pressedRef = useRef<HTMLElement | null>(null);
  const lastReleasePulseRef = useRef<{
    control: HTMLElement;
    at: number;
  } | null>(null);
  const pressedOriginRef = useRef<{ id: number; x: number; y: number } | null>(
    null,
  );
  const activeRoute = appRoutes.find(
    (route) => route.path === location.pathname,
  );
  const sectionTitle =
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

  useEffect(() => {
    if (application && !libraryActive) completeStartupExperience();
  }, [application, libraryActive]);

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

    if (control instanceof HTMLAnchorElement)
      preloadRoute(control.getAttribute("href") ?? "");
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
      onPointerUpCapture={(event) => {
        const control = pressedRef.current;
        const origin = pressedOriginRef.current;
        if (
          origin?.id === event.pointerId &&
          control &&
          event.target instanceof Element &&
          control.contains(event.target) &&
          !control.matches(
            ":disabled, [aria-disabled='true'], [aria-current='page']",
          )
        ) {
          pulseTouch(
            effectiveExperience.reducedMotion,
            control.matches(
              ".button--primary, [type='submit'], .rpg-choices button",
            )
              ? "confirm"
              : "selection",
          );
          lastReleasePulseRef.current = { control, at: performance.now() };
        }
        clearTap();
      }}
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
        const pulse = lastReleasePulseRef.current;
        lastReleasePulseRef.current = null;
        if (pulse?.control === control && performance.now() - pulse.at < 800)
          return;
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
      <ActiveSessionIndicator application={application} />
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
            <LibraryPage application={application} active={libraryActive} />
          </div>
        )}
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
              element={<EditEntryPage application={application} />}
            />
            <Route
              path={APP_ROUTE_PATHS.entryDetail}
              element={<EntryDetailPage application={application} />}
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
        </Suspense>
        {diagnosticsBuildEnabled &&
          isDiagnosticsEnabled(
            import.meta.env.DEV,
            import.meta.env.VITE_ENABLE_DIAGNOSTICS,
          ) &&
          location.pathname === APP_ROUTE_PATHS.settings &&
          diagnostics && <DevelopmentDiagnostics diagnostics={diagnostics} />}
      </main>
      <PrimaryDock pathname={location.pathname} />
    </div>
  );
}
