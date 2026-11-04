import { expect, test } from "./fixtures";

test("BF-5R6: o códice oferece capítulos e controles distintos no retrato", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/colecao");
  await expect(page.locator(".realm-intro[data-realm='acervo']")).toBeVisible();
  await expect(page.locator(".realm-intro__seal")).toBeVisible();
  await expect(page.locator(".primary-dock__engraving")).toBeVisible();
  const css = await page.locator(".primary-dock").evaluate((element) => {
    const style = getComputedStyle(element);
    return { backdrop: style.backdropFilter, position: style.position };
  });
  expect(css.backdrop).toBe("none");
  expect(css.position).toBe("fixed");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);

  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Arquivo", exact: true })
    .click();
  await expect(
    page.locator(".realm-intro[data-realm='arquivo']"),
  ).toBeVisible();
});
