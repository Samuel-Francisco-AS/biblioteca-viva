import type { InhabitantKey } from "../inhabitants";
import type {
  Condition,
  DialogueNode,
  NarrativeEffect,
  NarrativeSnapshot,
  QuestId,
} from "./contracts";
import { QUEST_IDS, STORIES } from "./stories";

/** Pure conditions; narrative definitions have no executable callbacks. */
export function matches(
  condition: Condition | undefined,
  state: NarrativeSnapshot,
): boolean {
  if (!condition) return true;
  switch (condition.kind) {
    case "fact":
      return state.facts.includes(condition.fact) !== Boolean(condition.absent);
    case "all":
      return condition.conditions.every((c) => matches(c, state));
    case "resolved":
      return state.quests[condition.quest].status === "resolved";
  }
}
export function nodeFor(
  state: NarrativeSnapshot,
  quest = state.active,
): DialogueNode | null {
  return quest
    ? (STORIES[quest].nodes.find(
        (n) => n.nodeId === state.quests[quest].nodeId,
      ) ?? null)
    : null;
}
export function textFor(node: DialogueNode, state: NarrativeSnapshot): string {
  return (
    node.variants?.find((v) => matches(v.condition, state))?.text ?? node.text
  );
}
export function outcomeFor(
  node: DialogueNode,
  state: NarrativeSnapshot,
): string | null {
  if (!node.outcome) return null;
  if (node.dialogueId === "rift" && state.facts.includes("rift:contained"))
    return "Contenção cautelosa: os quatro fecharam a descarga, preservaram a planta e estabilizaram os cinco cômodos. A meia-lua fria ficou; parte da inscrição se perdeu. Lua ainda discorda da perda, mas permanece com os outros.";
  const boundary =
    node.dialogueId === "ashes" && state.facts.includes("ashes:exposed")
      ? " A exposição inicial deixou uma reserva de confiança; Samael pediu que a próxima ajuda comece por uma pergunta."
      : "";
  return node.outcome + boundary;
}
function initial(revision = 0): NarrativeSnapshot {
  return {
    revision,
    active: null,
    talkingTo: null,
    facts: [],
    quests: {
      ashes: {
        status: "available",
        nodeId: STORIES.ashes.start,
        outcome: null,
      },
      anatomy: {
        status: "available",
        nodeId: STORIES.anatomy.start,
        outcome: null,
      },
      petals: {
        status: "available",
        nodeId: STORIES.petals.start,
        outcome: null,
      },
      spell: {
        status: "available",
        nodeId: STORIES.spell.start,
        outcome: null,
      },
      rift: { status: "available", nodeId: STORIES.rift.start, outcome: null },
    },
    scenes: {},
    bonds: [],
    inspection: null,
    feedback: "",
    history: [],
  };
}
/** One host owns one fictional session. No clock, storage, records, network or renderer. */
export class NarrativeSession {
  private snapshot = initial();
  private disposed = false;
  private emitting = false;
  private readonly listeners = new Set<() => void>();
  getSnapshot = (): NarrativeSnapshot => this.snapshot;
  subscribe = (listener: () => void): (() => void) => {
    if (this.disposed) return () => {};
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private publish(next: NarrativeSnapshot) {
    this.snapshot = Object.freeze(next);
    this.emitting = true;
    try {
      for (const listener of this.listeners) listener();
    } finally {
      this.emitting = false;
    }
  }
  open(quest: QuestId) {
    if (this.disposed || this.emitting) return;
    const s = this.snapshot,
      progress = s.quests[quest];
    if (s.active === quest) return;
    const node = nodeFor(s, quest);
    this.publish({
      ...s,
      revision: s.revision + 1,
      active: quest,
      talkingTo: node?.speakerId ?? null,
      quests: {
        ...s.quests,
        [quest]: {
          ...progress,
          status: progress.status === "available" ? "active" : progress.status,
        },
      },
      scenes:
        progress.status === "available"
          ? { ...s.scenes, [quest]: "troubled" }
          : s.scenes,
      inspection: null,
      feedback:
        progress.status === "available"
          ? "História iniciada. Você pode adiar e retomar nesta sessão."
          : "História retomada no ponto em que ficou.",
    });
  }
  /** Canvas/semantic selection opens the same contextual conversation once. */
  talk(key: InhabitantKey) {
    if (this.disposed || this.emitting) return;
    const s = this.snapshot;
    if (
      s.talkingTo === key &&
      !(s.active === "rift" && s.quests.rift.nodeId === "rift:perspectives")
    )
      return;
    const personal = QUEST_IDS.find(
      (q) => q !== "rift" && STORIES[q].owner === key,
    );
    if (
      s.quests.rift.status === "active" &&
      s.quests.rift.nodeId === "rift:perspectives" &&
      !s.facts.includes(`rift:heard-${key}`)
    ) {
      const node = STORIES.rift.nodes.find((n) => n.nodeId === `rift:${key}`);
      if (node) {
        this.publish({
          ...s,
          revision: s.revision + 1,
          active: "rift",
          talkingTo: key,
          quests: {
            ...s.quests,
            rift: { ...s.quests.rift, nodeId: node.nodeId },
          },
          feedback: "Uma nova perspectiva para a fenda.",
          inspection: null,
        });
        return;
      }
    }
    if (personal) this.open(personal);
  }
  close() {
    if (this.disposed || this.emitting || !this.snapshot.active) return;
    this.publish({
      ...this.snapshot,
      revision: this.snapshot.revision + 1,
      active: null,
      talkingTo: null,
      inspection: null,
      feedback: "Conversa adiada. O diário guarda o objetivo nesta sessão.",
    });
  }
  choose(choiceId: string, expectedRevision: number): boolean {
    const s = this.snapshot;
    if (
      this.disposed ||
      this.emitting ||
      s.revision !== expectedRevision ||
      !s.active
    )
      return false;
    const node = nodeFor(s);
    const choice = node?.choices.find((c) => c.choiceId === choiceId);
    if (!choice || !matches(choice.condition, s)) return false;
    const next = STORIES[s.active].nodes.find((n) => n.nodeId === choice.next);
    if (!next) return false;
    let state: NarrativeSnapshot = {
      ...s,
      revision: s.revision + 1,
      inspection: null,
    };
    for (const effect of choice.effects)
      state = this.apply(state, effect, choiceId);
    const outcome = outcomeFor(next, state);
    const feedback =
      choice.feedback ??
      (choice.effects
        .filter((e) => e.kind === "bond")
        .map((e) => e.text)
        .join(" ") ||
        (next.outcome
          ? "Uma história concluída. O diário guarda suas consequências."
          : ""));
    this.publish({
      ...state,
      talkingTo: next.speakerId,
      quests: {
        ...state.quests,
        [s.active]: {
          status: outcome ? "resolved" : "active",
          nodeId: next.nodeId,
          outcome,
        },
      },
      feedback,
      history: [
        `${STORIES[s.active].title}: ${choice.text}`,
        ...s.history,
      ].slice(0, 16),
    });
    return true;
  }
  private apply(
    s: NarrativeSnapshot,
    effect: NarrativeEffect,
    eventId: string,
  ): NarrativeSnapshot {
    switch (effect.kind) {
      case "remember":
        return s.facts.includes(effect.fact)
          ? s
          : { ...s, facts: [...s.facts, effect.fact] };
      case "scene":
        return { ...s, scenes: { ...s.scenes, [effect.scene]: effect.stage } };
      case "inspect":
        return { ...s, inspection: effect.object };
      case "bond": {
        const id = `${eventId}:${effect.pair.join(":")}`;
        return s.bonds.some((b) => b.eventId === id)
          ? s
          : { ...s, bonds: [...s.bonds, { ...effect, eventId: id }] };
      }
    }
  }
  reset() {
    if (!this.disposed && !this.emitting)
      this.publish(initial(this.snapshot.revision + 1));
  }
  dispose() {
    this.disposed = true;
    this.listeners.clear();
  }
}
