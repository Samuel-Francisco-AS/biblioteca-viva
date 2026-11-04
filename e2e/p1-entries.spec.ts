import { chooseRecordType, recordSaveLabel } from "./fixtures";
import { fillWorkoutPlan, expect, test } from "./fixtures";

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
    await chooseRecordType(page, record.type);
    await page
      .getByLabel(
        record.type === "Atividade física" ? "Nome do treino" : "Título",
      )
      .fill(record.title);
    if (record.type === "Atividade física") await fillWorkoutPlan(page);
    await page
      .getByRole("button", { name: recordSaveLabel(record.type) })
      .click();
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

  await page
    .getByRole("button", { name: "Entretenimento", exact: true })
    .click();
  await page.getByText(/Explorar catálogo/).click();
  await page.getByRole("button", { name: "Filme", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Filme P1 Fictício" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Livro P1 Fictício" }),
  ).toHaveCount(0);
});
