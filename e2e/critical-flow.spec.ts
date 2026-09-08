import { expect, test } from "./fixtures";

test("ciclo principal persiste livro, edição, anotações e conclusão", async ({
  createBook,
  navigateFromDock,
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
  await expect(
    page.getByText("120 de 240 páginas", { exact: true }),
  ).toBeVisible();

  await page.locator("summary", { hasText: "Adicionar nota" }).click();
  await page.getByLabel("Nota (obrigatório)").fill("Nota fictícia de leitura.");
  await page.getByRole("button", { name: "Adicionar nota" }).click();
  await page.locator("summary", { hasText: "Histórico de leitura" }).click();
  await expect(page.getByText("Nota fictícia de leitura.")).toBeVisible();
  await page.getByRole("button", { name: "Editar nota" }).click();
  await page
    .getByLabel("Editar conteúdo da nota")
    .fill("Nota fictícia revisada.");
  await page.getByRole("button", { name: "Salvar nota" }).click();
  await expect(page.getByText("Nota fictícia revisada.")).toBeVisible();
  await page.getByRole("button", { name: "Compartilhar nota" }).click();
  await expect(
    page
      .getByText("O compartilhamento não está disponível nesta plataforma.")
      .last(),
  ).toBeVisible();

  await page.locator("summary", { hasText: "Adicionar citação" }).click();
  await page
    .getByLabel("Citação (obrigatório)")
    .fill("Citação fictícia para regressão.");
  await page.getByLabel("Página (opcional)").fill("121");
  await page.getByRole("button", { name: "Adicionar citação" }).click();
  await expect(
    page.getByText("Citação fictícia para regressão."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Editar citação" }).click();
  await page
    .getByLabel("Editar conteúdo da citação")
    .fill("Citação fictícia revisada.");
  await page.getByLabel("Página (opcional)").last().fill("122");
  await page.getByRole("button", { name: "Salvar citação" }).click();
  await expect(page.getByText("Citação fictícia revisada.")).toBeVisible();
  await page.getByRole("button", { name: "Compartilhar citação" }).click();
  await expect(
    page
      .getByText("O compartilhamento não está disponível nesta plataforma.")
      .last(),
  ).toBeVisible();

  await page.getByRole("button", { name: "Excluir nota" }).click();
  await page.getByRole("button", { name: "Excluir nota" }).click();
  await expect(page.getByText("Nota fictícia revisada.")).toHaveCount(0);
  await page.getByRole("button", { name: "Excluir citação" }).click();
  await page.getByRole("button", { name: "Excluir citação" }).click();
  await expect(page.getByText("Citação fictícia revisada.")).toHaveCount(0);

  await page.locator("summary", { hasText: "Status da leitura" }).click();
  await page.getByRole("button", { name: "Concluir leitura" }).click();
  await expect(page.getByText("Status atual: Concluído.")).toBeVisible();
  await page.getByRole("link", { name: "Editar dados" }).click();
  await page.getByLabel("Título").fill("A Casa das Palavras — revista");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(
    page.getByRole("heading", { name: "A Casa das Palavras — revista" }),
  ).toBeVisible();

  await navigateFromDock("Resumo e estatísticas");
  await expect(
    page.getByText("Concluídos").locator("..").getByText("1"),
  ).toBeVisible();

  await page.reload();
  await expect(
    page.getByText("Concluídos").locator("..").getByText("1"),
  ).toBeVisible();
  await navigateFromDock("Coleção");
  await expect(
    page.getByRole("heading", { name: "A Casa das Palavras — revista" }),
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
  await expect(
    page.getByRole("heading", {
      name: "Uma nova experiência está sendo preparada",
    }),
  ).toBeVisible();

  await page.goto("/registros/id-inexistente");
  await expect(
    page.getByRole("heading", { name: "Não foi possível abrir o registro" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Voltar à Coleção" }),
  ).toBeVisible();
});
