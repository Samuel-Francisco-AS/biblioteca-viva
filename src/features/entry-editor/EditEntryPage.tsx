import {
  EntertainmentEditor,
  type EntertainmentEditorApplication,
} from "../entertainment/EntertainmentEditor";
import { scheduleFromForm, workoutFormError } from "./workoutFormModel";
import { exercisesFromForm } from "./exercisesFromForm";
import { RitualFields } from "./RitualFields";
import { ritualCopy } from "./ritualCopy";
import { useEffect, useState, type FormEvent } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import type { LibraryEntry } from "../../domain";
import { safeReturnPath } from "../books/navigationOrigin";
import { entryTypeLabels } from "../collection/collectionControls";
import { EditBookPage, type EditorApplication } from "./EntryEditorPages";
import { presentApplicationError } from "./errorMessages";

interface EditEntryApplication extends EditorApplication {
  readonly posters?: EntertainmentEditorApplication["posters"];
  readonly commands: EditorApplication["commands"] & {
    readonly updateLibraryEntry: {
      execute(input: unknown): Promise<LibraryEntry>;
    };
  };
  readonly queries: EditorApplication["queries"] & {
    readonly getLibraryEntry: {
      execute(input: unknown): Promise<LibraryEntry>;
    };
  };
}

function value(form: FormData, name: string): string | undefined {
  const item = form.get(name);
  if (typeof item !== "string") return undefined;
  const normalized = item.trim();
  return normalized === "" ? undefined : normalized;
}

function numeric(form: FormData, name: string): number | undefined {
  const item = value(form, name);
  return item === undefined ? undefined : Number(item);
}

function deadlineFromForm(
  form: FormData,
  previous: string | undefined,
): string | undefined {
  const selected = value(form, "deadline");
  if (selected === previous?.slice(0, 10)) return previous;
  return selected ? `${selected}T00:00:00.000Z` : undefined;
}

function updateInput(
  entry: Exclude<LibraryEntry, { readonly type: "book" }>,
  form: FormData,
) {
  const common = {
    id: entry.id,
    type: entry.type,
    title: value(form, "title") ?? "",
  };
  switch (entry.type) {
    case "movie":
      return {
        ...common,
        director: value(form, "director"),
        year: numeric(form, "year"),
        durationMinutes: numeric(form, "durationMinutes"),
        platform: value(form, "platform"),
      };
    case "series":
      return {
        ...common,
        platform: value(form, "platform"),
        totalEpisodes: numeric(form, "totalEpisodes"),
      };
    case "study":
      return {
        ...common,
        area: value(form, "area"),
        discipline: value(form, "discipline"),
        objective: value(form, "objective"),
        progressUnit: entry.progressUnit,
        progressTotal:
          entry.progressUnit === "hours" &&
          numeric(form, "progressTotal") !== undefined
            ? numeric(form, "progressTotal") ===
              (entry.progressTotal === undefined
                ? undefined
                : entry.progressTotal / 60)
              ? entry.progressTotal
              : Number(numeric(form, "progressTotal")) * 60
            : numeric(form, "progressTotal"),
        deadline: deadlineFromForm(form, entry.deadline),
      };
    case "physical_activity":
      return {
        ...common,
        category: value(form, "category") ?? entry.category,
        exercises: exercisesFromForm(form),
        schedule: scheduleFromForm(form),
        modality: value(form, "modality"),
        objective: value(form, "objective"),
      };
    case "work":
      return {
        ...common,
        area: value(form, "area"),
        organization: value(form, "organization"),
        description: value(form, "description"),
        deadline: deadlineFromForm(form, entry.deadline),
        nextAction: value(form, "nextAction"),
      };
  }
}

export function EditEntryPage({
  application,
}: {
  readonly application?: EditEntryApplication;
}) {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const returnPath = safeReturnPath(params.get("from"));
  const navigate = useNavigate();
  const [entry, setEntry] = useState<LibraryEntry>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!application) return;
    let active = true;
    void application.queries.getLibraryEntry.execute({ id }).then(
      (loaded) => active && setEntry(loaded),
      (failure: unknown) =>
        active && setError(presentApplicationError(failure).message),
    );
    return () => {
      active = false;
    };
  }, [application, id]);
  if (!application)
    return (
      <section className="content-card" role="alert">
        <h2>Edição indisponível</h2>
      </section>
    );
  if (error && !entry)
    return (
      <section className="content-card" role="alert">
        <h2>Não foi possível abrir o registro</h2>
        <p>{error}</p>
        <Link to={returnPath}>Voltar</Link>
      </section>
    );
  if (!entry) return <p role="status">Carregando registro…</p>;
  if (entry.type === "book") return <EditBookPage application={application} />;
  if (entry.type === "movie" || entry.type === "series")
    return (
      <EntertainmentEditor
        application={application}
        entry={entry}
        returnPath={returnPath}
        onCancel={() =>
          void navigate(
            `/registros/${encodeURIComponent(id)}?from=${encodeURIComponent(returnPath)}`,
          )
        }
      />
    );
  const current = entry;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(undefined);
    try {
      const updated = await application?.commands.updateLibraryEntry.execute(
        updateInput(current, new FormData(event.currentTarget)),
      );
      if (updated)
        void navigate(
          `/registros/${encodeURIComponent(updated.id)}?from=${encodeURIComponent(returnPath)}`,
        );
    } catch (failure: unknown) {
      setError(workoutFormError(failure));
      setBusy(false);
    }
  }
  return (
    <section
      className="ritual-editor"
      data-craft={current.type}
      aria-labelledby="edit-entry-title"
    >
      <p className="eyebrow">{entryTypeLabels[current.type]}</p>
      <h2 id="edit-entry-title">Editar registro</h2>
      <p>{ritualCopy[current.type].title}</p>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={(event) => void submit(event)}>
        <RitualFields type={current.type} entry={current} />
        <div className="form-actions">
          <button
            className="button button--primary"
            disabled={busy}
            type="submit"
          >
            {busy ? "Salvando…" : "Salvar"}
          </button>
          <Link
            className="button button--secondary"
            to={`/registros/${encodeURIComponent(id)}?from=${encodeURIComponent(returnPath)}`}
          >
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}
