// @vitest-environment node
import "fake-indexeddb/auto";
import { readFileSync } from "node:fs";
import Dexie from "dexie";
import { afterEach, expect, it, vi } from "vitest";
import { BibliotecaDatabase } from "./database";
import { DexieArcanariumRepository } from "./arcanariumRepository";
import { DexieLibraryEntryRepository } from "./repositories";
import { DexieTransactionRunner } from "./transactionRunner";
import { DexiePackStore } from "./packStore";
import { EducationalPacksService } from "../../application/educationalPacks";
import { ProvationsService } from "../../application/provations";
import { JsonEducationalPackCodec, sha256Bytes } from "../packs/packCodec";
import { DexieBackupSnapshotStore } from "../backup/dexieBackupStore";
import { JsonBackupCodec } from "../backup/backupCodec";
import { educationalCardId, type PackLot } from "../../domain/educationalPacks";
import {
  learningReport,
  trialPresentation,
  selectDeck,
} from "../../domain/provations";
import { DATABASE_SCHEMA_V17 } from "./schema";
const now = "2026-11-09T12:00:00.000Z";
const v1 = readFileSync(
    "src/infrastructure/packs/content/matematica-original-v1.json",
    "utf8",
  ),
  v2 = readFileSync(
    "src/infrastructure/packs/content/matematica-original-v2.json",
    "utf8",
  );
