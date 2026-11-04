import { OrthographicCamera, Vector3 } from "three";
import { CameraNavigation } from "../src/features/library/three/CameraNavigation";
import { LIBRARY_ROOMS } from "../src/features/library/libraryBuildingGeometry";
import { expect, openWorldTools, test } from "./fixtures";
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
    await openWorldTools(page);
    const panel = page.getByLabel("Habitantes", { exact: true });
    await panel.locator(":scope > summary").click();
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
      await panel.locator(":scope > summary").click();
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

for (const actor of INHABITANTS)
  test(`BF-4F2 ${actor.key}: directed actions in the five-room world`, async ({
    page,
  }) => {
    await page.goto("/");
    const canvas = page.locator("canvas[data-three-world-canvas]");
    await expect(canvas).toHaveAttribute("data-inhabitants-ready", "4");
    await openWorldTools(page);
    const panel = page.getByLabel("Habitantes", { exact: true });
    await panel.locator(":scope > summary").click();
    {
      await panel
        .getByRole("button", { name: actor.label, exact: true })
        .click();
      for (const label of [
        "Caminhar",
        "Girar",
        "Cumprimentar",
        "Atividade",
        "Habilidade",
      ]) {
        const button = panel.getByRole("button", { name: label, exact: true });
        await button.focus();
        await button.press("Enter");
        await expect(panel.getByRole("status")).toContainText(
          "Demonstração finita",
        );
        await expect(canvas).toHaveAttribute("data-selected-object", actor.id);
      }
      await canvas.screenshot({
        path: `docs/evidence/bf4f2/world-${actor.key}.png`,
      });
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    const activity = panel.getByRole("button", {
      name: "Atividade",
      exact: true,
    });
    await activity.focus();
    await activity.press("Enter");
    await expect(panel.getByRole("status")).toContainText(
      "Movimento reduzido ativo",
    );
  });

test("BF-4F3 spontaneous life and honest reduced-motion semantics", async ({
  page,
}) => {
  await page.goto("/");
  const canvas = page.locator("canvas[data-three-world-canvas]");
  await expect(canvas).toHaveAttribute("data-inhabitants-ready", "4");
  await openWorldTools(page);
  const panel = page.getByLabel("Habitantes", { exact: true });
  await panel.locator(":scope > summary").focus();
  await panel.locator(":scope > summary").press("Enter");
  const life = panel.getByRole("region", {
    name: "Convivência dos habitantes",
  });
  await expect(life).toContainText("escolhem suas atividades");
  await expect(life).toContainText("Em deslocamento real");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(life).toContainText("percursos suspensos, sem teletransporte");
  await expect(life).not.toContainText("Em deslocamento real");
  await expect(canvas).toHaveAttribute("data-runtime-state", "running");
});
