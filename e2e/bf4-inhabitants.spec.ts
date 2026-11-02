import { OrthographicCamera, Vector3 } from "three";
import { CameraNavigation } from "../src/features/library/three/CameraNavigation";
import { LIBRARY_ROOMS } from "../src/features/library/libraryBuildingGeometry";
import { expect, test } from "./fixtures";
import { INHABITANTS } from "../src/features/library/inhabitants";
for (const fallback of [false, true]) {
  test(`BF-4F1 four inhabitants ${fallback ? "fallback" : "world"}`, async ({
    page,
  }) => {
    if (fallback)
      await page.addInitScript(() => {
        HTMLCanvasElement.prototype.getContext = () => null;
      });
    await page.goto("/");
    const panel = page.getByLabel("Habitantes", { exact: true });
    await panel.locator("summary").click();
    for (const actor of INHABITANTS) {
      const button = panel.getByRole("button", {
        name: actor.label,
        exact: true,
      });
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "true");
      if (!fallback)
        await expect(
          page.locator("canvas[data-three-world-canvas]"),
        ).toHaveAttribute("data-selected-object", actor.id);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(
      panel.getByRole("button", { name: "Lua", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    if (!fallback) {
      await panel.locator("summary").click();
      await page
        .locator("canvas[data-three-world-canvas]")
        .screenshot({ path: "test-results/bf4f1-world.png" });
    }
  });
}

test("BF-4F1 canvas selects all four loaded models", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const canvas = page.locator("canvas[data-three-world-canvas]");
  await expect(canvas).toHaveAttribute("data-inhabitants-ready", "4");
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas ausente");
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  const navigation = new CameraNavigation(camera, 0.7, LIBRARY_ROOMS);
  navigation.setViewport(Math.round(box.width), Math.round(box.height));
  camera.updateMatrixWorld();
  for (const actor of INHABITANTS) {
    const point = new Vector3(actor.x, actor.height * 0.6, actor.z).project(
      camera,
    );
    await page.mouse.click(
      box.x + ((point.x + 1) * box.width) / 2,
      box.y + ((1 - point.y) * box.height) / 2,
    );
    await expect(canvas).toHaveAttribute("data-selected-object", actor.id);
    await expect(canvas).toHaveAttribute("data-highlighted-object", actor.id);
  }
});
