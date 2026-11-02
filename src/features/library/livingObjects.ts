/** Environmental session only: no conventional record identities or persistence. */
export type LivingFamily =
  | "shelf"
  | "table"
  | "lamp"
  | "seat"
  | "cabinet"
  | "plant"
  | "book"
  | "clock"
  | "globe"
  | "hearth";
export type LivingAction = "examine" | "toggle" | "turn" | "touch";
export type Atmosphere = "tranquila" | "noturna" | "encantada";

/** Clock is local to the device, with no network or location access. */
export function atmosphereForHour(hour: number): Atmosphere {
  return hour >= 6 && hour < 18 ? "tranquila" : "noturna";
}

const STUDY_CONTEXT_MS = 5 * 60_000;
const DISCOVERY_MAGIC_MS = 2 * 60_000;

export interface LivingObject {
  readonly objectId: string;
  readonly family: LivingFamily;
  readonly room: string;
  readonly label: string;
  readonly description: string;
  readonly anchor: string;
  readonly actions: readonly LivingAction[];
}
export const LIVING_OBJECTS: readonly LivingObject[] = [
  {
    objectId: "living:shelf",
    family: "shelf",
    room: "A",
    label: "Entalhe da estante",
    description: "Uma estrela entalhada na madeira antiga.",
    anchor: "reading-shelf-01",
    actions: ["examine", "touch"],
  },
  {
    objectId: "living:table",
    family: "table",
    room: "A",
    label: "Pergaminho da luz",
    description: "Um pergaminho aparentemente vazio sobre a mesa.",
    anchor: "bf4-prop:0",
    actions: ["examine", "turn"],
  },
  {
    objectId: "living:lamp",
    family: "lamp",
    room: "A",
    label: "Luminária do pergaminho",
    description: "A luz quente alcança os traços do pergaminho.",
    anchor: "bf4-prop:0",
    actions: ["examine", "toggle", "turn"],
  },
  {
    objectId: "living:seat",
    family: "seat",
    room: "B",
    label: "Poltrona de veludo",
    description: "Uma almofada macia que cede ao toque.",
    anchor: "bf4-prop:6",
    actions: ["examine", "touch"],
  },
  {
    objectId: "living:cabinet",
    family: "cabinet",
    room: "E",
    label: "Armário da memória",
    description: "Uma gaveta guarda um pequeno mecanismo antigo.",
    anchor: "bf4-prop:16",
    actions: ["examine", "toggle"],
  },
  {
    objectId: "living:plant",
    family: "plant",
    room: "D",
    label: "Planta estrelada",
    description: "Folhas respondem ao cuidado; flores surgem ao toque.",
    anchor: "bf4-prop:13",
    actions: ["examine", "touch", "toggle"],
  },
  {
    objectId: "living:book",
    family: "book",
    room: "C",
    label: "Livro da estrela",
    description:
      "Livro decorativo de contos da Biblioteca. Não pertence à coleção pessoal.",
    anchor: "bf4-prop:9",
    actions: ["examine", "toggle", "turn"],
  },
  {
    objectId: "living:clock",
    family: "clock",
    room: "B",
    label: "Relógio de latão",
    description: "Um mecanismo manual marca o tempo das histórias.",
    anchor: "bf4-prop:7",
    actions: ["examine", "turn"],
  },
  {
    objectId: "living:globe",
    family: "globe",
    room: "D",
    label: "Globo das constelações",
    description: "Um mapa fictício gravado em latão.",
    anchor: "bf4-prop:12",
    actions: ["examine", "turn"],
  },
  {
    objectId: "living:hearth",
    family: "hearth",
    room: "E",
    label: "Braseiro de leitura",
    description: "Brasas encantadas aquecem a luz deste canto.",
    anchor: "bf4-prop:15",
    actions: ["examine", "toggle"],
  },
];
export interface LivingState {
  readonly active: boolean;
  readonly turns: number;
}
export interface LivingSnapshot {
  readonly objects: Readonly<Record<string, LivingState>>;
  readonly atmosphere: Atmosphere;
  readonly discovery: 0 | 1 | 2 | 3 | 4;
  readonly message: string;
  readonly revision: number;
}
export interface LivingEvent {
  readonly type:
    "acted" | "inscription" | "mechanism" | "discovered" | "atmosphere";
  readonly objectId: string;
}
export class LivingSession {
  private snapshot: LivingSnapshot;
  private readonly listeners = new Set<() => void>();
  private disposed = false;
  private studyUntil = 0;
  private magicUntil = 0;

  constructor(private readonly now: () => Date = () => new Date()) {
    this.snapshot = {
      objects: Object.fromEntries(
        LIVING_OBJECTS.map((o) => [o.objectId, { active: false, turns: 0 }]),
      ),
      atmosphere: atmosphereForHour(now().getHours()),
      discovery: 0,
      message: "Explore os cinco cômodos.",
      revision: 0,
    };
  }

  /** Avoid a frame-level clock poll: call on mount, visibility return and minute ticks. */
  refreshContext(): void {
    if (this.disposed) return;
    const atmosphere = this.resolveAtmosphere();
    if (atmosphere !== this.snapshot.atmosphere) {
      this.publish({ ...this.snapshot, atmosphere });
    }
  }

