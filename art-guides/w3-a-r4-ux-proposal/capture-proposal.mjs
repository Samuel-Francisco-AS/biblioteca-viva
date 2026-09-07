/* global console, document, getComputedStyle, HTMLElement, innerHeight, innerWidth, location, process, URL, URLSearchParams */

import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl =
  process.env.BIBLIOTECA_PROPOSAL_URL ??
  "http://127.0.0.1:4180/art-guides/w3-a-r4-ux-proposal/index.html";
const outputDirectory = path.resolve(
  "art-guides/w3-a-r4-ux-proposal/captures/proposal",
);
const metrics = [];
const consoleErrors = [];
const pageErrors = [];
const requestFailures = [];

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  colorScheme: "dark",
  reducedMotion: "no-preference",
  viewport: { width: 320, height: 640 },
});
const page = await context.newPage();

page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => pageErrors.push(error.message));
page.on("requestfailed", (request) => {
  requestFailures.push(`${request.method()} ${request.url()}`);
});

async function collectMetrics(name) {
  const snapshot = await page.evaluate(() => {
    const visible = (element) => {
      if (!(element instanceof HTMLElement)) return false;
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        box.width > 0 &&
        box.height > 0 &&
        box.bottom > 0 &&
        box.right > 0 &&
        box.top < innerHeight &&
        box.left < innerWidth
      );
    };
    const scrollOwners = [...document.querySelectorAll("*")]
      .filter((element) => {
        if (!(element instanceof HTMLElement) || !visible(element))
          return false;
        const style = getComputedStyle(element);
        return (
          element.scrollHeight > element.clientHeight + 2 &&
          ["auto", "scroll"].includes(style.overflowY)
        );
      })
      .map((element) => ({
        className: element.className,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        tag: element.tagName.toLowerCase(),
      }));
    const controls = [
      ...document.querySelectorAll("button, input, select, textarea"),
    ]
      .filter(visible)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          height: Math.round(rect.height),
          label:
            element.getAttribute("aria-label") ??
            element.textContent?.trim() ??
            element.getAttribute("placeholder"),
          width: Math.round(rect.width),
        };
      });
    const primaryActions = [
      ...document.querySelectorAll(
        ".button--primary, .fab-extended, .primary-tool, .button--danger",
      ),
    ]
      .filter(visible)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          bottomDistance: Math.round(innerHeight - rect.bottom),
          label: element.textContent?.trim(),
        };
      });
    const overlay = document.querySelector(
      ".bottom-sheet, .dialog, .construction-actions",
    );
    const overlayRect = overlay?.getBoundingClientRect();
    const ids = [...document.querySelectorAll("[id]")].map(({ id }) => id);
    return {
      controls,
      document: {
        clientWidth: document.documentElement.clientWidth,
        scrollHeight: document.documentElement.scrollHeight,
        scrollWidth: document.documentElement.scrollWidth,
      },
      duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
      headings: [...document.querySelectorAll("h1, h2, h3")].map(
        (heading) => `${heading.tagName}:${heading.textContent?.trim()}`,
      ),
      overlayCoverage:
        overlayRect === undefined
          ? undefined
          : Number(
              (
                (overlayRect.width * overlayRect.height) /
                (innerWidth * innerHeight)
              ).toFixed(3),
            ),
      primaryActions,
      route: new URL(location.href).searchParams.get("screen"),
      scrollOwners,
      viewport: { height: innerHeight, width: innerWidth },
    };
  });
  metrics.push({ name, ...snapshot });
}

