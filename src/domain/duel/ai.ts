import type { DuelAction, DuelEffect, DuelMatch } from "./contracts";
import {
  abilityEffects,
  canAttack,
  cardAt,
  legalActions,
  randomStep,
  unitStats,
} from "./engine";
/** Redacted decision surface: neither hidden hands, deck order, future cards nor action history reach the heuristic. */
export function observeDuel(match: DuelMatch) {
  const p = match.active,
    opponentHand = match.players[1 - p].hand.length,
    deckCount = match.players[p].deck.length;
  const players: DuelMatch["players"] = structuredClone(match.players);
  players[p].deck = [];
  players[1 - p].deck = [];
  players[1 - p].hand = [];
  const known = new Set(
    players.flatMap((pl) => [
      ...pl.hand,
      ...pl.grave,
      ...pl.units.map((u) => u.id),
      ...pl.artifacts.map((a) => a.id),
    ]),
  );
  return {
    state: {
      ...match,
      players,
      cards: match.cards.filter((c) => known.has(c.id)),
      initial: [[], []],
      history: [],
    } satisfies DuelMatch,
    deckCount,
    opponentHand,
  };
}
export function chooseDuelAction(match: DuelMatch): DuelAction {
  const { state: m, deckCount } = observeDuel(match),
    p = m.active,
    own = m.players[p],
    enemy = m.players[1 - p];
  const actions = legalActions(m);
  if (!actions.length) return { type: "end" };
  const threatened =
    enemy.units.reduce((n, u) => n + unitStats(m, u).attack, 0) >= own.life;
  const unitValue = (id: string) => {
    const u = [...own.units, ...enemy.units].find((u) => u.id === id);
    return u
      ? unitStats(m, u).attack * 1.4 +
          Math.max(0, unitStats(m, u).health) * 0.55 +
          cardAt(m, id).definition.cost * 0.6 +
          (cardAt(m, id).definition.keywords.includes("guard") ? 1.5 : 0)
      : 0;
  };
  const damageScore = (target: string | undefined, value: number): number => {
    if (target === `p${1 - p}`)
      return enemy.life <= value
        ? 10000
        : value * (enemy.life < 8 ? 2.6 : 1.05);
    if (target === `p${p}`)
      return own.life <= value ? -10000 : -value * (own.life <= 8 ? 3 : 1.2);
    const unit = enemy.units.find((u) => u.id === target);
    if (!unit) return 0;
    const health = unitStats(m, unit).health + unit.shield;
    return (
      (value >= health
        ? unitValue(unit.id) + 3
        : Math.min(value, health) * 0.9) * (threatened ? 1.8 : 1)
    );
  };
  const effectsScore = (
    effects: readonly DuelEffect[],
    source: string,
    target?: string,
  ) =>
    effects.reduce((score, e) => {
      const value = e.definitionId === "chaos" ? (1 + e.value) / 2 : e.value;
      const t =
        e.target === "enemy"
          ? `p${1 - p}`
          : e.target === "ally"
            ? `p${p}`
            : e.target === "self"
              ? source
              : target;
      const allyUnit = own.units.find((u) => u.id === t),
        enemyUnit = enemy.units.find((u) => u.id === t);
      switch (e.definitionId) {
        case "damage":
        case "chaos":
          return (
            score +
            (e.target === "all-enemies"
              ? enemy.units.reduce((n, u) => n + damageScore(u.id, value), 0)
              : damageScore(t, value))
          );
        case "drain":
          return (
            score + damageScore(t, value) + Math.min(20 - own.life, value) * 0.8
          );
        case "heal":
          return (
            score +
            Math.min(
              t === `p${p}` ? 20 - own.life : (allyUnit?.damage ?? 0),
              value,
            ) *
              (threatened ? 2.2 : 0.85)
          );
        case "draw":
          return (
            score +
            Math.min(e.value, Math.max(0, 8 - own.hand.length), deckCount) *
              (own.hand.length <= 2 ? 3.2 : 1.7) -
            (deckCount === 0 ? 5 : 0)
          );
        case "scout":
          return score + (deckCount > 1 ? 0.6 : 0);
        case "shield":
          return (
            score +
            (allyUnit
              ? Math.min(12 - allyUnit.shield, value) *
                0.7 *
                (threatened ? 1.8 : 1)
              : 0)
          );
        case "empower":
          return (
            score +
            (e.target === "all-allies"
              ? own.units.reduce(
                  (n, u) =>
                    n +
                    (e.duration === "turn" && !canAttack(m, u) ? 0.2 : 2) *
                      value,
                  0,
                )
              : allyUnit
                ? (e.duration === "turn" && !canAttack(m, allyUnit)
                    ? 0.15
                    : 2.2) * value
                : 0)
          );
        case "summon":
          return score + Math.min(e.value, 4 - own.units.length) * 3;
        case "exhaust":
          return (
            score +
            (enemyUnit && enemyUnit.exhaustedThrough < m.turn
              ? unitStats(m, enemyUnit).attack * (threatened ? 2 : 1)
              : 0)
          );
        case "shatter":
          return (
            score +
            (enemy.artifacts.length
              ? cardAt(m, enemy.artifacts[0].id).definition.cost + 2
              : 0)
          );
      }
    }, 0);
  function score(a: DuelAction) {
    if (a.type === "end") return 0;
    if (a.type === "attack") {
      const attacker = own.units.find((u) => u.id === a.source);
      if (!attacker) return -1000;
      const attack = unitStats(m, attacker).attack,
        target = enemy.units.find((u) => u.id === a.target);
      if (!target) return damageScore(a.target, attack) + 1;
      const counter = unitStats(m, target).attack,
        loss =
          counter >= unitStats(m, attacker).health + attacker.shield
            ? unitValue(attacker.id)
            : counter * 0.5;
      return damageScore(a.target, attack) - loss + (threatened ? 3 : 0.5);
    }
    if (a.type === "play") {
      const c = cardAt(m, a.card).definition;
      const effectValue = effectsScore(
        abilityEffects(c, "play"),
        a.card,
        a.target,
      );
      if (c.kind === "creature")
        return (
          (c.attack ?? 0) * 1.1 +
          (c.health ?? 0) * 0.6 +
          (c.keywords.includes("guard") ? (threatened ? 9 : 2) : 0) +
          (c.keywords.includes("haste") ? 2 : 0) +
          effectValue -
          c.cost * 0.5
        );
      if (c.kind === "artifact")
        return (
          c.abilities.reduce(
            (v, b) =>
              v +
              effectsScore(b.effects, a.card) *
                (b.trigger === "start" ? 2 : 1.1),
            0,
          ) +
          1 -
          c.cost * 0.6
        );
      return effectValue - c.cost * 0.55;
    }
    if (a.type === "activate") {
      const ability = cardAt(m, a.source).definition.abilities.find(
        (b) => b.id === a.ability,
      );
      return ability
        ? effectsScore(ability.effects, a.source, a.target) -
            ability.cost * 0.6 -
            0.15
        : -1000;
    }
    return -1000;
  }
  const ranked = actions.map((action, i) => ({
    action,
    score: score(action),
    tie: randomStep(
      (m.seed ^ Math.imul(m.revision + 1, 7919) ^ Math.imul(i + 1, 104729)) >>>
        0,
    ).value,
  }));
  ranked.sort((a, b) => b.score - a.score || b.tie - a.tie);
  return ranked[0].action;
}
