import type { CombatDefinition, DuelAbility, DuelEffect } from "./contracts";
export const kindNames = {
  creature: "Criatura",
  spell: "Feitiço",
  artifact: "Artefato",
};
export const modeNames = {
  official: "Oficial",
  creator: "Criador",
  free: "Livre",
};
export const effectNames: Record<DuelEffect["definitionId"], string> = {
  damage: "Causar dano",
  heal: "Restaurar vida",
  draw: "Comprar cartas",
  shield: "Conceder escudo",
  empower: "Fortalecer",
  summon: "Invocar sentinelas",
  drain: "Drenar vida",
  chaos: "Dano variável",
  scout: "Perscrutar o topo",
  exhaust: "Exaurir criatura",
  shatter: "Destruir artefato",
};
export const targetNames: Record<DuelEffect["target"], string> = {
  enemy: "duelista inimigo",
  ally: "seu duelista",
  "enemy-unit": "uma criatura inimiga",
  "ally-unit": "uma criatura aliada",
  "enemy-any": "um inimigo (duelista ou criatura)",
  self: "esta criatura",
  "all-enemies": "todas as criaturas inimigas",
  "all-allies": "todas as criaturas aliadas",
};
export function effectText(e: DuelEffect): string {
  const t = targetNames[e.target];
  switch (e.definitionId) {
    case "damage":
      return `Causa ${e.value} de dano a ${t}.`;
    case "heal":
      return `Restaura até ${e.value} de vida a ${t}.`;
    case "draw":
      return `Compra ${e.value} carta${e.value > 1 ? "s" : ""}.`;
    case "shield":
      return `Concede ${e.value} de escudo a ${t} (máximo 12).`;
    case "empower":
      return `${t}: +${e.value}/+${e.value}${e.duration === "turn" ? " até encerrar este turno" : " permanente"}.`;
    case "summon":
      return `Invoca ${e.value} sentinela${e.value > 1 ? "s" : ""} 1/1, se houver vaga.`;
    case "drain":
      return `Causa ${e.value} a ${t} e cura seu duelista pelo dano efetivo.`;
    case "chaos":
      return `Causa de 1 a ${e.value} de dano a ${t}. Resultado registrado pela semente.`;
    case "scout":
      return `Ordena até ${e.value} cartas do topo por custo crescente.`;
    case "exhaust":
      return `Impede o próximo turno de ataques de ${t}.`;
    case "shatter":
      return "Destrói o artefato inimigo mais antigo, se existir.";
  }
}
export function abilityText(a: DuelAbility) {
  return `${a.trigger === "play" ? "Ao jogar" : a.trigger === "start" ? "Início do seu turno" : `Ativar · ${a.cost} energia · uma vez por turno`}: ${a.effects.map(effectText).join(" ")}`;
}
export function rulesText(c: CombatDefinition) {
  return (
    [
      ...c.keywords.map((k) =>
        k === "guard"
          ? "Guardião: ataques inimigos devem escolher um Guardião."
          : "Ímpeto: pode atacar no turno em que entra.",
      ),
      ...c.abilities.map(abilityText),
    ].join(" ") || "Sem habilidades. Sua força está na presença em campo."
  );
}
