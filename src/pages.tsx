import { equalSnapshot } from "./features/library/snapshotEquality";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { projectLivingScrolls } from "./application/livingScrolls";
import type { ExperiencePreferencesPort } from "./application";
import {
  schedulePassage,
  beginPassage,
  signalPassageReady,
} from "./app/interactionContinuity";
import { projectWorldSessionActivity } from "./application/projectWorldSessionActivity";
import type { WorldSessionActivity } from "./contracts/worldSessionActivity";
import type { LibraryEntry, Note, Quote, Session } from "./domain";
import { presentApplicationError } from "./features/entry-editor/errorMessages";
import { entryTypeLabels } from "./features/collection/collectionControls";
import { WorldHost, type WorldHostStatus } from "./features/library/WorldHost";
import type { InhabitantContinuityPort } from "./features/library/inhabitantContinuity";
import type { NightLightingPort } from "./features/library/nightLighting";
import {
  projectLibraryWorldEntries,
  type LibraryWorldCategory,
  type LibraryWorldSnapshot,
} from "./features/library/libraryWorldEntries";
import type {
  WorldSelectableObject,
  WorldSelection,
} from "./features/library/worldRuntime";
import { isDiagnosticsEnabled } from "./app/diagnosticsAvailability";
import { completeStartupExperience } from "./startupExperience";
import { CanvasWelcome } from "./features/library/CanvasWelcome";
import { useExperiencePreferences } from "./useExperiencePreferences";

const diagnosticsBuildEnabled =
  import.meta.env.VITE_ENABLE_DIAGNOSTICS === "true";
const PerformanceScenarioHarness = diagnosticsBuildEnabled
  ? lazy(async () => {
      const module =
        await import("./features/library/PerformanceScenarioHarness");
      return { default: module.PerformanceScenarioHarness };
    })
  : undefined;

export interface LibraryApplication {
  readonly experience?: ExperiencePreferencesPort;
  readonly inhabitantContinuity?: InhabitantContinuityPort;
  readonly nightLightingContinuity?: NightLightingPort;
  readonly events?: {
    subscribe(
      type: "SessionChanged",
      listener: (event: { readonly aggregateId: string }) => void,
    ): () => void;
  };
  readonly queries: {
    readonly listAllNotes?: { execute(): Promise<readonly Note[]> };
    readonly listAllQuotes?: { execute(): Promise<readonly Quote[]> };
    readonly listLibraryEntries: {
      execute(): Promise<readonly LibraryEntry[]>;
    };
    readonly getLibraryEntry?: {
      execute(input: { id: string }): Promise<LibraryEntry>;
    };
    readonly getOpenSession?: { execute(): Promise<Session | undefined> };
  };
}

interface LibraryPageSnapshot {
  readonly application: LibraryApplication;
  readonly world?: LibraryWorldSnapshot;
  readonly activity?: WorldSessionActivity | null;
  readonly error?: string;
}

interface ApplicationBound<Value> {
  readonly application: LibraryApplication;
  readonly value: Value;
}

function scrollPath(
  scroll: import("./contracts/livingScroll").LivingScroll,
  returnPath: string,
): string {
  return `${entryPath(scroll.entryId)}?${new URLSearchParams({ annotationKind: scroll.kind, annotationId: scroll.annotationId, from: returnPath })}`;
}
function entryPath(entryId: string): string {
  return `/registros/${encodeURIComponent(entryId)}`;
}

const categoryHeadings: Record<LibraryWorldCategory["type"], string> = {
  book: "Livros da área de leitura",
  movie: "Filmes",
  series: "Séries",
  study: "Estudos",
  physical_activity: "Atividades físicas",
  work: "Trabalhos",
};

const selectionDescriptions: Record<LibraryWorldCategory["type"], string> = {
  book: "Livro selecionado",
  movie: "Filme selecionado",
  series: "Série selecionada",
  study: "Estudo selecionado",
  physical_activity: "Atividade física selecionada",
  work: "Trabalho selecionado",
};

function findSelectedEntry(
  snapshot: LibraryWorldSnapshot | undefined,
  selection: WorldSelection,
) {
  if (!snapshot || !selection?.entryId) return undefined;
  for (const category of snapshot.categories) {
    const entry = category.entries.find(
      (item) =>
        item.entryId === selection.entryId && item.instanceId === selection.id,
    );
    if (entry) return { ...entry, type: category.type };
  }
  return undefined;
}

