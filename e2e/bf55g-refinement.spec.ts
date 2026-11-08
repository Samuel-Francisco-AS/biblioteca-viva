import { expect, test } from "./fixtures";

test("BF-5.5G: temporary identity returns with the same resident Canvas across tabs", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const brand = page.locator(".exploration-header");
  await expect(brand).toHaveAttribute("data-phase", "visible");
  const canvas = page.locator("canvas");
  await expect(canvas).toHaveAttribute("data-fixture-status", "ready");
  await canvas.evaluate((node) => node.setAttribute("data-g-resident", "same"));
  await expect(page.locator(".exploration-compass")).toHaveCount(0);
  await expect(brand).toHaveCount(0);
  const dock = page.getByRole("navigation", { name: "Navegação principal" });
  for (const name of [
    "Coleção",
    "Arquivo",
    "Resumo e estatísticas",
    "Ajustes",
  ]) {
    await dock.getByRole("link", { name, exact: true }).click();
    await expect(canvas).toHaveAttribute("data-active-frame-loops", "0");
    await dock.getByRole("link", { name: "Biblioteca", exact: true }).click();
    await expect(canvas).toHaveAttribute("data-g-resident", "same");
    await expect(canvas).toHaveAttribute("data-active-frame-loops", "1");
    await expect(brand).toHaveAttribute("data-phase", "visible");
    await expect(dock.locator('[data-pending="true"]')).toHaveCount(0);
  }
});

test("BF-5.5G: top notifications coexist with session and HUD in portrait and landscape", async ({
  page,
  seedBooks,
}, testInfo) => {
  await seedBooks(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/colecao");
  await page.locator(".book-card__link").first().click();
  await page
    .getByRole("region", { name: "Seu momento de leitura" })
    .getByRole("button", { name: "Iniciar sessão" })
    .click();
  // Folios deliberately relinquish the dock while a reading control has focus.
  await page.getByRole("link", { name: "Voltar à Coleção" }).click();
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Biblioteca", exact: true })
    .click();
  const canvas = page.locator("canvas");
  await expect(canvas).toHaveAttribute("data-fixture-status", "ready");
  const brand = page.locator(".exploration-header");
  await page
    .getByRole("button", { name: "Abrir ferramentas de exploração acessível" })
    .click();
  await page
    .getByText("Explorar objetos sem o canvas (alternativa acessível)", {
      exact: true,
    })
    .click();
  await page.getByText("Cômodo A", { exact: true }).click();
  const action = page.getByRole("button", {
    name: "Examinar — Entalhe da estante",
    exact: true,
  });
  await action.click();
  const feedback = page.getByTestId("living-feedback");
  await expect(feedback).toBeVisible();
  expect(
    await brand.evaluateAll((nodes) =>
      nodes.every((node) => getComputedStyle(node).opacity === "0"),
    ),
  ).toBe(true);
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    // Refresh the real object action, including after resize; no injected toast.
    await action.click();
    const boxes = await page.evaluate(() => {
      const rect = (selector: string) => {
        const node = document.querySelector(selector);
        if (!node) throw new Error(`Missing HUD element: ${selector}`);
        const r = node.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      };
      return {
        toast: rect('[data-testid="living-feedback"]'),
        session: rect(".active-session"),
        access: rect(".canvas-access"),
        panels: rect(".library-access-panels"),
        canvas: rect("canvas"),
      };
    });
    expect(boxes.toast.y).toBeGreaterThanOrEqual(
      boxes.session.y + boxes.session.height,
    );
    expect(boxes.toast.y + boxes.toast.height).toBeLessThan(boxes.access.y);
    expect(boxes.toast.y).toBeLessThan(viewport.height / 2);
    expect(boxes.panels.y).toBeGreaterThanOrEqual(
      boxes.toast.y + boxes.toast.height,
    );
    expect(boxes.canvas).toMatchObject({
      width: viewport.width,
      height: viewport.height,
    });
    await page.screenshot({
      path: testInfo.outputPath(`hud-${viewport.width}.png`),
    });
  }
  await page
    .getByRole("button", { name: "Recolher ferramentas de exploração" })
    .click();
  await expect(canvas).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".primary-dock__medallion").first()).toHaveCSS(
    "transition-duration",
    "0s",
  );
});
