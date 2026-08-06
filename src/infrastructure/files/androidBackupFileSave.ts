import type { BackupFileSavePort, SaveBackupResult } from "../../application";
import { BackupFileError } from "../../application";

export interface AndroidDocumentSaveGateway {
  saveUtf8Document(
    this: void,
    input: {
      readonly contentUtf8: string;
      readonly mimeType: "application/json";
      readonly suggestedName: string;
    },
  ): Promise<{ readonly status: "saved" | "cancelled" }>;
}

export class AndroidBackupFileSave implements BackupFileSavePort {
  constructor(private readonly documents: AndroidDocumentSaveGateway) {}

  async saveBackupFile(file: {
    readonly name: string;
    readonly content: string;
  }): Promise<SaveBackupResult> {
    try {
      const result = await this.documents.saveUtf8Document({
        contentUtf8: file.content,
        mimeType: "application/json",
        suggestedName: file.name,
      });
      return result.status;
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "DOCUMENT_PICKER_FAILED"
      ) {
        throw new BackupFileError("DOCUMENT_PICKER_FAILED");
      }
      throw new BackupFileError("DOCUMENT_WRITE_FAILED");
    }
  }
}
