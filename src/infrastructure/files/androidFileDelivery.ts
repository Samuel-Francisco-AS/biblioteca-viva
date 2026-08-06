import type { BackupFileSharePort, ShareBackupResult } from "../../application";
import { BackupFileError } from "../../application";

export interface AndroidFilesystemGateway {
  writeUtf8CacheFile(
    this: void,
    input: {
      readonly content: string;
      readonly path: string;
    },
  ): Promise<{ readonly uri: string }>;
  deleteCacheFile(this: void, path: string): Promise<void>;
}

export interface AndroidShareGateway {
  shareFile(
    this: void,
    input: {
      readonly dialogTitle: string;
      readonly fileUri: string;
      readonly mimeType: "application/json";
      readonly title: string;
    },
  ): Promise<"closed" | "cancelled">;
}

export interface AndroidFileDeliveryDiagnostics {
  temporaryCleanupFailed(this: void): void;
}

export class AndroidFileDelivery implements BackupFileSharePort {
  constructor(
    private readonly filesystem: AndroidFilesystemGateway,
    private readonly share: AndroidShareGateway,
    private readonly diagnostics?: AndroidFileDeliveryDiagnostics,
  ) {}

  async shareBackupFile(file: {
    readonly name: string;
    readonly content: string;
  }): Promise<ShareBackupResult> {
    let uri: string;
    try {
      ({ uri } = await this.filesystem.writeUtf8CacheFile({
        content: file.content,
        path: file.name,
      }));
    } catch {
      throw new BackupFileError("TEMPORARY_WRITE_FAILED");
    }

    try {
      const result = await this.share.shareFile({
        dialogTitle: "Exportar backup da Biblioteca Viva",
        fileUri: uri,
        mimeType: "application/json",
        title: file.name,
      });
      return result === "cancelled" ? "cancelled" : "flow-finished";
    } catch {
      throw new BackupFileError("SHARE_FAILED");
    } finally {
      try {
        await this.filesystem.deleteCacheFile(file.name);
      } catch {
        this.diagnostics?.temporaryCleanupFailed();
      }
    }
  }
}
