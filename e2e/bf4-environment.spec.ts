import { expect, test } from "./fixtures";

test("BF-4C: ambiente integrado em paisagem/retrato, zoom, pan e seleção", async ({
  page,
  createBook,
}, testInfo) => {
  await createBook({ title: "Atlas fictício BF4", author: "Autoria fictícia" });
  for (const type of [
    "Filme",
    "Série",
    "Estudo",
    "Atividade física",
    "Trabalho",
  ]) {
    await page.goto("/novo-registro");
    await page.getByRole("button", { name: new RegExp(type, "u") }).click();
    await page.getByLabel("Título").fill(`${type} fictício BF4`);
    await page.getByRole("button", { name: "Salvar registro" }).click();
    await expect(
      page.getByRole("heading", { name: `${type} fictício BF4` }),
    ).toBeVisible();
  }
  await page.goto("/");
  const canvas = page.locator("canvas[data-three-world-canvas='true']");
  await expect(canvas).toHaveAttribute("data-fixture-status", "ready");
  await expect(canvas).toHaveAttribute("data-selectable-objects", "9");
  await testInfo.attach("bf4c-renderer-metrics", {
    body: JSON.stringify(
      await canvas.evaluate((element) => ({ ...element.dataset })),
      null,
      2,
    ),
    contentType: "application/json",
  });
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(canvas).toHaveAttribute("data-runtime-state", "running");
    await canvas.screenshot({
      path: testInfo.outputPath(`ambiente-${viewport.width}.png`),
    });
  }
  await page
    .getByRole("button", {
      name: "Selecionar no ambiente: Livro Atlas fictício BF4",
      exact: true,
    })
    .click();
  await expect(canvas).toHaveAttribute(
    "data-selected-object",
    /^reading-book:/u,
  );
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) throw new Error("Canvas ausente");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.wheel(0, -500);
  await expect(canvas).not.toHaveAttribute("data-camera-zoom", "0.700");
  const targetBeforePan = await canvas.getAttribute("data-camera-target-x");
  await page.mouse.down();
  await page.mouse.move(x + 20, y + 20);
  await page.mouse.move(x + 65, y + 45);
  await page.mouse.up();
  await expect(canvas).not.toHaveAttribute(
    "data-camera-target-x",
    targetBeforePan ?? "",
  );
  await expect(canvas).toHaveAttribute(
    "data-selected-object",
    /^reading-book:/u,
  );
  await canvas.screenshot({
    path: testInfo.outputPath("exploracao-selecao.png"),
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(canvas).toHaveAttribute(
    "data-selected-object",
    /^reading-book:/u,
  );
});