  private resolveAtmosphere(): Atmosphere {
    const date = this.now();
    const time = date.getTime();
    if (time < this.magicUntil) return "encantada";
    if (time < this.studyUntil) return "tranquila";
    return atmosphereForHour(date.getHours());
  }

  /** Primary action is invoked by an eligible canvas tap, never by selection itself. */
  actPrimary(objectId: string): readonly LivingEvent[] {
    const object = LIVING_OBJECTS.find((item) => item.objectId === objectId);
    if (!object) return [];
    const action: LivingAction =
      object.family === "table" || object.family === "clock" ||
      object.family === "globe"
        ? "turn"
        : object.family === "seat" || object.family === "shelf"
          ? "touch"
          : object.family === "cabinet" &&
              this.snapshot.discovery >= 3 &&
              this.snapshot.objects[objectId]?.active
            ? "examine"
            : "toggle";
    return this.act(objectId, action);
  }
  getSnapshot = (): LivingSnapshot => this.snapshot;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  setAtmosphere(atmosphere: Atmosphere): void {
    if (
      this.disposed ||
      !["tranquila", "noturna", "encantada"].includes(atmosphere)
    )
      return;
    this.publish({
      ...this.snapshot,
      atmosphere,
      message: `Atmosfera ${atmosphere}.`,
    });
  }
  act(objectId: string, action: LivingAction): readonly LivingEvent[] {
    const object = LIVING_OBJECTS.find((o) => o.objectId === objectId);
    if (this.disposed || !object || !object.actions.includes(action)) return [];
    const previous = this.snapshot.objects[objectId];
    if (!previous) return [];
    const objects = { ...this.snapshot.objects };
    let discovery = this.snapshot.discovery;
    let atmosphere = this.snapshot.atmosphere;
    let message = object.description;
    const now = this.now().getTime();
    // Reading/study is a short-lived ambient context, not a personal-data query.
    if (
      (object.family === "table" || object.family === "book" ||
        object.family === "shelf") &&
      (action === "examine" || action === "turn" || action === "toggle")
    ) {
      this.studyUntil = now + STUDY_CONTEXT_MS;
    }
    const events: LivingEvent[] = [{ type: "acted", objectId }];
    if (action !== "examine") {
      objects[objectId] = {
        active:
          action === "toggle" || action === "touch" ? !previous.active : true,
        turns:
          previous.turns + (action === "turn" || action === "touch" ? 1 : 0),
      };
      message = `${object.label}: ${action === "turn" ? "mecanismo girado" : objects[objectId]?.active ? "ativado" : "recolhido"}.`;
    }
    if (
      objectId === "living:lamp" &&
      objects[objectId]?.active &&
      discovery === 0
    ) {
      discovery = 1;
      message = "A luz revela uma estrela e inscrições no pergaminho.";
      events.push({ type: "inscription", objectId: "living:table" });
    }
    if (
      objectId === "living:table" &&
      (action === "examine" || action === "turn")
    ) {
      if (discovery >= 1) {
        discovery = discovery === 1 ? 2 : discovery;
        message =
          "A inscrição diz: no cômodo C, abra o Livro da estrela. Sua luz guarda a memória do cômodo E.";
      } else
        message =
          "O pergaminho está escuro. A luminária ao lado pode revelar seus traços.";
    }
    if (
      objectId === "living:book" &&
      action === "toggle" &&
      objects[objectId]?.active
    ) {
      if (discovery === 2) {
        discovery = 3;
        objects["living:cabinet"] = { active: true, turns: 0 };
        this.magicUntil = now + DISCOVERY_MAGIC_MS;
        atmosphere = "encantada";
        message =
          "O livro gira uma chave oculta. No cômodo E, a gaveta se abre e revela uma estrela de latão.";
        events.push({ type: "mechanism", objectId: "living:cabinet" });
      } else if (discovery < 2)
        message =
          "O livro abre suas páginas. Uma estrela parece aguardar uma pista.";
    }
    if (
      objectId === "living:cabinet" &&
      action === "examine" &&
      discovery >= 3 &&
      objects[objectId]?.active
    ) {
      discovery = 4;
      this.magicUntil = now + DISCOVERY_MAGIC_MS;
      atmosphere = "encantada";
      message =
        "Você encontrou a estrela de latão: “Toda história começa com alguém que acende uma luz.”";
      if (this.snapshot.discovery !== 4)
        events.push({ type: "discovered", objectId });
    }
    // Special discoveries override short study context, which overrides local time.
    atmosphere = this.resolveAtmosphere();
    this.publish({
      objects,
      discovery,
      atmosphere,
      message,
      revision: this.snapshot.revision,
    });
    return events;
  }
  dispose(): void {
    this.disposed = true;
    this.listeners.clear();
  }
  private publish(snapshot: LivingSnapshot): void {
    this.snapshot = { ...snapshot, revision: this.snapshot.revision + 1 };
    for (const listener of this.listeners) listener();
  }
}
