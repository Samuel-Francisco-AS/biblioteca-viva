import type { Clock, IdGenerator } from "../../application";
import { platformCapabilityUnavailable } from "../../application";
import { z } from "zod";
import type { PlatformCapabilitySnapshot } from "./capabilities";

const uuidSchema = z.uuid();
const isoUtcSchema = z.iso.datetime({ offset: false });

export class SystemClock implements Clock {
  now(): Promise<string> {
    return Promise.resolve(isoUtcSchema.parse(new Date().toISOString()));
  }
}

export class CryptoIdGenerator implements IdGenerator {
  constructor(
    private readonly capabilities: PlatformCapabilitySnapshot = Object.freeze({
      secureContext: globalThis.isSecureContext !== false,
      secureUuid:
        globalThis.isSecureContext !== false &&
        typeof globalThis.crypto?.randomUUID === "function",
      backupIntegrity:
        globalThis.isSecureContext !== false &&
        typeof globalThis.crypto?.subtle?.digest === "function",
      supported:
        globalThis.isSecureContext !== false &&
        typeof globalThis.crypto?.randomUUID === "function" &&
        typeof globalThis.crypto?.subtle?.digest === "function",
    }),
  ) {}

  generate(): Promise<string> {
    if (!this.capabilities.secureUuid) {
      return Promise.reject(platformCapabilityUnavailable());
    }
    const uuid = globalThis.crypto?.randomUUID?.();
    if (uuid === undefined) {
      return Promise.reject(platformCapabilityUnavailable());
    }
    return Promise.resolve(uuidSchema.parse(uuid));
  }
}
