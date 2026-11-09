import { z } from "zod";

export class DuelRuleError extends Error {}

export const RULESET = "duelo-arcano/1.0.0" as const;
export const RULES = {
  life: 20,
  deck: 24,
  copies: 2,
  energy: 6,
  hand: 8,
  creatures: 4,
  artifacts: 2,
  turns: 120,
  actionsPerTurn: 64,
  commands: 4096,
  effects: 64,
} as const;
export const affinities = ["ruin", "knowledge", "bloom", "chaos"] as const;
export const affinitySchema = z.enum([...affinities, "neutral"]);
export type Affinity = z.infer<typeof affinitySchema>;
export const modeSchema = z.enum(["official", "creator", "free"]);
export type DuelMode = z.infer<typeof modeSchema>;
export const effectIds = [
  "damage",
  "heal",
  "draw",
  "shield",
  "empower",
  "summon",
  "drain",
  "chaos",
  "scout",
  "exhaust",
  "shatter",
] as const;
export const targetSchema = z.enum([
  "enemy",
  "ally",
  "enemy-unit",
  "ally-unit",
  "enemy-any",
  "self",
  "all-enemies",
  "all-allies",
]);
export type TargetKind = z.infer<typeof targetSchema>;
export const effectSchema = z
  .strictObject({
    definitionId: z.enum(effectIds),
    value: z.int().min(1).max(6),
    target: targetSchema,
    duration: z.enum(["permanent", "turn"]),
  })
  .superRefine((e, ctx) => {
    const allowed: Record<typeof e.definitionId, readonly TargetKind[]> = {
      damage: [
        "ally",
        "enemy",
        "enemy-unit",
        "enemy-any",
        "all-enemies",
        "self",
      ],
      heal: ["ally", "ally-unit", "self"],
      draw: ["ally"],
      shield: ["ally-unit", "self"],
      empower: ["ally-unit", "self", "all-allies"],
      summon: ["ally"],
      drain: ["enemy", "enemy-unit", "enemy-any"],
      chaos: ["enemy", "enemy-unit", "enemy-any", "all-enemies"],
      scout: ["ally"],
      exhaust: ["enemy-unit"],
      shatter: ["enemy"],
    };
    if (
      !allowed[e.definitionId].includes(e.target) ||
      (e.duration === "turn" && e.definitionId !== "empower")
    )
      ctx.addIssue({
        code: "custom",
        message: "Alvo ou duração incompatível com o efeito.",
      });
    if (["draw", "summon"].includes(e.definitionId) && e.value > 2)
      ctx.addIssue({
        code: "custom",
        message: "Compra e invocação limitadas a duas unidades por efeito.",
      });
  });
