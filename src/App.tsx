import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { APP_ROUTE_PATHS, appRoutes, primaryAppRoutes } from "./routes";
import { useAndroidBackButton } from "./useAndroidBackButton";
import { AppHeader } from "./app/AppHeader";
import { DevelopmentDiagnostics } from "./app/DevelopmentDiagnostics";
import { PrimaryDock } from "./app/PrimaryDock";
import type { ApplicationDiagnostics } from "./app/createApplication";
import type { ApplicationRuntime } from "./app/createApplication";
import { isDiagnosticsEnabled } from "./app/diagnosticsAvailability";
import { CollectionPage } from "./features/collection/CollectionPage";
import { ArchivePage } from "./features/archive/ArchivePage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { NewEntryPage } from "./features/entry-editor/NewEntryPage";
import { EditEntryPage } from "./features/entry-editor/EditEntryPage";
import { EntryDetailPage } from "./features/entry-detail/EntryDetailPage";
import "./styles.css";
import { useAudioExperience } from "./useAudioExperience";
import {
  MILESTONE_ID,
  type MilestoneReached,
  type StructuralInventoryFamilyId,
} from "./domain";
import { isStructuralMilestoneId, structuralGrants } from "./application";
import { LibraryPage } from "./pages";
import { useExperiencePreferences } from "./useExperiencePreferences";
import { ActiveSessionIndicator } from "./features/sessions/ActiveSessionIndicator";
import { StatisticsPage } from "./features/statistics/StatisticsPage";
import { measureStartupPhase } from "./startupPerformance";

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

function structuralFamilyName(id: StructuralInventoryFamilyId): string {
  switch (id) {
    case "structure-family.floor.wood":
      return "Piso de madeira";
    case "structure-family.wall.short":
      return "Parede curta";
    case "structure-family.wall.medium":
      return "Parede média";
    case "structure-family.wall.long":
      return "Parede longa";
    case "structure-family.corner.stone":
      return "Canto de pedra";
    case "structure-family.door.horizontal":
      return "Porta horizontal";
  }
}

