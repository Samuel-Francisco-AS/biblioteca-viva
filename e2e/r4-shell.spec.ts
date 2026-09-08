import { expect, test } from "@playwright/test";

test("shell abre a Biblioteca sem superfície gráfica", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("banner")).toContainText("Biblioteca");
  await expect(
    page.getByRole("heading", {
      name: "Uma nova experiência está sendo preparada",
    }),
  ).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "Navegação principal" }),
  ).toBeVisible();
});

test("dock navega pelas áreas convencionais", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Coleção", exact: true }).click();
  await expect(page).toHaveURL(/\/colecao$/u);
  await page.getByRole("link", { name: "Resumo e estatísticas" }).click();
  await expect(page).toHaveURL(/\/estatisticas$/u);
  await page.getByRole("link", { name: "Arquivo" }).click();
  await expect(page).toHaveURL(/\/arquivo$/u);
  await page.getByRole("link", { name: "Ajustes" }).click();
  await expect(page).toHaveURL(/\/configuracoes$/u);
});
