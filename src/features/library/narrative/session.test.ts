import { describe, expect, it } from "vitest";
import { NarrativeSession, matches, nodeFor, textFor } from "./session";
import { QUEST_IDS, STORIES } from "./stories";
import { validateStories } from "./validate";
import type { QuestId } from "./contracts";

function choose(session: NarrativeSession, key: string) {
  const s = session.getSnapshot(),
    node = nodeFor(s);
  const c = node?.choices.find(
    (c) => c.choiceId === `${s.active}:choice:${key}`,
  );
  expect(c, key).toBeDefined();
  expect(matches(c?.condition, s)).toBe(true);
  expect(session.choose(c!.choiceId, s.revision)).toBe(true);
}
function play(q: QuestId, path: readonly string[]) {
  const session = new NarrativeSession();
  session.open(q);
  for (const key of path) choose(session, key);
  expect(session.getSnapshot().quests[q].status).toBe("resolved");
  expect(session.getSnapshot().scenes[q]).toBe("restored");
  expect(nodeFor(session.getSnapshot())?.outcome).toBeTruthy();
  return session;
}
const shared = [
  "omen-ask",
  "omen-map",
  "visit-samael",
  "samael-account",
  "visit-aryn",
  "aryn-consent",
  "visit-ytha",
  "ytha-lead",
  "visit-lua",
  "lua-reconstruct",
  "gather",
];
const cooperation = ["energy-consent", "structure-open", "life-voice"];
describe("BF-4F4 authored narrative", () => {
  it("validates unique IDs, known conditions, destinations, reachability and exits for all five graphs", () => {
    expect(validateStories(Object.values(STORIES))).toEqual([]);
    expect(
      Object.values(STORIES).reduce((count, q) => count + q.nodes.length, 0),
    ).toBe(70);
    const broken = {
      ...STORIES.ashes,
      start: "missing",
      nodes: [...STORIES.ashes.nodes, STORIES.ashes.nodes[0]],
    };
    expect(validateStories([broken])).toEqual(
      expect.arrayContaining([
        expect.stringContaining("ID repetido"),
        expect.stringContaining("Início inválido"),
      ]),
    );
  });
  it("keeps every authored decision at 3–4 available choices, except a confirmation/exit", () => {
    for (const q of QUEST_IDS)
      for (const node of STORIES[q].nodes) {
        if (
          node.outcome ||
          node.nodeId === "rift:check" ||
          node.nodeId === "rift:conjure" ||
          node.nodeId === "rift:perspectives"
        )
          continue;
        expect(node.choices.length, node.nodeId).toBeGreaterThanOrEqual(3);
        expect(node.choices.length, node.nodeId).toBeLessThanOrEqual(4);
      }
  });
  it("resolves Samael discreetly or with exposure and a repaired boundary", () => {
    const quiet = play("ashes", [
      "quiet",
      "check-heat",
      "private-proof",
      "private-ending",
    ]);
    const exposed = play("ashes", [
      "aryn",
      "invite",
      "consented-team",
      "repair-exposure",
    ]);
    expect(quiet.getSnapshot().facts).toContain("ashes:trusted-player");
    expect(exposed.getSnapshot().facts).toContain("ashes:boundary");
    expect(exposed.getSnapshot().bonds.map((b) => b.change)).toContain(
      "friction",
    );
    expect(exposed.getSnapshot().quests.ashes.outcome).not.toBe(
      quiet.getSnapshot().quests.ashes.outcome,
    );
  });
  it("restores Aryn's atlas through evidence and Ytha's authorship or initial haste and Lua's design", () => {
    const evidence = play("anatomy", [
      "investigate",
      "trace-pollen",
      "delegate",
      "shared-repair",
    ]);
    const haste = play("anatomy", [
      "stabilize",
      "ask-lua",
      "apology",
      "lua-repair",
    ]);
    expect(evidence.getSnapshot().facts).toContain("anatomy:delegated");
    expect(haste.getSnapshot().facts).toContain("anatomy:repair-first");
    expect(
      evidence.getSnapshot().bonds.some((b) => b.pair.includes("ytha")),
    ).toBe(true);
    expect(haste.getSnapshot().bonds.some((b) => b.pair.includes("lua"))).toBe(
      true,
    );
    expect(evidence.getSnapshot().quests.anatomy.outcome).not.toBe(
      haste.getSnapshot().quests.anatomy.outcome,
    );
  });
  it("restores Ytha's plant with a private memory or an experimental window she designs", () => {
    const quiet = play("petals", [
      "samael",
      "ask-memory",
      "keep-memory",
      "gentle-return",
    ]);
    const window = play("petals", ["lua", "window", "living-map"]);
    expect(quiet.getSnapshot().facts).toContain("petals:private-memory");
    expect(window.getSnapshot().facts).toContain("petals:map");
    expect(window.getSnapshot().bonds.some((b) => b.pair.includes("lua"))).toBe(
      true,
    );
    expect(window.getSnapshot().quests.petals.outcome).not.toBe(
      quiet.getSnapshot().quests.petals.outcome,
    );
  });
  it("lets Lua learn through review or interrupt overload and collaborate without losing authorship", () => {
    const review = play("spell", [
      "review",
      "globe-proof",
      "small-open",
      "keep-study",
    ]);
    const overload = play("spell", [
      "encourage",
      "boost-test",
      "get-samael",
      "contained-correction",
      "show-work",
    ]);
    expect(review.getSnapshot().facts).toContain("spell:study");
    expect(overload.getSnapshot().facts).toContain("spell:overload");
    expect(
      overload.getSnapshot().bonds.some((b) => b.pair.includes("samael")),
    ).toBe(true);
    expect(overload.getSnapshot().quests.spell.outcome).not.toBe(
      review.getSnapshot().quests.spell.outcome,
    );
  });
  it("resolves both shared strategies with four indispensable contributions, no individual prerequisites", () => {
    const contained = play("rift", [
      ...shared,
      "contain",
      "seal-margin",
      ...cooperation,
      "finish-contain",
      "sealed-record",
      "last-table",
    ]);
    const opened = play("rift", [
      ...shared,
      "experiment",
      "experiment-ytha",
      ...cooperation,
      "finish-open",
      "surge-rhythm",
      "open-credit",
      "last-promise",
    ]);
    for (const session of [contained, opened]) {
      expect(session.getSnapshot().facts).toEqual(
        expect.arrayContaining([
          "rift:did-samael",
          "rift:did-aryn",
          "rift:did-ytha",
          "rift:did-lua",
        ]),
      );
      for (const q of QUEST_IDS.filter((q) => q !== "rift"))
        expect(session.getSnapshot().quests[q].status).toBe("available");
    }
    expect(opened.getSnapshot().facts).toContain("rift:color-shift");
    expect(contained.getSnapshot().quests.rift.outcome).toContain(
      "parte da inscrição se perdeu",
    );
    expect(opened.getSnapshot().quests.rift.outcome).toContain(
      "inscrição foi lida",
    );
  });
  it("makes perspective order contextual and canvas character selection joins the active investigation", () => {
    const session = new NarrativeSession();
    session.open("rift");
    choose(session, "omen-ask");
    choose(session, "omen-map");
    session.talk("lua");
    expect(nodeFor(session.getSnapshot())?.nodeId).toBe("rift:lua");
    choose(session, "lua-review");
    session.talk("samael");
    expect(
      textFor(nodeFor(session.getSnapshot())!, session.getSnapshot()),
    ).toContain("Lua já lhe mostrou");
    choose(session, "samael-proof");
    expect(session.getSnapshot().inspection).toBe("living:hearth");
    const available = nodeFor(session.getSnapshot())!.choices.filter((c) =>
      matches(c.condition, session.getSnapshot()),
    );
    expect(available).toHaveLength(2);
    expect(available.some((c) => c.choiceId === "rift:choice:gather")).toBe(
      false,
    );
  });
  it("rejects double taps, stale callbacks and effects from subscriber recursion", () => {
    const session = new NarrativeSession();
    session.open("ashes");
    const revision = session.getSnapshot().revision;
    let recursive = true;
    session.subscribe(() => {
      recursive = session.choose(
        "ashes:choice:check-heat",
        session.getSnapshot().revision,
      );
    });
    expect(session.choose("ashes:choice:quiet", revision)).toBe(true);
    expect(session.choose("ashes:choice:quiet", revision)).toBe(false);
    expect(recursive).toBe(false);
    expect(session.getSnapshot().facts).toEqual(["ashes:discreet"]);
    expect(session.getSnapshot().history).toHaveLength(1);
  });
  it("resumes interrupted objectives, switches characters, bounds history and resets only fiction", () => {
    const session = new NarrativeSession();
    session.open("rift");
    shared.forEach((key) => choose(session, key));
    session.close();
    session.open("spell");
    choose(session, "review");
    session.close();
    session.open("rift");
    expect(nodeFor(session.getSnapshot())?.nodeId).toBe("rift:decision");
    for (let i = 0; i < 18; i++) {
      choose(session, "review-pact");
      choose(session, "pact-rest");
    }
    expect(session.getSnapshot().history).toHaveLength(16);
    session.open("spell");
    expect(nodeFor(session.getSnapshot())?.nodeId).toBe("spell:review");
    const old = session.getSnapshot().revision;
    session.reset();
    expect(session.getSnapshot().revision).toBeGreaterThan(old);
    expect(session.getSnapshot().facts).toEqual([]);
    expect(session.getSnapshot().bonds).toEqual([]);
  });
  it("cannot publish or activate late effects after disposal", () => {
    const session = new NarrativeSession();
    session.open("ashes");
    let calls = 0;
    session.subscribe(() => {
      calls++;
    });
    const state = session.getSnapshot();
    session.dispose();
    session.open("spell");
    session.close();
    session.reset();
    expect(session.choose("ashes:choice:quiet", state.revision)).toBe(false);
    expect(session.getSnapshot()).toBe(state);
    expect(calls).toBe(0);
  });
});

