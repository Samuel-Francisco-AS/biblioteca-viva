import { mkdir } from "node:fs/promises";
import { test, expect, type Page } from "@playwright/test";
async function capture(page: Page, name: string) {
  await mkdir("docs/audits/evidence/bf56e", { recursive: true });
  await page.screenshot({
    path: `docs/audits/evidence/bf56e/${name}.png`,
    fullPage: !name.startsWith("colecao"),
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
  await page.locator(".duel-gallery").scrollIntoViewIfNeeded();
  await capture(page, "colecao-retrato");
  await page.getByRole("button", { name: "Fechar coleção oficial" }).click();
  await page
    .getByRole("group", { name: "Adversário PvE", exact: true })
    .getByLabel("Lua · Caos", { exact: true })
    .check();
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
  const firstHand = page
    .getByRole("region", { name: "Sua mão" })
    .getByRole("button")
    .first();
  await firstHand.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("complementary", { name: "Inspeção e ações da carta" }),
  ).toContainText("Revisão 1");
  await page
    .getByRole("button", { name: "Cancelar seleção", exact: true })
    .click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator(".duel-hand-card")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
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
    if (actions === 8) {
      await capture(page, "mesa-combate-retrato");
      await page.setViewportSize({ width: 844, height: 390 });
      await capture(page, "mesa-combate-paisagem");
      await page.setViewportSize({ width: 390, height: 844 });
    }
    const revision = Number(await table.getAttribute("data-revision"));
    let acted = false;
    const ownUnits = page
      .getByRole("region", { name: "Suas criaturas" })
      .getByRole("button");
    for (let i = 0; i < (await ownUnits.count()); i++) {
      await ownUnits.nth(i).click();
      const attacks = page.getByRole("button", { name: /^Atacar / });
      if (await attacks.count()) {
        const face = attacks.filter({
          hasText: /Atacar (Aryn|Lua|Samael|Ytha)$/,
        });
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
test("E: combat workshop creates all three types, keeps drafts and enters Creator with a global author card", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/arcanario/duelos");
  await expect(
    page.getByRole("button", { name: "Iniciar duelo PvE" }),
  ).toBeEnabled();
  await page
    .getByRole("link", { name: "Criar carta de combate", exact: true })
    .click();
  await page
    .getByLabel("Nome da carta de combate")
    .fill("Guardião fictício do limiar");
  await page
    .getByRole("button", { name: "Adicionar habilidade", exact: true })
    .click();
  await page.reload();
  await expect(page.getByLabel("Nome da carta de combate")).toHaveValue(
    "Guardião fictício do limiar",
  );
  await expect(
    page.getByText("Rascunho de combate recuperado deste aparelho."),
  ).toBeVisible();
  await capture(page, "oficina-criatura-retrato");
  await page.getByRole("button", { name: "Guardar carta de combate" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Guardião fictício do limiar",
      exact: true,
      level: 2,
    }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Editar na Oficina", exact: true })
    .click();
  await page.getByLabel("Ataque", { exact: true }).fill("3");
  await page.getByRole("button", { name: "Guardar carta de combate" }).click();
  await expect(page.getByText(/Criação autoral local/)).toContainText(
    "revisão 2",
  );
  await page.goto("/arcanario/oficina/nova?tipo=combat");
  await page
    .getByRole("group", { name: "Tipo de combate", exact: true })
    .getByLabel("Feitiço", { exact: true })
    .check();
  await expect(page.getByLabel("Ataque", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Resistência", { exact: true })).toHaveCount(0);
  await page
    .getByLabel("Nome da carta de combate")
    .fill("Feitiço fictício do arquivo");
  await page.getByRole("button", { name: "Guardar carta de combate" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Feitiço fictício do arquivo",
      level: 2,
    }),
  ).toBeVisible();
  await page.goto("/arcanario/oficina/nova?tipo=combat");
  await page
    .getByRole("group", { name: "Tipo de combate", exact: true })
    .getByLabel("Artefato", { exact: true })
    .check();
  await page.getByLabel("Nome da carta de combate").fill("Lanterna fictícia");
  await page
    .getByRole("button", { name: "Adicionar habilidade", exact: true })
    .click();
  await page
    .getByRole("group", { name: "Momento da habilidade 1", exact: true })
    .getByLabel("Ativar por botão")
    .check();
  await page.getByLabel("Custo de ativação 1", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Guardar carta de combate" }).click();
  await expect(
    page.getByRole("heading", { name: "Lanterna fictícia", level: 2 }),
  ).toBeVisible();
  await page.goto("/arcanario/duelos/baralhos/novo?copia=arcane-deck%3Aruin");
  await page.getByLabel("Nome do baralho").fill("Círculo autoral fictício");
  await page
    .getByRole("group", { name: "Formato do baralho", exact: true })
    .getByLabel("Criador", { exact: true })
    .check();
  await page
    .getByLabel("Cópias de Diabrete do Último Carvão", { exact: true })
    .fill("0");
  await page
    .getByLabel("Cópias de Guardião fictício do limiar", { exact: true })
    .fill("2");
  await page.getByRole("button", { name: "Salvar baralho validado" }).click();
  await page
    .getByRole("group", { name: "Modo de duelo", exact: true })
    .getByLabel("Criador", { exact: true })
    .check();
  await page
    .getByRole("group", { name: "Seu deck", exact: true })
    .getByLabel("Círculo autoral fictício", { exact: true })
    .check();
  await page.getByRole("button", { name: "Iniciar duelo PvE" }).click();
  await expect(page.getByTestId("duel-table")).toHaveAttribute(
    "data-state",
    "active",
  );
  await expect(
    page.getByText("Criador · experimental", { exact: true }),
  ).toBeVisible();
});
