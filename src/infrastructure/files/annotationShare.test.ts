import { Capacitor } from "@capacitor/core";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlatformAnnotationShare } from "./annotationShare";

afterEach(() => vi.restoreAllMocks());

describe("PlatformAnnotationShare", () => {
  it("usa Web Share somente por chamada explícita", async () => {
    vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(false);
    const share = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: share,
    });
    const adapter = new PlatformAnnotationShare();
    expect(share).not.toHaveBeenCalled();
    await expect(
      adapter.share({ title: "Nota", text: "Conteúdo fictício" }),
    ).resolves.toBe("flow-finished");
    expect(share).toHaveBeenCalledWith({
      title: "Nota",
      text: "Conteúdo fictício",
    });
  });

  it("distingue indisponibilidade, cancelamento e falha", async () => {
    vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(false);
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    const adapter = new PlatformAnnotationShare();
    await expect(
      adapter.share({ title: "Nota", text: "Fictício" }),
    ).resolves.toBe("unavailable");
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: vi.fn(() =>
        Promise.reject(new DOMException("cancel", "AbortError")),
      ),
    });
    await expect(
      adapter.share({ title: "Nota", text: "Fictício" }),
    ).resolves.toBe("cancelled");
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: vi.fn(() => Promise.reject(new Error("private"))),
    });
    await expect(
      adapter.share({ title: "Nota", text: "Fictício" }),
    ).rejects.toBeInstanceOf(Error);
  });
});
