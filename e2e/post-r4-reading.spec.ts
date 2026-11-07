import { expect, test } from "./fixtures";

test.use({
  hasTouch: true,
  isMobile: true,
  viewport: { width: 390, height: 844 },
});

test("leitura tem relógio direto, pausa persistida, retorno e histórico sem duplicação", async ({
  page,
  context,
  seedBooks,
}, testInfo) => {
  await seedBooks(1);
  await page.goto("/colecao");
  await page.locator(".book-card__link").first().click();
  const reading = page.getByRole("region", { name: "Seu momento de leitura" });
  const timer = reading.getByRole("timer", { name: "Tempo de leitura" });
  await expect(timer).toHaveText("00:00:00");
  await expect(
    reading.getByRole("button", { name: "Iniciar sessão" }),
  ).toBeEnabled();
  await expect(page.locator(".reading-session")).toHaveCount(1);
  await expect(page.getByText("Usar cronômetro (opcional)")).toHaveCount(0);
  await reading.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: testInfo.outputPath("reading-ready-portrait.png"),
  });
  const initialTime = Date.parse("2026-11-07T12:00:00.000Z");
  let elapsed = 0;
  const advance = async (milliseconds: number) => {
    elapsed += milliseconds;
    await page.clock.setFixedTime(new Date(initialTime + elapsed));
  };
  await advance(0);
  await reading.getByRole("button", { name: "Iniciar sessão" }).click();
  await expect(
    reading.getByRole("button", { name: "Pausar sessão" }),
  ).toBeEnabled();
  await advance(3_000);
  await expect(timer).toHaveText("00:00:03");
  await expect(page.getByRole("timer", { name: "Tempo da sessão" })).toHaveText(
    "3 s",
  );
  await reading.getByRole("button", { name: "Pausar sessão" }).click();
  await expect(
    reading.getByRole("button", { name: "Retomar sessão" }),
  ).toBeEnabled();
  await advance(20_000);
  await expect(timer).toHaveText("00:00:03");
  await page.reload();
  await expect(timer).toHaveText("00:00:03");
  await expect(reading.getByText("Pausado", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 844, height: 390 });
  await reading.scrollIntoViewIfNeeded();
  const resume = reading.getByRole("button", { name: "Retomar sessão" });
  await resume.focus();
  await resume.scrollIntoViewIfNeeded();
  await expect(page.locator(".primary-dock")).toHaveCSS(
    "pointer-events",
    "none",
  );
  await expect(
    reading.locator(".reading-session__history > summary"),
  ).toHaveCSS("color", "rgb(57, 40, 61)");
  await page.screenshot({
    path: testInfo.outputPath("reading-paused-landscape.png"),
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await reading.getByRole("button", { name: "Retomar sessão" }).click();
  await expect(
    reading.getByRole("button", { name: "Pausar sessão" }),
  ).toBeEnabled();
  await advance(2_000);
  await expect(timer).toHaveText("00:00:05");
  await page.getByRole("link", { name: "Voltar à Coleção" }).click();
  const background = await context.newPage();
  await background.goto("about:blank");
  await advance(10_000);
  await background.close();
  await page.bringToFront();
  await page.getByRole("link", { name: "Abrir sessão", exact: true }).click();
  await expect(timer).toHaveText("00:00:15");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const conclude = reading.getByRole("button", { name: "Concluir sessão" });
  await conclude.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: testInfo.outputPath("reading-active-portrait.png"),
  });
  await conclude.click();
  await expect(
    reading.getByRole("button", { name: "Iniciar sessão" }),
  ).toBeEnabled();
  await reading.getByText("Histórico de leituras e registro manual").click();
  await expect(reading.getByRole("listitem")).toHaveCount(1);
  await expect(reading.getByRole("listitem")).toContainText("15 s");
  await page.reload();
  await reading.getByText("Histórico de leituras e registro manual").click();
  await expect(reading.getByRole("listitem")).toHaveCount(1);
  await expect(reading.getByRole("listitem")).toContainText("15 s");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
