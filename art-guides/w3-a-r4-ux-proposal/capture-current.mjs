/* global console, document, getComputedStyle, HTMLElement, indexedDB, innerHeight, innerWidth, localStorage, location, process, sessionStorage, URL, window */

import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.BIBLIOTECA_CURRENT_URL ?? "http://127.0.0.1:4176";
const outputDirectory = path.resolve(
  "art-guides/w3-a-r4-ux-proposal/captures/current",
);
const metrics = [];
const formInventory = [];
const consoleErrors = [];
const requestFailures = [];

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--disable-webgl"],
});
const context = await browser.newContext({
  viewport: { width: 320, height: 640 },
});
const page = await context.newPage();

page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("requestfailed", (request) => {
  requestFailures.push(`${request.method()} ${request.url()}`);
});

async function clearDisposableOrigin() {
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    const databases = await indexedDB.databases();
    await Promise.all(
      databases
        .map(({ name }) => name)
        .filter((name) => name !== undefined)
        .map(
          (name) =>
            new Promise((resolve) => {
              const request = indexedDB.deleteDatabase(name);
              request.onsuccess = () => resolve(undefined);
              request.onerror = () => resolve(undefined);
              request.onblocked = () => resolve(undefined);
            }),
        ),
    );
  });
  await page.reload({ waitUntil: "networkidle" });
}

async function waitForApplication() {
  await page.locator("main").waitFor({ state: "visible" });
  await page.waitForTimeout(220);
}

async function collectMetrics(name) {
  const snapshot = await page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const rect = (element) => {
      if (!(element instanceof HTMLElement)) return undefined;
      const value = element.getBoundingClientRect();
      return {
        bottom: Math.round(value.bottom),
        height: Math.round(value.height),
        left: Math.round(value.left),
        right: Math.round(value.right),
        top: Math.round(value.top),
        width: Math.round(value.width),
      };
    };
    const visible = (element) => {
      if (!(element instanceof HTMLElement)) return false;
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        box.width > 0 &&
        box.height > 0
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
    const primaryActions = [
      ...document.querySelectorAll(
        ".button--primary, .button--danger, .library-summary-trigger",
      ),
    ]
      .filter(visible)
      .map((element) => {
        const box = element.getBoundingClientRect();
        return {
          bottomDistance: Math.round(viewportHeight - box.bottom),
          label:
            element.getAttribute("aria-label") ?? element.textContent?.trim(),
          rect: rect(element),
        };
      });
    const construction = document.querySelector(".construction-controls");
    const constructionRect = rect(construction);
    return {
      cards: document.querySelectorAll(
        ".content-card, .book-card, .statistics-grid > p",
      ).length,
      constructionCoverage:
        constructionRect === undefined
          ? undefined
          : Number(
              (
                (constructionRect.width * constructionRect.height) /
                (viewportWidth * viewportHeight)
              ).toFixed(3),
            ),
      constructionRect,
      document: {
        clientWidth: document.documentElement.clientWidth,
        scrollHeight: document.documentElement.scrollHeight,
        scrollWidth: document.documentElement.scrollWidth,
      },
      fields: document.querySelectorAll("input, select, textarea").length,
      focusables: [
        ...document.querySelectorAll("a, button, input, select, textarea"),
      ].filter(visible).length,
      primaryActions,
      route: location.pathname,
      scrollOwners,
      viewport: { height: viewportHeight, width: viewportWidth },
    };
  });
  metrics.push({ name, ...snapshot });
}

async function capture(name, options = {}) {
  if (options.viewport) await page.setViewportSize(options.viewport);
  if (options.route) {
    await page.goto(`${baseUrl}${options.route}`, { waitUntil: "networkidle" });
    await waitForApplication();
  }
  await page.waitForTimeout(260);
  await collectMetrics(name);
  await page.screenshot({ path: path.join(outputDirectory, `${name}.png`) });
}

