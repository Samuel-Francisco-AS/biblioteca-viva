import type { CardContent } from "../../domain/arcanarium";
export function cardTitle(c: CardContent) {
  switch (c.type) {
    case "flashcard":
      return c.title ?? c.front;
    case "memory":
      return c.title;
    case "question":
      return c.statement;
    case "combat":
      return c.name;
  }
}
export const familyLabels = {
  flashcard: "Eco",
  memory: "Lembrança",
  question: "Questão",
  combat: "Combate",
};
