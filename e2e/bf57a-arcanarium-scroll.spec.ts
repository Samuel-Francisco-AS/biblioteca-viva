import { expect, test } from "@playwright/test";

test("BF-5.7A: Arcanarium uses native scrolling without an oversized transformed layer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/arcanario/acervo");

  const heading = page.getByRole("heading", { name: "Acervo global" });
  await expect(heading).toBeVisible();

  const room = page.locator(
    '.app-shell[data-route="arcanario"] .app-content > .arcanarium',
  );
  await expect(room).toHaveCSS("animation-name", "none");
  await expect(room).toHaveCSS("transform", "none");

  const compact = room.locator(".arcana-grid .arcana-card--compact");
  if ((await compact.count()) > 0) {
    await expect(compact.first()).toHaveCSS("perspective", "none");
    await expect(compact.first().locator(".arcana-face--back")).toHaveCSS(
      "display",
      "none",
    );
  }

  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(heading).toBeVisible();
});

test("BF-5.7A: opening a catalogue card after scrolling begins at its artwork", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/arcanario/oficina/nova");
  await page
    .getByLabel("Frente da carta — pergunta ou pista")
    .fill("Carta fictícia para o teste de rolagem");
  await page
    .getByLabel("Verso da carta — resposta ou descoberta")
    .fill("Verso preservado");
  await page
    .getByRole("button", { name: "Guardar carta no acervo" })
    .click();
  await expect(
    page.getByRole("link", { name: "Editar na Oficina" }),
  ).toBeVisible();

  await page.goto("/arcanario/acervo");
  const tile = page.getByRole("link", {
    name: "Abrir Carta fictícia para o teste de rolagem",
  });
  await expect(tile).toBeVisible();
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);

  await tile.click();
  await expect(page).toHaveURL(/\/arcanario\/cartas\//);
  await expect(
    page.getByRole("heading", { name: "Carta fictícia para o teste de rolagem" }),
  ).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});
