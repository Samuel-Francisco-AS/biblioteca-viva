import {
  createBook,
  createMovie,
  createPhysicalActivity,
  createSeries,
  createStudy,
  createWork,
  type LibraryEntry,
} from "../../../domain";
import { projectLibraryWorldEntries } from "../libraryWorldEntries";
import type { LibraryWorldSnapshot } from "../libraryWorldEntryContract";
import type { LibraryRecordModelTypeId } from "./libraryRecordDimensions";
import { assignLibraryWorldRecordsToSlots } from "./libraryRecordLayout";

export type Bf3c3PreviewScenarioId =
  "low-density" | "full-capacity" | "overflow";

export interface Bf3c3PreviewScenario {
  readonly counts: Readonly<
    Record<"movie" | "series" | "study" | "physical_activity" | "work", number>
  >;
  readonly description: string;
  readonly id: Bf3c3PreviewScenarioId;
  readonly label: string;
}

const CATEGORY_TYPES = [
  "movie",
  "series",
  "study",
  "physical_activity",
  "work",
] as const;

const CATEGORY_BY_MODEL_TYPE: Readonly<
  Record<LibraryRecordModelTypeId, (typeof CATEGORY_TYPES)[number]>
> = Object.freeze({
  "movie-record": "movie",
  "physical-activity-record": "physical_activity",
  "series-record": "series",
  "study-record": "study",
  "work-record": "work",
});

const PREVIEW_BOOK_COUNT = 18;
const PREVIEW_TIMESTAMP = "2026-09-22T12:00:00.000Z";

export const BF3C3_PREVIEW_SCENARIOS: readonly Bf3c3PreviewScenario[] =
  Object.freeze([
    Object.freeze({
      counts: Object.freeze({
        movie: 1,
        series: 1,
        study: 1,
        physical_activity: 1,
        work: 1,
      }),
      description:
        "Uma ocorrência de cada faixa para examinar as cinco hipóteses visuais.",
      id: "low-density",
      label: "A — baixa densidade",
    }),
    Object.freeze({
      counts: Object.freeze({
        movie: 6,
        series: 7,
        study: 8,
        physical_activity: 9,
        work: 7,
      }),
      description:
        "Preenche exatamente os 37 slots derivados pela C2, sem overflow.",
      id: "full-capacity",
      label: "B — capacidade completa",
    }),
    Object.freeze({
      counts: Object.freeze({
        movie: 8,
        series: 7,
        study: 10,
        physical_activity: 9,
        work: 7,
      }),
      description:
        "Excede filme e estudo; apenas os 37 slots reais recebem representações.",
      id: "overflow",
      label: "C — overflow",
    }),
  ]);

function id(type: string, index: number): string {
  return `bf3c3-${type}-${String(index + 1).padStart(2, "0")}`;
}

function timestamp(index: number): string {
  return new Date(
    Date.UTC(2026, 8, 1, 12, 0, 0) + index * 24 * 60 * 60 * 1000,
  ).toISOString();
}

function createPreviewBooks(): readonly LibraryEntry[] {
  return Array.from({ length: PREVIEW_BOOK_COUNT }, (_, index) =>
    createBook({
      author: "Referência fictícia",
      createdAt: timestamp(index),
      currentPage: index * 3,
      id: id("book", index),
      title: `Livro fictício ${String(index + 1).padStart(2, "0")}`,
      totalPages: 180,
    }),
  );
}

function createPreviewRecords(
  scenario: Bf3c3PreviewScenario,
): readonly LibraryEntry[] {
  const entries: LibraryEntry[] = [...createPreviewBooks()];
  let recordIndex = PREVIEW_BOOK_COUNT;
  for (const type of CATEGORY_TYPES) {
    for (let index = 0; index < scenario.counts[type]; index += 1) {
      const common = {
        createdAt: timestamp(recordIndex),
        id: id(type, index),
        title: `${type} fictício ${String(index + 1).padStart(2, "0")}`,
      };
      recordIndex += 1;
      switch (type) {
        case "movie":
          entries.push(
            createMovie({ ...common, durationMinutes: 100, year: 2025 }),
          );
          break;
        case "series":
          entries.push(
            createSeries({ ...common, episodesWatched: 2, totalEpisodes: 8 }),
          );
          break;
        case "study":
          entries.push(
            createStudy({
              ...common,
              progressCurrent: 1,
              progressTotal: 12,
              progressUnit: "sessions",
            }),
          );
          break;
        case "physical_activity":
          entries.push(
            createPhysicalActivity({ ...common, category: "cardio" }),
          );
          break;
        case "work":
          entries.push(createWork({ ...common, area: "Projeto fictício" }));
          break;
      }
    }
  }
  return Object.freeze(entries);
}

export function getBf3c3PreviewScenario(
  id: Bf3c3PreviewScenarioId,
): Bf3c3PreviewScenario {
  const scenario = BF3C3_PREVIEW_SCENARIOS.find(
    (candidate) => candidate.id === id,
  );
  if (!scenario) throw new Error(`Cenário BF-3C3 desconhecido: ${id}.`);
  return scenario;
}

/** Synthetic conventional entries projected by the real, pure BF-3B boundary. */
export function createBf3c3PreviewSnapshot(
  scenario: Bf3c3PreviewScenario,
): LibraryWorldSnapshot {
  return projectLibraryWorldEntries(createPreviewRecords(scenario));
}

export interface Bf3c3PreviewScenarioResult {
  readonly placementsByCategory: Readonly<
    Record<"movie" | "series" | "study" | "physical_activity" | "work", number>
  >;
  readonly overflowByCategory: Readonly<
    Record<"movie" | "series" | "study" | "physical_activity" | "work", number>
  >;
  readonly snapshot: LibraryWorldSnapshot;
}

/** Uses the actual C2 assignment; overflow remains data only. */
export function createBf3c3PreviewScenarioResult(
  scenario: Bf3c3PreviewScenario,
): Bf3c3PreviewScenarioResult {
  const snapshot = createBf3c3PreviewSnapshot(scenario);
  const assignment = assignLibraryWorldRecordsToSlots(snapshot);
  const placementsByCategory = Object.fromEntries(
    CATEGORY_TYPES.map((type) => [type, 0]),
  ) as Record<(typeof CATEGORY_TYPES)[number], number>;
  const overflowByCategory = Object.fromEntries(
    CATEGORY_TYPES.map((type) => [type, 0]),
  ) as Record<(typeof CATEGORY_TYPES)[number], number>;

  for (const placement of assignment.placements) {
    placementsByCategory[CATEGORY_BY_MODEL_TYPE[placement.modelTypeId]] += 1;
  }
  for (const item of assignment.overflow) {
    overflowByCategory[CATEGORY_BY_MODEL_TYPE[item.modelTypeId]] += 1;
  }

  return Object.freeze({
    overflowByCategory: Object.freeze(overflowByCategory),
    placementsByCategory: Object.freeze(placementsByCategory),
    snapshot,
  });
}

export const BF3C3_PREVIEW_TIMESTAMP = PREVIEW_TIMESTAMP;