const id = "arcanario-matematica-original";
const dbs: BibliotecaDatabase[] = [];
afterEach(async () => {
  for (const db of dbs.splice(0)) {
    db.close();
    await Dexie.delete(db.name);
  }
});
async function setup() {
  const db = new BibliotecaDatabase(`packs-test-${crypto.randomUUID()}`);
  dbs.push(db);
  await db.open();
  const repo = new DexieArcanariumRepository(db),
    store = new DexiePackStore(db),
    codec = new JsonEducationalPackCodec();
  const deps = {
    arcanarium: repo,
    libraryEntries: new DexieLibraryEntryRepository(db),
    transaction: new DexieTransactionRunner(db),
    clock: { now: () => Promise.resolve(now) },
    ids: { generate: () => Promise.resolve(crypto.randomUUID()) },
    events: { publish: async () => {} },
  };
  return {
    db,
    repo,
    codec,
    store,
    service: new EducationalPacksService(deps, store, codec),
    trials: new ProvationsService(deps),
    backup: new DexieBackupSnapshotStore(db),
  };
}
function envelope(text = v1) {
  return JSON.parse(text) as {
    kind: string;
    formatVersion: number;
    manifest: import("../../domain/packManifest").PackManifest;
    files: Record<string, string>;
  };
}
async function editLot(f: (lot: PackLot) => void, text = v1) {
  const e = envelope(text),
    m = e.manifest.lots[0],
    lot = JSON.parse(e.files[m.path]) as PackLot;
  f(lot);
  const raw = JSON.stringify(lot);
  e.files[m.path] = raw;
  m.bytes = Buffer.byteLength(raw);
  m.sha256 = await sha256Bytes(raw);
  return JSON.stringify(e);
}
const selection = {
  kind: "dynamic" as const,
  criteria: {
    version: 2 as const,
    types: ["question" as const],
    knowledgeTagIds: [],
    personalTagIds: [],
    history: "all" as const,
    limit: 500,
  },
};
it("installs partial lot, repeats without writes, adds only lot 2, preserves history through remove/reinstall/reopen", async () => {
  const x = await setup();
  expect((await x.service.install(v1)).written).toBe(2);
  const first = await x.db.arcanariumVersions.toArray();
  expect((await x.service.install(v1)).written).toBe(0);
  const incremental = envelope(v2);
  delete incremental.files["lote-1.json"];
  expect((await x.service.install(JSON.stringify(incremental))).written).toBe(
    2,
  );
  expect(await x.db.arcanariumVersions.count()).toBe(4);
  expect(
    (await x.db.arcanariumVersions.toArray()).filter((v) =>
      first.some((f) => f.cardId === v.cardId),
    ),
  ).toEqual(first);
  const s = await x.trials.start({ selection });
  expect(s.cards).toHaveLength(4);
  expect(trialPresentation(await x.repo.read(), s)).not.toHaveProperty(
    "correction",
  );
  await x.trials.command({
    sessionId: s.id,
    expectedRevision: 1,
    command: { kind: "answer", alternativeId: "c" },
  });
  const report = learningReport(await x.repo.read(), now);
  expect(report.summary.attempts).toBe(1);
  await x.service.remove(id);
  expect(await x.trials.preview({ selection })).toHaveLength(0);
  expect(learningReport(await x.repo.read(), now).summary).toEqual(
    report.summary,
  );
  expect((await x.service.install(v2)).written).toBe(0);
  expect(await x.trials.preview({ selection })).toHaveLength(4);
  x.db.close();
  await x.db.open();
  expect((await x.service.integrity(id)).status).toBe("ok");
  expect(learningReport(await x.repo.read(), now).summary).toEqual(
    report.summary,
  );
});
it.each([
  "hash",
  "format",
  "count",
  "duplicate",
  "identity",
  "tags",
  "rights",
  "extra",
  "active",
])("rejects %s before writing", async (kind) => {
  const x = await setup();
  const e = envelope();
  let text: string;
  if (kind === "hash") e.files["lote-1.json"] += " ";
  if (kind === "format") e.formatVersion = 20;
  if (kind === "count") e.manifest.publishedCount = 5;
  if (kind === "rights") e.manifest.rights.status = "unverified";
  if (kind === "extra") e.files["../script.js"] = "alert(1)";
  text = JSON.stringify(e);
  if (kind === "duplicate")
    text = await editLot((l) => {
      l.questions.push(l.questions[0]);
    });
  if (kind === "identity")
    text = await editLot((l) => {
      l.questions[0].identity.booklet = "Outro";
    });
  if (kind === "tags")
    text = await editLot((l) => {
      l.tags = [];
    });
  if (kind === "active")
    text = await editLot((l) => {
      l.questions[0].source = "javascript:alert(1)";
    });
  await expect(x.service.install(text)).rejects.toThrow();
  expect(await x.db.arcanariumCards.count()).toBe(0);
  expect(await x.db.educationalPacks.count()).toBe(0);
});
it("rollback after a mid-install failure and interrupted transaction; retry succeeds", async () => {
  const x = await setup();
  vi.spyOn(x.repo, "putCard").mockRejectedValueOnce(new Error("interruption"));
  await expect(x.service.install(v1)).rejects.toThrow();
  expect(await x.db.arcanariumVersions.count()).toBe(0);
  expect(await x.db.knowledgeTags.count()).toBe(0);
  expect(await x.db.educationalPacks.count()).toBe(0);
  expect((await x.service.install(v1)).written).toBe(2);
});
it("rejects global collisions and incompatible revisions without changing existing data", async () => {
  const x = await setup();
  await x.service.install(v1);
  const before = await x.repo.read();
  const bad = await editLot((l) => {
    const q = l.questions[0];
    if (q.content.type === "question") q.content.correctAlternativeId = "a";
  });
  const e = envelope(bad);
  e.manifest.editorialVersion = 2;
  await expect(x.service.install(JSON.stringify(e))).rejects.toThrow();
  expect(await x.repo.read()).toEqual(before);
  const other = envelope(v1);
  other.manifest.id = "another";
  const lot = JSON.parse(other.files["lote-1.json"]) as PackLot;
  lot.packId = "another";
  lot.tags = [];
  lot.questions.forEach((q) => {
    if (q.content.type === "question")
      q.content.classification.knowledgeTagIds = [];
  });
  const raw = JSON.stringify(lot);
  other.files["lote-1.json"] = raw;
  other.manifest.lots[0].sha256 = await sha256Bytes(raw);
  other.manifest.lots[0].bytes = Buffer.byteLength(raw);
  await expect(x.service.install(JSON.stringify(other))).rejects.toThrow(
    /Colisão/,
  );
  expect(await x.repo.read()).toEqual(before);
});
it("editorial corrections create immutable revisions, annulled/preliminary excluded, history unchanged", async () => {
  const x = await setup();
  await x.service.install(v1);
  const s = await x.trials.start({ selection });
  await x.trials.command({
    sessionId: s.id,
    expectedRevision: 1,
    command: { kind: "answer", alternativeId: "c" },
  });
  const before = learningReport(await x.repo.read(), now).summary;
  const corrected = await editLot((l) => {
    const q = structuredClone(l.questions[0]);
    q.revision = 2;
    q.correctionSource = q.source;
    if (q.content.type === "question") {
      q.content.correctAlternativeId = "a";
      q.content.editorial = {
        status: "valid",
        answerKey: "final",
        commentary: "Arcanário",
        sourceUrl: q.source,
        correctionSource: q.source,
      };
    }
    l.questions.splice(1, 0, q);
  });
  const e = envelope(corrected);
  e.manifest.editorialVersion = 2;
  await x.service.install(JSON.stringify(e));
  expect((await x.repo.read()).cards[0].revision).toBe(2);
  expect(learningReport(await x.repo.read(), now).summary).toEqual(before);
  const data = await x.repo.read();
  const current = data.cards.find((c) => c.revision === 2)!;
  expect(
    selectDeck(data, selection).find((r) => r.cardId === current.id)?.revision,
  ).toBe(2);
  const annulled = await editLot((l) => {
    const q = structuredClone(l.questions[1]);
    q.revision = 3;
    q.correctionSource = q.source;
    if (q.content.type === "question") {
      delete q.content.correctAlternativeId;
      q.content.editorial = {
        status: "annulled",
        answerKey: "none",
        commentary: "Arcanário",
        sourceUrl: q.source,
        correctionSource: q.source,
      };
    }
    l.questions.splice(2, 0, q);
  }, JSON.stringify(e));
  const a = envelope(annulled);
  a.manifest.editorialVersion = 3;
  await x.service.install(JSON.stringify(a));
  expect(await x.trials.preview({ selection })).toHaveLength(1);
  expect(learningReport(await x.repo.read(), now).summary).toEqual(before);
});
it("backup v10 omits unreferenced public content, restores history and receipts, reinstalls coherently", async () => {
  const x = await setup();
  await x.service.install(v2);
  const s = await x.trials.start({
    selection: {
      kind: "static",
      cards: [{ cardId: (await x.repo.read()).cards[0].id }],
    },
  });
  await x.trials.command({
    sessionId: s.id,
    expectedRevision: 1,
    command: { kind: "answer", alternativeId: "c" },
  });
  const codec = new JsonBackupCodec(),
    artifact = await codec.encode({
      appVersion: "test",
      createdAt: now,
      databaseVersion: 18,
      data: await x.backup.read(),
    });
  const valid = await codec.inspect(artifact.content);
  expect(valid.summary.formatVersion).toBe(10);
  expect(valid.data.arcanarium?.cards).toHaveLength(1);
  expect(valid.data.arcanarium?.packs?.[0].items).toHaveLength(4);
  const y = await setup();
  await y.backup.replace(valid.data);
  expect(await y.trials.preview({ selection })).toHaveLength(0);
  expect(learningReport(await y.repo.read(), now).summary.attempts).toBe(1);
  await y.service.install(v2);
  expect(await y.db.arcanariumCards.count()).toBe(4);
  expect(learningReport(await y.repo.read(), now).summary.attempts).toBe(1);
  await x.service.remove(id);
  const removed = await codec.inspect(
    (
      await codec.encode({
        appVersion: "test",
        createdAt: now,
        databaseVersion: 18,
        data: await x.backup.read(),
      })
    ).content,
  );
  await y.backup.replace(removed.data);
  expect((await y.service.list())[0].status).toBe("removed");
  expect(learningReport(await y.repo.read(), now).summary.attempts).toBe(1);
  const before = await y.repo.read();
  const invalid = structuredClone(valid.data);
  invalid.arcanarium!.versions = [];
  await expect(y.backup.replace(invalid)).rejects.toThrow();
  expect(await y.repo.read()).toEqual(before);
});
it("upgrade v17 is additive and preserves existing rows; identity distinguishes booklet/language/application", async () => {
  const name = `packs-upgrade-${crypto.randomUUID()}`,
    old = new Dexie(name);
  old.version(17).stores(DATABASE_SCHEMA_V17);
  await old.open();
  await old
    .table("settings")
    .put({ key: "sentinel", value: { preserve: true }, updatedAt: now });
  old.close();
  const db = new BibliotecaDatabase(name);
  dbs.push(db);
  await db.open();
  expect(await db.settings.get("sentinel")).toEqual({
    key: "sentinel",
    value: { preserve: true },
    updatedAt: now,
  });
  expect(db.verno).toBe(18);
  const q = (await new JsonEducationalPackCodec().inspect(v1)).lots[0].lot
    .questions[0];
  expect(educationalCardId(q.identity)).not.toBe(
    educationalCardId({ ...q.identity, booklet: "Outra ordem" }),
  );
  expect(educationalCardId(q.identity)).not.toBe(
    educationalCardId({ ...q.identity, application: "PPL" }),
  );
});

