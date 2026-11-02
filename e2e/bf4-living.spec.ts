import { OrthographicCamera, Vector3 } from "three";
import { CameraNavigation } from "../src/features/library/three/CameraNavigation";
import { LIBRARY_ROOMS } from "../src/features/library/libraryBuildingGeometry";
import { expect, test } from "./fixtures";
for (const fallback of [false, true]) {
  test(`BF-4E: segredo completo ${fallback ? "sem WebGL" : "no mundo"}`, async ({
    page,
  }) => {
    if (fallback)
      await page.addInitScript(() => {
        HTMLCanvasElement.prototype.getContext = () => null;
      });
    await page.goto("/");
    const controls = page.getByRole("region", { name: "Objetos vivos" });
    await expect(controls).toBeVisible();
    await controls.getByText("Cômodo A", { exact: true }).click();
    await controls
      .getByRole("button", {
        name: "Acender / apagar — Luminária do pergaminho",
        exact: true,
      })
      .click();
    await expect(
      controls.getByText("Segredo do Pergaminho: 1/4"),
    ).toBeVisible();
    await controls
      .getByRole("button", {
        name: "Examinar — Pergaminho da luz",
        exact: true,
      })
      .click();
    await expect(
      controls.getByText("Segredo do Pergaminho: 2/4"),
    ).toBeVisible();
    await controls.getByText("Cômodo C", { exact: true }).click();
    await controls
      .getByRole("button", {
        name: "Abrir / fechar livro — Livro da estrela",
        exact: true,
      })
      .click();
    await expect(
      controls.getByText("Segredo do Pergaminho: 3/4"),
    ).toBeVisible();
    await controls.getByText("Cômodo E", { exact: true }).click();
    await controls
      .getByRole("button", {
        name: "Examinar — Armário da memória",
        exact: true,
      })
      .click();
    await expect(
      controls.getByText("Segredo do Pergaminho: 4/4"),
    ).toBeVisible();
    for (const atmosphere of ["tranquila", "noturna", "encantada"]) {
      await controls
        .getByRole("button", { name: atmosphere, exact: true })
        .click();
      await expect(
        controls.getByRole("button", { name: atmosphere, exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(controls).toBeVisible();
    await page.reload();
    await expect(
      controls.getByText("Segredo do Pergaminho: 0/4"),
    ).toBeVisible();
  });
}

test("BF-4E: tap ambiental abre contexto sem selecionar registro", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const canvas = page.locator("canvas[data-three-world-canvas='true']");
  await expect(canvas).toHaveAttribute("data-runtime-state", "running");
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas ausente");
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  const navigation = new CameraNavigation(camera, 0.7, LIBRARY_ROOMS);
  navigation.setViewport(Math.round(box.width), Math.round(box.height));
  camera.updateMatrixWorld();
  const point = new Vector3(-4.5, 1.43, -2).project(camera);
  await page.mouse.click(
    box.x + ((point.x + 1) * box.width) / 2,
    box.y + ((1 - point.y) * box.height) / 2,
  );
  await expect(canvas).toHaveAttribute("data-selected-object", "living:lamp");
  await expect(canvas).toHaveAttribute(
    "data-highlighted-object",
    "living:lamp",
  );
  await expect(
    page.getByRole("button", {
      name: "Acender / apagar — Luminária do pergaminho",
      exact: true,
    }),
  ).toBeVisible();
});
