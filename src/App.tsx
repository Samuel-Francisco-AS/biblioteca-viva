import { useEffect, useLayoutEffect, useRef } from "react";
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
import { CollectionPage } from "./features/collection/CollectionPage";
import { ArchivePage } from "./features/archive/ArchivePage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { NewEntryPage } from "./features/entry-editor/NewEntryPage";
import { EditEntryPage } from "./features/entry-editor/EditEntryPage";
import { EntryDetailPage } from "./features/entry-detail/EntryDetailPage";
import { LibraryPage } from "./pages";
import { useExperiencePreferences } from "./useExperiencePreferences";
import { ActiveSessionIndicator } from "./features/sessions/ActiveSessionIndicator";
import { StatisticsPage } from "./features/statistics/StatisticsPage";
import { useAudioExperience } from "./useAudioExperience";
import { measureStartupPhase } from "./startupPerformance";
import "./styles.css";

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
  const mainRef = useRef<HTMLElement>(null);
  const previousPathRef = useRef(location.pathname);
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
    if (previousPathRef.current !== location.pathname) {
      mainRef.current?.focus();
      previousPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  return (
    <div
      className="app-shell"
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
        <Routes>
          <Route path={APP_ROUTE_PATHS.library} element={<LibraryPage />} />
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
