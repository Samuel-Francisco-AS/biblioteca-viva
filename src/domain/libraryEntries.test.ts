import { describe, expect, it } from "vitest";

import {
  changeEntryStatus,
  createMovie,
  createPhysicalActivity,
  createSeries,
  createStudy,
  createWork,
  updateLibraryEntryDetails,
  updateSeriesProgress,
  updateStudyProgress,
  type LibraryEntry,
} from ".";

const T0 = "2026-08-16T10:00:00.000Z";
const T1 = "2026-08-16T11:00:00.000Z";

const variants = [
  createMovie({ id: "movie-1", title: "Filme fictício", createdAt: T0 }),
  createSeries({ id: "series-1", title: "Série fictícia", createdAt: T0 }),
  createStudy({
    id: "study-1",
    title: "Estudo fictício",
    progressUnit: "sessions",
    createdAt: T0,
  }),
  createPhysicalActivity({
    id: "physical-1",
    title: "Caminhada fictícia",
    category: "cardio",
    createdAt: T0,
  }),
  createWork({ id: "work-1", title: "Projeto fictício", createdAt: T0 }),
] as const;

describe("variantes de LibraryEntry", () => {
  it.each(variants)("cria $type com metadados comuns", (entry) => {
    expect(entry).toMatchObject({
      status: "planned",
      favorite: false,
      tagIds: [],
      createdAt: T0,
      updatedAt: T0,
      revision: 1,
    });
    expect(Object.isFrozen(entry)).toBe(true);
  });

  it("mantém metadados específicos sem formar uma super-entidade", () => {
    expect(
      createMovie({
        id: "movie-1",
        title: "Filme",
        director: "Direção",
        year: 2020,
        durationMinutes: 120,
        platform: "Cinema",
        createdAt: T0,
      }),
    ).toMatchObject({
      type: "movie",
      director: "Direção",
      year: 2020,
      durationMinutes: 120,
      platform: "Cinema",
    });
    expect(
      createPhysicalActivity({
        id: "physical-1",
        title: "Corrida",
        category: "cardio",
        modality: "Rua",
        objective: "Ciclo leve",
        createdAt: T0,
      }),
    ).toMatchObject({
      type: "physical_activity",
      category: "cardio",
      modality: "Rua",
    });
    expect(
      createWork({
        id: "work-1",
        title: "Portfólio",
        organization: "Cliente fictício",
        nextAction: "Revisar texto",
        createdAt: T0,
      }),
    ).toMatchObject({
      type: "work",
      organization: "Cliente fictício",
      nextAction: "Revisar texto",
    });
  });

  it.each([
    () =>
      createSeries({
        id: "series",
        title: "Série",
        episodesWatched: 4,
        totalEpisodes: 3,
        createdAt: T0,
      }),
    () =>
      createStudy({
        id: "study",
        title: "Estudo",
        progressUnit: "percent",
        progressCurrent: 101,
        createdAt: T0,
      }),
    () =>
      createStudy({
        id: "study",
        title: "Estudo",
        progressUnit: "hours",
        progressCurrent: 61.5,
        createdAt: T0,
      }),
  ])("rejeita progresso incompatível", (operation) => {
    expect(operation).toThrow();
  });

  it("inicia e conclui Série pela mesma política de progresso", () => {
    const series = createSeries({
      id: "series",
      title: "Série",
      totalEpisodes: 2,
      createdAt: T0,
    });
    const started = updateSeriesProgress(
      series,
      { episodesWatched: 1, currentSeason: 1, currentEpisode: 2 },
      T1,
    );
    expect(started).toMatchObject({
      status: "in_progress",
      startedAt: T1,
      episodesWatched: 1,
    });
    const completed = updateSeriesProgress(
      started,
      { episodesWatched: 2 },
      "2026-08-16T12:00:00.000Z",
    );
    expect(completed).toMatchObject({
      status: "completed",
      completedAt: "2026-08-16T12:00:00.000Z",
      episodesWatched: 2,
    });
  });

  it("não fabrica porcentagem nem conclusão para total desconhecido", () => {
    const series = updateSeriesProgress(
      createSeries({ id: "series", title: "Série", createdAt: T0 }),
      { episodesWatched: 30 },
      T1,
    );
    const study = updateStudyProgress(
      createStudy({
        id: "study",
        title: "Estudo",
        progressUnit: "topics",
        createdAt: T0,
      }),
      8,
      T1,
    );
    expect(series).toMatchObject({
      status: "in_progress",
      episodesWatched: 30,
    });
    expect(series.totalEpisodes).toBeUndefined();
    expect(study).toMatchObject({ status: "in_progress", progressCurrent: 8 });
    expect(study.progressTotal).toBeUndefined();
  });

  it.each(variants)(
    "faz auto-start comum de $type sem auto-completar",
    (entry) => {
      const started = changeEntryStatus(entry, "in_progress", T1);
      expect(started).toMatchObject({
        status: "in_progress",
        startedAt: T1,
        revision: 2,
      });
    },
  );

  it("preserva conclusão explícita de filme, atividade física e trabalho", () => {
    for (const entry of [
      variants[0],
      variants[3],
      variants[4],
    ] satisfies readonly LibraryEntry[]) {
      const started = changeEntryStatus(entry, "in_progress", T1);
      expect(started.status).toBe("in_progress");
      expect(started.completedAt).toBeUndefined();
    }
  });

  it("edita somente a variante correspondente e preserva identidade", () => {
    const movie = variants[0];
    const updated = updateLibraryEntryDetails(
      movie,
      { type: "movie", title: "Filme revisado", director: "Direção" },
      T1,
    );
    expect(updated).toMatchObject({
      id: movie.id,
      type: "movie",
      title: "Filme revisado",
      revision: 2,
    });
    expect(() =>
      updateLibraryEntryDetails(movie, { type: "work", title: "Outro" }, T1),
    ).toThrow();
  });
});
