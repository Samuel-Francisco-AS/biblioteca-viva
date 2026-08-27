import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { appRoutes } from "./routes";
import { useAndroidBackButton } from "./useAndroidBackButton";
import { DevelopmentDiagnostics } from "./app/DevelopmentDiagnostics";
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

export function App({ application, diagnostics }: AppProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const previousPathRef = useRef(location.pathname);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const restoreMenuFocusRef = useRef(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
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
    activeRoute?.title ??
    (location.pathname.endsWith("/editar")
      ? "Editar registro"
      : location.pathname.startsWith("/registros/")
        ? "Detalhes do registro"
        : "Página não encontrada");

  useAndroidBackButton();
  useAudioExperience(application?.audio);
  const effectiveExperience = useExperiencePreferences(application?.experience);

  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      mainRef.current?.focus();
      previousPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!navigationOpen) {
      if (restoreMenuFocusRef.current) {
        restoreMenuFocusRef.current = false;
        menuButtonRef.current?.focus();
      }
      return;
    }
    const firstLink = drawerRef.current?.querySelector<HTMLAnchorElement>("a");
    firstLink?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [navigationOpen]);

  function closeNavigation({ restoreFocus = true } = {}) {
    restoreMenuFocusRef.current = restoreFocus;
    setNavigationOpen(false);
  }

  function handleDrawerKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeNavigation();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      drawerRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

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
      data-high-contrast={effectiveExperience.highContrast}
      data-reduced-motion={effectiveExperience.reducedMotion}
      data-text-size={effectiveExperience.textSize}
    >
      <a className="skip-link" href="#main-content">
        Ir para o conteúdo principal
      </a>

      <header
        className={`top-bar${location.pathname === "/" ? " top-bar--library" : ""}`}
      >
        <button
          aria-controls="primary-navigation"
          aria-expanded={navigationOpen}
          aria-label="Abrir menu principal"
          className="menu-button"
          onClick={() => setNavigationOpen(true)}
          ref={menuButtonRef}
          type="button"
        >
          <span aria-hidden="true" className="menu-button__icon" />
        </button>
        <div>
          <p className="top-bar__brand">Biblioteca Viva</p>
          <h1>{sectionTitle}</h1>
        </div>
      </header>
      <ActiveSessionIndicator application={application} />

      {navigationOpen && (
        <div className="navigation-layer">
          <button
            aria-label="Fechar menu principal"
            className="navigation-backdrop"
            onClick={() => closeNavigation()}
            tabIndex={-1}
            type="button"
          />
          <aside
            aria-label="Menu principal"
            aria-modal="true"
            className="primary-navigation"
            id="primary-navigation"
            onKeyDown={handleDrawerKeyDown}
            ref={drawerRef}
            role="dialog"
          >
            <div className="primary-navigation__heading">
              <div>
                <p className="eyebrow">Biblioteca Viva</p>
                <h2>Explorar</h2>
              </div>
              <button
                aria-label="Fechar menu principal"
                className="drawer-close"
                onClick={() => closeNavigation()}
                type="button"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <nav aria-label="Navegação principal">
              <ul>
                {appRoutes.map((route) => (
                  <li key={route.path}>
                    <NavLink
                      aria-label={route.title}
                      className={({ isActive }) =>
                        `primary-navigation__link${isActive ? " primary-navigation__link--active" : ""}`
                      }
                      end={route.path === "/"}
                      onClick={() => closeNavigation({ restoreFocus: false })}
                      to={route.path}
                    >
                      <strong>{route.navigationLabel}</strong>
                      <span>{route.description}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
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
            path="/"
            element={
              <LibraryPage
                application={application}
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
            path="/colecao"
            element={<CollectionPage application={application} />}
          />
          <Route
            path="/arquivo"
            element={<ArchivePage application={application} />}
          />
          <Route
            path="/estatisticas"
            element={<StatisticsPage application={application} />}
          />
          <Route
            path="/configuracoes"
            element={
              <SettingsPage
                application={application}
                diagnostics={diagnostics}
              />
            }
          />
          <Route
            path="/novo-registro"
            element={<NewEntryPage application={application} />}
          />
          <Route
            path="/registros/:id/editar"
            element={<EditEntryPage application={application} />}
          />
          <Route
            path="/registros/:id"
            element={<EntryDetailPage application={application} />}
          />
          <Route
            path="/novo-livro"
            element={<Navigate replace to="/novo-registro" />}
          />
          <Route
            path="/livros/:id/editar"
            element={<LegacyEntryRedirect edit />}
          />
          <Route path="/livros/:id" element={<LegacyEntryRedirect />} />
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
    </div>
  );
}
