import { expect, test } from "@playwright/test";

test("R9: failed route chunk exposes recovery and reload works offline after caching", async ({
  page,
  context,
}) => {
  let intercepted = false;
  await page.route("**/assets/CollectionPage-*.js", async (route) => {
    if (!intercepted) {
      intercepted = true;
      await route.abort("failed");
    } else await route.continue();
  });
  await page.goto("/colecao");
  await expect(
    page.getByRole("heading", { name: "A tela encontrou um problema" }),
  ).toBeVisible();
  await expect(page.locator("#bv-startup-veil")).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "Navegação principal" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Recarregar aplicativo" }).click();
  await expect(
    page.getByRole("heading", { name: "Seu primeiro registro começa aqui" }),
  ).toBeVisible();
  for (const name of [
    "Arquivo",
    "Resumo e estatísticas",
    "Ajustes",
    "Coleção",
  ]) {
    await page.getByRole("link", { name, exact: true }).click();
    await expect(page.locator(".passage-preparing")).toHaveCount(0);
    await expect(page.getByRole("main")).toBeVisible();
  }
  // Loaded local chunks remain navigable without network in the same session.
  await context.setOffline(true);
  for (const name of [
    "Arquivo",
    "Resumo e estatísticas",
    "Ajustes",
    "Coleção",
  ]) {
    await page.getByRole("link", { name, exact: true }).click();
    await expect(page.locator(".passage-preparing")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "A tela encontrou um problema" }),
    ).toHaveCount(0);
  }
});
