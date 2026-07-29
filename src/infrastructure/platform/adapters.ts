import type { Clock, IdGenerator } from "../../application";
import { z } from "zod";

const uuidSchema = z.uuid();
const isoUtcSchema = z.iso.datetime({ offset: false });

export class SystemClock implements Clock {
  now(): Promise<string> {
    return Promise.resolve(isoUtcSchema.parse(new Date().toISOString()));
  }
}

export class CryptoIdGenerator implements IdGenerator {
  generate(): Promise<string> {
    const uuid = globalThis.crypto?.randomUUID?.();
    if (uuid === undefined) {
      return Promise.reject(new Error("Geração segura de ID indisponível."));
    }
    return Promise.resolve(uuidSchema.parse(uuid));
  }
}
