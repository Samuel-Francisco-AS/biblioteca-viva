import { expect, test } from "./fixtures";

test("tag, favorito, sessão persistente e estatísticas formam memória unificada", async ({
  navigateFromMenu,
  page,
}) => {
  await page.goto("/novo-registro");
  await page.getByRole("button", { name: /Estudo/u }).click();
  await page.getByLabel("Título").fill("Estudo de Estatística Fictício");
  await page.getByRole("button", { name: "Salvar registro" }).click();

  await page.getByRole("button", { name: "Adicionar aos favoritos" }).click();
  await page.getByLabel("Nova etiqueta").fill("Pesquisa Fictícia");
  await page.getByRole("button", { name: "Criar e associar" }).click();
  await expect(page.getByLabel("Pesquisa Fictícia")).toBeChecked();

  await page.getByRole("button", { name: "Iniciar sessão" }).click();
  await expect(page.getByText(/Sessão em andamento/u).first()).toBeVisible();
  await navigateFromMenu("Coleção");
  await expect(page.getByRole("link", { name: "Abrir sessão" })).toBeVisible();
  await page.getByRole("link", { name: "Abrir sessão" }).click();
  await page.getByRole("button", { name: "Pausar" }).click();
  await page.reload();
  await expect(page.getByText(/Sessão pausada/u).first()).toBeVisible();
  await page.getByRole("button", { name: "Retomar" }).click();
  await page.getByRole("button", { name: "Concluir sessão" }).click();
  await expect(page.getByText("Nenhuma sessão concluída.")).toHaveCount(0);

  await navigateFromMenu("Estatísticas");
  await expect(
    page.getByRole("heading", { level: 2, name: "Estatísticas" }),
  ).toBeVisible();
  await expect(
    page.getByText("Sessões concluídas").locator("..").getByText("1"),
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Estudo de Estatística Fictício",
      exact: true,
    }),
  ).toBeVisible();

  await navigateFromMenu("Coleção");
  await page
    .getByLabel("Etiqueta")
    .selectOption({ label: "Pesquisa Fictícia" });
  const favoritesOnly = page.getByLabel("Somente favoritos");
  if (!(await favoritesOnly.isChecked())) {
    await favoritesOnly.check();
  }
  await expect(
    page.getByRole("heading", { name: "Estudo de Estatística Fictício" }),
  ).toBeVisible();
});
