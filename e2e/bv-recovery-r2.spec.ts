import { test, expect } from "@playwright/test";
import {
  createBook,
  createMovie,
  createSeries,
  createStudy,
  createPhysicalActivity,
  createWork,
} from "../src/domain";

test("R2: six real records retain React selection, highlights and identity after reload", async ({
  page,
}, testInfo) => {
  const createdAt = "2026-11-06T12:00:00.000Z";
  const entries = [
    createBook({
      createdAt,
      id: "r2-book",
      title: "R2 livro fictício",
      currentPage: 0,
    }),
    createMovie({ createdAt, id: "r2-movie", title: "R2 filme fictício" }),
    createSeries({
      createdAt,
      id: "r2-series",
      title: "R2 série fictícia",
      episodesWatched: 0,
    }),
    createStudy({
      createdAt,
      id: "r2-study",
      title: "R2 estudo fictício",
      progressCurrent: 0,
      progressUnit: "hours",
    }),
    createPhysicalActivity({
      createdAt,
      id: "r2-activity",
      title: "R2 treino fictício",
      category: "mixed",
    }),
    createWork({ createdAt, id: "r2-work", title: "R2 trabalho fictício" }),
  ];
  await page.goto("/colecao");
  await expect(
    page.getByRole("navigation", { name: "Navegação principal" }),
  ).toBeVisible();
  expect(new URL(page.url()).origin).toBe("http://127.0.0.1:4173");
  await page.evaluate(async (entries) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("biblioteca-viva");
      request.onerror = () =>
        reject(
          new Error(request.error?.message ?? "Falha ao abrir base fictícia."),
        );
      request.onsuccess = () => {
        const database = request.result;
        const transaction = database.transaction("libraryEntries", "readwrite");
        for (const entry of entries)
          transaction.objectStore("libraryEntries").put(entry);
        transaction.oncomplete = () => {
          database.close();
          resolve();
        };
        transaction.onerror = () =>
          reject(
            new Error(transaction.error?.message ?? "Falha no seed fictício."),
          );
      };
    });
  }, entries);
  await page.goto("/");
  const canvas = page.locator("canvas[data-three-world-canvas='true']");
  await expect(canvas).toHaveAttribute("data-fixture-status", "ready");
  await page
    .getByRole("button", { name: "Abrir ferramentas de exploração acessível" })
    .click();
  await expect(page.locator(".library-page")).toHaveAttribute(
    "data-tools-open",
    "true",
  );
  await page
    .getByText("Registros · alternativa acessível", { exact: true })
    .click();
  for (const [label, title, id] of [
    ["Livro", "R2 livro fictício", "reading-book:r2-book"],
    ["Filme", "R2 filme fictício", "library-movie:r2-movie"],
    ["Série", "R2 série fictícia", "library-series:r2-series"],
    ["Estudo", "R2 estudo fictício", "library-study:r2-study"],
    [
      "Atividade física",
      "R2 treino fictício",
      "library-physical-activity:r2-activity",
    ],
    ["Trabalho", "R2 trabalho fictício", "library-work:r2-work"],
  ]) {
    await page
      .getByRole("button", {
        name: `Selecionar no ambiente: ${label} ${title}`,
        exact: true,
      })
      .click();
    await expect(canvas).toHaveAttribute("data-selected-object", id);
    await expect(canvas).toHaveAttribute("data-highlighted-object", id);
  }
  await page.screenshot({ path: testInfo.outputPath("r2-react-world.png") });
  await page.reload();
  await expect(canvas).toHaveAttribute("data-fixture-status", "ready");
  await page
    .getByRole("button", { name: "Abrir ferramentas de exploração acessível" })
    .click();
  await expect(page.locator(".library-page")).toHaveAttribute(
    "data-tools-open",
    "true",
  );
  await page
    .getByText("Registros · alternativa acessível", { exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Selecionar no ambiente: Trabalho R2 trabalho fictício",
      exact: true,
    })
    .click();
  await expect(canvas).toHaveAttribute(
    "data-selected-object",
    "library-work:r2-work",
  );
});
