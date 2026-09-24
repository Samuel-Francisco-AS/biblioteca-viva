import { expect, test } from "./fixtures";

test("coleção vazia mantém estantes sem livros artificiais e caminho convencional", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Registros da Biblioteca", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Ainda não há registros na Biblioteca",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Selecionar no ambiente:/u }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Criar registro" }),
  ).toHaveAttribute("href", "/novo-registro");
  await expect(
    page.locator("canvas[data-three-world-canvas='true']"),
  ).toHaveCount(1);
});

test("livros convencionais preservam identidade entre lista, runtime, seleção e retorno", async ({
  createBook,
  page,
}) => {
  await createBook({ author: "Autora A", title: "Livro real A" });
  await createBook({ author: "Autor B", title: "Livro real B" });

  await page.goto("/");
  const canvas = page.locator("canvas[data-three-world-canvas='true']");
  await expect(canvas).toHaveAttribute("data-fixture-status", "ready");
  await expect(
    page.getByRole("link", { name: "Livro real A", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Livro real B", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "2 livros representados; 0 livros fora da capacidade visual atual.",
    ),
  ).toBeVisible();

  const bookA = page.locator(".reading-area-books li").filter({
    has: page.getByRole("link", { name: "Livro real A", exact: true }),
  });
  const bookB = page.locator(".reading-area-books li").filter({
    has: page.getByRole("link", { name: "Livro real B", exact: true }),
  });
  const selectA = bookA.getByRole("button", {
    name: /Selecionar no ambiente:/u,
  });
  const selectB = bookB.getByRole("button", {
    name: /Selecionar no ambiente:/u,
  });
  const selectionButtons = page.getByRole("button", {
    name: /Selecionar no ambiente:/u,
  });
  await expect(selectionButtons).toHaveCount(2);
  await selectA.click();
  await expect(canvas).toHaveAttribute(
    "data-selected-object",
    /^reading-book:/u,
  );
  const selectedA = await canvas.getAttribute("data-selected-object");
  expect(selectedA).not.toBeNull();
  await expect(canvas).toHaveAttribute(
    "data-highlighted-object",
    selectedA ?? "",
  );
  await expect(selectA).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("link", { name: "Abrir registro" }),
  ).toHaveAttribute("href", /\/registros\//u);

  await page.getByRole("button", { name: "Próximo →" }).click();
  await expect(selectB).toHaveAttribute("aria-pressed", "true");
  await expect(canvas).toHaveAttribute(
    "data-selected-object",
    /^reading-book:/u,
  );
  expect(await canvas.getAttribute("data-selected-object")).not.toBe(selectedA);

  await selectA.click();
  await expect(canvas).toHaveAttribute("data-selected-object", selectedA ?? "");
  await page.getByRole("link", { name: "Abrir registro" }).click();
  await expect(
    page.getByRole("heading", { name: "Livro real A" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Editar dados" }).click();
  await page.getByLabel("Título").fill("Livro real A atualizado");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(
    page.getByRole("heading", { name: "Livro real A atualizado" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Biblioteca", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Livro real A atualizado" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Livro real A", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /Selecionar no ambiente:/u }),
  ).toHaveCount(2);
});

test("overflow mantém 71 livros convencionais sem criar selecionável para o excedente", async ({
  createBook,
  page,
  seedBooks,
}) => {
  await seedBooks(70);
  await createBook({ title: "Livro real excedente" });

  await page.goto("/");
  await expect(
    page.getByText(
      "70 livros representados; 1 livro fora da capacidade visual atual.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Livro real excedente" }),
  ).toHaveAttribute("href", /\/registros\//u);
  await expect(
    page.getByText("Fora da capacidade visual atual.", { exact: true }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: /Selecionar no ambiente:/u }),
  ).toHaveCount(70);
  await expect(page.locator(".reading-area-books li")).toHaveCount(71);
});

test("retornos da Biblioteca removem o canvas anterior e reconstruem um único snapshot", async ({
  createBook,
  page,
}) => {
  await createBook({ title: "Livro para lifecycle" });
  await page.goto("/");
  const canvas = page.locator("canvas[data-three-world-canvas='true']");

  for (let cycle = 1; cycle <= 3; cycle += 1) {
    await expect(canvas, `canvas único no ciclo ${cycle}`).toHaveCount(1);
    await expect(canvas).toHaveAttribute("data-active-frame-loops", "1");
    await expect(
      page.getByRole("button", { name: /Selecionar no ambiente:/u }),
    ).toHaveCount(1);
    await page.getByRole("link", { name: "Coleção", exact: true }).click();
    await expect(canvas, `canvas removido no ciclo ${cycle}`).toHaveCount(0);
    await page.getByRole("link", { name: "Biblioteca", exact: true }).click();
  }

  await expect(canvas).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: /Selecionar no ambiente:/u }),
  ).toHaveCount(1);
});

test("seis tipos abrem pela Biblioteca e filme preserva edição e retorno", async ({
  createBook,
  page,
}) => {
  await createBook({ title: "Livro BF3 fictício" });
  const records = [
    { type: "Filme", title: "Filme BF3 fictício" },
    { type: "Série", title: "Série BF3 fictícia" },
    { type: "Estudo", title: "Estudo BF3 fictício" },
    { type: "Atividade física", title: "Atividade BF3 fictícia" },
    { type: "Trabalho", title: "Trabalho BF3 fictício" },
  ];
  for (const record of records) {
    await page.goto("/novo-registro");
    await page
      .getByRole("button", { name: new RegExp(record.type, "u") })
      .click();
    await page.getByLabel("Título").fill(record.title);
    await page.getByRole("button", { name: "Salvar registro" }).click();
    await expect(
      page.getByRole("heading", { name: record.title }),
    ).toBeVisible();
  }

  await page.goto("/");
  const canvas = page.locator("canvas[data-three-world-canvas='true']");
  await expect(canvas).toHaveAttribute("data-fixture-status", "ready");
  for (const title of [
    "Livro BF3 fictício",
    ...records.map(({ title }) => title),
  ]) {
    await expect(
      page.getByRole("link", { name: title, exact: true }),
    ).toBeVisible();
  }
  await page
    .getByRole("button", {
      name: "Selecionar no ambiente: Filme Filme BF3 fictício",
    })
    .click();
  await expect(canvas).toHaveAttribute(
    "data-selected-object",
    /^library-movie:/u,
  );
  await expect(
    page.getByText("Filme selecionado: Filme BF3 fictício."),
  ).toBeVisible();
  await page.getByRole("link", { name: "Abrir registro" }).click();
  await expect(
    page.getByRole("heading", { name: "Filme BF3 fictício" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Editar" }).click();
  await page.getByLabel("Título").fill("Filme BF3 editado");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(
    page.getByRole("heading", { name: "Filme BF3 editado" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Voltar à Biblioteca" }).click();
  await expect(
    page.getByRole("link", { name: "Filme BF3 editado" }),
  ).toBeVisible();
  await expect(canvas).toHaveCount(1);
});
