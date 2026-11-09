import {
  DuelRuleError,
  commandSchema,
  definitionSchema,
  matchSchema,
  RULES,
  RULESET,
  validateCreation,
  type CombatDefinition,
  type DuelAbility,
  type DuelAction,
  type DuelCard,
  type DuelCommand,
  type DuelEffect,
  type DuelEvent,
  type DuelMatch,
  type DuelMode,
  type DuelPlayer,
  type DuelUnit,
  type Affinity,
} from "./contracts";

export function randomStep(state: number): { state: number; value: number } {
  const next = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return { state: next, value: next / 4294967296 };
}
export function cardAt(m: DuelMatch, id: string): DuelCard {
  const c = m.cards.find((c) => c.id === id);
  if (!c) throw new DuelRuleError("Carta fora dos snapshots da partida.");
  return c;
}
export function unitStats(m: DuelMatch, u: DuelUnit) {
  const c = cardAt(m, u.id).definition;
  const bonus = u.modifiers.reduce((v, b) => v + b.value, 0);
  return {
    attack: (c.attack ?? 0) + bonus,
    health: (c.health ?? 1) + bonus - u.damage,
    maximum: (c.health ?? 1) + bonus,
  };
}
export function validateDuelDeck(
  cards: readonly DuelCard[],
  affinity: Affinity,
  mode: DuelMode,
) {
  if (
    cards.length !== RULES.deck &&
    !(mode === "free" && cards.length >= 12 && cards.length <= 60)
  )
    throw new DuelRuleError("Use 24 cartas; no Livre, de 12 a 60.");
  const counts = new Map<string, number>();
  for (const c of cards) {
    definitionSchema.parse(c.definition);
    counts.set(c.cardId, (counts.get(c.cardId) ?? 0) + 1);
    if ((counts.get(c.cardId) ?? 0) > (mode === "free" ? 4 : RULES.copies))
      throw new DuelRuleError("Limite de cópias excedido.");
    if (
      mode !== "free" &&
      c.definition.affinity !== "neutral" &&
      c.definition.affinity !== affinity
    )
      throw new DuelRuleError("Afinidade incompatível com o baralho.");
    if (mode === "official" && !c.official)
      throw new DuelRuleError(
        "O modo Oficial exige cartas do catálogo validado.",
      );
    if (mode === "creator" && !c.official) validateCreation(c.definition);
  }
}
export interface DuelSetup {
  deckId?: string;
  deckRevision?: number;
  name: string;
  affinity: Affinity;
  deckName: string;
  cards: DuelCard[];
}
export function createDuel(
  setups: [DuelSetup, DuelSetup],
  seed: number,
  mode: DuelMode = "official",
): DuelMatch {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
    throw new DuelRuleError("Semente inválida.");
  setups.forEach((s) => validateDuelDeck(s.cards, s.affinity, mode));
  let rng = seed;
  const snapshots = setups.flatMap((s, p) =>
    s.cards.map((c, i) => ({ ...structuredClone(c), id: `${p}:${i}` })),
  );
  const initial: [string[], string[]] = [
    snapshots.filter((c) => c.id.startsWith("0:")).map((c) => c.id),
    snapshots.filter((c) => c.id.startsWith("1:")).map((c) => c.id),
  ];
  const players = setups.map((s, p): DuelPlayer => {
    const deck = [...initial[p]];
    for (let i = deck.length - 1; i > 0; i--) {
      const roll = randomStep(rng);
      rng = roll.state;
      const j = Math.floor(roll.value * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return {
      id: p === 0 ? "p0" : "p1",
      deckId: s.deckId ?? `snapshot:${p}`,
      deckRevision: s.deckRevision ?? 1,
      name: s.name,
      affinity: s.affinity,
      deckName: s.deckName,
      life: RULES.life,
      energy: p === 0 ? 1 : 0,
      maximum: p === 0 ? 1 : 0,
      fatigue: 0,
      deck: deck.slice(p === 0 ? 4 : 5),
      hand: deck.slice(0, p === 0 ? 4 : 5),
      grave: [],
      units: [],
      artifacts: [],
    };
  });
  const first = players[0],
    second = players[1];
  return matchSchema.parse({
    ruleset: RULESET,
    phase: "main",
    seed,
    rng,
    mode,
    revision: 0,
    turn: 1,
    active: 0,
    actionsThisTurn: 0,
    status: "active",
    players: [first, second],
    cards: snapshots,
    initial,
    history: [],
  });
}
function targeted(e: DuelEffect) {
  return ["enemy-unit", "ally-unit", "enemy-any"].includes(e.target);
}
export function effectTargets(
  m: DuelMatch,
  p: number,
  effects: readonly DuelEffect[],
): (string | undefined)[] {
  const explicit = effects.filter(targeted);
  if (!explicit.length) return [undefined];
  return [
    ...m.players[p].units.map((u) => u.id),
    ...m.players[1 - p].units.map((u) => u.id),
    `p${1 - p}`,
  ].filter((t) => explicit.every((e) => validTarget(m, p, e, t)));
}
function validTarget(m: DuelMatch, p: number, e: DuelEffect, target?: string) {
  if (!targeted(e)) return true;
  if (!target) return false;
  if (e.target === "ally-unit")
    return m.players[p].units.some((u) => u.id === target);
  if (e.target === "enemy-any" && target === `p${1 - p}`) return true;
  return m.players[1 - p].units.some((u) => u.id === target);
}
function playEffects(c: CombatDefinition) {
  return c.abilities
    .filter((a) => a.trigger === "play")
    .flatMap((a) => a.effects);
}
export function attackTargets(m: DuelMatch, p: number) {
  const guards = m.players[1 - p].units.filter((u) =>
    cardAt(m, u.id).definition.keywords.includes("guard"),
  );
  return guards.length
    ? guards.map((u) => u.id)
    : [`p${1 - p}`, ...m.players[1 - p].units.map((u) => u.id)];
}
export function canAttack(m: DuelMatch, u: DuelUnit) {
  return (
    !u.attacked &&
    u.exhaustedThrough < m.turn &&
    (u.summoned < m.turn ||
      cardAt(m, u.id).definition.keywords.includes("haste")) &&
    unitStats(m, u).attack > 0
  );
}
export function legalActions(m: DuelMatch, p = m.active): DuelAction[] {
  if (m.status !== "active" || p !== m.active) return [];
  const actions: DuelAction[] = [{ type: "end" }];
  if (m.actionsThisTurn >= RULES.actionsPerTurn) return actions;
  const own = m.players[p];
  for (const id of own.hand) {
    const c = cardAt(m, id).definition;
    if (
      c.cost > own.energy ||
      (c.kind === "creature" && own.units.length >= RULES.creatures) ||
      (c.kind === "artifact" && own.artifacts.length >= RULES.artifacts)
    )
      continue;
    for (const target of effectTargets(m, p, playEffects(c)))
      actions.push({ type: "play", card: id, ...(target && { target }) });
  }
  for (const u of own.units)
    if (canAttack(m, u))
      for (const target of attackTargets(m, p))
        actions.push({ type: "attack", source: u.id, target });
  for (const source of [...own.units, ...own.artifacts]) {
    for (const a of cardAt(m, source.id).definition.abilities)
      if (
        a.trigger === "activate" &&
        !source.activated.includes(a.id) &&
        a.cost <= own.energy
      ) {
        for (const target of effectTargets(m, p, a.effects))
          actions.push({
            type: "activate",
            source: source.id,
            ability: a.id,
            ...(target && { target }),
          });
      }
  }
  return actions;
}
function sameAction(a: DuelAction, b: DuelAction) {
  return (
    a.type === b.type &&
    JSON.stringify(Object.entries(a).sort()) ===
      JSON.stringify(Object.entries(b).sort())
  );
}
export function transition(
  previous: DuelMatch,
  input: DuelCommand,
): { state: DuelMatch; events: DuelEvent[] } {
  const command = commandSchema.parse(input);
  if (previous.result || previous.status === "completed")
    throw new DuelRuleError("Esta partida já terminou.");
  if (
    command.revision !== previous.revision ||
    previous.history.some((h) => h.command.id === command.id)
  )
    throw new DuelRuleError("Comando repetido ou revisão desatualizada.");
  const a = command.action;
  const control = ["pause", "resume", "abandon"].includes(a.type);
  if (control && command.player !== 0)
    throw new DuelRuleError("Apenas o jogador local controla a sessão.");
  if (
    previous.status === "paused" &&
    a.type !== "resume" &&
    a.type !== "abandon"
  )
    throw new DuelRuleError("Retome antes de jogar.");
  if (a.type === "resume" && previous.status !== "paused")
    throw new DuelRuleError("A partida não está pausada.");
  if (
    !control &&
    (command.player !== previous.active ||
      !legalActions(previous).some((x) => sameAction(a, x)))
  )
    throw new DuelRuleError("Ação, recurso, zona ou alvo inválido.");
  if (a.type === "pause" && previous.status !== "active")
    throw new DuelRuleError("A partida já está pausada.");
  const m = structuredClone(previous),
    events: DuelEvent[] = [];
  const p = m.active,
    own = m.players[p],
    enemy = m.players[1 - p];
  let resolved = 0;
  const emit = (
    type: DuelEvent["type"],
    player = p,
    target?: string,
    value?: number,
    source?: string,
  ) => {
    events.push({
      type,
      player,
      ...(target && { target }),
      ...(value !== undefined && { value }),
      ...(source && { source }),
    });
  };
  const findUnit = (id: string) =>
    m.players.flatMap((pl) => pl.units).find((u) => u.id === id);
  const deal = (target: string, value: number, source?: string) => {
    if (target === "p0" || target === "p1") {
      const pl = m.players[target === "p0" ? 0 : 1],
        actual = Math.min(Math.max(pl.life, 0), value);
      pl.life -= value;
      emit("damage", p, target, value, source);
      return actual;
    }
    const u = findUnit(target);
    if (!u) return 0;
    const absorbed = Math.min(u.shield, value);
    u.shield -= absorbed;
    const damage = value - absorbed,
      actual = Math.min(Math.max(unitStats(m, u).health, 0), damage);
    u.damage += damage;
    emit("damage", p, target, damage, source);
    return actual;
  };
  const heal = (target: string, value: number, source?: string) => {
    const u = findUnit(target);
    if (u) {
      const v = Math.min(value, u.damage);
      u.damage -= v;
      emit("heal", p, target, v, source);
    } else if (target === "p0" || target === "p1") {
      const pl = m.players[target === "p0" ? 0 : 1],
        v = Math.min(RULES.life - pl.life, value);
      pl.life += v;
      emit("heal", p, target, v, source);
    }
  };
  const sweep = () => {
    for (const [i, pl] of m.players.entries()) {
      const dead = pl.units.filter((u) => unitStats(m, u).health <= 0);
      pl.units = pl.units.filter((u) => unitStats(m, u).health > 0);
      pl.grave.push(...dead.map((u) => u.id));
      dead.forEach((u) => emit("death", i, u.id));
    }
  };
  const draw = (player: number) => {
    const pl = m.players[player],
      next = pl.deck.shift();
    if (next === undefined) {
      pl.fatigue++;
      pl.life -= pl.fatigue;
      emit("fatigue", player, `p${player}`, pl.fatigue);
    } else if (pl.hand.length >= RULES.hand) {
      pl.grave.push(next);
      emit("burn", player, next);
    } else {
      pl.hand.push(next);
      emit("draw", player, next);
    }
  };
  const resolve = (
    effects: DuelEffect[],
    owner: number,
    source: string,
    target?: string,
  ) => {
    const pl = m.players[owner],
      other = m.players[1 - owner];
    for (const e of effects) {
      if (++resolved > RULES.effects)
        throw new DuelRuleError("Limite de resolução de efeitos excedido.");
      let value = e.value;
      if (e.definitionId === "chaos") {
        const roll = randomStep(m.rng);
        m.rng = roll.state;
        value = 1 + Math.floor(roll.value * value);
        emit("roll", owner, target, value, source);
      }
      const targets =
        e.target === "ally"
          ? [`p${owner}`]
          : e.target === "enemy"
            ? [`p${1 - owner}`]
            : e.target === "self"
              ? [source]
              : e.target === "all-enemies"
                ? other.units.map((u) => u.id)
                : e.target === "all-allies"
                  ? pl.units.map((u) => u.id)
                  : target
                    ? [target]
                    : [];
      if (e.definitionId === "draw") {
        for (let i = 0; i < value; i++) draw(owner);
      } else if (e.definitionId === "scout") {
        const top = pl.deck
          .splice(0, value)
          .sort(
            (a, b) =>
              cardAt(m, a).definition.cost - cardAt(m, b).definition.cost,
          );
        pl.deck.unshift(...top);
        emit("scout", owner, undefined, value, source);
      } else if (e.definitionId === "shatter") {
        const artifact = other.artifacts.shift();
        if (artifact) {
          other.grave.push(artifact.id);
          emit("shatter", owner, artifact.id, undefined, source);
        }
      } else if (e.definitionId === "summon") {
        for (
          let i = 0;
          i < value &&
          pl.units.length < RULES.creatures &&
          m.cards.length < 512;
          i++
        ) {
          const id = `token:${m.revision}:${resolved}:${i}`;
          // Tokens are bounded snapshots, never looked up in the editable collection.
          m.cards.push({
            id,
            cardId: "token:sentinela",
            revision: 1,
            name: "Sentinela de pólen",
            official: true,
            definition: {
              version: 1,
              kind: "creature",
              affinity: "neutral",
              cost: 1,
              attack: 1,
              health: 1,
              keywords: [],
              abilities: [],
              flavor: "Uma centelha tomou forma.",
              artId: "stone-sentinel",
            },
          });
          pl.units.push(newUnit(id, m.turn));
          emit("summon", owner, id, undefined, source);
        }
      } else
        for (const t of targets) {
          if (["damage", "drain", "chaos"].includes(e.definitionId)) {
            const actual = deal(t, value, source);
            if (e.definitionId === "drain") heal(`p${owner}`, actual, source);
          } else if (e.definitionId === "heal") heal(t, value, source);
          else {
            const u = findUnit(t);
            if (!u) continue;
            if (e.definitionId === "shield") {
              u.shield = Math.min(12, u.shield + value);
              emit("shield", owner, t, value, source);
            }
            if (e.definitionId === "empower") {
              if (u.modifiers.length < 32)
                u.modifiers.push({
                  value,
                  ...(e.duration === "turn" && { expires: m.turn }),
                });
              emit("empower", owner, t, value, source);
            }
            if (e.definitionId === "exhaust") {
              const controller = m.players.findIndex((pl) =>
                pl.units.some((x) => x.id === t),
              );
              u.exhaustedThrough = m.turn + (controller === m.active ? 2 : 1);
              emit("exhaust", owner, t, undefined, source);
            }
          }
        }
      sweep();
    }
  };
  if (a.type === "play") {
    const c = cardAt(m, a.card).definition;
    own.energy -= c.cost;
    own.hand = own.hand.filter((id) => id !== a.card);
    if (c.kind === "creature") {
      own.units.push(newUnit(a.card, m.turn));
      emit("summon", p, a.card);
    } else if (c.kind === "artifact") {
      own.artifacts.push({ id: a.card, activated: [] });
      emit("artifact", p, a.card);
    } else {
      own.grave.push(a.card);
      emit("spell", p, a.card);
    }
    resolve(playEffects(c), p, a.card, a.target);
  } else if (a.type === "attack") {
    const source = own.units.find((u) => u.id === a.source);
    if (!source) throw new DuelRuleError("Atacante ausente.");
    const defender = enemy.units.find((u) => u.id === a.target),
      attack = unitStats(m, source).attack,
      retaliation = defender ? unitStats(m, defender).attack : 0;
    source.attacked = true;
    emit("attack", p, a.target, attack, a.source);
    deal(a.target, attack, a.source);
    if (defender) deal(source.id, retaliation, defender.id);
    sweep();
  } else if (a.type === "activate") {
    const source = [...own.units, ...own.artifacts].find(
        (u) => u.id === a.source,
      ),
      ability = cardAt(m, a.source).definition.abilities.find(
        (b) => b.id === a.ability,
      );
    if (!source || !ability)
      throw new DuelRuleError("Habilidade indisponível.");
    own.energy -= ability.cost;
    source.activated.push(ability.id);
    emit("activate", p, a.source);
    resolve(ability.effects, p, a.source, a.target);
  } else if (a.type === "end") {
    for (const pl of m.players)
      for (const u of pl.units)
        u.modifiers = u.modifiers.filter(
          (b) => b.expires === undefined || b.expires > m.turn,
        );
    sweep();
    if (m.turn < RULES.turns) {
      m.turn++;
      m.active = 1 - p;
      m.actionsThisTurn = 0;
      const next = m.players[m.active];
      next.maximum = Math.min(RULES.energy, next.maximum + 1);
      next.energy = next.maximum;
      next.units.forEach((u) => {
        u.attacked = false;
        u.activated = [];
      });
      next.artifacts.forEach((x) => {
        x.activated = [];
      });
      emit("turn", m.active, undefined, m.turn);
      draw(m.active);
      for (const artifact of [...next.artifacts])
        for (const ability of cardAt(m, artifact.id).definition.abilities)
          if (ability.trigger === "start")
            resolve(ability.effects, m.active, artifact.id);
    } else m.result = { winner: null, reason: "turn-limit" };
  } else if (a.type === "pause") {
    m.status = "paused";
    emit("pause", 0);
  } else if (a.type === "resume") {
    m.status = "active";
    emit("resume", 0);
  } else if (a.type === "abandon") m.result = { winner: 1, reason: "abandon" };
  if (!control && a.type !== "end") m.actionsThisTurn++;
  const dead = m.players.map((pl) => pl.life <= 0);
  if (!m.result && dead.some(Boolean))
    m.result = {
      winner: dead[0] && dead[1] ? null : dead[0] ? 1 : 0,
      reason:
        dead[0] && dead[1]
          ? "simultaneous"
          : events.some((e) => e.type === "fatigue" && dead[e.player])
            ? "fatigue"
            : "life",
    };
  m.revision++;
  if (!m.result && m.revision >= RULES.commands)
    m.result = { winner: null, reason: "command-limit" };
  if (m.result) {
    m.status = "completed";
    emit("result", m.result.winner ?? 0);
  }
  m.history.push({ command, events });
  return { state: m, events };
}
function newUnit(id: string, turn: number): DuelUnit {
  return {
    id,
    damage: 0,
    shield: 0,
    summoned: turn,
    attacked: false,
    exhaustedThrough: 0,
    modifiers: [],
    activated: [],
  };
}

/** Strict graph validation at persistence/backup boundaries; no mutable collection dependency. */
export function validateMatch(value: unknown): DuelMatch {
  const m = matchSchema.parse(value);
  const ids = new Set(m.cards.map((c) => c.id));
  const originals = m.initial.flat();
  if (
    m.players[0].id !== "p0" ||
    m.players[1].id !== "p1" ||
    new Set(originals).size !== originals.length ||
    originals.length !==
      m.cards.filter((c) => !c.id.startsWith("token:")).length
  )
    throw new DuelRuleError("Identidades iniciais inconsistentes.");
  if (
    ids.size !== m.cards.length ||
    m.history.length !== m.revision ||
    !!m.result !== (m.status === "completed") ||
    new Set(m.history.map((h) => h.command.id)).size !== m.history.length ||
    m.history.some((h, i) => h.command.revision !== i)
  )
    throw new DuelRuleError("Histórico de duelo inconsistente.");
  const zones = m.players.flatMap((pl) => [
    ...pl.deck,
    ...pl.hand,
    ...pl.grave,
    ...pl.units.map((u) => u.id),
    ...pl.artifacts.map((a) => a.id),
  ]);
  if (
    new Set(zones).size !== zones.length ||
    zones.length !== ids.size ||
    zones.some((id) => !ids.has(id)) ||
    m.initial.flat().some((id) => !ids.has(id))
  )
    throw new DuelRuleError("Zonas de duelo inconsistentes.");
  for (const pl of m.players) {
    if (
      pl.energy > pl.maximum ||
      pl.units.some(
        (u) =>
          cardAt(m, u.id).definition.kind !== "creature" ||
          unitStats(m, u).health <= 0,
      ) ||
      pl.artifacts.some((a) => cardAt(m, a.id).definition.kind !== "artifact")
    )
      throw new DuelRuleError("Campo inválido.");
  }
  return m;
}
/** Replay uses frozen initial snapshots and original commands, including PRNG outcomes. */
export function replayDuel(m: DuelMatch): DuelMatch {
  const setup = (p: number): DuelSetup => ({
    deckId: m.players[p].deckId,
    deckRevision: m.players[p].deckRevision,
    name: m.players[p].name,
    affinity: m.players[p].affinity,
    deckName: m.players[p].deckName,
    cards: m.initial[p].map((id) => cardAt(m, id)),
  });
  const initial = createDuel([setup(0), setup(1)], m.seed, m.mode);
  return m.history.reduce(
    (state, h) => transition(state, h.command).state,
    initial,
  );
}
export function abilityEffects(
  c: CombatDefinition,
  trigger: DuelAbility["trigger"],
) {
  return c.abilities
    .filter((a) => a.trigger === trigger)
    .flatMap((a) => a.effects);
}
