import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import type { LibraryEntry } from "./domain";
import { presentApplicationError } from "./features/entry-editor/errorMessages";
import { entryTypeLabels } from "./features/collection/collectionControls";
import { WorldHost, type WorldHostStatus } from "./features/library/WorldHost";
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
  readonly queries: {
    readonly listLibraryEntries: {
      execute(): Promise<readonly LibraryEntry[]>;
    };
  };
}

interface LibraryPageSnapshot {
  readonly application: LibraryApplication;
  readonly world?: LibraryWorldSnapshot;
  readonly error?: string;
}

interface ApplicationBound<Value> {
  readonly application: LibraryApplication;
  readonly value: Value;
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
}: {
  readonly application?: LibraryApplication;
}) {
  if (!application) return <LibraryPageContent key="unavailable" />;
  let mountId = applicationMountIds.get(application);
  if (mountId === undefined) {
    mountId = ++nextApplicationMountId;
    applicationMountIds.set(application, mountId);
  }
  return <LibraryPageContent application={application} key={mountId} />;
}

function LibraryPageContent({
  application,
}: {
  readonly application?: LibraryApplication;
}) {
  const diagnosticsEnabled = isDiagnosticsEnabled(
    import.meta.env.DEV,
    import.meta.env.VITE_ENABLE_DIAGNOSTICS,
  );
  const diagnosticsActive = diagnosticsEnabled && PerformanceScenarioHarness;
  const location = useLocation();
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

  // Do not let a previous application instance lend its data, error, catalog
  // or selected entry to the next one during the render before its effect runs.
  const currentSnapshot =
    snapshot?.application === application ? snapshot : undefined;
  const libraryWorldSnapshot = currentSnapshot?.world;
  const readingAreaBooks = libraryWorldSnapshot?.categories[0].entries;
  const error = currentSnapshot?.error;
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

  function handleWorldSelection(nextSelection: WorldSelection): void {
    if (!application) return;
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
    if (!application || diagnosticsActive) return;
    let active = true;
    const loadSnapshot = async (): Promise<void> => {
      try {
        const entries = await application.queries.listLibraryEntries.execute();
        if (!active) return;
        setSnapshot({
          application,
          world: projectLibraryWorldEntries(entries),
        });
      } catch (failure: unknown) {
        if (!active) return;
        setSnapshot({
          application,
          error: presentApplicationError(failure).message,
        });
      }
    };
    void loadSnapshot();
    return () => {
      active = false;
    };
  }, [application, diagnosticsActive]);

  useEffect(() => {
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
  }, [toolsOpen]);

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
      aria-labelledby="library-title"
      data-tools-open={toolsOpen || worldStatus === "failed"}
    >
      <div className="library-scene-vignette" aria-hidden="true" />
      <header className="exploration-header">
        <span className="exploration-header__eyebrow">
          <span className="exploration-header__star" aria-hidden="true">
            ✦
          </span>
          MUNDO VIVO
        </span>
        <h2 id="library-title">Biblioteca Viva</h2>
        <p>O santuário das histórias</p>
      </header>
      {worldStatus !== "failed" && (
        <button
          aria-controls="library-access-panels"
          aria-expanded={toolsOpen || worldStatus === "failed"}
          aria-label={
            toolsOpen
              ? "Recolher ferramentas de exploração"
              : "Abrir ferramentas de exploração acessível"
          }
          className="exploration-compass"
          onClick={() => setToolsOpen((open) => !open)}
          type="button"
        >
          <svg aria-hidden="true" fill="none" viewBox="0 0 32 32">
            <circle
              cx="16"
              cy="16"
              r="11.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="m19.5 12.5-3 7-4-4 7-3Z"
              fill="currentColor"
              opacity=".9"
            />
            <path
              d="M16 2v4m0 20v4M2 16h4m20 0h4"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span>{toolsOpen ? "Fechar painel" : "Explorar por lista"}</span>
        </button>
      )}
      <div className="exploration-lore" aria-hidden="true">
        <span className="exploration-lore__line" />
        <span>TOQUE PARA DESCOBRIR</span>
      </div>
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
              libraryWorldSnapshot={libraryWorldSnapshot}
              onSelectableObjectsChange={handleSelectableObjects}
              onSelectionChange={handleWorldSelection}
              onStatusChange={handleWorldStatus}
              selectedObjectId={requestedSelectionId}
            />
            <details className="library-index" open={worldStatus === "failed"}>
              <summary>Registros · alternativa acessível</summary>
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
