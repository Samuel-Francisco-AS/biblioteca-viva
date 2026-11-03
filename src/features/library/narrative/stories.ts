import { ashes } from "./ashes";
import { anatomy } from "./anatomy";
import { petals } from "./petals";
import { spell } from "./spell";
import { rift } from "./rift";
import type { QuestDefinition, QuestId } from "./contracts";
export const STORIES: Readonly<Record<QuestId, QuestDefinition>> = {
  ashes,
  anatomy,
  petals,
  spell,
  rift,
};
export const QUEST_IDS: readonly QuestId[] = [
  "ashes",
  "anatomy",
  "petals",
  "spell",
  "rift",
];
