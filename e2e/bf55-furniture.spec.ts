import { expect, test } from "@playwright/test";
import { OrthographicCamera, Vector3 } from "three";
import { CameraNavigation } from "../src/features/library/three/CameraNavigation";
import { LIBRARY_ROOMS } from "../src/features/library/libraryBuildingGeometry";
import {
  LIBRARY_FURNISHING,
  furnitureLamp,
} from "../src/features/library/three/libraryFurnishingLayout";

test("BF-5.5E: mobília renderiza, luminária mantém picking e câmera atravessa dia/noite e rotação", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.setFixedTime(new Date(2026, 10, 5, 12));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const canvas = page.locator("canvas[data-three-world-canvas='true']");
  await expect(canvas).toHaveAttribute("data-runtime-state", "running");
  await expect(canvas).toHaveAttribute("data-fixture-status", "ready");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas ausente");
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
  const navigation = new CameraNavigation(
    camera,
    Number(await canvas.getAttribute("data-camera-zoom")),
    LIBRARY_ROOMS,
    10,
  );
  navigation.setViewport(Math.round(box.width), Math.round(box.height));
  camera.updateMatrixWorld();
  const fixture = LIBRARY_FURNISHING.find((p) => p.id === "bf4-prop:0")!;
  const anchor = furnitureLamp(fixture)!.world;
  const point = new Vector3(anchor.x, anchor.y, anchor.z).project(camera);
  await page.mouse.click(
    box.x + ((point.x + 1) * box.width) / 2,
    box.y + ((1 - point.y) * box.height) / 2,
  );
  await expect(canvas).toHaveAttribute("data-selected-object", "living:lamp");
  await expect(canvas).toHaveAttribute(
    "data-highlighted-object",
    "living:lamp",
  );
  await canvas.screenshot({ path: info.outputPath("furniture-day.png") });
  await page.clock.setFixedTime(new Date(2026, 10, 5, 22));
  // Reload exercises opening already at night, without relying on NPC arrival.
  await page.reload();
  await expect(canvas).toHaveAttribute("data-fixture-status", "ready");
  await canvas.screenshot({ path: info.outputPath("furniture-night.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(canvas).toHaveAttribute("data-runtime-state", "running");
  await canvas.screenshot({ path: info.outputPath("furniture-portrait.png") });
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(canvas).toHaveAttribute("data-runtime-state", "running");
  await expect(canvas).toHaveCount(1);
  expect(errors).toEqual([]);
});
