import type { LibraryEntry } from "../../domain";
import { activityLabels, studyUnitLabels } from "./entryExperience";

export function EntryPortrait({
  entry,
}: {
  readonly entry: Exclude<LibraryEntry, { readonly type: "book" }>;
}) {
  switch (entry.type) {
    case "movie":
      return (
        <div className="record-portrait record-portrait--cinema">
          {(entry.director || entry.year) && (
            <p className="record-credit">
              {[
                entry.director ? `Direção de ${entry.director}` : undefined,
                entry.year,
              ]
                .filter((value) => value !== undefined)
                .join(" · ")}
            </p>
          )}
          <dl className="record-facts">
            {entry.durationMinutes !== undefined && (
              <div>
                <dt>Duração da obra</dt>
                <dd>{entry.durationMinutes} min</dd>
              </div>
            )}
            {entry.platform && (
              <div>
                <dt>Onde assistir</dt>
                <dd>{entry.platform}</dd>
              </div>
            )}
          </dl>
          <p className="field-help">
            Uma primeira exibição ou a vontade de rever. Guarde o dia e o que
            ficou depois dos créditos.
          </p>
        </div>
      );
    case "series":
      return (
        <div className="record-portrait record-portrait--serial">
          <p className="journey-tally">
            {entry.totalEpisodes === undefined
              ? `${entry.episodesWatched} episódios assistidos`
              : `${entry.episodesWatched} de ${entry.totalEpisodes} episódios`}
          </p>
          {(entry.currentSeason !== undefined ||
            entry.currentEpisode !== undefined) && (
            <p className="episode-bookmark">
              <span aria-hidden="true">❖</span>{" "}
              {[
                entry.currentSeason !== undefined
                  ? `Temporada ${entry.currentSeason}`
                  : undefined,
                entry.currentEpisode !== undefined
                  ? `Episódio ${entry.currentEpisode}`
                  : undefined,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          {entry.platform && (
            <p className="record-credit">Acompanhar em {entry.platform}</p>
          )}
        </div>
      );
    case "study": {
      const divisor = entry.progressUnit === "hours" ? 60 : 1;
      return (
        <div className="record-portrait record-portrait--study">
          {(entry.area || entry.discipline) && (
            <p className="record-credit">
              {[entry.area, entry.discipline].filter(Boolean).join(" · ")}
            </p>
          )}
          {entry.objective && (
            <p className="record-intention">{entry.objective}</p>
          )}
          <p className="journey-tally">
            {entry.progressCurrent / divisor}
            {entry.progressTotal === undefined
              ? ""
              : ` de ${entry.progressTotal / divisor}`}{" "}
            {studyUnitLabels[entry.progressUnit]}
          </p>
        </div>
      );
    }
    case "physical_activity":
      return (
        <div className="record-portrait record-portrait--practice">
          <p className="record-credit">
            {activityLabels[entry.category]}
            {entry.modality ? ` · ${entry.modality}` : ""}
          </p>
          {entry.objective && (
            <p className="record-intention">{entry.objective}</p>
          )}
        </div>
      );
    case "work":
      return (
        <div className="record-portrait record-portrait--mission">
          {(entry.area || entry.organization) && (
            <p className="record-credit">
              {[entry.area, entry.organization].filter(Boolean).join(" · ")}
            </p>
          )}
          {entry.description && (
            <p className="record-intention">{entry.description}</p>
          )}
          <div className="mission-next-action">
            <span className="eyebrow">Próxima ação</span>
            <p>
              {entry.nextAction ??
                "Um primeiro passo pequeno já abre o caminho. Defina sua próxima ação na edição."}
            </p>
          </div>
        </div>
      );
  }
}
