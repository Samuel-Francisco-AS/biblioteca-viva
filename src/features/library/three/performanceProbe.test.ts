import { expect, it, vi } from "vitest";
import {
  PerformanceProbe,
  distribution,
  PROBE_CAPACITY,
} from "./performanceProbe";
import { FrameMetricsWindow } from "./frameMetrics";
it("measures outliers with nearest-rank percentiles and bounded storage", () => {
  const values = Array.from({ length: 100 }, (_, i) => (i < 95 ? 16 : 100));
  expect(distribution(values)).toMatchObject({
    p50: 16,
    p95: 16,
    p99: 100,
    max: 100,
  });
  const probe = new PerformanceProbe(() => 0);
  probe.record("updateCpu", 10);
  expect(probe.snapshot()).toEqual({});
  const canvas = document.createElement("canvas");
  probe.start(canvas);
  for (let i = 0; i < PROBE_CAPACITY * 2; i++) probe.record("updateCpu", i);
  expect(probe.snapshot().updateCpu?.count).toBe(PROBE_CAPACITY);
  probe.stop();
  probe.record("updateCpu", 9999);
  expect(probe.snapshot().updateCpu?.max).toBe(PROBE_CAPACITY * 2 - 1);
  const metrics = new FrameMetricsWindow(1000);
  [0, 16, 32, 132].forEach((t) => metrics.record(t));
  expect(metrics.distribution()).toMatchObject({
    count: 3,
    p99: 100,
    lateFramesOver33Ms: 1,
  });
  metrics.reset();
  expect(metrics.distribution().count).toBe(0);
});
it("timestamps gesture receipt to submission, and detaches on pause/disposal", () => {
  let time = 5;
  const probe = new PerformanceProbe(() => time);
  const canvas = document.createElement("canvas");
  const remove = vi.spyOn(canvas, "removeEventListener");
  probe.start(canvas);
  canvas.dispatchEvent(new Event("pointermove"));
  time = 20;
  probe.submitted();
  expect(probe.snapshot().gestureToSubmit?.p50).toBe(15);
  probe.stop();
  expect(remove).toHaveBeenCalledTimes(3);
  canvas.dispatchEvent(new Event("pointermove"));
  time = 100;
  probe.submitted();
  expect(probe.snapshot().gestureToSubmit?.count).toBe(1);
});
it("captures a full dusk interval and resets experiments without mixing pause gaps", () => {
  const probe = new PerformanceProbe(() => 0),
    canvas = document.createElement("canvas");
  probe.start(canvas);
  for (let i = 0; i <= 2700; i++) probe.frame((i * 1000) / 60);
  expect(probe.snapshot().rafInterval).toMatchObject({ count: 2700 });
  expect(probe.snapshot().rafInterval?.p95).toBeCloseTo(1000 / 60);
  probe.reset();
  probe.frame(100000);
  probe.frame(100020);
  expect(probe.snapshot().rafInterval).toMatchObject({ count: 1, p99: 20 });
  probe.stop();
  probe.start(canvas);
  probe.frame(200000);
  expect(probe.snapshot().rafInterval?.count).toBe(1);
  probe.stop();
});

it("R5Q records only opted-in bounded quest traces, with detached snapshots and first marks", () => {
  let time = 100;
  const probe = new PerformanceProbe(() => time);
  const canvas = document.createElement("canvas");
  probe.start(canvas);
  probe.beginQuest("canvas", null, false, 8);
  expect(probe.questSnapshot().observations).toEqual([]);
  probe.setQuestEnabled(true);
  probe.beginQuest("canvas", null, false, 8);
  time = 104;
  probe.markQuest("talkStart", "ytha");
  time = 106;
  probe.markQuest("talkEnd", "ytha");
  probe.markQuest("reactCommit", "lua"); // another actor's late callback
  probe.markQuest("animationEnd", "ytha"); // no matching animation start
  time = 108;
  probe.markQuest("talkStart", "ytha"); // duplicate talk is idempotent
  probe.markQuest("sceneStart");
  probe.markQuest("handlerEnd");
  probe.markQuest("narrativeStart"); // a later close/choice is not this opening
  expect(
    probe.questSnapshot().observations[0].marks.narrativeStart,
  ).toBeUndefined();
  time = 112;
  probe.markQuest("sceneEnd");
  probe.markQuest("submitStart");
  time = 140;
  probe.questSubmitted(9);
  const first = probe.questSnapshot().observations[0];
  expect(first).toMatchObject({
    source: "canvas",
    previous: null,
    inhabitant: "ytha",
    cardWasOpen: false,
    programsBefore: 8,
    programsAfter: 9,
    marks: {
      talkStart: 4,
      talkEnd: 6,
      sceneStart: 8,
      sceneEnd: 12,
      submitStart: 12,
      submitEnd: 40,
    },
  });
  expect(first.marks.reactCommit).toBeUndefined();
  expect(first.marks.animationEnd).toBeUndefined();
  first.marks.talkStart = 999;
  probe.questSubmitted(100);
  expect(probe.questSnapshot().observations[0].marks.talkStart).toBe(4);
  expect(probe.questSnapshot().observations[0].programsAfter).toBe(9);
  for (let i = 0; i < 20; i++) probe.beginQuest("accessible", "ytha", true, 9);
  expect(probe.questSnapshot().observations).toHaveLength(12);
  expect(probe.questSnapshot().observations[0].sequence).toBe(10);
  probe.stop();
  probe.start(canvas);
  probe.markQuest("reactCommit", "ytha");
  expect(probe.questSnapshot().observations.at(-1)?.marks).toEqual({});
  probe.reset();
  expect(probe.questSnapshot()).toEqual({ enabled: true, observations: [] });
  probe.beginQuest("accessible", "ytha", false, null);
  probe.setQuestEnabled(false);
  expect(probe.questSnapshot()).toEqual({ enabled: false, observations: [] });
  probe.stop();
});

it("R5Q attributes numeric long tasks only within a bounded gesture window and detaches", () => {
  let time = 0;
  let deliver: (entries: PerformanceEntry[]) => void = () => {};
  const disconnect = vi.fn();
  class Observer implements PerformanceObserver {
    static supportedEntryTypes = ["longtask"];
    constructor(callback: PerformanceObserverCallback) {
      deliver = (entries) =>
        callback(
          {
            getEntries: () => entries,
            getEntriesByName: () => entries,
            getEntriesByType: () => entries,
          },
          this,
        );
    }
    observe() {}
    disconnect = disconnect;
    takeRecords(): PerformanceEntry[] {
      return [];
    }
  }
  vi.stubGlobal("PerformanceObserver", Observer);
  try {
    const probe = new PerformanceProbe(() => time);
    probe.start(document.createElement("canvas"));
    probe.setQuestEnabled(true);
    probe.beginQuest("canvas", null, false, null);
    time = 200;
    probe.beginQuest("accessible", "lua", true, null);
    const entries = [-5, 10, 250, 1201].map((startTime) => ({
      name: "self",
      entryType: "longtask",
      startTime,
      duration: 60,
      toJSON: () => ({}),
    }));
    deliver(entries);
    expect(
      probe
        .questSnapshot()
        .observations.map((q) => [q.longTasks, q.longestTask]),
    ).toEqual([
      [2, 60],
      [1, 60],
    ]);
    probe.stop();
    deliver(entries);
    expect(probe.questSnapshot().observations[0].longTasks).toBe(2);
    expect(disconnect).toHaveBeenCalledOnce();
  } finally {
    vi.unstubAllGlobals();
  }
});
