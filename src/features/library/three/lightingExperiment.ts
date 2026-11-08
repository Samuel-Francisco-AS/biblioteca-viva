/** Render-only, explicit diagnostic overrides. Never enters sessions or storage. */
export type LightingExperimentMode =
  "day" | "original" | "no-lamps" | "limited" | "candidate";
export interface LightingExperiment {
  readonly mode: LightingExperimentMode;
  readonly ythaLight: boolean;
}
