// @vitest-environment node
import "fake-indexeddb/auto";
import { readFileSync, writeFileSync } from "node:fs";
import Dexie from "dexie";
import { it, expect, afterEach } from "vitest";
import {
  createApplication,
  type ApplicationRuntime,
} from "../../app/createApplication";
import { sha256Bytes } from "../packs/packCodec";
import { selectDeck } from "../../domain/provations";
import type { PackLot } from "../../domain/educationalPacks";
import type { PackManifest } from "../../domain/packManifest";
const opened: { app: ApplicationRuntime; name: string }[] = [];
afterEach(async () => {
  const all = opened.splice(0);
  all.forEach(({ app }) => app.close());
  await Promise.all(
    [...new Set(all.map((a) => a.name))].map((n) => Dexie.delete(n)),
  );
});
async function fixture(count: number) {
  const e = JSON.parse(
    readFileSync(
      "src/infrastructure/packs/content/matematica-original-v1.json",
      "utf8",
    ),
  ) as {
    kind: string;
    formatVersion: number;
    manifest: PackManifest;
    files: Record<string, string>;
  };
  const template = JSON.parse(e.files["lote-1.json"]) as PackLot,
    question = template.questions[0];
  e.files = {};
  e.manifest.lots = [];
  e.manifest.publishedCount = count;
  e.manifest.expectedCount = count;
  e.manifest.completeness = "complete";
  for (let start = 0; start < count; start += 1000) {
    const id = `volume-${start / 1000}`,
      questions = Array.from(
        { length: Math.min(1000, count - start) },
        (_, i) => ({
          ...structuredClone(question),
          identity: { ...question.identity, number: start + i + 1 },
        }),
      ),
      raw = JSON.stringify({ ...template, lotId: id, questions });
    e.files[`${id}.json`] = raw;
    e.manifest.lots.push({
      id,
      path: `${id}.json`,
      sha256: await sha256Bytes(raw),
      bytes: Buffer.byteLength(raw),
      count: questions.length,
    });
  }
  return JSON.stringify(e);
}
it.each([200, 1000, 3000])(
  "synthetic volume %i: install, reopen, filter, select and private backup without public statements",
  async (count) => {
    const name = `pack-volume-${crypto.randomUUID()}`,
      app = await createApplication({ databaseName: name });
    opened.push({ app, name });
    const content = await fixture(count),
      heapBefore = process.memoryUsage().heapUsed;
    const t0 = performance.now();
    await app.educationalPacks.install(content);
    const installMs = performance.now() - t0;
    const t1 = performance.now();
    const data = await app.arcanarium.list();
    const readMs = performance.now() - t1;
    expect(data.cards).toHaveLength(count);
    const t2 = performance.now();
    const refs = selectDeck(data, {
      kind: "dynamic",
      criteria: {
        version: 2,
        types: ["question"],
        knowledgeTagIds: ["pack:arcanario-matematica-original:matematica"],
        personalTagIds: [],
        history: "never",
        limit: 500,
        year: 2026,
        packId: "arcanario-matematica-original",
        origin: "imported",
      },
    });
    const filterMs = performance.now() - t2;
    expect(refs).toHaveLength(Math.min(500, count));
    const t3 = performance.now();
    const backup = await app.backup.export();
    const backupMs = performance.now() - t3;
    const payload = JSON.parse(backup.content) as {
      data: { arcanarium: { cards: unknown[]; versions: unknown[] } };
    };
    expect(payload.data.arcanarium.cards).toHaveLength(0);
    expect(payload.data.arcanarium.versions).toHaveLength(0);
    expect(Buffer.byteLength(backup.content)).toBeLessThan(10 * 1024 * 1024);
    app.close();
    const t4 = performance.now();
    const reopened = await createApplication({ databaseName: name });
    opened.push({ app: reopened, name });
    expect((await reopened.arcanarium.overview()).cards).toBe(count);
    const reopenMs = performance.now() - t4;
    writeFileSync(
      `/tmp/bf56d-volume-${count}.json`,
      JSON.stringify({
        fixture: "BF56D synthetic, host/fake-indexeddb, not Android",
        count,
        installMs: Math.round(installMs),
        readMs: Math.round(readMs),
        filterMs: Math.round(filterMs),
        backupMs: Math.round(backupMs),
        reopenMs: Math.round(reopenMs),
        packBytes: Buffer.byteLength(content),
        logicalGraphBytes: Buffer.byteLength(JSON.stringify(data)),
        backupBytes: Buffer.byteLength(backup.content),
        heapDeltaBytes: process.memoryUsage().heapUsed - heapBefore,
      }),
    );
  },
  30000,
);
