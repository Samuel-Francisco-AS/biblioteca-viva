import { mkdir } from "node:fs/promises";
import { test, expect, type Page } from "@playwright/test";

async function fit(page: Page) {
  expect(
    await page.evaluate(() => ({
      x: document.documentElement.scrollWidth <= innerWidth,
      y: document.documentElement.scrollHeight <= innerHeight,
    })),
  ).toEqual({ x: true, y: true });
  await expect(page.locator(".primary-dock")).toBeHidden();
  const board = await page.getByTestId("arena-board").boundingBox();
  const viewport = page.viewportSize()!;
  expect(board).not.toBeNull();
  expect(board!.x).toBeGreaterThanOrEqual(0);
  expect(board!.y).toBeGreaterThanOrEqual(0);
  expect(board!.x + board!.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(board!.y + board!.height).toBeLessThanOrEqual(viewport.height + 1);
  for (const locator of [
    page.getByRole("button", { name: "Pausar e salvar", exact: true }),
    page.getByRole("button", { name: "Encerrar turno", exact: true }),
    ...(await page.locator(".arena-hand-card").all()),
  ]) {
    const r = await locator.boundingBox();
    expect(r).not.toBeNull();
    expect(r!.x).toBeGreaterThanOrEqual(0);
    expect(r!.y).toBeGreaterThanOrEqual(0);
    expect(r!.x + r!.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(r!.y + r!.height).toBeLessThanOrEqual(viewport.height + 1);
    expect(r!.width).toBeGreaterThanOrEqual(40);
    expect(r!.height).toBeGreaterThanOrEqual(40);
    const reachable = await locator.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(
        r.x + r.width / 2,
        r.y + r.height / 2,
      );
      return top === el || el.contains(top);
    });
    expect(reachable).toBe(true);
  }
  await expect(page.getByTestId("arena-duel")).not.toContainText(
    /Toque em uma carta|Selecione uma criatura|Nenhuma ação depende|O outro lado ainda/,
  );
}
async function capture(page: Page, name: string) {
  await mkdir("docs/audits/evidence/bf56f", { recursive: true });
  await page.screenshot({ path: `docs/audits/evidence/bf56f/${name}.png` });
}
async function nativeBack(page: Page) {
  expect(
    await page.evaluate(
      () =>
        !window.dispatchEvent(
          new Event("biblioteca-viva:native-back", { cancelable: true }),
        ),
    ),
  ).toBe(true);
}

test("F2: complete game through legal touch actions; viewport, rotation, pause, native back and restoration", async ({
  page,
}) => {
  test.setTimeout(180_000); // Complete PvE turns include the intentional AI cadence.
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/arcanario/duelos");
  await page.getByRole("button", { name: "Iniciar duelo PvE" }).click();
  const table = page.getByTestId("arena-duel");
  await expect(table).toHaveAttribute("data-revision", "0");
  await expect(page.locator(".arena-canvas canvas")).toBeVisible();
  await fit(page);
  await capture(page, "arena-retrato");
  await page
    .getByRole("region", { name: "Sua mão" })
    .getByRole("button")
    .first()
    .click();
  await page.getByRole("button", { name: /^Inspecionar / }).click();
  await expect(
    page.getByRole("dialog", { name: /^Inspecionar / }),
  ).toBeVisible();
  await nativeBack(page);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await nativeBack(page); // Clears selection first.
  await nativeBack(page);
  await expect(table).toHaveAttribute("data-state", "paused");
  await page.reload();
  await expect(table).toHaveAttribute("data-state", "paused");
  await page.getByRole("button", { name: "Retomar duelo salvo" }).click();
  await page.setViewportSize({ width: 844, height: 390 });
  await fit(page);
  await capture(page, "arena-paisagem");
  await page.setViewportSize({ width: 390, height: 844 });
  let summons = 0,
    attacks = 0,
    spells = 0,
    artifacts = 0;
  for (
    let step = 0;
    step < 300 && (await table.getAttribute("data-state")) !== "completed";
    step++
  ) {
    await expect
      .poll(
        async () =>
          (await table.getAttribute("data-state")) === "completed" ||
          (await table.getAttribute("data-active")) === "0",
      )
      .toBe(true);
    if ((await table.getAttribute("data-state")) === "completed") break;
    const revision = Number(await table.getAttribute("data-revision"));
    let acted = false;
    const own = page
      .getByRole("region", { name: "Suas criaturas e artefatos" })
      .locator('button[data-ready="true"]');
    const candidates = [
      ...(await own.all()),
      ...(await page.locator('.arena-hand-card[data-playable="true"]').all()),
    ];
    for (const candidate of candidates) {
      await candidate.click();
      const target = page.locator('[data-target="true"]').first();
      if (await target.count()) await target.click();
      const action = page.locator(".arena-context .arena-primary").first();
      if (await action.count()) {
        const label = await action.innerText();
        if (label.startsWith("Invocar")) summons++;
        if (label.startsWith("Atacar")) attacks++;
        if (label.startsWith("Conjurar")) spells++;
        if (label.startsWith("Posicionar")) artifacts++;
        await action.click();
        acted = true;
        break;
      }
      const cancel = page.getByRole("button", {
        name: "Cancelar seleção",
        exact: true,
      });
      if (await cancel.count()) await cancel.click();
    }
    if (!acted)
      await page
        .getByRole("button", { name: "Encerrar turno", exact: true })
        .click();
    await expect
      .poll(async () => Number(await table.getAttribute("data-revision")))
      .toBeGreaterThan(revision);
    if (step === 7) {
      await fit(page);
      await capture(page, "combate-retrato");
      await page.setViewportSize({ width: 844, height: 390 });
      await fit(page);
      await capture(page, "combate-paisagem");
      await page.setViewportSize({ width: 390, height: 844 });
    }
  }
  await expect(table).toHaveAttribute("data-state", "completed");
  expect(summons).toBeGreaterThan(0);
  expect(attacks).toBeGreaterThan(0);
  await capture(page, "resultado");
  await page.reload();
  await expect(table).toHaveAttribute("data-state", "completed");
  await page.getByRole("button", { name: "Histórico & novo duelo" }).click();
  await page.getByRole("button", { name: "Iniciar duelo PvE" }).click();
  await page
    .getByRole("button", { name: "Pausar e salvar", exact: true })
    .click();
  await page.getByRole("button", { name: "Abandonar duelo…" }).click();
  await page
    .getByRole("button", { name: "Continuar duelo", exact: true })
    .click();
  await expect(table).toHaveAttribute("data-state", "paused");
  await page.getByRole("button", { name: "Abandonar duelo…" }).click();
  await page.getByRole("button", { name: "Confirmar abandono" }).click();
  await expect(
    page.getByRole("heading", { name: "Derrota", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Voltar à Biblioteca", exact: true })
    .click();
  await expect(page).toHaveURL("/");
  expect(errors).toEqual([]);
  test.info().annotations.push({
    type: "actions",
    description: JSON.stringify({ summons, attacks, spells, artifacts }),
  });
});
