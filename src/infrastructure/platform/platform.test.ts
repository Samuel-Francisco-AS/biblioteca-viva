// @vitest-environment node

import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  BrowserPlatformCapabilities,
  BrowserStoragePersistence,
  CryptoIdGenerator,
  SystemClock,
} from "../index";

describe("platform adapters", () => {
  it("identifica contexto inseguro e APIs necessárias indisponíveis", () => {
    const capabilities = new BrowserPlatformCapabilities({
      isSecureContext: false,
      crypto: {},
    }).inspect();

    expect(capabilities).toEqual({
      secureContext: false,
      secureUuid: false,
      backupIntegrity: false,
      supported: false,
    });
  });

  it("aceita contexto seguro com UUID e integridade disponíveis", () => {
    const capabilities = new BrowserPlatformCapabilities({
      isSecureContext: true,
      crypto: { randomUUID: () => "id", subtle: { digest: () => undefined } },
    }).inspect();

    expect(capabilities.supported).toBe(true);
  });

  it("returns canonical UTC instants", async () => {
    const instant = await new SystemClock().now();
    expect(z.iso.datetime({ offset: false }).parse(instant)).toBe(instant);
    expect(instant).toMatch(/Z$/);
  });

  it("generates distinct valid UUIDs with the platform crypto API", async () => {
    const generator = new CryptoIdGenerator();
    const first = await generator.generate();
    const second = await generator.generate();
    expect(z.uuid().parse(first)).toBe(first);
    expect(second).not.toBe(first);
  });

  it.each([
    [true, "granted"],
    [false, "denied"],
  ] as const)(
    "maps storage persistence result %s to %s",
    async (value, expected) => {
      const persistence = new BrowserStoragePersistence({
        persist: () => Promise.resolve(value),
        persisted: () => Promise.resolve(value),
      });
      await expect(persistence.inspect()).resolves.toBe(expected);
      await expect(persistence.request()).resolves.toBe(expected);
    },
  );

  it("reports unsupported when the storage API is absent", async () => {
    const persistence = new BrowserStoragePersistence(undefined);
    await expect(persistence.inspect()).resolves.toBe("unsupported");
    await expect(persistence.request()).resolves.toBe("unsupported");
  });

  it("converts storage API failures to a controlled result", async () => {
    const persistence = new BrowserStoragePersistence({
      persist: () => Promise.reject(new Error("private browser detail")),
      persisted: () => Promise.reject(new Error("private browser detail")),
    });
    await expect(persistence.inspect()).resolves.toBe("error");
    await expect(persistence.request()).resolves.toBe("error");
  });
});
