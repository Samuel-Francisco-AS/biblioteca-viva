import { expect, test } from "@playwright/test";
test("BF-5.7A: lunar gate opens Arcanarium Portal and preserves the resident world", async ({
  page,
}) => {
  // This end-to-end gate boots WebGL, opens nested semantic controls, then
  // pauses and resumes the same renderer across a route. The software-backed
  // Chromium runner needs a larger scenario budget; each check keeps its
  // independent shorter timeout and does not accept an incorrect state.
  test.setTimeout(60_000);
  // Validate the actual Moto G06-sized responsive HUD, rather than spending
  // software-WebGL time screenshotting the scene at a desktop resolution before
  // the first interaction. Playwright will retain a trace if this test fails.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.goto("/configuracoes", { waitUntil: "domcontentloaded" });
  const canvasAccessPreference = page.getByRole("checkbox", {
    name: "Mostrar botão “Acervo e habitantes” no Canvas",
  });
  await expect(canvasAccessPreference).toBeVisible();
  await canvasAccessPreference.check();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const canvas = page.locator("canvas[data-three-world-canvas]");
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toHaveAttribute("data-fixture-status", "ready", {
    timeout: 20_000,
  });
  await expect(canvas).toHaveAttribute("data-active-frame-loops", "1");
  await canvas.evaluate((node) =>
    node.setAttribute("data-refinement-resident", "same"),
  );
  // The test exercises semantic navigation, not Canvas hit-testing. The
  // continuously animated WebGL surface can interfere with Playwright's
  // pointer-action stability check, although a real keyboard can activate
  // these native controls. Still require visible, enabled controls and a
  // visible expanded panel before each keyboard activation.
  const tools = page.getByRole("button", {
    name: "Abrir ferramentas de exploração acessível",
  });
  await expect(tools).toBeVisible();
  await expect(tools).toBeEnabled();
  await expect(tools).toHaveCSS("position", "fixed");
  // A control may be CSS-visible yet placed outside the viewport. Record its
  // real layout before acting; failure then distinguishes a HUD geometry issue
  // from Playwright pointer stability or the WebGL renderer's frame load.
  const hudLayout = await tools.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const dock = document.querySelector(".primary-dock");
    const dockBounds = dock?.getBoundingClientRect();
    const width = window.innerWidth;
    const height = window.innerHeight;
    const visibleWidth = Math.max(
      0,
      Math.min(width, bounds.right) - Math.max(0, bounds.left),
    );
    const visibleHeight = Math.max(
      0,
      Math.min(height, bounds.bottom) - Math.max(0, bounds.top),
    );
    return {
      viewport: { width, height },
      bounds: {
        left: bounds.left,
        top: bounds.top,
        right: bounds.right,
        bottom: bounds.bottom,
        width: bounds.width,
        height: bounds.height,
      },
      intersection: { width: visibleWidth, height: visibleHeight },
      position: style.position,
      cssBottom: style.bottom,
      canvasDockHeight: getComputedStyle(
        document.querySelector(".app-shell") ?? document.body,
      ).getPropertyValue("--canvas-dock-height"),
      dockBottom: dockBounds?.bottom ?? null,
      documentScroll: { x: window.scrollX, y: window.scrollY },
    };
  });
  await test.info().attach("lunar-access-layout.json", {
    body: JSON.stringify(hudLayout, null, 2),
    contentType: "application/json",
  });
  expect(
    hudLayout.intersection.width,
    `Acesso lunar fora da largura da viewport: ${JSON.stringify(hudLayout)}`,
  ).toBeGreaterThan(0);
  expect(
    hudLayout.intersection.height,
    `Acesso lunar fora da altura da viewport: ${JSON.stringify(hudLayout)}`,
  ).toBeGreaterThan(0);
  await tools.focus();
  await page.keyboard.press("Enter");

  // The React state is reflected in both the parent data attribute and the
  // button. Verify the state transition first, then take one atomic DOM
  // snapshot instead of polling a continuously rendered WebGL scene for
  // 10 seconds and losing the actual evidence when Chromium times out.
  const libraryPage = page.locator(".library-page");
  await expect(libraryPage).toHaveAttribute("data-tools-open", "true", {
    timeout: 5_000,
  });
  const openState = await libraryPage.evaluate((element) => {
    const control = element.querySelector<HTMLButtonElement>(".canvas-access");
    return {
      parentState: element.getAttribute("data-tools-open"),
      label: control?.getAttribute("aria-label") ?? null,
      expanded: control?.getAttribute("aria-expanded") ?? null,
      visible: control ? getComputedStyle(control).visibility : null,
    };
  });
  await test.info().attach("lunar-access-open-state.json", {
    body: JSON.stringify(openState, null, 2),
    contentType: "application/json",
  });
  expect(openState.label).toBe("Recolher ferramentas de exploração");
  expect(openState.expanded).toBe("true");

  const worldDetails = page.locator("details.world-explore");
  await expect(worldDetails).toBeVisible();
  const worldSummary = worldDetails.locator(":scope > summary");
  await expect(worldSummary).toBeVisible();
  await worldSummary.focus();
  await page.keyboard.press("Enter");
  await expect(worldDetails).toHaveAttribute("open", "");

  const selectionDetails = worldDetails.locator("details.world-semantic");
  const selectionSummary = selectionDetails.locator("summary");
  await expect(selectionSummary).toBeVisible();
  await selectionSummary.focus();
  await page.keyboard.press("Enter");
  await expect(selectionDetails).toHaveAttribute("open", "");

  // The canonical object has a stable ID, independent of catalogue order.
  const lunarPortal = page.getByRole("button", {
    name: "Abrir Portal do Arcanário",
  });
  await expect(lunarPortal).toBeVisible();
  await expect(lunarPortal).toBeEnabled();
  await lunarPortal.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/arcanario$/);
  const arcanariumNav = page.getByRole("navigation", {
    name: "Salas do Arcanário",
  });
  await expect(
    arcanariumNav.getByRole("link", { name: "Duelo Arcano", exact: true }),
  ).toHaveCount(0);
  await expect(
    arcanariumNav.getByRole("link", { name: "Acervo", exact: true }),
  ).toBeVisible();
  await expect(canvas).toBeHidden();
  await expect(canvas).toHaveAttribute("data-active-frame-loops", "0");
  await page.getByRole("link", { name: "Biblioteca", exact: true }).click();
  await expect(
    page.locator('canvas[data-refinement-resident="same"]'),
  ).toBeVisible();
  await expect(canvas).toHaveAttribute("data-active-frame-loops", "1");
});
