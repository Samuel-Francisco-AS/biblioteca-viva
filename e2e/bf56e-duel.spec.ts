import { mkdir } from "node:fs/promises";
import { test, expect, type Page } from "@playwright/test";
async function capture(page: Page, name: string) {
  await mkdir("docs/audits/evidence/bf56e", { recursive: true });
  await page.screenshot({
    path: `docs/audits/evidence/bf56e/${name}.png`,
    fullPage: true,
  });
}
async function persisted(page: Page) {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open("biblioteca-viva");
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(new Error("Fixture database unavailable"));
    });
    const sessions = await new Promise<unknown[]>((resolve, reject) => {
      const r = db
        .transaction("cardSessions")
        .objectStore("cardSessions")
        .getAll();
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(new Error("Fixture read failed"));
    });
    db.close();
    return sessions;
  });
}
test("E: real touch controls, exact resume, full PvE match, result and new history", async ({
  page,
}) => {
  test.setTimeout(180_000); // Includes complete turns and the visible 380ms AI cadence, not a Canvas wait.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/arcanario/duelos");
  await expect(
    page.getByRole("button", { name: "Iniciar duelo PvE" }),
  ).toBeEnabled();
  await capture(page, "salao-retrato");
  await page.getByRole("button", { name: "Ver as 48 cartas oficiais" }).click();
  await expect(page.locator(".duel-gallery .combat-card")).toHaveCount(48);
  await capture(page, "colecao-retrato");
  await page.getByRole("button", { name: "Fechar coleção oficial" }).click();
  await page.getByRole("button", { name: "Iniciar duelo PvE" }).click();
  const table = page.getByTestId("duel-table");
  await expect(table).toHaveAttribute("data-revision", "0");
  const before = await persisted(page);
  await page.reload();
  await expect(table).toHaveAttribute("data-revision", "0");
  expect(await persisted(page)).toEqual(before);
  await page.getByRole("button", { name: "Pausar e salvar" }).click();
  await expect(table).toHaveAttribute("data-state", "paused");
  const paused = await persisted(page);
  await page.reload();
  await expect(table).toHaveAttribute("data-state", "paused");
  expect(await persisted(page)).toEqual(paused);
  await page.getByRole("button", { name: "Retomar duelo salvo" }).click();
  await expect(table).toHaveAttribute("data-state", "active");
  await capture(page, "mesa-inicial-retrato");
  let actions = 0;
  while (
    (await table.getAttribute("data-state")) !== "completed" &&
    actions++ < 400
  ) {
    await expect
      .poll(
        async () =>
          (await table.getAttribute("data-state")) === "completed" ||
          (await table.getAttribute("data-active")) === "0",
      )
      .toBeTruthy();
    if ((await table.getAttribute("data-state")) === "completed") break;
    const revision = Number(await table.getAttribute("data-revision"));
    let acted = false;
    const ownUnits = page
      .getByRole("region", { name: "Suas criaturas" })
      .getByRole("button");
    for (let i = 0; i < (await ownUnits.count()); i++) {
      await ownUnits.nth(i).click();
      const attacks = page.getByRole("button", { name: /^Atacar / });
      if (await attacks.count()) {
        const face = attacks.filter({ hasText: /Atacar Aryn$/ });
        await ((await face.count()) ? face.first() : attacks.first()).click();
        acted = true;
        break;
      }
    }
    if (!acted) {
      const hand = page
        .getByRole("region", { name: "Sua mão" })
        .getByRole("button");
      for (let i = 0; i < (await hand.count()); i++) {
        await hand.nth(i).click();
        const play = page.getByRole("button", {
          name: /^(Invocar|Conjurar|Posicionar artefato)( em |$)/,
        });
        if (await play.count()) {
          await play.first().click();
          acted = true;
          break;
        }
      }
    }
    if (!acted)
      await page
        .getByRole("button", { name: "Encerrar turno", exact: true })
        .click();
    await expect
      .poll(async () => Number(await table.getAttribute("data-revision")))
      .toBeGreaterThan(revision);
  }
  await expect(table).toHaveAttribute("data-state", "completed");
  await expect(
    page.getByRole("heading", { name: /^(Vitória|Derrota|Empate)$/ }),
  ).toBeVisible();
  const finished = await persisted(page);
  await capture(page, "resultado-retrato");
  await page.setViewportSize({ width: 844, height: 390 });
  await capture(page, "resultado-paisagem");
  await page.reload();
  expect(await persisted(page)).toEqual(finished);
  await page.getByRole("link", { name: "Histórico & novo duelo" }).click();
  await page.getByRole("button", { name: "Iniciar duelo PvE" }).click();
  await expect(table).toHaveAttribute("data-revision", "0");
  expect(await persisted(page)).toHaveLength(2);
  await page.getByRole("button", { name: "Abandonar duelo…" }).click();
  await page
    .getByRole("button", { name: "Continuar duelo", exact: true })
    .click();
  await expect(table).toHaveAttribute("data-state", "active");
  await page.getByRole("button", { name: "Abandonar duelo…" }).click();
  await page.getByRole("button", { name: "Confirmar abandono" }).click();
  await expect(
    page.getByRole("heading", { name: "Derrota", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("E: deck copy preserves global identities, validates constraints and restores its draft", async ({
  page,
}) => {
  await page.goto("/arcanario/duelos");
  await expect(
    page.getByRole("button", { name: "Iniciar duelo PvE" }),
  ).toBeEnabled();
  await page.goto("/arcanario/duelos/baralhos/novo?copia=arcane-deck%3Aruin");
  await page.getByLabel("Nome do baralho").fill("Círculo fictício");
  await page.reload();
  await expect(page.getByLabel("Nome do baralho")).toHaveValue(
    "Círculo fictício",
  );
  await page.getByRole("button", { name: "Salvar baralho validado" }).click();
  await expect(
    page.getByRole("heading", { name: "Círculo fictício", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Editar deck", exact: true }).click();
  await page.getByLabel("Cópias de Diabrete do Último Carvão").fill("0");
  await page.getByRole("button", { name: "Salvar baralho validado" }).click();
  await expect(page.getByRole("alert")).toContainText("24 cartas");
  await page.getByLabel("Cópias de Diabrete do Último Carvão").fill("2");
  await page.getByRole("button", { name: "Salvar baralho validado" }).click();
  await expect(
    page.getByRole("heading", { name: "Círculo fictício", exact: true }),
  ).toBeVisible();
});
