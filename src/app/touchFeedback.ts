// Activation feedback, never pointer movement. Unsupported/blocked vibration is optional.
let lastPulse = -Infinity;
export function pulseTouch(
  reducedMotion: boolean,
  now = performance.now(),
): void {
  if (
    reducedMotion ||
    now - lastPulse < 180 ||
    typeof navigator.vibrate !== "function"
  )
    return;
  lastPulse = now;
  try {
    navigator.vibrate(8);
  } catch {
    /* A platform may deny this optional capability. */
  }
}
