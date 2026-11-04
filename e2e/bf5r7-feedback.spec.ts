import { expect, test } from "./fixtures";

test.use({ hasTouch: true, isMobile: true });

test("R7: touch feedback cancels on scroll and preserves semantic activation", async ({
  page,
  seedBooks,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedBooks(120);
  await page.goto("/colecao");
  const cards = page.locator(".book-card__link");
  await expect(cards).toHaveCount(120);
  expect(await page.evaluate(() => matchMedia("(hover: none)").matches)).toBe(
    true,
  );
  const card = cards.first();
  await card.dispatchEvent("pointerdown", {
    pointerType: "touch",
    isPrimary: true,
    pointerId: 1,
    clientX: 100,
    clientY: 400,
  });
  await expect(card).not.toHaveAttribute("data-tap-active");
  await expect(page).toHaveURL(/\/colecao$/);
  await card.dispatchEvent("pointermove", {
    pointerType: "touch",
    pointerId: 1,
    clientX: 100,
    clientY: 450,
  });
  await expect(card).not.toHaveAttribute("data-tap-active");
  await card.dispatchEvent("pointercancel", { pointerId: 1 });
  await card.click();
  await expect(page).toHaveURL(/\/registros\//);
  await expect(
    page.getByRole("heading", { name: "Livro descartável 120" }),
  ).toBeVisible();
});
