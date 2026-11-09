import type { BackupFileSharePort, ShareBackupResult } from "../../application";

export class BrowserFileDelivery implements BackupFileSharePort {
  async shareBackupFile(file: {
    readonly name: string;
    readonly content: string;
    readonly mimeType?: "application/json" | "text/csv";
  }): Promise<ShareBackupResult> {
    const blob = new Blob([file.content], {
      type: `${file.mimeType ?? "application/json"};charset=utf-8`,
    });
    const nativeFile = new File([blob], file.name, { type: blob.type });
    if (navigator.share && navigator.canShare?.({ files: [nativeFile] })) {
      try {
        await navigator.share({
          files: [nativeFile],
          title: file.name,
        });
        return "flow-finished";
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return "cancelled";
        throw error;
      }
    }
    const url = URL.createObjectURL(blob);
    try {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.name;
      anchor.rel = "noopener";
      anchor.click();
      return "flow-finished";
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}
