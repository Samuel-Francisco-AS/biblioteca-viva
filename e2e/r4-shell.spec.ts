import { expect, test } from "@playwright/test";

test("shell abre a Biblioteca com uma única superfície Three.js", async ({
  page,
}) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });

  await page.goto("/");
  await expect(page.getByRole("banner")).toContainText("Biblioteca");
  await expect(
    page.getByRole("heading", {
      name: "Fundação 3D experimental",
    }),
  ).toBeVisible();
  const canvas = page.locator("canvas[data-three-world-canvas='true']");
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toHaveAttribute("data-fixture-status", "ready");
  await expect(canvas).toHaveAttribute("data-reference-objects", "46");
  await expect(canvas).toHaveAttribute("data-reference-proxy-types", "4");
  await expect(canvas).toHaveAttribute("data-selectable-objects", "11");
  await expect(canvas).toHaveAttribute("data-draw-calls", /^\d+$/u);
  await expect(canvas).toHaveAttribute("data-triangles", /^\d+$/u);
  await expect(canvas).toHaveAttribute("data-runtime-state", "running");
  await expect(canvas).toHaveAttribute("data-active-frame-loops", "1");
  await expect(canvas).toHaveAttribute("data-meshes", "46");
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-fps")))
    .toBeGreaterThan(0);
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-frame-time-ms")))
    .toBeGreaterThan(0);
  expect(Number(await canvas.getAttribute("data-draw-calls"))).toBeGreaterThan(
    0,
  );
  expect(Number(await canvas.getAttribute("data-triangles"))).toBeGreaterThan(
    0,
  );
  expect(
    Number(await canvas.getAttribute("data-first-usable-frame-ms")),
  ).toBeGreaterThanOrEqual(0);
  expect(
    Number(await canvas.getAttribute("data-fixture-load-ms")),
  ).toBeGreaterThan(0);
  await expect(
    page.getByRole("complementary", {
      name: "Diagnóstico técnico do ambiente 3D",
    }),
  ).toHaveAttribute("data-runtime-state", "running");
  await expect(
    page.getByText("Ambiente 3D experimental em execução."),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navegação principal" }),
  ).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("interação desktop conecta picking, pan, zoom e seleção React", async ({
  page,
}) => {
  await page.goto("/");
  const canvas = page.locator("canvas[data-three-world-canvas='true']");
  await expect(canvas).toHaveAttribute("data-fixture-status", "ready");
  await expect(
    page.getByText("Objeto selecionado: Nenhum objeto selecionado."),
  ).toBeVisible();
  const canvasBox = await canvas.boundingBox();
  expect(canvasBox).not.toBeNull();
  if (!canvasBox) return;
  const pickObject = await canvas.getAttribute("data-test-pick-object");
  const pickX = Number(await canvas.getAttribute("data-test-pick-x"));
  const pickY = Number(await canvas.getAttribute("data-test-pick-y"));
  expect(pickObject).toBe("crate-01");

  await page.mouse.click(canvasBox.x + pickX, canvasBox.y + pickY);
  await expect(
    page.getByText("Objeto selecionado: Caixa técnica 1."),
  ).toBeVisible();
  await expect(canvas).toHaveAttribute("data-selected-object", "crate-01");
  await expect(canvas).toHaveAttribute("data-highlighted-object", "crate-01");

  const next = page.getByRole("button", { name: "Próximo →" });
  const previous = page.getByRole("button", { name: "← Anterior" });
  await next.click();
  await expect(
    page.getByText("Objeto selecionado: Caixa técnica 2."),
  ).toBeVisible();
  await expect(canvas).toHaveAttribute("data-highlighted-object", "crate-02");

  await previous.click();
  await expect(
    page.getByText("Objeto selecionado: Caixa técnica 1."),
  ).toBeVisible();
  await expect(canvas).toHaveAttribute("data-highlighted-object", "crate-01");

  await canvas.scrollIntoViewIfNeeded();
  const interactionBox = await canvas.boundingBox();
  expect(interactionBox).not.toBeNull();
  if (!interactionBox) return;
  const targetBeforePan = await canvas.getAttribute("data-camera-target-x");
  await page.mouse.move(
    interactionBox.x + interactionBox.width * 0.45,
    interactionBox.y + interactionBox.height * 0.45,
  );
  await page.mouse.down();
  await page.mouse.move(
    interactionBox.x + interactionBox.width * 0.6,
    interactionBox.y + interactionBox.height * 0.5,
    { steps: 4 },
  );
  await page.mouse.up();
  await expect
    .poll(() => canvas.getAttribute("data-camera-target-x"))
    .not.toBe(targetBeforePan);
  await expect(canvas).toHaveAttribute("data-selected-object", "crate-01");

  const zoomBeforeWheel = Number(await canvas.getAttribute("data-camera-zoom"));
  await page.mouse.move(
    interactionBox.x + interactionBox.width / 2,
    interactionBox.y + interactionBox.height / 2,
  );
  await page.mouse.wheel(0, -300);
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-camera-zoom")))
    .toBeGreaterThan(zoomBeforeWheel);

  await page.mouse.click(interactionBox.x + 5, interactionBox.y + 5);
  await expect(
    page.getByText("Objeto selecionado: Nenhum objeto selecionado."),
  ).toBeVisible();
  await expect(canvas).toHaveAttribute("data-highlighted-object", "");

  await next.click();
  await expect(canvas).toHaveAttribute("data-selected-object", "bookshelf-01");
  await previous.click();
  await expect(canvas).toHaveAttribute(
    "data-selected-object",
    "fixture-pyramid",
  );
  await next.click();
  await expect(canvas).toHaveAttribute("data-selected-object", "bookshelf-01");
});

