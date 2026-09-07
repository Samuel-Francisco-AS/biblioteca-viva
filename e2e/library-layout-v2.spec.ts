import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";

function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate<number>(
    "document.documentElement.scrollWidth - window.innerWidth",
  );
}

test("Biblioteca mobile preserva o canvas entre resumo, dock, Coleção e estante", async ({
  createBook,
  navigateFromDock,
  page,
}) => {
  test.setTimeout(45_000);
  await page.setViewportSize({ height: 800, width: 360 });
  await createBook({
    author: "Autora Layout",
    currentPage: 30,
    status: "in_progress",
    title: "Sala em Teste",
    totalPages: 100,
  });
  await navigateFromDock("Biblioteca");

  const canvas = page.locator(".library-visual-host canvas");
  await expect(canvas).toHaveCount(1);
  await page
    .getByRole("button", { name: "Abrir resumo da Biblioteca" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Sua biblioteca", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Fechar resumo da Biblioteca" })
    .click();

  const collectionDestination = page.getByRole("link", {
    name: "Coleção",
    exact: true,
  });
  await collectionDestination.focus();
  await expect(collectionDestination).toBeFocused();
  await page.keyboard.press("Enter");
  const bookSurface = page.getByRole("link", {
    name: "Abrir detalhes de Sala em Teste",
  });
  const surfaceBox = await bookSurface.boundingBox();
  if (!surfaceBox) throw new Error("O card inteiro do livro não recebeu área.");
  await bookSurface.click({
    position: { x: surfaceBox.width - 18, y: surfaceBox.height - 18 },
  });
  await expect(
    page.getByRole("heading", { name: "Sala em Teste" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Voltar à Coleção" }).click();
  await navigateFromDock("Biblioteca");
  await expect(canvas).toHaveCount(1);
  await canvas.click({ force: true, position: { x: 250, y: 300 } });
  if (
    !(await page
      .getByRole("heading", { name: "Resumo da estante" })
      .isVisible()
      .catch(() => false))
  ) {
    await page.getByText("Resumo acessível").click();
    await page.getByRole("button", { name: "Ver detalhes da estante" }).click();
  }
  await expect(
    page.getByRole("heading", { name: "Resumo da estante" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Fechar resumo da Biblioteca" })
    .click();
  if (
    !(await page
      .getByRole("button", { name: "Conversar com a bibliotecária" })
      .isVisible()
      .catch(() => false))
  ) {
    await page.getByText("Resumo acessível").click();
  }
  await page
    .getByRole("button", { name: "Conversar com a bibliotecária" })
    .click();
  const speechBubble = page.locator(".library-speech-bubble");
  await expect(speechBubble).toBeVisible();
  await expect(speechBubble.locator('p[lang="pt-BR"]')).not.toBeEmpty();
});

test("rotas principais não apresentam overflow estrutural em viewport estreita", async ({
  createBook,
  page,
}) => {
  await page.setViewportSize({ height: 640, width: 320 });
  await createBook({ title: "Livro de Overflow" });
  const detailUrl = page.url();
  const routes = [
    "/",
    "/colecao",
    "/novo-registro",
    "/arquivo",
    "/estatisticas",
    "/configuracoes",
    detailUrl,
  ];

  for (const route of routes) {
    await page.goto(route);
    await expect.poll(() => horizontalOverflow(page)).toBeLessThanOrEqual(1);
  }
});

test("matriz essencial mantém a sala dentro da viewport", async ({ page }) => {
  for (const viewport of [
    { height: 915, width: 320 },
    { height: 640, width: 360 },
    { height: 915, width: 412 },
    { height: 800, width: 1280 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator(".library-visual-host canvas")).toHaveCount(1);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
  }
});
