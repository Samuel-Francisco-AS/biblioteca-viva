import { expect, test } from "./fixtures";

test("BF-5R5: resident input accepts pinch, semantic selection and character dialogue", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const canvas = page.locator("canvas");
  await expect(canvas).toHaveAttribute("data-fixture-status", "ready");
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Coleção", exact: true })
    .click();
  await expect(canvas).toHaveAttribute("data-active-frame-loops", "0");
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Biblioteca", exact: true })
    .click();
  await expect(canvas).toHaveAttribute("data-active-frame-loops", "1");
  const zoom = Number(await canvas.getAttribute("data-camera-zoom"));
  const selected = await canvas.getAttribute("data-selected-object");
  await canvas.evaluate((element) => {
    const emit = (
      type: string,
      pointerId: number,
      clientX: number,
      clientY: number,
    ) =>
      element.dispatchEvent(
        new PointerEvent(type, {
          pointerId,
          clientX,
          clientY,
          pointerType: "touch",
          bubbles: true,
          cancelable: true,
        }),
      );
    emit("pointerdown", 101, 145, 420);
    emit("pointerdown", 102, 245, 420);
    emit("pointermove", 101, 125, 420);
    emit("pointermove", 102, 265, 420);
    emit("pointerup", 102, 265, 420);
    emit("pointerup", 101, 125, 420);
  });
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-camera-zoom")))
    .toBeGreaterThan(zoom);
  await expect(canvas).toHaveAttribute("data-selected-object", selected ?? "");
  await expect(canvas).toHaveAttribute("data-gesture", "idle");
  await page
    .getByRole("button", { name: "Abrir ferramentas de exploração acessível" })
    .click();
  await page
    .getByText("Explorar · habitantes e objetos", { exact: true })
    .click();
  await page.getByText("Selecionar elementos", { exact: true }).click();
  await page.getByRole("button", { name: "Próximo →", exact: true }).click();
  await expect(canvas).toHaveAttribute(
    "data-selected-object",
    /^reading-shelf-/,
  );
  await expect(canvas).toHaveAttribute(
    "data-highlighted-object",
    /^reading-shelf-/,
  );
  await page.getByText("Habitantes da Biblioteca", { exact: true }).click();
  await page.getByRole("button", { name: "Samael", exact: true }).click();
  await expect(
    page.getByRole("article", { name: "Conversa RPG" }),
  ).toBeVisible();
  const choices = page.locator(".rpg-choices button");
  await expect(choices.first()).toBeVisible();
  await choices.first().click();
  await expect(
    page.getByRole("article", { name: "Conversa RPG" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Adiar conversa e voltar ao mundo" })
    .click();
  await expect(page.getByRole("article", { name: "Conversa RPG" })).toHaveCount(
    0,
  );
  await expect(canvas).toHaveAttribute("data-active-frame-loops", "1");
});
