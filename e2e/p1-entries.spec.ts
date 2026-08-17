import { expect, test } from "./fixtures";

test("Coleção registra e encontra os seis tipos de P1", async ({
  createBook,
  page,
}) => {
  await createBook({ title: "Livro P1 Fictício" });

  for (const record of [
    { type: "Filme", title: "Filme P1 Fictício" },
    { type: "Série", title: "Série P1 Fictícia" },
    { type: "Estudo", title: "Estudo P1 Fictício" },
    { type: "Atividade física", title: "Caminhada P1 Fictícia" },
    { type: "Trabalho", title: "Projeto P1 Fictício" },
  ]) {
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

  await page.goto("/colecao");
  for (const title of [
    "Livro P1 Fictício",
    "Filme P1 Fictício",
    "Série P1 Fictícia",
    "Estudo P1 Fictício",
    "Caminhada P1 Fictícia",
    "Projeto P1 Fictício",
  ])
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

  await page.getByLabel("Tipo").selectOption("movie");
  await expect(
    page.getByRole("heading", { name: "Filme P1 Fictício" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Livro P1 Fictício" }),
  ).toHaveCount(0);
});
