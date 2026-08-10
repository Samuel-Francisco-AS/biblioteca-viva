export const LIBRARY_ROOM_BUDGET = {
  maximumApproximateDisplayObjects: 32,
  maximumCustomTextures: 7,
  maximumSimultaneousTweens: 3,
  maximumTransientUnlockTweens: 1,
  particles: "none",
  physics: "none",
  shaders: "none",
} as const;

export const LIBRARY_ROOM_ANIMATIONS = {
  creature: {
    durationMs: 3_600,
    ease: "Sine.easeInOut",
    idleAmplitude: 2,
    movementAmplitudeRatio: 1,
    repeat: -1,
    yoyo: true,
  },
  highlightedBook: {
    durationMs: 2_400,
    ease: "Sine.easeInOut",
    idleAmplitude: 0.025,
    repeat: -1,
    yoyo: true,
  },
  librarian: {
    durationMs: 2_600,
    ease: "Sine.easeInOut",
    idleAmplitude: 4,
    repeat: -1,
    yoyo: true,
  },
  unlock: {
    durationMs: 650,
    ease: "Sine.easeOut",
  },
  reducedMotion: {
    durationMultiplier: 1,
    movementMultiplier: 0,
  },
} as const;

export function pingPongPositionAt(
  elapsedMs: number,
  durationMs: number,
  start: number,
  end: number,
): number {
  const cycleDuration = durationMs * 2;
  const elapsedInCycle =
    ((elapsedMs % cycleDuration) + cycleDuration) % cycleDuration;
  const linearProgress =
    elapsedInCycle <= durationMs
      ? elapsedInCycle / durationMs
      : 2 - elapsedInCycle / durationMs;
  const easedProgress = (1 - Math.cos(Math.PI * linearProgress)) / 2;
  return start + (end - start) * easedProgress;
}

export const LIBRARY_ROOM_INTERACTION = {
  minimumTargetSize: 44,
  movementThreshold: 12,
  selectionEvent: "pointerup",
  startEvent: "pointerdown",
} as const;

export const LIBRARY_CANVAS_TOUCH_ACTION = "pan-y" as const;

export const LIBRARY_ROOM_PALETTE = {
  bookCompleted: 0xd8b84b,
  bookInProgress: 0x4f769d,
  bookPaper: 0xf6e7c8,
  counterDark: 0x6e4328,
  counterLight: 0x9b6844,
  creatureBody: 0x6f9364,
  creatureDetail: 0xd8e5bc,
  floor: 0xcba978,
  floorLine: 0xb78f61,
  librarianApron: 0xd6c4a4,
  librarianBody: 0x765a8c,
  librarianHair: 0x4b352b,
  shelfDark: 0x563723,
  shelfLight: 0x8a5b36,
  spine: 0xc88759,
  textDark: 0x28343d,
  wall: 0x4d6570,
  wallTrim: 0xd8c6a3,
  warmLight: 0xffd487,
} as const;

export interface RoomMotionPlan {
  readonly creatureDurationMs: number;
  readonly creatureMoves: boolean;
  readonly highlightedBookDurationMs: number;
  readonly highlightedBookMoves: boolean;
  readonly librarianDurationMs: number;
  readonly librarianMoves: boolean;
  readonly simultaneousTweens: number;
}

export function decorationUnlockMotion(reducedMotion: boolean) {
  return Object.freeze({
    animated: !reducedMotion,
    durationMs: reducedMotion ? 0 : LIBRARY_ROOM_ANIMATIONS.unlock.durationMs,
  });
}

export function libraryRoomMotionPlan(reducedMotion: boolean): RoomMotionPlan {
  if (reducedMotion) {
    return {
      creatureDurationMs: LIBRARY_ROOM_ANIMATIONS.creature.durationMs,
      creatureMoves: false,
      highlightedBookDurationMs:
        LIBRARY_ROOM_ANIMATIONS.highlightedBook.durationMs,
      highlightedBookMoves: false,
      librarianDurationMs: LIBRARY_ROOM_ANIMATIONS.librarian.durationMs,
      librarianMoves: false,
      simultaneousTweens: 0,
    };
  }
  return {
    creatureDurationMs: LIBRARY_ROOM_ANIMATIONS.creature.durationMs,
    creatureMoves: true,
    highlightedBookDurationMs:
      LIBRARY_ROOM_ANIMATIONS.highlightedBook.durationMs,
    highlightedBookMoves: true,
    librarianDurationMs: LIBRARY_ROOM_ANIMATIONS.librarian.durationMs,
    librarianMoves: true,
    simultaneousTweens: 3,
  };
}
