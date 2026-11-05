import { chooseBVDate } from "./pickers";
import { chooseRecordType } from "./fixtures";
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

test("BF-5R5/2C: strength is a reusable sheet with dated executions and immutable history", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-11-04T12:00:00.000Z"));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/novo-registro");
  await page.getByRole("button", { name: /Atividade física/ }).click();
  await page.getByLabel("Nome do treino").fill("Peito e tríceps fictício");
  await page.getByRole("radio", { name: "Força", exact: true }).check();
  await chooseBVDate(page, page.getByLabel("Data de início"), "2026-10-01");
  await chooseBVDate(page, page.getByLabel("Data final"), "2026-11-30");
  await page.getByRole("checkbox", { name: "Qua", exact: true }).check();
  await page
    .getByRole("button", { name: "Adicionar exercício", exact: true })
    .click();
  await page.getByLabel("Nome do exercício").fill("Supino fictício");
  await page.getByLabel("Séries", { exact: true }).fill("3");
  await page.getByLabel("Repetições por série", { exact: true }).fill("10");
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
  await chooseBVDate(
    page,
    page.getByRole("button", { name: "Dia", exact: true }),
    "2026-10-30",
  );
  await page.getByLabel("Intensidade percebida (1–10)").fill("6");
  const observations = page
    .locator("summary")
    .filter({ hasText: "Observações do corpo" });
  await observations.scrollIntoViewIfNeeded();
  await expect(observations).toBeInViewport();
  await observations.click();
  await expect(page.getByLabel("Nota deste dia")).toBeVisible();
  await page.getByLabel("Nota deste dia").fill("Execução fictícia confortável");
  await page
    .getByRole("button", { name: "Marcar treino inteiro", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Salvar execução", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Salvar execução", exact: true }),
  ).toBeEnabled();
  await expect(page.locator(".workout-feedback")).toHaveText("Execução salva.");
  await expect(
    page.getByRole("button", { name: "2026-10-30: Realizado", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Nota deste dia")).toHaveValue(
    "Execução fictícia confortável",
  );
  await page.getByRole("link", { name: "Editar treino" }).click();
  await expect(
    page.getByLabel("Repetições por série", { exact: true }),
  ).toHaveValue("10");
  await page.getByLabel("Repetições por série", { exact: true }).fill("15");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.locator(".workout-movement")).toContainText(
    "Base · 3 × 15",
  );
  await chooseBVDate(
    page,
    page.getByRole("button", { name: "Dia", exact: true }),
    "2026-10-30",
  );
  await expect(page.locator(".workout-movement")).toContainText(
    "Base · 3 × 10",
  );
  await expect(
    page.locator(".workout-movement").getByLabel("Repetições", { exact: true }),
  ).toHaveValue("10");
  await page.reload();
  await chooseBVDate(
    page,
    page.getByRole("button", { name: "Dia", exact: true }),
    "2026-10-30",
  );
  await expect(page.locator(".workout-movement")).toContainText(
    "Base · 3 × 10",
  );
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
  await chooseRecordType(page, "Série");
  await page.getByLabel("Título", { exact: true }).fill("Crônica fictícia");
  await page.getByLabel("Total de episódios").fill("12");
  await page.getByLabel("Temporada atual", { exact: true }).fill("2");
  await page.getByLabel("Episódio atual").fill("3");
  await page.getByRole("button", { name: "Salvar obra", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Crônica fictícia", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Temporada atual", { exact: true }).fill("2");
  await page.getByLabel("Episódio atual", { exact: true }).fill("4");
  await page.getByLabel("Episódios assistidos", { exact: true }).fill("8");
  await page.getByRole("button", { name: "Salvar acompanhamento" }).click();
  await expect(
    page.getByRole("progressbar", { name: "Progresso da obra" }),
  ).toHaveAttribute("value", "8");
  await page.getByText("Histórico de acompanhamento", { exact: true }).click();
  const record = page.locator("form.session-record");
  await expect(record.getByLabel(/Minutos assistidos/)).toHaveCount(0);
  await record
    .getByRole("button", { name: "Registrar episódios", exact: true })
    .click();
  await expect(
    page.getByRole("progressbar", { name: "Progresso da obra" }),
  ).toHaveAttribute("value", "9");
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
  await expect(page.getByLabel("Temporada atual", { exact: true })).toHaveValue(
    "2",
  );
  await expect(page.getByLabel("Episódio atual", { exact: true })).toHaveValue(
    "4",
  );
  await page.getByRole("button", { name: "Citações", exact: true }).click();
  await expect(
    page.getByText("A estrela lembra o caminho fictício.", { exact: true }),
  ).toBeVisible();
  await page.getByText("Opções da anotação", { exact: true }).click();
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
