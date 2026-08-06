export const TAP_MOVEMENT_THRESHOLD = 12;

export type LibraryTapTarget =
  "shelf" | "librarian" | "creature" | "highlighted-book";

interface PendingTap {
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly target: LibraryTapTarget;
  cancelled: boolean;
}

export class TapSelectionPolicy {
  private pending?: PendingTap;

  begin(
    target: LibraryTapTarget,
    pointerId: number,
    x: number,
    y: number,
  ): void {
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

  end(pointerId: number, wasCancelled = false): LibraryTapTarget | undefined {
    const pending = this.pending;
    if (!pending || pending.pointerId !== pointerId) return undefined;
    this.pending = undefined;
    return pending.cancelled || wasCancelled ? undefined : pending.target;
  }

  cancel(): void {
    this.pending = undefined;
  }
}
