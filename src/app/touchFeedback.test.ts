import { afterEach, expect, it, vi } from "vitest";
import { pulseTouch } from "./touchFeedback";
afterEach(() => vi.unstubAllGlobals());
it("pulses lightly on every valid activation, honors reduced motion and tolerates denial", () => {
  const vibrate = vi.fn();
  vi.stubGlobal("navigator", { vibrate });
  pulseTouch(true);
  expect(vibrate).not.toHaveBeenCalled();
  pulseTouch(false);
  pulseTouch(false);
  pulseTouch(false);
  expect(vibrate.mock.calls).toEqual([[8], [8], [8]]);
  vibrate.mockImplementation(() => {
    throw new Error("Denied");
  });
  expect(() => pulseTouch(false)).not.toThrow();
  vi.stubGlobal("navigator", {});
  expect(() => pulseTouch(false)).not.toThrow();
});

it("contains synchronous native bridge failures", async () => {
  vi.resetModules();
  vi.doMock("@capacitor/core", () => ({
    Capacitor: { isNativePlatform: () => true, getPlatform: () => "android" },
    registerPlugin: () => ({
      pulse: () => {
        throw new Error("Bridge unavailable");
      },
    }),
  }));
  const vibrate = vi.fn();
  vi.stubGlobal("navigator", { vibrate });
  const native = await import("./touchFeedback");
  expect(() => native.pulseTouch(false)).not.toThrow();
  expect(vibrate).toHaveBeenCalledWith(8);
  vi.doUnmock("@capacitor/core");
});