async function capture(name, screen, viewport, variant) {
  await page.setViewportSize(viewport);
  const query = new URLSearchParams({ clean: "1", screen });
  if (variant) query.set("variant", variant);
  await page.goto(`${baseUrl}?${query.toString()}`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(240);
  await collectMetrics(name);
  await page.screenshot({ path: path.join(outputDirectory, `${name}.png`) });
}

const mobile320 = { width: 320, height: 640 };
const mobile360 = { width: 360, height: 800 };
const desktop = { width: 1280, height: 800 };

await capture("library-320x640", "library", mobile320);
await capture("library-360x800", "library", mobile360);
await capture("library-desktop-1280x800", "library", desktop);
await capture("library-loading-320x640", "library-loading", mobile320);
await capture("library-error-320x640", "library-error", mobile320);
await capture(
  "library-canvas-unavailable-320x640",
  "library-canvas",
  mobile320,
);
await capture("collection-empty-320x640", "collection-empty", mobile320);
await capture("collection-320x640", "collection", mobile320);
await capture("collection-360x800", "collection", mobile360);
await capture("collection-desktop-1280x800", "collection", desktop);
await capture("entry-type-picker-320x640", "editor", mobile320);
await capture("book-editor-320x640", "editor", mobile320, "book");
await capture("detail-360x800", "detail", mobile360);
await capture("session-active-360x800", "session", mobile360);
await capture("archive-320x640", "archive", mobile320);
await capture("statistics-360x800", "statistics", mobile360);
await capture("settings-320x640", "settings", mobile320);
await capture("backup-360x800", "backup", mobile360);
await capture(
  "construction-explore-320x640",
  "construction-explore",
  mobile320,
);
await capture(
  "construction-palette-320x640",
  "construction-palette",
  mobile320,
);
await capture(
  "construction-placing-360x800",
  "construction-placing",
  mobile360,
);
await capture(
  "construction-selection-360x800",
  "construction-select",
  mobile360,
);
await capture("construction-moving-360x800", "construction-moving", mobile360);
await capture("construction-floor-360x800", "construction-floor", mobile360);
await capture(
  "construction-confirm-360x800",
  "construction-confirm",
  mobile360,
);

const interactionChecks = [];
const check = (condition, description) => {
  if (!condition)
    throw new Error(`Falha de navegação no protótipo: ${description}`);
  interactionChecks.push(description);
};
await page.setViewportSize(mobile320);
await page.goto(`${baseUrl}?clean=1&screen=library`, {
  waitUntil: "networkidle",
});
await page.getByRole("button", { name: "Coleção" }).click();
check(
  await page.getByRole("heading", { name: "Coleção" }).isVisible(),
  "dock abre Coleção",
);
await page.getByRole("button", { name: /Novo registro/ }).click();
check(
  await page
    .getByRole("heading", { name: "O que você quer guardar?" })
    .isVisible(),
  "Coleção abre seletor dos seis tipos",
);
await page.getByRole("button", { name: /^Livro/ }).click();
check(
  await page.locator("#proposal-title").isVisible(),
  "tipo abre formulário",
);
await page.getByRole("button", { name: "Salvar registro" }).click();
check(
  await page.getByRole("heading", { name: "A Casa das Marés" }).isVisible(),
  "formulário retorna ao detalhe",
);
await page.getByRole("button", { name: "Biblioteca" }).click();
await page.getByRole("button", { name: "Construir" }).click();
await page.getByRole("button", { name: /Estruturas/ }).click();
check(
  await page.getByRole("heading", { name: "Estruturas" }).isVisible(),
  "Construção abre palette sob demanda",
);
await page.keyboard.press("Escape");
check(
  new URL(page.url()).searchParams.get("screen") === "construction-explore",
  "Escape volta palette para explore",
);
await page.getByRole("button", { name: /Colocadas/ }).click();
await page.getByRole("button", { name: /Parede longa/ }).click();
check(
  new URL(page.url()).searchParams.get("screen") === "construction-select",
  "lista sob demanda fecha e seleciona peça",
);
await page.keyboard.press("Escape");
await page.keyboard.press("Escape");
check(
  new URL(page.url()).searchParams.get("screen") === "library",
  "Escape fecha seleção antes de sair da Construção",
);
await page.getByRole("button", { name: "Ajustes" }).click();
await page.getByRole("button", { name: /Backup e restauração/ }).click();
check(
  await page.getByRole("heading", { name: "Backup e restauração" }).isVisible(),
  "Ajustes abre fluxo dedicado de backup",
);

const horizontalOverflows = metrics
  .filter(({ document }) => document.scrollWidth > document.clientWidth)
  .map(({ name }) => name);
const duplicateIdScreens = metrics
  .filter(({ duplicateIds }) => duplicateIds.length > 0)
  .map(({ duplicateIds, name }) => ({ duplicateIds, name }));

await writeFile(
  path.join(outputDirectory, "audit-metrics.json"),
  `${JSON.stringify(
    {
      baseUrl,
      consoleErrors,
      duplicateIdScreens,
      generatedAt: new Date().toISOString(),
      horizontalOverflows,
      interactionChecks,
      metrics,
      pageErrors,
      requestFailures,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

await browser.close();

if (
  consoleErrors.length > 0 ||
  pageErrors.length > 0 ||
  requestFailures.length > 0 ||
  horizontalOverflows.length > 0 ||
  duplicateIdScreens.length > 0
) {
  console.error(
    JSON.stringify(
      {
        consoleErrors,
        duplicateIdScreens,
        horizontalOverflows,
        pageErrors,
        requestFailures,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
} else {
  console.log(
    JSON.stringify(
      {
        captures: metrics.length,
        consoleErrors: 0,
        duplicateIdScreens: 0,
        horizontalOverflows: 0,
        pageErrors: 0,
        requestFailures: 0,
        interactionChecks: interactionChecks.length,
      },
      null,
      2,
    ),
  );
}
