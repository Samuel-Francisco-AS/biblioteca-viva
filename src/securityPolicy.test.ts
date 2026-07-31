import { describe, expect, it } from "vitest";

const files = import.meta.glob<string>("../index.html", {
  eager: true,
  query: "?raw",
  import: "default",
});

describe("CSP", () => {
  it("está presente sem unsafe-eval, wildcard ou scripts remotos", () => {
    const html = Object.values(files)[0] ?? "";
    expect(html).toContain("Content-Security-Policy");
    expect(html).toContain("default-src 'self'");
    expect(html).toContain("object-src 'none'");
    expect(html).not.toContain("unsafe-eval");
    expect(html).not.toMatch(/(?:^|[;\s])\*(?:[;\s]|$)/u);
  });
});
