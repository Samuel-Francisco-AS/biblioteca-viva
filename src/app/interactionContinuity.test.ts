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

describe("R6.1: seamless, readiness-gated passage", () => {
  it("does not even start route work until the initial curtain has fully sealed", () => {
    vi.useFakeTimers();
    const { shell, frames } = setup();
    const navigate = vi.fn();
    beginPassage("/colecao");
    schedulePassage(navigate);
    expect(shell.dataset.passage).toBe("departing");
    expect(navigate).not.toHaveBeenCalled();
    expect(frames).toHaveLength(0);

    completePassageDeparture(); // CSS fold animationend
    expect(shell.dataset.passage).toBe("waiting");
    expect(frames).toHaveLength(1);
    frames.shift()?.(560);
    expect(navigate).not.toHaveBeenCalled();
    frames.shift()?.(576);
    expect(navigate).toHaveBeenCalledOnce();

    notifyPassageLocation("/colecao");
    vi.advanceTimersByTime(2500);
    expect(shell.dataset.passage).toBe("waiting");
    signalPassageReady("/colecao");
    vi.advanceTimersByTime(0);
    expect(shell.dataset.passage).toBe("arriving");
    completePassageAnimation();
    expect(shell).not.toHaveAttribute("data-passage");
  });

  it("keeps the solid cover while a destination is loading, with no early reveal", () => {
    vi.useFakeTimers();
    const { shell } = setup();
    beginPassage("/arcanario/acervo");
    notifyPassageLocation("/arcanario/acervo");
    signalPassageReady("/arcanario/duelos"); // stale room
    vi.advanceTimersByTime(720); // fallback for missing CSS animationend
    expect(shell.dataset.passage).toBe("waiting");
    vi.advanceTimersByTime(10000);
    expect(shell.dataset.passage).toBe("waiting");
    signalPassageReady("/arcanario/acervo");
    vi.advanceTimersByTime(0);
    expect(shell.dataset.passage).toBe("arriving");
  });

  it("ignores an old gesture after a new one starts", () => {
    vi.useFakeTimers();
    const { shell, frames } = setup();
    const first = vi.fn();
    const second = vi.fn();
    beginPassage("/arquivo");
    schedulePassage(first);
    beginPassage("/colecao");
    schedulePassage(second);
    completePassageDeparture();
    frames.shift()?.(560);
    frames.shift()?.(576);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
    notifyPassageLocation("/colecao");
    signalPassageReady("/arquivo");
    vi.advanceTimersByTime(2000);
    expect(shell.dataset.passage).toBe("waiting");
    signalPassageReady("/colecao");
    vi.advanceTimersByTime(0);
    expect(shell.dataset.passage).toBe("arriving");
  });

  it("lets external Back cancel work before the covered navigation begins", () => {
    const { shell, frames } = setup();
    const routeWork = vi.fn();
    beginPassage("/colecao");
    schedulePassage(routeWork);
    notifyPassageLocation("/arquivo");
    completePassageDeparture();
    expect(routeWork).not.toHaveBeenCalled();
    expect(frames).toHaveLength(0);
    expect(shell).not.toHaveAttribute("data-passage");
  });

  it("honors the minimum gentle opening duration after early readiness", () => {
    vi.useFakeTimers();
    const { shell } = setup();
    beginPassage("/colecao");
    notifyPassageLocation("/colecao");
    signalPassageReady("/colecao");
    vi.advanceTimersByTime(560);
    completePassageDeparture();
    vi.advanceTimersByTime(179);
    expect(shell.dataset.passage).toBe("waiting");
    vi.advanceTimersByTime(1);
    expect(shell.dataset.passage).toBe("arriving");
    vi.advanceTimersByTime(820);
    expect(shell).not.toHaveAttribute("data-passage");
  });

  it("skips prolonged visuals for reduced motion", async () => {
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

  it("cancels queued work and cleanup on unmount", () => {
    const { frames, shell } = setup();
    const action = vi.fn();
    beginPassage("/colecao");
    const cancel = schedulePassage(action);
    cancel();
    completePassageDeparture();
    cancelPassage();
    expect(frames).toHaveLength(0);
    expect(action).not.toHaveBeenCalled();
    expect(shell).not.toHaveAttribute("data-passage");
  });
});
