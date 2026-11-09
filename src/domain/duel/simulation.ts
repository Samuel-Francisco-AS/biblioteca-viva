import { combatSnapshot } from "./cards";
import { officialCards, starterDecks } from "./catalogue";
import { chooseDuelAction } from "./ai";
import {
  createDuel,
  transition,
  validateMatch,
  type DuelSetup,
} from "./engine";
// Catalogue snapshots are domain values; the mapping here never accesses persistence.
function setup(i: number): DuelSetup {
  const d = starterDecks[i];
  if (!d.combat || d.selection.kind !== "static")
    throw new Error("Invalid starter");
  return {
    name: d.name.split(" · ")[0],
    affinity: d.combat.affinity,
    deckName: d.name,
    cards: d.selection.cards.flatMap((r) =>
      Array.from({ length: d.combat!.copies[r.cardId] }, () =>
        combatSnapshot(officialCards.find((c) => c.id === r.cardId)!),
      ),
    ),
  };
}
export function simulateDuels(seeds: readonly number[]) {
  const games: {
    first: string;
    second: string;
    seed: number;
    winner: string | null;
    reason: string;
    turns: number;
    commands: number;
    fatigue: number;
    maximumEffects: number;
    unspent: number;
  }[] = [];
  const used: Record<string, number> = {},
    seen: Record<string, number> = {};
  for (let first = 0; first < 4; first++)
    for (let second = 0; second < 4; second++)
      for (const seed of seeds) {
        const a = setup(first),
          b = setup(second);
        let m = createDuel([a, b], seed),
          unspent = 0,
          maximumEffects = 0;
        for (const p of m.players)
          for (const id of p.hand) {
            const card = m.cards.find((c) => c.id === id)!;
            seen[card.cardId] = (seen[card.cardId] ?? 0) + 1;
          }
        while (!m.result) {
          const action = chooseDuelAction(m);
          if (action.type === "end") unspent += m.players[m.active].energy;
          if (action.type === "play") {
            const card = m.cards.find((c) => c.id === action.card)!;
            used[card.cardId] = (used[card.cardId] ?? 0) + 1;
          }
          const { state, events } = transition(m, {
            id: `sim-${m.revision}`,
            revision: m.revision,
            player: m.active,
            action,
          });
          m = state;
          maximumEffects = Math.max(maximumEffects, events.length);
          for (const e of events.filter((e) => e.type === "draw")) {
            const card = m.cards.find((c) => c.id === e.target)!;
            seen[card.cardId] = (seen[card.cardId] ?? 0) + 1;
          }
        }
        validateMatch(m);
        const r = m.result!;
        games.push({
          first: a.affinity,
          second: b.affinity,
          seed,
          winner:
            r.winner === null ? null : r.winner === 0 ? a.affinity : b.affinity,
          reason: r.reason,
          turns: m.turn,
          commands: m.revision,
          fatigue: m.players.reduce((n, p) => n + p.fatigue, 0),
          maximumEffects,
          unspent,
        });
      }
  return {
    ruleset: "duelo-arcano/1.0.0",
    seeds,
    games,
    total: games.length,
    meanTurns: games.reduce((n, g) => n + g.turns, 0) / games.length,
    meanCommands: games.reduce((n, g) => n + g.commands, 0) / games.length,
    firstWins: games.filter((g) => g.first !== g.second && g.winner === g.first)
      .length,
    secondWins: games.filter(
      (g) => g.first !== g.second && g.winner === g.second,
    ).length,
    draws: games.filter((g) => g.winner === null).length,
    conditions: Object.fromEntries(
      [...new Set(games.map((g) => g.reason))].map((r) => [
        r,
        games.filter((g) => g.reason === r).length,
      ]),
    ),
    matchups: starterDecks.map((d, i) => ({
      affinity: d.combat!.affinity,
      wins: games.filter(
        (g) => g.first !== g.second && g.winner === setup(i).affinity,
      ).length,
      played: games.filter(
        (g) =>
          g.first !== g.second &&
          (g.first === setup(i).affinity || g.second === setup(i).affinity),
      ).length,
    })),
    cards: officialCards.map((c) => ({
      id: c.id,
      seen: seen[c.id] ?? 0,
      played: used[c.id] ?? 0,
    })),
    limits: {
      maximumCommands: Math.max(...games.map((g) => g.commands)),
      maximumEvents: Math.max(...games.map((g) => g.maximumEffects)),
    },
  };
}
