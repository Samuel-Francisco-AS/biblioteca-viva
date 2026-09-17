import f1TechnicalFixtureUrl from "./fixtures/f1-technical-pyramid.glb?url&no-inline";
import kayKitUrl from "./fixtures/f4-b/kaykit-shelf-b-large-decorated.glb?url&no-inline";
import kenneyUrl from "./fixtures/f4-b/kenney-bookcase-open.glb?url&no-inline";
import polyHavenUrl from "./fixtures/f4-b/polyhaven-shelf-01.glb?url&no-inline";
import quaterniusUrl from "./fixtures/f4-b/quaternius-bookshelf.glb?url&no-inline";

export interface PerformanceScenarioAsset {
  readonly id: string;
  readonly position: readonly [number, number, number];
  readonly url: string;
}

export interface PerformanceScenario {
  readonly assets: readonly PerformanceScenarioAsset[];
  readonly description: string;
  readonly id: "f1-baseline" | "f4-corpus" | "f4-corpus-x4";
  readonly label: string;
}

const F1_TECHNICAL_FIXTURE: PerformanceScenarioAsset = Object.freeze({
  id: "f1-technical-pyramid",
  position: [0.4, 0.1, 2.6] as const,
  url: f1TechnicalFixtureUrl,
});

const F4_CORPUS: readonly PerformanceScenarioAsset[] = Object.freeze([
  Object.freeze({
    id: "kaykit",
    position: [-4.8, 0.1, 2.6] as const,
    url: kayKitUrl,
  }),
  Object.freeze({
    id: "kenney",
    position: [-1.9, 0.1, 2.6] as const,
    url: kenneyUrl,
  }),
  Object.freeze({
    id: "polyhaven",
    position: [1.5, 0.1, 2.6] as const,
    url: polyHavenUrl,
  }),
  Object.freeze({
    id: "quaternius",
    position: [4.5, 0.1, 2.6] as const,
    url: quaterniusUrl,
  }),
]);

function translateCorpus(
  prefix: string,
  offsetX: number,
  offsetZ: number,
): readonly PerformanceScenarioAsset[] {
  return F4_CORPUS.map(({ id, position, url }) =>
    Object.freeze({
      id: `${prefix}-${id}`,
      position: [
        position[0] + offsetX,
        position[1],
        position[2] + offsetZ,
      ] as const,
      url,
    }),
  );
}

const F4_CORPUS_X4: readonly PerformanceScenarioAsset[] = Object.freeze([
  ...translateCorpus("a", 0, 0),
  ...translateCorpus("b", 0, -2.1),
  ...translateCorpus("c", 0, -4.2),
  ...translateCorpus("d", 0, -6.3),
]);

export const PERFORMANCE_SCENARIOS: readonly PerformanceScenario[] =
  Object.freeze([
    Object.freeze({
      assets: Object.freeze([F1_TECHNICAL_FIXTURE]),
      description: "Fixture técnica F1 atual, sem asset F4.",
      id: "f1-baseline",
      label: "Baseline F1",
    }),
    Object.freeze({
      assets: Object.freeze([F1_TECHNICAL_FIXTURE, ...F4_CORPUS]),
      description:
        "Fixture F1 mais uma cópia de cada fixture registrada da F4.",
      id: "f4-corpus",
      label: "Corpus F4",
    }),
    Object.freeze({
      assets: Object.freeze([F1_TECHNICAL_FIXTURE, ...F4_CORPUS_X4]),
      description:
        "Fixture F1 mais quatro cópias determinísticas do corpus F4 para stress posterior.",
      id: "f4-corpus-x4",
      label: "Corpus F4 ×4",
    }),
  ]);

export const DEFAULT_PERFORMANCE_SCENARIO = PERFORMANCE_SCENARIOS[0];
