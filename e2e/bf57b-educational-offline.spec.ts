import { expect, test } from "@playwright/test";

test("B2.5: educational edits and classifications survive warm offline navigation and reopen", async ({
  page,
  context,
}) => {
  // Isolated context. This checks local data while offline after assets were
  // loaded; cold offline web startup needs hosting/cache, unlike packaged Android.
  await page.goto("/arcanario/oficina/nova");
  await page
    .getByLabel("Nome da carta no acervo (opcional)")
    .fill("Primeira carta educativa fictícia");
  await page
    .getByLabel("Frente da carta — pergunta ou pista")
    .fill("Pista educativa fictícia");
  await page
    .getByLabel("Verso da carta — resposta ou descoberta")
    .fill("Resposta educativa fictícia");
  await page
    .getByRole("button", { name: "Guardar carta no acervo", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Editar na Oficina", exact: true }),
  ).toBeVisible();
  await page.locator('.arcana-nav a[href="/arcanario/assuntos"]').click();
  await page
    .getByLabel("Nome da classificação", { exact: true })
    .fill("Etiqueta educativa fictícia");
  const levels = page.getByRole("group", { name: "Nível", exact: true });
  await levels
    .getByRole("radio", { name: "Etiqueta pessoal", exact: true })
    .check();
  await context.setOffline(true);
  await page
    .getByRole("button", { name: "Salvar classificação", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Editar Etiqueta educativa fictícia",
      exact: true,
    }),
  ).toBeVisible();
  await page.locator('.arcana-nav a[href="/arcanario/oficina/nova"]').click();
  await page
    .getByLabel("Nome da carta no acervo (opcional)")
    .fill("Segunda carta offline fictícia");
  await page
    .getByLabel("Frente da carta — pergunta ou pista")
    .fill("Segunda pista offline");
  await page
    .getByLabel("Verso da carta — resposta ou descoberta")
    .fill("Segunda resposta offline");
  await page
    .getByRole("button", { name: "Guardar carta no acervo", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Editar na Oficina", exact: true }),
  ).toBeVisible();
  await context.setOffline(false);
  await page.reload();
  await page
    .getByRole("link", { name: "Editar na Oficina", exact: true })
    .click();
  await expect(
    page.getByLabel("Frente da carta — pergunta ou pista"),
  ).toHaveValue("Segunda pista offline");
  await page.locator('.arcana-nav a[href="/arcanario/assuntos"]').click();
  await expect(
    page.getByRole("button", {
      name: "Editar Etiqueta educativa fictícia",
      exact: true,
    }),
  ).toBeVisible();
  await page.locator('.arcana-nav a[href="/arcanario/acervo"]').click();
  await expect(
    page
      .getByText("Primeira carta educativa fictícia", { exact: true })
      .first(),
  ).toBeVisible();
});
