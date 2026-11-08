# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bf4-inhabitants.spec.ts >> BF-4F1 canvas selects all four loaded models
- Location: e2e/bf4-inhabitants.spec.ts:52:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.boundingBox: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('canvas[data-three-world-canvas]')
    - locator resolved to visible <canvas width="1280" height="720" data-fps="2.8" data-meshes="351" data-textures="5" aria-hidden="true" data-gesture="idle" data-geometries="66" data-draw-calls="174" data-triangles="219326" data-camera-zoom="1.000" data-scene-objects="468" data-reference-meshes="0" data-rendered-frames="81" class="three-world-canvas" data-reference-objects="0" data-fixture-load-ms="0.1" data-inhabitants-ready="4" data-engine="three.js r185" data-fixture-status="ready" data-active-frame-loops="1" data-frame-time-ms="3…></canvas>

```

# Page snapshot

```yaml
- generic [ref=f2e3]:
  - link "Ir para o conteúdo principal" [ref=f2e4] [cursor=pointer]:
    - /url: "#main-content"
  - main [ref=f2e5]:
    - region "Biblioteca Viva" [ref=f2e7]:
      - generic:
        - generic:
          - generic: ✦
          - text: MUNDO VIVO
        - heading "Biblioteca Viva" [level=2]
        - paragraph: O santuário das histórias
      - button "Abrir ferramentas de exploração acessível" [ref=f2e8]:
        - generic [ref=f2e13]: Explorar por lista
      - generic: TOQUE PARA DESCOBRIR
      - generic:
        - generic:
          - region "Histórias da Biblioteca":
            - generic:
              - button "✦ Diário de histórias · 0/5" [ref=f2e17]
              - button "☾ A Noite da Fenda Lilás" [ref=f2e18]
          - region "Objetos vivos"
  - navigation "Navegação principal" [ref=f2e19]:
    - generic:
      - generic: ✧
      - generic: O LIVRO DAS PASSAGENS
      - generic: ✧
    - list [ref=f2e20]:
      - listitem [ref=f2e21]:
        - link "Biblioteca" [ref=f2e22] [cursor=pointer]:
          - /url: /
      - listitem [ref=f2e28]:
        - link "Coleção" [ref=f2e29] [cursor=pointer]:
          - /url: /colecao
      - listitem [ref=f2e34]:
        - link "Arquivo" [ref=f2e35] [cursor=pointer]:
          - /url: /arquivo
      - listitem [ref=f2e40]:
        - link "Resumo e estatísticas" [ref=f2e41] [cursor=pointer]:
          - /url: /estatisticas
          - generic [ref=f2e45]: Resumo
      - listitem [ref=f2e46]:
        - link "Ajustes" [ref=f2e47] [cursor=pointer]:
          - /url: /configuracoes
