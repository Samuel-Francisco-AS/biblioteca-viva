import {
  RESIDENT_HOME_ROOMS,
  type RoomId,
  type ResidentId,
} from "../../../domain";
import type { LibraryVisualPeriod } from "../contracts";
import Phaser from "phaser";

export type ResidentRoutineState =
  "idle" | "working" | "organizing" | "resting" | "walking" | "observing";
export type ResidentAnchor =
  "home" | "work" | "shelf" | "rest" | "door" | "special";

export interface RoutineAnchorPoint {
  readonly anchor: ResidentAnchor;
  readonly x: number;
  readonly y: number;
}

export function routineAnchorsForRoom(
  roomId: RoomId,
  width: number,
  height: number,
): readonly RoutineAnchorPoint[] {
  const common = {
    home: [0.5, 0.62],
    work: [0.54, 0.62],
    shelf: [0.22, 0.44],
    rest: [0.76, 0.7],
    door: [0.1, 0.68],
    special: [0.78, 0.38],
  } as const;
  const names: readonly ResidentAnchor[] =
    roomId === "projection-room"
      ? ["work", "special", "door", "rest"]
      : roomId === "training-room"
        ? ["home", "special", "work", "rest"]
        : ["work", "shelf", "special", "rest"];
  return names.map((anchor) => ({
    anchor,
    x: width * common[anchor][0],
    y: height * common[anchor][1],
  }));
}

export function residentIdForRoom(roomId: RoomId): ResidentId | undefined {
  return Object.entries(RESIDENT_HOME_ROOMS).find(
    ([, home]) => home === roomId,
  )?.[0] as ResidentId | undefined;
}

export function residentVisualDefinition(residentId: ResidentId): {
  readonly body: number;
  readonly detail: number;
  readonly accent: number;
} {
  return {
    librarian: { body: 0x765a8c, detail: 0xd6c4a4, accent: 0x4b352b },
    researcher: { body: 0x667955, detail: 0xb58b61, accent: 0x8ca47d },
    projectionist: { body: 0x292631, detail: 0x9b5a48, accent: 0xd0955e },
    "training-keeper": { body: 0x536b70, detail: 0xb4a071, accent: 0x879b8b },
    scribe: { body: 0x4c5058, detail: 0x9b8063, accent: 0xb7a77f },
  }[residentId];
}

const PERIOD_STATES: Readonly<
  Record<LibraryVisualPeriod, readonly ResidentRoutineState[]>
> = {
  morning: ["organizing", "working"],
  afternoon: ["working", "observing", "walking"],
  night: ["working", "resting", "observing"],
  lateNight: ["resting", "observing", "idle"],
};

export function routineStatesForPeriod(
  period: LibraryVisualPeriod,
  allowed: readonly ResidentRoutineState[],
): readonly ResidentRoutineState[] {
  return PERIOD_STATES[period].filter((state) => allowed.includes(state));
}

export function residentIsUnlocked(
  roomId: RoomId,
  highestReachedStage: number,
): boolean {
  return roomId === "main-library" || highestReachedStage >= 2;
}

export function chooseRoutineAction(input: {
  readonly period: LibraryVisualPeriod;
  readonly allowedStates: readonly ResidentRoutineState[];
  readonly anchors: readonly RoutineAnchorPoint[];
  readonly index: number;
}): {
  readonly state: ResidentRoutineState;
  readonly target: RoutineAnchorPoint;
} {
  const states = routineStatesForPeriod(input.period, input.allowedStates);
  const state = states[input.index % Math.max(1, states.length)] ?? "idle";
  const target = input.anchors[
    input.index % Math.max(1, input.anchors.length)
  ] ?? { anchor: "home", x: 0, y: 0 };
  return { state, target };
}

export interface CreatureRoomInput {
  readonly period: LibraryVisualPeriod;
  readonly unlockedRoomIds: readonly RoomId[];
}
export function creatureRoomForPeriod({
  period,
  unlockedRoomIds,
}: CreatureRoomInput): RoomId {
  const candidate =
    period === "morning"
      ? "main-library"
      : period === "afternoon"
        ? "study-room"
        : period === "night"
          ? "projection-room"
          : "office";
  return candidate === "main-library" || unlockedRoomIds.includes(candidate)
    ? candidate
    : "main-library";
}

export interface ResidentRoutineScheduler {
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  snapshot(): {
    readonly running: boolean;
    readonly paused: boolean;
    readonly residentId: ResidentId;
  };
}

export class PhaserResidentRoutineScheduler implements ResidentRoutineScheduler {
  private delayed?: Phaser.Time.TimerEvent;
  private running = false;
  private paused = false;
  private index = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly residentId: ResidentId,
    private readonly target: Phaser.GameObjects.Container,
    private readonly states: readonly ResidentRoutineState[],
    private readonly anchors: readonly RoutineAnchorPoint[],
    private readonly period: LibraryVisualPeriod,
  ) {}

  start(): void {
    this.stop();
    this.running = true;
    this.paused = false;
    this.schedule();
  }

  stop(): void {
    this.delayed?.remove(false);
    this.delayed = undefined;
    this.scene.tweens.killTweensOf(this.target);
    this.running = false;
    this.paused = false;
  }

  pause(): void {
    if (!this.running) return;
    this.paused = true;
    if (this.delayed) this.delayed.paused = true;
    this.scene.tweens
      .getTweensOf(this.target)
      .forEach((tween) => tween.pause());
  }

  resume(): void {
    if (!this.running) return;
    this.paused = false;
    if (this.delayed) this.delayed.paused = false;
    this.scene.tweens
      .getTweensOf(this.target)
      .forEach((tween) => tween.resume());
  }

  snapshot() {
    return Object.freeze({
      running: this.running,
      paused: this.paused,
      residentId: this.residentId,
    });
  }

  private schedule(): void {
    if (!this.running) return;
    this.delayed = this.scene.time.delayedCall(1_800, () => {
      if (!this.running) return;
      const action = chooseRoutineAction({
        period: this.period,
        allowedStates: this.states,
        anchors: this.anchors,
        index: this.index++,
      });
      if (action.state === "walking") {
        this.scene.tweens.add({
          targets: this.target,
          x: action.target.x,
          y: action.target.y,
          duration: 1_200,
          ease: "Sine.easeInOut",
        });
      } else {
        this.target.setPosition(action.target.x, action.target.y);
      }
      this.schedule();
    });
  }
}
