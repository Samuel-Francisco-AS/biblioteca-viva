import {
  INHABITANTS,
  INHABITANT_ENVELOPES,
  type InhabitantAction,
  type InhabitantKey,
  type InhabitantId,
} from "./inhabitants";
import {
  InhabitantNavigation,
  distance,
  roomAt,
  type Position,
  type NavigationObstacle,
} from "./inhabitantNavigation";
import {
  LIBRARY_ACTIVITY_POINTS,
  LIBRARY_ACTIVITY_ZONES,
} from "./librarySpatialLayout";
import { ENCOUNTERS, type EncounterScript } from "./inhabitantEncounters";
import type { NightLightingSession } from "./nightLighting";
import type { NarrativeBond } from "./narrative/contracts";
import type { LivingEvent } from "./livingObjects";
import {
  parseInhabitantContinuity,
  type InhabitantContinuitySnapshot,
} from "./inhabitantContinuity";
import {
  InteractionCoordinator,
  type InteractionTaskState,
} from "./inhabitantInteractions";

export type AgencyState =
  | "idle"
  | "navigate"
  | "work"
  | "socialize"
  | "react"
  | "recover"
  | "paused"
  | "converse";
export type AgencyMode = "running" | "paused" | "reduced" | "unavailable";
export type CosmeticState = "intact" | "damaged-cosmetic" | "repairing";
type TaskKind =
  "study" | "reading" | "rest" | "observation" | "plant" | "experiment";
interface Task {
  readonly id: string;
  readonly kind: TaskKind;
  readonly position: Position;
  readonly facing: number;
  readonly label: string;
  readonly objectId?: string;
  readonly nightLampId?: string;
  readonly interaction?: {
    readonly source: Position;
    readonly approach: Position;
    readonly destination: Position;
    readonly reach: number;
  };
}
export interface AgentView extends Position {
  readonly id: InhabitantId;
  readonly key: InhabitantKey;
  readonly label: string;
  readonly state: AgencyState;
  readonly activity: string;
  readonly room: string;
  readonly destination: Position | null;
  readonly facing: number;
  readonly action: InhabitantAction;
  readonly available: boolean;
  readonly interactionObjectId: string | null;
  readonly interactionState: InteractionTaskState | null;
}
export interface RelationView {
  readonly id: string;
  readonly pair: readonly [InhabitantKey, InhabitantKey];
  readonly trust: number;
  readonly affinity: number;
  readonly tension: number;
  readonly description: string;
  readonly history: readonly string[];
  readonly narrativeHistory?: readonly string[];
}
export interface AgencySnapshot {
  readonly mode: AgencyMode;
  readonly message: string;
  readonly revision: number;
  readonly agents: readonly AgentView[];
  readonly relations: readonly RelationView[];
  readonly recent: readonly string[];
  readonly cosmetic: CosmeticState;
}
interface Agent {
  id: InhabitantId;
  key: InhabitantKey;
  label: string;
  x: number;
  z: number;
  facing: number;
  state: AgencyState;
  activity: string;
  action: InhabitantAction;
  available: boolean;
  task: Task | null;
  route: readonly Position[];
  destination: Position | null;
  until: number;
  started: number;
  blocked: number;
  encounter: string | null;
  manual: boolean;
  socialAfter: number;
  taskCount: number;
  history: string[];
  lastEvent: number;
  interactionState: InteractionTaskState | null;
  interactionTaskId: string | null;
}
interface Relation {
  script: EncounterScript;
  trust: number;
  affinity: number;
  tension: number;
  history: string[];
  description: string;
  next: number;
  count: number;
}
interface Meeting {
  relation: Relation;
  actors: readonly [Agent, Agent];
  phase: number;
  until: number;
  deadline: number;
  repair: boolean;
  positions: readonly [Position, Position];
}
export interface AgencyOptions {
  readonly now?: () => number;
  readonly hour?: () => number;
  readonly seed?: number;
  readonly onEnvironmentAction?: (key: InhabitantKey, objectId: string) => void;
  readonly nightLighting?: NightLightingSession;
}
const tasks: readonly Task[] = [
  ...LIBRARY_ACTIVITY_POINTS.flatMap((p) => {
    const z = LIBRARY_ACTIVITY_ZONES.find((z) => z.id === p.zoneId);
    if (!z || z.activity === "circulation") return [];
    const interaction =
      p.id === "bf4-point:c-study"
        ? {
            source: { x: p.x - 0.65, z: p.z + 2.1 },
            approach: approachToBook({ x: p.x - 0.65, z: p.z + 2.1 }, p),
            destination: { x: p.x + 0.8, z: p.z },
            reach: 1.5,
          }
        : undefined;
    const position = interaction?.approach ?? { x: p.x, z: p.z };
    return [
      {
        id: p.id,
        kind: z.activity,
        position,
        facing: p.facing,
        label:
          z.activity === "study"
            ? "atividade em prop de estudo"
            : z.activity === "reading"
              ? "leitura de ficção cenográfica"
              : z.activity === "rest"
                ? "repouso e observação tranquila"
                : "observação dos mecanismos",
        ...(p.id.endsWith("d-study") ? { objectId: "living:globe" } : {}),
        ...(interaction ? { objectId: "living:book", interaction } : {}),
        ...{},
      },
    ];
  }),
  {
    id: "clock-inspection",
    kind: "observation",
    position: { x: -15.2, z: -6.8 },
    facing: -Math.PI / 2,
    label: "inspeção do relógio cenográfico",
    objectId: "living:clock",
  },
  {
    id: "care-star-plant",
    kind: "plant",
    position: { x: -11.7, z: 5.6 },
    facing: Math.PI,
    label: "cuidado da planta estrelada",
    objectId: "living:plant",
  },
  {
    id: "lua-practice",
    kind: "experiment",
    position: { x: -13, z: 10 },
    facing: Math.PI,
    label: "ensaio mágico sobre folha de treino",
    objectId: "living:globe",
  },
];
const preferences: Record<InhabitantKey, Record<TaskKind, number>> = {
  samael: {
    study: 9,
    reading: 4,
    rest: 7,
    observation: 8,
    plant: 2,
    experiment: 0,
  },
  aryn: {
    study: 9,
    reading: 8,
    rest: 3,
    observation: 7,
    plant: 6,
    experiment: 0,
  },
  ytha: {
    study: 3,
    reading: 8,
    rest: 7,
    observation: 5,
    plant: 12,
    experiment: 0,
  },
  lua: {
    study: 10,
    reading: 7,
    rest: 4,
    observation: 7,
    plant: 6,
    experiment: 12,
  },
};
const clamp = (v: number, min = 0, max = 12) => Math.min(max, Math.max(min, v));
function approachToBook(source: Position, point: Position): Position {
  const dx = point.x - source.x;
  const dz = point.z - source.z;
  const length = Math.hypot(dx, dz);
  return {
    x: source.x + (dz / length) * 1.35,
    z: source.z - (dx / length) * 1.35,
  };
}
/** Session-only agency. No renderer, browser, timers, records or persistence.
 * update() consumes an injected monotonic clock; pauses discard elapsed wall time. */
