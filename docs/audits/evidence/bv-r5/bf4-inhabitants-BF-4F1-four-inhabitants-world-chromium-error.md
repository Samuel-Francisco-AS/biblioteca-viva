# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bf4-inhabitants.spec.ts >> BF-4F1 four inhabitants world
- Location: e2e/bf4-inhabitants.spec.ts:7:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('canvas[data-three-world-canvas]')
Expected: "character:samael"
Received: ""

Call log:
  - Expect "toHaveAttribute" with timeout 10000ms
  - waiting for locator('canvas[data-three-world-canvas]')
  - Protocol error (Runtime.callFunctionOn): Internal server error, session closed.

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
      - button "Recolher ferramentas de exploração" [expanded] [ref=f2e8]:
        - generic [ref=f2e13]: Fechar painel
      - generic: TOQUE PARA DESCOBRIR
      - generic [ref=f2e14]:
        - generic [ref=f2e15]:
          - region "Histórias da Biblioteca":
            - generic:
              - button "✦ Diário de histórias · 0/5" [ref=f2e19]
              - button "☾ A Noite da Fenda Lilás" [ref=f2e20]
          - group [ref=f2e21]:
            - generic "Explorar · habitantes e objetos" [ref=f2e22] [cursor=pointer]
            - status [ref=f2e23]: Ambiente 3D em execução.
            - group [ref=f2e24]:
              - generic "Diagnóstico do mundo" [ref=f2e25] [cursor=pointer]
            - group [ref=f2e26]:
              - generic "Selecionar elementos" [ref=f2e27] [cursor=pointer]
            - group "Habitantes" [ref=f2e28]:
              - generic "Habitantes da Biblioteca" [ref=f2e29] [cursor=pointer]
              - region "Convivência dos habitantes" [ref=f2e30]:
                - paragraph [ref=f2e31]: Os habitantes escolhem suas atividades e encontros. A seleção oferece uma breve pausa; depois a rotina continua.
                - list [ref=f2e32]:
                  - listitem [ref=f2e33]:
                    - strong [ref=f2e34]: Samael
                    - text: — CÔMODO A. Conversa encerrada; reconsidera a intenção por uma rota segura.
                  - listitem [ref=f2e35]:
                    - strong [ref=f2e36]: Aryn
                    - text: "— CÔMODO B. A caminho: Inspeciona uma folha de treino para restauração. Em deslocamento real."
                  - listitem [ref=f2e37]:
                    - strong [ref=f2e38]: Ytha
                    - text: — CÔMODO C. Observando antes de escolher uma atividade.
                  - listitem [ref=f2e39]:
                    - strong [ref=f2e40]: Lua
                    - text: — CÔMODO D. Observando antes de escolher uma atividade.
                - paragraph [ref=f2e41]: A convivência continua no mundo.
                - group [ref=f2e42]:
                  - generic "Encontros e vínculos desta sessão" [ref=f2e43] [cursor=pointer]
              - generic [ref=f2e44]:
                - button "Samael" [active] [pressed] [ref=f2e45]
                - paragraph [ref=f2e46]: Espírito demoníaco de 2 m, casaco escuro, chifres, notebook e café.
                - group "Ações de Samael" [ref=f2e47]:
                  - button "Caminhar" [ref=f2e49]
                  - button "Girar" [ref=f2e50]
                  - button "Cumprimentar" [ref=f2e51]
                  - button "Atividade" [ref=f2e52]
                  - button "Habilidade" [ref=f2e53]
                  - button "Recuperar postura" [ref=f2e54]
              - generic [ref=f2e55]:
                - button "Aryn" [ref=f2e56]
                - paragraph [ref=f2e57]: Elfa de 1,70 m, óculos, avental de restauração e livro de anatomia.
              - generic [ref=f2e58]:
                - button "Ytha" [ref=f2e59]
                - paragraph [ref=f2e60]: Fada de 1,70 m, cabelo rosa, asas de borboleta e flor.
              - generic [ref=f2e61]:
                - button "Lua" [ref=f2e62]
                - paragraph [ref=f2e63]: Maga de 1,60 m, óculos, capa acadêmica, grimório e lápis.
              - status [ref=f2e64]: Samael selecionado
          - region "Objetos vivos" [ref=f2e65]:
            - group [ref=f2e66]:
              - generic "Explorar objetos sem o canvas (alternativa acessível)" [ref=f2e67] [cursor=pointer]
        - group [ref=f2e68]:
          - generic "Registros · alternativa acessível" [ref=f2e69] [cursor=pointer]
  - navigation "Navegação principal" [ref=f2e70]:
    - generic:
      - generic: ✧
      - generic: O LIVRO DAS PASSAGENS
      - generic: ✧
    - list [ref=f2e71]:
      - listitem [ref=f2e72]:
        - link "Biblioteca" [ref=f2e73] [cursor=pointer]:
          - /url: /
      - listitem [ref=f2e79]:
        - link "Coleção" [ref=f2e80] [cursor=pointer]:
          - /url: /colecao
      - listitem [ref=f2e85]:
        - link "Arquivo" [ref=f2e86] [cursor=pointer]:
          - /url: /arquivo
      - listitem [ref=f2e91]:
        - link "Resumo e estatísticas" [ref=f2e92] [cursor=pointer]:
          - /url: /estatisticas
          - generic [ref=f2e96]: Resumo
      - listitem [ref=f2e97]:
        - link "Ajustes" [ref=f2e98] [cursor=pointer]:
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
> 37  |         ).toHaveAttribute("data-selected-object", actor.id);
      |           ^ Error: expect(locator).toHaveAttribute(expected) failed
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
  61  |     const box = await canvas.boundingBox();
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
```
