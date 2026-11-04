import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it("finishes once after two frames and removes transition listener and fallback timer", async () => {
  vi.resetModules();
  vi.useFakeTimers();
  const frames: FrameRequestCallback[] = [];
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
    frames.push(cb),
  );
  document.body.innerHTML =
    '<div id="bv-startup-veil"><p id="bv-startup-stage"></p></div>';
  const { completeStartupExperience, describeStartup } =
    await import("./startupExperience");
  describeStartup("Preparando");
  expect(document.getElementById("bv-startup-stage")).toHaveTextContent(
    "Preparando",
  );
  const ready = vi.fn();
  window.addEventListener("biblioteca-viva:startup-ready", ready);
  const veil = document.getElementById("bv-startup-veil")!;
  completeStartupExperience();
  completeStartupExperience();
  expect(frames).toHaveLength(1);
  frames.shift()!(0);
  expect(veil).not.toHaveAttribute("aria-hidden");
  frames.shift()!(16);
  expect(veil).toHaveAttribute("aria-hidden", "true");
  expect(ready).toHaveBeenCalledOnce();
  veil.dispatchEvent(new Event("transitionend"));
  expect(veil.isConnected).toBe(false);
  expect(vi.getTimerCount()).toBe(0);
  window.removeEventListener("biblioteca-viva:startup-ready", ready);
});

it("removes the cover without transitionend, including reduced motion", async () => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });
  document.body.innerHTML = '<div id="bv-startup-veil"></div>';
  const { completeStartupExperience } = await import("./startupExperience");
  completeStartupExperience();
  vi.advanceTimersByTime(320);
  expect(document.getElementById("bv-startup-veil")).toBeNull();
});