export type DuelEffect = z.infer<typeof effectSchema>;
export const abilitySchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]{1,40}$/),
  trigger: z.enum(["play", "start", "activate"]),
  cost: z.int().min(0).max(3),
  effects: z.array(effectSchema).min(1).max(2),
});
export type DuelAbility = z.infer<typeof abilitySchema>;
export const definitionSchema = z
  .strictObject({
    version: z.literal(1),
    kind: z.enum(["creature", "spell", "artifact"]),
    affinity: affinitySchema,
    cost: z.int().min(1).max(6),
    attack: z.int().min(0).max(8).optional(),
    health: z.int().min(1).max(10).optional(),
    keywords: z.array(z.enum(["guard", "haste"])).max(2),
    abilities: z.array(abilitySchema).max(2),
    flavor: z.string().max(300),
    artId: z.string().regex(/^[a-z0-9-]{1,80}$/),
  })
  .superRefine((c, ctx) => {
    const bad = (message: string) => ctx.addIssue({ code: "custom", message });
    if (
      (c.kind === "creature") !==
        (c.attack !== undefined && c.health !== undefined) ||
      (c.kind !== "creature" &&
        (c.attack !== undefined || c.health !== undefined || c.keywords.length))
    )
      bad("Atributos e palavras-chave exclusivos de criaturas.");
    if (
      new Set(c.keywords).size !== c.keywords.length ||
      new Set(c.abilities.map((a) => a.id)).size !== c.abilities.length
    )
      bad("Habilidades ou palavras-chave repetidas.");
    if (
      c.kind === "spell" &&
      (!c.abilities.length || c.abilities.some((a) => a.trigger !== "play"))
    )
      bad("Feitiços exigem efeitos de conjuração.");
    if (c.abilities.some((a) => a.trigger !== "activate" && a.cost !== 0))
      bad("Somente ativações possuem custo adicional.");
    if (c.abilities.some((a) => a.trigger === "start" && c.kind !== "artifact"))
      bad("Início de turno exclusivo de artefatos.");
    if (
      c.abilities.some(
        (a) =>
          a.trigger === "start" &&
          a.effects.some((e) =>
            ["enemy-unit", "ally-unit", "enemy-any", "self"].includes(e.target),
          ),
      )
    )
      bad("Efeito automático exige alvo automático.");
    if (
      c.abilities.some(
        (a) =>
          a.effects.some((e) => e.target === "self") && c.kind !== "creature",
      )
    )
      bad("Alvo próprio exige criatura.");
    const targets = c.abilities
      .filter((a) => a.trigger === "play")
      .flatMap((a) => a.effects)
      .filter((e) =>
        ["enemy-unit", "ally-unit", "enemy-any"].includes(e.target),
      )
      .map((e) => e.target);
    if (new Set(targets).size > 1)
      bad("Efeitos de conjuração devem compartilhar a mesma classe de alvo.");
    for (const a of c.abilities)
      if (
        new Set(
          a.effects
            .filter((e) =>
              ["enemy-unit", "ally-unit", "enemy-any"].includes(e.target),
            )
            .map((e) => e.target),
        ).size > 1
      )
        bad("Uma ativação deve compartilhar classe de alvo.");
  });