```

# Test source

```ts
  1   | import { OrthographicCamera, Vector3 } from "three";
  2   | import { CameraNavigation } from "../src/features/library/three/CameraNavigation";
  3   | import { LIBRARY_ROOMS } from "../src/features/library/libraryBuildingGeometry";
  4   | import { expect, openWorldTools, test } from "./fixtures";
  5   | import { INHABITANTS } from "../src/features/library/inhabitants";
  6   | for (const fallback of [false, true]) {
  7   |   test(`BF-4F1 four inhabitants ${fallback ? "fallback" : "world"}`, async ({
  8   |     page,
  9   |   }) => {
  10  |     if (fallback)
  11  |       await page.addInitScript(() => {
  12  |         HTMLCanvasElement.prototype.getContext = () => null;
  13  |       });
  14  |     await page.goto("/");
  15  |     await openWorldTools(page);
  16  |     const panel = page.getByLabel("Habitantes", { exact: true });
  17  |     await panel.locator(":scope > summary").click();
  18  |     for (const actor of INHABITANTS) {
  19  |       const button = panel.getByRole("button", {
  20  |         name: actor.label,
  21  |         exact: true,
  22  |       });
  23  |       await button.click();
  24  |       await expect(
  25  |         page.getByRole("heading", { name: actor.label, exact: true }),
  26  |       ).toBeVisible();
  27  |       await page
  28  |         .getByRole("button", { name: "Adiar conversa e voltar ao mundo" })
  29  |         .click();
  30  |       await openWorldTools(page);
  31  |       if ((await panel.getAttribute("open")) === null)
  32  |         await panel.locator(":scope > summary").click();
  33  |       await expect(button).toHaveAttribute("aria-pressed", "true");
  34  |       if (!fallback)
  35  |         await expect(
  36  |           page.locator("canvas[data-three-world-canvas]"),
  37  |         ).toHaveAttribute("data-selected-object", actor.id);
  38  |     }
  39  |     await page.setViewportSize({ width: 390, height: 844 });
  40  |     await expect(
  41  |       panel.getByRole("button", { name: "Lua", exact: true }),
  42  |     ).toHaveAttribute("aria-pressed", "true");
  43  |     if (!fallback) {
  44  |       await panel.locator(":scope > summary").click();
  45  |       await page
  46  |         .locator("canvas[data-three-world-canvas]")
  47  |         .screenshot({ path: "test-results/bf4f1-world.png" });
  48  |     }
  49  |   });
  50  | }
  51  |
  52  | test("BF-4F1 canvas selects all four loaded models", async ({ page }) => {
  53  |   await page.emulateMedia({ reducedMotion: "reduce" });
  54  |   await page.goto("/");
  55  |   const canvas = page.locator("canvas[data-three-world-canvas]");
  56  |   await expect(canvas).toHaveAttribute("data-inhabitants-ready", "4");
  57  |   await canvas.scrollIntoViewIfNeeded();
  58  |   for (const actor of INHABITANTS) {
  59  |     // The composed world uses the current runtime camera, not F1 framing.
  60  |     await canvas.scrollIntoViewIfNeeded();
> 61  |     const box = await canvas.boundingBox();
      |                              ^ Error: locator.boundingBox: Test timeout of 30000ms exceeded.
  62  |     if (!box) throw new Error("Canvas ausente");
  63  |     const zoom = Number(await canvas.getAttribute("data-camera-zoom"));
  64  |     expect(Number.isFinite(zoom)).toBe(true);
  65  |     const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
  66  |     const navigation = new CameraNavigation(camera, zoom, LIBRARY_ROOMS, 10);
  67  |     navigation.setViewport(Math.round(box.width), Math.round(box.height));
  68  |     camera.updateMatrixWorld();
  69  |     const point = new Vector3(actor.x, actor.height * 0.6, actor.z).project(
  70  |       camera,
  71  |     );
  72  |     await page.mouse.click(
  73  |       box.x + ((point.x + 1) * box.width) / 2,
  74  |       box.y + ((1 - point.y) * box.height) / 2,
  75  |     );
  76  |     await expect(canvas).toHaveAttribute("data-selected-object", actor.id);
  77  |     await expect(canvas).toHaveAttribute("data-highlighted-object", actor.id);
  78  |     await expect(
  79  |       page.getByRole("heading", { name: actor.label, exact: true }),
  80  |     ).toBeVisible();
  81  |     await page
  82  |       .getByRole("button", { name: "Adiar conversa e voltar ao mundo" })
  83  |       .click();
  84  |   }
  85  | });
  86  |
  87  | for (const actor of INHABITANTS)
  88  |   test(`BF-4F2 ${actor.key}: directed actions in the five-room world`, async ({
  89  |     page,
  90  |   }) => {
  91  |     await page.goto("/");
  92  |     const canvas = page.locator("canvas[data-three-world-canvas]");
  93  |     await expect(canvas).toHaveAttribute("data-inhabitants-ready", "4");
  94  |     await openWorldTools(page);
  95  |     const panel = page.getByLabel("Habitantes", { exact: true });
  96  |     await panel.locator(":scope > summary").click();
  97  |     {
  98  |       await panel
  99  |         .getByRole("button", { name: actor.label, exact: true })
  100 |         .click();
  101 |       for (const label of [
  102 |         "Caminhar",
  103 |         "Girar",
  104 |         "Cumprimentar",
  105 |         "Atividade",
  106 |         "Habilidade",
  107 |       ]) {
  108 |         const button = panel.getByRole("button", { name: label, exact: true });
  109 |         await button.focus();
  110 |         await button.press("Enter");
  111 |         await expect(panel.getByRole("status")).toContainText(
  112 |           "Demonstração finita",
  113 |         );
  114 |         await expect(canvas).toHaveAttribute("data-selected-object", actor.id);
  115 |       }
  116 |       await canvas.screenshot({
  117 |         path: `docs/evidence/bf4f2/world-${actor.key}.png`,
  118 |       });
  119 |     }
  120 |     await page.emulateMedia({ reducedMotion: "reduce" });
  121 |     const activity = panel.getByRole("button", {
  122 |       name: "Atividade",
  123 |       exact: true,
  124 |     });
  125 |     await activity.focus();
  126 |     await activity.press("Enter");
  127 |     await expect(panel.getByRole("status")).toContainText(
  128 |       "Movimento reduzido ativo",
  129 |     );
  130 |   });
  131 |
  132 | test("BF-4F3 spontaneous life and honest reduced-motion semantics", async ({
  133 |   page,
  134 | }) => {
  135 |   await page.goto("/");
  136 |   const canvas = page.locator("canvas[data-three-world-canvas]");
  137 |   await expect(canvas).toHaveAttribute("data-inhabitants-ready", "4");
  138 |   await openWorldTools(page);
  139 |   const panel = page.getByLabel("Habitantes", { exact: true });
  140 |   await panel.locator(":scope > summary").focus();
  141 |   await panel.locator(":scope > summary").press("Enter");
  142 |   const life = panel.getByRole("region", {
  143 |     name: "Convivência dos habitantes",
  144 |   });
  145 |   await expect(life).toContainText("escolhem suas atividades");
  146 |   await expect(life).toContainText("Em deslocamento real");
  147 |   await page.emulateMedia({ reducedMotion: "reduce" });
  148 |   await expect(life).toContainText("percursos suspensos, sem teletransporte");
  149 |   await expect(life).not.toContainText("Em deslocamento real");
  150 |   await expect(canvas).toHaveAttribute("data-runtime-state", "running");
  151 | });
  152 |
```
