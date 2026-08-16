import { describe, expect, it, vi } from "vitest";

import {
  createLibraryPeriodMonitor,
  deriveLibraryPeriod,
  millisecondsUntilNextLibraryPeriod,
} from "./libraryAtmosphere";

describe("atmosfera da Biblioteca", () => {
  it.each([
    ["2026-08-16T00:00:00", "lateNight"],
    ["2026-08-16T05:59:00", "lateNight"],
    ["2026-08-16T06:00:00", "morning"],
    ["2026-08-16T11:59:00", "morning"],
    ["2026-08-16T12:00:00", "afternoon"],
    ["2026-08-16T17:59:00", "afternoon"],
    ["2026-08-16T18:00:00", "night"],
    ["2026-08-16T23:59:00", "night"],
  ] as const)("deriva %s como %s", (instant, expected) => {
    expect(deriveLibraryPeriod(new Date(instant))).toBe(expected);
  });

  it("calcula somente a próxima fronteira", () => {
    expect(
      millisecondsUntilNextLibraryPeriod(new Date("2026-08-16T17:59:00")),
    ).toBe(60_000);
  });

  it("atualiza na fronteira e no resume, substitui o timer e limpa tudo", () => {
    let current = new Date("2026-08-16T17:59:00");
    const callbacks: Array<() => void> = [];
    const setTimer = vi.fn((callback: () => void) => {
      callbacks.push(callback);
      return callbacks.length;
    });
    const clearTimer = vi.fn();
    let visibilityHandler: (() => void) | undefined;
    const visibilitySource = {
      addEventListener: vi.fn(
        (_name: string, handler: EventListenerOrEventListenerObject) => {
          visibilityHandler = handler as () => void;
        },
      ),
      removeEventListener: vi.fn(),
    };
    const periods: string[] = [];
    const monitor = createLibraryPeriodMonitor(
      (period) => periods.push(period),
      {
        clearTimer,
        now: () => current,
        setTimer,
        visibilitySource,
      },
    );

    current = new Date("2026-08-16T18:00:00");
    callbacks[0]?.();
    current = new Date("2026-08-17T06:00:00");
    visibilityHandler?.();

    expect(periods).toEqual(["afternoon", "night", "morning"]);
    expect(setTimer).toHaveBeenCalledTimes(3);
    expect(clearTimer).toHaveBeenCalledTimes(2);

    monitor.dispose();
    expect(clearTimer).toHaveBeenCalledTimes(3);
    expect(visibilitySource.removeEventListener).toHaveBeenCalledOnce();
  });
});