export type CombatDefinition = z.infer<typeof definitionSchema>;
export const snapshotSchema = z.strictObject({
  id: z.string().min(1).max(200),
  cardId: z.string().min(1),
  revision: z.int().positive(),
  name: z.string().trim().min(1).max(160),
  official: z.boolean(),
  definition: definitionSchema,
});
export type DuelCard = z.infer<typeof snapshotSchema>;
export const actionSchema = z.discriminatedUnion("type", [
  z.strictObject({
    type: z.literal("play"),
    card: z.string(),
    target: z.string().optional(),
  }),
  z.strictObject({
    type: z.literal("attack"),
    source: z.string(),
    target: z.string(),
  }),
  z.strictObject({
    type: z.literal("activate"),
    source: z.string(),
    ability: z.string(),
    target: z.string().optional(),
  }),
  z.strictObject({ type: z.literal("end") }),
  z.strictObject({ type: z.literal("pause") }),
  z.strictObject({ type: z.literal("resume") }),
  z.strictObject({ type: z.literal("abandon") }),
]);
export type DuelAction = z.infer<typeof actionSchema>;
export const commandSchema = z.strictObject({
  id: z.string().min(1).max(160),
  revision: z.int().nonnegative(),
  player: z.int().min(0).max(1),
  action: actionSchema,
});
export type DuelCommand = z.infer<typeof commandSchema>;
const modifierSchema = z.strictObject({
  value: z.int().min(1).max(6),
  expires: z.int().positive().optional(),
});
const unitSchema = z.strictObject({
  id: z.string(),
  damage: z.int().nonnegative().max(1000),
  shield: z.int().min(0).max(12),
  summoned: z.int().positive(),
  attacked: z.boolean(),
  exhaustedThrough: z.int().nonnegative(),
  modifiers: z.array(modifierSchema).max(32),
  activated: z.array(z.string()).max(2),
});
const playerSchema = z.strictObject({
  name: z.string().min(1).max(160),
  affinity: affinitySchema,
  deckName: z.string().min(1).max(160),
  life: z.int().min(-1000).max(20),
  energy: z.int().min(0).max(6),
  maximum: z.int().min(0).max(6),
  fatigue: z.int().min(0).max(200),
  deck: z.array(z.string()).max(60),
  hand: z.array(z.string()).max(8),
  grave: z.array(z.string()).max(100),
  units: z.array(unitSchema).max(4),
  artifacts: z
    .array(
      z.strictObject({ id: z.string(), activated: z.array(z.string()).max(2) }),
    )
    .max(2),
});
export const duelEventSchema = z.strictObject({
  type: z.enum([
    "draw",
    "burn",
    "summon",
    "spell",
    "artifact",
    "attack",
    "damage",
    "heal",
    "shield",
    "empower",
    "exhaust",
    "shatter",
    "scout",
    "death",
    "fatigue",
    "turn",
    "result",
    "pause",
    "resume",
    "activate",
  ]),
  player: z.int().min(0).max(1),
  source: z.string().optional(),
  target: z.string().optional(),
  value: z.int().optional(),
});
export type DuelEvent = z.infer<typeof duelEventSchema>;
export const matchSchema = z.strictObject({
  ruleset: z.literal(RULESET),
  seed: z.int().min(0).max(0xffffffff),
  rng: z.int().min(0).max(0xffffffff),
  mode: modeSchema,
  revision: z.int().nonnegative().max(RULES.commands),
  turn: z.int().positive().max(RULES.turns),
  active: z.int().min(0).max(1),
  actionsThisTurn: z.int().nonnegative().max(RULES.actionsPerTurn),
  status: z.enum(["active", "paused", "completed"]),
  players: z.tuple([playerSchema, playerSchema]),
  cards: z.array(snapshotSchema).min(2).max(512),
  initial: z.tuple([z.array(z.string()).max(60), z.array(z.string()).max(60)]),
  history: z
    .array(
      z.strictObject({
        command: commandSchema,
        events: z.array(duelEventSchema).max(128),
      }),
    )
    .max(RULES.commands),
  result: z
    .strictObject({
      winner: z.int().min(0).max(1).nullable(),
      reason: z.enum([
        "life",
        "fatigue",
        "abandon",
        "turn-limit",
        "command-limit",
        "simultaneous",
      ]),
    })
    .optional(),
});
export type DuelMatch = z.infer<typeof matchSchema>;
export type DuelPlayer = DuelMatch["players"][number];
export type DuelUnit = DuelPlayer["units"][number];
export const combatDeckSchema = z.strictObject({
  version: z.literal(1),
  affinity: affinitySchema,
  mode: modeSchema,
  copies: z.record(z.string().min(1), z.int().min(1).max(4)),
});
export type CombatDeck = z.infer<typeof combatDeckSchema>;

export function creationPower(c: CombatDefinition): number {
  const weights: Record<DuelEffect["definitionId"], number> = {
    damage: 1.5,
    heal: 0.65,
    draw: 2.5,
    shield: 0.8,
    empower: 2,
    summon: 2.8,
    drain: 2,
    chaos: 1,
    scout: 0.7,
    exhaust: 1.2,
    shatter: 1.2,
  };
  return (
    (c.attack ?? 0) +
    (c.health ?? 0) * 0.65 +
    c.keywords.length * 1.5 +
    c.abilities.reduce(
      (total, a) =>
        total +
        a.effects.reduce(
          (v, e) =>
            v +
            weights[e.definitionId] *
              e.value *
              (["all-enemies", "all-allies"].includes(e.target) ? 2 : 1) *
              (e.duration === "turn" ? 0.65 : 1),
          0,
        ) *
          (a.trigger === "start"
            ? 2
            : a.trigger === "activate"
              ? Math.max(0.5, 1.5 - a.cost * 0.35)
              : 1),
      0,
    )
  );
}
export function validateCreation(c: CombatDefinition): void {
  definitionSchema.parse(c);
  if (
    creationPower(c) > c.cost * 2.6 + 2 ||
    c.abilities.some(
      (a) =>
        a.trigger === "start" &&
        a.effects.some((e) => e.definitionId === "draw" && e.value > 1),
    )
  )
    throw new DuelRuleError(
      "Orçamento de criação excedido. Aumente o custo ou reduza atributos/efeitos.",
    );
}
