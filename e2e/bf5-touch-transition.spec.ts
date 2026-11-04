import { expect, test } from "./fixtures";

test("BF-5R2: canvas intact, route entrance without blur and tactile response", async ({
  page,
  seedBooks,
}) => {
  await seedBooks(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");

  const scene = page.locator(".world-host");
  await expect(scene).toBeVisible();

  const geometry = await scene.boundingBox();
  expect(geometry).not.toBeNull();
  expect(geometry!.width).toBeGreaterThanOrEqual(389);
  expect(geometry!.height).toBeGreaterThanOrEqual(843);

  const shade = page.locator(".library-scene-vignette");
  const shadeHeight = await shade.evaluate(
    (element) => element.getBoundingClientRect().height,
  );
  expect(shadeHeight).toBeLessThan(300);

  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Coleção" })
    .click();

  const collection = page.locator(".app-content > section").first();
  await expect(collection).toBeVisible();
  const motion = await collection.evaluate((element) => {
    const style = getComputedStyle(element);
    return { name: style.animationName, filter: style.filter };
  });
  expect(motion.name).toContain("sanctuary-arrive");
  expect(motion.filter).toBe("none");

  const search = page.getByRole("button", { name: "Busca", exact: true });
  const pressed = await search.evaluate((element) => {
    element.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        pointerType: "touch",
      }),
    );
    return element.getAttribute("data-tap-active");
  });
  expect(pressed).toBe("true");

  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(horizontalOverflow).toBe(false);
});
