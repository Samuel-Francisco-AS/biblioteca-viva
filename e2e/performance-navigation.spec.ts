import { test, expect } from "@playwright/test";

test("performance candidate: rooms, drafts, dock and resident world survive repeated navigation", async ({
  page,
}) => {
  // Playwright creates an isolated browser context; no personal origin is reset.
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.name));
  await page.setViewportSize({ width: 412, height: 915 });
  await page.goto("/arcanario/oficina/nova");
  const front = page.getByLabel("Frente da carta — pergunta ou pista");
  await front.fill("Pergunta fictícia do roteiro de desempenho");
  await page
    .getByLabel("Verso da carta — resposta ou descoberta")
    .fill("Resposta fictícia preservada");
  await page
    .getByRole("button", { name: "Guardar carta no acervo", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Editar na Oficina", exact: true }),
  ).toBeVisible();
  const rooms = [
    ["acervo", "Acervo global"],
    ["baralhos", "Baralhos & coleções"],
    ["ecos", "Ecos do conhecimento"],
    ["provacoes", "Provações"],
    ["pacotes", "Biblioteca de Provas"],
    ["assuntos", "Classificações de conhecimento"],
    ["diagnostico", "Diagnóstico e relatórios"],
    ["relicario", "O Relicário"],
    ["duelos", "O Duelo Arcano"],
  ];
  for (const [path, title] of rooms) {
    await page.locator(`.arcana-nav a[href="/arcanario/${path}"]`).click();
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
  }
  await page
    .getByRole("link", { name: "Aprender a duelar · regulamento v1" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Como traçar seu círculo" }),
  ).toBeVisible();
  await page.locator('.arcana-nav a[href="/arcanario/acervo"]').click();
  await expect(
    page.getByRole("heading", { name: "Acervo global", exact: true }),
  ).toBeVisible();
  await page.locator('.arcana-nav a[href="/arcanario/oficina/nova"]').click();
  await front.fill("Rascunho fictício protegido ao sair");
  await page.locator('.arcana-nav a[href="/arcanario/ecos"]').click();
  await page.locator('.arcana-nav a[href="/arcanario/oficina/nova"]').click();
  await expect(front).toHaveValue("Rascunho fictício protegido ao sair");
  for (const [path, title] of [
    ["/colecao", "Seu primeiro registro começa aqui"],
    ["/arquivo", "Arquivo de anotações"],
    ["/estatisticas", "Resumo"],
    ["/configuracoes", "Experiência"],
    ["/colecao", "Seu primeiro registro começa aqui"],
  ]) {
    await page.locator(`.primary-dock a[href="${path}"]`).click();
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("performance candidate: world keeps one renderer and loop across dock return", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.name));
  await page.setViewportSize({ width: 412, height: 915 });
  await page.goto("/colecao");
  await page.locator('.primary-dock a[href="/"]').click();
  const canvas = page.locator("canvas[data-three-world-canvas]");
  await expect(canvas).toHaveAttribute("data-runtime-state", "running", {
    timeout: 20000,
  });
  const resident = await canvas.elementHandle();
  await page.locator('.primary-dock a[href="/colecao"]').click();
  await expect(canvas).toHaveAttribute("data-runtime-state", "paused");
  await page.locator('.primary-dock a[href="/"]').click();
  await expect(canvas).toHaveAttribute("data-runtime-state", "running");
  expect(
    await canvas.evaluate((node, original) => node === original, resident),
  ).toBe(true);
  await expect(canvas).toHaveAttribute("data-active-frame-loops", "1");
  expect(errors).toEqual([]);
});
