import { mkdir } from "node:fs/promises";
import path from "node:path";

import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";

const captureDirectory = process.env.R4_CAPTURE_DIRECTORY
  ? path.resolve(process.env.R4_CAPTURE_DIRECTORY)
  : undefined;

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
}

async function capture(page: Page, name: string): Promise<void> {
  if (!captureDirectory) return;
  await page.screenshot({
    animations: "allow",
    path: path.join(captureDirectory, name),
  });
}

async function assertLibraryDiagnostics(page: Page): Promise<void> {
  if (process.env.R4_ASSERT_DIAGNOSTICS !== "true") return;

  const diagnostics = page.locator(".library-visual-diagnostics");
  await expect(diagnostics).toBeVisible();
  await expect
    .poll(() =>
      diagnostics.locator("dl").evaluate((list) => {
        const values: Record<string, string> = {};
        for (const term of list.querySelectorAll("dt")) {
          const value = term.nextElementSibling;
          if (value instanceof HTMLElement)
            values[term.textContent?.trim() ?? ""] =
              value.textContent?.trim() ?? "";
        }
        return values;
      }),
    )
    .toMatchObject({
      "Canvas no host": "1",
      Estado: "ready",
      "Instâncias ativas": "1",
    });
}

test("dock centraliza cinco áreas e preserva URLs históricas", async ({
  page,
}) => {
  const navigation = page.getByRole("navigation", {
    name: "Navegação principal",
  });
  const destinations = [
    ["Coleção", "/colecao"],
    ["Biblioteca", "/"],
    ["Arquivo", "/arquivo"],
    ["Resumo e estatísticas", "/estatisticas"],
    ["Ajustes", "/configuracoes"],
  ] as const;

  await expect(navigation.getByRole("link")).toHaveCount(5);
  for (const [name, pathname] of destinations) {
    const destination = navigation.getByRole("link", { name, exact: true });
    await destination.click();
    await expect(page).toHaveURL(
      new RegExp(`${pathname === "/" ? "/$" : pathname}`),
    );
    await expect(destination).toHaveAttribute("aria-current", "page");
    await expect(page.locator("main")).toBeFocused();
  }

  await page.goto("/colecao");
  await expect(
    page.getByRole("link", { name: "Criar primeiro registro" }),
  ).toHaveAttribute("href", "/novo-registro");
  await page.goto("/novo-registro");
  await expect(
    page.getByRole("heading", { level: 1, name: "Novo registro" }),
  ).toBeVisible();
  await expect(
    navigation.getByRole("link", { name: "Coleção" }),
  ).toHaveAttribute("aria-current", "page");

  await page.goto("/novo-livro");
  await expect(page).toHaveURL(/\/novo-registro$/u);
  await page.goto("/livros/registro-inexistente?from=%2Fcolecao");
  await expect(page).toHaveURL(
    /\/registros\/registro-inexistente\?from=%2Fcolecao$/u,
  );
});

test("shell respeita viewports estreitas, preferências e a área do dock", async ({
  page,
}) => {
  test.setTimeout(60_000);
  if (captureDirectory) await mkdir(captureDirectory, { recursive: true });

  for (const viewport of [
    { height: 800, width: 1280, captureName: "library-desktop-1280x800.png" },
    { height: 640, width: 320, captureName: "library-320x640.png" },
    { height: 800, width: 360, captureName: "library-360x800.png" },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator(".library-visual-host canvas")).toHaveCount(1);
    await expect(page.locator(".library-context-label")).toBeVisible();
    await expect.poll(() => horizontalOverflow(page)).toBeLessThanOrEqual(1);
    if (viewport.width <= 360) {
      const contextBox = await page
        .locator(".library-context-label")
        .boundingBox();
      const headerBox = await page.locator(".top-bar").boundingBox();
      const accessibleSummaryBox = await page
        .locator(".library-accessible-summary")
        .boundingBox();
      const roomExplorerBox = await page
        .getByRole("navigation", { name: "Explorar salas" })
        .boundingBox();
      if (
        !contextBox ||
        !headerBox ||
        !accessibleSummaryBox ||
        !roomExplorerBox
      )
        throw new Error("Controles contextuais sem geometria mensurável.");
      expect(contextBox.y).toBeGreaterThanOrEqual(
        headerBox.y + headerBox.height,
      );
      expect(contextBox.y + contextBox.height).toBeLessThanOrEqual(
        accessibleSummaryBox.y,
      );
      expect(contextBox.y + contextBox.height).toBeLessThanOrEqual(
        roomExplorerBox.y,
      );
    }
    await capture(page, viewport.captureName);
  }

  await page.setViewportSize({ height: 640, width: 320 });
  await page.goto("/colecao");
  const dock = page.getByRole("navigation", { name: "Navegação principal" });
  const dockBox = await dock.boundingBox();
  if (!dockBox) throw new Error("Dock global sem geometria visível.");
  for (const destination of await dock.getByRole("link").all()) {
    const box = await destination.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(48);
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(48);
  }
  const mainPaddingBottom = await page
    .locator("main")
    .evaluate((main) =>
      Number.parseFloat(getComputedStyle(main).paddingBottom),
    );
  expect(mainPaddingBottom).toBeGreaterThanOrEqual(dockBox.height);
  await expect.poll(() => horizontalOverflow(page)).toBeLessThanOrEqual(1);
  await capture(page, "collection-320x640.png");

  await page.goto("/configuracoes");
  await page.getByLabel("Usar alto contraste").check();
  await page.getByLabel("Tamanho do texto").selectOption("larger");
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-high-contrast",
    "true",
  );
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-text-size",
    "larger",
  );
  await expect.poll(() => horizontalOverflow(page)).toBeLessThanOrEqual(1);
});

test("Construção remove o dock sem recriar o canvas e o restaura ao sair", async ({
  page,
}) => {
  test.setTimeout(45_000);
  if (captureDirectory) await mkdir(captureDirectory, { recursive: true });
  await page.setViewportSize({ height: 640, width: 320 });
  await page.goto("/");
  const canvas = page.locator(".library-visual-host canvas");
  await expect(canvas).toHaveCount(1);
  await assertLibraryDiagnostics(page);
  await canvas.evaluate((element) => {
    element.dataset.r4CanvasIdentity = "preserved";
  });

  const dock = page.getByRole("navigation", { name: "Navegação principal" });
  const dockBox = await dock.boundingBox();
  const summaryBox = await page
    .getByRole("button", { name: "Abrir resumo da Biblioteca" })
    .boundingBox();
  const constructionBox = await page
    .getByRole("button", { name: "Construir" })
    .boundingBox();
  if (!dockBox || !summaryBox || !constructionBox)
    throw new Error("Controles da Biblioteca sem geometria mensurável.");
  expect(summaryBox.y + summaryBox.height).toBeLessThanOrEqual(dockBox.y);
  expect(constructionBox.y + constructionBox.height).toBeLessThanOrEqual(
    dockBox.y,
  );

  await page.getByRole("button", { name: "Construir" }).click();
  await expect(page.getByLabel("Modo Construção")).toBeVisible();
  await expect(dock).toHaveCount(0);
  await expect(page.locator(".library-context-label")).toHaveCount(0);
  await expect(page.locator(".library-visual-fallback")).toHaveCount(0);
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toHaveAttribute("data-r4-canvas-identity", "preserved");
  await capture(page, "construction-320x640.png");

  await page.getByRole("button", { name: "Sair" }).click();
  await expect(dock).toBeVisible();
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toHaveAttribute("data-r4-canvas-identity", "preserved");
});
