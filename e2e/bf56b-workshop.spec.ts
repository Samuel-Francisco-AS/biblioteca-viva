import { readFile } from "node:fs/promises";
// Fresh Playwright contexts on the dedicated preview origin. Only the residency
// scenario mounts Three.js; form/review tests do not pay an unrelated world boot.
import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
async function echo(page: Page, title: string, deck?: string) {
  await page.goto("/arcanario/oficina/nova");
  await page.getByLabel("Título do Eco (opcional)").fill(title);
  await page
    .getByRole("textbox", { name: /Frente · pergunta ou pista/ })
    .fill(`Pergunta de ${title}?`);
  await page
    .getByRole("textbox", { name: /Verso · resposta ou descoberta/ })
    .fill(`Resposta de ${title}.`);
  if (deck) {
    await page.getByText("Baralhos & coleções", { exact: true }).click();
    await page.getByRole("checkbox", { name: deck, exact: true }).check();
  }
  await page.getByRole("button", { name: "Guardar carta no acervo" }).click();
  await expect(
    page.getByRole("link", { name: "Editar na Oficina" }),
  ).toBeVisible();
}
test("B: portal acessível, teclado e retorno preservam o mesmo Canvas residente", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toHaveCount(1);
  await page
    .locator("canvas")
    .evaluate((node) => node.setAttribute("data-bf56b-resident", "same"));
  await page.getByRole("link", { name: "Coleção", exact: true }).click();
  await page.getByRole("link", { name: /Cartas, Ecos e Relicário/ }).click();
  await expect(
    page.getByRole("heading", { name: "O Arcanário", exact: true, level: 2 }),
  ).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator("canvas")).toBeHidden();
  const acervo = page
    .getByRole("navigation", { name: "Salas do Arcanário" })
    .getByRole("link", { name: "Acervo", exact: true });
  await acervo.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Acervo global" }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Portal do Arcanário/ }).click();
  await page.getByRole("link", { name: /Voltar à Biblioteca/ }).click();
  await expect(page.locator("canvas[data-bf56b-resident=same]")).toBeVisible();
});
test("B: Oficina, baralho, duas respostas, interrupção, reload e histórico real", async ({
  page,
}) => {
  await page.goto("/arcanario/baralhos/novo");
  await page.getByLabel("Nome do baralho").fill("Constelações fictícias");
  await page.getByRole("button", { name: "Salvar baralho" }).click();
  await expect(
    page.getByRole("heading", { name: "Constelações fictícias" }),
  ).toBeVisible();
  const deck = page.url();
  await echo(page, "Eco de Aryn", "Constelações fictícias");
  await echo(page, "Eco de Lua", "Constelações fictícias");
  await page.goto(deck);
  await page.getByRole("button", { name: "Subir carta 2" }).click();
  await page.getByRole("button", { name: "Salvar baralho" }).click();
  await expect(page.getByText("Baralho salvo.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Revisar Ecos do baralho" }).click();
  await expect(
    page.getByRole("heading", { name: "Pergunta de Eco de Lua?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Lembrei · próximo Eco" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: /Virar carta · revelar resposta/ })
    .click();
  await page.getByRole("button", { name: "Lembrei · próximo Eco" }).click();
  await expect(page.getByText(/1 de 2 respostas confirmadas/)).toBeVisible();
  await page
    .getByRole("link", { name: /Interromper e guardar rodada/ })
    .click();
  await page.reload();
  await page.getByRole("link", { name: /Retomar do próximo Eco/ }).click();
  await expect(page.getByText(/1 de 2 respostas confirmadas/)).toBeVisible();
  await page
    .getByRole("button", { name: /Virar carta · revelar resposta/ })
    .click();
  await page
    .getByRole("button", { name: "Preciso revisar", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Rodada concluída" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Rodada concluída" }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Voltar aos Ecos/ }).click();
  await expect(page.getByText("2/2 respostas · 1 lembradas")).toBeVisible();
});
test("B: Relicário com imagem, rascunho, retrato/paisagem, edição e arquivamento", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/arcanario/oficina/nova?tipo=memory");
  await page.getByLabel("Título da lembrança").fill("Jardim de papel fictício");
  await page
    .getByRole("textbox", { name: /Inscrição · texto da lembrança/ })
    .fill("Uma lembrança fictícia, guardada com carinho entre as páginas.");
  await page.getByLabel("Categoria decorativa").fill("Obras queridas");
  await page
    .getByLabel("Imagem local (opcional)")
    .setInputFiles("e2e/fixtures/entertainment/ceu-ficticio.jpg");
  await expect(page.locator(".arcana-preview img")).toBeVisible();
  await page.getByRole("radio", { name: "Pergaminho · ouro" }).check();
  await page.getByLabel("Moldura", { exact: true }).selectOption("illuminated");
  await page.reload();
  await expect(page.getByText(/Rascunho recuperado/)).toBeVisible();
  await expect(page.getByLabel("Título da lembrança")).toHaveValue(
    "Jardim de papel fictício",
  );
  await expect(page.locator(".arcana-preview img")).toBeVisible();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator(".arcanarium")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Guardar carta no acervo" }).click();
  await expect(
    page.getByRole("link", { name: "Editar na Oficina" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator(".arcana-detail img")).toBeVisible();
  await page.getByRole("link", { name: "Editar na Oficina" }).click();
  await page
    .getByRole("button", { name: "Retirar imagem desta revisão" })
    .click();
  await page.getByRole("button", { name: "Guardar carta no acervo" }).click();
  await expect(
    page.getByRole("link", { name: "Editar na Oficina" }),
  ).toBeVisible();
  await expect(page.locator(".arcana-detail img")).toHaveCount(0);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Arquivar carta global" }).click();
  await expect(page.getByText(/Lembrança · Arquivada/)).toBeVisible();
});
test("B: exportação real, arquivo inválido, importação como cópia e importação repetida", async ({
  page,
}) => {
  await echo(page, "Eco de troca");
  await page.goto("/arcanario/baralhos/novo");
  await page.getByLabel("Nome do baralho").fill("Arquivo de troca fictício");
  await page
    .getByRole("button", { name: /Adicionar carta Eco de troca/ })
    .click();
  await page.getByRole("button", { name: "Salvar baralho" }).click();
  await expect(
    page.getByRole("heading", { name: "Arquivo de troca fictício" }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar baralho autoral" }).click();
  const file = await download;
  const path = await file.path();
  if (!path) throw new Error("Download indisponível");
  const bytes = await readFile(path);
  await page.goto("/arcanario/importar");
  await page.getByLabel("Arquivo de baralho (.json)").setInputFiles({
    name: "invalido.json",
    mimeType: "application/json",
    buffer: Buffer.from("{"),
  });
  await expect(page.getByRole("alert")).toContainText("JSON válido");
  for (let i = 0; i < 2; i++) {
    await page.goto("/arcanario/importar");
    await page.getByLabel("Arquivo de baralho (.json)").setInputFiles({
      name: "baralho.json",
      mimeType: "application/json",
      buffer: bytes,
    });
    await page
      .getByRole("button", { name: "Importar como nova cópia" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Arquivo de troca fictício" }),
    ).toBeVisible();
  }
  await page.goto("/arcanario/baralhos");
  await expect(page.locator(".arcana-deck")).toHaveCount(3);
  await page.goto("/arcanario/acervo");
  await expect(page.locator(".arcana-card-link")).toHaveCount(3);
});
