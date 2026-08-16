import { expect, test as base, type Page } from "@playwright/test";

interface BookFixture {
  readonly author?: string;
  readonly currentPage?: number;
  readonly status?: "planned" | "in_progress";
  readonly title: string;
  readonly totalPages?: number;
}

async function resetIndexedDb(page: Page): Promise<void> {
  await page.goto("/");
  const session = await page.context().newCDPSession(page);
  await session.send("Storage.clearDataForOrigin", {
    origin: new URL(page.url()).origin,
    storageTypes: "indexeddb",
  });
  await session.detach();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Abrir resumo da Biblioteca" }),
  ).toBeVisible();
}

async function createBook(page: Page, fixture: BookFixture): Promise<void> {
  await page.goto("/novo-livro");
  await page.getByLabel("Título (obrigatório)").fill(fixture.title);
  if (fixture.author)
    await page.getByLabel("Autor (opcional)").fill(fixture.author);
  if (fixture.totalPages !== undefined)
    await page
      .getByLabel("Total de páginas (opcional)")
      .fill(String(fixture.totalPages));
  if (fixture.currentPage !== undefined)
    await page
      .getByLabel("Página atual (obrigatório)")
      .fill(String(fixture.currentPage));
  if (fixture.status)
    await page.getByLabel("Status (obrigatório)").selectOption(fixture.status);
  await page.getByRole("button", { name: "Salvar livro" }).click();
  await expect(
    page.getByRole("heading", { name: fixture.title }),
  ).toBeVisible();
}

async function navigateFromMenu(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { name: "Abrir menu principal" }).click();
  await page.getByRole("link", { name, exact: true }).click();
}

export const test = base.extend<{
  createBook: (fixture: BookFixture) => Promise<void>;
  navigateFromMenu: (name: string) => Promise<void>;
}>({
  createBook: async ({ page }, use) => {
    await use((fixture) => createBook(page, fixture));
  },
  navigateFromMenu: async ({ page }, use) => {
    await use((name) => navigateFromMenu(page, name));
  },
  page: async ({ page }, use) => {
    await resetIndexedDb(page);
    await use(page);
  },
});

export { expect } from "@playwright/test";
