import { chooseRecordType, recordSaveLabel } from "./fixtures";
import { fillWorkoutPlan, expect, test } from "./fixtures";

test("BF-5R4: seis rituais criam, reabrem e editam sem perder referências", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const category of [
    "Livro",
    "Filme",
    "Série",
    "Estudo",
    "Atividade física",
    "Trabalho",
  ]) {
    await page.goto("/novo-registro");
    await chooseRecordType(page, category);
    const title = `${category} do Santuário Fictício`;
    await page
      .getByLabel(
        category === "Atividade física"
          ? "Nome do treino"
          : category === "Livro"
            ? "Título (obrigatório)"
            : "Título",
        {
          exact: true,
        },
      )
      .fill(title);
    if (category === "Livro")
      await page.getByLabel("Autor (opcional)").fill("Autoria fictícia");
    if (category === "Filme")
      await page.getByLabel("Diretor / criador").fill("Direção fictícia");
    if (category === "Série")
      await page.getByLabel("Total de episódios").fill("12");
    if (category === "Estudo")
      await page
        .getByLabel("Disciplina (opcional)")
        .fill("Astronomia fictícia");
    if (category === "Atividade física") await fillWorkoutPlan(page);
    await page
      .getByRole("button", {
        name: recordSaveLabel(category),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    if (category === "Trabalho") {
      await page
        .locator(".work-next")
        .getByRole("button", { name: "Escolher", exact: true })
        .click();
      const editor = page.locator("dialog[open]").last();
      await editor
        .getByLabel("Próxima ação escrita")
        .fill("Revisar manuscrito fictício");
      await editor.getByRole("button", { name: "Salvar", exact: true }).click();
      await expect(page.locator(".work-next")).toContainText(
        "Revisar manuscrito fictício",
      );
    }
    if (category === "Livro")
      await page.locator("#book-secondary > summary").click();
    if (category === "Filme" || category === "Série")
      await page.locator("#cinema-actions > summary").click();
    await page
      .getByRole("link", {
        name: category === "Atividade física" ? "Editar treino ↗" : /Editar/,
      })
      .click();
    const titleField = page.getByLabel(
      category === "Atividade física"
        ? "Nome do treino"
        : category === "Livro"
          ? "Título (obrigatório)"
          : "Título",
      { exact: true },
    );
    await expect(titleField).toHaveValue(title);
    await titleField.fill(`${title} revisado`);
    await page
      .getByRole("button", {
        name: recordSaveLabel(category, true),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", { name: `${title} revisado`, exact: true }),
    ).toBeVisible();
    if (category === "Trabalho")
      await expect(page.locator(".work-next")).toContainText(
        "Revisar manuscrito fictício",
      );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("BF-5R4: arraste de um movimento responde em retrato e paisagem", async ({
  page,
}) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const canvas = page.locator("canvas");
    await expect(canvas).toHaveAttribute("data-fixture-status", "ready");
    await expect(canvas).toHaveAttribute("data-camera-zoom", "1.000");
    const before = await canvas.getAttribute("data-camera-target-x");
    await page.mouse.move(viewport.width / 2, viewport.height / 2);
    await page.mouse.down();
    await page.mouse.move(viewport.width / 2 + 50, viewport.height / 2 + 20);
    await page.mouse.up();
    await expect(canvas).not.toHaveAttribute(
      "data-camera-target-x",
      before ?? "",
    );
    await expect(canvas).toHaveAttribute("data-gesture", "idle");
  }
});

test("BF-5R4: dock permanece dentro da viewport e navega em desktop e retrato", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/colecao");
    const dock = page.getByRole("navigation", { name: "Navegação principal" });
    for (const link of await dock.getByRole("link").all()) {
      const box = await link.boundingBox();
      expect(box).not.toBeNull();
      if (!box) throw new Error("Destino ausente");
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    }
    await dock.getByRole("link", { name: "Resumo e estatísticas" }).click();
    await expect(
      page.getByRole("heading", { name: "Observatório", exact: true }),
    ).toBeVisible();
    await dock.getByRole("link", { name: "Coleção", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Acervo encantado", exact: true }),
    ).toBeVisible();
  }
});
