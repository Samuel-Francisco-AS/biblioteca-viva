import { expect, test, type Locator } from "@playwright/test";

import { READING_SHELF_COMPOSITION_DEFINITIONS } from "../src/features/library/three/readingShelfDefinitions";

const shelfIds = READING_SHELF_COMPOSITION_DEFINITIONS.map(
  ({ identity }) => identity.instanceId,
);

/** Find a point that actually picks a shelf in the current camera/viewport. */
async function visibleShelfPoint(canvas: Locator): Promise<{
  readonly id: string;
  readonly x: number;
  readonly y: number;
}> {
  const bounds = await canvas.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) throw new Error("Canvas sem bounds.");
  let pointerId = 100;
  const tap = async (x: number, y: number): Promise<void> => {
    const options = {
      clientX: x,
      clientY: y,
      pointerId: pointerId++,
      pointerType: "touch",
    };
    await canvas.dispatchEvent("pointerdown", options);
    await canvas.dispatchEvent("pointerup", options);
  };
  for (let row = 2; row <= 18; row += 1) {
    for (let column = 2; column <= 18; column += 1) {
      const x = bounds.x + (bounds.width * column) / 20;
      const y = bounds.y + (bounds.height * row) / 20;
      await tap(x, y);
      const id = await canvas.getAttribute("data-selected-object");
      if (id && shelfIds.includes(id)) {
        await tap(bounds.x + 2, bounds.y + 2);
        await expect(canvas).toHaveAttribute("data-selected-object", "");
        return { id, x, y };
      }
    }
  }
  throw new Error("Nenhuma estante BF-2 alcançável no canvas.");
}

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
      name: "Área de leitura",
      exact: true,
    }),
  ).toBeVisible();
  const canvas = page.locator("canvas[data-three-world-canvas='true']");
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toHaveAttribute("data-fixture-status", "ready");
  await expect(canvas).toHaveAttribute("data-reference-objects", "0");
  await expect(canvas).toHaveAttribute("data-reference-proxy-types", "0");
  await expect(canvas).toHaveAttribute(
    "data-selectable-objects",
    String(shelfIds.length),
  );
  await expect(canvas).toHaveAttribute("data-draw-calls", /^\d+$/u);
  await expect(canvas).toHaveAttribute("data-triangles", /^\d+$/u);
  await expect(canvas).toHaveAttribute("data-runtime-state", "running");
  await expect(canvas).toHaveAttribute("data-active-frame-loops", "1");
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-meshes")))
    .toBeGreaterThan(0);
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
  await expect(
    page.getByRole("complementary", {
      name: "Diagnóstico técnico do ambiente 3D",
    }),
  ).toHaveAttribute("data-runtime-state", "running");
  await expect(page.getByText("Ambiente 3D em execução.")).toBeVisible();
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
  const pickedShelf = await visibleShelfPoint(canvas);
  await page.mouse.click(pickedShelf.x, pickedShelf.y);
  await expect(canvas).toHaveAttribute("data-selected-object", pickedShelf.id);
  await expect(canvas).toHaveAttribute(
    "data-highlighted-object",
    pickedShelf.id,
  );
  await expect(
    page.getByText(/Objeto selecionado: Estante de leitura/u),
  ).toBeVisible();

  const next = page.getByRole("button", { name: "Próximo →" });
  const previous = page.getByRole("button", { name: "← Anterior" });
  await next.click();
  const nextShelf =
    shelfIds[(shelfIds.indexOf(pickedShelf.id) + 1) % shelfIds.length];
  await expect(canvas).toHaveAttribute("data-selected-object", nextShelf);
  await expect(canvas).toHaveAttribute("data-highlighted-object", nextShelf);

  await previous.click();
  await expect(canvas).toHaveAttribute("data-selected-object", pickedShelf.id);
  await expect(canvas).toHaveAttribute(
    "data-highlighted-object",
    pickedShelf.id,
  );

  const canvasBox = await canvas.boundingBox();
  expect(canvasBox).not.toBeNull();
  if (!canvasBox) return;

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
  await expect(canvas).toHaveAttribute("data-selected-object", pickedShelf.id);

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
  await expect(canvas).toHaveAttribute("data-selected-object", shelfIds[0]);
  await previous.click();
  await expect(canvas).toHaveAttribute(
    "data-selected-object",
    shelfIds.at(-1) ?? "",
  );
  await next.click();
  await expect(canvas).toHaveAttribute("data-selected-object", shelfIds[0]);
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
  const pickedShelf = await visibleShelfPoint(canvas);
  const tapPosition = {
    clientX: pickedShelf.x,
    clientY: pickedShelf.y,
    pointerId: 10,
    pointerType: "touch",
  };

  await canvas.dispatchEvent("pointerdown", tapPosition);
  await canvas.dispatchEvent("pointerup", tapPosition);
  await expect(canvas).toHaveAttribute("data-selected-object", pickedShelf.id);
  await expect(canvas).toHaveAttribute(
    "data-highlighted-object",
    pickedShelf.id,
  );

  const next = page.getByRole("button", { name: "Próximo →" });
  const previous = page.getByRole("button", { name: "← Anterior" });
  await expect(next).toBeVisible();
  await expect(previous).toBeVisible();
  await expect(page.getByRole("combobox")).toHaveCount(0);
  await next.click();
  const nextShelf =
    shelfIds[(shelfIds.indexOf(pickedShelf.id) + 1) % shelfIds.length];
  await expect(canvas).toHaveAttribute("data-selected-object", nextShelf);
  await expect(canvas).toHaveAttribute("data-highlighted-object", nextShelf);
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
  await canvas.dispatchEvent("pointermove", {
    clientX: canvasBox.x + 150,
    clientY: canvasBox.y + 120,
    pointerId: 11,
    pointerType: "touch",
  });
  await canvas.dispatchEvent("pointerup", {
    clientX: canvasBox.x + 150,
    clientY: canvasBox.y + 120,
    pointerId: 11,
    pointerType: "touch",
  });
  await expect
    .poll(() => canvas.getAttribute("data-camera-target-x"))
    .not.toBe(targetBeforePan);
  await expect(canvas).toHaveAttribute("data-selected-object", nextShelf);

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
  await expect(canvas).toHaveAttribute("data-selected-object", nextShelf);
  await expect(
    page.getByRole("navigation", { name: "Navegação principal" }),
  ).toBeVisible();
});

