import type { InhabitantKey } from "../inhabitants";

/** Local opt-in CPU/RAF observations, never GPU or presentation timings. */
export const PROBE_CAPACITY = 4096;
export type ProbeStage =
  | "rafInterval"
  | "updateCpu"
  | "bookCpu"
  | "agencyCpu"
  | "effectsCpu"
  | "submitCpu"
  | "gestureToSubmit"
  | "longTask";
/** Offsets from confirmed tap/click receipt, never physical presentation. */
export type QuestProbeStage =
  | "pickStart"
  | "prepared"
  | "raycastStart"
  | "raycastEnd"
  | "pickEnd"
  | "highlightStart"
  | "highlightEnd"
  | "publishStart"
  | "publishEnd"
  | "talkStart"
  | "talkEnd"
  | "narrativeStart"
  | "narrativeEnd"
  | "reactCommit"
  | "focusStart"
  | "focusEnd"
  | "handlerEnd"
  | "animationStart"
  | "animationEnd"
  | "sceneStart"
  | "sceneEnd"
  | "submitStart"
  | "submitEnd";
export type QuestProbeEvent =
  | { readonly type: "begin"; readonly source: "canvas" | "accessible" }
  | {
      readonly type: "mark";
      readonly stage: QuestProbeStage;
      readonly inhabitant?: InhabitantKey;
    };
