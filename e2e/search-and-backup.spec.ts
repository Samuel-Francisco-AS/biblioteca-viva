import { expect, test } from "./fixtures";
import type { Page } from "@playwright/test";

/**
 * Read the canonical store in the disposable Playwright context. This lets
 * the backup test distinguish database restoration from a presentation/route
 * failure; it never modifies data or accesses the user's real database.
 */
async function entryTitlesInTestDatabase(page: Page): Promise<string[]> {
  return page.evaluate(
    () =>
      new Promise<string[]>((resolve, reject) => {
        const request = indexedDB.open("biblioteca-viva");
        request.onerror = () =>
          reject(request.error ?? new Error("Falha ao abrir IndexedDB."));
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction("libraryEntries", "readonly");
          const items = tx.objectStore("libraryEntries").getAll();
          items.onerror = () =>
            reject(items.error ?? new Error("Falha ao ler registros."));
          items.onsuccess = () => {
            resolve(
              (items.result as Array<{ title: string }>).map(
                ({ title }) => title,
              ),
            );
          };
          tx.oncomplete = () => db.close();
          tx.onabort = () =>
            reject(tx.error ?? new Error("Consulta interrompida."));
        };
      }),
  );
}


test("busca, filtro, ordenação e Arquivo preservam navegação", async ({
  createBook,
  navigateFromDock,
  page,
}) => {
  await createBook({ author: "Lia Ômega", title: "Árvore Azul" });
  await page.locator("summary", { hasText: "Adicionar nota" }).click();
  await page
    .getByLabel("Nota (obrigatório)")
    .fill("Mapa fictício do capítulo.");
  await page.getByRole("button", { name: "Adicionar nota" }).click();
  await createBook({ author: "Bruno Exemplo", title: "Brasa Serena" });
  await createBook({
    author: "Carla Teste",
    currentPage: 30,
    status: "in_progress",
    title: "Caderno Unicode",
    totalPages: 100,
  });

  await page.goto("/colecao");
  await page.getByRole("button", { name: /^Busca/u }).click();
  await page.getByLabel("Buscar registros").fill("lia omega");
  await expect(
    page.getByRole("heading", { name: "Árvore Azul" }),
  ).toBeVisible();
  await page.getByLabel("Buscar registros").fill("Caderno");
  await expect(page).toHaveURL(/q=Caderno/u);
  await page.getByLabel("Status").selectOption("in_progress");
  await expect(page).toHaveURL(/status=in_progress/u);
  await page.getByLabel("Ordenar por").selectOption("title");
  await expect(page).toHaveURL(/sort=title/u);
  await page
    .getByRole("link", { name: "Abrir detalhes de Caderno Unicode" })
    .click();
  await page.getByRole("link", { name: "Voltar à Coleção" }).click();
  await expect(page).toHaveURL(/q=Caderno.*status=in_progress.*sort=title/u);

  await navigateFromDock("Arquivo");
  await page.getByLabel("Buscar no Arquivo").fill("Mapa fictício");
  await page.getByRole("link", { name: "Abrir registro Árvore Azul" }).click();
  await page.getByRole("link", { name: "Voltar ao Arquivo" }).click();
  await expect(page).toHaveURL(/\/arquivo\?q=Mapa\+fict%C3%ADcio/u);
});

test("backup web real é baixado, validado, restaurado e persiste", async ({
  createBook,
  navigateFromDock,
  page,
}) => {
  await createBook({
    author: "Pessoa Fictícia",
    currentPage: 80,
    status: "in_progress",
    title: "Backup de Ensaio",
    totalPages: 80,
  });
  await page.locator("summary", { hasText: "Status da leitura" }).click();
  await page.getByRole("button", { name: "Concluir leitura" }).click();
  await navigateFromDock("Ajustes");
  await page.getByLabel("Usar alto contraste").check();
  await page.getByLabel("Tamanho do texto").selectOption("larger");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar backup" }).click();
  const download = await downloadPromise;
  const backupPath = await download.path();
  expect(backupPath).not.toBeNull();
  if (!backupPath)
    throw new Error("O download do backup não produziu arquivo.");

  const invalidPath = "e2e/fixtures/invalid-backup.txt";
  await page.getByLabel("Arquivo de backup").setInputFiles(invalidPath);
  await expect(
    page.getByText("O arquivo selecionado não contém JSON válido."),
  ).toBeVisible();

  await createBook({ title: "Registro removido pela restauração" });
  await navigateFromDock("Ajustes");
  await page.getByLabel("Arquivo de backup").setInputFiles(backupPath);
  await expect(
    page.getByRole("heading", {
      name: "Confirmar substituição de todos os dados",
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Continuar sem criar backup",
    })
    .click();
  await expect(
    page.getByText(/a Biblioteca Viva não poderá desfazer esta ação/u),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Confirmar e restaurar sem backup" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Restauração concluída" }),
  ).toBeVisible();

  // Confirm the actual persisted state before asking the interface to render.
  // A restoration must replace the disposable IndexedDB atomically.
  await expect
    .poll(() => entryTitlesInTestDatabase(page))
    .toContain("Backup de Ensaio");
  await expect
    .poll(() => entryTitlesInTestDatabase(page))
    .not.toContain("Registro removido pela restauração");

  await page.reload();
  await expect(page.getByLabel("Usar alto contraste")).toBeChecked();
  await expect(page.getByLabel("Tamanho do texto")).toHaveValue("larger");
  await expect
    .poll(() => entryTitlesInTestDatabase(page))
    .toContain("Backup de Ensaio");

  // The backup gate must not depend on software-WebGL warm-up. Navigating
  // through the world is covered separately by the dedicated navigation E2E.
  await page.goto("/colecao");
  await expect(
    page.getByRole("heading", { name: "Backup de Ensaio" }),
  ).toBeVisible({ timeout: 20_000 });
  await expect(
    page.getByRole("heading", { name: "Registro removido pela restauração" }),
  ).toHaveCount(0);
});

test("restauração em base vazia recupera dados convencionais", async ({
  createBook,
  navigateFromDock,
  page,
}) => {
  await createBook({
    author: "Autoria Fictícia",
    currentPage: 7,
    status: "in_progress",
    title: "Arquivo para Base Vazia",
    totalPages: 70,
  });
  await navigateFromDock("Ajustes");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar backup" }).click();
  const backupPath = await (await downloadPromise).path();
  if (!backupPath) throw new Error("O backup fictício não foi materializado.");

  const session = await page.context().newCDPSession(page);
  await session.send("Storage.clearDataForOrigin", {
    origin: new URL(page.url()).origin,
    storageTypes: "indexeddb",
  });
  await session.detach();
  await page.reload();
  await page.getByLabel("Arquivo de backup").setInputFiles(backupPath);
  await expect(
    page.getByText(/não possui dados atuais relevantes/u),
  ).toBeVisible();
  await page.getByRole("button", { name: "Restaurar backup" }).click();
  await expect(
    page.getByRole("heading", { name: "Restauração concluída" }),
  ).toBeVisible();
  await navigateFromDock("Coleção");
  await expect(
    page.getByRole("heading", { name: "Arquivo para Base Vazia" }),
  ).toBeVisible();
});
