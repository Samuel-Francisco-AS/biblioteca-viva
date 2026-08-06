import { Capacitor } from "@capacitor/core";

import type {
  BackupFileSavePort,
  BackupFileSharePort,
} from "../../application";
import { AndroidBackupFileSave } from "./androidBackupFileSave";
import { AndroidFileDelivery } from "./androidFileDelivery";
import { BrowserFileDelivery } from "./browserFileDelivery";

export interface PlatformBackupFiles {
  readonly isNativeAndroid: boolean;
  readonly save?: BackupFileSavePort;
  readonly share: BackupFileSharePort;
}

export function createPlatformBackupFiles(): PlatformBackupFiles {
  const isNativeAndroid =
    Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
  if (!isNativeAndroid) {
    return { isNativeAndroid: false, share: new BrowserFileDelivery() };
  }

  const share = new AndroidFileDelivery(
    {
      async writeUtf8CacheFile({ content, path }) {
        const { Directory, Encoding, Filesystem } =
          await import("@capacitor/filesystem");
        return Filesystem.writeFile({
          data: content,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
          path,
        });
      },
      async deleteCacheFile(path) {
        const { Directory, Filesystem } = await import("@capacitor/filesystem");
        await Filesystem.deleteFile({ directory: Directory.Cache, path });
      },
    },
    {
      async shareFile({ dialogTitle, fileUri, title }) {
        const { Share } = await import("@capacitor/share");
        try {
          await Share.share({ dialogTitle, files: [fileUri], title });
        } catch (error: unknown) {
          if (error instanceof Error && error.message === "Share canceled") {
            return "cancelled";
          }
          throw error;
        }
        return "closed";
      },
    },
    import.meta.env.DEV
      ? {
          temporaryCleanupFailed() {
            console.warn(
              "A limpeza de um arquivo temporário de backup não foi concluída.",
            );
          },
        }
      : undefined,
  );
  const save = new AndroidBackupFileSave({
    async saveUtf8Document(options) {
      const { saveBackupDocument } =
        await import("./androidBackupDocumentPlugin");
      return saveBackupDocument(options);
    },
  });
  return { isNativeAndroid: true, save, share };
}
