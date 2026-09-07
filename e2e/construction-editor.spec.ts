import { mkdir } from "node:fs/promises";
import path from "node:path";

import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";

const captureDirectory = path.resolve(
  "art-guides/w3-a-r4-ux-proposal/captures/construction-rework",
);

async function capture(page: Page, name: string): Promise<void> {
  await page.screenshot({
    animations: "disabled",
    path: path.join(captureDirectory, name),
  });
}

async function canvasFrame(page: Page): Promise<Buffer> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
  );
  return page.locator(".library-visual-host canvas").screenshot({
    animations: "disabled",
  });
}

async function placedPieceCount(page: Page): Promise<number> {
  await page.getByRole("button", { name: "Peças", exact: true }).click();
  const sheet = page.getByRole("dialog", { name: "Peças colocadas" });
  await expect(sheet).toBeVisible();
  const count = await sheet.locator("li").count();
  await page.getByRole("button", { name: "Fechar peças colocadas" }).click();
  return count;
}

test("smoke 1 — Construção expande, atualiza o canvas e persiste", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await mkdir(captureDirectory, { recursive: true });
  await page.setViewportSize({ height: 640, width: 320 });

  const canvas = page.locator(".library-visual-host canvas");
  await expect(canvas).toHaveCount(1);
  await page.getByRole("button", { name: "Construir" }).click();
  await expect(page.getByLabel("Modo Construção")).toBeVisible();
  await expect(page.getByText("Peças colocadas")).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "Navegação principal" }),
  ).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      ),
    )
    .toBeLessThanOrEqual(1);
  await capture(page, "explore-320x640.png");

  await page.getByRole("button", { name: "Estruturas" }).click();
  const structures = page.getByRole("dialog", { name: "Estruturas" });
  await expect(structures).toBeVisible();
  await expect(structures).toHaveCSS("max-height", "320px");
  await capture(page, "structures-sheet-320x640.png");
  await page.getByRole("button", { name: "Fechar estruturas" }).click();

  const beforeFloor = await canvasFrame(page);
  await page.getByRole("button", { name: "Piso", exact: true }).click();
  await page.getByRole("button", { name: "Adicionar piso" }).click();
  // Célula (15,4): imediatamente à direita da planta canônica 12×10.
  await canvas.click({ position: { x: 305, y: 218 } });
  await expect(page.getByRole("button", { name: "Confirmar" })).toBeEnabled();
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page.getByText("Piso adicionado.")).toBeVisible();
  const afterFloor = await canvasFrame(page);
  expect(Buffer.compare(beforeFloor, afterFloor)).not.toBe(0);

  const countBeforePlacement = await placedPieceCount(page);
  await page.getByRole("button", { name: "Estruturas" }).click();
  const shortWall = page
    .locator(".construction-palette__item")
    .filter({ hasText: "Parede curta" })
    .first();
  await expect(shortWall).toBeEnabled();
  await shortWall.click();
  // Âncora (15,5): borda inferior do novo piso externo.
  await canvas.click({ position: { x: 298, y: 229 } });
  await expect(page.getByRole("button", { name: "Confirmar" })).toBeEnabled();
  const beforePlacement = await canvasFrame(page);
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page.getByText("Peça colocada.")).toBeVisible();
  const afterPlacement = await canvasFrame(page);
  expect(Buffer.compare(beforePlacement, afterPlacement)).not.toBe(0);

  await page.getByRole("button", { name: "Peças", exact: true }).click();
  const pieces = page.getByRole("dialog", { name: "Peças colocadas" });
  await expect(pieces.locator("li")).toHaveCount(countBeforePlacement + 1);
  await pieces.locator("li").last().getByRole("button").click();
  await expect(
    page.getByRole("toolbar", { name: "Peça selecionada" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mover", exact: true }).click();
  await capture(page, "moving-320x640.png");
  const beforeMove = await canvasFrame(page);
  // Âncora (15,4): borda superior do mesmo piso externo.
  await canvas.click({ position: { x: 298, y: 206 } });
  await expect(page.getByRole("button", { name: "Confirmar" })).toBeEnabled();
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page.getByText("Peça movida.")).toBeVisible();
  const afterMove = await canvasFrame(page);
  expect(Buffer.compare(beforeMove, afterMove)).not.toBe(0);

  await page.getByRole("button", { name: "Fechar" }).click();
  await page.setViewportSize({ height: 800, width: 360 });
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas da Biblioteca indisponível.");
  await page.mouse.move(box.x + 320, box.y + 400);
  await page.mouse.down();
  await page.mouse.move(box.x + 175, box.y + 400, { steps: 8 });
  await page.mouse.up();
  await capture(page, "expanded-outside-360x800.png");

  await page.reload();
  await expect(page.getByRole("button", { name: "Construir" })).toBeVisible();
  await page.getByRole("button", { name: "Construir" }).click();
  await expect(page.getByLabel("Modo Construção")).toBeVisible();
  await page.getByRole("button", { name: "Peças", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Peças colocadas" }).locator("li"),
  ).toHaveCount(countBeforePlacement + 1);
});

test("smoke 2 — cinco destinos e retorno da Construção continuam íntegros", async ({
  page,
}) => {
  await page.getByRole("link", { name: "Biblioteca", exact: true }).click();
  await expect(page.locator(".library-visual-host canvas")).toHaveCount(1);
  await page.getByRole("link", { name: "Coleção", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Seu primeiro registro começa aqui" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Arquivo", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Arquivo de anotações" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Resumo e estatísticas", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Estatísticas" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Ajustes", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Experiência" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Biblioteca", exact: true }).click();
  await expect(page.locator(".library-visual-host canvas")).toHaveCount(1);
  await page.getByRole("button", { name: "Construir" }).click();
  await expect(page.getByLabel("Modo Construção")).toBeVisible();
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(
    page.getByRole("heading", { name: "Sua Biblioteca Viva" }),
  ).toBeVisible();
  await expect(page.locator(".library-visual-host canvas")).toHaveCount(1);
});
