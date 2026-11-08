// CSS integration regression with a fictional HUD fixture. No WebGL/physical claim.
import process from "node:process";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const out = "docs/audits/evidence/bv-g";
await mkdir(out, { recursive: true });
const server = await createServer({
  server: { host: "127.0.0.1", port: 4195, strictPort: true },
  plugins: [
    {
      name: "g-hud-layout",
      configureServer(s) {
        s.middlewares.use((req, res, next) => {
          if (req.url != "/g-hud-layout") return next();
          res.setHeader("Content-Type", "text/html");
          res.end(
            `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">${["styles.css", "styles-legacy.css", "styles-atelier.css", "features/library/canvas-hud.css"].map((f) => `<link rel="stylesheet" href="/src/${f}">`).join("")}</head><body><div class="app-shell" data-route="library"><div class="session-strip"><aside class="active-session"><span>Sessão em andamento · <span>24 s</span></span><a class="text-link">Abrir sessão</a></aside></div><main class="app-content"><section class="library-page" data-tools-open="true"><div class="library-access-panels"><div class="world-surface"><p class="living-world-feedback">Uma estrela entalhada na madeira antiga.</p><details class="world-explore" open><summary>Explorar · habitantes e objetos</summary><p>Conteúdo fictício para conferir o espaço do painel.</p><button>Selecionar Samael</button></details><section class="living-controls"><details open><summary>Objetos vivos</summary><p>Lista acessível fictícia.</p><button>Examinar</button></details></section><div class="rpg-tools"><button>Diário de histórias · 0/5</button><button>A Noite da Fenda Lilás</button></div></div></div><button class="canvas-access">☷ Fechar painel</button></section></main><nav class="primary-dock"><ul><li><a class="primary-dock__link">Biblioteca</a></li><li><a class="primary-dock__link">Coleção</a></li></ul></nav></div></body></html>`,
          );
        });
      },
    },
  ],
});
await server.listen();
const browser = await chromium.launch();
const results = [];
try {
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:4195/g-hud-layout");
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    for (const long of [false, true]) {
      const boxes = await page.evaluate((long) => {
        globalThis.document.querySelector(
          ".living-world-feedback",
        ).textContent = long
          ? "Uma mensagem fictícia de ambiente com várias linhas para verificar a rolagem e o espaço reservado aos controles durante leitura e exploração. ".repeat(
              3,
            )
          : "Uma estrela entalhada na madeira antiga.";
        globalThis.document
          .querySelector(".app-shell")
          .style.setProperty(
            "--canvas-session-height",
            `${globalThis.document.querySelector(".session-strip").getBoundingClientRect().height}px`,
          );
        globalThis.document
          .querySelector(".app-shell")
          .style.setProperty(
            "--canvas-dock-height",
            `${globalThis.document.querySelector(".primary-dock").getBoundingClientRect().height + Number.parseFloat(globalThis.getComputedStyle(globalThis.document.querySelector(".primary-dock")).bottom)}px`,
          );
        const page = globalThis.document.querySelector(".library-page");
        const tools = [...page.querySelectorAll(".rpg-tools, .canvas-access")];
        page.style.setProperty(
          "--canvas-tools-height",
          `${Math.max(...tools.map((tool) => tool.getBoundingClientRect().height))}px`,
        );
        page.style.setProperty(
          "--canvas-notice-height",
          `${page.querySelector(".living-world-feedback").getBoundingClientRect().height}px`,
        );
        const rect = (selector) => {
          const r = globalThis.document
            .querySelector(selector)
            .getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height };
        };
        return {
          toast: rect(".living-world-feedback"),
          session: rect(".session-strip"),
          panel: rect(".library-access-panels"),
          access: rect(".canvas-access"),
          quests: rect(".rpg-tools"),
          dock: rect(".primary-dock"),
        };
      }, long);
      assert(boxes.toast.y >= boxes.session.y + boxes.session.height);
      assert(boxes.panel.y >= boxes.toast.y + boxes.toast.height);
      assert(
        boxes.panel.height >= 44,
        `panel collapsed at ${viewport.width}: ${boxes.panel.height}`,
      );
      assert(
        boxes.panel.y + boxes.panel.height <= boxes.quests.y,
        JSON.stringify({ viewport, boxes }),
      );
      assert(boxes.access.x + boxes.access.width <= boxes.quests.x);
      assert(boxes.access.y + boxes.access.height <= boxes.dock.y);
      results.push({ viewport, long, boxes });
    }
  }
  await writeFile(
    `${out}/hud-layout.json`,
    JSON.stringify(
      {
        description:
          "CSS integration fixture, fictional content, no WebGL or physical acceptance",
        cases: results,
      },
      null,
      2,
    ) + "\n",
  );
  process.stdout.write(
    `HUD layout: ${results.length} CSS fixture cases passed.\n`,
  );
} finally {
  await browser.close();
  await server.close();
}
