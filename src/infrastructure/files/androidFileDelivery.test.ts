import { describe, expect, it, vi } from "vitest";

import { BackupFileError } from "../../application";
import {
  AndroidFileDelivery,
  type AndroidFilesystemGateway,
  type AndroidShareGateway,
} from "./androidFileDelivery";

function gateways(overrides?: {
  readonly filesystem?: Partial<AndroidFilesystemGateway>;
  readonly share?: Partial<AndroidShareGateway>;
}) {
  const filesystem: AndroidFilesystemGateway = {
    deleteCacheFile: vi.fn(() => Promise.resolve()),
    writeUtf8CacheFile: vi.fn(() =>
      Promise.resolve({ uri: "file:///cache/biblioteca-viva-backup.json" }),
    ),
    ...overrides?.filesystem,
  };
  const share: AndroidShareGateway = {
    shareFile: vi.fn(() => Promise.resolve("closed" as const)),
    ...overrides?.share,
  };
  return { filesystem, share };
}

describe("AndroidFileDelivery", () => {
  it("grava exatamente o JSON em cache e compartilha exatamente a URI retornada", async () => {
    const { filesystem, share } = gateways();
    const delivery = new AndroidFileDelivery(filesystem, share);
    const content = '{"texto":"ação e café"}';

    await expect(
      delivery.shareBackupFile({
        content,
        name: "biblioteca-viva-backup-2026.json",
      }),
    ).resolves.toBe("flow-finished");

    expect(filesystem.writeUtf8CacheFile).toHaveBeenCalledWith({
      content,
      path: "biblioteca-viva-backup-2026.json",
    });
    expect(share.shareFile).toHaveBeenCalledWith({
      dialogTitle: "Exportar backup da Biblioteca Viva",
      fileUri: "file:///cache/biblioteca-viva-backup.json",
      mimeType: "application/json",
      title: "biblioteca-viva-backup-2026.json",
    });
    expect(filesystem.deleteCacheFile).toHaveBeenCalledWith(
      "biblioteca-viva-backup-2026.json",
    );
  });

  it("só limpa depois que o fluxo nativo termina", async () => {
    let closeShare: (() => void) | undefined;
    const { filesystem, share } = gateways({
      share: {
        shareFile: vi.fn(
          () =>
            new Promise<"closed">((resolve) => {
              closeShare = () => resolve("closed");
            }),
        ),
      },
    });
    const pending = new AndroidFileDelivery(filesystem, share).shareBackupFile({
      content: "{}",
      name: "backup.json",
    });
    await vi.waitFor(() => expect(share.shareFile).toHaveBeenCalledOnce());
    expect(filesystem.deleteCacheFile).not.toHaveBeenCalled();
    closeShare?.();
    await pending;
    expect(filesystem.deleteCacheFile).toHaveBeenCalledOnce();
  });

  it("não compartilha quando a escrita falha", async () => {
    const { filesystem, share } = gateways({
      filesystem: {
        writeUtf8CacheFile: vi.fn(() => Promise.reject(new Error("private"))),
      },
    });
    await expect(
      new AndroidFileDelivery(filesystem, share).shareBackupFile({
        content: "{}",
        name: "backup.json",
      }),
    ).rejects.toMatchObject({
      code: "TEMPORARY_WRITE_FAILED",
    });
    expect(share.shareFile).not.toHaveBeenCalled();
    expect(filesystem.deleteCacheFile).not.toHaveBeenCalled();
  });

  it("sanitiza falha de compartilhamento e ainda remove o temporário", async () => {
    const { filesystem, share } = gateways({
      share: {
        shareFile: vi.fn(() => Promise.reject(new Error("content://private"))),
      },
    });
    await expect(
      new AndroidFileDelivery(filesystem, share).shareBackupFile({
        content: "conteúdo privado",
        name: "backup.json",
      }),
    ).rejects.toEqual(new BackupFileError("SHARE_FAILED"));
    expect(filesystem.deleteCacheFile).toHaveBeenCalledOnce();
  });

  it("distingue cancelamento quando o gateway permite e não anuncia salvamento", async () => {
    const { filesystem, share } = gateways({
      share: {
        shareFile: vi.fn(() => Promise.resolve("cancelled" as const)),
      },
    });
    await expect(
      new AndroidFileDelivery(filesystem, share).shareBackupFile({
        content: "{}",
        name: "backup.json",
      }),
    ).resolves.toBe("cancelled");
    expect(filesystem.deleteCacheFile).toHaveBeenCalledOnce();
  });

  it("trata falha de limpeza como diagnóstico secundário", async () => {
    const diagnostics = { temporaryCleanupFailed: vi.fn() };
    const { filesystem, share } = gateways({
      filesystem: {
        deleteCacheFile: vi.fn(() => Promise.reject(new Error("private path"))),
      },
    });
    await expect(
      new AndroidFileDelivery(filesystem, share, diagnostics).shareBackupFile({
        content: "{}",
        name: "backup.json",
      }),
    ).resolves.toBe("flow-finished");
    expect(diagnostics.temporaryCleanupFailed).toHaveBeenCalledOnce();
  });
});