export const QUEST_PROBE_CAPACITY = 12;
export interface QuestObservation {
  readonly sequence: number;
  readonly source: "canvas" | "accessible";
  readonly previous: InhabitantKey | null;
  readonly cardWasOpen: boolean;
  inhabitant: InhabitantKey | null;
  readonly marks: Partial<Record<QuestProbeStage, number>>;
  programsBefore: number | null;
  programsAfter: number | null;
  longTasks: number;
  longestTask: number;
}
export interface Distribution {
  readonly count: number;
  readonly p50: number | null;
  readonly p95: number | null;
  readonly p99: number | null;
  readonly max: number | null;
}
export function distribution(values: readonly number[]): Distribution {
  const sorted = [...values].sort((a, b) => a - b);
  const percentile = (p: number) =>
    sorted.length
      ? sorted[Math.max(0, Math.ceil(sorted.length * p) - 1)]
      : null;
  return {
    count: sorted.length,
    p50: percentile(0.5),
    p95: percentile(0.95),
    p99: percentile(0.99),
    max: sorted.at(-1) ?? null,
  };
}
export class PerformanceProbe {
  private readonly samples = new Map<ProbeStage, number[]>();
  private questEnabled = false;
  private questSequence = 0;
  private readonly quests: { start: number; observation: QuestObservation }[] =
    [];
  private currentQuest?: { start: number; observation: QuestObservation };
  setQuestEnabled(enabled: boolean): void {
    this.questEnabled = enabled;
    this.clearQuests();
  }
  private clearQuests(): void {
    this.quests.length = 0;
    this.currentQuest = undefined;
    this.questSequence = 0;
  }
  beginQuest(
    source: "canvas" | "accessible",
    previous: InhabitantKey | null,
    cardWasOpen: boolean,
    programs: number | null,
  ): void {
    if (!this.active || !this.questEnabled) return;
    this.currentQuest = {
      start: this.now(),
      observation: {
        sequence: ++this.questSequence,
        source,
        previous,
        cardWasOpen,
        inhabitant: null,
        marks: {},
        programsBefore: programs,
        programsAfter: null,
        longTasks: 0,
        longestTask: 0,
      },
    };
    if (this.quests.length === QUEST_PROBE_CAPACITY) this.quests.shift();
    this.quests.push(this.currentQuest);
  }
  markQuest(stage: QuestProbeStage, inhabitant?: InhabitantKey): void {
    const quest =
      this.active && this.questEnabled ? this.currentQuest : undefined;
    if (
      !quest ||
      quest.observation.marks[stage] !== undefined ||
      (inhabitant &&
        quest.observation.inhabitant &&
        inhabitant !== quest.observation.inhabitant)
    )
      return;
    // Once the input handler returns, closing/choosing a quest is a different
    // operation. Do not append its synchronous work to this opening's trace.
    if (
      quest.observation.marks.handlerEnd !== undefined &&
      ![
        "reactCommit",
        "focusStart",
        "focusEnd",
        "animationStart",
        "animationEnd",
        "sceneStart",
        "sceneEnd",
        "submitStart",
        "submitEnd",
      ].includes(stage)
    )
      return;
    if (inhabitant) quest.observation.inhabitant = inhabitant;
    // Repeated talk(), frames and bubbled/late animation events are not new samples.
    if (
      stage === "animationEnd" &&
      quest.observation.marks.animationStart === undefined
    )
      return;
    quest.observation.marks[stage] ??= Math.max(0, this.now() - quest.start);
  }
  questSubmitted(programs: number | null): void {
    if (
      !this.active ||
      !this.questEnabled ||
      !this.currentQuest ||
      this.currentQuest.observation.marks.submitEnd !== undefined
    )
      return;
    this.markQuest("submitEnd");
    this.currentQuest.observation.programsAfter = programs;
  }
  questSnapshot(): {
    readonly enabled: boolean;
    readonly observations: readonly QuestObservation[];
  } {
    return {
      enabled: this.questEnabled,
      observations: this.quests.map(({ observation }) => ({
        ...observation,
        marks: { ...observation.marks },
      })),
    };
  }
  private observer?: PerformanceObserver;
  private canvas?: HTMLCanvasElement;
  private inputAt?: number;
  private frameAt?: number;
  active = false;
  longTasksSupported = false;
  constructor(private readonly now: () => number) {}
  private readonly input = () => {
    if (this.inputAt === undefined) this.inputAt = this.now();
  };
  start(canvas: HTMLCanvasElement): void {
    if (this.active) return;
    this.active = true;
    this.canvas = canvas;
    for (const type of ["pointerdown", "pointermove", "pointerup"])
      canvas.addEventListener(type, this.input, {
        capture: true,
        passive: true,
      });
    this.longTasksSupported =
      typeof PerformanceObserver !== "undefined" &&
      PerformanceObserver.supportedEntryTypes?.includes("longtask");
    if (this.longTasksSupported) {
      this.observer = new PerformanceObserver((list) => {
        if (this.active)
          for (const entry of list.getEntries()) {
            this.record("longTask", entry.duration);
            // Bound attribution to the first second and to the next gesture.
            for (let i = 0; i < this.quests.length; i++) {
              const q = this.quests[i],
                next = this.quests[i + 1];
              if (
                entry.startTime + entry.duration > q.start &&
                entry.startTime <
                  Math.min(q.start + 1000, next?.start ?? Infinity)
              ) {
                q.observation.longTasks++;
                q.observation.longestTask = Math.max(
                  q.observation.longestTask,
                  entry.duration,
                );
              }
            }
          }
      });
      this.observer.observe({ type: "longtask" });
    }
  }
  stop(): void {
    this.active = false;
    this.currentQuest = undefined;
    this.frameAt = undefined;
    this.observer?.disconnect();
    this.observer = undefined;
    for (const type of ["pointerdown", "pointermove", "pointerup"])
      this.canvas?.removeEventListener(type, this.input, true);
    this.canvas = undefined;
    this.inputAt = undefined;
  }
  reset(): void {
    this.samples.clear();
    this.clearQuests();
    this.frameAt = undefined;
    this.inputAt = undefined;
    this.observer?.takeRecords();
  }
  frame(timestamp: number): void {
    if (!this.active) return;
    if (this.frameAt !== undefined)
      this.record("rafInterval", timestamp - this.frameAt);
    this.frameAt = timestamp;
  }
  record(stage: ProbeStage, value: number): void {
    if (!this.active || !Number.isFinite(value) || value < 0) return;
    const values = this.samples.get(stage) ?? [];
    if (values.length === PROBE_CAPACITY) values.shift();
    values.push(value);
    this.samples.set(stage, values);
  }
  submitted(): void {
    if (this.inputAt !== undefined) {
      this.record("gestureToSubmit", this.now() - this.inputAt);
      this.inputAt = undefined;
    }
  }
  snapshot(): Readonly<Partial<Record<ProbeStage, Distribution>>> {
    return Object.freeze(
      Object.fromEntries(
        [...this.samples].map(([key, values]) => [
          key,
          Object.freeze(distribution(values)),
        ]),
      ),
    );
  }
}
