import type { BookEntry, Quote } from "../../domain";
import type { PngArtifact } from "../../application/imageFiles";
import { progressPercentage, statusLabels } from "../books/bookPresentation";

/** A dedicated 4:5 editorial plate, independent of viewport, DOM and private notes. */
export async function createBookImage(
  book: BookEntry,
  quote?: Quote,
): Promise<PngArtifact> {
  await document.fonts?.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  if (!context)
    throw new Error("Não foi possível preparar a imagem neste dispositivo.");
  const ctx = context;
  ctx.fillStyle = "#281c30";
  ctx.fillRect(0, 0, 1080, 1350);
  ctx.strokeStyle = "#ba9363";
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, 1016, 1286);
  ctx.fillStyle = "#f4e9d2";
  ctx.fillRect(68, 156, 944, 1028);
  ctx.strokeStyle = "#ba9363";
  ctx.strokeRect(84, 172, 912, 996);
  ctx.textAlign = "center";
  ctx.fillStyle = "#e1c49b";
  ctx.font = "24px sans-serif";
  ctx.fillText("B I B L I O T E C A   V I V A", 540, 101);
  ctx.fillText("✧", 540, 1254);
  ctx.font = "21px sans-serif";
  ctx.fillText("O CÓDICE ILUMINADO", 540, 1290);
  ctx.fillStyle = "#725360";
  ctx.font = "23px sans-serif";
  ctx.fillText(
    quote ? "U M A  P A S S A G E M" : "M E U  M A R C A D O R",
    540,
    245,
  );

  function lines(text: string, font: string, width: number): string[] {
    ctx.font = font;
    const result: string[] = [];
    // Break long unspaced words too, without truncating the exported content.
    for (const paragraph of text.split(/\r?\n/)) {
      let line = "";
      for (const word of paragraph.split(/\s+/)) {
        if (ctx.measureText(`${line} ${word}`.trim()).width <= width) {
          line = `${line} ${word}`.trim();
        } else {
          if (line) result.push(line);
          line = "";
          for (const char of word) {
            if (ctx.measureText(line + char).width > width && line) {
              result.push(line);
              line = "";
            }
            line += char;
          }
        }
      }
      result.push(line);
    }
    return result;
  }
  function block(
    text: string,
    y: number,
    maxHeight: number,
    initialSize: number,
    color: string,
  ) {
    let size = initialSize;
    let wrapped = lines(text, `${size}px Georgia, serif`, 780);
    while (wrapped.length * size * 1.35 > maxHeight && size > 24) {
      size -= 2;
      wrapped = lines(text, `${size}px Georgia, serif`, 780);
    }
    if (wrapped.length * size * 1.35 > maxHeight)
      throw new Error(
        "Este texto é longo para uma imagem legível. Selecione um trecho menor para compartilhar.",
      );
    ctx.font = `${size}px Georgia, serif`;
    ctx.fillStyle = color;
    wrapped.forEach((line, index) =>
      ctx.fillText(line, 540, y + index * size * 1.35),
    );
    return y + wrapped.length * size * 1.35;
  }
  if (quote) {
    const end = block(`“${quote.content}”`, 355, 540, 54, "#392739");
    ctx.fillStyle = "#9c774f";
    ctx.fillRect(470, Math.max(900, end + 30), 140, 2);
    block(book.title, 998, 85, 33, "#392739");
    block(book.author ?? "Autor não informado", 1090, 60, 25, "#725360");
    if (quote.location?.type === "book") {
      ctx.font = "22px sans-serif";
      ctx.fillText(`Página ${quote.location.page}`, 540, 1142);
    }
  } else {
    block(book.title, 370, 225, 66, "#392739");
    block(book.author ?? "Autor não informado", 630, 90, 32, "#725360");
    ctx.font = "28px sans-serif";
    ctx.fillText(statusLabels[book.status], 540, 785);
    const percentage = progressPercentage(book);
    ctx.fillStyle = "#542b4a";
    ctx.font = "96px Georgia, serif";
    ctx.fillText(percentage === undefined ? "—" : `${percentage}%`, 540, 935);
    ctx.fillStyle = "#ddceb6";
    ctx.fillRect(180, 986, 720, 10);
    if (percentage !== undefined) {
      ctx.fillStyle = "#825268";
      ctx.fillRect(180, 986, (720 * percentage) / 100, 10);
    }
    ctx.fillStyle = "#725360";
    ctx.font = "27px sans-serif";
    ctx.fillText(
      book.totalPages === undefined
        ? `${book.currentPage} páginas · total não informado`
        : `${book.currentPage} de ${book.totalPages} páginas`,
      540,
      1070,
    );
  }
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) =>
        value
          ? resolve(value)
          : reject(new Error("Não foi possível gerar o PNG.")),
      "image/png",
    ),
  );
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("PNG indisponível."));
    reader.onerror = () => reject(new Error("Não foi possível ler o PNG."));
    reader.readAsDataURL(blob);
  });
  return {
    dataUrl,
    name: quote ? "biblioteca-viva-citacao.png" : "biblioteca-viva-leitura.png",
  };
}
