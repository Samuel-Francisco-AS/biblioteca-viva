import { expect, test } from "./fixtures";

test("BF-5R1: immersive canvas layout, accessible command hub and five realms", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Biblioteca Viva", exact: true }),
  ).toBeVisible();
  const host = page.locator(".world-host");
  await expect(host).toBeVisible();
  const box = await host.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(389);
  expect(box!.height).toBeGreaterThanOrEqual(843);

  const toggle = page.getByRole("button", {
    name: "Abrir ferramentas de exploração acessível",
  });
  const failure = page.getByRole("heading", {
    name: "O ambiente 3D não pôde ser iniciado",
  });
  if (!(await failure.isVisible())) {
    await expect(page.locator(".library-index")).toBeHidden();
    await toggle.click();
    await expect(page.locator(".library-index")).toBeVisible();
    await expect(page.locator(".world-explore")).toBeVisible();
    await page
      .getByRole("button", { name: "Recolher ferramentas de exploração" })
      .click();
    await expect(page.locator(".library-index")).toBeHidden();
  } else {
    await expect(page.locator(".library-index")).toBeVisible();
  }

  const dock = page.getByRole("navigation", { name: "Navegação principal" });
  await expect(dock.locator(".primary-dock__medallion")).toHaveCount(5);
  const checks = [
    ["Coleção", "Acervo encantado"],
    ["Arquivo", "Câmara dos registros"],
    ["Resumo e estatísticas", "Observatório"],
    ["Ajustes", "Ateliê arcano"],
  ] as const;
  for (const [label, heading] of checks) {
    await dock.getByRole("link", { name: label, exact: true }).click();
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.locator(".realm-intro__seal")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(dock).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
