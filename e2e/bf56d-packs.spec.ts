import { mkdir } from "node:fs/promises";
import { test, expect, type Page } from "@playwright/test";
async function capture(page: Page, name: string) {
  await mkdir("docs/audits/evidence/bf56d", { recursive: true });
  await page.screenshot({
    path: `docs/audits/evidence/bf56d/${name}.png`,
    fullPage: true,
  });
}
async function records(page: Page) {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open("biblioteca-viva-bf57");
      r.onsuccess = () => resolve(r.result);
      r.onerror = () =>
        reject(r.error ?? new Error("Falha no IndexedDB de teste"));
    });
    const tx = db.transaction([
      "arcanariumCards",
      "arcanariumVersions",
      "cardSessions",
      "educationalPacks",
    ]);
    const read = (name: string) =>
      new Promise<unknown[]>((resolve, reject) => {
        const r = tx.objectStore(name).getAll();
        r.onsuccess = () => resolve(r.result);
        r.onerror = () =>
          reject(r.error ?? new Error("Falha no IndexedDB de teste"));
      });
    const [cards, versions, sessions, packs] = await Promise.all(
      [
        "arcanariumCards",
        "arcanariumVersions",
        "cardSessions",
        "educationalPacks",
      ].map(read),
    );
    db.close();
    return { cards, versions, sessions, packs };
  });
}
test("D: partial catalog, lots, idempotence, trial, offline, removal and coherent reinstall", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/arcanario/pacotes");
  await expect(
    page.getByRole("heading", { name: "Biblioteca de Provas" }),
  ).toBeVisible();
  const volume = page.getByRole("article", {
    name: "Aritmética dos pequenos arquivos",
  });
  await expect(
    volume.getByText("Disponível para instalar", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("article", { name: "ENEM 2024 · Matemática" })
      .getByRole("button", { name: /Instalar/ }),
  ).toHaveCount(0);
  await capture(page, "catalogo-retrato");
  await volume
    .getByRole("button", { name: "Instalar lote 1", exact: true })
    .click();
  await expect(
    volume.getByText("Atualização disponível", { exact: true }),
  ).toBeVisible();
  const lot1 = await records(page);
  expect(lot1.cards).toHaveLength(2);
  // Reimport same lot through real file input, not direct persistence.
  await page
    .getByLabel("Arquivo de pacote (.json)")
    .setInputFiles(
      "src/infrastructure/packs/content/matematica-original-v1.json",
    );
  await page
    .getByRole("button", { name: "Instalar arquivo conferido" })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: /Pacote importado/ }),
  ).toBeVisible();
  expect((await records(page)).versions).toEqual(lot1.versions);
  await volume
    .getByRole("button", { name: "Atualizar · instalar lote adicional" })
    .click();
  await expect(volume.getByText("Instalado", { exact: true })).toBeVisible();
  expect((await records(page)).cards).toHaveLength(4);
  await capture(page, "lotes-instalados");
  await volume.getByRole("link", { name: "Abrir coleção no Acervo" }).click();
  await expect(
    page.getByRole("heading", { name: "Acervo global" }),
  ).toBeVisible();
  await expect(page.getByText("4 cartas encontradas")).toBeVisible();
  await page
    .getByRole("link", { name: "Biblioteca de Provas", exact: true })
    .click();
  await volume.getByRole("link", { name: "Preparar Provação" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: /4 questões elegíveis/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Iniciar Provação", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /Questão 1 de 4/ }),
  ).toBeVisible();
  await page.getByRole("radio").nth(2).check();
  await page
    .getByRole("button", { name: "Confirmar resposta", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Resposta correta", exact: true }),
  ).toBeVisible();
  await capture(page, "provacao-com-pacote");
  await page
    .getByRole("button", { name: "Pausar e sair", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Provações", exact: true, level: 2 }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("link", { name: /Pausada .*1\/4 respostas/ }).click();
  await expect(
    page.getByRole("button", { name: "Retomar Provação", exact: true }),
  ).toBeVisible();
  // The reload above discarded the earlier PackLibrary module. Warm this
  // document's management route before disconnecting the hosted web runner;
  // Android instead resolves these chunks from the installed APK.
  await page
    .getByRole("link", { name: "Biblioteca de Provas", exact: true })
    .click();
  await expect(
    volume.getByRole("button", { name: "Remover pacote" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Provações", exact: true }).click();
  await page.getByRole("link", { name: /Pausada .*1\/4 respostas/ }).click();
  await expect(
    page.getByRole("button", { name: "Retomar Provação", exact: true }),
  ).toBeVisible();
  await context.setOffline(true);
  await page
    .getByRole("button", { name: "Retomar Provação", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Resposta correta", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Biblioteca de Provas", exact: true })
    .click();
  await volume.getByRole("button", { name: "Remover pacote" }).click();
  await expect(volume.getByText("Desinstalado", { exact: true })).toBeVisible();
  const removed = await records(page);
  expect(removed.sessions).toHaveLength(1);
  await capture(page, "removido-historico-preservado");
  await volume.getByRole("button", { name: "Reinstalar pacote" }).click();
  await expect(volume.getByText("Instalado", { exact: true })).toBeVisible();
  const reinstalled = await records(page);
  expect(reinstalled.cards).toEqual(removed.cards);
  expect(reinstalled.sessions).toEqual(removed.sessions);
  await page.setViewportSize({ width: 844, height: 390 });
  await capture(page, "catalogo-paisagem");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await context.setOffline(false);
  await page.getByRole("link", { name: "Portal", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "O Arcanário", exact: true, level: 2 }),
  ).toBeVisible();
});
test("D: invalid, incompatible and corrupt files reject before writes; recovers with valid file", async ({
  page,
}) => {
  await page.goto("/arcanario/pacotes");
  const picker = page.getByLabel("Arquivo de pacote (.json)");
  await picker.setInputFiles({
    name: "incompativel.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"formatVersion":99}'),
  });
  await expect(page.getByRole("alert")).toContainText("Incompatível");
  expect((await records(page)).cards).toHaveLength(0);
  await picker.setInputFiles({
    name: "invalido.json",
    mimeType: "application/json",
    buffer: Buffer.from("{}"),
  });
  await expect(page.getByRole("alert")).toContainText("Inválido");
  await picker.setInputFiles(
    "src/infrastructure/packs/content/matematica-original-v2.json",
  );
  await page
    .getByRole("button", { name: "Instalar arquivo conferido" })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: /Pacote importado/ }),
  ).toBeVisible();
  expect((await records(page)).cards).toHaveLength(4);
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe(
    "BODY",
  );
});
