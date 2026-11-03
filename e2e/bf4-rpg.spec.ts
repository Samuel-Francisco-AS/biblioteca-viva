import { OrthographicCamera, Vector3 } from "three";
import { CameraNavigation } from "../src/features/library/three/CameraNavigation";
import { LIBRARY_ROOMS } from "../src/features/library/libraryBuildingGeometry";
import { INHABITANTS } from "../src/features/library/inhabitants";
import { expect, test } from "./fixtures";

for (const fallback of [false, true]) {
  test(`BF-4F4 RPG choices, objective, resume and conclusion ${fallback ? "without WebGL" : "from canvas"}`, async ({
    page,
    seedBooks,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    if (fallback)
      await page.addInitScript(() => {
        HTMLCanvasElement.prototype.getContext = () => null;
      });
    await seedBooks(1);
    await page.goto("/");
    const readRecords = () =>
      page.evaluate(
        () =>
          new Promise<string>((resolve, reject) => {
            const request = indexedDB.open("biblioteca-viva");
            request.onerror = () => reject(new Error("Fixture indisponível"));
            request.onsuccess = () => {
              const db = request.result;
              const read = db
                .transaction("libraryEntries", "readonly")
                .objectStore("libraryEntries")
                .getAll();
              read.onsuccess = () => {
                const records: unknown = read.result;
                db.close();
                resolve(JSON.stringify(records));
              };
              read.onerror = () => {
                db.close();
                reject(new Error("Leitura da fixture falhou"));
              };
            };
          }),
      );
    const recordsBefore = await readRecords();
    if (fallback) {
      await expect(
        page.getByRole("heading", {
          name: "O ambiente 3D não pôde ser iniciado",
        }),
      ).toBeVisible();
      const people = page.getByLabel("Habitantes", { exact: true });
      await people.locator(":scope > summary").click();
      await people.getByRole("button", { name: "Samael", exact: true }).click();
    } else {
      const canvas = page.locator("canvas[data-three-world-canvas]");
      await expect(canvas).toHaveAttribute("data-inhabitants-ready", "4");
      await canvas.scrollIntoViewIfNeeded();
      const bounds = await canvas.boundingBox();
      if (!bounds) throw new Error("Canvas ausente");
      const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
      new CameraNavigation(camera, 0.7, LIBRARY_ROOMS).setViewport(
        Math.round(bounds.width),
        Math.round(bounds.height),
      );
      camera.updateMatrixWorld();
      const actor = INHABITANTS[0],
        p = new Vector3(actor.x, actor.height * 0.6, actor.z).project(camera);
      await page.mouse.click(
        bounds.x + ((p.x + 1) * bounds.width) / 2,
        bounds.y + ((1 - p.y) * bounds.height) / 2,
      );
      await expect(canvas).toHaveAttribute("data-selected-object", actor.id);
    }
    const dialogue = page.getByRole("article", { name: "Conversa RPG" });
    await expect(
      dialogue.getByRole("heading", { name: "Samael" }),
    ).toBeFocused();
    await expect(dialogue.getByRole("button")).toHaveCount(4);
    await dialogue
      .getByRole("button", { name: /Investigar com discrição/ })
      .click();
    await expect(dialogue).toContainText(
      "Comparar a anotação com uma pista ambiental",
    );
    await dialogue
      .getByRole("button", { name: "Adiar conversa e voltar ao mundo" })
      .click();
    await page.getByRole("button", { name: /Diário de histórias/ }).click();
    const journal = page.getByRole("complementary", {
      name: "Diário de quests",
    });
    await journal.getByRole("button", { name: "Retomar história" }).click();
    await expect(dialogue).toContainText("Comparar a anotação");
    await dialogue.getByRole("button", { name: /Examinar o braseiro/ }).click();
    await expect(dialogue).toContainText("Não há um sabotador");
    await page.screenshot({
      path: `test-results/bf4f4-${fallback ? "fallback" : "portrait"}.png`,
    });
    await page.setViewportSize({ width: 844, height: 390 });
    await dialogue
      .getByRole("button", { name: /Entregar a prova em particular/ })
      .click();
    await expect(dialogue).toContainText("Você segura a borda");
    await page.screenshot({
      path: `test-results/bf4f4-${fallback ? "fallback-" : ""}landscape.png`,
    });
    await dialogue
      .getByRole("button", { name: /Guardar o episódio entre vocês/ })
      .click();
    await expect(dialogue).toContainText("Mistério resolvido");
    if (fallback)
      await expect(dialogue).toContainText("nenhuma animação é confirmada");
    await dialogue
      .getByRole("button", { name: "Guardar o epílogo no diário" })
      .click();
    await expect(journal).toContainText("companhia discreta");
    await expect(
      page.getByRole("button", { name: /Diário de histórias · 1\/5/ }),
    ).toBeVisible();
    expect(await readRecords()).toBe(recordsBefore);
    await page.getByRole("link", { name: "Coleção", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Coleção", exact: true, level: 2 }),
    ).toBeVisible();
    await expect(page.locator("canvas[data-three-world-canvas]")).toHaveCount(
      0,
    );
  });
}
