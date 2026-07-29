export type StoragePersistenceStatus =
  "unsupported" | "granted" | "denied" | "error";

export interface StoragePersistencePort {
  inspect(): Promise<StoragePersistenceStatus>;
  request(): Promise<StoragePersistenceStatus>;
}

interface StorageManagerLike {
  persisted?: () => Promise<boolean>;
  persist?: () => Promise<boolean>;
}

function browserStorage(): StorageManagerLike | undefined {
  return typeof navigator === "undefined" ? undefined : navigator.storage;
}

export class BrowserStoragePersistence implements StoragePersistencePort {
  constructor(
    private readonly storage: StorageManagerLike | undefined = browserStorage(),
  ) {}

  async inspect(): Promise<StoragePersistenceStatus> {
    if (this.storage?.persisted === undefined) return "unsupported";
    try {
      return (await this.storage.persisted()) ? "granted" : "denied";
    } catch {
      return "error";
    }
  }

  async request(): Promise<StoragePersistenceStatus> {
    if (this.storage?.persist === undefined) return "unsupported";
    try {
      return (await this.storage.persist()) ? "granted" : "denied";
    } catch {
      return "error";
    }
  }
}
