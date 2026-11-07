import { chooseBVOption } from "./pickers";
import { expect, test } from "./fixtures";

test.use({
  hasTouch: true,
  isMobile: true,
  viewport: { width: 390, height: 844 },
});

test("estudo recupera pomodoro após suspensão/reload, preserva pausas e registra uma vez", async ({
  page,
  context,
}) => {
  await page.clock.setFixedTime(new Date("2026-11-04T12:00:00.000Z"));
  await page.goto("/novo-registro");
  await page.getByRole("button", { name: /Estudo/ }).click();
  await page
    .getByRole("textbox", { name: "Título", exact: true })
    .fill("Cartografia das estrelas");
  await chooseBVOption(page, page.getByLabel("Unidade de progresso"), "hours");
  await page.getByRole("button", { name: "Salvar registro" }).click();
  await expect(
    page.getByRole("heading", { name: "Cartografia das estrelas" }),
  ).toBeVisible();
  await expect(
    page.getByRole("timer", { name: "Tempo restante" }),
  ).toContainText("25:00");
  await page.getByRole("button", { name: "Iniciar foco", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pausar foco", exact: true }),
  ).toBeEnabled();
  await page.clock.setFixedTime(new Date("2026-11-04T12:05:00.000Z"));
  await page.getByRole("button", { name: "Pausar foco", exact: true }).click();
  await expect(
    page.getByRole("timer", { name: "Tempo restante" }),
  ).toContainText("20:00");
  await page.clock.setFixedTime(new Date("2026-11-04T12:15:00.000Z"));
  await page.reload();
  await expect(
    page.getByRole("timer", { name: "Tempo restante" }),
  ).toContainText("20:00");
  await page.getByRole("button", { name: "Retomar foco", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pausar foco", exact: true }),
  ).toBeEnabled();
  const background = await context.newPage();
  await background.goto("about:blank");
  await page.clock.setFixedTime(new Date("2026-11-04T12:55:00.000Z"));
  await background.close();
  await page.bringToFront();
  await page.reload();
  await expect(
    page.getByRole("timer", { name: "Tempo restante" }),
  ).toContainText("00:00");
  await page
    .getByRole("button", { name: "Registrar foco", exact: true })
    .click();
  await expect(page.locator(".study-total")).toContainText("0 h 25 min 00 s");
  await page.reload();
  await expect(page.locator(".study-total")).toContainText(
    "1 sessão registrada",
  );
  await expect(page.locator(".study-total")).toContainText("0 h 25 min 00 s");
  await expect(page.getByLabel("Horas estudadas")).toHaveCount(0);
  await expect(page.getByLabel("Nova nota", { exact: true })).toHaveCSS(
    "color",
    "rgb(57, 40, 61)",
  );
  await expect(page.getByLabel("Nova nota", { exact: true })).toHaveCSS(
    "background-image",
    /repeating-linear-gradient/,
  );
  await page
    .getByLabel("Nova nota", { exact: true })
    .fill("Resumo fictício: estrelas e caminhos.");
  await page
    .getByRole("button", { name: "Adicionar nota", exact: true })
    .click();
  await expect(page.locator(".annotation-list")).toContainText(
    "Resumo fictício: estrelas e caminhos.",
  );
  await page.reload();
  await expect(page.locator(".annotation-list")).toContainText(
    "Resumo fictício: estrelas e caminhos.",
  );
});

test("grimório cria, edita e revisa cartas com flip/slide, mantém contraste e cabe em retrato/paisagem", async ({
  page,
}, testInfo) => {
  await page.goto("/novo-registro");
  await page.getByRole("button", { name: /Estudo/ }).click();
  await page
    .getByRole("textbox", { name: "Título", exact: true })
    .fill("O atlas das descobertas");
  await page.getByRole("button", { name: "Salvar registro" }).click();
  await expect(
    page.getByRole("heading", { name: "O atlas das descobertas" }),
  ).toBeVisible();
  for (const [front, back] of [
    ["O que guia o viajante?", "A estrela do norte."],
    ["Onde começa um mapa?", "Em uma pergunta."],
  ]) {
    const editor = page.locator(".study-card-editor");
    if (!(await editor.evaluate((node) => (node as HTMLDetailsElement).open)))
      await editor.locator("summary").click();
    await page.getByLabel("Frente · pergunta ou pista").fill(front);
    await page.getByLabel("Verso · resposta ou descoberta").fill(back);
    await page
      .getByRole("button", { name: "Guardar carta", exact: true })
      .click();
    await expect(page.getByLabel("Frente · pergunta ou pista")).toHaveValue("");
  }
  await expect(page.locator(".study-card-count")).toHaveText("2 cartas");
  await page.reload();
  await page
    .getByRole("button", { name: "Revisar cartas", exact: true })
    .click();
  const card = page.locator(".study-flash-card");
  await expect(card).toHaveAttribute("data-flipped", "false");
  await expect(
    page.getByRole("button", { name: "Lembrei →", exact: true }),
  ).toBeDisabled();
  await card.click();
  await expect(card).toHaveAttribute("data-flipped", "true");
  await expect
    .poll(() =>
      card
        .locator(".study-flash-card__rotor")
        .evaluate(
          (node) =>
            Math.round(
              new DOMMatrixReadOnly(getComputedStyle(node).transform).m11 *
                1000,
            ) / 1000,
        ),
    )
    .toBe(-1);
  await page.screenshot({ path: testInfo.outputPath("cartas-verso.png") });
  await page.getByRole("button", { name: "Lembrei →", exact: true }).click();
  await expect(page.locator(".study-review__counter")).toContainText(
    "Carta 2 de 2",
  );
  await expect(page.locator(".study-card-arrival")).toHaveCSS(
    "animation-name",
    "study-deal",
  );
  await card.click();
  await page
    .getByRole("button", { name: "Rever depois →", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Uma volta pelo seu saber" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Encerrar revisão", exact: true })
    .click();
  await page.getByText("Suas cartas · 2", { exact: true }).click();
  await page
    .getByRole("button", { name: "Editar carta", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Frente · pergunta ou pista")
    .fill("Uma pista revisada?");
  await page.getByRole("button", { name: "Salvar carta", exact: true }).click();
  await expect(page.locator(".study-card-library")).toContainText(
    "Uma pista revisada?",
  );
  await page.getByText("Cuidar deste registro", { exact: true }).click();
  const danger = page.locator(".study-danger p");
  await expect(danger).toHaveCSS("opacity", "1");
  const ratio = await danger.evaluate((node) => {
    const rgb = (color: string) =>
      color
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map(Number);
    const luminance = (color: string) =>
      rgb(color)
        .map((value) => {
          const s = value / 255;
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        })
        .reduce(
          (sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i],
          0,
        );
    return (
      (luminance(getComputedStyle(node.parentElement!).backgroundColor) +
        0.05) /
      (luminance(getComputedStyle(node).color) + 0.05)
    );
  });
  expect(ratio).toBeGreaterThanOrEqual(4.5);
  page.once("dialog", (dialog) => dialog.dismiss());
  await page
    .getByRole("button", { name: "Excluir estudo", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "O atlas das descobertas" }),
  ).toBeVisible();
  for (const [width, height, orientation] of [
    [390, 844, "retrato"],
    [844, 390, "paisagem"],
  ] as const) {
    await page.setViewportSize({ width, height });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`estudo-${orientation}.png`),
      fullPage: true,
    });
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page
    .getByRole("button", { name: "Revisar cartas", exact: true })
    .click();
  await expect(page.locator(".study-card-arrival")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator(".study-flash-card__rotor")).toHaveCSS(
    "transition-duration",
    "0s",
  );
});
