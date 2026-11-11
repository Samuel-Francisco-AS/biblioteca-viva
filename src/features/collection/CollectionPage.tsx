import { BVSelectSheet } from "../../ui/BVPicker";
import { signalPassageReady } from "../../app/interactionContinuity";
import {
  VISIBLE_GROUPS,
  groupLabels,
  CATALOG_FILTERS,
  catalogFilterLabels,
} from "../entertainment/catalogFilters";
import { useCivilToday } from "../entertainment/useCivilToday";
import {
  isEntertainment,
  entertainmentFormat,
  formatLabels,
  watchState,
  watchLabels,
  releaseDays,
} from "../../domain/entertainment";
import "../entertainment/entertainment.css";
import { ArtifactGlyph } from "../../app/ArtifactGlyph";
import { RealmIntro } from "../../app/RealmIntro";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import { ENTRY_STATUSES, type LibraryEntry, type Tag } from "../../domain";
import {
  progressPercentage,
  progressText,
  statusLabels,
} from "../books/bookPresentation";
import { presentApplicationError } from "../entry-editor/errorMessages";
import {
  deriveCollection,
  entryTypeLabels,
  parseCollectionSort,
  parseStatusFilter,
  parseTypeFilter,
} from "./collectionControls";

export interface CollectionApplication {
  readonly queries: {
    readonly listLibraryEntries: {
      execute(): Promise<readonly LibraryEntry[]>;
    };
    readonly listTags: { execute(): Promise<readonly Tag[]> };
  };
}

function secondaryText(entry: LibraryEntry): string {
  switch (entry.type) {
    case "book":
      return entry.author ?? "Autor não informado";
    case "movie":
      return (
        [entry.director, entry.year, entry.platform]
          .filter(Boolean)
          .join(" · ") || "Detalhes não informados"
      );
    case "series":
      return `${entry.episodesWatched}${entry.totalEpisodes === undefined ? " episódios" : ` de ${entry.totalEpisodes} episódios`}`;
    case "study":
      return (
        [entry.area, entry.discipline].filter(Boolean).join(" · ") ||
        "Área não informada"
      );
    case "physical_activity":
      return entry.modality ?? entry.category;
    case "work":
      return (
        [entry.area, entry.organization].filter(Boolean).join(" · ") ||
        entry.nextAction ||
        "Detalhes não informados"
      );
  }
}

/** One shared entry point for populated and empty collections. */
function ArcanariumAccess() {
  return (
    <Link className="button button--secondary collection-arcana-link" to="/arcanario">
      <span className="collection-arcana-link__sigil" aria-hidden="true">
        ✧
      </span>
      <span className="collection-arcana-link__label">
        Cartas, Ecos e Relicário
      </span>
      <span className="collection-arcana-link__destination">
        · Arcanário
      </span>
    </Link>
  );
}

