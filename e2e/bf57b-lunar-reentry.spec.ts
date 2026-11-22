import { expect, test } from "@playwright/test";

for (const input of ["canvas", "accessible"] as const) {
  test(`R3: three lunar reentries by ${input} preserve one renderer without empty taps`, async ({
    page,
  }) => {
    // Three full round trips include several SwiftShader protocol observations.
    // The measured single run is about 84s, so retain strict state asserts with
    // headroom for slower software-WebGL cycles instead of hiding checks.
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto("/configuracoes");
    await page
      .getByRole("checkbox", {
        name: "Mostrar botão “Acervo e habitantes” no Canvas",
      })
      .check();
    await page.goto("/");
    const canvas = page.locator("canvas[data-three-world-canvas]");
    await expect(canvas).toHaveCount(1);
    await expect(canvas).toHaveAttribute("data-fixture-status", "ready");
    await expect(canvas).toHaveAttribute("data-active-frame-loops", "1");
    await canvas.evaluate((node) =>
      node.setAttribute("data-r3-resident", "same"),
    );
    const arrivals: string[] = [];
    page.on("framenavigated", (frame) => {
      if (
        frame === page.mainFrame() &&
        new URL(frame.url()).pathname === "/arcanario"
      )
        arrivals.push(frame.url());
    });
    // Batch the same URL/visibility/identity/count/loop/selection assertions in
    // one DOM observation. Separate protocol calls cost seconds on SwiftShader.
    const observeWorld = () =>
      page.evaluate(() => {
        const node = document.querySelector("canvas[data-three-world-canvas]");
        if (!(node instanceof HTMLCanvasElement)) return { missing: true };
        return {
          path: location.pathname,
          count: document.querySelectorAll("canvas[data-three-world-canvas]")
            .length,
          resident: node.dataset.r3Resident,
          state: node.dataset.runtimeState,
          loops: node.dataset.activeFrameLoops,
          selected: node.dataset.selectedObject,
          visible: node.checkVisibility(),
          passage:
            document
              .querySelector(".app-shell")
              ?.getAttribute("data-passage") ?? null,
        };
      });
    if (input === "accessible") {
      await page
        .getByRole("button", {
          name: "Abrir ferramentas de exploração acessível",
        })
        .click();
      await page.locator("details.world-explore > summary").click();
      await page.locator("details.world-semantic > summary").click();
    }
    for (let cycle = 1; cycle <= 3; cycle++) {
      if (input === "canvas") {
        let hit:
          | {
              valid: boolean;
              x: number;
              y: number;
              pointX: number;
              pointY: number;
            }
          | undefined;
        for (let attempt = 0; attempt < 4 && hit?.valid !== true; attempt++) {
          const pan = await canvas.evaluate((node) => {
            const [x, y] = (node.getAttribute("data-orbital-book-ndc") ?? "")
              .split(",")
              .map(Number);
            if (!Number.isFinite(x) || !Number.isFinite(y))
              throw new Error("Missing lunar projection");
            const b = node.getBoundingClientRect();
            const dx = Math.max(
              -b.width * 0.75,
              Math.min(b.width * 0.75, (-x * b.width) / 2),
            );
            const dy = Math.max(
              -b.height * 0.75,
              Math.min(b.height * 0.75, (y * b.height) / 2),
            );
            if (Math.hypot(dx, dy) <= 12)
              return {
                required: false,
                startX: 0,
                startY: 0,
                endX: 0,
                endY: 0,
              };
            const sx = dx < 0 ? b.width - 20 : 20,
              sy = dy < 0 ? b.height - 20 : 20;
            return {
              required: true,
              startX: b.left + sx,
              startY: b.top + sy,
              endX: b.left + sx + dx,
              endY: b.top + sy + dy,
            };
          });
          if (pan.required) {
            await page.mouse.move(pan.startX, pan.startY);
            await page.mouse.down();
            await page.mouse.move(pan.endX, pan.endY, { steps: 4 });
            await page.mouse.up();
          }
          await page.waitForTimeout(500);
          hit = await canvas.evaluate((node) => {
            const [x, y] = (node.getAttribute("data-orbital-book-ndc") ?? "")
              .split(",")
              .map(Number);
            if (
              !Number.isFinite(x) ||
              !Number.isFinite(y) ||
              Math.abs(x) >= 1 ||
              Math.abs(y) >= 1
            )
              return { valid: false, x, y, pointX: 0, pointY: 0 };
            const b = node.getBoundingClientRect();
            return {
              valid: true,
              x,
              y,
              pointX: b.left + ((x + 1) * b.width) / 2,
              pointY: b.top + ((1 - y) * b.height) / 2,
            };
          });
        }
        expect(hit?.valid, JSON.stringify(hit)).toBe(true);
        if (hit?.valid) await page.mouse.click(hit.pointX, hit.pointY);
      } else {
        const portal = page.getByRole("button", {
          name: "Abrir Portal do Arcanário",
          exact: true,
        });
        await expect(portal).toBeVisible();
        await portal.press("Enter");
      }
      await expect
        .poll(observeWorld, { timeout: 30_000, intervals: [250, 500, 1000] })
        .toEqual({
          path: "/arcanario",
          count: 1,
          resident: "same",
          state: "paused",
          loops: "0",
          selected: "",
          visible: false,
          passage: null,
        });
      await expect(
        page.getByRole("navigation", { name: "Salas do Arcanário" }),
      ).toBeVisible();
      expect(arrivals).toHaveLength(cycle);
      await page.getByRole("link", { name: /Voltar à Biblioteca/ }).click();
      await expect
        .poll(observeWorld, { timeout: 30_000, intervals: [250, 500, 1000] })
        .toEqual({
          path: "/",
          count: 1,
          resident: "same",
          state: "running",
          loops: "1",
          selected: "",
          visible: true,
          passage: null,
        });
    }
  });
}
