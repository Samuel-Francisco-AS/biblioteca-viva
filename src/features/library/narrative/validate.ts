import type { Condition, QuestDefinition } from "./contracts";
/** Checks authoring mistakes without executing text, commands or scripts. */
export function validateStories(
  stories: readonly QuestDefinition[],
): readonly string[] {
  const errors: string[] = [],
    ids = new Set<string>(),
    facts = new Set<string>();
  const claim = (id: string) => {
    if (ids.has(id)) errors.push(`ID repetido: ${id}`);
    ids.add(id);
  };
  for (const story of stories)
    for (const node of story.nodes)
      for (const c of node.choices)
        for (const e of c.effects) if (e.kind === "remember") facts.add(e.fact);
  const checkCondition = (c: Condition | undefined) => {
    if (c?.kind === "fact" && !facts.has(c.fact))
      errors.push(`Fato desconhecido: ${c.fact}`);
    if (c?.kind === "all") c.conditions.forEach(checkCondition);
    if (c?.kind === "resolved" && !stories.some((s) => s.questId === c.quest))
      errors.push(`Quest desconhecida: ${c.quest}`);
  };
  for (const story of stories) {
    claim(story.questId);
    const nodes = new Map(story.nodes.map((n) => [n.nodeId, n]));
    if (!nodes.has(story.start))
      errors.push(`Início inválido: ${story.questId}`);
    for (const node of story.nodes) {
      claim(node.nodeId);
      if (node.dialogueId !== story.questId)
        errors.push(`Diálogo incorreto: ${node.nodeId}`);
      if (!node.text.trim() || !node.objective.trim())
        errors.push(`Texto ausente: ${node.nodeId}`);
      if (!node.outcome && node.choices.length < 2)
        errors.push(`Sem saída: ${node.nodeId}`);
      if (node.outcome && node.choices.length)
        errors.push(`Conclusão com efeitos: ${node.nodeId}`);
      for (const variant of node.variants ?? [])
        checkCondition(variant.condition);
      for (const c of node.choices) {
        claim(c.choiceId);
        checkCondition(c.condition);
        if (!nodes.has(c.next)) errors.push(`Destino inválido: ${c.next}`);
      }
    }
    const reach = (start: string) => {
      const seen = new Set<string>(),
        queue = [start];
      while (queue.length) {
        const current = queue.pop();
        if (!current || seen.has(current)) continue;
        seen.add(current);
        for (const c of nodes.get(current)?.choices ?? []) queue.push(c.next);
      }
      return seen;
    };
    const reachable = reach(story.start);
    for (const node of story.nodes) {
      if (!reachable.has(node.nodeId))
        errors.push(`Nó inalcançável: ${node.nodeId}`);
      if (![...reach(node.nodeId)].some((id) => nodes.get(id)?.outcome))
        errors.push(`Sem conclusão alcançável: ${node.nodeId}`);
    }
  }
  return errors;
}
