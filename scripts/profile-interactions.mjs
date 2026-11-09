import process from "node:process";
import { URL } from "node:url";
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
const baseURL = process.argv[3] ?? "http://127.0.0.1:4175";
if (new URL(baseURL).hostname !== "127.0.0.1")
  throw new Error("Use an isolated local preview");
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  await page.addInitScript(() => {
    globalThis.__perf = {
      clickAt: 0,
      clickReads: 0,
      clickTransactions: 0,
      transactions: 0,
      reads: 0,
      writes: 0,
      frames: [],
      longTasks: [],
    };
    globalThis.document.addEventListener(
      "click",
      () => {
        globalThis.__perf.clickAt = globalThis.performance.now();
        globalThis.__perf.clickReads = globalThis.__perf.reads;
        globalThis.__perf.clickTransactions = globalThis.__perf.transactions;
      },
      true,
    );
    const t = globalThis.IDBDatabase.prototype.transaction;
    globalThis.IDBDatabase.prototype.transaction = function (...a) {
      globalThis.__perf.transactions++;
      return t.apply(this, a);
    };
    for (const method of ["get", "getAll", "openCursor", "count"]) {
      const f = globalThis.IDBObjectStore.prototype[method];
      globalThis.IDBObjectStore.prototype[method] = function (...a) {
        globalThis.__perf.reads++;
        return f.apply(this, a);
      };
    }
    const s = globalThis.Storage.prototype.setItem;
    globalThis.Storage.prototype.setItem = function (...a) {
      globalThis.__perf.writes++;
      return s.apply(this, a);
    };
    let last;
    function frame(t) {
      if (last) globalThis.__perf.frames.push(t - last);
      last = t;
      globalThis.requestAnimationFrame(frame);
    }
    globalThis.requestAnimationFrame(frame);
    new globalThis.PerformanceObserver((list) =>
      globalThis.__perf.longTasks.push(
        ...list
          .getEntries()
          .map((e) => ({ start: e.startTime, duration: e.duration })),
      ),
    ).observe({ type: "longtask", buffered: true });
  });
  await page.goto(`${baseURL}/arcanario/acervo`);
  await page
    .getByRole("heading", { name: "Acervo global", exact: true })
    .waitFor();
  const samples = [];
  for (const [path, title] of [
    ["/arcanario/baralhos", "Baralhos & coleções"],
    ["/arcanario/ecos", "Ecos do conhecimento"],
    ["/arcanario/acervo", "Acervo global"],
    ["/arcanario/baralhos", "Baralhos & coleções"],
    ["/arcanario/ecos", "Ecos do conhecimento"],
    ["/arcanario/acervo", "Acervo global"],
  ]) {
    const before = await page.evaluate(() => ({
      ...globalThis.__perf,
      now: globalThis.performance.now(),
    }));
    await page.locator(`.arcana-nav a[href="${path}"]`).click();
    await page.getByRole("heading", { name: title, exact: true }).waitFor();
    await page.evaluate(
      () =>
        new Promise((r) =>
          globalThis.requestAnimationFrame(() =>
            globalThis.requestAnimationFrame(r),
          ),
        ),
    );
    const after = await page.evaluate(() => ({
      ...globalThis.__perf,
      now: globalThis.performance.now(),
    }));
    samples.push({
      path,
      automationElapsedMs: after.now - before.now,
      clickToObservedContentMs: after.now - after.clickAt,
      transactions: after.transactions - before.transactions,
      reads: after.reads - before.reads,
    });
  }
  await page.locator('.arcana-nav a[href="/arcanario/oficina/nova"]').click();
  const field = page.getByLabel("Frente da carta — pergunta ou pista");
  await field.waitFor();
  const beforeWrites = await page.evaluate(() => globalThis.__perf.writes);
  await field.pressSequentially("Carta fictícia para medir digitação", {
    delay: 5,
  });
  await page.waitForTimeout(400);
  const writes = await page.evaluate(() => globalThis.__perf.writes);
  const all = await page.evaluate(() => globalThis.__perf);
  await writeFile(
    process.argv[2] ?? "/tmp/bv-profile.json",
    JSON.stringify(
      {
        scope:
          "Chromium headless, fresh synthetic empty DB, mobile viewport, no CPU throttling; automation/observer overhead included; content observed after heading and two RAF callbacks, not presentation or exact readiness; not Android",
        samples,
        draftWrites: writes - beforeWrites,
        longTasks: all.longTasks,
        rafPercentiles: [0.5, 0.95, 0.99].map(
          (p) =>
            all.frames.sort((a, b) => a - b)[
              Math.ceil(all.frames.length * p) - 1
            ],
        ),
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
