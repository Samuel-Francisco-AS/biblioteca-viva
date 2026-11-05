import {
  expect,
  test as base,
  type Page,
  type TestInfo,
} from "@playwright/test";

interface BookFixture {
  readonly author?: string;
  readonly currentPage?: number;
  readonly status?: "planned" | "in_progress";
  readonly title: string;
  readonly totalPages?: number;
}

interface SeededBook {
  readonly author?: string;
  readonly createdAt: string;
  readonly currentPage: number;
  readonly favorite: boolean;
  readonly id: string;
  readonly revision: number;
  readonly status: "planned";
  readonly tagIds: readonly string[];
  readonly title: string;
  readonly type: "book";
  readonly updatedAt: string;
}

interface IndexedDbOpenRequest {
  error: unknown;
  onerror: (() => void) | null;
  onsuccess: (() => void) | null;
  result: {
    close(): void;
    transaction(
      table: string,
      mode: "readwrite",
    ): {
      error: unknown;
      onabort: (() => void) | null;
      oncomplete: (() => void) | null;
      onerror: (() => void) | null;
      objectStore(name: string): { put(value: unknown): unknown };
    };
  };
}

async function resetIndexedDb(page: Page, testInfo: TestInfo): Promise<void> {
  await page.goto("/");
  const configuredOrigin = new URL(String(testInfo.project.use.baseURL)).origin;
  const pageOrigin = new URL(page.url()).origin;
  // The normal personal app is localhost:5173. This explicit, dedicated
  // preview origin and Playwright's per-test browser context are disposable.
  expect(configuredOrigin).toBe("http://127.0.0.1:4173");
  expect(pageOrigin).toBe(configuredOrigin);
  const session = await page.context().newCDPSession(page);
  await session.send("Storage.clearDataForOrigin", {
    origin: configuredOrigin,
    storageTypes: "indexeddb",
  });
  await session.detach();
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Biblioteca Viva",
      exact: true,
    }),
  ).toBeVisible();
}

async function seedBooks(page: Page, count: number): Promise<void> {
  const books: readonly SeededBook[] = Array.from(
    { length: count },
    (_, index) => {
      const timestamp = new Date(
        Date.UTC(2025, 0, 1, 0, 0, index),
      ).toISOString();
      const ordinal = String(index + 1).padStart(3, "0");
      return {
        author: `Autoria descartável ${ordinal}`,
        createdAt: timestamp,
        currentPage: 0,
        favorite: false,
        id: `e2e-reading-seed-${ordinal}`,
        revision: 1,
        status: "planned",
        tagIds: [],
        title: `Livro descartável ${ordinal}`,
        type: "book",
        updatedAt: timestamp,
      };
    },
  );
  await page.evaluate(async (entries) => {
    const browser = globalThis as unknown as {
      readonly indexedDB: { open(name: string): IndexedDbOpenRequest };
    };
    await new Promise<void>((resolve, reject) => {
      const openRequest = browser.indexedDB.open("biblioteca-viva");
      openRequest.onerror = () =>
        reject(new Error("Não foi possível abrir o IndexedDB descartável."));
      openRequest.onsuccess = () => {
        const database = openRequest.result;
        const transaction = database.transaction("libraryEntries", "readwrite");
        const store = transaction.objectStore("libraryEntries");
        for (const entry of entries) store.put(entry);
        transaction.oncomplete = () => {
          database.close();
          resolve();
        };
        transaction.onerror = () =>
          reject(new Error("Não foi possível gravar o seed descartável."));
        transaction.onabort = () =>
          reject(new Error("A gravação do seed descartável foi interrompida."));
      };
    });
  }, books);
}

async function createBook(page: Page, fixture: BookFixture): Promise<void> {
  await page.goto("/novo-registro");
  await page.getByRole("button", { name: /Livro/u }).click();
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

async function navigateFromDock(page: Page, name: string): Promise<void> {
  await page.getByRole("link", { name, exact: true }).click();
}

export const test = base.extend<{
  createBook: (fixture: BookFixture) => Promise<void>;
  navigateFromDock: (name: string) => Promise<void>;
  seedBooks: (count: number) => Promise<void>;
}>({
  createBook: async ({ page }, use) => {
    await use((fixture) => createBook(page, fixture));
  },
  navigateFromDock: async ({ page }, use) => {
    await use((name) => navigateFromDock(page, name));
  },
  page: async ({ page }, use, testInfo) => {
    await resetIndexedDb(page, testInfo);
    await use(page);
  },
  seedBooks: async ({ page }, use) => {
    await use((count) => seedBooks(page, count));
  },
});

/**
 * BF-5's semantic world controls are deliberately behind the compass.
 * Reveal them through the same accessible controls a user must activate,
 * instead of forcing hidden nodes visible in a test.
 */
export async function openWorldTools(page: Page): Promise<void> {
  // Opening the tool drawer while the world is still mounting can detach its
  // controls, especially in the software-WebGL CI runner. Wait for a stable
  // ready/fallback state before following the real accessible navigation.
  const worldSurface = page.locator(".world-surface");
  await expect(worldSurface).toHaveAttribute(
    "data-status",
    /^(ready|failed)$/u,
    { timeout: 20_000 },
  );
  const library = page.locator(".library-page");
  if ((await library.getAttribute("data-tools-open")) !== "true") {
    await page
      .getByRole("button", {
        name: "Abrir ferramentas de exploração acessível",
      })
      .click();
  }
  await expect(library).toHaveAttribute("data-tools-open", "true");

  const world = page.locator("details.world-explore");
  await expect(world).toBeVisible();
  if ((await world.getAttribute("open")) === null)
    await world.locator(":scope > summary").click();
}

export { expect } from "@playwright/test";

/** Supply the mandatory BF-5 Parte 2C plan in generic six-type creation flows. */
export async function fillWorkoutPlan(page: Page) {
  await page.getByLabel("Data de início").fill("2026-11-01");
  await page.getByLabel("Data final").fill("2026-11-30");
  await page.getByRole("checkbox", { name: "Qua", exact: true }).check();
  await page
    .getByRole("button", { name: "Adicionar exercício", exact: true })
    .click();
  await page.getByLabel("Nome do exercício").fill("Movimento fictício");
}
