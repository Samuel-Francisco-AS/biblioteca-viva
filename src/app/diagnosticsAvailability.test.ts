import { describe, expect, it } from "vitest";

import { isDiagnosticsEnabled } from "./diagnosticsAvailability";

describe("isDiagnosticsEnabled", () => {
  it("enables diagnostics during development", () => {
    expect(isDiagnosticsEnabled(true, undefined)).toBe(true);
  });

  it("enables diagnostics for the explicit diagnostics build", () => {
    expect(isDiagnosticsEnabled(false, "true")).toBe(true);
  });

  it("keeps diagnostics disabled in a normal production build", () => {
    expect(isDiagnosticsEnabled(false, undefined)).toBe(false);
    expect(isDiagnosticsEnabled(false, "false")).toBe(false);
  });
});
