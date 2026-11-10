import { afterEach, describe, expect, it, vi } from "vitest";
import {
  beginPassage,
  cancelPassage,
  completePassageAnimation,
  completePassageDeparture,
  notifyPassageLocation,
  schedulePassage,
  signalPassageReady,
} from "./interactionContinuity";

function setup() {
  const shell = document.createElement("div");
  shell.className = "app-shell";
  document.body.append(shell);
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  const frames: FrameRequestCallback[] = [];
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    frames.push(cb);
    return frames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  return { shell, frames };
}

afterEach(() => {
  cancelPassage();
  document.querySelector(".app-shell")?.remove();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("R6: ready-gated passage choreography", () => {
  it("starts feedback before route work and holds until real readiness", () => {
    vi.useFakeTimers();
    const { shell, frames } = setup();
    const navigate = vi.fn();
    beginPassage("/colecao");
    schedulePassage(navigate);
    expect(shell.dataset.passage).toBe("departing");
    expect(navigate).not.toHaveBeenCalled();
    frames.shift()?.(0);
    expect(navigate).not.toHaveBeenCalled();
    frames.shift()?.(16);
    expect(navigate).toHaveBeenCalledOnce();

    notifyPassageLocation("/colecao");
    // Route commit alone cannot finish or reveal the transition.
    completePassageDeparture();
    expect(shell.dataset.passage).toBe("waiting");
    vi.advanceTimersByTime(2500);
    expect(shell.dataset.passage).toBe("waiting");

    signalPassageReady("/colecao");
    vi.advanceTimersByTime(0);
    expect(shell.dataset.passage).toBe("arriving");
    completePassageAnimation();
    expect(shell).not.toHaveAttribute("data-passage");
  });

  it("ignores stale readiness and stale scheduled handlers after a new gesture", () => {
    vi.useFakeTimers();
    const { shell, frames } = setup();
    const first = vi.fn();
    const second = vi.fn();
    beginPassage("/arquivo");
    schedulePassage(first);
    frames.shift()?.(0);
    beginPassage("/colecao");
    schedulePassage(second);
    frames.shift()?.(16); // delivered callback belonging to the cancelled route
    frames.shift()?.(32);
    frames.shift()?.(48);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
    notifyPassageLocation("/colecao");
    signalPassageReady("/arquivo");
    vi.advanceTimersByTime(2000);
    expect(shell.dataset.passage).not.toBe("arriving");
    signalPassageReady("/colecao");
    vi.advanceTimersByTime(0);
    expect(shell.dataset.passage).toBe("arriving");
  });

  it("keeps the minimum opening choreography but not an arbitrary loading deadline", () => {
    vi.useFakeTimers();
    const { shell } = setup();
    beginPassage("/colecao");
    notifyPassageLocation("/colecao");
    signalPassageReady("/colecao");
    vi.advanceTimersByTime(559);
    expect(shell.dataset.passage).not.toBe("arriving");
    vi.advanceTimersByTime(1);
    expect(shell.dataset.passage).toBe("arriving");
    vi.advanceTimersByTime(540);
    expect(shell).not.toHaveAttribute("data-passage");
  });

  it("respects reduced-motion without waiting two painted frames", async () => {
    const { shell, frames } = setup();
    shell.dataset.reducedMotion = "true";
    const run = vi.fn();
    beginPassage("/arquivo");
    schedulePassage(run);
    await Promise.resolve();
    expect(run).toHaveBeenCalledOnce();
    expect(frames).toHaveLength(0);
    notifyPassageLocation("/arquivo");
    signalPassageReady("/arquivo");
    expect(shell).not.toHaveAttribute("data-passage");
  });

  it("cancels an aborted or unmounted navigation without executing it", () => {
    const { frames, shell } = setup();
    const action = vi.fn();
    beginPassage("/colecao");
    const cancel = schedulePassage(action);
    frames.shift()?.(0);
    cancel();
    cancelPassage();
    frames.shift()?.(16);
    expect(action).not.toHaveBeenCalled();
    expect(shell).not.toHaveAttribute("data-passage");
  });
});
