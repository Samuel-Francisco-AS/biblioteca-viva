import { RecordCoverEditor } from "../../ui/RecordCoverEditor";
import { BVDatePicker } from "../../ui/BVPicker";
import { ApplicationError } from "../../application/errors";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import type { LibraryEntry, Note, Quote } from "../../domain";
import {
  entertainmentFormat,
  formatLabels,
  isWishlisted,
  releaseDays,
  watchState,
  WATCH_STATES,
  watchLabels,
  type EntertainmentEntry,
} from "../../domain/entertainment";
import type { PosterPort, LocalPoster } from "../../application/media";
import type { EntryDetailApplication } from "../entry-detail/EntryDetailPage";
import { RecordMemories } from "../entry-detail/RecordMemories";
import { SessionPanel } from "../sessions/SessionPanel";
import { OrganizationPanel } from "../tags/OrganizationPanel";
import { useStudyDraftGuard } from "../entry-detail/useStudyDraftGuard";
import { useAppResume } from "../../app/useAppResume";
import { presentApplicationError } from "../entry-editor/errorMessages";
import { useCivilToday } from "./useCivilToday";
import { CinemaComposer } from "./CinemaComposer";
import "./entertainment.css";
export interface EntertainmentApplication {
  readonly posters?: PosterPort;
  readonly commands: {
    readonly saveEntertainment?: {
      execute(input: unknown): Promise<EntertainmentEntry>;
    };
  };
}
export function EntertainmentDetail({
  application,
  entry,
  notes,
  quotes,
  returnPath,
  onChange,
}: {
  readonly application: EntryDetailApplication;
  readonly entry: EntertainmentEntry;
  readonly notes: readonly Note[];
  readonly quotes: readonly Quote[];
  readonly returnPath: string;
  readonly onChange: (entry: LibraryEntry) => void;
}) {
  const root = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const today = useCivilToday();
  const [poster, setPoster] = useState<LocalPoster>();
  const [busy, setBusy] = useState(false),
    lock = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const deletion = useRef<HTMLDialogElement>(null),
    deleteButton = useRef<HTMLButtonElement>(null);
  const [deleting, setDeleting] = useState(false);
  useStudyDraftGuard(
    root,
    "Há alterações não salvas nesta obra. Sair e descartar o rascunho?",
  );
  const refresh = useCallback(() => {
    if (dirty) return;
    void application.queries.getLibraryEntry
      .execute({ id: entry.id })
      .then(onChange, (failure) =>
        setError(presentApplicationError(failure).message),
      );
  }, [application, entry.id, onChange, dirty]);
  useAppResume(refresh);
  useEffect(() => {
    let active = true;
    if (application.posters)
      void application.posters.get(entry.id).then(
        (p) => {
          if (active) setPoster(p);
        },
        () => {
          if (active) setError("Não foi possível carregar o poster local.");
        },
      );
    return () => {
      active = false;
    };
  }, [application, entry.id]);
  useEffect(() => {
    if (!deleting) return;
    deletion.current?.showModal();
    const back = (event: Event) => {
      event.preventDefault();
      if (!lock.current) {
        deletion.current?.close();
        setDeleting(false);
        deleteButton.current?.focus();
      }
    };
    window.addEventListener("biblioteca-viva:native-back", back);
    return () =>
      window.removeEventListener("biblioteca-viva:native-back", back);
  }, [deleting]);
  const days = releaseDays(entry.catalog?.releaseDate, today);
  const format = entertainmentFormat(entry);
  async function save(input: Record<string, unknown>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (!application.commands.saveEntertainment)
        throw new Error("Acompanhamento indisponível.");
      const updated = await application.commands.saveEntertainment.execute({
        id: entry.id,
        expectedRevision: entry.revision,
        ...input,
      });
      onChange(updated);
      setDirty(false);
      setMessage("Acompanhamento salvo.");
    } catch (failure) {
      setError(
        failure instanceof ApplicationError && failure.code === "CONFLICT"
          ? "A obra mudou em outra tela. Reabra antes de salvar."
          : presentApplicationError(failure).message,
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function tracking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const number = (key: string) =>
      form.get(key) ? Number(form.get(key)) : undefined;
    const season = number("currentSeason");
    const completedSeasons = new Set(entry.catalog?.completedSeasons ?? []);
    if (season) {
      if (form.has("seasonComplete")) completedSeasons.add(season);
      else completedSeasons.delete(season);
    }
    await save({
      state:
        form.get("state") === watchState(entry) ? undefined : form.get("state"),
      catalog: {
        ...entry.catalog,
        rating: number("rating"),
        watchedOn: form.get("watchedOn") || undefined,
        completedSeasons: [...completedSeasons].sort((a, b) => a - b),
      },
      ...(entry.type === "series" && {
        episodesWatched: number("episodesWatched") ?? 0,
        currentSeason: season,
        currentEpisode: number("currentEpisode"),
      }),
    });
  }
  async function toggleFavorite() {
    if (
      lock.current ||
      (dirty && !window.confirm("Descartar as alterações de acompanhamento?"))
    )
      return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      onChange(
        await application.commands.organizeLibraryEntry.execute({
          id: entry.id,
          favorite: !entry.favorite,
        }),
      );
      setDirty(false);
      setMessage(entry.favorite ? "Favorito removido." : "Obra favorita.");
    } catch (failure) {
      setError(
        failure instanceof ApplicationError && failure.code === "CONFLICT"
          ? "A obra mudou em outra tela. Reabra antes de salvar."
          : presentApplicationError(failure).message,
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <article
      ref={root}
      className="cinema-folio"
      data-format={format}
      data-has-record-draft={dirty ? "true" : undefined}
      aria-labelledby="entry-title"
    >
      <nav className="cinema-navigation" aria-label="Navegação da obra">
        <Link className="text-link" to={returnPath}>
          {returnPath.startsWith("/arquivo")
            ? "Voltar ao Arquivo"
            : returnPath.startsWith("/colecao")
              ? "Voltar à Coleção"
              : "Voltar à Biblioteca"}
        </Link>
        <a className="text-link" href="#cinema-actions">
          Ações da obra ↓
        </a>
      </nav>
      <header className="cinema-hero">
        <div className="cinema-poster">
          {poster ? (
            <img
              src={poster.dataUrl}
              width={poster.width}
              height={poster.height}
              alt={`Poster de ${entry.title}`}
            />
          ) : (
            <div className="cinema-engraving" aria-hidden="true">
              <span>✧</span>
              <i />
              <i />
              <i />
            </div>
          )}
          <span className="cinema-poster-seal" aria-hidden="true">
            BV
          </span>
        </div>
        <div className="cinema-identity">
          <p className="cinema-kicker">
            Entretenimento · {formatLabels[format]}
          </p>
          <h2 id="entry-title">{entry.title}</h2>
          <p className="cinema-metadata">
            {[
              entry.type === "movie" ? entry.director : undefined,
              entry.type === "movie" ? entry.year : entry.catalog?.year,
              entry.catalog?.genre,
              entry.platform,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="cinema-state">{watchLabels[watchState(entry)]}</p>
          {days !== undefined && days >= 0 && (
            <div className="cinema-countdown" aria-label="Estreia">
              <strong>{days === 0 ? "Hoje" : days}</strong>
              <span>
                {days === 0
                  ? "é dia de estreia"
                  : days === 1
                    ? "dia para a estreia"
                    : "dias para a estreia"}
                <time dateTime={entry.catalog?.releaseDate}>
                  {entry.catalog?.releaseDate?.split("-").reverse().join("/")}
                </time>
              </span>
              <a
                className="text-link cinema-release-share"
                href="#cinema-sharing-title"
              >
                Compartilhar estreia
              </a>
            </div>
          )}
          <div className="cinema-personal">
            <button
              type="button"
              aria-pressed={entry.favorite}
              disabled={busy}
              onClick={() => void toggleFavorite()}
            >
              {" "}
              {entry.favorite ? "★ Favorito" : "☆ Favoritar"}
            </button>
            <button
              type="button"
              aria-pressed={isWishlisted(entry)}
              disabled={busy || dirty}
              onClick={() =>
                void save({
                  catalog: { ...entry.catalog, wishlist: !isWishlisted(entry) },
                })
              }
            >
              {isWishlisted(entry) ? "✓ Nos desejos" : "+ Lista de desejos"}
            </button>
          </div>
          {entry.catalog?.rating && (
            <p
              className="cinema-rating"
              aria-label={`Avaliação: ${entry.catalog.rating} de 5`}
            >
              {"★".repeat(entry.catalog.rating)}
              {"☆".repeat(5 - entry.catalog.rating)}
            </p>
          )}
        </div>
      </header>
      <p className="cinema-feedback" role="status">
        {message}
      </p>
      {error && <p role="alert">{error}</p>}
      <section
        className="cinema-chapter"
        aria-labelledby="cinema-tracking-title"
      >
        <div className="cinema-chapter-heading">
          <span aria-hidden="true">I</span>
          <h3 id="cinema-tracking-title">
            {entry.type === "series" ? "Onde a história parou" : "Sua sessão"}
          </h3>
        </div>
        {entry.type === "series" && (
          <div className="cinema-progress">
            <strong>
              {entry.episodesWatched}
              <small>
                {entry.totalEpisodes ? ` / ${entry.totalEpisodes}` : ""}{" "}
                episódios
              </small>
            </strong>
            {entry.totalEpisodes && (
              <>
                <span>
                  {Math.round(
                    (entry.episodesWatched / entry.totalEpisodes) * 100,
                  )}
                  %
                </span>
                <progress
                  aria-label="Progresso da obra"
                  max={entry.totalEpisodes}
                  value={entry.episodesWatched}
                />
              </>
            )}
            <p>
              {entry.catalog?.seasonCount
                ? `${entry.catalog.seasonCount} temporadas`
                : "Temporadas em aberto"}
              {Boolean(entry.catalog?.completedSeasons?.length) &&
                ` · Concluídas: ${entry.catalog?.completedSeasons?.join(", ")}`}
            </p>
          </div>
        )}
        <form
          key={entry.revision}
          onChange={() => setDirty(true)}
          onSubmit={(event) => void tracking(event)}
        >
          <fieldset className="cinema-form-fields" disabled={busy}>
            <details className="cinema-state-chooser">
              <summary>
                {watchLabels[watchState(entry)]} · Alterar estado
              </summary>
              <fieldset className="cinema-choices">
                <legend>Estado de acompanhamento</legend>
                {WATCH_STATES.map((state) => (
                  <label key={state}>
                    <input
                      type="radio"
                      name="state"
                      value={state}
                      defaultChecked={watchState(entry) === state}
                    />
                    {watchLabels[state]}
                  </label>
                ))}
              </fieldset>
            </details>
            {entry.type === "series" ? (
              <>
                <div className="cinema-field-grid">
                  <label className="form-field">
                    Temporada atual
                    <input
                      type="number"
                      name="currentSeason"
                      min="1"
                      max={entry.catalog?.seasonCount}
                      defaultValue={entry.currentSeason}
                    />
                  </label>
                  <label className="form-field">
                    Episódio atual
                    <input
                      type="number"
                      name="currentEpisode"
                      min="1"
                      defaultValue={entry.currentEpisode}
                    />
                  </label>
                  <label className="form-field">
                    Episódios assistidos
                    <input
                      type="number"
                      name="episodesWatched"
                      min="0"
                      max={entry.totalEpisodes}
                      defaultValue={entry.episodesWatched}
                      required
                    />
                  </label>
                </div>
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    name="seasonComplete"
                    defaultChecked={
                      entry.currentSeason
                        ? entry.catalog?.completedSeasons?.includes(
                            entry.currentSeason,
                          )
                        : false
                    }
                  />
                  Temporada atual concluída
                </label>
              </>
            ) : (
              <>
                <p className="cinema-viewed">
                  {entry.status === "completed"
                    ? "✓ Assistido"
                    : "Ainda por assistir"}
                  {entry.durationMinutes
                    ? ` · ${entry.durationMinutes} min`
                    : ""}
                </p>
                <label className="form-field">
                  Data em que assistiu
                  <BVDatePicker
                    name="watchedOn"
                    defaultValue={entry.catalog?.watchedOn}
                  />
                </label>
              </>
            )}
            <label className="form-field">
              Avaliação (1–5)
              <input
                type="number"
                name="rating"
                min="1"
                max="5"
                defaultValue={entry.catalog?.rating}
              />
            </label>
            <button
              type="submit"
              className="button button--primary"
              disabled={busy}
            >
              Salvar acompanhamento
            </button>
          </fieldset>
        </form>
        <details className="cinema-secondary">
          <summary>
            Histórico de{" "}
            {entry.type === "movie" ? "visualizações" : "acompanhamento"}
          </summary>
          <SessionPanel
            application={application}
            entry={entry}
            onChanged={refresh}
          />
        </details>
      </section>
      <RecordMemories
        folio
        application={application}
        entry={entry}
        initialNotes={notes}
        initialQuotes={quotes}
      />
      <section
        className="cinema-chapter"
        aria-labelledby="cinema-sharing-title"
      >
        <div className="cinema-chapter-heading">
          <span aria-hidden="true">III</span>
          <h3 id="cinema-sharing-title">Em cartaz no seu mundo</h3>
        </div>
        <CinemaComposer
          entry={entry}
          poster={poster}
          files={application.imageFiles}
          today={today}
        />
      </section>
      <details className="cinema-secondary">
        <summary>Organização e etiquetas</summary>
        <OrganizationPanel
          application={application}
          entry={entry}
          onChange={onChange}
        />
      </details>
      <details id="cinema-actions" className="cinema-secondary">
        <summary>Ações da obra</summary>
        <Link
          className="button button--secondary"
          to={`/registros/${encodeURIComponent(entry.id)}/editar?from=${encodeURIComponent(returnPath)}`}
        >
          Editar obra
        </Link>
        <RecordCoverEditor
          key={entry.id}
          entryId={entry.id}
          images={application.posters}
          cover={poster}
          onSaved={setPoster}
        />
        <p className="cinema-dates">
          Atualizado em {new Date(entry.updatedAt).toLocaleDateString("pt-BR")}
        </p>
        <button
          ref={deleteButton}
          className="button cinema-danger"
          type="button"
          onClick={() => setDeleting(true)}
        >
          Excluir obra
        </button>
      </details>
      {deleting && (
        <dialog
          className="cinema-confirmation"
          ref={deletion}
          aria-labelledby="cinema-delete-title"
          onCancel={(event) => {
            event.preventDefault();
            if (!busy) {
              setDeleting(false);
              deleteButton.current?.focus();
            }
          }}
        >
          <h2 id="cinema-delete-title">Excluir “{entry.title}”?</h2>
          <p>
            A obra, poster, notas, citações e sessões serão removidos
            permanentemente.
          </p>
          <div className="form-actions">
            <button
              className="button button--secondary"
              disabled={busy}
              type="button"
              onClick={() => {
                setDeleting(false);
                deleteButton.current?.focus();
              }}
            >
              Cancelar
            </button>
            <button
              className="button cinema-danger"
              disabled={busy}
              type="button"
              onClick={() => {
                void (async () => {
                  if (lock.current) return;
                  lock.current = true;
                  setBusy(true);
                  try {
                    await application.commands.deleteLibraryEntry.execute({
                      id: entry.id,
                    });
                    setDirty(false);
                    void navigate("/colecao");
                  } catch (failure) {
                    setError(
                      failure instanceof ApplicationError &&
                        failure.code === "CONFLICT"
                        ? "A obra mudou em outra tela. Reabra antes de salvar."
                        : presentApplicationError(failure).message,
                    );
                    setDeleting(false);
                  } finally {
                    lock.current = false;
                    setBusy(false);
                  }
                })();
              }}
            >
              Excluir permanentemente
            </button>
          </div>
        </dialog>
      )}
    </article>
  );
}
