import { mkdir, readFile, writeFile } from "node:fs/promises";
import { expect, test } from "./fixtures";
import { chooseBVDate, chooseBVOption } from "./pickers";
const evidence = "docs/evidence/BF-5P2E";
const fixture = "e2e/fixtures/entertainment/ceu-ficticio.jpg";
test.use({
  locale: "pt-BR",
  timezoneId: "America/Fortaleza",
  hasTouch: true,
  isMobile: true,
  viewport: { width: 390, height: 844 },
});
test("seletores DOM confirmam foco e datas, cancelam com Back/Escape e mantêm teclado e formulário", async ({
  page,
}) => {
  await page.goto("/novo-registro");
  await page.getByRole("button", { name: /Estudo/ }).click();
  await page
    .getByRole("textbox", { name: "Título", exact: true })
    .fill("Atlas do crepúsculo");
  await chooseBVOption(page, page.getByLabel("Unidade de progresso"), "hours");
  await page.getByRole("button", { name: "Salvar registro" }).click();
  await expect(
    page.getByRole("heading", { name: "Atlas do crepúsculo" }),
  ).toBeVisible();
  const focus = page.getByLabel("Duração do foco");
  await focus.click();
  const sheet = page.locator("dialog[open]").last();
  await sheet.getByRole("radio", { name: /45 minutos/ }).check();
  await page.evaluate(() =>
    window.dispatchEvent(
      new Event("biblioteca-viva:native-back", { cancelable: true }),
    ),
  );
  await expect(focus).toBeFocused();
  await expect(focus).toContainText("25 minutos");
  await focus.focus();
  await page.keyboard.press("ArrowDown");
  await sheet.getByRole("radio", { name: /15 minutos/ }).focus();
  await page.keyboard.press("Space");
  await sheet.getByRole("button", { name: "Confirmar", exact: true }).click();
  await page.getByRole("button", { name: "Iniciar foco", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("timer")).toContainText("15:00");
  await page.goto("/novo-registro");
  await page.getByRole("button", { name: /Atividade física/ }).click();
  await page.getByLabel("Nome do treino").fill("Ritual da aurora");
  const start = page.getByLabel("Data de início");
  await chooseBVDate(page, start, "2026-11-01");
  await page.setViewportSize({ width: 844, height: 390 });
  await page.getByLabel("Data final").click();
  await expect(sheet).toBeVisible();
  const box = await sheet.boundingBox();
  if (!box) throw new Error("Calendário sem área");
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(390);
  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await chooseBVDate(page, page.getByLabel("Data final"), "2026-11-30");
  await page.getByRole("checkbox", { name: "Qua", exact: true }).check();
  await page
    .getByRole("button", { name: "Adicionar exercício", exact: true })
    .click();
  await page.getByLabel("Nome do exercício").fill("Remada fictícia");
  await page.getByLabel("Repetições por série").fill("12");
  await page.getByRole("button", { name: "Salvar registro" }).click();
  await expect(
    page.getByRole("heading", { name: "Ritual da aurora" }),
  ).toBeVisible();
  await chooseBVDate(
    page,
    page.getByRole("button", { name: "Dia", exact: true }),
    "2026-11-02",
  );
  await expect(
    page.getByRole("button", { name: "Dia", exact: true }),
  ).toContainText("02/11/2026");
  await expect(page.locator('select,input[type="date"]')).toHaveCount(0);
  await mkdir(evidence, { recursive: true });
  await page.getByRole("button", { name: "Dia", exact: true }).click();
  await page.screenshot({ path: `${evidence}/calendario-paisagem.png` });
});
test("capa de livro persiste, ateliê exporta PNG real offline e substituição/remoção preservam o registro", async ({
  page,
  context,
  createBook,
}) => {
  await createBook({
    title: "O Códice das Marés",
    author: "Autora fictícia",
    currentPage: 25,
    totalPages: 100,
    status: "in_progress",
  });
  await page.getByText("Ações do livro", { exact: true }).last().click();
  await page.getByText("Capa da obra", { exact: true }).click();
  await page
    .getByLabel("Escolher imagem do dispositivo")
    .setInputFiles(fixture);
  await expect(page.getByAltText("Prévia da capa")).toBeVisible();
  await expect(page.getByAltText("Capa de O Códice das Marés")).toHaveCount(0);
  await page.getByRole("button", { name: "Salvar capa", exact: true }).click();
  await expect(page.getByAltText("Capa de O Códice das Marés")).toBeVisible();
  const url = page.url();
  await page.reload();
  await expect(page.getByAltText("Capa de O Códice das Marés")).toBeVisible();
  const coverBox = await page
    .getByAltText("Capa de O Códice das Marés")
    .boundingBox();
  if (!coverBox) throw new Error("Capa sem área");
  expect(coverBox.width).toBeLessThanOrEqual(128);
  expect(Math.abs(coverBox.height / coverBox.width - 1.5)).toBeLessThan(0.05);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator("#bv-startup-veil")).toHaveCount(0);
  await mkdir(evidence, { recursive: true });
  await page.screenshot({
    path: `${evidence}/livro-capa-retrato.png`,
    fullPage: true,
  });
  await context.setOffline(true);
  await page.getByRole("button", { name: "Criar imagem da leitura" }).click();
  const dialog = page.locator("dialog[open]").first(),
    preview = dialog.getByRole("img");
  await expect(preview).toBeVisible();
  const first = await preview.getAttribute("src");
  await dialog.getByLabel("Título na imagem").fill("Marés do imaginário");
  await dialog
    .getByLabel("Mensagem personalizada")
    .fill("Uma passagem para outros horizontes.");
  await dialog.getByText("Imagem e acabamento", { exact: true }).click();
  await dialog.getByRole("radio", { name: "Selo lunar", exact: true }).check();
  await dialog.getByRole("radio", { name: "Ao centro", exact: true }).check();
  await dialog.getByRole("radio", { name: "Central", exact: true }).check();
  await expect(preview).toBeVisible();
  await expect(preview).not.toHaveAttribute("src", first ?? "");
  await mkdir(evidence, { recursive: true });
  await dialog.evaluate((el) => {
    el.scrollTop = 0;
  });
  await page.screenshot({ path: `${evidence}/atelie-retrato.png` });
  for (const [label, height] of [
    ["Publicação · 4:5", 1350],
    ["Story · 9:16", 1920],
    ["Quadrado · 1:1", 1080],
  ] as const) {
    await dialog.getByRole("radio", { name: label, exact: true }).check();
    await expect(preview).toHaveJSProperty("naturalHeight", height);
    const downloadEvent = page.waitForEvent("download");
    await dialog.getByRole("button", { name: "Salvar imagem PNG" }).click();
    const download = await downloadEvent,
      path = await download.path();
    if (!path) throw new Error("PNG ausente");
    const png = await readFile(path);
    expect([...png.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(png.readUInt32BE(16)).toBe(1080);
    expect(png.readUInt32BE(20)).toBe(height);
    expect(await preview.getAttribute("src")).toBe(
      `data:image/png;base64,${png.toString("base64")}`,
    );
    await writeFile(`${evidence}/livro-${height}.png`, png);
  }
  await page.setViewportSize({ width: 844, height: 390 });
  await dialog.evaluate((el) => {
    el.scrollTop = 0;
  });
  await page.screenshot({ path: `${evidence}/atelie-paisagem.png` });
  await page.evaluate(() =>
    window.dispatchEvent(
      new Event("biblioteca-viva:native-back", { cancelable: true }),
    ),
  );
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(url);
  await context.setOffline(false);
  await page.getByText("Ações do livro", { exact: true }).last().click();
  await page.getByText("Capa da obra", { exact: true }).click();
  await page.getByLabel("Substituir imagem").setInputFiles(fixture);
  await page.getByRole("button", { name: "Salvar capa" }).click();
  await expect(page.getByRole("status")).toContainText("Capa salva");
  await page.getByRole("button", { name: "Remover capa" }).click();
  await page.getByRole("button", { name: "Cancelar alteração" }).click();
  await expect(page.getByAltText("Capa de O Códice das Marés")).toBeVisible();
  await page.getByRole("button", { name: "Remover capa" }).click();
  await page.getByRole("button", { name: "Salvar capa" }).click();
  await page.reload();
  await expect(page.getByAltText("Capa de O Códice das Marés")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "O Códice das Marés" }),
  ).toBeVisible();
});