async function inventoryForm(typeName) {
  await page.goto(`${baseUrl}/novo-registro`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: new RegExp(`^${typeName}`) }).click();
  await page.waitForTimeout(80);
  formInventory.push(
    await page.evaluate(
      (type) => ({
        documentHeight: document.documentElement.scrollHeight,
        fields: [...document.querySelectorAll("label")].map((label) =>
          label.textContent?.trim(),
        ),
        type,
        viewport: { height: innerHeight, width: innerWidth },
      }),
      typeName,
    ),
  );
}

async function createSimpleEntry(typeName, title) {
  await page.goto(`${baseUrl}/novo-registro`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: new RegExp(`^${typeName}`) }).click();
  await page.locator("#entry-title").fill(title);
  await page.getByRole("button", { name: "Salvar registro" }).click();
  await page.getByRole("heading", { name: title }).waitFor();
}

await clearDisposableOrigin();
await capture("library-empty-320x640", {
  route: "/",
  viewport: { width: 320, height: 640 },
});
await page.getByRole("button", { name: "Abrir menu principal" }).click();
await capture("navigation-drawer-320x640");
await page
  .getByRole("button", { name: "Fechar menu principal" })
  .last()
  .click();
await page.getByRole("button", { name: "Construir" }).click();
await capture("construction-default-320x640");
await page.getByRole("button", { name: "Estruturas" }).click();
await capture("construction-palette-320x640");
await page.getByRole("button", { name: "Fechar", exact: true }).click();
await page.getByRole("button", { name: "Piso" }).click();
await capture("construction-floor-360x800", {
  viewport: { width: 360, height: 800 },
});
await capture("collection-empty-320x640", {
  route: "/colecao",
  viewport: { width: 320, height: 640 },
});
await capture("entry-type-picker-320x640", {
  route: "/novo-registro",
});

for (const typeName of [
  "Livro",
  "Filme",
  "Série",
  "Estudo",
  "Atividade física",
  "Trabalho",
]) {
  await inventoryForm(typeName);
}

await page.goto(`${baseUrl}/novo-registro`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /^Livro/ }).click();
await page.getByLabel("Título (obrigatório)").fill("A Casa das Marés");
await page.getByLabel("Autor (opcional)").fill("Lia Fontes");
await page.getByLabel("Total de páginas (opcional)").fill("240");
await page.getByLabel("Página atual (obrigatório)").fill("86");
await page.getByLabel("Status (obrigatório)").selectOption("in_progress");
await capture("book-editor-320x640");
await page.getByRole("button", { name: "Salvar livro" }).click();
await page.getByRole("heading", { name: "A Casa das Marés" }).waitFor();
const bookPath = new URL(page.url()).pathname;

await page.locator("summary", { hasText: "Adicionar nota" }).click();
await page
  .getByLabel("Nota (obrigatório)")
  .fill("A cartografia muda quando a narradora aceita não controlar a maré.");
await page.getByRole("button", { name: "Adicionar nota" }).click();
await page.locator("summary", { hasText: "Adicionar citação" }).click();
await page
  .getByLabel("Citação (obrigatório)")
  .fill("Toda casa guarda uma maré que ninguém vê.");
await page.getByLabel("Página (opcional)").fill("72");
await page.getByRole("button", { name: "Adicionar citação" }).click();

const manualSession = page.locator("form").filter({
  has: page.getByRole("heading", { name: "Registrar sessão concluída" }),
});
await manualSession.locator('input[name="duration"]').fill("35");
await manualSession.getByRole("button", { name: "Registrar sessão" }).click();
await page.waitForTimeout(200);

await createSimpleEntry("Filme", "Jardim de Vidro");
await createSimpleEntry("Série", "Órbita Norte");
await createSimpleEntry("Estudo", "Botânica Urbana");
await createSimpleEntry("Atividade física", "Caminhada da Lagoa");
await createSimpleEntry("Trabalho", "Atlas de Pesquisa");

