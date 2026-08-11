import { expect, test } from "./fixtures";

test("ciclo principal persiste livro, anotações, conclusão e marco", async ({
  createBook,
  page,
}) => {
  await createBook({
    author: "Autora Exemplo",
    currentPage: 12,
    status: "in_progress",
    title: "A Casa das Palavras",
    totalPages: 240,
  });

  await page.getByLabel("Página atual (obrigatório)").fill("120");
  await page.getByRole("button", { name: "Salvar progresso" }).click();
  await expect(page.getByText("120 de 240 páginas")).toBeVisible();

  await page.getByLabel("Nota (obrigatório)").fill("Nota fictícia de leitura.");
  await page.getByRole("button", { name: "Adicionar nota" }).click();
  await expect(page.getByText("Nota fictícia de leitura.")).toBeVisible();

  await page
    .getByLabel("Citação (obrigatório)")
    .fill("Citação fictícia para regressão.");
  await page.getByLabel("Página (opcional)").fill("121");
  await page.getByRole("button", { name: "Adicionar citação" }).click();
  await expect(
    page.getByText("Citação fictícia para regressão."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Concluir leitura" }).click();
  await expect(page.getByText("Status atual: Concluído.")).toBeVisible();
  await expect(
    page.getByText(/luminária de leitura foi desbloqueada/u),
  ).toBeVisible();

  await page.getByRole("link", { name: "Biblioteca" }).click();
  await expect(
    page.getByText("Concluídos agora").locator("..").getByText("1"),
  ).toBeVisible();
  await expect(
    page.getByText(/a luminária de leitura permanece na sala/u),
  ).toBeVisible();

  await page.reload();
  await expect(page.getByText("Concluídos agora")).toBeVisible();
  await expect(
    page.getByText(/a luminária de leitura permanece na sala/u),
  ).toBeVisible();
  await page.getByRole("link", { name: "Coleção", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A Casa das Palavras" }),
  ).toBeVisible();
});

test("rotas inexistentes e livro ausente degradam para caminhos convencionais", async ({
  page,
}) => {
  await page.goto("/caminho-inexistente");
  await expect(
    page.getByRole("heading", { name: "Esta página não existe" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Voltar para a Biblioteca" }).click();
  await expect(page.getByRole("link", { name: "Abrir Coleção" })).toBeVisible();

  await page.goto("/livros/id-inexistente");
  await expect(
    page.getByRole("heading", { name: "Livro não encontrado" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Voltar à Coleção" }),
  ).toBeVisible();
});
