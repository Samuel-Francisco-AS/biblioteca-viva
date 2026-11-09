import { afterEach, describe, expect, it, vi } from "vitest";
import { afterFeedbackFrame, beginPassage } from "./interactionContinuity";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.querySelector(".app-shell")?.remove();
});

describe("continuity frame", () => {
  it("does not navigate until the second animation frame", () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      callbacks.push(cb);
      return callbacks.length;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    const action = vi.fn();
    const cancel = afterFeedbackFrame(action);
    expect(action).not.toHaveBeenCalled();
    callbacks.shift()?.(0);
    expect(action).not.toHaveBeenCalled();
    callbacks.shift()?.(16);
    expect(action).toHaveBeenCalledOnce();
    cancel();
  });

  it("cancels a queued action and arms only a decorative passage", () => {
    const shell = document.createElement("div");
    shell.className = "app-shell";
    document.body.append(shell);
    beginPassage();
    expect(shell.dataset.passage).toBe("departing");
    vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const action = vi.fn();
    afterFeedbackFrame(action)();
    expect(action).not.toHaveBeenCalled();
  });
});
