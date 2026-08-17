import type { Activity } from "./activities";
import type {
  LibraryEntry,
  Note,
  Quote,
  ReachedMilestone,
  Session,
  Tag,
} from "../domain";

export const BACKUP_FORMAT_VERSION = 3;
export const BACKUP_KIND = "biblioteca-viva-backup";
export const MAX_BACKUP_BYTES = 10 * 1024 * 1024;

export interface BackupSetting {
  readonly key: string;
  readonly value: unknown;
  readonly updatedAt: string;
}

export interface BackupData {
  readonly libraryEntries: readonly LibraryEntry[];
  readonly milestones: readonly ReachedMilestone[];
  readonly notes: readonly Note[];
  readonly quotes: readonly Quote[];
  readonly activities: readonly Activity[];
  readonly settings: readonly BackupSetting[];
  readonly sessions: readonly Session[];
  readonly tags: readonly Tag[];
}

export interface BackupSnapshot extends BackupData {
  readonly isEmpty: boolean;
}

export function hasRelevantRestoreData(data: BackupData): boolean {
  return (
    data.libraryEntries.length > 0 ||
    data.notes.length > 0 ||
    data.quotes.length > 0 ||
    data.activities.length > 0 ||
    data.settings.length > 0 ||
    data.milestones.length > 0 ||
    data.sessions.length > 0 ||
    data.tags.length > 0
  );
}

export interface BackupCounts {
  readonly libraryEntries: number;
  readonly milestones: number;
  readonly notes: number;
  readonly quotes: number;
  readonly activities: number;
  readonly settings: number;
  readonly sessions: number;
  readonly tags: number;
}

export interface BackupSummary {
  readonly createdAt: string;
  readonly appVersion: string;
  readonly databaseVersion: number;
  readonly formatVersion: 1 | 2 | 3;
  readonly policy: "replace";
  readonly counts: BackupCounts;
  readonly warnings: readonly string[];
}

export interface RestoreInspection {
  readonly currentData: "empty" | "present";
  readonly summary: BackupSummary;
}

export type RestoreProtection =
  "empty-destination" | "create-safety-backup" | "confirmed-without-backup";

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

export type SaveBackupResult = "saved" | "cancelled";

export type ShareBackupResult = "flow-finished" | "cancelled";

export type BackupFileErrorCode =
  | "DOCUMENT_PICKER_FAILED"
  | "DOCUMENT_WRITE_FAILED"
  | "TEMPORARY_WRITE_FAILED"
  | "SHARE_FAILED";

export class BackupFileError extends Error {
  constructor(public readonly code: BackupFileErrorCode) {
    super("A entrega do arquivo não pôde ser concluída.");
    this.name = "BackupFileError";
  }
}

export interface BackupFileSavePort {
  saveBackupFile(file: {
    readonly name: string;
    readonly content: string;
  }): Promise<SaveBackupResult>;
}

export interface BackupFileSharePort {
  shareBackupFile(file: {
    readonly name: string;
    readonly content: string;
  }): Promise<ShareBackupResult>;
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
  | "BACKUP_DOCUMENT_PICKER_FAILED"
  | "BACKUP_DOCUMENT_WRITE_FAILED"
  | "BACKUP_TEMPORARY_WRITE_FAILED"
  | "BACKUP_SHARE_FAILED"
  | "BACKUP_DELIVERY_CANCELLED"
  | "PLATFORM_CAPABILITY_UNAVAILABLE"
  | "SAFETY_BACKUP_FAILED"
  | "RESTORE_DECISION_REQUIRED"
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
  constructor(
    private readonly codec: BackupCodecPort,
    private readonly snapshots: BackupSnapshotPort,
  ) {}
  async execute(content: string): Promise<RestoreInspection> {
    const validated = await this.codec.inspect(content);
    const current = await this.snapshots.read();
    return Object.freeze({
      currentData: current.isEmpty ? "empty" : "present",
      summary: validated.summary,
    });
  }
}

export class ImportBackup {
  constructor(
    private readonly snapshots: BackupSnapshotPort,
    private readonly codec: BackupCodecPort,
    private readonly exportBackup: ExportBackup,
    private readonly files: BackupFileSharePort,
  ) {}

  async execute(
    content: string,
    protection: RestoreProtection = "create-safety-backup",
  ): Promise<BackupCounts> {
    await this.codec.inspect(content);
    const current = await this.snapshots.read();
    if (!current.isEmpty && protection === "empty-destination") {
      throw new BackupError(
        "RESTORE_DECISION_REQUIRED",
        "A base passou a conter dados e exige uma decisão antes da restauração.",
      );
    }
    if (!current.isEmpty && protection === "create-safety-backup") {
      let safety: BackupArtifact;
      try {
        safety = await this.exportBackup.execute(
          "biblioteca-viva-seguranca-antes-da-restauracao",
        );
        const result = await this.files.shareBackupFile({
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