const applicationMountIds = new WeakMap<LibraryApplication, number>();
let nextApplicationMountId = 0;

export function LibraryPage({
  application,
  active = true,
}: {
  readonly application?: LibraryApplication;
  readonly active?: boolean;
}) {
  if (!application)
    return <LibraryPageContent active={active} key="unavailable" />;
  let mountId = applicationMountIds.get(application);
  if (mountId === undefined) {
    mountId = ++nextApplicationMountId;
    applicationMountIds.set(application, mountId);
  }
  return (
    <LibraryPageContent
      application={application}
      active={active}
      key={mountId}
    />
  );
}

function LibraryPageContent({
  application,
  active = true,
}: {
  readonly application?: LibraryApplication;
  readonly active?: boolean;
}) {
  const diagnosticsEnabled = isDiagnosticsEnabled(
    import.meta.env.DEV,
    import.meta.env.VITE_ENABLE_DIAGNOSTICS,
  );
  const location = useLocation();
  // A profiling APK must exercise the user's real world by default. The old
  // F5 synthetic scenes remain available through an explicit diagnostics URL.
  const diagnosticsActive =
    diagnosticsEnabled &&
    PerformanceScenarioHarness &&
    new URLSearchParams(location.search).get("worldScenario") === "true";
  const navigate = useNavigate();
  const { showCanvasAccessButton: storedCanvasAccessButton } =
    useExperiencePreferences(application?.experience);
  const showCanvasAccessButton =
    application?.experience ? storedCanvasAccessButton : true;
  const [snapshot, setSnapshot] = useState<LibraryPageSnapshot>();
  const [selectableObjectsState, setSelectableObjectsState] =
    useState<ApplicationBound<readonly WorldSelectableObject[]>>();
  const [selectionState, setSelectionState] =
    useState<ApplicationBound<WorldSelection>>();
  const [requestedSelectionState, setRequestedSelectionState] =
    useState<ApplicationBound<string | null>>();
  const [worldStatusState, setWorldStatusState] =
    useState<ApplicationBound<WorldHostStatus>>();
  const [toolsOpen, setToolsOpen] = useState(false);
  const pageRef = useRef<HTMLElement>(null);
  const portalFlight = useRef<(() => void) | null>(null);
  useEffect(() => () => portalFlight.current?.(), []);
  useEffect(() => {
    if (!active) {
      portalFlight.current?.();
      portalFlight.current = null;
    }
  }, [active]);

  // Do not let a previous application instance lend its data, error, catalog
  // or selected entry to the next one during the render before its effect runs.
  const currentSnapshot =
    snapshot?.application === application ? snapshot : undefined;
  const libraryWorldSnapshot = currentSnapshot?.world;
  const worldSessionActivity = currentSnapshot?.activity ?? null;
  const readingAreaBooks = libraryWorldSnapshot?.categories[0].entries;
  const error = currentSnapshot?.error;
  useEffect(() => {
    if (error && active) completeStartupExperience();
  }, [error, active]);
  const selectableObjects =
    application && selectableObjectsState?.application === application
      ? selectableObjectsState.value
      : [];
  const selection =
    application && selectionState?.application === application
      ? selectionState.value
      : null;
  const requestedSelectionId =
    application && requestedSelectionState?.application === application
      ? requestedSelectionState.value
      : null;
  const worldStatus =
    application && worldStatusState?.application === application
      ? worldStatusState.value
      : "initializing";

  // The resident 3D Library is ready only when its runtime has started
  // (or a visible error/unavailable state can be shown). Navigation back
  // must not uncover a half-initialized Canvas.
  useEffect(() => {
    if (
      active &&
      (!application || error || worldStatus === "ready" || worldStatus === "failed")
    ) signalPassageReady(location.pathname);
  }, [active, application, error, worldStatus, location.pathname]);

  useEffect(() => {
    const page = pageRef.current;
    if (!active || !page || typeof ResizeObserver === "undefined") return;
    const tools = [
      ...page.querySelectorAll<HTMLElement>(".rpg-tools, .canvas-access"),
    ];
    const resize = () =>
      page.style.setProperty(
        "--canvas-tools-height",
        `${Math.max(0, ...tools.map((tool) => tool.getBoundingClientRect().height))}px`,
      );
    resize();
    const observer = new ResizeObserver(resize);
    tools.forEach((tool) => observer.observe(tool));
    return () => observer.disconnect();
  }, [active, worldStatus]);

  function handleWorldSelection(nextSelection: WorldSelection): void {
    if (!application) return;
    if (nextSelection?.id === "portal:duelo-arcano") {
      if (portalFlight.current) return;
      // The lunar gate enters the Arcanarium Portal; duel is a room within it.
      beginPassage("/arcanario");
      portalFlight.current = schedulePassage(() => {
        portalFlight.current = null;
        void navigate("/arcanario");
      });
      return;
    }
    setSelectionState({ application, value: nextSelection });
    setRequestedSelectionState({
      application,
      value: nextSelection?.id ?? null,
    });
  }

  function handleSelectableObjects(
    objects: readonly WorldSelectableObject[],
  ): void {
    if (application)
      setSelectableObjectsState({
        application,
        value: objects,
      });
  }

  function handleWorldStatus(status: WorldHostStatus): void {
    if (application)
      setWorldStatusState({
        application,
        value: status,
      });
  }

  useEffect(() => {
    if (!application || diagnosticsActive || !active) return;
    let current = true;
    let generation = 0;
    let cachedEntries: readonly LibraryEntry[] = [];
    const loadSnapshot = async (): Promise<void> => {
      const request = ++generation;
      try {
        const [entries, notes, quotes, openSession] = await Promise.all([
          application.queries.listLibraryEntries.execute(),
          application.queries.listAllNotes?.execute() ?? [],
          application.queries.listAllQuotes?.execute() ?? [],
          application.queries.getOpenSession?.execute() ?? undefined,
        ]);
        if (!current || request !== generation) return;
        cachedEntries = entries;
        const world = Object.freeze({
          ...projectLibraryWorldEntries(entries),
          scrolls: projectLivingScrolls(entries, notes, quotes),
        });
        const activity = projectWorldSessionActivity(openSession, entries);
        setSnapshot((previous) => {
          const sameWorld =
            previous?.application === application &&
            equalSnapshot(previous.world, world);
          const sameActivity =
            previous?.application === application &&
            equalSnapshot(previous.activity ?? null, activity);
          if (sameWorld && sameActivity) return previous;
          return {
            application,
            world: sameWorld && previous?.world ? previous.world : world,
            activity,
          };
        });
      } catch (failure: unknown) {
        if (!current || request !== generation) return;
        setSnapshot({
          application,
          error: presentApplicationError(failure).message,
        });
      }
    };
    let pending = loadSnapshot();
    const loadSession = async (entryId: string): Promise<void> => {
      try {
        const openSession = await application.queries.getOpenSession?.execute();
        if (!current) return;
        let entryChanged = false;
        if (application.queries.getLibraryEntry) {
          const entry = await application.queries.getLibraryEntry.execute({
            id: entryId,
          });
          entryChanged = !equalSnapshot(
            cachedEntries.find((old) => old.id === entry.id),
            entry,
          );
          cachedEntries = cachedEntries.map((old) =>
            old.id === entry.id ? entry : old,
          );
        }
        if (!current) return;
        const world = entryChanged
          ? projectLibraryWorldEntries(cachedEntries)
          : undefined;
        const activity = projectWorldSessionActivity(
          openSession,
          cachedEntries,
        );
        setSnapshot((previous) => {
          if (previous?.application !== application || !previous.world)
            return previous;
          const nextWorld = Object.freeze({
            ...(world ?? previous.world),
            scrolls: previous.world.scrolls,
          });
          const sameWorld = equalSnapshot(previous.world, nextWorld);
          if (sameWorld && equalSnapshot(previous.activity ?? null, activity))
            return previous;
          return {
            ...previous,
            world: sameWorld ? previous.world : nextWorld,
            activity,
          };
        });
      } catch (failure: unknown) {
        if (current)
          setSnapshot({
            application,
            error: presentApplicationError(failure).message,
          });
      }
    };
    const unsubscribe = application.events?.subscribe(
      "SessionChanged",
      (event) => {
        pending = pending.then(() => loadSession(event.aggregateId));
      },
    );
    return () => {
      current = false;
      unsubscribe?.();
    };
  }, [application, diagnosticsActive, active]);

  useEffect(() => {
    if (!active) return;
    const closeExploration = (event: Event) => {
      if (
        event.defaultPrevented ||
        (event instanceof KeyboardEvent && event.key !== "Escape") ||
        document.querySelector(".rpg-dialogue, .rpg-journal")
      )
        return;
      const panels = document.querySelectorAll<HTMLDetailsElement>(
        ".library-page details[open]",
      );
      const panel = panels.item(panels.length - 1);
      if (!panel) {
        if (toolsOpen) {
          event.preventDefault();
          setToolsOpen(false);
        }
        return;
      }
      event.preventDefault();
      panel.open = false;
      panel.querySelector<HTMLElement>("summary")?.focus();
    };
    window.addEventListener("keydown", closeExploration);
    window.addEventListener("biblioteca-viva:native-back", closeExploration);
    return () => {
      window.removeEventListener("keydown", closeExploration);
      window.removeEventListener(
        "biblioteca-viva:native-back",
        closeExploration,
      );
    };
  }, [toolsOpen, active]);

  const returnPath = `${location.pathname}${location.search}`;
  const representedIds = new Set(selectableObjects.map(({ id }) => id));
  const representedBooks = readingAreaBooks?.filter(({ instanceId }) =>
    representedIds.has(instanceId),
  );
  const selectedEntry =
    worldStatus === "ready" &&
    selection?.entryId &&
    selectableObjects.some(
      ({ id, entryId }) => id === selection.id && entryId === selection.entryId,
    )
      ? findSelectedEntry(libraryWorldSnapshot, selection)
      : undefined;
  const totalEntries = libraryWorldSnapshot?.categories.reduce(
    (total, category) => total + category.entries.length,
    0,
  );

  return (
    <section
      className="library-page"
      ref={pageRef}
      aria-labelledby="library-title"
      data-tools-open={toolsOpen || worldStatus === "failed"}
    >
      <div className="library-scene-vignette" aria-hidden="true" />
      <h2 id="library-title" className="visually-hidden">
        Biblioteca Viva
      </h2>
      {active && worldStatus === "ready" && <CanvasWelcome />}
      {worldStatus !== "failed" && showCanvasAccessButton && (
        <button
          aria-controls="library-access-panels"
          aria-expanded={toolsOpen}
          aria-label={
            toolsOpen
              ? "Recolher ferramentas de exploração"
              : "Abrir ferramentas de exploração acessível"
          }
          className="canvas-access"
          onClick={() => setToolsOpen((open) => !open)}
          type="button"
        >
          <span aria-hidden="true">☷</span>
          <span>{toolsOpen ? "Fechar painel" : "Acervo e habitantes"}</span>
        </button>
      )}
      <div className="library-access-panels" id="library-access-panels">
        {diagnosticsActive ? (
          <Suspense
            fallback={
              <p className="world-status">Preparando cenário experimental…</p>
            }
          >
            <PerformanceScenarioHarness />
          </Suspense>
        ) : !application ? (
          <section className="content-card" role="alert">
            <h3>Biblioteca indisponível</h3>
            <p>Não foi possível iniciar o armazenamento local.</p>
          </section>
        ) : error ? (
          <section className="content-card" role="alert">
            <h3>Não foi possível preparar a Biblioteca</h3>
            <p>{error}</p>
          </section>
        ) : !readingAreaBooks ? (
          <p className="world-status" role="status">
            Carregando Biblioteca…
          </p>
        ) : (
          <>
            <WorldHost
              active={active}
              inhabitantContinuity={application.inhabitantContinuity}
              nightLightingContinuity={application.nightLightingContinuity}
              libraryWorldSnapshot={libraryWorldSnapshot}
              worldSessionActivity={worldSessionActivity}
              onSelectableObjectsChange={handleSelectableObjects}
              onSelectionChange={handleWorldSelection}
              onStatusChange={handleWorldStatus}
              selectedObjectId={requestedSelectionId}
            />
            {selection?.id.startsWith("scroll:") &&
              libraryWorldSnapshot?.scrolls?.some(
                (s) => s.id === selection.id,
              ) && (
                <Link
                  className="reading-area-selection button button--secondary"
                  to={scrollPath(
                    libraryWorldSnapshot.scrolls.find(
                      (s) => s.id === selection.id,
                    )!,
                    returnPath,
                  )}
                >
                  Abrir conteúdo do pergaminho
                </Link>
              )}
            <details className="library-index" open={worldStatus === "failed"}>
              <summary>Registros · alternativa acessível</summary>
              {libraryWorldSnapshot?.scrolls?.length ? (
                <section className="reading-area-books">
                  <h3>Pergaminhos vivos</h3>
                  {libraryWorldSnapshot.scrolls.map((scroll) => (
                    <p key={scroll.id}>
                      <Link
                        to={scrollPath(scroll, returnPath)}
                        state={{ returnTo: returnPath }}
                      >
                        Abrir {scroll.kind === "note" ? "anotação" : "citação"}{" "}
                        no registro de origem
                      </Link>
                    </p>
                  ))}
                </section>
              ) : null}

              {worldStatus === "ready" && readingAreaBooks.length > 0 && (
                <p className="reading-area-summary" aria-live="polite">
                  {representedBooks?.length ?? 0}{" "}
                  {(representedBooks?.length ?? 0) === 1
                    ? "livro representado"
                    : "livros representados"}
                  {"; "}
                  {readingAreaBooks.length - (representedBooks?.length ?? 0) ===
                  1
                    ? "1 livro fora da capacidade visual atual."
                    : `${readingAreaBooks.length - (representedBooks?.length ?? 0)} livros fora da capacidade visual atual.`}
                </p>
              )}
              {totalEntries === 0 && (
                <section className="content-card reading-area-empty">
                  <h3>Ainda não há registros na Biblioteca</h3>
                  <p>Crie um registro para começar.</p>
                </section>
              )}
              {libraryWorldSnapshot.categories.map((category) => (
                <section className="reading-area-books" key={category.type}>
                  <h3>{categoryHeadings[category.type]}</h3>
                  {category.entries.length === 0 ? (
                    <p>Nenhum registro nesta categoria.</p>
                  ) : (
                    <ul>
                      {category.entries.map((entry) => {
                        const represented =
                          worldStatus === "ready" &&
                          representedIds.has(entry.instanceId);
                        const overflow =
                          worldStatus === "ready" && !represented;
                        return (
                          <li key={entry.instanceId}>
                            <div>
                              <p>{entryTypeLabels[category.type]}</p>
                              <Link
                                to={{
                                  pathname: entryPath(entry.entryId),
                                  search: `?from=${encodeURIComponent(returnPath)}`,
                                }}
                              >
                                {entry.title}
                              </Link>
                              {category.type === "book" && (
                                <p>
                                  {"author" in entry
                                    ? (entry.author ?? "Autor não informado")
                                    : "Autor não informado"}
                                </p>
                              )}
                              {represented && (
                                <p>
                                  {category.type === "book"
                                    ? "Nas estantes visuais."
                                    : "Representado no ambiente."}
                                </p>
                              )}
                              {overflow && (
                                <p>Fora da capacidade visual atual.</p>
                              )}
                              {worldStatus === "failed" && (
                                <p>Representação visual indisponível.</p>
                              )}
                            </div>
                            {represented && (
                              <button
                                aria-pressed={
                                  selectedEntry?.instanceId === entry.instanceId
                                }
                                aria-label={`Selecionar no ambiente: ${entryTypeLabels[category.type]} ${entry.title}`}
                                className="button button--secondary"
                                onClick={() =>
                                  application &&
                                  setRequestedSelectionState({
                                    application,
                                    value: entry.instanceId,
                                  })
                                }
                                type="button"
                              >
                                Selecionar no ambiente
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              ))}
            </details>
            {selectedEntry && (
              <section className="reading-area-selection" aria-live="polite">
                <p>
                  {selectionDescriptions[selectedEntry.type]}:{" "}
                  {selectedEntry.title}.
                </p>
                <Link
                  className="button button--secondary"
                  to={{
                    pathname: entryPath(selectedEntry.entryId),
                    search: `?from=${encodeURIComponent(returnPath)}`,
                  }}
                >
                  Abrir registro
                </Link>
              </section>
            )}
          </>
        )}
        <div className="placeholder-actions">
          <Link className="button button--secondary" to="/arcanario/duelos">
            ◈ Arena orbital · Duelo Arcano
          </Link>
          <Link className="button button--secondary" to="/arcanario">
            ✧ Abrir o Arcanário
          </Link>
          <Link className="button button--primary" to="/colecao">
            Abrir Coleção
          </Link>
          <Link className="button button--secondary" to="/novo-registro">
            Criar registro
          </Link>
        </div>
      </div>
    </section>
  );
}
