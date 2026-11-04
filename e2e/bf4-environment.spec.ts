import { fillWorkoutPlan, expect, openWorldTools, test } from "./fixtures";
import { OrthographicCamera, Vector3 } from "three";
import { LIBRARY_ROOMS } from "../src/features/library/libraryBuildingGeometry";
import { CameraNavigation } from "../src/features/library/three/CameraNavigation";

test("BF-4D: ambiente integrado em paisagem/retrato, zoom, pan e seleção", async ({
  page,
  createBook,
}, testInfo) => {
  await createBook({ title: "Atlas fictício BF4", author: "Autoria fictícia" });
  for (const type of [
    "Filme",
    "Série",
    "Estudo",
    "Atividade física",
    "Trabalho",
  ]) {
    await page.goto("/novo-registro");
    await page.getByRole("button", { name: new RegExp(type, "u") }).click();
    await page
      .getByLabel(type === "Atividade física" ? "Nome do treino" : "Título")
      .fill(`${type} fictício BF4`);
    if (type === "Atividade física") await fillWorkoutPlan(page);
    await page.getByRole("button", { name: "Salvar registro" }).click();
    await expect(
      page.getByRole("heading", { name: `${type} fictício BF4` }),
    ).toBeVisible();
  }
  await page.goto("/");
  const canvas = page.locator("canvas[data-three-world-canvas='true']");
  await expect(canvas).toHaveAttribute("data-fixture-status", "ready");
  await expect(canvas).toHaveAttribute("data-selectable-objects", "23");
  await testInfo.attach("bf4d-renderer-metrics", {
    body: JSON.stringify(
      await canvas.evaluate((element) => ({ ...element.dataset })),
      null,
      2,
    ),
    contentType: "application/json",
  });
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(canvas).toHaveAttribute("data-runtime-state", "running");
    await canvas.screenshot({
      path: testInfo.outputPath(`ambiente-${viewport.width}.png`),
    });
  }
  await openWorldTools(page);
  await page.locator(".library-index > summary").click();
  await page
    .getByRole("button", {
      name: "Selecionar no ambiente: Livro Atlas fictício BF4",
      exact: true,
    })
    .click();
  await expect(canvas).toHaveAttribute(
    "data-selected-object",
    /^reading-book:/u,
  );
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) throw new Error("Canvas ausente");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.wheel(0, -500);
  await expect(canvas).not.toHaveAttribute("data-camera-zoom", "0.700");
  const targetBeforePan = await canvas.getAttribute("data-camera-target-x");
  await page.mouse.down();
  await page.mouse.move(x + 20, y + 20);
  await page.mouse.move(x + 65, y + 45);
  await page.mouse.up();
  await expect(canvas).not.toHaveAttribute(
    "data-camera-target-x",
    targetBeforePan ?? "",
  );
  await expect(canvas).toHaveAttribute(
    "data-selected-object",
    /^reading-book:/u,
  );
  await canvas.screenshot({
    path: testInfo.outputPath("exploracao-selecao.png"),
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(canvas).toHaveAttribute(
    "data-selected-object",
    /^reading-book:/u,
  );
});

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`BF-4D: coleção cheia explora cinco cômodos e quatro conexões em ${viewport.width}px`, async ({
    page,
    seedBooks,
  }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const canvas = page.locator("canvas[data-three-world-canvas='true']");
    await expect(canvas).toHaveAttribute("data-fixture-status", "ready");
    await testInfo.attach("bf4d-empty-metrics", {
      body: JSON.stringify(await canvas.evaluate((e) => ({ ...e.dataset }))),
      contentType: "application/json",
    });
    await seedBooks(70);
    for (const [type, count] of [
      ["Filme", 2],
      ["Série", 2],
      ["Estudo", 3],
      ["Atividade física", 3],
      ["Trabalho", 3],
    ] as const) {
      for (let index = 1; index <= count; index++) {
        await page.goto("/novo-registro");
        await page.getByRole("button", { name: new RegExp(type, "u") }).click();
        await page
          .getByLabel("Título")
          .fill(`${type} espacial fictício ${index}`);
        await page.getByRole("button", { name: "Salvar registro" }).click();
        await expect(
          page.getByRole("heading", {
            name: `${type} espacial fictício ${index}`,
          }),
        ).toBeVisible();
      }
    }
    await page.goto("/");
    await expect(canvas).toHaveAttribute("data-selectable-objects", "100");
    await openWorldTools(page);
    await page.locator(".library-index > summary").click();
    await expect(
      page.getByRole("button", { name: /Selecionar no ambiente:/u }),
    ).toHaveCount(83);
    await testInfo.attach("bf4d-full-metrics", {
      body: JSON.stringify(await canvas.evaluate((e) => ({ ...e.dataset }))),
      contentType: "application/json",
    });
    // Retain a real React selection while navigating, without remounting the canvas.
    await page
      .getByRole("button", {
        name: "Selecionar no ambiente: Livro Livro descartável 070",
        exact: true,
      })
      .click();
    const selected = await canvas.getAttribute("data-selected-object");
    expect(selected).toBeTruthy();
    {
      await page.setViewportSize(viewport);
      await canvas.scrollIntoViewIfNeeded();
      const box = await canvas.boundingBox();
      if (!box) throw new Error("Canvas ausente");
      const hostBox = await page.locator(".world-host").boundingBox();
      if (!hostBox) throw new Error("Host ausente");
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.wheel(0, -5000);
      await expect(canvas).toHaveAttribute("data-camera-zoom", "2.200");
      // Return through the hall between wings: all four real connections are traversed.
      for (const room of [
        LIBRARY_ROOMS[0],
        LIBRARY_ROOMS[1],
        LIBRARY_ROOMS[0],
        LIBRARY_ROOMS[2],
        LIBRARY_ROOMS[0],
        LIBRARY_ROOMS[3],
        LIBRARY_ROOMS[0],
        LIBRARY_ROOMS[4],
      ]) {
        const x = (room.minX + room.maxX) / 2;
        const z = (room.minZ + room.maxZ) / 2;
        const current = await canvas.evaluate((element) => ({
          x: Number(element.dataset.cameraTargetX),
          z: Number(element.dataset.cameraTargetZ),
        }));
        const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
        const navigation = new CameraNavigation(camera, 2.2, LIBRARY_ROOMS);
        // Match the runtime viewport rounded from the host CSS dimensions.
        navigation.setViewport(
          Math.round(hostBox.width),
          Math.round(hostBox.height),
        );
        camera.position.x += current.x;
        camera.position.z += current.z;
        camera.updateMatrixWorld(true);
        const projected = new Vector3(x, 1.1, z).project(camera);
        const afterPan = await canvas.evaluate(
          (element, { dx, dy }) => {
            const bounds = element.getBoundingClientRect();
            const x = bounds.left + bounds.width / 2;
            const y = bounds.top + bounds.height / 2;
            // Same pan slop and pointer event path as the shell regression.
            for (const [type, clientX, clientY] of [
              ["pointerdown", x, y],
              ["pointermove", x + 10, y],
              ["pointermove", x + 10 + dx, y + dy],
              ["pointerup", x + 10 + dx, y + dy],
            ] as const)
              element.dispatchEvent(
                new PointerEvent(type, {
                  bubbles: true,
                  button: 0,
                  buttons: type === "pointerup" ? 0 : 1,
                  pointerId: 31,
                  pointerType: "touch",
                  clientX,
                  clientY,
                }),
              );
            // These diagnostics are synchronous consequences of the dispatched gesture.
            return {
              x: Number(element.dataset.cameraTargetX),
              z: Number(element.dataset.cameraTargetZ),
              selected: element.dataset.selectedObject,
              highlighted: element.dataset.highlightedObject,
            };
          },
          {
            dx: (-projected.x * box.width) / 2,
            dy: (projected.y * box.height) / 2,
          },
        );
        expect(afterPan.x).toBeCloseTo(x, 2);
        expect(afterPan.z).toBeCloseTo(z, 2);
        expect(afterPan.selected).toBe(selected);
        expect(afterPan.highlighted).toBe(selected);
        if (room.id !== "room-a")
          await canvas.screenshot({
            path: testInfo.outputPath(`${room.id}-${viewport.width}.png`),
          });
      }
    }
  });
}
