import { mkdir, readFile } from "node:fs/promises";
import { test, expect, type Page } from "@playwright/test";
import type { KnowledgeTag } from "../src/domain/arcanarium";
async function capture(page: Page, name: string) {
  await mkdir("docs/audits/evidence/bf56c", { recursive: true });
  await page.screenshot({
    path: `docs/audits/evidence/bf56c/${name}.png`,
    fullPage: true,
  });
}
async function seedTen(page: Page) {
  await page.goto("/arcanario/provacoes");
  await expect(
    page.getByRole("heading", { name: "Provações", exact: true }),
  ).toBeVisible();
  const tags: KnowledgeTag[] = [
    {
      id: "area",
      revision: 1,
      label: "Área fictícia",
      namespace: "editorial",
      level: "area",
      parentIds: [],
      relatedIds: [],
      synonyms: [],
    },
    {
      id: "discipline",
      revision: 1,
      label: "Disciplina fictícia",
      namespace: "editorial",
      level: "discipline",
      parentIds: ["area"],
      relatedIds: [],
      synonyms: [],
    },
    {
      id: "subject",
      revision: 1,
      label: "Assunto fictício",
      namespace: "editorial",
      level: "subject",
      parentIds: ["discipline"],
      relatedIds: [],
      synonyms: ["Sinônimo fictício"],
    },
  ];
  await page.evaluate(async (tags) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open("biblioteca-viva-bf57");
      r.onsuccess = () => resolve(r.result);
      r.onerror = () =>
        reject(r.error ?? new Error("Falha ao abrir base fictícia"));
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(
        ["arcanariumCards", "arcanariumVersions", "knowledgeTags"],
        "readwrite",
      );
      for (const tag of tags) tx.objectStore("knowledgeTags").put(tag);
      for (let i = 0; i < 10; i++) {
        const card = {
          id: `fixture-question-${i}`,
          type: "question",
          revision: 1,
          origin: { kind: "local" },
          archived: false,
          createdAt: "2026-11-08T15:00:00.000Z",
          updatedAt: "2026-11-08T15:00:00.000Z",
          content: {
            type: "question",
            title: `Questão fictícia ${i + 1}`,
            statement:
              `Enunciado fictício ${i + 1}: compare as duas respostas e escolha a afirmação adequada. ` +
              "Este fólio conserva espaço para ler com conforto. ".repeat(6),
            alternatives: [
              { id: "right", text: "Afirmação correta fictícia" },
              { id: "wrong", text: "Afirmação incorreta fictícia" },
            ],
            correctAlternativeId: "right",
            explanation: `Explicação fictícia ${i + 1}: a primeira afirmação corresponde ao enunciado.`,
            classification: {
              primarySubjectId: "subject",
              knowledgeTagIds: ["subject"],
              personalTagIds: [],
            },
            source: {
              exam: "Prova fictícia",
              year: 2026,
              board: "Banca fictícia",
            },
            difficulty: "medium",
          },
        };
        tx.objectStore("arcanariumCards").put(card);
        tx.objectStore("arcanariumVersions").put({
          cardId: card.id,
          revision: 1,
          card,
        });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject(tx.error ?? new Error("Falha na transação fictícia"));
      tx.onabort = () =>
        reject(tx.error ?? new Error("Falha na transação fictícia"));
    });
    db.close();
  }, tags);
  await page.reload();
}
test("C: taxonomy, author question, draft, stable answer ordering, preview and re-edit", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/arcanario/assuntos");
  for (const [label, level, parent] of [
    ["Área autoral fictícia", "Área", ""],
    ["Disciplina autoral fictícia", "Disciplina", "Área autoral fictícia"],
    [
      "Assunto autoral fictício",
      "Assunto",
      "Área autoral fictícia › Disciplina autoral fictícia",
    ],
  ]) {
    await page.getByLabel("Nome da classificação").fill(label);
    await page
      .getByRole("group", { name: "Nível", exact: true })
      .getByRole("radio", { name: level, exact: true })
      .check();
    if (parent)
      await page
        .getByRole("group", { name: "Classificação pai" })
        .getByRole("radio", { name: parent, exact: true })
        .check();
    await page.getByRole("button", { name: "Salvar classificação" }).click();
    await expect(page.getByLabel("Nome da classificação")).toHaveValue("");
  }
  await capture(page, "taxonomia-retrato");
  await page.goto("/arcanario/oficina/nova?tipo=question");
  await page
    .getByLabel("Nome da questão no acervo (opcional)")
    .fill("Identificação de arquivo fictícia");
  await page
    .getByLabel("Enunciado da questão")
    .fill(
      "Qual é a resposta fictícia? " +
        "Texto longo para ler sem proporção fixa. ".repeat(15),
    );
  await page
    .getByLabel("Alternativa A", { exact: true })
    .fill("Resposta correta autoral");
  await page
    .getByLabel("Alternativa B", { exact: true })
    .fill("Outra resposta autoral");
  await page.getByRole("radio", { name: "Gabarito A", exact: true }).check();
  await page.getByRole("button", { name: "Descer alternativa 1" }).click();
  await expect(
    page.getByRole("radio", { name: "Gabarito B", exact: true }),
  ).toBeChecked();
  await page
    .getByLabel("Explicação da resolução")
    .fill("Explicação autoral fictícia.");
  await page
    .getByRole("group", { name: "Assunto principal", exact: true })
    .getByRole("radio", { name: /Assunto autoral fictício/ })
    .check();
  await page.reload();
  await expect(page.getByText(/Rascunho de questão recuperado/)).toBeVisible();
  await expect(
    page.getByRole("radio", { name: "Gabarito B", exact: true }),
  ).toBeChecked();
  await page
    .getByRole("button", { name: "Conferir prévia da questão" })
    .click();
  await capture(page, "editor-retrato");
  await expect(page.locator("select")).toHaveCount(0);
  await page.getByRole("button", { name: "Guardar questão no acervo" }).click();
  await expect(
    page.getByRole("link", { name: "Editar na Oficina" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("link", { name: "Editar na Oficina" }).click();
  await expect(
    page.getByLabel("Nome da questão no acervo (opcional)"),
  ).toHaveValue("Identificação de arquivo fictícia");
  await expect(
    page.getByRole("radio", { name: "Gabarito B", exact: true }),
  ).toBeChecked();
});
test("C: real dynamic filters, ten questions, correction, pause/reload, history and downloaded JSON/CSV", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seedTen(page);
  await page.goto("/arcanario/baralhos/novo?tipo=dynamic");
  await page.getByLabel("Nome do baralho").fill("Dez questões fictícias");
  await page.getByText(/Conhecimentos e etiquetas \(/).click();
  await page
    .getByRole("checkbox", { name: "Área fictícia", exact: true })
    .check();
  await page
    .getByRole("button", { name: /Origem, prova e dificuldade/ })
    .click();
  await page.getByLabel("Prova (filtro)").fill("Prova fictícia");
  await page.getByLabel("Ano (filtro)").fill("2026");
  await page.getByLabel("Banca (filtro)").fill("Banca fictícia");
  await expect(page.getByText("10 cartas elegíveis agora.")).toBeVisible();
  await capture(page, "filtros-retrato");
  await page.getByRole("button", { name: "Salvar baralho" }).click();
  await page
    .getByRole("link", { name: /Preparar Provação com baralho salvo/ })
    .click();
  await expect(page.getByText(/10 questões elegíveis/)).toBeVisible();
  await page
    .getByRole("button", { name: "Iniciar Provação", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Questão 1 de 10" }),
  ).toBeVisible();
  await expect(page.getByText(/Explicação fictícia 1:/)).toHaveCount(0);
  await capture(page, "provacao-retrato");
  await page.setViewportSize({ width: 844, height: 390 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await capture(page, "provacao-paisagem");
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("radio", { name: /A Afirmação correta fictícia/ })
    .check();
  await page
    .getByRole("button", { name: "Confirmar resposta", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Resposta correta", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Confirmar resposta", exact: true }),
  ).toHaveCount(0);
  await capture(page, "correcao-retrato");
  await page
    .getByRole("button", { name: "Pausar e sair", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Provações", exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("link", { name: /Pausada .*1\/10 respostas/ }).click();
  await page
    .getByRole("button", { name: "Retomar Provação", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Próxima questão", exact: true })
    .click();
  for (let i = 1; i < 10; i++) {
    await expect(
      page.getByRole("heading", {
        name: `Questão ${i + 1} de 10`,
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: `Questão ${i + 1} de 10`,
        exact: true,
      }),
    ).toBeFocused();
    await page
      .getByRole("radio", {
        name:
          i % 2
            ? /B Afirmação incorreta fictícia/
            : /A Afirmação correta fictícia/,
      })
      .check();
    await page
      .getByRole("button", { name: "Confirmar resposta", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: i % 2 ? "Resposta incorreta" : "Resposta correta",
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: i === 9 ? "Concluir Provação" : "Próxima questão",
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Resultado da Provação", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("50%", { exact: true })).toBeVisible();
  await capture(page, "resultado-retrato");
  await page.reload();
  await expect(page.getByText("50%", { exact: true })).toBeVisible();
  await page
    .getByRole("link", { name: "Consultar diagnóstico", exact: true })
    .click();
  await capture(page, "diagnostico-retrato");
  for (const format of ["JSON v1", "assuntos CSV"]) {
    const download = page.waitForEvent("download");
    await page
      .getByRole("button", {
        name: `Exportar ${format === "JSON v1" ? "relatório " : ""}${format}`,
        exact: true,
      })
      .click();
    const file = await download,
      path = await file.path();
    if (!path) throw new Error("Download não disponível");
    const content = await readFile(path, "utf8");
    if (format === "JSON v1") {
      const report: unknown = JSON.parse(content);
      expect(report).toMatchObject({
        kind: "biblioteca-viva-learning-report",
        formatVersion: 1,
        summary: {
          attempts: 10,
          distinct: 10,
          repetitions: 0,
          correct: 5,
          incorrect: 5,
        },
      });
    } else expect(content).toContain('"Assunto fictício"');
  }
  await page.setViewportSize({ width: 844, height: 390 });
  await capture(page, "diagnostico-paisagem");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("B-R1/B-R2: all frame previews, independent catalogue name, recovery and family filter without native picker", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/arcanario/oficina/nova");
  await page
    .getByLabel("Nome da carta no acervo (opcional)")
    .fill("Nome fictício de arquivo");
  await page
    .getByRole("textbox", {
      name: "Frente da carta — pergunta ou pista",
      exact: true,
    })
    .fill("Frente fictícia independente");
  await page
    .getByRole("textbox", {
      name: "Verso da carta — resposta ou descoberta",
      exact: true,
    })
    .fill("Verso fictício independente");
  for (const [name, frame] of [
    ["Constelação", "constellation"],
    ["Herbário", "herbarium"],
    ["Iluminura", "illuminated"],
  ]) {
    await page.getByRole("radio", { name: new RegExp(name) }).check();
    await expect(
      page.locator(`.arcana-preview [data-frame=${frame}]`),
    ).toHaveCount(2);
  }
  await page.getByRole("radio", { name: /Constelação/ }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: /Herbário/ })).toBeChecked();
  await page.getByRole("radio", { name: /Iluminura/ }).check();
  await expect(page.locator("select")).toHaveCount(0);
  await capture(page, "molduras-retrato");
  await page.reload();
  await expect(page.getByRole("radio", { name: /Iluminura/ })).toBeChecked();
  await expect(
    page.getByRole("textbox", {
      name: "Frente da carta — pergunta ou pista",
      exact: true,
    }),
  ).toHaveValue("Frente fictícia independente");
  await page.getByRole("button", { name: "Guardar carta no acervo" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Frente fictícia independente",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Nome fictício de arquivo",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/arcanario/acervo");
  await page.getByRole("radio", { name: "Questão", exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "Questão", exact: true }),
  ).toBeChecked();
  await expect(page.locator(".arcana-card-link")).toHaveCount(0);
  await page.getByRole("radio", { name: "Eco", exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "Eco", exact: true }),
  ).toBeChecked();
  await expect(page.locator(".arcana-card-link")).toHaveCount(1);
  await expect(page.locator("select")).toHaveCount(0);
});

test("C hotfix: inline personal tag creation, Enter safety and readable question summary", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/arcanario/oficina/nova?tipo=question");
  const search = page.getByLabel("Buscar classificações já cadastradas");
  await search.fill("Potenciação");
  await expect(
    page.getByRole("button", { name: 'Criar e marcar etiqueta "Potenciação"' }),
  ).toBeEnabled();
  await search.press("Enter");
  await expect(page).toHaveURL(/\/arcanario\/oficina\/nova/);
  await page
    .getByRole("button", { name: 'Criar e marcar etiqueta "Potenciação"' })
    .click();
  await expect(
    page.getByRole("checkbox", { name: /Potenciação/ }),
  ).toBeChecked();
  await page.getByLabel("Enunciado da questão").fill("Quanto é 2³?");
  await page.getByLabel("Alternativa A", { exact: true }).fill("8");
  await page.getByLabel("Alternativa B", { exact: true }).fill("9");
  await page.getByRole("radio", { name: "Gabarito A" }).check();
  await page.getByRole("button", { name: "Guardar questão no acervo" }).click();
  await expect(
    page.getByRole("link", { name: "Editar na Oficina" }),
  ).toBeVisible();
  const summary = page.getByText("Gabarito e resolução (Oficina)");
  await expect(summary).toBeVisible();
  await expect(summary).toHaveCSS("color", "rgb(64, 34, 79)");
  await expect(summary).toHaveCSS("background-color", "rgb(224, 207, 173)");
});
