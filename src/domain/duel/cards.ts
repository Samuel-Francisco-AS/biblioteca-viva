import type { Card } from "../arcanarium";
import { DuelRuleError, type DuelCard } from "./contracts";
export function combatSnapshot(card: Card): DuelCard {
  if (card.content.type !== "combat" || !card.content.combat || card.archived)
    throw new DuelRuleError("Carta de combate indisponível.");
  return {
    id: card.id,
    cardId: card.id,
    revision: card.revision,
    name: card.content.name,
    official:
      card.origin.kind === "official" && card.id.startsWith("arcane-v1:"),
    definition: card.content.combat,
  };
}
