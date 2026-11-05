import { Capacitor, registerPlugin } from "@capacitor/core";
import type { ImageFilesPort, PngArtifact } from "../../application/imageFiles";

const ImageDocument = registerPlugin<{
  savePng(options: {
    dataBase64: string;
    suggestedName: string;
  }): Promise<{ status: "saved" | "cancelled" }>;
}>("ImageDocument");

function payload(image: PngArtifact): string {
  if (
    !/^biblioteca-viva-(leitura|citacao)\.png$/.test(image.name) ||
    !/^data:image\/png;base64,iVBORw0KGgo[A-Za-z0-9+/=]+$/.test(image.dataUrl)
  )
    throw new Error("Imagem PNG inválida.");
  return image.dataUrl.slice("data:image/png;base64,".length);
}
function webFile(image: PngArtifact): File {
  const bytes = Uint8Array.from(atob(payload(image)), (char) =>
    char.charCodeAt(0),
  );
  return new File([bytes], image.name, { type: "image/png" });
}
function wasCancelled(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.message === "Share canceled")
  );
}
export class PlatformImageFiles implements ImageFilesPort {
  async share(image: PngArtifact) {
    const data = payload(image);
    if (Capacitor.isNativePlatform()) {
      const { Share } = await import("@capacitor/share");
      if (!(await Share.canShare()).value) return "unavailable" as const;
      const { Filesystem, Directory } = await import("@capacitor/filesystem");
      // A unique cache path avoids collisions between overlapping deliveries.
      const path = `folio-${crypto.randomUUID()}.png`;
      const { uri } = await Filesystem.writeFile({
        path,
        data,
        directory: Directory.Cache,
      });
      try {
        await Share.share({
          files: [uri],
          title: "Biblioteca Viva",
          dialogTitle: "Compartilhar imagem da leitura",
        });
        return "finished" as const;
      } catch (error: unknown) {
        if (wasCancelled(error)) return "cancelled" as const;
        throw new Error(
          "Não foi possível compartilhar. Você pode salvar a imagem.",
          { cause: error },
        );
      } finally {
        // Share resolves when the native chooser finishes; this is not proof of receipt.
        await Filesystem.deleteFile({ path, directory: Directory.Cache }).catch(
          () => undefined,
        );
      }
    }
    const file = webFile(image);
    if (!navigator.share || !navigator.canShare?.({ files: [file] }))
      return "unavailable" as const;
    try {
      await navigator.share({ files: [file], title: "Biblioteca Viva" });
      return "finished" as const;
    } catch (error: unknown) {
      if (wasCancelled(error)) return "cancelled" as const;
      throw new Error(
        "Não foi possível compartilhar. Você pode salvar a imagem.",
        { cause: error },
      );
    }
  }
  async save(image: PngArtifact) {
    const dataBase64 = payload(image);
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") {
      const result = await ImageDocument.savePng({
        dataBase64,
        suggestedName: image.name,
      });
      return result.status === "cancelled"
        ? ("cancelled" as const)
        : ("finished" as const);
    }
    const url = URL.createObjectURL(webFile(image));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = image.name;
    anchor.rel = "noopener";
    anchor.click();
    // Keep the object alive while the browser starts consuming the download.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return "finished" as const;
  }
}
