import { ArtifactGlyph } from "../../app/ArtifactGlyph";
import { exercisesFromForm } from "./exercisesFromForm";
import { RitualFields } from "./RitualFields";
import { ritualCopy } from "./ritualCopy";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { ENTRY_TYPES, type EntryType, type LibraryEntry } from "../../domain";
import { entryTypeLabels } from "../collection/collectionControls";
import { presentApplicationError } from "./errorMessages";
import { NewBookPage, type EditorApplication } from "./EntryEditorPages";

interface NewEntryApplication extends EditorApplication {
  readonly commands: EditorApplication["commands"] & {
    readonly createLibraryEntry: {
      execute(input: unknown): Promise<LibraryEntry>;
    };
  };
}

const descriptions: Readonly<Record<EntryType, string>> = {
  book: "Acompanhe páginas, notas e citações.",
  movie: "Guarde filmes vistos ou que deseja assistir.",
  series: "Acompanhe episódios e onde parou.",
  study: "Registre uma área, disciplina ou percurso de estudo.",
  physical_activity: "Registre uma prática ao longo do tempo.",
  work: "Acompanhe um projeto ou atividade profissional.",
};

function field(form: FormData, name: string): string | undefined {
  const value = form.get(name);
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized === "" ? undefined : normalized;
}

function positiveInteger(form: FormData, name: string): number | undefined {
  const value = field(form, name);
  return value === undefined ? undefined : Number(value);
}

function specificInput(type: Exclude<EntryType, "book">, form: FormData) {
  const title = field(form, "title") ?? "";
  switch (type) {
    case "movie":
      return {
        type,
        title,
        director: field(form, "director"),
        year: positiveInteger(form, "year"),
        durationMinutes: positiveInteger(form, "durationMinutes"),
        platform: field(form, "platform"),
      };
    case "series":
      return {
        type,
        title,
        platform: field(form, "platform"),
        totalEpisodes: positiveInteger(form, "totalEpisodes"),
        episodesWatched: positiveInteger(form, "episodesWatched"),
        currentSeason: positiveInteger(form, "currentSeason"),
        currentEpisode: positiveInteger(form, "currentEpisode"),
      };
    case "study": {
      const progressUnit = field(form, "progressUnit") ?? "sessions";
      const total = positiveInteger(form, "progressTotal");
      return {
        type,
        title,
        area: field(form, "area"),
        discipline: field(form, "discipline"),
        objective: field(form, "objective"),
        progressUnit,
        progressTotal:
          progressUnit === "hours" && total !== undefined ? total * 60 : total,
        deadline: field(form, "deadline")
          ? `${field(form, "deadline")}T00:00:00.000Z`
          : undefined,
      };
    }
    case "physical_activity":
      return {
        type,
        title,
        category: field(form, "category") ?? "other",
        modality: field(form, "modality"),
        objective: field(form, "objective"),
        exercises: exercisesFromForm(form),
      };
    case "work":
      return {
        type,
        title,
        area: field(form, "area"),
        organization: field(form, "organization"),
        description: field(form, "description"),
        deadline: field(form, "deadline")
          ? `${field(form, "deadline")}T00:00:00.000Z`
          : undefined,
        nextAction: field(form, "nextAction"),
      };
  }
}

export function NewEntryPage({
  application,
}: {
  readonly application?: NewEntryApplication;
}) {
  const [selectedType, setSelectedType] = useState<EntryType>();
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (!application)
    return (
      <section className="content-card" role="alert">
        <h2>Formulário indisponível</h2>
        <p>Não foi possível iniciar o armazenamento local.</p>
      </section>
    );
  if (selectedType === "book")
    return (
      <>
        <NewBookPage application={application} />
        <button
          className="button button--secondary"
          type="button"
          onClick={() => {
            setError(undefined);
            setSelectedType(undefined);
          }}
        >
          Escolher outro tipo
        </button>
      </>
    );
  if (!selectedType)
    return (
      <section aria-labelledby="entry-type-title">
        <div className="register-threshold">
          <span aria-hidden="true" className="register-threshold__sigil">
            ✦
          </span>
          <div>
            <p className="eyebrow">O portal dos registros</p>
            <h2 id="entry-type-title">Uma nova história encontra lugar</h2>
            <p>
              Escolha o que deseja guardar. Cada registro abre uma página
              diferente do seu mundo.
            </p>
          </div>
        </div>
        <ul className="type-picker">
          {ENTRY_TYPES.map((type, index) => (
            <li key={type}>
              <button
                className="content-card type-picker__option"
                data-craft={type}
                type="button"
                onClick={() => {
                  setError(undefined);
                  setSelectedType(type);
                }}
              >
                <span className="type-picker__sigil" aria-hidden="true">
                  <ArtifactGlyph type={type} />
                </span>
                <span className="type-picker__copy">
                  <small>FÓLIO {String(index + 1).padStart(2, "0")}</small>
                  <strong>{entryTypeLabels[type]}</strong>
                  <span>{descriptions[type]}</span>
                </span>
                <span className="type-picker__invitation" aria-hidden="true">
                  ↗
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!application || !selectedType || selectedType === "book" || submitting)
      return;
    setError(undefined);
    setSubmitting(true);
    try {
      const entry = await application.commands.createLibraryEntry.execute(
        specificInput(selectedType, new FormData(event.currentTarget)),
      );
      void navigate(`/registros/${encodeURIComponent(entry.id)}`);
    } catch (failure: unknown) {
      setError(presentApplicationError(failure).message);
      setSubmitting(false);
    }
  }

  return (
    <section
      className="ritual-editor"
      data-craft={selectedType}
      aria-labelledby="new-entry-title"
    >
      <p className="eyebrow">{entryTypeLabels[selectedType]}</p>
      <h2 id="new-entry-title">{ritualCopy[selectedType].title}</h2>
      <p>{ritualCopy[selectedType].invitation}</p>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={(event) => void submit(event)}>
        <RitualFields key={selectedType} type={selectedType} />
        <div className="form-actions">
          <button
            className="button button--primary"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Salvando…" : "Salvar registro"}
          </button>
          <button
            className="button button--secondary"
            type="button"
            disabled={submitting}
            onClick={() => {
              setError(undefined);
              setSelectedType(undefined);
            }}
          >
            Escolher outro tipo
          </button>
        </div>
      </form>
    </section>
  );
}
