import type { BookEntry, Quote } from "../../domain";
import type { PngArtifact } from "../../application/imageFiles";
import { progressPercentage, statusLabels } from "../books/bookPresentation";
import { renderSharePlate } from "../share-composer/renderSharePlate";
import type { CompositionStyle } from "../share-composer/composition";
export async function createBookImage(
  book: BookEntry,
  quote?: Quote,
  options: CompositionStyle & { readonly message?: string } = {
    aspect: "post",
    layout: "folio",
  },
): Promise<PngArtifact> {
  const progress = progressPercentage(book);
  return renderSharePlate(
    {
      title: book.title,
      rating: book.rating,
      eyebrow: quote ? "Uma passagem" : "Meu marcador",
      caption: book.author ?? "Autor não informado",
      text: quote
        ? `“${quote.content}”${quote.location?.type === "book" ? ` · p. ${quote.location.page}` : ""}`
        : `${statusLabels[book.status]} · ${progress === undefined ? "" : `${progress}% · `}${book.currentPage}${book.totalPages ? ` de ${book.totalPages}` : ""} páginas`,
      message: options.message,
      name: quote
        ? "biblioteca-viva-citacao.png"
        : "biblioteca-viva-leitura.png",
    },
    options,
  );
}
