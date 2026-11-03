import type { InhabitantKey } from "../inhabitants";
import type {
  Condition,
  DialogueChoice,
  DialogueNode,
  NarrativeEffect,
  QuestId,
} from "./contracts";
export const fact = (fact: string, absent = false): Condition => ({
  kind: "fact",
  fact,
  absent,
});
export const remember = (fact: string): NarrativeEffect => ({
  kind: "remember",
  fact,
});
export const scene = (
  scene: QuestId,
  stage: "troubled" | "examined" | "contained" | "experimental" | "restored",
): NarrativeEffect => ({ kind: "scene", scene, stage });
export const inspect = (
  object:
    | "living:clock"
    | "living:hearth"
    | "living:plant"
    | "living:globe"
    | "living:book",
): NarrativeEffect => ({ kind: "inspect", object });
export const bond = (
  a: InhabitantKey,
  b: InhabitantKey,
  change: "trust" | "friction" | "repair",
  text: string,
): NarrativeEffect => ({ kind: "bond", pair: [a, b], change, text });
export function story(quest: QuestId) {
  const id = (local: string) => `${quest}:${local}`;
  return {
    id,
    c(
      this: void,
      key: string,
      text: string,
      next: string,
      effects: readonly NarrativeEffect[] = [],
      condition?: Condition,
      feedback?: string,
    ): DialogueChoice {
      return {
        choiceId: id(`choice:${key}`),
        text,
        next: id(next),
        effects,
        condition,
        feedback,
      };
    },
    n(
      this: void,
      key: string,
      speakerId: InhabitantKey,
      text: string,
      objective: string,
      choices: readonly DialogueChoice[],
      extra: Partial<
        Pick<DialogueNode, "action" | "outcome" | "variants">
      > = {},
    ): DialogueNode {
      return {
        dialogueId: quest,
        nodeId: id(key),
        speakerId,
        text,
        objective,
        action: "gesture",
        choices,
        ...extra,
      };
    },
  };
}
