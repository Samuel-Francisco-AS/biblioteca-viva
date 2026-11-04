import { afterEach, expect, it, vi } from "vitest";
import { pulseTouch } from "./touchFeedback";
afterEach(() => vi.unstubAllGlobals());
it("pulses lightly only on spaced activations, honors reduced motion and tolerates denial", () => {
  const vibrate = vi.fn();
  vi.stubGlobal("navigator", { vibrate });
  pulseTouch(true, 1000);
  expect(vibrate).not.toHaveBeenCalled();
  pulseTouch(false, 1000);
  pulseTouch(false, 1080);
  pulseTouch(false, 1200);
  expect(vibrate.mock.calls).toEqual([[8], [8]]);
  vibrate.mockImplementation(() => {
    throw new Error("Denied");
  });
  expect(() => pulseTouch(false, 1500)).not.toThrow();
  vi.stubGlobal("navigator", {});
  expect(() => pulseTouch(false, 1800)).not.toThrow();
});
