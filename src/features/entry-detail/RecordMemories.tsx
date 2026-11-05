import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { LibraryEntry, Note, Quote } from "../../domain";
import { AnnotationActions } from "../annotations/AnnotationActions";
import type { BookDetailApplication } from "./BookDetailPage";
import { presentApplicationError } from "../entry-editor/errorMessages";
import { entryExperience } from "./entryExperience";

function MemoryTools({
  folded,
  children,
}: {
  readonly folded: boolean;
  readonly children: ReactNode;
}) {
  return folded ? (
    <details className="cinema-annotation-tools">
      <summary>Opções da anotação</summary>
      {children}
    </details>
  ) : (
    <>{children}</>
  );
}

export function RecordMemories({
  application,
  entry,
  initialNotes,
  initialQuotes,
  folio = false,
  onNotesChange,
}: {
  readonly folio?: boolean;
  readonly onNotesChange?: (notes: readonly Note[]) => void;
  readonly application: BookDetailApplication;
  readonly entry: LibraryEntry;
  readonly initialNotes: readonly Note[];
  readonly initialQuotes: readonly Quote[];
}) {
  const [notes, setNotes] = useState(initialNotes),
    [quotes, setQuotes] = useState(initialQuotes);
  useEffect(() => {
    onNotesChange?.(notes);
  }, [notes, onNotesChange]);
  const [error, setError] = useState<string>(),
    [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState({ note: "", quote: "" });
  const [kind, setKind] = useState<"note" | "quote">("note");
  const copy = entryExperience[entry.type];
  const allowsQuotes =
    entry.type === "movie" || entry.type === "series" || entry.type === "study";
  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const element = event.currentTarget,
      form = new FormData(element);
    setBusy(true);
    setError(undefined);
    try {
      if (kind === "note")
        setNotes([
          ...notes,
          await application.commands.addNote.execute({
            entryId: entry.id,
            content: form.get("content"),
          }),
        ]);
      else {
        const season = form.get("season"),
          episode = form.get("episode"),
          minute = form.get("minute");
        const location =
          entry.type === "series" && season && episode
            ? {
                type: "series",
                season: Number(season),
                episode: Number(episode),
                ...(minute ? { minute: Number(minute) } : {}),
              }
            : entry.type === "movie" && minute
              ? { type: "movie", minute: Number(minute) }
              : undefined;
        setQuotes([
          ...quotes,
          await application.commands.addQuote.execute({
            entryId: entry.id,
            content: form.get("content"),
            ...(location && { location }),
          }),
        ]);
      }
      element.reset();
      setDrafts((current) => ({ ...current, [kind]: "" }));
    } catch (failure: unknown) {
      setError(presentApplicationError(failure).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className={
        folio ? "study-chapter study-notebook" : "content-card memory-chapter"
      }
      data-has-study-draft={
        folio && Boolean(drafts.note.trim() || drafts.quote.trim())
          ? "true"
          : undefined
      }
      aria-labelledby="memory-title"
    >
      <p
        hidden={entry.type === "movie" || entry.type === "series"}
        className={folio ? "study-kicker" : "eyebrow"}
      >
        {folio ? "III · Ideias que merecem ficar" : "Memórias"}
      </p>
      <h3 id="memory-title">
        {entry.type === "movie" || entry.type === "series"
          ? "Diário da obra"
          : copy.memory}
      </h3>
      {entry.type !== "movie" && entry.type !== "series" && (
        <p>{copy.invitation}</p>
      )}
      <div className="memory-tabs" aria-label="Tipo de anotação">
        <button
          type="button"
          aria-pressed={kind === "note"}
          onClick={() => setKind("note")}
        >
          Notas
        </button>
        {allowsQuotes && (
          <button
            type="button"
            aria-pressed={kind === "quote"}
            onClick={() => setKind("quote")}
          >
            Citações
          </button>
        )}
      </div>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={(event) => void add(event)}>
        <label className="form-field">
          {kind === "note" ? "Nova nota" : "Nova citação"}
          <textarea
            name="content"
            rows={folio ? 6 : 3}
            required
            value={drafts[kind]}
            onChange={(event) =>
              setDrafts({ ...drafts, [kind]: event.target.value })
            }
          />
        </label>
        {kind === "quote" && entry.type === "series" && (
          <div className="ritual-pair">
            <label className="form-field">
              Temporada da citação
              <input name="season" type="number" min="1" required />
            </label>
            <label className="form-field">
              Episódio da citação
              <input name="episode" type="number" min="1" required />
            </label>
          </div>
        )}
        {kind === "quote" &&
          (entry.type === "movie" || entry.type === "series") && (
            <label className="form-field">
              Minuto da cena (opcional)
              <input name="minute" type="number" min="0" />
            </label>
          )}
        <button
          type="submit"
          className="button button--primary"
          disabled={busy}
        >
          {kind === "note" ? "Adicionar nota" : "Adicionar citação"}
        </button>
      </form>
      <ul className="annotation-list">
        {(kind === "note" ? notes : quotes).map((annotation) => (
          <li key={annotation.id}>
            <p>{annotation.content}</p>
            <small>
              {new Date(annotation.createdAt).toLocaleDateString("pt-BR")}
              {annotation.location?.type === "series"
                ? ` · T${annotation.location.season} E${annotation.location.episode}${annotation.location.minute !== undefined ? ` · ${annotation.location.minute} min` : ""}`
                : annotation.location?.type === "movie"
                  ? ` · ${annotation.location.minute} min`
                  : ""}
            </small>
            <MemoryTools
              folded={entry.type === "movie" || entry.type === "series"}
            >
              <AnnotationActions
                kind={kind}
                showPageField={false}
                annotation={annotation}
                onDelete={async (id) => {
                  if (kind === "note") {
                    await application.commands.deleteNote.execute({ id });
                    setNotes(notes.filter((note) => note.id !== id));
                  } else {
                    await application.commands.deleteQuote.execute({ id });
                    setQuotes(quotes.filter((quote) => quote.id !== id));
                  }
                }}
                onShare={(id) =>
                  kind === "note"
                    ? application.commands.shareNote.execute({ id })
                    : application.commands.shareQuote.execute({ id })
                }
                onUpdate={async (input) => {
                  if (typeof input !== "object" || input === null) return;
                  if (kind === "note") {
                    const updated =
                      await application.commands.updateNote.execute(input);
                    setNotes(
                      notes.map((note) =>
                        note.id === updated.id ? updated : note,
                      ),
                    );
                  } else {
                    const updated =
                      await application.commands.updateQuote.execute({
                        ...input,
                        location: annotation.location,
                      });
                    setQuotes(
                      quotes.map((quote) =>
                        quote.id === updated.id ? updated : quote,
                      ),
                    );
                  }
                }}
              />
            </MemoryTools>
          </li>
        ))}
      </ul>
      {(kind === "note" ? notes : quotes).length === 0 && (
        <p className="field-help">
          {kind === "note"
            ? "Seu caderno ainda está em branco."
            : "Uma fala pode merecer ficar por aqui."}
        </p>
      )}
    </section>
  );
}
