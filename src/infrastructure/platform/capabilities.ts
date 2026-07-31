export interface PlatformCapabilitySnapshot {
  readonly secureContext: boolean;
  readonly secureUuid: boolean;
  readonly backupIntegrity: boolean;
  readonly supported: boolean;
}

export interface PlatformCapabilitiesPort {
  inspect(): PlatformCapabilitySnapshot;
}

interface CryptoLike {
  readonly randomUUID?: () => string;
  readonly subtle?: { readonly digest?: unknown };
}

interface PlatformEnvironment {
  readonly isSecureContext?: boolean;
  readonly crypto?: CryptoLike;
}

function browserEnvironment(): PlatformEnvironment {
  return globalThis;
}

export class BrowserPlatformCapabilities implements PlatformCapabilitiesPort {
  constructor(
    private readonly environment: PlatformEnvironment = browserEnvironment(),
  ) {}

  inspect(): PlatformCapabilitySnapshot {
    const secureContext = this.environment.isSecureContext !== false;
    const secureUuid =
      secureContext &&
      typeof this.environment.crypto?.randomUUID === "function";
    const backupIntegrity =
      secureContext &&
      typeof this.environment.crypto?.subtle?.digest === "function";
    return Object.freeze({
      secureContext,
      secureUuid,
      backupIntegrity,
      supported: secureUuid && backupIntegrity,
    });
  }
}
