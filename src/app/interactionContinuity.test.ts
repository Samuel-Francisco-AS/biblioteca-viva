import { afterEach, expect, it, vi } from "vitest";
import { schedulePassage, beginPassage } from "./interactionContinuity";
afterEach(() => {
  document.querySelector(".app-shell")?.remove();
  vi.restoreAllMocks();
});
it("commits within the same turn without waiting for RAF", async () => {
  const raf = vi.spyOn(window, "requestAnimationFrame");
  const action = vi.fn();
  schedulePassage(action);
  expect(action).not.toHaveBeenCalled();
  await Promise.resolve();
  expect(action).toHaveBeenCalledOnce();
  expect(raf).not.toHaveBeenCalled();
});
it("cancels superseded or unmounted intentions", async () => {
  const old = vi.fn(),
    next = vi.fn();
  schedulePassage(old)();
  schedulePassage(next);
  await Promise.resolve();
  expect(old).not.toHaveBeenCalled();
  expect(next).toHaveBeenCalledOnce();
});
it("starts the optional veil without owning navigation", () => {
  const shell = document.createElement("div");
  shell.className = "app-shell";
  document.body.append(shell);
  beginPassage();
  expect(shell.dataset.passage).toBe("departing");
});
