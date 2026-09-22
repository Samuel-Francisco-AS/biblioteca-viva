import {
  createBook,
  createMovie,
  createPhysicalActivity,
  createSeries,
  createStudy,
  createWork,
  type LibraryEntry,
} from "../../domain";
import { describe, expect, it } from "vitest";

import { projectLibraryWorldEntries } from "./libraryWorldEntries";

const CREATED_AT = "2026-09-22T10:00:00.000Z";

describe("projeção neutra BF-3B dos registros da Biblioteca", () => {
  it("projeta os seis tipos na ordem convencional com identidades e metadados exatos", () => {
    const snapshot = projectLibraryWorldEntries([
      createWork({
        area: "Produto",
        createdAt: CREATED_AT,
        deadline: "2026-10-01T10:00:00.000Z",
        description: "Planejamento fictício",
        id: "work-01",
        nextAction: "Revisar plano",
        organization: "Organização fictícia",
        title: "Plano de trabalho",
      }),
      createPhysicalActivity({
        category: "cardio",
        createdAt: CREATED_AT,
        id: "activity-01",
        modality: "Caminhada",
        objective: "Bem-estar",
        title: "Caminhada fictícia",
      }),
      createStudy({
        area: "Tecnologia",
        createdAt: CREATED_AT,
        deadline: "2026-10-02T10:00:00.000Z",
        discipline: "Arquitetura",
        id: "study-01",
        objective: "Aprender",
        progressCurrent: 3,
        progressTotal: 8,
        progressUnit: "modules",
        title: "Estudo fictício",
      }),
      createSeries({
        createdAt: CREATED_AT,
        currentEpisode: 2,
        currentSeason: 1,
        episodesWatched: 4,
        id: "series-01",
        platform: "Tela fictícia",
        title: "Série fictícia",
        totalEpisodes: 12,
      }),
      createMovie({
        createdAt: CREATED_AT,
        director: "Direção fictícia",
        durationMinutes: 105,
        id: "movie-01",
        platform: "Cinema fictício",
        title: "Filme fictício",
        year: 2024,
      }),
      createBook({
        author: "Autora fictícia",
        createdAt: CREATED_AT,
        currentPage: 42,
        id: "book-01",
        title: "Livro fictício",
        totalPages: 300,
      }),
    ]);

    expect(snapshot.categories.map(({ type }) => type)).toEqual([
      "book",
      "movie",
      "series",
      "study",
      "physical_activity",
      "work",
    ]);
    expect(snapshot.categories[0].entries).toEqual([
      {
        author: "Autora fictícia",
        entryId: "book-01",
        instanceId: "reading-book:book-01",
        modelTypeId: "book-volume",
        readingProgress: { currentPage: 42, totalPages: 300 },
        title: "Livro fictício",
      },
    ]);
    expect(
      snapshot.categories.slice(1).map(({ entries }) => entries[0]),
    ).toEqual([
      {
        createdAt: CREATED_AT,
        director: "Direção fictícia",
        durationMinutes: 105,
        entryId: "movie-01",
        instanceId: "library-movie:movie-01",
        modelTypeId: "movie-record",
        platform: "Cinema fictício",
        title: "Filme fictício",
        type: "movie",
        year: 2024,
      },
      {
        createdAt: CREATED_AT,
        currentEpisode: 2,
        currentSeason: 1,
        entryId: "series-01",
        episodesWatched: 4,
        instanceId: "library-series:series-01",
        modelTypeId: "series-record",
        platform: "Tela fictícia",
        title: "Série fictícia",
        totalEpisodes: 12,
        type: "series",
      },
      {
        area: "Tecnologia",
        createdAt: CREATED_AT,
        deadline: "2026-10-02T10:00:00.000Z",
        discipline: "Arquitetura",
        entryId: "study-01",
        instanceId: "library-study:study-01",
        modelTypeId: "study-record",
        objective: "Aprender",
        progressCurrent: 3,
        progressTotal: 8,
        progressUnit: "modules",
        title: "Estudo fictício",
        type: "study",
      },
      {
        category: "cardio",
        createdAt: CREATED_AT,
        entryId: "activity-01",
        instanceId: "library-physical-activity:activity-01",
        modality: "Caminhada",
        modelTypeId: "physical-activity-record",
        objective: "Bem-estar",
        title: "Caminhada fictícia",
        type: "physical_activity",
      },
      {
        area: "Produto",
        createdAt: CREATED_AT,
        deadline: "2026-10-01T10:00:00.000Z",
        description: "Planejamento fictício",
        entryId: "work-01",
        instanceId: "library-work:work-01",
        modelTypeId: "work-record",
        nextAction: "Revisar plano",
        organization: "Organização fictícia",
        title: "Plano de trabalho",
        type: "work",
      },
    ]);
  });

  it("preserva a projeção BF-2 dos livros sem type ou createdAt", () => {
    const snapshot = projectLibraryWorldEntries([
      createBook({
        createdAt: CREATED_AT,
        currentPage: 7,
        id: "book-without-author",
        title: "Livro sem autor",
      }),
    ]);
    const [book] = snapshot.categories[0].entries;

    expect(book).toEqual({
      entryId: "book-without-author",
      instanceId: "reading-book:book-without-author",
      modelTypeId: "book-volume",
      readingProgress: { currentPage: 7 },
      title: "Livro sem autor",
    });
    expect(Object.hasOwn(book, "type")).toBe(false);
    expect(Object.hasOwn(book, "createdAt")).toBe(false);
  });

  it("ordena cada categoria por createdAt e id sem depender da ordem recebida", () => {
    const entries: readonly LibraryEntry[] = [
      createMovie({
        createdAt: "2026-09-22T11:00:00.000Z",
        id: "movie-later",
        title: "Depois",
      }),
      createMovie({ createdAt: CREATED_AT, id: "movie-b", title: "B" }),
      createMovie({ createdAt: CREATED_AT, id: "movie-a", title: "A" }),
      createBook({
        createdAt: "2026-09-22T11:00:00.000Z",
        currentPage: 1,
        id: "book-later",
        title: "Depois",
      }),
      createBook({
        createdAt: CREATED_AT,
        currentPage: 1,
        id: "book-a",
        title: "Primeiro",
      }),
    ];

    const snapshot = projectLibraryWorldEntries(entries);

    expect(
      snapshot.categories[0].entries.map(({ entryId }) => entryId),
    ).toEqual(["book-a", "book-later"]);
    expect(
      snapshot.categories[1].entries.map(({ entryId }) => entryId),
    ).toEqual(["movie-a", "movie-b", "movie-later"]);
  });

  it("rejeita entryId duplicado dentro e entre categorias sem deduplicar", () => {
    const movie = createMovie({
      createdAt: CREATED_AT,
      id: "duplicated",
      title: "Filme",
    });

    expect(() => projectLibraryWorldEntries([movie, movie])).toThrow(
      "entryId duplicado: duplicated",
    );
    expect(() =>
      projectLibraryWorldEntries([
        movie,
        createSeries({
          createdAt: CREATED_AT,
          id: "duplicated",
          title: "Série",
        }),
      ]),
    ).toThrow("entryId duplicado: duplicated");
  });

  it("mantém identidade estável para mudanças não identitárias e sem colisões", () => {
    const original = createMovie({
      createdAt: CREATED_AT,
      director: "Direção inicial",
      id: "movie-stable",
      title: "Título inicial",
    });
    const changed = createMovie({
      createdAt: CREATED_AT,
      director: "Nova direção",
      id: "movie-stable",
      title: "Novo título",
    });
    const allTypes: readonly LibraryEntry[] = [
      createBook({
        createdAt: CREATED_AT,
        currentPage: 0,
        id: "same-suffix",
        title: "Livro",
      }),
      original,
      createSeries({
        createdAt: CREATED_AT,
        id: "same-suffix-2",
        title: "Série",
      }),
      createStudy({
        createdAt: CREATED_AT,
        id: "same-suffix-3",
        progressUnit: "sessions",
        title: "Estudo",
      }),
      createPhysicalActivity({
        category: "other",
        createdAt: CREATED_AT,
        id: "same-suffix-4",
        title: "Atividade",
      }),
      createWork({
        createdAt: CREATED_AT,
        id: "same-suffix-5",
        title: "Trabalho",
      }),
    ];

    expect(
      projectLibraryWorldEntries([original]).categories[1].entries[0]
        .instanceId,
    ).toBe(
      projectLibraryWorldEntries([changed]).categories[1].entries[0].instanceId,
    );
    const instanceIds = projectLibraryWorldEntries(allTypes).categories.flatMap(
      ({ entries }) => entries.map(({ instanceId }) => instanceId),
    );
    expect(new Set(instanceIds)).toHaveLength(instanceIds.length);
  });

  it("mantém opcionais genuinamente ausentes e os obrigatórios disponíveis", () => {
    const snapshot = projectLibraryWorldEntries([
      createMovie({ createdAt: CREATED_AT, id: "movie", title: "Filme" }),
      createSeries({ createdAt: CREATED_AT, id: "series", title: "Série" }),
      createStudy({
        createdAt: CREATED_AT,
        id: "study",
        progressUnit: "hours",
        title: "Estudo",
      }),
      createPhysicalActivity({
        category: "strength",
        createdAt: CREATED_AT,
        id: "activity",
        title: "Atividade",
      }),
      createWork({ createdAt: CREATED_AT, id: "work", title: "Trabalho" }),
    ]);

    expect(
      snapshot.categories.slice(1).map(({ entries }) => entries[0]),
    ).toEqual([
      {
        createdAt: CREATED_AT,
        entryId: "movie",
        instanceId: "library-movie:movie",
        modelTypeId: "movie-record",
        title: "Filme",
        type: "movie",
      },
      {
        createdAt: CREATED_AT,
        entryId: "series",
        episodesWatched: 0,
        instanceId: "library-series:series",
        modelTypeId: "series-record",
        title: "Série",
        type: "series",
      },
      {
        createdAt: CREATED_AT,
        entryId: "study",
        instanceId: "library-study:study",
        modelTypeId: "study-record",
        progressCurrent: 0,
        progressUnit: "hours",
        title: "Estudo",
        type: "study",
      },
      {
        category: "strength",
        createdAt: CREATED_AT,
        entryId: "activity",
        instanceId: "library-physical-activity:activity",
        modelTypeId: "physical-activity-record",
        title: "Atividade",
        type: "physical_activity",
      },
      {
        createdAt: CREATED_AT,
        entryId: "work",
        instanceId: "library-work:work",
        modelTypeId: "work-record",
        title: "Trabalho",
        type: "work",
      },
    ]);
  });

  it("publica um snapshot vazio com as seis categorias, sem conteúdo fabricado", () => {
    const snapshot = projectLibraryWorldEntries([]);

    expect(
      snapshot.categories.map(({ type, entries }) => [type, entries]),
    ).toEqual([
      ["book", []],
      ["movie", []],
      ["series", []],
      ["study", []],
      ["physical_activity", []],
      ["work", []],
    ]);
  });

  it("congela todo o snapshot publicado, não modifica a entrada e é determinística", () => {
    const input: LibraryEntry[] = [
      createMovie({ createdAt: CREATED_AT, id: "movie", title: "Filme" }),
      createBook({
        createdAt: "2026-09-22T09:00:00.000Z",
        currentPage: 2,
        id: "book",
        title: "Livro",
      }),
    ];
    const original = structuredClone(input);
    const once = projectLibraryWorldEntries(input);
    const again = projectLibraryWorldEntries([...input].reverse());

    expect(input).toEqual(original);
    expect(once).toEqual(again);
    expect(Object.isFrozen(once)).toBe(true);
    expect(Object.isFrozen(once.categories)).toBe(true);
    for (const category of once.categories) {
      expect(Object.isFrozen(category)).toBe(true);
      expect(Object.isFrozen(category.entries)).toBe(true);
      for (const entry of category.entries)
        expect(Object.isFrozen(entry)).toBe(true);
    }
    expect(Object.isFrozen(once.categories[0].entries[0].readingProgress)).toBe(
      true,
    );
  });
});
