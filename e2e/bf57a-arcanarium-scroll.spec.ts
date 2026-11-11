import { expect, test } from "@playwright/test";

test("BF-5.7A: Arcanarium uses native scrolling without an oversized transformed layer", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/arcanario/acervo");

  const heading = page.getByRole("heading", { name: "Acervo global" });
  await expect(heading).toBeVisible();

  const room = page.locator(
    '.app-shell[data-route="arcanario"] .app-content > .arcanarium',
  );
  await expect(room).toHaveCSS("animation-name", "none");
  await expect(room).toHaveCSS("transform", "none");

  const compact = room.locator(".arcana-grid .arcana-card--compact");
  if ((await compact.count()) > 0) {
    await expect(compact.first()).toHaveCSS("perspective", "none");
    await expect(compact.first().locator(".arcana-face--back")).toHaveCSS(
      "display",
      "none",
    );
  }

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(heading).toBeVisible();
});
