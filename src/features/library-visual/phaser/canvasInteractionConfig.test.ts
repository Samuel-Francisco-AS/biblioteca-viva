import { describe, expect, it } from "vitest";

import factory from "./createPhaserGame.ts?raw";
import host from "../LibraryVisualHost.tsx?raw";
import { LIBRARY_CANVAS_TOUCH_ACTION } from "./roomConfig";

describe("configuração de rolagem da sala", () => {
  it("reserva o gesto do canvas para o pan do mundo", () => {
    expect(LIBRARY_CANVAS_TOUCH_ACTION).toBe("none");
    expect(host).toMatch(/touchAction:\s*["']none["']/u);
    expect(factory).toMatch(
      /game\.canvas\.style\.touchAction\s*=\s*LIBRARY_CANVAS_TOUCH_ACTION/u,
    );
  });

  it("desativa a captura global impeditiva de toque do Phaser", () => {
    expect(factory).toMatch(/touch:\s*\{\s*capture:\s*false\s*\}/su);
  });

  it("mantém o mouse habilitado sem impedir a rodinha nativa", () => {
    expect(factory).toMatch(
      /mouse:\s*\{\s*preventDefaultWheel:\s*false\s*\}/su,
    );
    expect(factory).not.toMatch(/mouse:\s*false/u);
  });

  it("não implementa rolagem manual nem impede wheel na aplicação", () => {
    expect(factory).not.toMatch(
      /addEventListener\s*\(\s*["']wheel|scrollBy|\.preventDefault\s*\(/u,
    );
  });
});
