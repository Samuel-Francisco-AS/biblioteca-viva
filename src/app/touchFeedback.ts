import { Capacitor, registerPlugin } from "@capacitor/core";

interface NativeTactileFeedback {
  pulse(options: { kind: "selection" | "confirm" }): Promise<void>;
}

const tactile = registerPlugin<NativeTactileFeedback>("TactileFeedback");

// Activation feedback only. A short cadence avoids double pulses from nested
// interactive elements; pan, pinch and keyboard input never invoke this bridge.
let lastPulse = -Infinity;

export function pulseTouch(
  reducedMotion: boolean,
  now = performance.now(),
  kind: "selection" | "confirm" = "selection",
): void {
  if (reducedMotion || now - lastPulse < 135) return;
  lastPulse = now;

  if (Capacitor.getPlatform() === "android") {
    void tactile.pulse({ kind }).catch(() => {
      try {
        navigator.vibrate?.(kind === "confirm" ? 13 : 8);
      } catch {
        // Optional browser fallback may be unsupported.
      }
    });
    return;
  }

  try {
    navigator.vibrate?.(kind === "confirm" ? 13 : 8);
  } catch {
    // Optional browser fallback may be denied by the user agent.
  }
}
