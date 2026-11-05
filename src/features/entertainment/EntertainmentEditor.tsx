import { StarRating } from "../../ui/StarRating";
import { BVDatePicker } from "../../ui/BVPicker";
import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { LibraryEntry } from "../../domain";
import {
  ENTERTAINMENT_FORMATS,
  formatLabels,
  entertainmentFormat,
  catalogForWatch,
  statusForWatch,
  WATCH_STATES,
  watchLabels,
  type EntertainmentEntry,
  type WatchState,
} from "../../domain/entertainment";
import type { PosterPort } from "../../application/media";
import { importLocalImage } from "../../infrastructure/files/localImage";
import { useStudyDraftGuard } from "../entry-detail/useStudyDraftGuard";
import { presentApplicationError } from "../entry-editor/errorMessages";
import "./entertainment.css";
export interface EntertainmentEditorApplication {
  readonly posters?: PosterPort;
  readonly commands: {
    readonly createLibraryEntry?: {
      execute(input: unknown): Promise<LibraryEntry>;
    };
    readonly updateLibraryEntry?: {
      execute(input: unknown): Promise<LibraryEntry>;
    };
  };
}
export function EntertainmentEditor({
  application,
  entry,
  returnPath = "/colecao",
  onCancel,
}: {
  readonly application: EntertainmentEditorApplication;
  readonly entry?: EntertainmentEntry;
  readonly returnPath?: string;
  readonly onCancel: () => void;
}) {
  const navigate = useNavigate();
  const root = useRef<HTMLElement>(null);
  const [format, setFormat] = useState(
    entry ? entertainmentFormat(entry) : undefined,
  );
  const [structure, setStructure] = useState<"movie" | "series" | undefined>(
    entry?.type,
  );
  const [state, setState] = useState<WatchState>("wishlist");
  const [dirty, setDirty] = useState(false);
  const [fieldsTouched, setFieldsTouched] = useState(false);
  const [poster, setPoster] =
    useState<Awaited<ReturnType<typeof importLocalImage>>>();
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState("");
  const [partial, setPartial] = useState<LibraryEntry>();
  useStudyDraftGuard(
    root,
    "Há alterações não salvas nesta obra. Sair e descartar o rascunho?",
  );
  const detailUrl = (id: string) =>
    `/registros/${encodeURIComponent(id)}?from=${encodeURIComponent(returnPath)}`;
  const episodic = structure === "series";
  function field(
    name: string,
    label: string,
    value?: string | number,
    type = "text",
    required = false,
    min = 1,
  ) {
    const Field = type === "date" ? BVDatePicker : "input";
    return (
      <label className="form-field">
        {label}
        <Field
          name={name}
          defaultValue={value}
          type={type}
          required={required}
          min={type === "number" ? min : undefined}
          max={
            type === "number"
              ? name === "rating"
                ? 5
                : name === "year"
                  ? 9999
                  : name === "seasonCount"
                    ? 10000
                    : undefined
              : undefined
          }
          step={type === "number" ? 1 : undefined}
          inputMode={type === "number" ? "numeric" : undefined}
          maxLength={
            type === "text" ? (name === "title" ? 300 : 160) : undefined
          }
        />
      </label>
    );
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!structure || !format || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const text = (key: string) => {
      const value = data.get(key);
      return typeof value === "string" ? value.trim() || undefined : undefined;
    };
    const number = (key: string) =>
      text(key) === undefined ? undefined : Number(text(key));
    try {
      const catalog = {
        ...entry?.catalog,
        format,
        genre: text("genre"),
        year: number("year"),
        releaseDate: text("releaseDate"),
        watchedOn: text("watchedOn"),
        rating: number("rating"),
        seasonCount: number("seasonCount"),
        wishlist: data.has("wishlist"),
      };
      const common = {
        type: structure,
        title: text("title") ?? "",
        platform: text("platform"),
        catalog: entry ? catalog : catalogForWatch(catalog, state),
      };
      const input =
        structure === "movie"
          ? {
              ...common,
              director: text("director"),
              year: number("year"),
              durationMinutes: number("durationMinutes"),
            }
          : {
              ...common,
              totalEpisodes: number("totalEpisodes"),
              ...(!entry && {
                episodesWatched: number("episodesWatched"),
                currentSeason: number("currentSeason"),
                currentEpisode: number("currentEpisode"),
              }),
            };
      const saved = entry
        ? await application.commands.updateLibraryEntry?.execute({
            ...input,
            id: entry.id,
          })
        : (partial ??
          (await application.commands.createLibraryEntry?.execute({
            ...input,
            status: statusForWatch(state),
            favorite: data.has("favorite"),
          })));
      if (!saved) throw new Error("Cadastro indisponível.");
      if (!entry) setPartial(saved);
      if (poster) {
        if (!application.posters) throw new Error("Poster indisponível.");
        await application.posters.save({ ...poster, entryId: saved.id });
      }
      setDirty(false);
      void navigate(detailUrl(saved.id));
    } catch (failure) {
      setError(
        partial
          ? "A obra foi salva. Não foi possível salvar o poster; tente novamente ou abra a obra."
          : presentApplicationError(failure).message,
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section
      ref={root}
      className="cinema-editor"
      data-has-record-draft={dirty ? "true" : undefined}
      aria-labelledby="cinema-editor-title"
    >
      <p className="cinema-kicker">Acervo de imagens & histórias</p>
      <h2 id="cinema-editor-title">
        {entry ? "Editar obra" : "Entretenimento"}
      </h2>
      <div
        className="cinema-format-grid"
        role="group"
        aria-label="Formato da obra"
      >
        {ENTERTAINMENT_FORMATS.map((item, index) => (
          <button
            type="button"
            key={item}
            aria-pressed={format === item}
            disabled={
              Boolean(partial) ||
              busy ||
              Boolean(
                entry &&
                ((item === "film" && entry.type === "series") ||
                  (item === "series" && entry.type === "movie")),
              )
            }
            onClick={() => {
              if (format === item) return;
              const nextStructure =
                entry?.type ??
                (item === "film"
                  ? "movie"
                  : item === "series"
                    ? "series"
                    : undefined);
              if (!entry && fieldsTouched && nextStructure !== structure) {
                if (
                  !window.confirm(
                    "Trocar a estrutura descarta os campos deste rascunho. Continuar?",
                  )
                )
                  return;
                setFieldsTouched(false);
                setPoster(undefined);
              }
              setFormat(item);
              setDirty(true);
              setStructure(nextStructure);
            }}
          >
            <span aria-hidden="true">{["◈", "▥", "✧", "✺"][index]}</span>
            <strong>{formatLabels[item]}</strong>
            <small>
              {
                [
                  "Uma sessão, um universo",
                  "Histórias em capítulos",
                  "Além do imaginável",
                  "Mundos desenhados",
                ][index]
              }
            </small>
          </button>
        ))}
      </div>
      {(format === "anime" || format === "animation") && (
        <fieldset className="cinema-choices">
          <legend>Estrutura da obra</legend>
          {(["movie", "series"] as const).map((type) => (
            <label key={type}>
              <input
                type="radio"
                name="structure"
                checked={structure === type}
                disabled={Boolean(entry) || Boolean(partial)}
                onChange={() => {
                  if (fieldsTouched && structure !== type) {
                    if (
                      !window.confirm(
                        "Trocar a estrutura descarta os campos deste rascunho. Continuar?",
                      )
                    )
                      return;
                    setFieldsTouched(false);
                    setPoster(undefined);
                  }
                  setStructure(type);
                  setDirty(true);
                }}
              />
              {type === "movie" ? "Obra unitária" : "Obra episódica"}
            </label>
          ))}
        </fieldset>
      )}
      {error && (
        <p role="alert">
          {partial
            ? "Obra salva; o poster não pôde ser gravado. Tente novamente ou abra a obra."
            : error}
        </p>
      )}
      {partial && (
        <Link
          className="text-link"
          to={detailUrl(partial.id)}
          onClick={() => setDirty(false)}
        >
          Abrir obra salva
        </Link>
      )}
      {!structure && (
        <button
          type="button"
          className="button button--secondary"
          onClick={() => {
            setDirty(false);
            onCancel();
          }}
        >
          Escolher outro grupo
        </button>
      )}
      {structure && (
        <form
          key={structure}
          onChange={() => {
            setDirty(true);
            setFieldsTouched(true);
          }}
          onSubmit={(event) => void submit(event)}
        >
          <fieldset
            disabled={busy || Boolean(partial)}
            className="cinema-form-fields"
          >
            {field("title", "Título", entry?.title, "text", true)}
            {!entry && (
              <fieldset className="cinema-choices">
                <legend>Acompanhamento</legend>
                {WATCH_STATES.map((item) => (
                  <label key={item}>
                    <input
                      type="radio"
                      name="watchState"
                      checked={state === item}
                      onChange={() => setState(item)}
                    />
                    {watchLabels[item]}
                  </label>
                ))}
              </fieldset>
            )}
            <div className="cinema-field-grid">
              {field("platform", "Plataforma / serviço", entry?.platform)}
              {field(
                "year",
                "Ano",
                entry?.type === "movie" ? entry.year : entry?.catalog?.year,
                "number",
              )}
              {field("genre", "Gênero", entry?.catalog?.genre)}
              {field(
                "releaseDate",
                "Data de estreia",
                entry?.catalog?.releaseDate,
                "date",
              )}
            </div>
            {episodic ? (
              <div className="cinema-field-grid">
                {field(
                  "seasonCount",
                  "Quantidade de temporadas",
                  entry?.catalog?.seasonCount,
                  "number",
                )}
                {field(
                  "totalEpisodes",
                  "Total de episódios",
                  entry?.type === "series" ? entry.totalEpisodes : undefined,
                  "number",
                )}
                {!entry && (
                  <>
                    {field(
                      "episodesWatched",
                      "Episódios assistidos",
                      0,
                      "number",
                      false,
                      0,
                    )}
                    {field(
                      "currentSeason",
                      "Temporada atual",
                      undefined,
                      "number",
                    )}
                    {field(
                      "currentEpisode",
                      "Episódio atual",
                      undefined,
                      "number",
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="cinema-field-grid">
                {field(
                  "director",
                  "Diretor / criador",
                  entry?.type === "movie" ? entry.director : undefined,
                )}
                {field(
                  "durationMinutes",
                  "Duração em minutos",
                  entry?.type === "movie" ? entry.durationMinutes : undefined,
                  "number",
                )}
                {field(
                  "watchedOn",
                  "Data em que assistiu",
                  entry?.catalog?.watchedOn,
                  "date",
                )}
              </div>
            )}
            <StarRating
              name="rating"
              defaultValue={entry?.catalog?.rating}
              onTouched={() => {
                setDirty(true);
                setFieldsTouched(true);
              }}
            />
            <div className="cinema-choices">
              <label>
                <input
                  name="wishlist"
                  type="checkbox"
                  defaultChecked={
                    entry
                      ? (entry.catalog?.wishlist ?? entry.status === "planned")
                      : true
                  }
                />
                Lista de desejos
              </label>
              {!entry && (
                <label>
                  <input name="favorite" type="checkbox" />
                  Favorito
                </label>
              )}
            </div>
          </fieldset>
          <label className="form-field">
            Poster personalizado
            <input
              type="file"
              accept="image/jpeg,image/png"
              disabled={busy}
              onChange={(event) => {
                void (async () => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  setBusy(true);
                  try {
                    setPoster(await importLocalImage(file));
                    setDirty(true);
                    setError("");
                  } catch (failure) {
                    setError(
                      failure instanceof Error
                        ? failure.message
                        : "Imagem indisponível.",
                    );
                  } finally {
                    setBusy(false);
                  }
                })();
              }}
            />
          </label>
          {poster && (
            <div className="cinema-poster-choice">
              <img src={poster.dataUrl} alt="Poster selecionado" />
              <button
                type="button"
                className="text-button"
                onClick={() => setPoster(undefined)}
              >
                Descartar imagem
              </button>
            </div>
          )}
          <div className="form-actions">
            <button
              type="submit"
              className="button button--primary"
              disabled={busy}
            >
              {busy
                ? "Salvando…"
                : partial
                  ? "Tentar salvar poster"
                  : entry
                    ? "Salvar alterações"
                    : "Salvar obra"}
            </button>
            <button
              type="button"
              className="button button--secondary"
              disabled={busy}
              onClick={() => {
                if (
                  !dirty ||
                  window.confirm("Descartar o rascunho desta obra?")
                )
                  onCancel();
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
