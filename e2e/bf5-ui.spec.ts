import { expect, test } from "./fixtures";

test("BF-5: five realms, density and narrative Back in the semantic fallback", async ({
  page,
  seedBooks,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await seedBooks(2);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "O ambiente 3D não pôde ser iniciado" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /A Noite da Fenda Lilás/ }).click();
  await expect(
    page.getByRole("article", { name: "Conversa RPG" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".library-access-panels")
        .evaluate((element) => getComputedStyle(element).backdropFilter),
    )
    .toBe("none");
  const panelBounds = await page
    .getByRole("article", { name: "Conversa RPG" })
    .boundingBox();
  expect(panelBounds?.y).toBeGreaterThanOrEqual(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("article", { name: "Conversa RPG" })).toHaveCount(
    0,
  );
  const dock = page.getByRole("navigation", { name: "Navegação principal" });
  await dock.getByRole("link", { name: "Coleção", exact: true }).click();
  await expect(page.getByText("Acervo encantado")).toBeVisible();
  await page.getByRole("button", { name: "Lista compacta" }).click();
  await expect(page.locator(".book-grid")).toHaveClass(/book-grid--compact/);
  await dock.getByRole("link", { name: "Arquivo", exact: true }).click();
  await expect(page.getByText("Câmara dos registros")).toBeVisible();
  await dock.getByRole("link", { name: "Resumo e estatísticas" }).click();
  await expect(page.getByText("Observatório", { exact: true })).toBeVisible();
  await dock.getByRole("link", { name: "Ajustes", exact: true }).click();
  await expect(page.getByText("Ateliê arcano")).toBeVisible();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(dock).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