export function CollectionPage({
  application,
}: {
  readonly application?: CollectionApplication;
}) {
  const [snapshot, setSnapshot] = useState<{
    application: CollectionApplication;
    entries?: readonly LibraryEntry[];
    tags?: readonly Tag[];
    error?: string;
  }>();
  const current = snapshot?.application === application ? snapshot : undefined;
  const entries = current?.entries;
  const tags = useMemo(() => current?.tags ?? [], [current?.tags]);
  const error = current?.error;
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  const [compact, setCompact] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const query = params.get("q") ?? "";
  const status = parseStatusFilter(params.get("status"));
  const type = parseTypeFilter(params.get("type"));
  const favoritesOnly = params.get("favorite") === "true";
  const tagId = params.get("tag") ?? "all";
  const today = useCivilToday();
  const catalogFilter =
    CATALOG_FILTERS.find((value) => value === params.get("catalog")) ?? "all";
  const sort = parseCollectionSort(params.get("sort"));
  const visibleEntries = useMemo(
    () =>
      deriveCollection(
        entries ?? [],
        query,
        status,
        sort,
        type,
        favoritesOnly,
        new Map(tags.map((tag) => [tag.id, tag.name])),
        tagId,
        type === "entertainment" ? catalogFilter : "all",
        today,
      ),
    [
      entries,
      favoritesOnly,
      query,
      sort,
      status,
      tagId,
      tags,
      type,
      catalogFilter,
      today,
    ],
  );

  useEffect(() => {
    if (!application) return;
    let active = true;
    void Promise.all([
      application.queries.listLibraryEntries.execute(),
      application.queries.listTags.execute(),
    ]).then(
      ([loaded, loadedTags]) => {
        if (active) {
          setSnapshot({ application, entries: loaded, tags: loadedTags });
        }
      },
      (failure: unknown) =>
        active &&
        setSnapshot({
          application,
          error: presentApplicationError(failure).message,
        }),
    );
    return () => {
      active = false;
    };
  }, [application]);

  useEffect(() => {
    if (!application || error || entries) signalPassageReady(location.pathname);
  }, [application, error, entries, location.pathname]);

  function updateParam(name: string, value: string) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (
          value === "" ||
          value === "all" ||
          (name === "sort" && value === "recent") ||
          (name === "favorite" && value === "false")
        )
          next.delete(name);
        else next.set(name, value);
        return next;
      },
      { replace: true },
    );
  }

  useEffect(() => {
    if (!searchExpanded) return;
    const closeSearch = () => {
      setSearchExpanded(false);
      requestAnimationFrame(() => searchToggleRef.current?.focus());
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeSearch();
    };
    const onNativeBack = (event: Event) => {
      event.preventDefault();
      closeSearch();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("biblioteca-viva:native-back", onNativeBack);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("biblioteca-viva:native-back", onNativeBack);
    };
  }, [searchExpanded]);

  if (!application)
    return (
      <section className="content-card" role="alert">
        <h2>Coleção indisponível</h2>
        <p>Não foi possível iniciar o armazenamento local.</p>
      </section>
    );
  if (error)
    return (
      <section className="content-card" role="alert">
        <h2>Não foi possível abrir a Coleção</h2>
        <p>{error}</p>
      </section>
    );
  if (!entries) return <p role="status">Carregando Coleção…</p>;
  if (entries.length === 0)
    return (
      <section
        className="content-card"
        aria-labelledby="empty-collection-title"
      >
        <RealmIntro
          title="Acervo encantado"
          description="Tudo o que você lê, descobre e constrói."
        />
        <ArcanariumAccess />
        <p className="eyebrow">Coleção vazia</p>
        <h2 id="empty-collection-title">Seu primeiro registro começa aqui</h2>
        <p>Registre algo que você lê, assiste, aprende, pratica ou constrói.</p>
        <Link className="button button--primary" to="/novo-registro">
          Criar primeiro registro
        </Link>
      </section>
    );

  const activeControlCount = [
    query.trim() !== "",
    status !== "all",
    type !== "all",
    type === "entertainment" && catalogFilter !== "all",
    favoritesOnly,
    tagId !== "all",
    sort !== "recent",
  ].filter(Boolean).length;
  const controlsActive = activeControlCount > 0;
  const returnPath = `${location.pathname}${location.search}`;
  return (
    <section aria-label="Coleção">
      <RealmIntro
        title="Acervo encantado"
        description="Tudo o que você lê, descobre e constrói."
      />
      <ArcanariumAccess />
      <div className="section-heading collection-actions">
        <div className="section-heading__actions">
          <button
            aria-controls="collection-search-controls"
            aria-expanded={searchExpanded}
            className="button button--primary"
            onClick={() => {
              const next = !searchExpanded;
              setSearchExpanded(next);
              if (next) requestAnimationFrame(() => searchRef.current?.focus());
            }}
            ref={searchToggleRef}
            type="button"
          >
            Busca{activeControlCount > 0 ? ` · ${activeControlCount}` : ""}
          </button>
          <Link className="button button--primary" to="/novo-registro">
            Novo registro
          </Link>
        </div>
      </div>
      <nav className="category-ribbon" aria-label="Categorias do acervo">
        <button
          type="button"
          aria-pressed={type === "all"}
          onClick={() => updateParam("type", "all")}
        >
          Todos
        </button>
        {VISIBLE_GROUPS.map((category) => (
          <button
            type="button"
            key={category}
            aria-pressed={
              type === category ||
              (category === "entertainment" &&
                (type === "movie" || type === "series"))
            }
            onClick={() => updateParam("type", category)}
          >
            {groupLabels[category]}
          </button>
        ))}
      </nav>
      {type === "entertainment" && (
        <details
          className="cinema-filter-panel"
          open={catalogFilter !== "all" ? true : undefined}
        >
          <summary>
            Explorar catálogo ·{" "}
            {
              catalogFilterLabels[
                CATALOG_FILTERS.find((f) => f === catalogFilter) ?? "all"
              ]
            }
          </summary>
          <div
            className="cinema-filter-grid"
            role="group"
            aria-label="Filtros de Entretenimento"
          >
            {CATALOG_FILTERS.map((filter) => (
              <button
                type="button"
                key={filter}
                aria-pressed={catalogFilter === filter}
                onClick={() => updateParam("catalog", filter)}
              >
                {catalogFilterLabels[filter]}
              </button>
            ))}
          </div>
        </details>
      )}
      <div
        aria-hidden={!searchExpanded}
        className="collapsible-controls"
        data-expanded={searchExpanded}
        id="collection-search-controls"
      >
        <fieldset className="collection-controls" inert={!searchExpanded}>
          <legend className="visually-hidden">Controles da Coleção</legend>
          <div className="form-field">
            <label htmlFor="collection-search">Buscar registros</label>
            <p className="field-help" id="collection-search-help">
              Busca nos metadados principais de cada tipo.
            </p>
            <input
              id="collection-search"
              ref={searchRef}
              type="search"
              value={query}
              aria-describedby="collection-search-help"
              onChange={(event) => updateParam("q", event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="collection-type">Tipo</label>
            <BVSelectSheet
              id="collection-type"
              value={
                type === "movie" || type === "series" ? "entertainment" : type
              }
              onChange={(event) => updateParam("type", event.target.value)}
            >
              <option value="all">Todos os tipos</option>
              {VISIBLE_GROUPS.map((entryType) => (
                <option key={entryType} value={entryType}>
                  {groupLabels[entryType]}
                </option>
              ))}
            </BVSelectSheet>
          </div>
          <div className="form-field">
            <label htmlFor="collection-status">Status</label>
            <BVSelectSheet
              id="collection-status"
              value={status}
              onChange={(event) => updateParam("status", event.target.value)}
            >
              <option value="all">Todos os status</option>
              {ENTRY_STATUSES.map((entryStatus) => (
                <option key={entryStatus} value={entryStatus}>
                  {statusLabels[entryStatus]}
                </option>
              ))}
            </BVSelectSheet>
          </div>
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(event) =>
                updateParam("favorite", String(event.target.checked))
              }
            />{" "}
            Somente favoritos
          </label>
          <div className="form-field">
            <label htmlFor="collection-tag">Etiqueta</label>
            <BVSelectSheet
              id="collection-tag"
              value={tagId}
              onChange={(event) => updateParam("tag", event.target.value)}
            >
              <option value="all">Todas as etiquetas</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </BVSelectSheet>
          </div>
          <div className="form-field">
            <label htmlFor="collection-sort">Ordenar por</label>
            <BVSelectSheet
              id="collection-sort"
              value={sort}
              onChange={(event) => updateParam("sort", event.target.value)}
            >
              <option value="recent">Atualização recente</option>
              <option value="created">Criação recente</option>
              <option value="title">Título</option>
            </BVSelectSheet>
          </div>
        </fieldset>
      </div>
      <div className="result-summary" aria-live="polite">
        <button
          type="button"
          className="button button--secondary"
          aria-pressed={compact}
          onClick={() => setCompact(!compact)}
        >
          Lista compacta
        </button>
        <p>
          {visibleEntries.length}{" "}
          {visibleEntries.length === 1
            ? "registro encontrado"
            : "registros encontrados"}
          {controlsActive ? ` de ${entries.length}` : ""}.
        </p>
        {controlsActive && (
          <button
            className="button button--secondary"
            type="button"
            onClick={() => {
              setParams({}, { replace: true });
              setSearchExpanded(true);
              requestAnimationFrame(() => searchRef.current?.focus());
            }}
          >
            Limpar busca e filtros
          </button>
        )}
      </div>
      {visibleEntries.length === 0 ? (
        <section
          className="content-card no-results"
          aria-labelledby="collection-no-results"
        >
          <h3 id="collection-no-results">
            Nenhum registro corresponde aos controles
          </h3>
          <p>Altere a busca ou os filtros para ver outros registros.</p>
        </section>
      ) : (
        <ul className={compact ? "book-grid book-grid--compact" : "book-grid"}>
          {visibleEntries.map((entry) => (
            <li
              className="book-card"
              data-entry-type={entry.type}
              key={entry.id}
            >
              <Link
                aria-label={`Abrir detalhes de ${entry.title}`}
                className="book-card__link"
                to={{
                  pathname: `/registros/${encodeURIComponent(entry.id)}`,
                  search: `?from=${encodeURIComponent(returnPath)}`,
                }}
              >
                <article
                  className="record-tile"
                  aria-labelledby={`entry-${entry.id}-title`}
                >
                  <span className="record-tile__emblem" aria-hidden="true">
                    <ArtifactGlyph type={entry.type} />
                  </span>
                  <div className="record-tile__content">
                    <p className="eyebrow">
                      {isEntertainment(entry)
                        ? formatLabels[entertainmentFormat(entry)]
                        : entryTypeLabels[entry.type]}
                      {entry.favorite ? " · Favorito" : ""}
                    </p>
                    <p className="status-badge">
                      {isEntertainment(entry)
                        ? watchLabels[watchState(entry)]
                        : statusLabels[entry.status]}
                    </p>
                    <h3 id={`entry-${entry.id}-title`}>{entry.title}</h3>
                    <p>
                      {secondaryText(entry)}
                      {isEntertainment(entry) &&
                        (releaseDays(entry.catalog?.releaseDate, today) ?? -1) >
                          0 && (
                          <span className="cinema-release-chip">
                            {" "}
                            · Estreia em{" "}
                            {releaseDays(
                              entry.catalog?.releaseDate,
                              today,
                            )}{" "}
                            dias
                          </span>
                        )}
                    </p>
                    {entry.type === "book" && (
                      <>
                        <p>{progressText(entry)}</p>
                        {entry.totalPages !== undefined ? (
                          <progress
                            aria-label={`Progresso de ${entry.title}`}
                            max={entry.totalPages}
                            value={Math.min(
                              entry.currentPage,
                              entry.totalPages,
                            )}
                          />
                        ) : (
                          <p className="progress-unknown">
                            Porcentagem indisponível sem total de páginas.
                          </p>
                        )}
                        <span className="visually-hidden">
                          {progressPercentage(entry) ?? ""}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="record-tile__arrow" aria-hidden="true">
                    ↗
                  </span>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
