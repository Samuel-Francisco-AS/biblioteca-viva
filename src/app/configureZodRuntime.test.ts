import { config, z } from "zod";
import { describe, expect, it, vi } from "vitest";

import "./configureZodRuntime";

const mainSource = Object.values(
  import.meta.glob<string>("../main.tsx", {
    eager: true,
    query: "?raw",
    import: "default",
  }),
)[0];
const runtimeSource = Object.values(
  import.meta.glob<string>("./configureZodRuntime.ts", {
    eager: true,
    query: "?raw",
    import: "default",
  }),
)[0];

describe("configuração CSP-safe do Zod", () => {
  it("configura o runtime antes da composição e preserva jitless", () => {
    expect(mainSource).toMatch(/\.\/app\/configureZodRuntime/u);
    expect(runtimeSource).toMatch(/config\(\{ jitless: true \}\)/u);
    expect(config()).toMatchObject({ jitless: true });
  });

  it("valida objetos sem executar a construção dinâmica bloqueada pela CSP", () => {
    const dynamicFunction = vi.fn(() => {
      throw new Error("CSP bloqueou avaliação dinâmica");
    });
    vi.stubGlobal("Function", dynamicFunction);

    try {
      expect(
        z.object({ title: z.string() }).parse({ title: "Fictício" }),
      ).toEqual({
        title: "Fictício",
      });
      expect(dynamicFunction).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