test("Biblioteca preserva a mesma superfície em portrait, landscape e viewport estreito", async ({
  page,
}) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/");
  const canvas = page.locator("canvas[data-three-world-canvas='true']");
  await expect(canvas).toHaveAttribute("data-fixture-status", "ready");

  const initialCanvasBox = await canvas.boundingBox();
  expect(initialCanvasBox?.width).toBeGreaterThan(250);
  await page.getByRole("button", { name: "Próximo →" }).click();
  await expect(canvas).toHaveAttribute("data-selected-object", shelfIds[0]);
  const zoomBeforeOrientation = Number(
    await canvas.getAttribute("data-camera-zoom"),
  );

  await page.setViewportSize({ height: 390, width: 844 });
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toHaveAttribute("data-selected-object", shelfIds[0]);
  expect(Number(await canvas.getAttribute("data-camera-zoom"))).toBeCloseTo(
    zoomBeforeOrientation,
    3,
  );
  expect(
    await page.evaluate(
      "document.documentElement.scrollWidth <= window.innerWidth",
    ),
  ).toBe(true);

  const landscapeCanvasBox = await canvas.boundingBox();
  expect(landscapeCanvasBox?.height).toBeGreaterThan(150);
  if (!landscapeCanvasBox) return;
  const pickedShelf = await visibleShelfPoint(canvas);
  await canvas.dispatchEvent("pointerdown", {
    clientX: pickedShelf.x,
    clientY: pickedShelf.y,
    pointerId: 21,
    pointerType: "touch",
  });
  await canvas.dispatchEvent("pointerup", {
    clientX: pickedShelf.x,
    clientY: pickedShelf.y,
    pointerId: 21,
    pointerType: "touch",
  });
  await expect(canvas).toHaveAttribute("data-selected-object", pickedShelf.id);

  await page.setViewportSize({ height: 844, width: 390 });
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toHaveAttribute("data-selected-object", pickedShelf.id);
  await expect(page.getByRole("button", { name: "← Anterior" })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navegação principal" }),
  ).toBeVisible();

  await page.setViewportSize({ height: 640, width: 320 });
  await expect(canvas).toHaveCount(1);
  expect((await canvas.boundingBox())?.width).toBeGreaterThan(200);
  expect(
    await page.evaluate(
      "document.documentElement.scrollWidth <= window.innerWidth",
    ),
  ).toBe(true);
  expect(browserErrors).toEqual([]);
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
  await expect(canvas).toHaveAttribute("data-selected-object", shelfIds[0]);
  await expect(canvas).toHaveAttribute("data-highlighted-object", shelfIds[0]);

  await canvas.scrollIntoViewIfNeeded();
  const canvasBox = await canvas.boundingBox();
  expect(canvasBox).not.toBeNull();
  if (!canvasBox) return;
  const targetBeforePan = await canvas.getAttribute("data-camera-target-x");
  await page.mouse.move(canvasBox.x + 160, canvasBox.y + 120);
  await page.mouse.down();
  await page.mouse.move(canvasBox.x + 200, canvasBox.y + 120);
  await page.mouse.move(canvasBox.x + 220, canvasBox.y + 120);
  await page.mouse.up();
  await expect
    .poll(() => canvas.getAttribute("data-camera-target-x"))
    .not.toBe(targetBeforePan);

  await page.mouse.move(
    canvasBox.x + canvasBox.width / 2,
    canvasBox.y + canvasBox.height / 2,
  );
  const zoomBeforeWheel = Number(await canvas.getAttribute("data-camera-zoom"));
  await page.mouse.wheel(0, -100);
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-camera-zoom")))
    .toBeGreaterThan(zoomBeforeWheel);
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
