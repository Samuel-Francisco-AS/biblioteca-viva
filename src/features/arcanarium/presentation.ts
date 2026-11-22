import type {
  CardContent,
  KnowledgeTag,
  DynamicCriteria,
} from "../../domain/arcanarium";
export function cardTitle(c: CardContent) {
  switch (c.type) {
    case "flashcard":
      return c.title ?? c.front;
    case "memory":
      return c.title;
    case "question":
      return c.title ?? c.statement;
  }
}
export const familyLabels = {
  flashcard: "Eco",
  memory: "Lembrança",
  question: "Questão",
};

export const levelNames = {
  area: "Área",
  discipline: "Disciplina",
  subject: "Assunto",
  subsubject: "Subassunto",
  skill: "Habilidade",
  label: "Etiqueta pessoal",
};
export function tagPath(
  tag: KnowledgeTag,
  tags: KnowledgeTag[],
  seen = new Set<string>(),
): string {
  if (seen.has(tag.id)) return tag.label;
  const parent = tags.find((t) => t.id === tag.parentIds[0]);
  return parent
    ? `${tagPath(parent, tags, new Set(seen).add(tag.id))} › ${tag.label}`
    : tag.label;
}
export type Criteria = Extract<DynamicCriteria, { version: 2 }>;
export const defaultCriteria: Criteria = {
  version: 2,
  types: ["question"],
  knowledgeTagIds: [],
  personalTagIds: [],
  history: "all",
  limit: 10,
};
export function modernCriteria(c: DynamicCriteria): Criteria {
  return c.version === 2
    ? c
    : {
        ...defaultCriteria,
        types: c.types,
        knowledgeTagIds: c.knowledgeTagIds,
        personalTagIds: c.personalTagIds,
        limit: 500,
      };
}
export const trialPath = (id: string) =>
  `/arcanario/provacoes/${encodeURIComponent(id)}`;
export const statusNames = {
  active: "Em andamento",
  paused: "Pausada",
  completed: "Concluída",
  abandoned: "Abandonada",
};
