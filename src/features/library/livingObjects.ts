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
  private snapshot: LivingSnapshot = {
    objects: Object.fromEntries(
      LIVING_OBJECTS.map((o) => [o.objectId, { active: false, turns: 0 }]),
    ),
    atmosphere: "tranquila",
    discovery: 0,
    message: "Explore os cinco cômodos.",
    revision: 0,
  };
  private listeners = new Set<() => void>();
  private disposed = false;
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
    if (objectId === "living:table" && action === "examine") {
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
      message =
        "Você encontrou a estrela de latão: “Toda história começa com alguém que acende uma luz.”";
      if (this.snapshot.discovery !== 4)
        events.push({ type: "discovered", objectId });
    }
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