export function App({ application, diagnostics, shellStartedAt }: AppProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const previousPathRef = useRef(location.pathname);
  const [libraryConstructionMode, setLibraryConstructionMode] = useState(false);
  const [milestoneReaction, setMilestoneReaction] = useState<{
    readonly dialogue?: string;
    readonly dialogueUnavailable?: boolean;
    readonly eventId: string;
  } | null>(null);
  const [pendingDecorationUnlock, setPendingDecorationUnlock] = useState<{
    readonly eventId: string;
  } | null>(null);
  const [structuralUnlock, setStructuralUnlock] = useState<{
    readonly families: readonly {
      readonly familyId: StructuralInventoryFamilyId;
      readonly quantity: number;
    }[];
    readonly token: string;
  } | null>(null);
  const structuralMilestoneIdsRef = useRef(new Set<string>());
  const structuralBatchScheduledRef = useRef(false);
  const structuralFeedbackTokenRef = useRef(0);
  const activeRoute = appRoutes.find(
    (route) => route.path === location.pathname,
  );
  const sectionTitle =
    libraryConstructionMode && location.pathname === APP_ROUTE_PATHS.library
      ? "Construção"
      : (activeRoute?.title ??
        (location.pathname.endsWith("/editar")
          ? "Editar registro"
          : location.pathname.startsWith("/registros/")
            ? "Detalhes do registro"
            : "Página não encontrada"));
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
    if (shellStartedAt === undefined) return;
    measureStartupPhase("react-shell", shellStartedAt);
  }, [shellStartedAt]);

  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      mainRef.current?.focus();
      previousPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  const handleConstructionModeChange = useCallback((active: boolean) => {
    setLibraryConstructionMode(active);
  }, []);

  useEffect(() => {
    if (!application) return;
    let active = true;
    const reactToFirstCompletion = async (event: MilestoneReached) => {
      setMilestoneReaction({ eventId: event.eventId });
      setPendingDecorationUnlock({ eventId: event.eventId });
      try {
        const books = await application.queries.listBookEntries.execute();
        if (!active) return;
        application.dialogue.updateLibraryFacts({
          completedBooks: books.filter(({ status }) => status === "completed")
            .length,
          inProgressBooks: books.filter(
            ({ status }) => status === "in_progress",
          ).length,
          totalBooks: books.length,
        });
        const dialogue = await application.dialogue.select(
          "book.first-completed",
        );
        if (active)
          setMilestoneReaction({
            dialogue: dialogue.text,
            eventId: event.eventId,
          });
      } catch {
        if (active)
          setMilestoneReaction({
            dialogueUnavailable: true,
            eventId: event.eventId,
          });
      }
    };
    const flushStructuralFeedback = () => {
      structuralBatchScheduledRef.current = false;
      const milestoneIds = new Set(structuralMilestoneIdsRef.current);
      structuralMilestoneIdsRef.current.clear();
      if (milestoneIds.size === 0) return;
      void application.queries.listMilestones.list().then(
        (milestones) => {
          if (!active) return;
          const totals = new Map<StructuralInventoryFamilyId, number>();
          for (const grant of structuralGrants(
            milestones.filter((milestone) => milestoneIds.has(milestone.id)),
          )) {
            totals.set(
              grant.familyId,
              (totals.get(grant.familyId) ?? 0) + grant.quantity,
            );
          }
          if (totals.size === 0) return;
          structuralFeedbackTokenRef.current += 1;
          const token = `structural-unlock-${structuralFeedbackTokenRef.current}`;
          setStructuralUnlock({
            families: Object.freeze(
              [...totals.entries()].map(([familyId, quantity]) => ({
                familyId,
                quantity,
              })),
            ),
            token,
          });
          application.audio.emit({ type: "StructuralUnlocked" });
        },
        () => console.warn("Progressão estrutural indisponível: LIST_FAILED."),
      );
    };
    const scheduleStructuralFeedback = (milestoneId: string) => {
      structuralMilestoneIdsRef.current.add(milestoneId);
      if (structuralBatchScheduledRef.current) return;
      structuralBatchScheduledRef.current = true;
      void Promise.resolve().then(flushStructuralFeedback);
    };
    const unsubscribe = application.events.subscribe(
      "MilestoneReached",
      (event) => {
        if (
          event.type === "MilestoneReached" &&
          event.payload.milestoneId === MILESTONE_ID.firstCompletedBook
        ) {
          void reactToFirstCompletion(event);
        }
        if (
          event.type === "MilestoneReached" &&
          isStructuralMilestoneId(event.payload.milestoneId)
        )
          scheduleStructuralFeedback(event.payload.milestoneId);
      },
    );
    void application.commands.reconcileStructuralProgress
      .execute()
      .catch(() => {
        console.warn(
          "Progressão estrutural indisponível: RECONCILIATION_FAILED.",
        );
      });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [application]);

  return (
    <div
      className="app-shell"
      data-construction-mode={libraryConstructionMode}
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
        immersive={location.pathname === APP_ROUTE_PATHS.library}
        title={sectionTitle}
      />
      {!libraryConstructionMode && (
        <ActiveSessionIndicator application={application} />
      )}

      <main
        className={`app-content${location.pathname === "/" ? " app-content--library" : ""}`}
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
      >
        {application?.platform.supported === false && (
          <p className="context-guidance" role="alert">
            {unsafeContextGuidance}
          </p>
        )}
        {milestoneReaction && (
          <section
            aria-atomic="true"
            aria-live="polite"
            className="milestone-notification"
            role="status"
          >
            <p>
              Primeiro livro concluído. A luminária de leitura foi desbloqueada.
            </p>
            {milestoneReaction.dialogue && (
              <p lang="pt-BR">{milestoneReaction.dialogue}</p>
            )}
            {milestoneReaction.dialogueUnavailable && (
              <p>O diálogo contextual não pôde ser carregado agora.</p>
            )}
            <button
              className="button button--secondary"
              onClick={() => setMilestoneReaction(null)}
              type="button"
            >
              Fechar aviso
            </button>
          </section>
        )}
        {structuralUnlock && (
          <section
            aria-atomic="true"
            aria-live="polite"
            className="milestone-notification structural-unlock-notification"
            role="status"
          >
            <h2>Novas peças desbloqueadas</h2>
            <ul>
              {structuralUnlock.families.map(({ familyId, quantity }) => (
                <li key={familyId}>
                  {structuralFamilyName(familyId)}: {quantity}
                </li>
              ))}
            </ul>
            <button
              className="button button--primary"
              onClick={() => {
                void navigate("/", {
                  state: { openStructuralConstruction: structuralUnlock.token },
                });
                setStructuralUnlock(null);
              }}
              type="button"
            >
              Abrir construção
            </button>
            <button
              className="button button--secondary"
              onClick={() => setStructuralUnlock(null)}
              type="button"
            >
              Dispensar
            </button>
          </section>
        )}
        <Routes>
          <Route
            path={APP_ROUTE_PATHS.library}
            element={
              <LibraryPage
                application={application}
                onConstructionModeChange={handleConstructionModeChange}
                onDecorationUnlockPresented={(eventId) => {
                  setPendingDecorationUnlock((pending) =>
                    pending?.eventId === eventId ? null : pending,
                  );
                }}
                pendingDecorationUnlock={pendingDecorationUnlock ?? undefined}
                pendingStructuralUnlock={
                  structuralUnlock
                    ? {
                        familyIds: structuralUnlock.families.map(
                          ({ familyId }) => familyId,
                        ),
                        token: structuralUnlock.token,
                      }
                    : undefined
                }
                reducedMotion={effectiveExperience.reducedMotion}
                highContrast={effectiveExperience.highContrast}
              />
            }
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
          location.pathname === "/configuracoes" &&
          diagnostics && <DevelopmentDiagnostics diagnostics={diagnostics} />}
      </main>
      {!libraryConstructionMode && <PrimaryDock pathname={location.pathname} />}
    </div>
  );
}
