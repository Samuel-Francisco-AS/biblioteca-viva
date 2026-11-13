import { expect, test } from "@playwright/test";

for (const input of ["canvas", "accessible"] as const) {
  test(`R3: three lunar reentries by ${input} preserve one renderer without empty taps`, async ({
    page,
  }) => {
    // Three full round trips. Existing single-trip deadlines remain unchanged.
    test.setTimeout(120_000);
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
        await canvas.evaluate((node) => {
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
          // Track the changing orbital phase using ordinary pan input. This
          // never taps empty space, overrides a camera or clears selection.
          if (Math.hypot(dx, dy) <= 12) return;
          const sx = dx < 0 ? b.width - 20 : 20,
            sy = dy < 0 ? b.height - 20 : 20;
          for (const [type, px, py] of [
            ["pointerdown", sx, sy],
            ["pointermove", sx + dx, sy + dy],
            ["pointerup", sx + dx, sy + dy],
          ] as const) {
            node.dispatchEvent(
              new PointerEvent(type, {
                bubbles: true,
                pointerId: 2,
                pointerType: "touch",
                button: 0,
                clientX: b.left + px,
                clientY: b.top + py,
              }),
            );
          }
        });
        await expect
          .poll(() =>
            canvas.evaluate((node) => {
              const [x, y] = (node.getAttribute("data-orbital-book-ndc") ?? "")
                .split(",")
                .map(Number);
              return (
                Number.isFinite(x) &&
                Number.isFinite(y) &&
                Math.abs(x) < 0.8 &&
                Math.abs(y) < 0.8
              );
            }),
          )
          .toBe(true);
        const hit = await canvas.evaluate((node) => {
          const [x, y] = (node.getAttribute("data-orbital-book-ndc") ?? "")
            .split(",")
            .map(Number);
          if (
            !Number.isFinite(x) ||
            !Number.isFinite(y) ||
            Math.abs(x) >= 1 ||
            Math.abs(y) >= 1
          )
            return { valid: false, x, y };
          const b = node.getBoundingClientRect();
          // Sample the moving target and deliver both gestures in one task.
          for (let tap = 0; tap < 2; tap++)
            for (const type of ["pointerdown", "pointerup"]) {
              node.dispatchEvent(
                new PointerEvent(type, {
                  bubbles: true,
                  pointerId: 1,
                  pointerType: "touch",
                  button: 0,
                  clientX: b.left + ((x + 1) * b.width) / 2,
                  clientY: b.top + ((1 - y) * b.height) / 2,
                }),
              );
            }
          return { valid: true, x, y };
        });
        expect(hit.valid, JSON.stringify(hit)).toBe(true);
      } else {
        const portal = page.getByRole("button", {
          name: "Abrir Portal do Arcanário",
          exact: true,
        });
        await expect(portal).toBeVisible();
        await portal.press("Enter");
      }
      await expect.poll(observeWorld).toEqual({
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
      await expect.poll(observeWorld).toEqual({
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