export class InhabitantAgency {
  private readonly agents: Agent[];
  private readonly relations: Relation[];
  private meeting: Meeting | null = null;
  private cosmetic: CosmeticState = "intact";
  private incidentAfter = 35;
  private repairRequested = false;
  private elapsed = 0;
  private logic = 0;
  private lastTime: number | undefined;
  private revision = 0;
  private randomState: number;
  private mode: AgencyMode = "paused";
  private recent: string[] = [];
  private message = "A convivência aguarda o ambiente 3D.";
  private readonly listeners = new Set<() => void>();
  private snapshot: AgencySnapshot;
  private disposed = false;
  private socialAfter = 12;
  private cooperation = 0;
  private readonly conversation = new Set<InhabitantKey>();
  private readonly interactions = new InteractionCoordinator();
  private narrativeBonds: readonly NarrativeBond[] = [];
  private readonly now: () => number;
  private readonly hour: () => number;
  constructor(
    readonly navigation: InhabitantNavigation,
    private readonly options: AgencyOptions = {},
  ) {
    this.now = options.now ?? (() => 0);
    this.hour = options.hour ?? (() => 12);
    this.randomState = options.seed ?? 0x4f3;
    this.agents = INHABITANTS.map((d, i) => ({
      ...d,
      facing: 0,
      state: "idle",
      activity: "Aguardando modelo",
      action: "idle",
      available: false,
      task: null,
      route: [],
      destination: null,
      until: 2 + i * 1.5,
      started: 0,
      blocked: 0,
      encounter: null,
      manual: false,
      socialAfter: 8 + i * 2,
      taskCount: 0,
      history: [],
      lastEvent: -30,
      interactionState: null,
      interactionTaskId: null,
    }));
    this.relations = ENCOUNTERS.map((script, i) => ({
      script,
      trust: [4, 6, 4, 7, 5, 7][i],
      affinity: [4, 6, 5, 7, 6, 8][i],
      tension: [3, 0, 2, 1, 3, 0][i],
      history: [],
      description: "Ainda se conhecem pelos hábitos desta sessão.",
      next: 0,
      count: 0,
    }));
    this.snapshot = this.makeSnapshot();
  }
  getSnapshot = (): AgencySnapshot => this.snapshot;
  subscribe = (listener: () => void) => {
    if (this.disposed) return () => {};
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  getPoses(): readonly AgentView[] {
    return this.agents.map((a) => this.view(a));
  }

  /** Save stable identity, position and intention, not animation or route frames. */
  captureContinuity(
    savedAt = new Date().toISOString(),
  ): InhabitantContinuitySnapshot {
    return {
      version: 1,
      savedAt,
      randomState: this.randomState,
      agents: this.agents.map((a) => ({
        id: a.id,
        x: a.x,
        z: a.z,
        facing: a.facing,
        phase:
          a.state === "navigate"
            ? "navigate"
            : a.state === "work" && a.task
              ? "work"
              : "idle",
        taskId: a.task?.id ?? null,
        destination:
          a.state === "navigate" && a.destination
            ? { x: a.destination.x, z: a.destination.z }
            : null,
        remainingSeconds: Math.max(0, Math.min(90, a.until - this.elapsed)),
        recentTaskIds: a.history.slice(0, 6),
        taskCount: a.taskCount,
      })),
    };
  }

  /**
   * Restore safe positions first, then only valid intentions. An interrupted
   * encounter or manual action is not replayed as a half-finished scene.
   */
  restoreContinuity(value: unknown, now = Date.now()): boolean {
    if (this.disposed) return false;
    const saved = parseInhabitantContinuity(value);
    if (!saved) return false;
    const staleActivity =
      Math.max(0, now - Date.parse(saved.savedAt)) > 15 * 60_000;
    const positioned: Array<{ x: number; z: number; radius: number }> = [];
    const valid = (a: Agent, x: number, z: number): boolean => {
      const radius = INHABITANT_ENVELOPES[a.key].travel;
      return (
        this.navigation.clear({ x, z }, { x, z }, radius) &&
        positioned.every(
          (p) => Math.hypot(p.x - x, p.z - z) >= p.radius + radius + 0.1,
        )
      );
    };
    this.randomState = saved.randomState;
    for (const a of this.agents) {
      const row = saved.agents.find((item) => item.id === a.id)!;
      const initial = INHABITANTS.find((item) => item.id === a.id)!;
      const location = [
        { x: row.x, z: row.z },
        { x: initial.x, z: initial.z },
        ...this.navigation.nodes,
      ].find((point) => valid(a, point.x, point.z));
      a.x = location?.x ?? initial.x;
      a.z = location?.z ?? initial.z;
      positioned.push({
        x: a.x,
        z: a.z,
        radius: INHABITANT_ENVELOPES[a.key].travel,
      });
      a.facing = Math.atan2(Math.sin(row.facing), Math.cos(row.facing));
      a.route = [];
      a.destination = null;
      a.encounter = null;
      a.manual = false;
      a.task = null;
      a.state = "idle";
      a.action = "idle";
      a.activity = "Retoma sua rotina na Biblioteca.";
      a.blocked = 0;
      a.taskCount = row.taskCount;
      a.history = row.recentTaskIds.filter((id) =>
        tasks.some((task) => task.id === id),
      );
      a.until = this.elapsed + 2 + this.random() * 4;
    }
    // Long absences do not run a background simulation or teleport actors.
    for (const a of this.agents) {
      const row = saved.agents.find((item) => item.id === a.id)!;
      const task = tasks.find((item) => item.id === row.taskId);
      if (!task || staleActivity) continue;
      if (
        row.phase === "work" &&
        !task.interaction &&
        distance(a, task.position) < 0.2 &&
        this.navigation.clear(
          a,
          a,
          task.kind === "experiment"
            ? INHABITANT_ENVELOPES[a.key].magic
            : task.kind === "rest" || task.kind === "observation"
              ? INHABITANT_ENVELOPES[a.key].travel
              : INHABITANT_ENVELOPES[a.key].work,
        )
      ) {
        a.task = task;
        a.state = "work";
        a.started = this.elapsed;
        a.action =
          task.kind === "experiment"
            ? "magic"
            : task.kind === "rest" ||
                (task.kind === "observation" && !task.objectId)
              ? "idle"
              : "work";
        a.activity = this.taskDescription(a, task);
        a.until = this.elapsed + Math.max(2, row.remainingSeconds);
      } else if (
        row.phase === "navigate" &&
        !task.interaction &&
        row.destination &&
        distance(row.destination, task.position) < 0.1 &&
        this.go(a, task.position)
      ) {
        a.task = task;
        a.activity = `Retoma o caminho: ${this.taskDescription(a, task)}`;
      }
    }
    this.message = "Os habitantes retomaram sua continuidade.";
    this.publish();
    return true;
  }
  setAvailable(id: string, available: boolean) {
    const a = this.agents.find((a) => a.id === id);
    if (!a || this.disposed || a.available === available) return;
    a.available = available;
    if (!available) {
      this.releaseInteraction(a);
      this.cancelMeeting(
        "Encontro interrompido: um modelo ficou indisponível.",
      );
      this.stop(a, "Modelo indisponível; rotina suspensa.", 6);
    } else if (a.state === "idle") {
      a.activity = "Observando antes de escolher uma atividade.";
    }
    this.publish();
  }
  setMode(mode: AgencyMode) {
    if (this.disposed || mode === this.mode) return;
    this.mode = mode;
    if (mode !== "running") {
      for (const agent of this.agents) {
        if (agent.task?.interaction || agent.task?.nightLampId) {
          this.releaseInteraction(agent);
          agent.task = null;
          agent.route = [];
          agent.destination = null;
          agent.state = "idle";
          agent.action = "idle";
          agent.activity =
            "Interação interrompida com segurança; o objeto permanece em sua superfície.";
          agent.until = this.elapsed + 2;
        }
      }
    }
    this.lastTime = undefined;
    this.message =
      mode === "running"
        ? "A convivência continua no mundo."
        : mode === "reduced"
          ? "Movimento reduzido: percursos e cenas autônomas suspensos, sem teletransporte."
          : mode === "paused"
            ? "Convivência pausada; posições e intenções preservadas."
            : "Ambiente 3D indisponível; nenhuma ação ou percurso adicional foi realizado.";
    this.publish();
  }
  update() {
    if (this.disposed) return;
    const time = this.now();
    if (!Number.isFinite(time)) return;
    const dt =
      this.lastTime === undefined
        ? 0
        : Math.min(0.1, Math.max(0, (time - this.lastTime) / 1000));
    this.lastTime = time;
    if (this.mode !== "running" || dt === 0) return;
    this.elapsed += dt;
    for (const a of this.agents) {
      if (!a.interactionTaskId || !a.task) continue;
      if (
        !this.interactions.renew(
          a.task.nightLampId ?? a.task.objectId ?? a.task.id,
          a.key,
          a.interactionTaskId,
          this.elapsed * 1000,
        )
      ) {
        a.interactionState = "failed";
        this.releaseInteraction(a);
        a.task = null;
        this.stop(a, "Reserva expirada; a tarefa foi interrompida com segurança.", 4);
      }
    }
    for (const a of this.agents)
      if (
        a.available &&
        !this.conversation.has(a.key) &&
        a.state === "navigate"
      )
        this.move(a, dt);
    this.logic += dt;
    if (this.logic < 0.25) return;
    this.logic %= 0.25;
    this.updateMeeting();
    for (const a of this.agents) {
      if (!a.available || a.encounter || this.conversation.has(a.key)) continue;
      if (a.state === "work" && a.task) this.face(a, a.task.facing);
      if (a.state === "navigate") {
        if (a.blocked >= 3) this.replan(a);
        continue;
      }
      if (this.elapsed < a.until) continue;
      if (a.manual) {
        a.manual = false;
        a.state = "recover";
        a.action = "recover";
        a.activity = "Retomando a intenção após atenção manual.";
        a.until = this.elapsed + 2;
        continue;
      }
      if (a.state === "work") {
        this.finishWork(a);
        continue;
      }
      if (a.state === "recover" && a.task && this.go(a, a.task.position))
        continue;
      this.chooseTask(a);
    }
    this.tryMeeting();
    this.publish();
  }
  /** Manual controls hold the current position; interrupted work is resumed by a fresh route. */
  interrupt(id: string, action: InhabitantAction): boolean {
    const a = this.agents.find((a) => a.id === id);
    if (
      !a?.available ||
      this.conversation.has(a.key) ||
      this.mode !== "running" ||
      this.disposed
    )
      return false;
    const e = INHABITANT_ENVELOPES[a.key];
    const radius =
      action === "magic" ? e.magic : action === "work" ? e.work : e.travel;
    if (!this.navigation.clear(a, a, radius, this.occupied(a))) return false;
    this.cancelMeeting("Encontro adiado para respeitar a atenção manual.", a);
    if (a.task?.interaction || a.task?.nightLampId) {
      this.releaseInteraction(a);
      a.task = null;
    }
    a.state = "react";
    a.action = action;
    a.activity = "Atenção manual; a rotina será retomada com segurança.";
    a.until = this.elapsed + 7;
    a.manual = true;
    a.route = [];
    a.destination = null;
    this.publish();
    return true;
  }
  /** Explicit narrative lease. Keeps position/yaw and task; release replans safely.
   * Actions are driven by agency poses, never by repeated manual F2 interruption. */
  setConversation(
    speaker: InhabitantKey | null,
    action: InhabitantAction = "gesture",
    ensemble = false,
    companion?: InhabitantKey,
  ) {
    if (this.disposed) return;
    const wanted = new Set<InhabitantKey>(
      speaker
        ? ensemble
          ? INHABITANTS.map((a) => a.key)
          : companion
            ? [speaker, companion]
            : [speaker]
        : [],
    );
    for (const a of this.agents) {
      if (wanted.has(a.key)) {
        if (a.task?.interaction || a.task?.nightLampId) {
          this.releaseInteraction(a);
          a.task = null;
          a.route = [];
          a.destination = null;
        }
        this.cancelMeeting(
          "Encontro adiado para uma conversa; a intenção será reconsiderada.",
          a,
        );
        this.conversation.add(a.key);
        a.state = "converse";
        const envelope = INHABITANT_ENVELOPES[a.key];
        const requested = a.key === speaker ? action : "idle";
        const radius =
          requested === "magic"
            ? envelope.magic
            : requested === "work"
              ? envelope.work
              : envelope.travel;
        a.action = this.navigation.clear(a, a, radius, this.occupied(a))
          ? requested
          : "idle";
        a.activity =
          a.key === speaker
            ? "Em conversa: mantém a posição e participa da história."
            : "Sustenta sua parte da cooperação, aguardando o próximo sinal.";
        a.route = [];
        a.destination = null;
        a.manual = false;
      } else if (this.conversation.delete(a.key)) {
        a.state = "recover";
        a.action = "recover";
        a.activity =
          "Conversa encerrada; reconsidera a intenção por uma rota segura.";
        a.until = this.elapsed + 2;
      }
    }
    this.publish();
  }
  /** Replaces only the player-choice channel. Spontaneous relation history stays intact. */
  setNarrativeBonds(bonds: readonly NarrativeBond[]) {
    if (this.disposed) return;
    this.narrativeBonds = bonds;
    this.publish();
  }
  private bondsFor(r: Relation) {
    return this.narrativeBonds.filter(
      (b) =>
        r.script.pair.includes(b.pair[0]) && r.script.pair.includes(b.pair[1]),
    );
  }
  private narrativeScore(r: Relation, metric: "trust" | "tension") {
    return clamp(
      r[metric] +
        this.bondsFor(r).reduce(
          (total, b) =>
            total +
            (metric === "trust"
              ? b.change === "friction"
                ? 0
                : 1
              : b.change === "friction"
                ? 1
                : b.change === "repair"
                  ? -1
                  : 0),
          0,
        ),
    );
  }
  perceive(
    events: readonly LivingEvent[],
    source: "user" | InhabitantKey = "user",
  ) {
    if (this.disposed || this.mode !== "running") return;
    for (const e of events.slice(0, 8)) {
      const room =
        e.objectId === "living:plant" || e.objectId === "living:globe"
          ? "room-d"
          : e.objectId === "living:clock" || e.objectId === "living:seat"
            ? "room-b"
            : e.objectId === "living:book"
              ? "room-c"
              : e.objectId === "living:cabinet" ||
                  e.objectId === "living:hearth"
                ? "room-e"
                : "room-a";
      for (const a of this.agents) {
        if (
          !a.available ||
          a.key === source ||
          a.manual ||
          this.conversation.has(a.key) ||
          a.encounter ||
          this.elapsed - a.lastEvent < 18
        )
          continue;
        const relevant =
          roomAt(a) === room || (e.type === "discovered" && a.key === "lua");
        if (!relevant) continue;
        if (a.task?.interaction || a.task?.nightLampId) {
          this.releaseInteraction(a);
          a.task = null;
        }
        a.lastEvent = this.elapsed;
        a.state = "react";
        a.action = "react";
        a.route = [];
        a.destination = null;
        a.until = this.elapsed + 2.6;
        a.activity =
          a.key === "samael"
            ? "Interrompe o café para conferir o mecanismo, discretamente."
            : a.key === "aryn"
              ? "Confere se o fenômeno precisa de assistência."
              : a.key === "ytha"
                ? "Recolhe as asas, observa e se aproxima com cuidado."
                : "Ergue o lápis, curiosa com o fenômeno próximo.";
        this.note(`${a.label}: ${a.activity}`);
      }
    }
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.listeners.clear();
    this.conversation.clear();
    this.narrativeBonds = [];
    this.meeting = null;
    this.recent = [];
    for (const a of this.agents) {
      a.route = [];
      a.history = [];
      a.task = null;
    }
    for (const r of this.relations) r.history = [];
  }
  private random() {
    this.randomState =
      (Math.imul(this.randomState, 1664525) + 1013904223) >>> 0;
    return this.randomState / 4294967296;
  }
  private occupied(
    a: Agent,
    includeDestinations = false,
  ): NavigationObstacle[] {
    return this.agents
      .filter((b) => b !== a && b.available)
      .flatMap((b) => {
        const e = INHABITANT_ENVELOPES[b.key];
        const radius =
          (b.action === "magic"
            ? e.magic
            : b.action === "work"
              ? e.work
              : e.travel) + 0.08;
        const points = [
          b,
          ...(includeDestinations && b.destination ? [b.destination] : []),
        ];
        return points.map((p) => ({
          id: b.id,
          minX: p.x - radius,
          maxX: p.x + radius,
          minZ: p.z - radius,
          maxZ: p.z + radius,
        }));
      });
  }
  private go(a: Agent, destination: Position) {
    const route = this.navigation.route(
      a,
      destination,
      INHABITANT_ENVELOPES[a.key].travel,
      this.occupied(a, true),
    );
    if (!route) return false;
    a.destination = destination;
    a.route = route;
    a.state = "navigate";
    a.started = this.elapsed;
    a.action = "walk";
    a.blocked = 0;
    return true;
  }
  private move(a: Agent, dt: number) {
    const next = a.route[0];
    if (!next) {
      this.arrive(a);
      return;
    }
    const e = INHABITANT_ENVELOPES[a.key],
      d = distance(a, next),
      step = Math.min(d, e.speed * dt);
    if (d < 0.005) {
      a.route = a.route.slice(1);
      return;
    }
    const p = {
      x: a.x + ((next.x - a.x) * step) / d,
      z: a.z + ((next.z - a.z) * step) / d,
    };
    if (!this.navigation.clear(a, p, e.travel, this.occupied(a))) {
      a.blocked += dt;
      a.action = "idle";
      return;
    }
    a.x = p.x;
    a.z = p.z;
    a.action = "walk";
    a.blocked = 0;
    const target = Math.atan2(next.x - a.x, next.z - a.z);
    this.face(a, target, dt * 4);
    if (step === d) a.route = a.route.slice(1);
  }
  private face(a: Agent, target: number, step = 0.45) {
    const diff = Math.atan2(
      Math.sin(target - a.facing),
      Math.cos(target - a.facing),
    );
    a.facing += Math.max(-step, Math.min(step, diff));
  }
  private replan(a: Agent) {
    const destination = a.destination;
    if (destination && this.go(a, destination)) return;
    // Release blocked intentions rather than push through another inhabitant.
    if (a.encounter) {
      this.cancelMeeting(
        "O caminho ficou ocupado; o encontro será tentado mais tarde.",
      );
      return;
    }
    this.stop(
      a,
      "Caminho ocupado; aguarda outra oportunidade.",
      4 + this.random() * 3,
    );
    a.task = null;
  }
  private arrive(a: Agent) {
    a.destination = null;
    a.route = [];
    a.action = "idle";
    if (a.encounter) {
      a.state = "socialize";
      a.activity = "Aguarda o outro habitante chegar.";
      return;
    }
    const task = a.task;
    if (!task) {
      this.stop(a, "Observando o movimento da Biblioteca.", 5);
      return;
    }
    const envelope = INHABITANT_ENVELOPES[a.key];
    const reach =
      task.kind === "experiment"
        ? envelope.magic
        : task.kind === "rest" || task.kind === "observation"
          ? envelope.travel
          : envelope.work;
    if (!this.navigation.clear(a, a, reach, this.occupied(a))) {
      this.stop(a, "Aguarda espaço para o gesto da atividade.", 3);
      a.task = null;
      return;
    }
    a.state = "work";
    a.started = this.elapsed;
    this.face(a, task.facing);
    a.action =
      task.kind === "rest" || (task.kind === "observation" && !task.objectId)
        ? "idle"
        : task.kind === "experiment"
          ? "magic"
          : "work";
    a.activity = this.taskDescription(a, task);
    if (task.nightLampId && a.interactionTaskId) {
      const lamp = this.options.nightLighting?.pending().find(
        (fixture) => fixture.id === task.nightLampId,
      );
      if (
        !lamp ||
        distance(a, lamp) > 2.8 ||
        !this.interactions.owns(lamp.id, a.key, a.interactionTaskId, this.elapsed * 1000)
      ) {
        this.stop(a, "A luminária está fora de alcance; tarefa liberada.", 4);
        a.task = null;
        return;
      }
      a.action = "gesture";
      a.activity = "Ergue a mão e invoca uma chama âmbar na luminária.";
      a.until = this.elapsed + 1.2;
      return;
    }
    if (task.interaction && a.interactionTaskId) {
      if (a.interactionState === "carrying") {
        a.interactionState = "placing";
        a.action = "gesture";
        a.activity = "Posiciona o livro sobre a bancada.";
        a.until = this.elapsed + 1;
        return;
      }
      if (a.interactionState === "returning") {
        a.interactionState = "completed";
        this.options.onEnvironmentAction?.(a.key, "living:book");
        this.stop(a, "Devolveu o livro e liberou a superfície.", 5);
        a.task = null;
        return;
      }
    }
    if (task.interaction) {
      const taskId = `${task.id}:${a.key}`;
      if (
        this.interactions.reserve(
          task.objectId ?? task.id,
          a.key,
          taskId,
          this.elapsed * 1000,
        )
      ) {
        a.interactionTaskId = taskId;
        a.interactionState = "orienting";
        a.until = this.elapsed + 0.8;
        a.action = "turn";
        a.activity = "Orienta-se para pegar o livro cenográfico.";
        return;
      }
      a.task = null;
      this.stop(a, "O livro está reservado por outro habitante.", 4);
      return;
    }
    a.until =
      this.elapsed +
      (task.kind === "experiment"
        ? 5
        : 12 + this.random() * 15 + (a.key === "samael" ? 7 : 0));
    a.history = [task.id, ...a.history].slice(0, 6);
  }
  private taskDescription(a: Agent, t: Task) {
    if (t.kind === "rest")
      return a.key === "samael"
        ? "Descansa com o café, atento aos demais."
        : a.key === "ytha"
          ? "Repousa as asas e acompanha as histórias ao redor."
          : "Faz uma pausa e observa a convivência.";
    if (t.kind === "plant")
      return a.key === "ytha"
        ? "Cuida da planta estrelada com gestos delicados."
        : a.key === "lua"
          ? "Desenha as folhas para uma ideia de feitiço."
          : "Inspeciona o suporte da planta cenográfica.";
    if (t.kind === "experiment")
      return "Lua testa um símbolo no folio cenográfico; a magia ainda está instável.";
    if (t.kind === "reading")
      return "Lê ficção no próprio volume cenográfico, longe dos registros pessoais.";
    if (t.kind === "observation")
      return a.key === "samael"
        ? "Confere o mecanismo com paciência pragmática."
        : "Observa o ambiente e procura uma nova ideia.";
    return a.key === "samael"
      ? "Alterna café, notebook ficcional e anotações."
      : a.key === "aryn"
        ? "Inspeciona uma folha de treino para restauração."
        : a.key === "lua"
          ? "Desenha e revisa o grimório com o lápis em movimento."
          : "Lê e observa os detalhes de uma flor cenográfica.";
  }
  private chooseNightTask(a: Agent): boolean {
    const ritual = this.options.nightLighting;
    if (!ritual || ritual.getSnapshot().cycleKey === null) return false;
    const envelope = INHABITANT_ENVELOPES[a.key];
    for (const lamp of [...ritual.pending()].sort(
      (left, right) => distance(a, left) - distance(a, right),
    )) {
      const candidates = this.navigation.nodes
        .filter((point) => roomAt(point) === lamp.roomId && distance(point, lamp) <= 2.8)
        .sort((left, right) => distance(left, lamp) - distance(right, lamp));
      for (const position of candidates) {
        if (!this.navigation.clear(position, position, envelope.work, this.occupied(a, true)))
          continue;
        const taskId = `night:${ritual.getSnapshot().cycleKey}:${lamp.id}:${a.key}`;
        if (!this.interactions.reserve(lamp.id, a.key, taskId, this.elapsed * 1000))
          break;
        if (this.go(a, position)) {
          a.task = {
            id: taskId,
            kind: "observation",
            position,
            facing: Math.atan2(lamp.x - position.x, lamp.z - position.z),
            label: "ritual noturno de acendimento",
            nightLampId: lamp.id,
          };
          a.interactionTaskId = taskId;
          a.activity = "A caminho de um abajur para o ritual noturno.";
          return true;
        }
        this.interactions.release(lamp.id, a.key, taskId);
      }
    }
    return false;
  }

  private chooseTask(a: Agent) {
    if (this.chooseNightTask(a)) return;
    const night = this.hour() < 6 || this.hour() >= 18;
    const scored = tasks
      .map((t) => {
        let score = preferences[a.key][t.kind];
        if (a.history.includes(t.id)) score -= 8;
        if (a.task?.id === t.id) score -= 10;
        if (roomAt(a) !== roomAt(t.position)) score += 2;
        if (t.kind === "rest") score += a.taskCount % 3 === 2 ? 7 : 0;
        if (a.key === "samael")
          score += night
            ? t.kind === "study"
              ? 4
              : 0
            : t.kind === "rest"
              ? 3
              : 0;
        if (a.key === "aryn" && !night && t.kind === "study") score += 3;
        if (
          t.kind === "experiment" &&
          (this.cosmetic !== "intact" || this.elapsed < this.incidentAfter)
        )
          score -= 10;
        score -= distance(a, t.position) * 0.1;
        return { task: t, score: score + this.random() * 1.5 };
      })
      .sort((a, b) => b.score - a.score);
    for (const { task, score } of scored) {
      if (score <= 0) continue;
      const e = INHABITANT_ENVELOPES[a.key],
        radius =
          task.kind === "experiment"
            ? e.magic
            : task.kind === "rest" || task.kind === "observation"
              ? e.travel
              : e.work;
      if (
        !this.navigation.clear(
          task.position,
          task.position,
          radius,
          this.occupied(a, true),
        )
      )
        continue;
      if (this.go(a, task.position)) {
        a.task = task;
        a.activity = `A caminho: ${this.taskDescription(a, task)}`;
        return;
      }
    }
    this.stop(
      a,
      "O espaço está ocupado; repousa antes de tentar outra atividade.",
      5,
    );
  }
  private finishWork(a: Agent) {
    a.taskCount++;
    if (a.task?.nightLampId) {
      const lampId = a.task.nightLampId;
      const valid =
        a.interactionTaskId !== null &&
        this.interactions.owns(lampId, a.key, a.interactionTaskId, this.elapsed * 1000);
      if (valid && this.options.nightLighting?.complete(lampId)) {
        this.note(`${a.label} reacende uma luminária. A Biblioteca responde em âmbar.`);
        this.stop(a, "Concluiu o ritual de acendimento.", 4);
      } else {
        this.stop(a, "O ritual foi interrompido; a luz permanece funcional.", 4);
      }
      a.task = null;
      return;
    }
    if (
      a.task?.kind === "experiment" &&
      this.elapsed >= this.incidentAfter &&
      this.cosmetic === "intact"
    ) {
      this.cosmetic = "damaged-cosmetic";
      this.repairRequested = true;
      this.incidentAfter = this.elapsed + 240;
      this.note(
        "O símbolo de Lua escapa do papel: o folio de treino se dobra e fica chamuscado. Lua se encolhe, constrangida; nada da coleção foi atingido.",
      );
      a.action = "react";
      a.state = "react";
      a.activity =
        "Olha o folio chamuscado e procura ajuda, sem abandonar o erro.";
      a.until = this.elapsed + 4;
      for (const b of this.agents)
        if (
          b !== a &&
          b.available &&
          roomAt(b) === roomAt(a) &&
          !b.encounter &&
          !b.manual &&
          !this.conversation.has(b.key)
        ) {
          b.state = "react";
          b.action = "react";
          b.until = this.elapsed + 3;
          b.activity = "Percebe a falha mágica e confere se Lua está bem.";
          b.route = [];
          b.destination = null;
        }
      return;
    }
    if (a.task?.interaction) {
      this.advanceInteraction(a);
      return;
    }
    if (a.task?.objectId)
      this.options.onEnvironmentAction?.(a.key, a.task.objectId);
    a.task = null;
    this.stop(
      a,
      "Concluiu a atividade; dá espaço aos outros e repousa.",
      4 + this.random() * 5,
    );
  }
  private stop(a: Agent, activity: string, seconds: number) {
    this.releaseInteraction(a);
    a.state = "idle";
    a.action = "idle";
    a.activity = activity;
    a.route = [];
    a.destination = null;
    a.until = this.elapsed + seconds;
    a.blocked = 0;
  }
  private releaseInteraction(a: Agent) {
    if (a.interactionTaskId) {
      const resourceId = a.task?.nightLampId ?? a.task?.objectId;
      if (resourceId)
        this.interactions.release(resourceId, a.key, a.interactionTaskId);
    }
    a.interactionTaskId = null;
    a.interactionState = null;
  }
  private advanceInteraction(a: Agent) {
    const task = a.task;
    if (!task?.interaction || !a.interactionTaskId) return;
    const now = this.elapsed * 1000;
    if (
      !this.interactions.owns(
        task.objectId ?? task.id,
        a.key,
        a.interactionTaskId,
        now,
      )
    ) {
      a.interactionState = "failed";
      this.releaseInteraction(a);
      a.task = null;
      this.stop(a, "A reserva expirou; o livro permanece no mundo.", 4);
      return;
    }
    if (a.interactionState === "orienting") {
      if (distance(a, task.interaction.source) > task.interaction.reach) {
        a.interactionState = "failed";
        this.releaseInteraction(a);
        a.task = null;
        this.stop(a, "Não alcança o livro; a interação foi cancelada.", 4);
        return;
      }
      a.interactionState = "picking";
      a.action = "gesture";
      a.activity = "Estende a mão e pega o livro cenográfico.";
      a.until = this.elapsed + 0.9;
      return;
    }
    if (a.interactionState === "picking") {
      a.interactionState = "carrying";
      a.action = "walk";
      a.activity = "Transporta o livro até uma superfície válida.";
      a.until = this.elapsed;
      if (this.go(a, task.interaction.destination)) return;
    }
    if (a.interactionState === "carrying" && a.state === "work") {
      a.interactionState = "placing";
      a.action = "gesture";
      a.activity = "Posiciona o livro sobre a bancada.";
      a.until = this.elapsed + 1;
      return;
    }
    if (a.interactionState === "placing") {
      a.interactionState = "recollecting";
      a.action = "gesture";
      a.activity = "Recolhe o livro para devolvê-lo à estante.";
      a.until = this.elapsed + 0.7;
      return;
    }
    if (a.interactionState === "recollecting") {
      a.interactionState = "returning";
      a.action = "walk";
      a.activity = "Devolve o livro ao ponto cenográfico original.";
      a.until = this.elapsed;
      if (this.go(a, task.interaction.approach)) return;
    }
    if (a.interactionState === "returning" && a.state === "work") {
      a.interactionState = "completed";
      this.options.onEnvironmentAction?.(a.key, "living:book");
      this.stop(a, "Devolveu o livro e liberou a superfície.", 5);
      a.task = null;
    }
  }
  private tryMeeting() {
    if (this.meeting || this.elapsed < this.socialAfter) return;
    const available = (a: Agent) =>
      a.available &&
      !a.manual &&
      !this.conversation.has(a.key) &&
      !a.encounter &&
      !a.task?.nightLampId &&
      (a.state === "idle" ||
        (a.state === "work" && this.elapsed - a.started >= 8) ||
        (a.state === "navigate" && this.elapsed - a.started >= 15));
    // An already-familiar pair does not repeatedly take the time reserved for
    // someone still waiting to meet. Repair remains an immediate exception.
    const unseen = this.relations.some((r) => r.count === 0);
    const ranked = this.relations
      .filter(
        (r) =>
          this.elapsed >= r.next &&
          (!unseen || r.count === 0 || this.repairRequested),
      )
      .map((r) => ({
        r,
        score:
          (r.count === 0 ? 30 : 0) +
          r.affinity +
          this.narrativeScore(r, "trust") -
          this.narrativeScore(r, "tension") * 1.4 +
          (r.script.pair.includes("aryn") ? this.cooperation * 0.3 : 0) +
          this.random() * 2 +
          (r.script.pair.includes("samael") ? -3 : 2),
      }))
      .sort((a, b) => b.score - a.score);
    if (this.repairRequested)
      ranked.sort(
        (a, b) =>
          Number(
            b.r.script.pair.includes("lua") && b.r.script.pair.includes("aryn"),
          ) -
          Number(
            a.r.script.pair.includes("lua") && a.r.script.pair.includes("aryn"),
          ),
      );
    for (const { r } of ranked) {
      const pair = r.script.pair.map((k) =>
        this.agents.find((a) => a.key === k)!,
      );
      // Samael usually accepts company rather than initiating it.
      const initiator =
        pair.find((a) => a.key === "aryn") ??
        (this.narrativeScore(r, "trust") >= 8
          ? pair.find((a) => a.key === "ytha")
          : undefined) ??
        pair.find((a) => a.key === "lua") ??
        pair.find((a) => a.key === "ytha") ??
        pair[0];
      const a = initiator,
        b = pair.find((a) => a !== initiator)!;
      const repair =
        this.repairRequested &&
        r.script.pair.includes("lua") &&
        (r.script.pair.includes("aryn") ||
          r.script.pair.includes("ytha") ||
          r.script.pair.includes("samael"));
      if (
        !available(a) ||
        !available(b) ||
        (!repair &&
          (this.elapsed < a.socialAfter || this.elapsed < b.socialAfter))
      )
        continue;
      const site = this.findMeetingSite(a, b, r.script.place, repair);
      if (!site) continue;
      const [pa, pb] = site;
      // Reserve both destinations before either starts moving.
      if (!this.go(a, pa)) continue;
      if (!this.go(b, pb)) {
        this.stop(a, "Aguarda uma oportunidade de encontro.", 4);
        continue;
      }
      a.encounter = r.script.id;
      b.encounter = r.script.id;
      a.task = null;
      b.task = null;
      a.activity = `Vai encontrar ${b.label}${repair ? " para reparar o folio de treino" : " por iniciativa própria"}.`;
      b.activity = `Aceita encontrar ${a.label}${repair ? " e assumir a reparação" : ""}.`;
      this.meeting = {
        relation: r,
        actors: [a, b],
        phase: 0,
        until: 0,
        deadline: this.elapsed + 110,
        repair,
        positions: [pa, pb],
      };
      this.note(
        `${a.label} e ${b.label} combinam uma aproximação${repair ? " para cuidar do acidente cenográfico" : ""}.`,
      );
      return;
    }
    this.socialAfter = this.elapsed + 5;
  }
  private findMeetingSite(
    a: Agent,
    b: Agent,
    place: EncounterScript["place"],
    repair: boolean,
  ): readonly [Position, Position] | null {
    const centers = repair
      ? tasks.filter((t) => t.id === "lua-practice")
      : tasks.filter(
          (t) => t.kind === place || (place === "plant" && t.kind === "plant"),
        );
    const separation =
      INHABITANT_ENVELOPES[a.key].work + INHABITANT_ENVELOPES[b.key].work + 0.5;
    for (const t of [...centers].sort(
      (p, q) =>
        distance(a, p.position) +
        distance(b, p.position) -
        distance(a, q.position) -
        distance(b, q.position),
    )) {
      const spots = [
        t.position,
        ...this.navigation.nodes.filter(
          (p) =>
            roomAt(p) === roomAt(t.position) && distance(p, t.position) < 5,
        ),
        ...[-2, 0, 2].flatMap((x) =>
          [-2, 0, 2].map((z) => ({ x: t.position.x + x, z: t.position.z + z })),
        ),
      ];
      const ea = INHABITANT_ENVELOPES[a.key],
        eb = INHABITANT_ENVELOPES[b.key];
      const freeA = spots.filter((p) =>
        this.navigation.clear(p, p, ea.work, this.occupied(a)),
      );
      const freeB = spots.filter((p) =>
        this.navigation.clear(p, p, eb.work, this.occupied(b)),
      );
      for (const p of freeA)
        for (const q of freeB) {
          if (distance(p, q) < separation || distance(p, q) > 4.5) continue;
          if (
            this.agents.some(
              (c) =>
                c !== a &&
                c !== b &&
                c.destination &&
                (distance(p, c.destination) < 2 ||
                  distance(q, c.destination) < 2),
            )
          )
            continue;
          if (
            this.navigation.route(a, p, ea.travel, this.occupied(a)) &&
            this.navigation.route(b, q, eb.travel, this.occupied(b))
          )
            return [p, q];
        }
    }
    return null;
  }
  private updateMeeting() {
    const m = this.meeting;
    if (!m) return;
    const [a, b] = m.actors;
    if (this.elapsed > m.deadline) {
      this.cancelMeeting("O encontro foi adiado para liberar a circulação.");
      return;
    }
    if (a.state === "navigate" || b.state === "navigate") return;
    this.face(a, Math.atan2(b.x - a.x, b.z - a.z));
    this.face(b, Math.atan2(a.x - b.x, a.z - b.z));
    if (this.elapsed < m.until) return;
    const script = m.relation.script;
    if (m.phase === 0) {
      a.state = b.state = "socialize";
      a.action = b.action = "gesture";
      this.beat(
        m,
        m.repair
          ? `${a.key === "lua" ? b.label : a.label} dá espaço para Lua mostrar o erro. A ajuda é oferecida, sem tomar o grimório de suas mãos.`
          : script.opening,
        4,
      );
    } else if (m.phase === 1) {
      a.action = b.action = "react";
      this.beat(
        m,
        m.repair
          ? "Lua reconhece o símbolo invertido e aceita companhia para refazê-lo."
          : this.cooperation > 0 && script.id === "permission-to-try"
            ? "Aryn já aprendeu a esperar: pede o sinal de Lua antes de apontar o traço."
            : script.friction,
        3,
      );
      if (!m.repair && script.tension > 0) {
        m.relation.tension = clamp(m.relation.tension + 2);
        this.relationNote(
          m.relation,
          "Um atrito foi reconhecido; o par continua disponível para reparação.",
        );
      }
    } else if (m.phase === 2) {
      if (m.repair) this.cosmetic = "repairing";
      for (const c of m.actors) {
        const e = INHABITANT_ENVELOPES[c.key];
        c.action = this.navigation.clear(c, c, e.magic, this.occupied(c))
          ? "magic"
          : this.navigation.clear(c, c, e.work, this.occupied(c))
            ? "work"
            : "gesture";
      }
      this.beat(
        m,
        m.repair
          ? "Lua refaz o símbolo enquanto a ajuda sustenta o papel. O folio cenográfico se recompõe com luz suave."
          : script.cooperation,
        5,
      );
    } else if (m.phase === 3) {
      a.action = b.action = "recover";
      if (m.repair) {
        this.cosmetic = "intact";
        this.repairRequested = false;
        this.note(
          "O folio de treino está intacto. Lua agradece a parceria; o acidente terminou sem tocar nos registros.",
        );
      }
      m.relation.trust = clamp(m.relation.trust + script.trust);
      m.relation.affinity = clamp(m.relation.affinity + 1);
      m.relation.tension = clamp(
        m.relation.tension + (m.repair ? -4 : script.tension),
      );
      m.relation.count++;
      if (script.pair.includes("aryn"))
        this.cooperation = clamp(this.cooperation + 1);
      this.relationNote(
        m.relation,
        m.repair
          ? "A reparação compartilhada aumentou a confiança e aliviou a tensão."
          : script.resolution,
      );
      if (script.place === "plant")
        this.options.onEnvironmentAction?.("ytha", "living:plant");
      this.beat(
        m,
        m.repair
          ? "Lua recupera a postura; a ajuda reconhece sua iniciativa de corrigir o erro."
          : script.resolution,
        4,
      );
    } else {
      m.relation.next = this.elapsed + 100 + this.random() * 60;
      for (const c of m.actors) {
        c.encounter = null;
        c.socialAfter = this.elapsed + 35;
        this.stop(
          c,
          "Guarda o encontro na memória e retoma seus próprios interesses.",
          6 + this.random() * 5,
        );
      }
      this.meeting = null;
      this.socialAfter = this.elapsed + 18;
      return;
    }
    m.phase++;
  }
  private beat(m: Meeting, text: string, duration: number) {
    for (const a of m.actors) a.activity = text;
    m.until = this.elapsed + duration;
    this.note(text);
  }
  private cancelMeeting(reason: string, actor?: Agent) {
    const m = this.meeting;
    if (!m || (actor && !m.actors.includes(actor))) return;
    for (const a of m.actors) {
      a.encounter = null;
      a.socialAfter = this.elapsed + 12;
      this.stop(a, reason, 4);
    }
    m.relation.next = this.elapsed + 15;
    this.meeting = null;
    this.socialAfter = this.elapsed + 8;
    if (this.cosmetic === "repairing") this.cosmetic = "damaged-cosmetic";
    this.note(reason);
  }
  private relationNote(r: Relation, text: string) {
    r.description = text;
    r.history = [text, ...r.history].slice(0, 5);
  }
  private note(text: string) {
    this.message = text;
    this.recent = [text, ...this.recent].slice(0, 8);
  }
  private view(a: Agent): AgentView {
    return {
      id: a.id,
      key: a.key,
      label: a.label,
      x: a.x,
      z: a.z,
      facing: a.facing,
      state: this.mode !== "running" ? "paused" : a.state,
      activity: !a.available
        ? "Modelo indisponível ou carregando; nenhuma atividade executada."
        : a.activity,
      action: a.action,
      available: a.available,
      interactionObjectId: a.interactionState
        ? (a.task?.objectId ?? null)
        : null,
      interactionState: a.interactionState,
      room: roomAt(a)?.replace("room-", "Cômodo ").toUpperCase() ?? "Passagem",
      destination: a.destination ? { ...a.destination } : null,
    };
  }
  private makeSnapshot(): AgencySnapshot {
    return {
      mode: this.mode,
      message: this.message,
      revision: this.revision,
      agents: this.agents.map((a) => this.view(a)),
      relations: this.relations.map((r) => ({
        id: r.script.id,
        pair: r.script.pair,
        trust: this.narrativeScore(r, "trust"),
        affinity: r.affinity,
        tension: this.narrativeScore(r, "tension"),
        description: r.description,
        history: [...r.history],
        narrativeHistory: this.bondsFor(r)
          .slice(-5)
          .map((b) => b.text),
      })),
      recent: [...this.recent],
      cosmetic: this.cosmetic,
    };
  }
  private publish() {
    this.revision++;
    this.snapshot = this.makeSnapshot();
    for (const listener of this.listeners) listener();
  }
}
