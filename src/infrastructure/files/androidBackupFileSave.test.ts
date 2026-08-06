import { describe, expect, it, vi } from "vitest";

import { BackupFileError } from "../../application";
import {
  AndroidBackupFileSave,
  type AndroidDocumentSaveGateway,
} from "./androidBackupFileSave";

function gateway(
  saveUtf8Document: AndroidDocumentSaveGateway["saveUtf8Document"] = vi.fn(() =>
    Promise.resolve({ status: "saved" as const }),
  ),
): AndroidDocumentSaveGateway {
  return { saveUtf8Document };
}

describe("AndroidBackupFileSave", () => {
  it("envia nome, MIME e exatamente o texto UTF-8 ao seletor", async () => {
    const saveUtf8Document = vi.fn(
      (
        input: Parameters<AndroidDocumentSaveGateway["saveUtf8Document"]>[0],
      ) => {
        void input;
        return Promise.resolve({ status: "saved" as const });
      },
    );
    const content = '{"texto":"ação e café"}';
    const name = "biblioteca-viva-backup-2026-08-05T12-00-00Z.json";

    await expect(
      new AndroidBackupFileSave(gateway(saveUtf8Document)).saveBackupFile({
        content,
        name,
      }),
    ).resolves.toBe("saved");

    expect(name).toMatch(/^biblioteca-viva-backup-.*\.json$/u);
    expect(saveUtf8Document).toHaveBeenCalledWith({
      contentUtf8: content,
      mimeType: "application/json",
      suggestedName: name,
    });
    const sent = saveUtf8Document.mock.calls[0]?.[0].contentUtf8;
    expect(sent).toBe(content);
    expect(sent?.startsWith("\uFEFF")).toBe(false);
    expect(sent?.endsWith("\n")).toBe(false);
  });

  it("só retorna sucesso depois que a escrita nativa termina", async () => {
    let finish: (() => void) | undefined;
    const pendingNative = new Promise<{ status: "saved" }>((resolve) => {
      finish = () => resolve({ status: "saved" });
    });
    const completion = vi.fn();
    const pending = new AndroidBackupFileSave(gateway(() => pendingNative))
      .saveBackupFile({ content: "{}", name: "backup.json" })
      .then(completion);

    await Promise.resolve();
    expect(completion).not.toHaveBeenCalled();
    finish?.();
    await pending;
    expect(completion).toHaveBeenCalledWith("saved");
  });

  it("trata cancelamento como resultado normal", async () => {
    await expect(
      new AndroidBackupFileSave(
        gateway(() => Promise.resolve({ status: "cancelled" })),
      ).saveBackupFile({ content: "{}", name: "backup.json" }),
    ).resolves.toBe("cancelled");
  });

  it("sanitiza falha ao abrir o seletor", async () => {
    const nativeError = Object.assign(new Error("android internals"), {
      code: "DOCUMENT_PICKER_FAILED",
    });
    await expect(
      new AndroidBackupFileSave(
        gateway(() => Promise.reject(nativeError)),
      ).saveBackupFile({ content: "conteúdo privado", name: "backup.json" }),
    ).rejects.toEqual(new BackupFileError("DOCUMENT_PICKER_FAILED"));
  });

  it("sanitiza falhas de stream, escrita, flush ou close", async () => {
    await expect(
      new AndroidBackupFileSave(
        gateway(() => Promise.reject(new Error("content://private"))),
      ).saveBackupFile({ content: "conteúdo privado", name: "backup.json" }),
    ).rejects.toEqual(new BackupFileError("DOCUMENT_WRITE_FAILED"));
  });
});
