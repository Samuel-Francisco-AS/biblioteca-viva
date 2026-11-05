import { mkdir, writeFile } from "node:fs/promises";
import { expect, test } from "./fixtures";
import { chooseBVOption } from "./pickers";
const evidence = "docs/evidence/BF-5P2F";
test.use({
  locale: "pt-BR",
  timezoneId: "America/Fortaleza",
  hasTouch: true,
  isMobile: true,
  viewport: { width: 390, height: 844 },
});
test("empreitada nasce só com título, organiza etapas/tarefas, progresso, prioridade e diário e reabre sem duplicação", async ({
  page,
}) => {
  await page.goto("/novo-registro");
  await page.getByRole("button", { name: /Trabalho/ }).click();
  await page
    .getByRole("textbox", { name: "Título", exact: true })
    .fill("Observatório de papel");
  await page.getByRole("button", { name: "Salvar registro" }).click();
  await expect(
    page.getByRole("heading", { name: "Observatório de papel" }),
  ).toBeVisible();
  await expect(page.locator(".work-progress__number")).toHaveText("—");
  await page.getByRole("button", { name: "＋ Etapa", exact: true }).click();
  let dialog = page.locator("dialog[open]").last();
  await dialog.getByLabel("Nome da etapa").fill("Planta e materiais");
  await dialog
    .getByLabel("Referência (opcional)")
    .fill("https://example.org/planta");
  await dialog.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await page.getByRole("button", { name: "＋ Tarefa nesta etapa" }).click();
  dialog = page.locator("dialog[open]").last();
  await dialog.getByLabel("Título da tarefa").fill("Desenhar a cúpula");
  await dialog
    .getByLabel("Descrição ou critério de conclusão")
    .fill("Planta revisada e medidas conferidas.");
  await dialog.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.getByRole("checkbox", { name: "Concluir tarefa: Desenhar a cúpula" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "＋ Tarefa nesta etapa" }).click();
  dialog = page.locator("dialog[open]").last();
  await dialog.getByLabel("Título da tarefa").fill("Validar os encaixes");
  await chooseBVOption(
    page,
    dialog.getByLabel("Estado", { exact: true }),
    "blocked",
  );
  await dialog.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page
      .locator(".work-task")
      .filter({ hasText: "Validar os encaixes" })
      .locator(".work-task__meta"),
  ).toContainText("Bloqueada");
  await page
    .getByRole("checkbox", { name: "Concluir tarefa: Desenhar a cúpula" })
    .click();
  await expect(
    page.getByRole("checkbox", { name: "Reabrir tarefa: Desenhar a cúpula" }),
  ).toBeChecked();
  await expect(page.locator(".work-progress__number")).toHaveText("50%");
  await page
    .locator(".work-task")
    .filter({ hasText: "Validar os encaixes" })
    .locator("summary")
    .click();
  await page
    .getByRole("button", { name: "Definir próxima ação", exact: true })
    .click();
  await expect(page.locator(".work-next__task")).toContainText(
    "Validar os encaixes",
  );
  await page.getByRole("button", { name: "＋ Escrever" }).click();
  dialog = page.locator("dialog[open]").last();
  await chooseBVOption(page, dialog.getByLabel("Tipo de registro"), "decision");
  await dialog
    .getByLabel("Registro do diário")
    .fill(
      "Planta revisada. A validação dos encaixes ficou para a próxima etapa.",
    );
  await dialog.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.locator(".work-journal__entries")).toContainText(
    "Planta revisada.",
  );
  await page.reload();
  await expect(page.locator(".work-task")).toHaveCount(2);
  await expect(page.locator(".work-progress__number")).toHaveText("50%");
  await expect(page.locator(".work-journal__entries > li")).toHaveCount(1);
  await expect(
    page.getByText("Sessões de trabalho e resultados", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("#bv-startup-veil")).toHaveCount(0);
  await mkdir(evidence, { recursive: true });
  const contrast = await page.locator(".work-folio").evaluate((folio) => {
    const luminance = (color: string) => {
      const values = (color.match(/\d+/g) ?? [])
        .slice(0, 3)
        .map(Number)
        .map((n) => {
          const c = n / 255;
          return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
      return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
    };
    const paper = luminance(getComputedStyle(folio).backgroundColor);
    return Array.from(
      folio.querySelectorAll("h2,h3,h4,a,.work-section-heading button"),
    ).map((node) => {
      const ink = luminance(getComputedStyle(node).color);
      return (Math.max(paper, ink) + 0.05) / (Math.min(paper, ink) + 0.05);
    });
  });
  expect(Math.min(...contrast)).toBeGreaterThanOrEqual(4.5);
  await page.screenshot({
    path: `${evidence}/empreitada-retrato.png`,
    fullPage: true,
  });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.screenshot({
    path: `${evidence}/empreitada-paisagem.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("checkbox", { name: "Reabrir tarefa: Desenhar a cúpula" })
    .click();
  await expect(
    page.getByRole("checkbox", { name: "Concluir tarefa: Desenhar a cúpula" }),
  ).not.toBeChecked();
  await expect(page.locator(".work-progress__number")).toHaveText("0%");
});
test("estrelas persistem em livros e o PNG contém três douradas nas três proporções; ocultar/remover elimina as estrelas", async ({
  page,
  createBook,
}) => {
  await createBook({
    title: "O Atlas das Marés",
    author: "Autora fictícia",
    totalPages: 100,
    currentPage: 20,
  });
  await page.getByRole("radio", { name: "3 de 5 estrelas" }).check();
  await expect(page.locator(".persisted-rating [role=status]")).toHaveText(
    "Avaliação salva.",
  );
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "3 de 5 estrelas" }),
  ).toBeChecked();
  await page.getByRole("radio", { name: "3 de 5 estrelas" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("radio", { name: "4 de 5 estrelas" }),
  ).toBeChecked();
  await expect(page.locator(".persisted-rating")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await page.getByRole("radio", { name: "3 de 5 estrelas" }).check();
  await expect(page.locator(".persisted-rating")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await expect(page.locator("#bv-startup-veil")).toHaveCount(0);
  await mkdir(evidence, { recursive: true });
  await page.screenshot({
    path: `${evidence}/avaliacao-livro-retrato.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Criar imagem da leitura" }).click();
  const dialog = page.locator("dialog[open]").last();
  const preview = dialog.getByRole("img");
  await expect(preview).toBeVisible();
  async function inspectPng() {
    return preview.evaluate(async (node) => {
      const image = node as HTMLImageElement;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas ausente");
      ctx.drawImage(image, 0, 0);
      const rgba = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const bins = new Set<number>();
      for (let i = 0; i < rgba.length; i += 4)
        if (rgba[i] === 148 && rgba[i + 1] === 101 && rgba[i + 2] === 27)
          bins.add(Math.floor(((i / 4) % canvas.width) / 48));
      return {
        width: canvas.width,
        height: canvas.height,
        goldColumns: bins.size,
        src: image.src,
      };
    });
  }
  for (const [name, height] of [
    ["Publicação · 4:5", 1350],
    ["Story · 9:16", 1920],
    ["Quadrado · 1:1", 1080],
  ] as const) {
    await dialog.getByRole("radio", { name, exact: true }).check();
    await expect(preview).toBeVisible();
    const png = await inspectPng();
    expect(png.width).toBe(1080);
    expect(png.height).toBe(height);
    expect(png.goldColumns).toBeGreaterThanOrEqual(3);
    await writeFile(
      `${evidence}/banner-livro-${height}.png`,
      Buffer.from(png.src.split(",")[1], "base64"),
    );
  }
  await dialog.getByText("Imagem e acabamento", { exact: true }).click();
  await dialog.getByLabel("Incluir avaliação, quando houver").uncheck();
  await expect(preview).toBeVisible();
  expect((await inspectPng()).goldColumns).toBe(0);
  await dialog.getByRole("button", { name: "Fechar prévia" }).click();
  await page.getByRole("button", { name: "Remover avaliação" }).click();
  await expect(page.locator(".persisted-rating [role=status]")).toHaveText(
    "Avaliação removida.",
  );
  await page.reload();
  await expect(page.locator(".star-rating__value")).toHaveText("Sem avaliação");
  await page.getByRole("button", { name: "Criar imagem da leitura" }).click();
  await expect(preview).toBeVisible();
  expect((await inspectPng()).goldColumns).toBe(0);
});
test("avaliação audiovisual usa o catálogo existente e preserva a nota ao salvar acompanhamento e editar", async ({
  page,
}) => {
  await page.goto("/novo-registro");
  await page.getByRole("button", { name: /Entretenimento/ }).click();
  await page.getByRole("button", { name: /Filme/ }).click();
  await page
    .getByRole("textbox", { name: "Título", exact: true })
    .fill("O Farol do Inverno");
  await page.getByRole("radio", { name: "4 de 5 estrelas" }).check();
  await page.getByRole("button", { name: "Salvar obra", exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "4 de 5 estrelas" }),
  ).toBeChecked();
  await page.getByRole("radio", { name: "2 de 5 estrelas" }).check();
  await expect(page.locator(".persisted-rating [role=status]")).toHaveText(
    "Avaliação salva.",
  );
  await page.getByRole("button", { name: "Salvar acompanhamento" }).click();
  await expect(page.locator(".cinema-feedback")).toContainText("salvo");
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "2 de 5 estrelas" }),
  ).toBeChecked();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator("#bv-startup-veil")).toHaveCount(0);
  await mkdir(evidence, { recursive: true });
  await page.screenshot({
    path: `${evidence}/avaliacao-cinema-paisagem.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Criar banner cinematográfico" })
    .click();
  const preview = page.locator("dialog[open]").getByRole("img");
  await expect(preview).toBeVisible();
  const src = await preview.getAttribute("src");
  if (!src) throw new Error("PNG ausente");
  await writeFile(
    `${evidence}/banner-cinema.png`,
    Buffer.from(src.split(",")[1], "base64"),
  );
});
