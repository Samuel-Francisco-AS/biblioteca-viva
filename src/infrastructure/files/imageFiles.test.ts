import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformImageFiles } from "./imageFiles";

const native = vi.hoisted(() => ({
  active: false,
  canShare: vi.fn(),
  share: vi.fn(),
  save: vi.fn(),
  write: vi.fn(),
  remove: vi.fn(),
}));
vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: () => native.active,
    getPlatform: () => "android",
  },
  registerPlugin: () => ({ savePng: native.save }),
}));
vi.mock("@capacitor/share", () => ({
  Share: { canShare: native.canShare, share: native.share },
}));
vi.mock("@capacitor/filesystem", () => ({
  Directory: { Cache: "CACHE" },
  Filesystem: { writeFile: native.write, deleteFile: native.remove },
}));
const image = {
  name: "biblioteca-viva-leitura.png",
  dataUrl: "data:image/png;base64,iVBORw0KGgoAAA==",
};
afterEach(() => {
  native.active = false;
  vi.restoreAllMocks();
  vi.clearAllMocks();
  Reflect.deleteProperty(navigator, "share");
  Reflect.deleteProperty(navigator, "canShare");
});
describe("entrega local de PNG", () => {
  it("oferece alternativa de salvamento sem Web Share", async () => {
    expect(await new PlatformImageFiles().share(image)).toBe("unavailable");
  });
  it("envia arquivo PNG, distingue cancelamento web e não exporta texto privado", async () => {
    const share = vi
      .fn()
      .mockRejectedValue(new DOMException("Cancelled", "AbortError"));
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: () => true,
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: share,
    });
    expect(await new PlatformImageFiles().share(image)).toBe("cancelled");
    expect(share).toHaveBeenCalledWith({
      files: [expect.objectContaining({ name: image.name, type: "image/png" })],
      title: "Biblioteca Viva",
    });
  });
  it("salva um arquivo binário web com extensão PNG", async () => {
    const create = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:png-fixture");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.download).toBe(image.name);
        expect(this.href).toBe("blob:png-fixture");
      });
    expect(await new PlatformImageFiles().save(image)).toBe("finished");
    expect(create).toHaveBeenCalledWith(expect.any(File));
    expect(click).toHaveBeenCalledOnce();
  });
  it("usa cache binário e arquivo local no Android, limpando após erro ou cancelamento", async () => {
    native.active = true;
    native.canShare.mockResolvedValue({ value: true });
    native.write.mockResolvedValue({ uri: "file:///cache/fixture.png" });
    native.remove.mockResolvedValue(undefined);
    native.share.mockRejectedValueOnce(new Error("Share canceled"));
    const files = new PlatformImageFiles();
    expect(await files.share(image)).toBe("cancelled");
    expect(native.write).toHaveBeenCalledWith(
      expect.objectContaining({
        data: "iVBORw0KGgoAAA==",
        directory: "CACHE",
      }),
    );
    const writeRequest: unknown = native.write.mock.calls[0]?.[0];
    expect(writeRequest).toHaveProperty(
      "path",
      expect.stringMatching(/^folio-.*\.png$/),
    );
    expect(native.share).toHaveBeenCalledWith(
      expect.objectContaining({ files: ["file:///cache/fixture.png"] }),
    );
    expect(native.remove).toHaveBeenCalledOnce();
    native.share.mockRejectedValueOnce(new Error("Native failure"));
    await expect(files.share(image)).rejects.toThrow("Você pode salvar");
    expect(native.remove).toHaveBeenCalledTimes(2);
  });
  it.each(["leitura", "citacao", "cinema"])(
    "Android salva e cancela %s pelo seletor de documentos, independentemente de Share",
    async (kind) => {
      const image = {
        name: `biblioteca-viva-${kind}.png`,
        dataUrl: "data:image/png;base64,iVBORw0KGgoAAA==",
      };
      native.active = true;
      native.save
        .mockResolvedValueOnce({ status: "saved" })
        .mockResolvedValueOnce({ status: "cancelled" });
      const files = new PlatformImageFiles();
      expect(await files.save(image)).toBe("finished");
      expect(await files.save(image)).toBe("cancelled");
      expect(native.save).toHaveBeenCalledWith({
        dataBase64: "iVBORw0KGgoAAA==",
        suggestedName: image.name,
      });
      expect(native.share).not.toHaveBeenCalled();
    },
  );
  it("rejeita artefatos inválidos antes de acessar plugins", async () => {
    await expect(
      new PlatformImageFiles().save({ ...image, name: "../private.png" }),
    ).rejects.toThrow("inválida");
    await expect(
      new PlatformImageFiles().share({
        ...image,
        dataUrl: "data:text/plain;base64,YQ==",
      }),
    ).rejects.toThrow("inválida");
    expect(native.write).not.toHaveBeenCalled();
  });
});