it("explores every reachable authored choice under its conditions, with no trapped state and pure evaluation", () => {
  let covered = 0;
  for (const q of QUEST_IDS) {
    const queue: string[][] = [[]],
      states = new Map<string, { terminal: boolean; edges: string[] }>();
    const conditionFacts = new Set<string>();
    const visitCondition = (
      condition: import("./contracts").Condition | undefined,
    ) => {
      if (condition?.kind === "fact") conditionFacts.add(condition.fact);
      if (condition?.kind === "all")
        condition.conditions.forEach(visitCondition);
    };
    STORIES[q].nodes.forEach((n) =>
      n.choices.forEach((c) => visitCondition(c.condition)),
    );
    const keyFor = (s: import("./contracts").NarrativeSnapshot) =>
      `${s.quests[q].nodeId}|${s.facts
        .filter((f) => conditionFacts.has(f))
        .sort()
        .join(",")}`;
    const nodes = new Set<string>(),
      choices = new Set<string>();
    while (queue.length) {
      const path = queue.shift()!,
        session = new NarrativeSession();
      session.open(q);
      for (const id of path)
        expect(session.choose(id, session.getSnapshot().revision)).toBe(true);
      const s = session.getSnapshot(),
        key = keyFor(s);
      if (states.has(key)) continue;
      const node = nodeFor(s)!;
      nodes.add(node.nodeId);
      const before = JSON.stringify(s),
        available = node.choices.filter((c) => matches(c.condition, s));
      expect(JSON.stringify(session.getSnapshot())).toBe(before);
      expect(available.length <= 4).toBe(true);
      expect(Boolean(node.outcome) || available.length > 0).toBe(true);
      const edges: string[] = [];
      for (const c of available) {
        const nextSession = new NarrativeSession();
        nextSession.open(q);
        for (const id of path)
          nextSession.choose(id, nextSession.getSnapshot().revision);
        nextSession.choose(c.choiceId, nextSession.getSnapshot().revision);
        edges.push(keyFor(nextSession.getSnapshot()));
        choices.add(c.choiceId);
        queue.push([...path, c.choiceId]);
        nextSession.dispose();
      }
      states.set(key, { terminal: Boolean(node.outcome), edges });
      session.dispose();
      expect(states.size).toBeLessThan(800);
    }
    expect([...nodes].sort()).toEqual(
      STORIES[q].nodes.map((n) => n.nodeId).sort(),
    );
    expect(choices.size).toBe(
      STORIES[q].nodes.reduce((sum, n) => sum + n.choices.length, 0),
    );
    const canFinish = new Set(
      [...states].filter(([, state]) => state.terminal).map(([id]) => id),
    );
    for (let i = 0; i < states.size; i++)
      for (const [key, s] of states)
        if (s.edges.some((e) => canFinish.has(e))) canFinish.add(key);
    expect(canFinish.size).toBe(states.size);
    covered += choices.size;
  }
  expect(covered).toBeGreaterThan(150);
});
