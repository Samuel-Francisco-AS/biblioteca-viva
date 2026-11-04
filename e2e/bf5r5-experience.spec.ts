import { expect, test } from "./fixtures";

test("BF-5R5: same canvas pauses between tabs, resumes its camera and survives rotation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const canvas = page.locator("canvas");
  await expect(canvas).toHaveAttribute("data-fixture-status", "ready");
  await canvas.evaluate((node) =>
    node.setAttribute("data-r5-identity", "resident"),
  );
  await page.mouse.move(195, 420);
  await page.mouse.down();
  await page.mouse.move(245, 440);
  await page.mouse.up();
  const x = await canvas.getAttribute("data-camera-target-x");
  const timings: { destination: string; elapsedMs: number }[] = [];
  for (const destination of [
    "Coleção",
    "Arquivo",
    "Resumo e estatísticas",
    "Ajustes",
  ]) {
    const start = Date.now();
    await page
      .getByRole("navigation", { name: "Navegação principal" })
      .getByRole("link", { name: destination, exact: true })
      .click();
    await expect(canvas).toBeHidden();
    await expect(canvas).toHaveAttribute("data-runtime-state", "paused");
    await expect(canvas).toHaveAttribute("data-active-frame-loops", "0");
    timings.push({ destination, elapsedMs: Date.now() - start });
    await page
      .getByRole("navigation", { name: "Navegação principal" })
      .getByRole("link", { name: "Biblioteca", exact: true })
      .click();
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute("data-runtime-state", "running");
    await expect(canvas).toHaveAttribute("data-active-frame-loops", "1");
    await expect(canvas).toHaveAttribute("data-r5-identity", "resident");
    await expect(canvas).toHaveAttribute("data-camera-target-x", x ?? "");
    await expect(canvas).toHaveCount(1);
  }
  for (const viewport of [
    { width: 844, height: 390 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(canvas).toHaveAttribute("data-r5-identity", "resident");
    const bounds = await canvas.boundingBox();
    expect(bounds?.height).toBe(viewport.height);
    expect(bounds?.width).toBe(viewport.width);
  }
  await test.info().attach("route-observations.json", {
    body: JSON.stringify(timings, null, 2),
    contentType: "application/json",
  });
});

test("BF-5R5: strength is a reusable sheet with dated executions and immutable history", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/novo-registro");
  await page.getByRole("button", { name: /^Atividade física/ }).click();
  await page
    .getByLabel("Título", { exact: true })
    .fill("Peito e tríceps fictício");
  await page.getByLabel("Categoria", { exact: true }).selectOption("strength");
  await page
    .getByRole("button", { name: "Adicionar exercício", exact: true })
    .click();
  await page
    .getByLabel("Nome do exercício", { exact: true })
    .fill("Supino fictício");
  await page.getByLabel("Séries", { exact: true }).fill("3");
  await page.getByLabel("Repetições", { exact: true }).fill("10");
  await page.getByLabel("Carga (kg)", { exact: true }).fill("12.5");
  await page
    .getByRole("button", { name: "Salvar registro", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Peito e tríceps fictício",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByLabel(/Distância em metros/)).toHaveCount(0);
  const record = page.locator("form.session-record");
  await record.getByLabel("Dia da experiência").fill("2026-10-30");
  await record.getByLabel("Esforço percebido (1–10)").fill("6");
  await record
    .getByLabel("Nota opcional")
    .fill("Execução fictícia confortável");
  await record
    .getByRole("button", { name: "Registrar execução", exact: true })
    .click();
  await expect(page.getByText("1 dia de prática · 1 execução")).toBeVisible();
  await expect(page.getByText("Execução fictícia confortável")).toBeVisible();
  await page.getByRole("link", { name: "Editar", exact: true }).click();
  await expect(page.getByLabel("Carga (kg)", { exact: true })).toHaveValue(
    "12.5",
  );
  await page.getByLabel("Carga (kg)", { exact: true }).fill("15");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await page.getByText("Ficha desta execução", { exact: true }).click();
  await expect(
    page
      .locator(".session-history")
      .getByText("3 séries · 10 repetições · 12.5 kg", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator(".entry-detail-sections > section")
      .first()
      .getByText("3 séries · 10 repetições · 15 kg", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("BF-5R5: series bookmark, episodes without minutes and contextual quotation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/novo-registro");
  await page.getByRole("button", { name: /^Série/ }).click();
  await page.getByLabel("Título", { exact: true }).fill("Crônica fictícia");
  await page.getByLabel("Total de episódios (opcional)").fill("12");
  await page.getByLabel("Temporada em que parou (opcional)").fill("2");
  await page.getByLabel("Episódio em que parou (opcional)").fill("3");
  await page
    .getByRole("button", { name: "Salvar registro", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Crônica fictícia", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Temporada atual").fill("2");
  await page.getByLabel("Episódio em que parou", { exact: true }).fill("4");
  await page.getByLabel("Episódios assistidos", { exact: true }).fill("8");
  await page.getByRole("button", { name: "Salvar progresso" }).click();
  await expect(
    page.getByText("8 de 12 episódios", { exact: true }),
  ).toBeVisible();
  const record = page.locator("form.session-record");
  await expect(record.getByLabel(/Minutos assistidos/)).toHaveCount(0);
  await record
    .getByRole("button", { name: "Registrar episódios", exact: true })
    .click();
  await expect(
    page.getByText("9 de 12 episódios", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Citações", exact: true }).click();
  await page
    .getByLabel("Nova citação", { exact: true })
    .fill("A estrela lembra o caminho fictício.");
  await page.getByLabel("Temporada da citação").fill("2");
  await page.getByLabel("Episódio da citação").fill("4");
  await page
    .getByRole("button", { name: "Adicionar citação", exact: true })
    .click();
  await expect(
    page.getByText("A estrela lembra o caminho fictício.", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Temporada atual")).toHaveValue("2");
  await expect(
    page.getByLabel("Episódio em que parou", { exact: true }),
  ).toHaveValue("4");
  await page.getByRole("button", { name: "Citações", exact: true }).click();
  await expect(
    page.getByText("A estrela lembra o caminho fictício.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Editar citação", exact: true })
    .click();
  await expect(
    page.getByLabel("Página (opcional)", { exact: true }),
  ).toHaveCount(0);
  await page
    .getByLabel("Editar conteúdo da citação")
    .fill("A estrela guarda uma lembrança fictícia.");
  await page
    .getByRole("button", { name: "Salvar citação", exact: true })
    .click();
  await expect(
    page.getByText("A estrela guarda uma lembrança fictícia.", { exact: true }),
  ).toBeVisible();
});
