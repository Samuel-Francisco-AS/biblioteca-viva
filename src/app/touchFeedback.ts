import { Capacitor, registerPlugin } from "@capacitor/core";

interface NativeTactileFeedback {
  pulse(options: { kind: "selection" | "confirm" }): Promise<void>;
}

// Do not instantiate the native bridge in web/test environments. This also
// allows Vitest's web Capacitor shim to omit registerPlugin entirely.
const tactile =
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android"
    ? registerPlugin<NativeTactileFeedback>("TactileFeedback")
    : undefined;

// One request per semantic activation; unrelated rapid commands remain valid.
export function pulseTouch(
  reducedMotion: boolean,
  kind: "selection" | "confirm" = "selection",
): void {
  if (reducedMotion) return;

  if (tactile) {
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
