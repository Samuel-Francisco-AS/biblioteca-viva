import { registerPlugin } from "@capacitor/core";

interface BackupDocumentPluginResult {
  readonly status: "saved" | "cancelled";
}

interface BackupDocumentPlugin {
  saveBackupFile(options: {
    readonly contentUtf8: string;
    readonly mimeType: "application/json";
    readonly suggestedName: string;
  }): Promise<BackupDocumentPluginResult>;
}

const BackupDocument = registerPlugin<BackupDocumentPlugin>("BackupDocument");

export function saveBackupDocument(options: {
  readonly contentUtf8: string;
  readonly mimeType: "application/json";
  readonly suggestedName: string;
}): Promise<BackupDocumentPluginResult> {
  return BackupDocument.saveBackupFile(options);
}
