import { expect, test } from "@playwright/test";

// BF-5.7B2.3: retired TCG navigation must not be reachable from deep links.
// The orbital moon stays alive as the Arcanarium entry point in the separate
// bf56f-orbital-refinement gate.
const retiredRoutes = [
  ["/arcanario/duelos", "hall"],
  ["/arcanario/duelos/regras", "rules"],
  ["/arcanario/duelos/baralhos/legacy", "deck editor"],
  ["/arcanario/duelos/partida/legacy", "match"],
  ["/arcanario/duelos/arena/legacy", "arena"],
] as const;

for (const [path, label] of retiredRoutes) {
  test(`BF-5.7B2.3: old ${label} route returns to Arcanarium Portal`, async ({
    page,
  }) => {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/arcanario$/);
    await expect(
      page.getByRole("heading", { name: "O Arcanário", exact: true }),
    ).toBeVisible();
    const navigation = page.getByRole("navigation", {
      name: "Salas do Arcanário",
    });
    await expect(
      navigation.getByRole("link", { name: "Duelo Arcano", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Iniciar duelo PvE" }),
    ).toHaveCount(0);
  });
}

test("BF-5.7B2.3: retired combat-card creation returns to Portal", async ({
  page,
}) => {
  await page.goto("/arcanario/oficina/nova?tipo=combat", {
    waitUntil: "domcontentloaded",
  });
  await expect(page).toHaveURL(/\/arcanario$/);
  await expect(
    page.getByRole("heading", { name: "O Arcanário", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Criar carta de combate")).toHaveCount(0);
});

test("BF-5.7B2.3: educational Arcanarium rooms remain reachable", async ({
  page,
}) => {
  await page.goto("/arcanario", { waitUntil: "domcontentloaded" });
  const navigation = page.getByRole("navigation", {
    name: "Salas do Arcanário",
  });
  await expect(
    navigation.getByRole("link", { name: "Acervo", exact: true }),
  ).toBeVisible();
  await expect(
    navigation.getByRole("link", { name: "Provações", exact: true }),
  ).toBeVisible();
  await navigation.getByRole("link", { name: "Oficina", exact: true }).click();
  await expect(page).toHaveURL(/\/arcanario\/oficina\/nova$/);
  await expect(
    page.getByRole("heading", { name: "Oficina de Cartas", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Criar carta de combate")).toHaveCount(0);
});
