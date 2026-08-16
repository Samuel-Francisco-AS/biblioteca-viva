export type LibraryPeriod = "lateNight" | "morning" | "afternoon" | "night";

export const LIBRARY_PERIOD_LABELS: Readonly<Record<LibraryPeriod, string>> = {
  afternoon: "Tarde",
  lateNight: "Madrugada",
  morning: "Manhã",
  night: "Noite",
};

export function deriveLibraryPeriod(date: Date): LibraryPeriod {
  const hour = date.getHours();
  if (hour < 6) return "lateNight";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "night";
}

export function millisecondsUntilNextLibraryPeriod(date: Date): number {
  const next = new Date(date);
  const hour = date.getHours();
  const nextHour = hour < 6 ? 6 : hour < 12 ? 12 : hour < 18 ? 18 : 24;
  next.setHours(nextHour, 0, 0, 0);
  return Math.max(1, next.getTime() - date.getTime());
}

interface LibraryPeriodMonitorOptions {
  readonly clearTimer: (timer: ReturnType<typeof setTimeout>) => void;
  readonly now: () => Date;
  readonly setTimer: (
    callback: () => void,
    delay: number,
  ) => ReturnType<typeof setTimeout>;
  readonly visibilitySource?: Pick<
    Document,
    "addEventListener" | "removeEventListener"
  >;
}

export interface LibraryPeriodMonitor {
  dispose(): void;
  refresh(): void;
}

export function createLibraryPeriodMonitor(
  onPeriod: (period: LibraryPeriod) => void,
  options: LibraryPeriodMonitorOptions,
): LibraryPeriodMonitor {
  let disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const clearPendingTimer = () => {
    if (timer === undefined) return;
    options.clearTimer(timer);
    timer = undefined;
  };
  const refresh = () => {
    if (disposed) return;
    clearPendingTimer();
    const current = options.now();
    onPeriod(deriveLibraryPeriod(current));
    timer = options.setTimer(
      refresh,
      millisecondsUntilNextLibraryPeriod(current),
    );
  };
  const onVisibilityChange = () => refresh();

  options.visibilitySource?.addEventListener(
    "visibilitychange",
    onVisibilityChange,
  );
  refresh();

  return {
    dispose: () => {
      if (disposed) return;
      disposed = true;
      clearPendingTimer();
      options.visibilitySource?.removeEventListener(
        "visibilitychange",
        onVisibilityChange,
      );
    },
    refresh,
  };
}