test("viewport mobile mantém tap, pan, pinch sintético e alternativa React", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/");
  const canvas = page.locator("canvas[data-three-world-canvas='true']");
  await expect(canvas).toHaveAttribute("data-fixture-status", "ready");
  await expect(canvas).toHaveCSS("touch-action", "none");
  const canvasBox = await canvas.boundingBox();
  expect(canvasBox).not.toBeNull();
  if (!canvasBox) return;
  const pickX = Number(await canvas.getAttribute("data-test-pick-x"));
  const pickY = Number(await canvas.getAttribute("data-test-pick-y"));
  const tapPosition = {
    clientX: canvasBox.x + pickX,
    clientY: canvasBox.y + pickY,
    pointerId: 10,
    pointerType: "touch",
  };

  await canvas.dispatchEvent("pointerdown", tapPosition);
  await canvas.dispatchEvent("pointerup", tapPosition);
  await expect(
    page.getByText("Objeto selecionado: Caixa técnica 1."),
  ).toBeVisible();

  const next = page.getByRole("button", { name: "Próximo →" });
  const previous = page.getByRole("button", { name: "← Anterior" });
  await expect(next).toBeVisible();
  await expect(previous).toBeVisible();
  await expect(page.getByRole("combobox")).toHaveCount(0);
  await next.click();
  await expect(canvas).toHaveAttribute("data-selected-object", "crate-02");
  await expect(canvas).toHaveAttribute("data-highlighted-object", "crate-02");
  expect(
    await page.evaluate(
      "document.documentElement.scrollWidth <= window.innerWidth",
    ),
  ).toBe(true);
  const targetBeforePan = await canvas.getAttribute("data-camera-target-x");
  await canvas.dispatchEvent("pointerdown", {
    clientX: canvasBox.x + 80,
    clientY: canvasBox.y + 100,
    pointerId: 11,
    pointerType: "touch",
  });
  await canvas.dispatchEvent("pointermove", {
    clientX: canvasBox.x + 130,
    clientY: canvasBox.y + 120,
    pointerId: 11,
    pointerType: "touch",
  });
  await canvas.dispatchEvent("pointerup", {
    clientX: canvasBox.x + 130,
    clientY: canvasBox.y + 120,
    pointerId: 11,
    pointerType: "touch",
  });
  await expect
    .poll(() => canvas.getAttribute("data-camera-target-x"))
    .not.toBe(targetBeforePan);
  await expect(canvas).toHaveAttribute("data-selected-object", "crate-02");

  const zoomBeforePinch = Number(await canvas.getAttribute("data-camera-zoom"));
  await canvas.dispatchEvent("pointerdown", {
    clientX: canvasBox.x + 90,
    clientY: canvasBox.y + 120,
    pointerId: 12,
    pointerType: "touch",
  });
  await canvas.dispatchEvent("pointerdown", {
    clientX: canvasBox.x + 190,
    clientY: canvasBox.y + 120,
    pointerId: 13,
    pointerType: "touch",
  });
  await canvas.dispatchEvent("pointermove", {
    clientX: canvasBox.x + 240,
    clientY: canvasBox.y + 120,
    pointerId: 13,
    pointerType: "touch",
  });
  await canvas.dispatchEvent("pointerup", {
    clientX: canvasBox.x + 90,
    clientY: canvasBox.y + 120,
    pointerId: 12,
    pointerType: "touch",
  });
  await canvas.dispatchEvent("pointerup", {
    clientX: canvasBox.x + 240,
    clientY: canvasBox.y + 120,
    pointerId: 13,
    pointerType: "touch",
  });
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-camera-zoom")))
    .toBeGreaterThan(zoomBeforePinch);
  await expect(canvas).toHaveAttribute("data-selected-object", "crate-02");
  await expect(
    page.getByRole("navigation", { name: "Navegação principal" }),
  ).toBeVisible();
});

