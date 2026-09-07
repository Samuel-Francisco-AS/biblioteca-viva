const STARTUP_PREFIX = "biblioteca-viva:startup";

function performanceAvailable(): boolean {
  return typeof performance !== "undefined";
}

export function startupNow(): number {
  return performanceAvailable() ? performance.now() : 0;
}

export function markStartupEvent(name: string): void {
  if (!performanceAvailable()) return;
  performance.mark(`${STARTUP_PREFIX}:event:${name}`);
}

export function measureStartupPhase(
  name: string,
  startedAt: number,
  endedAt = startupNow(),
): void {
  if (!performanceAvailable()) return;
  performance.measure(`${STARTUP_PREFIX}:phase:${name}`, {
    start: startedAt,
    end: endedAt,
  });
}

export function markStartupMilestone(name: string): void {
  if (!performanceAvailable()) return;
  performance.mark(`${STARTUP_PREFIX}:milestone:${name}`);
}
