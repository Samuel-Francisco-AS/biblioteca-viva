import { expect, test } from "./fixtures";

test("BF-5R3: a coleção usa fichas de acervo e detalhes ergonômicos", async ({
  page,
  seedBooks,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedBooks(2);
  await page.goto("/colecao");

  const tiles = page.locator(".record-tile");
  await expect(tiles.first()).toBeVisible();
  await expect(tiles.first().locator(".record-tile__emblem")).toBeVisible();
  await expect(page.locator(".realm-intro[data-realm='acervo']")).toBeVisible();

  const noHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= innerWidth,
  );
  expect(noHorizontalOverflow).toBe(true);

  await page
    .getByRole("link", { name: /^Abrir detalhes de /u })
    .first()
    .click();
  await expect(page.locator(".entry-detail-hero")).toBeVisible();
  await expect(page.locator(".entry-detail-sections")).toBeVisible();

  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator(".entry-detail-hero")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
