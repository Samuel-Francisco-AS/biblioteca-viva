import fs from "node:fs";
import { createServer } from "vite";
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { simulateDuels } = await server.ssrLoadModule(
    "/src/domain/duel/simulation.ts",
  );
  const started = performance.now();
  const count = Number(process.argv[2] ?? 12);
  if (!Number.isInteger(count) || count < 1 || count > 64)
    throw new Error("Use 1–64 seeds");
  const result = simulateDuels(Array.from({ length: count }, (_, i) => i + 1));
  result.hostMilliseconds = performance.now() - started;
  const target =
    process.argv[3] ?? "docs/audits/evidence/bf56e/simulations.json";
  fs.writeFileSync(target, JSON.stringify(result, null, 2) + "\n");
  console.log(
    JSON.stringify(
      {
        file: target,
        total: result.total,
        meanTurns: result.meanTurns,
        firstWins: result.firstWins,
        secondWins: result.secondWins,
        draws: result.draws,
        conditions: result.conditions,
        matchups: result.matchups,
        neverPlayed: result.cards.filter((c) => !c.played),
        limits: result.limits,
        hostMilliseconds: result.hostMilliseconds,
      },
      null,
      2,
    ),
  );
} finally {
  await server.close();
}
