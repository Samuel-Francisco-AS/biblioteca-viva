import { mkdir } from "node:fs/promises";
import { expect, test } from "./fixtures";
import { chooseBVDate, chooseBVOption } from "./pickers";
import type { Page } from "@playwright/test";
const evidence = "docs/evidence/BF-5_ATLAS_CLASSICO";
test.use({
  locale: "pt-BR",
  timezoneId: "America/Fortaleza",
  hasTouch: true,
  isMobile: true,
  viewport: { width: 390, height: 844 },
  video: { mode: "on", size: { width: 390, height: 844 } },
});
async function createWorkout(page: Page) {
  await page.goto("/novo-registro");
  await page.getByRole("button", { name: /Atividade física/ }).click();
  await page.getByLabel("Nome do treino").fill("Ritual do observatório");
  await chooseBVDate(page, page.getByLabel("Data de início"), "2026-11-01");
  await chooseBVDate(page, page.getByLabel("Data final"), "2026-11-30");
  await page.getByRole("checkbox", { name: "Qua", exact: true }).check();
  await page
    .getByRole("button", { name: "Adicionar exercício", exact: true })
    .click();
  await page.getByLabel("Nome do exercício").fill("Remada fictícia");
  await page.getByLabel("Repetições por série").fill("12");
  await page.getByRole("button", { name: "Salvar registro" }).click();
  await expect(
    page.getByRole("heading", { name: "Ritual do observatório" }),
  ).toBeVisible();
  const atlas = page.locator(".classic-atlas");
  await atlas.scrollIntoViewIfNeeded();
  await expect(atlas.getByRole("img")).toHaveJSProperty("naturalWidth", 1024);
  await expect(page.locator("#bv-startup-veil")).toHaveCount(0);
  await mkdir(evidence, { recursive: true });
  return atlas;
}
test("coleção masculina padrão dissolve artes decodificadas, pausa e mantém composição em retrato/paisagem", async ({
  page,
}) => {
  const atlas = await createWorkout(page);
  await expect(atlas).toHaveAttribute("data-collection", "male");
  await expect(atlas.locator("svg,[data-joint]")).toHaveCount(0);
  await expect(atlas).toHaveAttribute("data-plate", "male-frontal");
  await page.screenshot({ path: `${evidence}/masculino-frontal-retrato.png` });
  await expect(atlas).toHaveAttribute("data-transitioning", "true");
  const arriving = atlas.locator(".classic-atlas__art--arriving");
  await expect(arriving).toHaveJSProperty("naturalWidth", 1024);
  await expect
    .poll(() =>
      arriving.evaluate((image) => Number(getComputedStyle(image).opacity)),
    )
    .toBeGreaterThan(0.15);
  await page.screenshot({ path: `${evidence}/dissolucao.png` });
  await expect(atlas).toHaveAttribute("data-plate", "male-tres-quartos");
  await expect(atlas.locator("img")).toHaveCount(1);
  await atlas.getByRole("button", { name: "Pausar projeção" }).click();
  await expect(atlas).toHaveAttribute("data-rotating", "false");
  await atlas.getByRole("button", { name: "Próxima arte" }).click();
  await expect(atlas).toHaveAttribute("data-plate", "male-movimento");
  await expect(atlas).toHaveAttribute("data-transitioning", "false");
  await page.setViewportSize({ width: 844, height: 390 });
  await atlas.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `${evidence}/masculino-paisagem.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const video = page.video();
  await page.close();
  if (video) await video.saveAs(`${evidence}/projecao.webm`);
});
test("gênero feminino em automático seleciona três artes próprias; movimento reduzido mantém troca manual estática", async ({
  page,
}) => {
  await page.goto("/configuracoes");
  await chooseBVOption(page, page.getByLabel("Gênero (opcional)"), "female");
  await page.getByRole("button", { name: "Salvar perfil" }).click();
  await expect(page.getByText("Perfil salvo neste dispositivo.")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  const atlas = await createWorkout(page);
  await expect(atlas).toHaveAttribute("data-collection", "female");
  await expect(atlas).toHaveAttribute("data-rotating", "false");
  for (const plate of ["frontal", "tres-quartos", "movimento"]) {
    await expect(atlas).toHaveAttribute("data-plate", `female-${plate}`);
    await expect(atlas.locator("img")).toHaveCount(1);
    await expect(atlas.getByRole("img")).toHaveJSProperty("naturalWidth", 1024);
    await page.screenshot({
      path: `${evidence}/feminino-${plate}-retrato.png`,
    });
    if (plate !== "movimento")
      await atlas.getByRole("button", { name: "Próxima arte" }).click();
  }
  await page.setViewportSize({ width: 844, height: 390 });
  await atlas.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `${evidence}/feminino-paisagem.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(atlas).toHaveAttribute("data-rotating", "true");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(atlas).toHaveAttribute("data-rotating", "false");
});
test("falhas de imagem mantêm a prancha anterior e as informações metabólicas disponíveis", async ({
  page,
}) => {
  const atlas = await createWorkout(page);
  await page.route("**/atlas-classico/*-tres-quartos.webp", (route) =>
    route.abort(),
  );
  await page.route("**/atlas-classico/*-movimento.webp", (route) =>
    route.abort(),
  );
  await atlas.getByRole("button", { name: "Próxima arte" }).click();
  await expect(atlas.getByRole("status")).toContainText(
    "A arte atual foi mantida",
  );
  await expect(atlas).toHaveAttribute("data-plate", "male-frontal");
  await expect(atlas.locator("img")).toHaveCount(1);
  await expect(atlas.getByRole("img")).toHaveJSProperty("naturalWidth", 1024);
  await expect(page.locator(".workout-calories")).toContainText(
    "Sem estimativa neste dia",
  );
});