await capture("collection-320x640", {
  route: "/colecao",
  viewport: { width: 320, height: 640 },
});
await capture("collection-360x800", {
  route: "/colecao",
  viewport: { width: 360, height: 800 },
});
await capture("collection-desktop-1280x800", {
  route: "/colecao",
  viewport: { width: 1280, height: 800 },
});

await capture("detail-360x800", {
  route: bookPath,
  viewport: { width: 360, height: 800 },
});
const sessionPanel = page.getByRole("heading", { name: "Sessões" });
await sessionPanel.scrollIntoViewIfNeeded();
const timerForm = page.locator("form").filter({
  has: page.getByRole("heading", { name: "Iniciar cronômetro" }),
});
await timerForm.getByRole("button", { name: "Iniciar sessão" }).click();
await page.getByRole("button", { name: "Concluir sessão" }).waitFor();
await page
  .getByRole("button", { name: "Concluir sessão" })
  .scrollIntoViewIfNeeded();
await capture("session-active-360x800");
await page.getByRole("button", { name: "Concluir sessão" }).click();

await capture("archive-320x640", {
  route: "/arquivo",
  viewport: { width: 320, height: 640 },
});
await capture("statistics-360x800", {
  route: "/estatisticas",
  viewport: { width: 360, height: 800 },
});
await capture("settings-320x640", {
  route: "/configuracoes",
  viewport: { width: 320, height: 640 },
});
await page
  .getByRole("heading", { name: "Importar backup" })
  .scrollIntoViewIfNeeded();
await capture("backup-360x800", {
  viewport: { width: 360, height: 800 },
});
await capture("library-320x640", {
  route: "/",
  viewport: { width: 320, height: 640 },
});
await capture("library-360x800", {
  route: "/",
  viewport: { width: 360, height: 800 },
});
await capture("library-desktop-1280x800", {
  route: "/",
  viewport: { width: 1280, height: 800 },
});
await page.setViewportSize({ width: 360, height: 800 });
await page.getByRole("button", { name: "Construir" }).click();
const placedPieces = page.getByRole("region", {
  name: "Alternativa de construção",
});
await placedPieces.getByRole("button").first().click();
await capture("construction-selection-360x800");

await page.goto(`${baseUrl}/configuracoes`, { waitUntil: "networkidle" });
await page.getByLabel("Usar alto contraste").check();
await page.getByLabel("Tamanho do texto").selectOption("larger");
await page.waitForTimeout(180);
await capture("collection-high-contrast-text-larger-320x640", {
  route: "/colecao",
  viewport: { width: 320, height: 640 },
});
await capture("library-high-contrast-text-larger-320x640", {
  route: "/",
  viewport: { width: 320, height: 640 },
});
await page.getByRole("button", { name: "Construir" }).click();
await capture("construction-high-contrast-text-larger-320x640");

const keyboardPage = await context.newPage();
await keyboardPage.setViewportSize({ width: 320, height: 640 });
await keyboardPage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
const keyboardSequence = [];
for (let step = 0; step < 10; step += 1) {
  await keyboardPage.keyboard.press("Tab");
  keyboardSequence.push(
    await keyboardPage.evaluate(() => {
      const active = document.activeElement;
      if (!(active instanceof HTMLElement)) return "unknown";
      return (
        active.getAttribute("aria-label") ??
        active.textContent?.trim() ??
        active.tagName
      );
    }),
  );
}
await keyboardPage.close();

await writeFile(
  path.join(outputDirectory, "audit-metrics.json"),
  `${JSON.stringify(
    {
      baseUrl,
      consoleErrors,
      formInventory,
      generatedAt: new Date().toISOString(),
      keyboardSequence,
      metrics,
      requestFailures,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

await browser.close();
console.log(
  JSON.stringify(
    {
      captures: metrics.length,
      consoleErrors: consoleErrors.length,
      requestFailures: requestFailures.length,
    },
    null,
    2,
  ),
);
