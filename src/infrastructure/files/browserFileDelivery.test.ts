import { afterEach, describe, expect, it, vi } from "vitest";

import { BrowserFileDelivery } from "./browserFileDelivery";

afterEach(() => vi.restoreAllMocks());

describe("BrowserFileDelivery", () => {
  it("compartilha File quando a plataforma oferece Web Share", async () => {
    const share = vi.fn(() => Promise.resolve());
    Object.defineProperties(navigator, {
      canShare: { configurable: true, value: () => true },
      share: { configurable: true, value: share },
    });
    await expect(
      new BrowserFileDelivery().deliver({ name: "backup.json", content: "{}" }),
    ).resolves.toBe("delivered");
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ files: [expect.any(File)] }),
    );
  });

  it("trata cancelamento do compartilhamento sem iniciar fallback", async () => {
    Object.defineProperties(navigator, {
      canShare: { configurable: true, value: () => true },
      share: {
        configurable: true,
        value: () => Promise.reject(new DOMException("cancel", "AbortError")),
      },
    });
    await expect(
      new BrowserFileDelivery().deliver({ name: "backup.json", content: "{}" }),
    ).resolves.toBe("cancelled");
  });

  it("usa Blob/download e revoga a URL quando Web Share não serve arquivos", async () => {
    Object.defineProperties(navigator, {
      canShare: { configurable: true, value: () => false },
      share: { configurable: true, value: undefined },
    });
    const create = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:test");
    const revoke = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined);
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    await expect(
      new BrowserFileDelivery().deliver({ name: "backup.json", content: "{}" }),
    ).resolves.toBe("delivered");
    expect(create).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(revoke).toHaveBeenCalledWith("blob:test");
  });
});
