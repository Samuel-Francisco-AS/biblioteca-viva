import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";
test("F refinement: canonical lunar portal opens the hall and returns to the same paused/resumed world", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await page.goto("/");
  const canvas = page.locator("canvas");
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toHaveAttribute("data-active-frame-loops", "1");
  await canvas.evaluate((node) =>
    node.setAttribute("data-refinement-resident", "same"),
  );
  await mkdir("docs/audits/evidence/bf56f-refinement", { recursive: true });
  await page.screenshot({
    path: "docs/audits/evidence/bf56f-refinement/lua-no-mundo.png",
  });
  await page
    .getByRole("button", { name: "Abrir ferramentas de exploração acessível" })
    .click();
  await page
    .getByText("Explorar · habitantes e objetos", { exact: true })
    .click();
  await page.getByText("Selecionar elementos", { exact: true }).click();
  // Direct semantic portal access does not rely on mutable catalogue order.
  await page.getByRole("button", { name: "Abrir Salão de Duelos" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/arcanario\/duelos$/);
  await expect(canvas).toBeHidden();
  await expect(canvas).toHaveAttribute("data-active-frame-loops", "0");
  await page.getByRole("link", { name: "Biblioteca", exact: true }).click();
  await expect(
    page.locator('canvas[data-refinement-resident="same"]'),
  ).toBeVisible();
  await expect(canvas).toHaveAttribute("data-active-frame-loops", "1");
});
