export const TAP_MOVEMENT_THRESHOLD = 12;

export type LibraryTapTarget =
  "shelf" | "librarian" | "creature" | "highlighted-book";

interface PendingTap<Target extends string> {
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly target: Target;
  cancelled: boolean;
}

export class TapSelectionPolicy<Target extends string = LibraryTapTarget> {
  private pending?: PendingTap<Target>;

  begin(target: Target, pointerId: number, x: number, y: number): void {
    this.pending = {
      cancelled: false,
      pointerId,
      startX: x,
      startY: y,
      target,
    };
  }

  move(pointerId: number, x: number, y: number): void {
    const pending = this.pending;
    if (!pending || pending.pointerId !== pointerId || pending.cancelled)
      return;
    if (
      Math.hypot(x - pending.startX, y - pending.startY) >
      TAP_MOVEMENT_THRESHOLD
    ) {
      pending.cancelled = true;
    }
  }

  end(pointerId: number, wasCancelled = false): Target | undefined {
    const pending = this.pending;
    if (!pending || pending.pointerId !== pointerId) return undefined;
    this.pending = undefined;
    return pending.cancelled || wasCancelled ? undefined : pending.target;
  }

  cancel(): void {
    this.pending = undefined;
  }
}
