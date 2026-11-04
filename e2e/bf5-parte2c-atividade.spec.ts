import { expect, test } from "./fixtures";
import { mkdir } from "node:fs/promises";
test.use({
  locale: "pt-BR",
  timezoneId: "America/Fortaleza",
  hasTouch: true,
  isMobile: true,
  viewport: { width: 390, height: 844 },
});
test("ficha viva cria, adapta dias, conserva base, estima com perfil e apresenta calendário e fólio acessíveis", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-11-04T12:00:00.000Z"));
  await page.goto("/configuracoes");
  await page.getByLabel("Peso (kg)").fill("70");
  await page
    .getByRole("button", { name: "Salvar perfil", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Perfil salvo");
  await page.reload();
  await expect(page.getByLabel("Peso (kg)")).toHaveValue("70");
  await page.goto("/novo-registro");
  await page.getByRole("button", { name: /Atividade física/ }).click();
  await page.getByLabel("Nome do treino").fill("Peito e tríceps · Aurora");
  await expect(page.locator('select[name="category"]')).toHaveCount(0);
  for (const label of ["Resistência", "Aeróbico", "Força"]) {
    await page.getByRole("radio", { name: label, exact: true }).check();
    await expect(
      page.getByRole("radio", { name: label, exact: true }),
    ).toBeChecked();
  }
  await page.getByLabel("Data de início").fill("2026-11-01");
  await page.getByLabel("Data final").fill("2026-11-30");
  for (const name of ["Seg", "Qua", "Sex"])
    await page.getByRole("checkbox", { name, exact: true }).check();
  await page
    .getByRole("button", { name: "Adicionar exercício", exact: true })
    .click();
  let exercise = page.locator(".exercise-leaf").nth(0);
  await exercise.getByLabel("Nome do exercício").fill("Supino reto");
  await exercise.getByLabel("Repetições por série").fill("15");
  await page
    .getByRole("button", { name: "Adicionar exercício", exact: true })
    .click();
  exercise = page.locator(".exercise-leaf").nth(1);
  await exercise.getByLabel("Nome do exercício").fill("Prancha");
  await exercise.getByRole("radio", { name: "Tempo", exact: true }).check();
  await exercise.getByLabel("Séries", { exact: true }).fill("4");
  await exercise.getByLabel("Segundos por série").fill("40");
  await page
    .getByRole("button", { name: "Salvar registro", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Peito e tríceps · Aurora",
      exact: true,
    }),
  ).toBeVisible();
  const url = page.url();
  const movements = page.locator(".workout-movement");
  await expect(movements).toHaveCount(2);
  await expect(movements.nth(0)).toContainText("3 × 15");
  await expect(movements.nth(1)).toContainText("4 × 40s");
  await movements.nth(0).getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Salvar execução", exact: true })
    .click();
  await expect(page.locator(".workout-feedback")).toHaveText("Execução salva.");
  await page.reload();
  await expect(movements.nth(0).getByRole("checkbox")).toBeChecked();
  await expect(movements.nth(1).getByRole("checkbox")).not.toBeChecked();
  await expect(
    page.getByRole("button", {
      name: "2026-11-04: Parcial, no plano",
      exact: true,
    }),
  ).toBeVisible();
  await movements
    .nth(0)
    .getByRole("button", { name: "+ Série diferente", exact: true })
    .click();
  await movements
    .nth(0)
    .getByLabel("Repetições", { exact: true })
    .nth(1)
    .fill("10");
  await page.getByLabel("Duração (min)").fill("30");
  await page.getByLabel("Intensidade percebida (1–10)").fill("5");
  await page
    .getByRole("button", { name: "Marcar treino inteiro", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Salvar execução", exact: true })
    .click();
  await expect(page.locator(".workout-feedback")).toHaveText("Execução salva.");
  await expect(page.locator(".workout-calories")).toContainText("130");
  await expect(
    page.getByRole("button", {
      name: "2026-11-04: Mais que a base, no plano",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel("Dia", { exact: true }).fill("2026-11-02");
  await expect(movements.nth(0).locator(".workout-set")).toHaveCount(1);
  await expect(movements.nth(0).getByRole("checkbox")).not.toBeChecked();
  await movements.nth(0).getByLabel("Repetições", { exact: true }).fill("10");
  await page
    .getByRole("button", { name: "Marcar treino inteiro", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Salvar execução", exact: true })
    .click();
  await expect(page.locator(".workout-feedback")).toHaveText("Execução salva.");
  await expect(
    page.getByRole("button", {
      name: "2026-11-02: Menos que a base, no plano",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .locator("summary")
    .filter({ hasText: "Observações do corpo" })
    .click();
  await page
    .getByLabel("Nota deste dia")
    .fill("Adaptação fictícia: descanso entre séries.");
  await page
    .getByRole("button", { name: "Salvar nota e execução", exact: true })
    .click();
  await expect(page.locator(".workout-feedback")).toHaveText("Execução salva.");
  await page.reload();
  await page
    .getByRole("button", {
      name: "2026-11-02: Menos que a base, no plano",
      exact: true,
    })
    .click();
  await page
    .locator("summary")
    .filter({ hasText: "Observações do corpo" })
    .click();
  await expect(page.getByLabel("Nota deste dia")).toHaveValue(
    "Adaptação fictícia: descanso entre séries.",
  );
  await page.getByRole("button", { name: "Hoje", exact: true }).click();
  await expect(movements.nth(0).locator(".workout-set")).toHaveCount(2);
  await page.getByRole("link", { name: "Editar treino" }).click();
  await expect(page.getByLabel("Nome do exercício").first()).toHaveValue(
    "Supino reto",
  );
  await expect(page.getByLabel("Repetições por série").first()).toHaveValue(
    "15",
  );
  await page.getByLabel("Repetições por série").first().fill("12");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(movements.nth(0)).toContainText("Base · 3 × 15");
  await page.getByLabel("Dia", { exact: true }).fill("2026-11-03");
  await expect(movements.nth(0)).toContainText("Base · 3 × 12");
  await expect(page.locator(".workout-calories")).toContainText(
    "Sem estimativa",
  );
  await expect(page.locator(".workout-care")).not.toHaveAttribute("open", "");
  await page.locator(".workout-care summary").click();
  const danger = page.getByRole("button", {
    name: "Excluir registro",
    exact: true,
  });
  await expect(danger).toHaveCSS("opacity", "1");
  const contrast = await danger.evaluate((node) => {
    const s = getComputedStyle(node);
    const l = (c: string) => {
      const a = (c.match(/[\d.]+/g) ?? [])
        .slice(0, 3)
        .map(Number)
        .map((n) => {
          const v = n / 255;
          return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        });
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    };
    const a = l(s.color),
      b = l(s.backgroundColor);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
  page.once("dialog", (d) => void d.dismiss());
  await danger.click();
  await expect(
    page.getByRole("heading", {
      name: "Peito e tríceps · Aurora",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Hoje", exact: true }).click();
  await page.locator(".workout-care summary").click();
  await page.locator(".body-study img").scrollIntoViewIfNeeded();
  await expect(page.locator(".body-study img")).toHaveJSProperty(
    "naturalWidth",
    1024,
  );
  await mkdir("docs/evidence/BF-5P2C", { recursive: true });
  for (const [name, size] of [
    ["retrato", { width: 390, height: 844 }],
    ["paisagem", { width: 844, height: 390 }],
  ] as const) {
    await page.setViewportSize(size);
    await expect(page.locator(".workout-folio")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
      window.scrollTo(0, 0);
    });
    await page.screenshot({
      path: `docs/evidence/BF-5P2C/treino-${name}.png`,
      fullPage: true,
    });
  }
  await page.goto("/configuracoes");
  await page
    .getByRole("button", { name: "Remover perfil", exact: true })
    .click();
  await expect(page.getByLabel("Peso (kg)")).toHaveValue("");
  await page.goto(url);
  await expect(page.locator(".workout-calories")).toContainText("130");
});

test("cadastro exige ficha, permite ordenar metas e diário protege rascunho, desmarca e limpa só o dia", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-11-04T12:00:00.000Z"));
  await page.goto("/novo-registro");
  await page.getByRole("button", { name: /Atividade física/ }).click();
  await page
    .getByLabel("Nome do treino")
    .fill("Treino fictício de resistência");
  await page.getByRole("radio", { name: "Resistência", exact: true }).check();
  await page.getByLabel("Data de início").fill("2026-11-01");
  await page.getByLabel("Data final").fill("2026-11-30");
  await page.getByRole("checkbox", { name: "Qua", exact: true }).check();
  await page
    .getByRole("button", { name: "Salvar registro", exact: true })
    .click();
  await expect(page.getByRole("alert")).toBeVisible();
  for (const name of ["Agachamento", "Remada"]) {
    await page
      .getByRole("button", { name: "Adicionar exercício", exact: true })
      .click();
    await page.getByLabel("Nome do exercício").last().fill(name);
  }
  await page
    .getByRole("button", { name: "Subir exercício 2", exact: true })
    .click();
  await expect(page.getByLabel("Nome do exercício").first()).toHaveValue(
    "Remada",
  );
  await page
    .getByRole("button", { name: "Salvar registro", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Treino fictício de resistência",
      exact: true,
    }),
  ).toBeVisible();
  const checks = page.locator(".workout-check input");
  await checks.first().check();
  page.once("dialog", (d) => void d.dismiss());
  await page.getByRole("link", { name: "Editar treino" }).click();
  await expect(page.locator(".workout-unsaved")).toBeVisible();
  await expect(checks.first()).toBeChecked();
  await page
    .getByRole("button", { name: "Marcar treino inteiro", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Salvar execução", exact: true })
    .click();
  await expect(page.locator(".workout-feedback")).toHaveText("Execução salva.");
  await expect(page.locator(".workout-calories")).toContainText(
    "Sem estimativa",
  );
  await checks.first().uncheck();
  await page
    .getByRole("button", { name: "Salvar execução", exact: true })
    .click();
  await expect(page.locator(".workout-feedback")).toHaveText("Execução salva.");
  await page.reload();
  await expect(checks.first()).not.toBeChecked();
  await expect(checks.last()).toBeChecked();
  page.once("dialog", (d) => void d.accept());
  await page.getByRole("button", { name: "Limpar dia", exact: true }).click();
  await expect(page.locator(".workout-feedback")).toHaveText(
    "Execução do dia limpa.",
  );
  await expect(checks.last()).not.toBeChecked();
  await expect(page.locator(".workout-movement")).toHaveCount(2);
  await checks.first().check();
  const other = await page.context().newPage();
  await other.goto(page.url());
  await other
    .getByRole("button", { name: "Marcar treino inteiro", exact: true })
    .click();
  await other
    .getByRole("button", { name: "Salvar execução", exact: true })
    .click();
  await expect(other.locator(".workout-feedback")).toHaveText(
    "Execução salva.",
  );
  await other.close();
  await page.bringToFront();
  // The resumed page sees the new committed graph but retains the earlier draft revision.
  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  await expect(
    page.getByRole("button", {
      name: "2026-11-04: Realizado, no plano",
      exact: true,
    }),
  ).toBeVisible();
  await expect(checks.last()).not.toBeChecked();
  await page
    .getByRole("button", { name: "Salvar execução", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "O treino mudou em outra tela",
  );
  await expect(page.locator(".workout-unsaved")).toBeVisible();
  page.once("dialog", (d) => void d.accept());
  await page
    .getByRole("button", { name: "Reconsultar treino", exact: true })
    .click();
  await expect(checks.last()).toBeChecked();
  await page.getByLabel("Dia", { exact: true }).fill("2026-11-05");
  await expect(
    page.getByRole("button", { name: "Salvar execução", exact: true }),
  ).toBeDisabled();
});