it("imports original v9, checks checksum before restore and rejects a future backup", async () => {
  const x = await setup();
  const codec = new JsonBackupCodec();
  const snapshot = await x.backup.read();
  const { isEmpty: _empty, ...data } = snapshot;
  void _empty;
  const unsigned = {
    kind: "biblioteca-viva-backup",
    formatVersion: 9,
    createdAt: now,
    appVersion: "original-c",
    databaseVersion: 17,
    data,
    metadata: { policy: "replace" },
  };
  const { canonicalize, checksumMaterial } =
    await import("../backup/backupCodec");
  const raw = JSON.stringify({
    ...unsigned,
    integrity: {
      algorithm: "SHA-256",
      digest: await sha256Bytes(canonicalize(checksumMaterial(unsigned))),
    },
  });
  expect((await codec.inspect(raw)).summary.formatVersion).toBe(9);
  await x.backup.replace((await codec.inspect(raw)).data);
  const tampered = raw.replace('"original-c"', '"tampered"');
  await expect(codec.inspect(tampered)).rejects.toMatchObject({
    code: "CHECKSUM_MISMATCH",
  });
  await expect(
    codec.inspect(raw.replace('"formatVersion":9', '"formatVersion":99')),
  ).rejects.toMatchObject({ code: "FUTURE_FORMAT_VERSION" });
});
it("synthetic official provenance integrates filters; preliminary, absent rights and missing primary references are rejected/excluded", async () => {
  const x = await setup();
  const official = envelope();
  official.manifest.category = "official";
  official.manifest.rights.status = "permitted";
  official.manifest.rights.basis =
    "Synthetic test declaration only; no real official text.";
  await x.service.install(JSON.stringify(official));
  expect(
    (await x.repo.read()).cards.every((c) => c.origin.kind === "official"),
  ).toBe(true);
  expect(
    await x.trials.preview({
      selection: {
        ...selection,
        criteria: {
          ...selection.criteria,
          origin: "official",
          year: 2026,
          packId: id,
        },
      },
    }),
  ).toHaveLength(2);
  const invalid = await editLot((l) => {
    if (l.questions[0].content.type === "question")
      l.questions[0].content.classification.primarySubjectId = l.tags[0].id;
  });
  await expect(x.codec.inspect(invalid)).rejects.toMatchObject({
    code: "INVALID",
  });
  const missing = envelope();
  missing.manifest.sources = [];
  await expect(x.codec.inspect(JSON.stringify(missing))).rejects.toMatchObject({
    code: "INVALID",
  });
  const y = await setup();
  const preliminary = await editLot((l) => {
    l.questions.forEach((q) => {
      if (q.content.type === "question" && q.content.editorial)
        q.content.editorial.answerKey = "preliminary";
    });
  });
  await y.service.install(preliminary);
  expect(await y.trials.preview({ selection })).toHaveLength(0);
});
it("backup restore rollback includes pack receipts after clearing; content corruption is diagnosed and refuses silent rewrite", async () => {
  const x = await setup();
  await x.service.install(v1);
  const before = await x.repo.read(),
    snapshot = await x.backup.read();
  const bulk = vi
    .spyOn(x.db.educationalPacks, "bulkAdd")
    .mockRejectedValueOnce(new Error("disk full"));
  await expect(x.backup.replace(snapshot)).rejects.toThrow();
  expect(await x.repo.read()).toEqual(before);
  bulk.mockRestore();
  const card = before.cards[0];
  if (card.content.type !== "question") throw new Error();
  await x.db.arcanariumVersions.put({
    cardId: card.id,
    revision: 1,
    card: {
      ...card,
      content: { ...card.content, statement: "Corrupted synthetic storage" },
    },
  });
  expect((await x.service.integrity(id)).corrupt).toBe(1);
  await expect(x.service.install(v1)).rejects.toThrow();
});
