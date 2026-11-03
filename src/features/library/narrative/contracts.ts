import type { InhabitantAction, InhabitantKey } from "../inhabitants";

export type QuestId = "ashes" | "anatomy" | "petals" | "spell" | "rift";
export type SceneKey = "ashes" | "anatomy" | "petals" | "spell" | "rift";
export type SceneStage =
  "troubled" | "examined" | "contained" | "experimental" | "restored";
export type ClueObject =
  | "living:clock"
  | "living:hearth"
  | "living:plant"
  | "living:globe"
  | "living:book";
export type Condition =
  | { readonly kind: "fact"; readonly fact: string; readonly absent?: boolean }
  | { readonly kind: "all"; readonly conditions: readonly Condition[] }
  | { readonly kind: "resolved"; readonly quest: QuestId };
export type NarrativeEffect =
  | { readonly kind: "remember"; readonly fact: string }
  | {
      readonly kind: "scene";
      readonly scene: SceneKey;
      readonly stage: SceneStage;
    }
  | { readonly kind: "inspect"; readonly object: ClueObject }
  | {
      readonly kind: "bond";
      readonly pair: readonly [InhabitantKey, InhabitantKey];
      readonly change: "trust" | "friction" | "repair";
      readonly text: string;
    };
export interface DialogueChoice {
  readonly choiceId: string;
  readonly text: string;
  readonly next: string;
  readonly condition?: Condition;
  readonly effects: readonly NarrativeEffect[];
  readonly feedback?: string;
}
export interface DialogueNode {
  readonly dialogueId: QuestId;
  readonly nodeId: string;
  readonly speakerId: InhabitantKey;
  readonly text: string;
  readonly objective: string;
  readonly action: InhabitantAction;
  readonly choices: readonly DialogueChoice[];
  readonly outcome?: string;
  readonly variants?: readonly {
    readonly condition: Condition;
    readonly text: string;
  }[];
}
export interface QuestDefinition {
  readonly questId: QuestId;
  readonly title: string;
  readonly owner: InhabitantKey;
  readonly start: string;
  readonly nodes: readonly DialogueNode[];
}
export interface QuestProgress {
  readonly status: "available" | "active" | "resolved";
  readonly nodeId: string;
  readonly outcome: string | null;
}
export interface NarrativeBond {
  readonly eventId: string;
  readonly pair: readonly [InhabitantKey, InhabitantKey];
  readonly change: "trust" | "friction" | "repair";
  readonly text: string;
}
export interface NarrativeSnapshot {
  readonly revision: number;
  readonly active: QuestId | null;
  readonly talkingTo: InhabitantKey | null;
  readonly facts: readonly string[];
  readonly quests: Readonly<Record<QuestId, QuestProgress>>;
  readonly scenes: Readonly<Partial<Record<SceneKey, SceneStage>>>;
  readonly bonds: readonly NarrativeBond[];
  readonly inspection: ClueObject | null;
  readonly feedback: string;
  readonly history: readonly string[];
}
