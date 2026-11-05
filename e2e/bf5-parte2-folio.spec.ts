import { readFile, writeFile } from "node:fs/promises";
import { expect, test } from "./fixtures";

test.use({
  hasTouch: true,
  isMobile: true,
  viewport: { width: 390, height: 844 },
});

test("cards mantêm aparência durante scroll nativo e abrem com toque confirmado", async ({
  page,
  seedBooks,
}) => {
  await seedBooks(35);
  await page.goto("/colecao");
  const card = page.locator(".book-card__link").first();
  await card.scrollIntoViewIfNeeded();
  const style = () =>
    card.evaluate((node) => {
      const computed = getComputedStyle(node);
      return {
        background: computed.backgroundImage,
        color: computed.color,
        filter: computed.filter,
        transform: computed.transform,
        border: computed.borderColor,
      };
    });
  const baseline = await style();
  const bounds = await card.boundingBox();
  if (!bounds) throw new Error("Card indisponível");
  const session = await page.context().newCDPSession(page);
  const x = bounds.x + bounds.width / 2;
  const y = bounds.y + bounds.height / 2;
  const startY = await page.evaluate(() => scrollY);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  expect(await style()).toEqual(baseline);
  await expect(card).not.toHaveAttribute("data-tap-active");
  await session.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x, y: y - 20 }],
  });
  expect(await style()).toEqual(baseline);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x, y: y - 110 }],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(startY);
  await expect(page).toHaveURL(/\/colecao$/);
  await expect(card).not.toHaveAttribute("data-tap-confirmed");
  await session.detach();
  await card.tap();
  await expect(
    page.getByRole("heading", { name: "Livro descartável 035" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Voltar à Coleção" }).click();
  const returnedCard = page.locator(".book-card__link").first();
  await returnedCard.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Livro descartável 035" }),
  ).toBeVisible();
});

test("fólio persiste estado, marcador, notas/citações e exporta PNG nas duas composições", async ({
  page,
  createBook,
}, testInfo) => {
  await createBook({
    title: "O Jardim das Horas",
    author: "Helena do Vale",
    currentPage: 24,
    totalPages: 240,
    status: "in_progress",
  });
  const currentPage = page.getByLabel("Página atual (obrigatório)");
  await currentPage.fill("241");
  await page.getByRole("button", { name: "Salvar progresso" }).click();
  await expect(
    page.getByText("A página atual não pode ultrapassar 240."),
  ).toBeVisible();
  await currentPage.fill("120");
  await page.getByRole("button", { name: "Salvar progresso" }).click();
  await expect(
    page.getByRole("progressbar", { name: "50% concluído" }),
  ).toHaveJSProperty("value", 120);
  await expect(
    page.getByRole("status").filter({ hasText: "Progresso atualizado." }),
  ).toBeVisible();
  await page.locator(".folio-status > summary").click();
  await page.getByRole("button", { name: "Pausar leitura" }).click();
  await expect(page.getByText("Status atual: Pausado.")).toBeVisible();
  await page.locator(".folio-status > summary").click();
  await page.getByText("Escrever nas margens", { exact: true }).click();
  await page
    .getByLabel("Nota (obrigatório)")
    .fill("Nota privada fictícia: observar o tempo.");
  await page.getByLabel("Página da nota (opcional)").fill("45");
  await expect(page.locator(".primary-dock")).toHaveCSS(
    "pointer-events",
    "none",
  );
  await page
    .getByRole("button", { name: "Adicionar nota", exact: true })
    .click();
  await expect(
    page.locator(".folio-annotations").getByText("Página 45"),
  ).toBeVisible();
  await page.getByLabel("Tipo de anotação").selectOption("quote");
  await page
    .getByLabel("Citação (obrigatório)")
    .fill("As horas florescem onde a memória encontra abrigo.");
  await page.getByLabel("Página (opcional)", { exact: true }).fill("120");
  await page
    .getByRole("button", { name: "Adicionar citação", exact: true })
    .click();
  await page.getByText("Escrever nas margens", { exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("progressbar", { name: "50% concluído" }),
  ).toHaveJSProperty("value", 120);
  await expect(page.locator(".folio-status > summary")).toContainText(
    "Pausado",
  );
  await expect(
    page.getByText("Nota privada fictícia: observar o tempo.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".folio-annotations").getByText("Página 120"),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("folio-retrato.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 844, height: 390 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("folio-paisagem.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Criar imagem da leitura" }).click();
  const dialog = page.getByRole("dialog", { name: "Compartilhar como imagem" });
  const preview = dialog.getByRole("img");
  await expect(preview).toBeVisible();
  await expect(preview).toHaveJSProperty("naturalWidth", 1080);
  await expect(preview).toHaveJSProperty("naturalHeight", 1350);
  await expect(dialog.getByLabel("Composição").locator("option")).toHaveCount(
    2,
  );
  const summarySrc = await preview.getAttribute("src");
  expect(summarySrc).toMatch(/^data:image\/png;base64,/);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: () => false,
    });
  });
  await dialog
    .getByRole("button", { name: "Compartilhar imagem", exact: true })
    .click();
  await expect(dialog.getByRole("status")).toContainText(
    "Use Salvar imagem PNG",
  );
  const downloadEvent = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Salvar imagem PNG" }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("biblioteca-viva-leitura.png");
  const path = await download.path();
  if (!path) throw new Error("Arquivo PNG não gerado");
  const png = await readFile(path);
  expect([...png.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  expect(png.readUInt32BE(16)).toBe(1080);
  expect(png.readUInt32BE(20)).toBe(1350);
  await writeFile(testInfo.outputPath("resumo-leitura.png"), png);
  await testInfo.attach("resumo-leitura.png", {
    body: png,
    contentType: "image/png",
  });
  await dialog.getByLabel("Composição").selectOption({ index: 1 });
  await expect(preview).toHaveAttribute("alt", /As horas florescem/);
  await expect.poll(() => preview.getAttribute("src")).not.toBe(summarySrc);
  const quoteDownload = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Salvar imagem PNG" }).click();
  const quoteFile = await quoteDownload;
  expect(quoteFile.suggestedFilename()).toBe("biblioteca-viva-citacao.png");
  const quotePath = await quoteFile.path();
  if (!quotePath) throw new Error("Citação PNG não gerada");
  await writeFile(
    testInfo.outputPath("citacao.png"),
    await readFile(quotePath),
  );
  await testInfo.attach("citacao.png", {
    body: await readFile(quotePath),
    contentType: "image/png",
  });
  await dialog.getByRole("button", { name: "Fechar prévia" }).click();
  await expect(
    page.getByRole("button", { name: "Criar imagem da leitura" }),
  ).toBeFocused();
  await page.getByText("Ações do livro", { exact: true }).last().click();
  await expect(page.getByRole("link", { name: "Editar dados" })).toBeVisible();
  await page.getByText("Organização e favoritos", { exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Adicionar aos favoritos" }),
  ).toBeVisible();
});
