import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";
test("BF-5.7A: lunar gate opens Arcanarium Portal and preserves the resident world", async ({
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
  // The test exercises semantic navigation, not Canvas hit-testing. The
  // continuously animated WebGL surface can interfere with Playwright's
  // pointer-action stability check, although a real keyboard can activate
  // these native controls. Still require visible, enabled controls and a
  // visible expanded panel before each keyboard activation.
  const tools = page.getByRole("button", {
    name: "Abrir ferramentas de exploração acessível",
  });
  await expect(tools).toBeVisible();
  await expect(tools).toBeInViewport();
  await expect(tools).toBeEnabled();
  await tools.focus();
  await page.keyboard.press("Enter");
  await expect(tools).toHaveAttribute("aria-expanded", "true");

  const worldDetails = page.locator("details.world-explore");
  await expect(worldDetails).toBeVisible();
  const worldSummary = worldDetails.locator("summary");
  await expect(worldSummary).toBeVisible();
  await worldSummary.focus();
  await page.keyboard.press("Enter");
  await expect(worldDetails).toHaveAttribute("open", "");

  const selectionDetails = worldDetails.locator("details.world-semantic");
  const selectionSummary = selectionDetails.locator("summary");
  await expect(selectionSummary).toBeVisible();
  await selectionSummary.focus();
  await page.keyboard.press("Enter");
  await expect(selectionDetails).toHaveAttribute("open", "");

  // The canonical object has a stable ID, independent of catalogue order.
  const lunarPortal = page.getByRole("button", {
    name: "Abrir Portal do Arcanário",
  });
  await expect(lunarPortal).toBeVisible();
  await expect(lunarPortal).toBeEnabled();
  await lunarPortal.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/arcanario$/);
  await expect(page.getByRole("link", { name: "Duelo Arcano" })).toBeVisible();
  await expect(canvas).toBeHidden();
  await expect(canvas).toHaveAttribute("data-active-frame-loops", "0");
  await page.getByRole("link", { name: "Biblioteca", exact: true }).click();
  await expect(
    page.locator('canvas[data-refinement-resident="same"]'),
  ).toBeVisible();
  await expect(canvas).toHaveAttribute("data-active-frame-loops", "1");
});
