import { expect, test } from "./fixtures";

async function placedStructureCount(page: import("@playwright/test").Page) {
  return page
    .locator(".construction-alternative button")
    .evaluateAll((buttons) => buttons.length);
}

async function waitForRenderFrame(page: import("@playwright/test").Page) {
  await page.evaluate(
    "new Promise((resolve) => requestAnimationFrame(resolve))",
  );
}

test("editor estrutural persiste gesto de canvas e mantém o retorno ao modo normal", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1280, height: 800 });

  const canvas = page.locator(".library-visual-host canvas");
  await expect(canvas).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Construir" })).toBeVisible();

  await page.getByRole("button", { name: "Construir" }).click();
  await expect(page.getByLabel("Modo Construção")).toBeVisible();
  await page.getByRole("button", { name: "Estruturas" }).click();
  await expect(
    page.getByRole("dialog", { name: /Peças estruturais/u }),
  ).toBeVisible();

  const horizontalWall = page
    .locator(".construction-item")
    .filter({ hasText: "Parede horizontal · 1 célula · horizontal" })
    .first();
  await expect(
    horizontalWall.getByRole("button", { name: "Colocar" }),
  ).toBeEnabled();
  const beforePlacement = await placedStructureCount(page);
  await horizontalWall.getByRole("button", { name: "Colocar" }).click();

  // The canvas centre is derived from its bounding box. The initial camera
  // deliberately frames the connected floor, so this is a valid inner edge.
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas da Biblioteca indisponível.");
  await canvas.click({
    position: { x: box.width / 2, y: box.height / 2 },
  });
  await expect.poll(() => placedStructureCount(page)).toBe(beforePlacement + 1);
  await expect(page.getByText("Peça colocada.")).toBeVisible();
  await waitForRenderFrame(page);

  // The React alternative chooses the confirmed projection, then the canvas
  // performs the move gesture. No state is injected into the application.
  await page.locator(".construction-alternative button").last().click();
  await expect(page.getByLabel("Peça selecionada")).toBeVisible();
  await page.getByRole("button", { name: "Mover" }).click();
  await canvas.click({
    position: { x: box.width / 2 + 64, y: box.height / 2 },
  });
  await expect(page.getByText("Peça movida.")).toBeVisible();
  await waitForRenderFrame(page);

  await page.getByRole("button", { name: "Girar" }).click();
  await expect(page.getByText("Orientação atualizada.")).toBeVisible();
  await waitForRenderFrame(page);

  await page.getByRole("button", { name: "Piso" }).click();
  await page.getByRole("button", { name: "Adicionar piso" }).click();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByText("Célula focal: 2, 4.")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Piso atualizado.")).toBeVisible();
  await waitForRenderFrame(page);
  await page.getByRole("button", { name: "Remover piso" }).click();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Piso atualizado.")).toBeVisible();
  await waitForRenderFrame(page);

  await page.locator(".construction-alternative button").last().click();
  await page.getByRole("button", { name: "Guardar" }).click();
  await page.getByRole("button", { name: "Guardar peça" }).click();
  await expect(page.getByText("Peça guardada no inventário.")).toBeVisible();
  await expect.poll(() => placedStructureCount(page)).toBe(beforePlacement);

  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page.getByRole("button", { name: "Construir" })).toBeVisible();
  await expect(page.locator(".library-visual-host canvas")).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole("button", { name: "Construir" })).toBeVisible();
  await expect(page.locator(".library-visual-host canvas")).toHaveCount(1);
});

test("uma sessão elegível desbloqueia peças uma única vez e abre Construção", async ({
  page,
  createBook,
}) => {
  test.setTimeout(60_000);
  await createBook({ title: "Sessão estrutural fictícia" });

  await page.getByLabel("Duração em minutos").fill("1");
  await page.getByRole("button", { name: "Registrar sessão" }).click();
  const unlock = page.getByRole("status").filter({
    has: page.getByRole("heading", { name: "Novas peças desbloqueadas" }),
  });
  await expect(unlock).toContainText("Piso de madeira: 12");
  await unlock.getByRole("button", { name: "Abrir construção" }).click();

  await expect(page.getByLabel("Modo Construção")).toBeVisible();
  await expect(
    page.getByRole("dialog", { name: "Peças estruturais" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Piso" }).click();
  await expect(page.getByText("36 unidades disponíveis.")).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Novas peças desbloqueadas" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Construir" }).click();
  await page.getByRole("button", { name: "Piso" }).click();
  await expect(page.getByText("36 unidades disponíveis.")).toBeVisible();
});
