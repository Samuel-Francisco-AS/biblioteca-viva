import type {
  CombatDefinition,
  DuelAction,
  DuelEvent,
  DuelMatch,
} from "../../../domain/duel/contracts";
import {
  cardAt,
  legalActions,
  unitStats,
  canAttack,
} from "../../../domain/duel/engine";

/**
 * BF-5.6F1 — Read-only game presentation contract.
 *
 * The arena never receives the opponent's hand/deck IDs, the initial shuffled
 * decks or the action history. Only DuelService is allowed to persist actions.
 * Do not add rules or mutate the match here; F2 consumes this projection.
 */
export interface ArenaCardView {
  readonly definition: CombatDefinition;
  readonly id: string;
  readonly cardId: string;
  readonly revision: number;
  readonly name: string;
  readonly kind: "creature" | "spell" | "artifact";
  readonly affinity: string;
  readonly artId: string;
  readonly cost: number;
  readonly attack?: number;
  readonly health?: number;
  readonly shield?: number;
  readonly guard: boolean;
  readonly haste: boolean;
  readonly canAttack: boolean;
  readonly exhausted: boolean;
}

export interface ArenaPlayerView {
  readonly id: "p0" | "p1";
  readonly name: string;
  readonly affinity: string;
  readonly life: number;
  readonly energy: number;
  readonly maximum: number;
  readonly handCount: number;
  readonly deckCount: number;
  readonly graveCount: number;
  readonly units: readonly ArenaCardView[];
  readonly artifacts: readonly ArenaCardView[];
}

export interface ArenaEventView {
  readonly type: DuelEvent["type"];
  readonly player: number;
  readonly value?: number;
  readonly source?: string;
  readonly target?: string;
}

export interface ArenaView {
  readonly ruleset: DuelMatch["ruleset"];
  readonly revision: number;
  readonly turn: number;
  readonly active: number;
  readonly status: DuelMatch["status"];
  readonly mode: DuelMatch["mode"];
  readonly result?: DuelMatch["result"];
  readonly player: ArenaPlayerView;
  readonly opponent: ArenaPlayerView;
  readonly hand: readonly ArenaCardView[];
  readonly actions: readonly DuelAction[];
  readonly events: readonly ArenaEventView[];
}

function cardView(match: DuelMatch, id: string): ArenaCardView {
  const c = cardAt(match, id);
  return {
    id,
    definition: structuredClone(c.definition),
    cardId: c.cardId,
    revision: c.revision,
    name: c.name,
    kind: c.definition.kind,
    affinity: c.definition.affinity,
    artId: c.definition.artId,
    cost: c.definition.cost,
    attack: c.definition.attack,
    health: c.definition.health,
    guard: c.definition.keywords.includes("guard"),
    haste: c.definition.keywords.includes("haste"),
    canAttack: false,
    exhausted: false,
  };
}

function playerView(match: DuelMatch, index: 0 | 1): ArenaPlayerView {
  const p = match.players[index];
  return {
    id: p.id,
    name: p.name,
    affinity: p.affinity,
    life: p.life,
    energy: p.energy,
    maximum: p.maximum,
    handCount: p.hand.length,
    deckCount: p.deck.length,
    graveCount: p.grave.length,
    units: p.units.map((u) => {
      const c = cardView(match, u.id);
      const stats = unitStats(match, u);
      return {
        ...c,
        attack: stats.attack,
        health: stats.health,
        shield: u.shield,
        canAttack: index === match.active && canAttack(match, u),
        exhausted: u.exhaustedThrough >= match.turn,
      };
    }),
    artifacts: p.artifacts.map((a) => cardView(match, a.id)),
  };
}

/** Render only confirmed feedback. Hidden draws never disclose card IDs. */
function publicEvent(e: DuelEvent): ArenaEventView {
  if (e.type === "draw" || e.type === "burn" || e.type === "scout") {
    return { type: e.type, player: e.player, value: e.value };
  }
  return {
    type: e.type,
    player: e.player,
    ...(e.value !== undefined && { value: e.value }),
    ...(e.source && { source: e.source }),
    ...(e.target && { target: e.target }),
  };
}

export function projectArena(match: DuelMatch): ArenaView {
  return {
    ruleset: match.ruleset,
    revision: match.revision,
    turn: match.turn,
    active: match.active,
    status: match.status,
    mode: match.mode,
    ...(match.result && { result: { ...match.result } }),
    player: playerView(match, 0),
    opponent: playerView(match, 1),
    hand: match.players[0].hand.map((id) => cardView(match, id)),
    actions:
      match.active === 0 && match.status === "active"
        ? legalActions(match, 0)
        : [],
    events: (match.history.at(-1)?.events ?? []).map(publicEvent),
  };
}

/**
 * F2 should display these exact legal actions as contextual choices, including
 * each legal target/ability. There is no independent legality engine in UI/3D.
 */
export function arenaActionsForSelection(
  view: ArenaView,
  selectedId: string | undefined,
): readonly DuelAction[] {
  if (!selectedId) return [];
  const visibleToPlayer = [
    ...view.hand,
    ...view.player.units,
    ...view.player.artifacts,
  ].some((c) => c.id === selectedId);
  if (!visibleToPlayer) return [];
  return view.actions.filter(
    (a) =>
      (a.type === "play" && a.card === selectedId) ||
      ((a.type === "attack" || a.type === "activate") &&
        a.source === selectedId),
  );
}

export function arenaActionIsLegal(
  view: ArenaView,
  action: DuelAction,
): boolean {
  return view.actions.some(
    (candidate) =>
      candidate.type === action.type &&
      JSON.stringify(Object.entries(candidate).sort()) ===
        JSON.stringify(Object.entries(action).sort()),
  );
}
