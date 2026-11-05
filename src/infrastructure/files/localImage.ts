/** Inspect dimensions before invoking the native decoder: no SVG, remote URL, or unbounded bitmap. */
export function imageDimensions(bytes: Uint8Array): {
  width: number;
  height: number;
  type: "image/png" | "image/jpeg";
} {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (
    bytes.length >= 24 &&
    [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)
  )
    return {
      width: view.getUint32(16),
      height: view.getUint32(20),
      type: "image/png",
    };
  if (bytes[0] === 255 && bytes[1] === 216) {
    let offset = 2;
    while (offset + 4 < bytes.length) {
      if (bytes[offset] !== 255) break;
      const marker = bytes[offset + 1];
      if (marker === 255) {
        offset++;
        continue;
      }
      if (marker === 217 || marker === 218) break;
      if (marker === 1 || (marker >= 208 && marker <= 215)) {
        offset += 2;
        continue;
      }
      const length = view.getUint16(offset + 2);
      if (length < 2 || offset + 2 + length > bytes.length) break;
      if (
        [
          192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207,
        ].includes(marker) &&
        length >= 8
      )
        return {
          height: view.getUint16(offset + 5),
          width: view.getUint16(offset + 7),
          type: "image/jpeg",
        };
      offset += 2 + length;
    }
  }
  throw new Error("Escolha uma imagem JPEG ou PNG válida.");
}
export function readDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Imagem ilegível."));
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(blob);
  });
}
export async function importLocalImage(
  file: File,
): Promise<{ dataUrl: string; width: number; height: number }> {
  if (!file.size || file.size > 10 * 1024 * 1024)
    throw new Error("A imagem deve ter até 10 MiB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const dimensions = imageDimensions(bytes);
  if (
    (file.type && file.type !== dimensions.type) ||
    dimensions.width < 1 ||
    dimensions.height < 1 ||
    dimensions.width * dimensions.height > 24000000
  )
    throw new Error("Imagem incompatível ou maior que 24 megapixels.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const ratio = Math.min(
      1,
      1600 / image.naturalWidth,
      1600 / image.naturalHeight,
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Não foi possível processar a imagem.");
    ctx.fillStyle = "#241626";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.86, 0.72, 0.56, 0.4]) {
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (dataUrl.length <= 350000)
        return { dataUrl, width: canvas.width, height: canvas.height };
    }
    throw new Error(
      "Imagem muito detalhada. Escolha uma menor para o poster local.",
    );
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Imagem muito"))
      throw error;
    throw new Error(
      "Não foi possível processar a imagem. Tente outro JPEG ou PNG.",
      { cause: error },
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
