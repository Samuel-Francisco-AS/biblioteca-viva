/**
 * Startup presence is a tiny, static HTML layer shown before the JS bundle and
 * Dexie are ready. It never decides when the world is ready on a timer.
 */
let completed = false;

export function describeStartup(stage: string): void {
  const label = document.getElementById("bv-startup-stage");
  if (label) label.textContent = stage;
}

export function completeStartupExperience(): void {
  if (completed) return;
  completed = true;
  const veil = document.getElementById("bv-startup-veil");
  if (!veil) return;

  // Two paints give the ready scene (or a controlled fallback) a chance to
  // reach the screen before the cover departs.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      veil.classList.add("bv-startup-veil--leaving");
      veil.setAttribute("aria-hidden", "true");
      const remove = () => {
        window.clearTimeout(cleanup);
        veil.removeEventListener("transitionend", remove);
        veil.remove();
      };
      veil.addEventListener("transitionend", remove, { once: true });
      // Cleanup fallback, not an artificial waiting period for navigation.
      const cleanup = window.setTimeout(remove, 320);
      window.dispatchEvent(new Event("biblioteca-viva:startup-ready"));
    }),
  );
}