test("dez ciclos de rota não acumulam canvases, loops ou interação", async ({
  page,
}) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  await page.goto("/");
  const canvas = page.locator("canvas[data-three-world-canvas='true']");
  const diagnostics = page.getByTestId("world-diagnostics");

  for (let cycle = 1; cycle <= 10; cycle += 1) {
    await expect(
      canvas,
      `canvas único no início do ciclo ${cycle}`,
    ).toHaveCount(1);
    await expect(canvas).toHaveAttribute("data-runtime-state", "running");
    await expect(canvas).toHaveAttribute("data-active-frame-loops", "1");
    await expect(diagnostics).toHaveCount(1);

    await page.getByRole("link", { name: "Coleção", exact: true }).click();
    await expect(page).toHaveURL(/\/colecao$/u);
    await expect(canvas, `canvas removido no ciclo ${cycle}`).toHaveCount(0);
    await expect(diagnostics).toHaveCount(0);

    await page.getByRole("link", { name: "Biblioteca", exact: true }).click();
    await expect(page).toHaveURL(/\/$/u);
  }

  await expect(canvas).toHaveCount(1);
  await expect(canvas).toHaveAttribute("data-fixture-status", "ready");
  await page.getByRole("button", { name: "Próximo →" }).click();
  await expect(canvas).toHaveAttribute("data-selected-object", "bookshelf-01");
  await expect(canvas).toHaveAttribute(
    "data-highlighted-object",
    "bookshelf-01",
  );

  await canvas.scrollIntoViewIfNeeded();
  const canvasBox = await canvas.boundingBox();
  expect(canvasBox).not.toBeNull();
  if (!canvasBox) return;
  const targetBeforePan = await canvas.getAttribute("data-camera-target-x");
  await page.mouse.move(canvasBox.x + 160, canvasBox.y + 120);
  await page.mouse.down();
  await page.mouse.move(canvasBox.x + 200, canvasBox.y + 120);
  await page.mouse.up();
  await expect
    .poll(() => canvas.getAttribute("data-camera-target-x"))
    .not.toBe(targetBeforePan);

  await page.mouse.move(
    canvasBox.x + canvasBox.width / 2,
    canvasBox.y + canvasBox.height / 2,
  );
  await page.mouse.wheel(0, -100);
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-camera-zoom")))
    .toBeGreaterThan(1.15);
  expect(Number(await canvas.getAttribute("data-camera-zoom"))).toBeLessThan(
    1.18,
  );
  expect(browserErrors).toEqual([]);
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
