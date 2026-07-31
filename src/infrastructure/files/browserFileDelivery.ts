import type { FileDeliveryPort, FileDeliveryResult } from "../../application";

export class BrowserFileDelivery implements FileDeliveryPort {
  async deliver(file: {
    readonly name: string;
    readonly content: string;
  }): Promise<FileDeliveryResult> {
    const blob = new Blob([file.content], {
      type: "application/json;charset=utf-8",
    });
    const nativeFile = new File([blob], file.name, { type: blob.type });
    if (navigator.share && navigator.canShare?.({ files: [nativeFile] })) {
      try {
        await navigator.share({
          files: [nativeFile],
          title: "Backup da Biblioteca Viva",
        });
        return "delivered";
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
      return "delivered";
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}
