import type { Activity } from "./activities";
import type { BookEntry, Note, Quote } from "../domain";

export const BACKUP_FORMAT_VERSION = 1;
export const BACKUP_KIND = "biblioteca-viva-backup";
export const MAX_BACKUP_BYTES = 10 * 1024 * 1024;

export interface BackupSetting {
  readonly key: string;
  readonly value: unknown;
  readonly updatedAt: string;
}

export interface BackupData {
  readonly libraryEntries: readonly BookEntry[];
  readonly notes: readonly Note[];
  readonly quotes: readonly Quote[];
  readonly activities: readonly Activity[];
  readonly settings: readonly BackupSetting[];
}

export interface BackupSnapshot extends BackupData {
  readonly isEmpty: boolean;
}

export interface BackupCounts {
  readonly libraryEntries: number;
  readonly notes: number;
  readonly quotes: number;
  readonly activities: number;
  readonly settings: number;
}

export interface BackupSummary {
  readonly createdAt: string;
  readonly appVersion: string;
  readonly databaseVersion: number;
  readonly formatVersion: 1;
  readonly policy: "replace";
  readonly counts: BackupCounts;
  readonly warnings: readonly string[];
}

export interface BackupArtifact {
  readonly fileName: string;
  readonly content: string;
  readonly summary: BackupSummary;
}

export interface ValidatedBackup {
  readonly data: BackupData;
  readonly summary: BackupSummary;
}

export interface BackupSnapshotPort {
  read(): Promise<BackupSnapshot>;
  replace(data: BackupData): Promise<void>;
}

export interface BackupCodecPort {
  encode(input: {
    readonly appVersion: string;
    readonly createdAt: string;
    readonly databaseVersion: number;
    readonly data: BackupData;
  }): Promise<BackupArtifact>;
  inspect(content: string): Promise<ValidatedBackup>;
}

export type FileDeliveryResult = "delivered" | "cancelled";

export interface FileDeliveryPort {
  deliver(file: {
    readonly name: string;
    readonly content: string;
  }): Promise<FileDeliveryResult>;
}

export type BackupErrorCode =
  | "BACKUP_TOO_LARGE"
  | "INVALID_JSON"
  | "UNRECOGNIZED_FORMAT"
  | "FUTURE_FORMAT_VERSION"
  | "UNSUPPORTED_FORMAT_VERSION"
  | "INVALID_BACKUP_DATA"
  | "DUPLICATE_ID"
  | "MISSING_CHECKSUM"
  | "CHECKSUM_MISMATCH"
  | "BACKUP_READ_FAILED"
  | "BACKUP_EXPORT_FAILED"
  | "BACKUP_DELIVERY_FAILED"
  | "BACKUP_DELIVERY_CANCELLED"
  | "PLATFORM_CAPABILITY_UNAVAILABLE"
  | "SAFETY_BACKUP_FAILED"
  | "IMPORT_CANCELLED"
  | "RESTORE_FAILED";

export class BackupError extends Error {
  constructor(
    public readonly code: BackupErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "BackupError";
  }
}

export class ExportBackup {
  constructor(
    private readonly snapshots: BackupSnapshotPort,
    private readonly codec: BackupCodecPort,
    private readonly clock: { now(): Promise<string> },
    private readonly appVersion: string,
    private readonly databaseVersion: number,
  ) {}

  async execute(prefix = "biblioteca-viva-backup"): Promise<BackupArtifact> {
    try {
      const [data, createdAt] = await Promise.all([
        this.snapshots.read(),
        this.clock.now(),
      ]);
      const artifact = await this.codec.encode({
        appVersion: this.appVersion,
        createdAt,
        databaseVersion: this.databaseVersion,
        data,
      });
      return Object.freeze({
        ...artifact,
        fileName: `${prefix}-${createdAt.replace(/[:.]/gu, "-").replace("-000Z", "Z")}.json`,
      });
    } catch (error) {
      if (error instanceof BackupError) throw error;
      throw new BackupError(
        "BACKUP_EXPORT_FAILED",
        "Não foi possível preparar o backup.",
      );
    }
  }
}

export class InspectBackup {
  constructor(private readonly codec: BackupCodecPort) {}
  execute(content: string): Promise<ValidatedBackup> {
    return this.codec.inspect(content);
  }
}

export class ImportBackup {
  constructor(
    private readonly snapshots: BackupSnapshotPort,
    private readonly codec: BackupCodecPort,
    private readonly exportBackup: ExportBackup,
    private readonly files: FileDeliveryPort,
  ) {}

  async execute(content: string): Promise<BackupCounts> {
    await this.codec.inspect(content);
    const current = await this.snapshots.read();
    if (!current.isEmpty) {
      let safety: BackupArtifact;
      try {
        safety = await this.exportBackup.execute(
          "biblioteca-viva-seguranca-antes-da-restauracao",
        );
        const result = await this.files.deliver({
          name: safety.fileName,
          content: safety.content,
        });
        if (result === "cancelled") {
          throw new BackupError(
            "BACKUP_DELIVERY_CANCELLED",
            "A entrega do backup de segurança foi cancelada.",
          );
        }
      } catch (error) {
        if (
          error instanceof BackupError &&
          error.code === "BACKUP_DELIVERY_CANCELLED"
        )
          throw error;
        throw new BackupError(
          "SAFETY_BACKUP_FAILED",
          "Não foi possível entregar o backup de segurança. Nenhum dado foi alterado.",
        );
      }
    }
    const revalidated = await this.codec.inspect(content);
    try {
      await this.snapshots.replace(revalidated.data);
      return revalidated.summary.counts;
    } catch {
      throw new BackupError(
        "RESTORE_FAILED",
        "Não foi possível restaurar os dados. O estado anterior foi preservado.",
      );
    }
  }
}
