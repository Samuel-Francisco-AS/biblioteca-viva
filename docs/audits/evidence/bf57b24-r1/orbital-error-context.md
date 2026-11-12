# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bf56f-orbital-refinement.spec.ts >> BF-5.7A: lunar gate opens Arcanarium Portal and preserves the resident world
- Location: e2e/bf56f-orbital-refinement.spec.ts:8:1

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: keyboard.press: Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=f2e3]:
  - link "Ir para o conteúdo principal" [ref=f2e4] [cursor=pointer]:
    - /url: "#main-content"
  - main [ref=f2e5]:
    - region "Biblioteca Viva" [ref=f2e7]:
      - heading "Biblioteca Viva" [level=2]
      - button "Abrir ferramentas de exploração acessível" [active] [ref=f2e8] [cursor=pointer]:
        - generic [ref=f2e9]: ☷
        - generic [ref=f2e10]: Acervo e habitantes
      - generic:
        - generic:
          - region "Histórias da Biblioteca":
            - generic "Atalhos das histórias":
              - button "Diário de histórias · 0/5" [ref=f2e14] [cursor=pointer]:
                - text: ✦
                - generic [ref=f2e15]: Diário de histórias
                - generic: 0/5
              - button "A Noite da Fenda Lilás" [ref=f2e16] [cursor=pointer]: ☾
          - region "Objetos vivos"
  - generic: ✦ DESDOBRANDO AS PÁGINAS ✦
  - navigation "Navegação principal" [ref=f2e18]:
    - generic:
      - generic: ✧
      - generic: O LIVRO DAS PASSAGENS
      - generic: ✧
    - list [ref=f2e19]:
      - listitem [ref=f2e20]:
        - link "Biblioteca" [ref=f2e21] [cursor=pointer]:
          - /url: /
      - listitem [ref=f2e27]:
        - link "Coleção" [ref=f2e28] [cursor=pointer]:
          - /url: /colecao
      - listitem [ref=f2e33]:
        - link "Arquivo" [ref=f2e34] [cursor=pointer]:
          - /url: /arquivo
      - listitem [ref=f2e39]:
        - link "Resumo e estatísticas" [ref=f2e40] [cursor=pointer]:
          - /url: /estatisticas
          - generic [ref=f2e44]: Resumo
      - listitem [ref=f2e45]:
        - link "Ajustes" [ref=f2e46] [cursor=pointer]:
          - /url: /configuracoes
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | // Keep DOM/action traces; avoid continuous GPU readback while testing a live
  3   | // WebGL renderer. Failure screenshots still preserve the final visual state.
  4   | test.use({
  5   |   trace: { mode: "retain-on-failure", screenshots: false, snapshots: true },
  6   |   screenshot: "only-on-failure",
  7   | });
  8   | test("BF-5.7A: lunar gate opens Arcanarium Portal and preserves the resident world", async ({
  9   |   page,
  10  | }) => {
  11  |   // This end-to-end gate boots WebGL, opens nested semantic controls, then
  12  |   // pauses and resumes the same renderer across a route. The software-backed
  13  |   // Chromium runner needs a larger scenario budget; each check keeps its
  14  |   // independent shorter timeout and does not accept an incorrect state.
  15  |   test.setTimeout(60_000);
  16  |   // Validate the actual Moto G06-sized responsive HUD, rather than spending
  17  |   // software-WebGL time screenshotting the scene at a desktop resolution before
  18  |   // the first interaction. Playwright will retain a trace if this test fails.
  19  |   await page.setViewportSize({ width: 390, height: 844 });
  20  |   await page.goto("/", { waitUntil: "domcontentloaded" });
  21  |   await page.goto("/configuracoes", { waitUntil: "domcontentloaded" });
  22  |   const canvasAccessPreference = page.getByRole("checkbox", {
  23  |     name: "Mostrar botão “Acervo e habitantes” no Canvas",
  24  |   });
  25  |   await expect(canvasAccessPreference).toBeVisible();
  26  |   await canvasAccessPreference.check();
  27  |   await page.goto("/", { waitUntil: "domcontentloaded" });
  28  |   const canvas = page.locator("canvas[data-three-world-canvas]");
  29  |   await expect(canvas).toHaveCount(1);
  30  |   await expect(canvas).toHaveAttribute("data-fixture-status", "ready", {
  31  |     timeout: 20_000,
  32  |   });
  33  |   await expect(canvas).toHaveAttribute("data-active-frame-loops", "1");
  34  |   await canvas.evaluate((node) =>
  35  |     node.setAttribute("data-refinement-resident", "same"),
  36  |   );
  37  |   // The test exercises semantic navigation, not Canvas hit-testing. The
  38  |   // continuously animated WebGL surface can interfere with Playwright's
  39  |   // pointer-action stability check, although a real keyboard can activate
  40  |   // these native controls. Still require visible, enabled controls and a
  41  |   // visible expanded panel before each keyboard activation.
  42  |   const tools = page.getByRole("button", {
  43  |     name: "Abrir ferramentas de exploração acessível",
  44  |   });
  45  |   await expect(tools).toBeVisible();
  46  |   await expect(tools).toBeEnabled();
  47  |   await expect(tools).toHaveCSS("position", "fixed");
  48  |   // A control may be CSS-visible yet placed outside the viewport. Record its
  49  |   // real layout before acting; failure then distinguishes a HUD geometry issue
  50  |   // from Playwright pointer stability or the WebGL renderer's frame load.
  51  |   const hudLayout = await tools.evaluate((element) => {
  52  |     const bounds = element.getBoundingClientRect();
  53  |     const style = getComputedStyle(element);
  54  |     const dock = document.querySelector(".primary-dock");
  55  |     const dockBounds = dock?.getBoundingClientRect();
  56  |     const width = window.innerWidth;
  57  |     const height = window.innerHeight;
  58  |     const visibleWidth = Math.max(
  59  |       0,
  60  |       Math.min(width, bounds.right) - Math.max(0, bounds.left),
  61  |     );
  62  |     const visibleHeight = Math.max(
  63  |       0,
  64  |       Math.min(height, bounds.bottom) - Math.max(0, bounds.top),
  65  |     );
  66  |     return {
  67  |       viewport: { width, height },
  68  |       bounds: {
  69  |         left: bounds.left,
  70  |         top: bounds.top,
  71  |         right: bounds.right,
  72  |         bottom: bounds.bottom,
  73  |         width: bounds.width,
  74  |         height: bounds.height,
  75  |       },
  76  |       intersection: { width: visibleWidth, height: visibleHeight },
  77  |       position: style.position,
  78  |       cssBottom: style.bottom,
  79  |       canvasDockHeight: getComputedStyle(
  80  |         document.querySelector(".app-shell") ?? document.body,
  81  |       ).getPropertyValue("--canvas-dock-height"),
  82  |       dockBottom: dockBounds?.bottom ?? null,
  83  |       documentScroll: { x: window.scrollX, y: window.scrollY },
  84  |     };
  85  |   });
  86  |   await test.info().attach("lunar-access-layout.json", {
  87  |     body: JSON.stringify(hudLayout, null, 2),
  88  |     contentType: "application/json",
  89  |   });
  90  |   expect(
  91  |     hudLayout.intersection.width,
  92  |     `Acesso lunar fora da largura da viewport: ${JSON.stringify(hudLayout)}`,
  93  |   ).toBeGreaterThan(0);
  94  |   expect(
  95  |     hudLayout.intersection.height,
  96  |     `Acesso lunar fora da altura da viewport: ${JSON.stringify(hudLayout)}`,
  97  |   ).toBeGreaterThan(0);
  98  |   await tools.focus();
> 99  |   await page.keyboard.press("Enter");
      |                       ^ Error: keyboard.press: Test timeout of 60000ms exceeded.
  100 | 
  101 |   // The React state is reflected in both the parent data attribute and the
  102 |   // button. Verify the state transition first, then take one atomic DOM
  103 |   // snapshot instead of polling a continuously rendered WebGL scene for
  104 |   // 10 seconds and losing the actual evidence when Chromium times out.
  105 |   const libraryPage = page.locator(".library-page");
  106 |   await expect(libraryPage).toHaveAttribute("data-tools-open", "true", {
  107 |     timeout: 5_000,
  108 |   });
  109 |   const openState = await libraryPage.evaluate((element) => {
  110 |     const control = element.querySelector<HTMLButtonElement>(".canvas-access");
  111 |     return {
  112 |       parentState: element.getAttribute("data-tools-open"),
  113 |       label: control?.getAttribute("aria-label") ?? null,
  114 |       expanded: control?.getAttribute("aria-expanded") ?? null,
  115 |       visible: control ? getComputedStyle(control).visibility : null,
  116 |     };
  117 |   });
  118 |   await test.info().attach("lunar-access-open-state.json", {
  119 |     body: JSON.stringify(openState, null, 2),
  120 |     contentType: "application/json",
  121 |   });
  122 |   expect(openState.label).toBe("Recolher ferramentas de exploração");
  123 |   expect(openState.expanded).toBe("true");
  124 | 
  125 |   const worldDetails = page.locator("details.world-explore");
  126 |   await expect(worldDetails).toBeVisible();
  127 |   const worldSummary = worldDetails.locator(":scope > summary");
  128 |   await expect(worldSummary).toBeVisible();
  129 |   await worldSummary.focus();
  130 |   await page.keyboard.press("Enter");
  131 |   await expect(worldDetails).toHaveAttribute("open", "");
  132 | 
  133 |   const selectionDetails = worldDetails.locator("details.world-semantic");
  134 |   const selectionSummary = selectionDetails.locator("summary");
  135 |   await expect(selectionSummary).toBeVisible();
  136 |   await selectionSummary.focus();
  137 |   await page.keyboard.press("Enter");
  138 |   await expect(selectionDetails).toHaveAttribute("open", "");
  139 | 
  140 |   // The canonical object has a stable ID, independent of catalogue order.
  141 |   const lunarPortal = page.getByRole("button", {
  142 |     name: "Abrir Portal do Arcanário",
  143 |   });
  144 |   await expect(lunarPortal).toBeVisible();
  145 |   await expect(lunarPortal).toBeEnabled();
  146 |   await lunarPortal.focus();
  147 |   await page.keyboard.press("Enter");
  148 |   await expect(page).toHaveURL(/\/arcanario$/);
  149 |   const arcanariumNav = page.getByRole("navigation", {
  150 |     name: "Salas do Arcanário",
  151 |   });
  152 |   await expect(
  153 |     arcanariumNav.getByRole("link", { name: "Duelo Arcano", exact: true }),
  154 |   ).toHaveCount(0);
  155 |   await expect(
  156 |     arcanariumNav.getByRole("link", { name: "Acervo", exact: true }),
  157 |   ).toBeVisible();
  158 |   await expect(canvas).toBeHidden();
  159 |   await expect(canvas).toHaveAttribute("data-active-frame-loops", "0");
  160 |   await page.getByRole("link", { name: "Biblioteca", exact: true }).click();
  161 |   await expect(
  162 |     page.locator('canvas[data-refinement-resident="same"]'),
  163 |   ).toBeVisible();
  164 |   await expect(canvas).toHaveAttribute("data-active-frame-loops", "1");
  165 | });
  166 | 
```